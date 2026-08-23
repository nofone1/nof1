/**
 * Billing provider.
 *
 * Configures RevenueCat against the signed-in Clerk user and exposes the
 * combined Plus access decision plus the purchase, restore, and management
 * actions used by the Subscription screen.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { env } from "@/config/env";
import { logger } from "@/services/logging";
import { useAuth, useUser } from "@/services/auth";
import { convexMutation } from "@/services/backend/convex-client";
import { setLocalAccess, useAccess } from "./access-service";
import {
  connectWhop as startWhopConnect,
  isWhopConfigured,
  type WhopConnectOutcome,
} from "./whop-service";
import {
  configureRevenueCat,
  getEphemeralAppUserId,
  isRevenueCatConfigured,
  logOutRevenueCat,
  presentCustomerCenter,
  presentPaywall,
  readRevenueCatAccess,
  restorePurchases,
  type PaywallOutcome,
  type RestoreOutcome,
} from "./revenuecat-service";
import { FREE_ACCESS, type PlusAccess } from "./types";

const LINK_REVENUECAT_ACCOUNT = "billing:linkRevenueCatAccount" as const;
const DISCONNECT_WHOP = "billing:disconnectWhop" as const;

/** Everything the Subscription screen needs to render and act. */
interface BillingContextValue {
  access: PlusAccess;
  isLoading: boolean;
  error: string | null;
  /** True when a purchase can actually be started in this build. */
  isPurchaseAvailable: boolean;
  /** True when the Whop OAuth flow can be started in this build. */
  isWhopAvailable: boolean;
  upgrade: () => Promise<PaywallOutcome>;
  restore: () => Promise<RestoreOutcome>;
  refresh: () => Promise<PlusAccess>;
  openStoreManagement: () => Promise<boolean>;
  connectWhop: () => Promise<WhopConnectOutcome>;
  disconnectWhop: () => Promise<PlusAccess>;
}

const BillingContext = createContext<BillingContextValue | null>(null);

interface BillingProviderProps {
  children: React.ReactNode;
}

/**
 * Provides billing state and actions to the app.
 *
 * Params:
 *   children: React tree rendered under the provider.
 *
 * Returns:
 *   Provider-wrapped children.
 *
 * Edge cases:
 *   RevenueCat is configured only once a user ID is known, and never with an
 *   anonymous ID. Builds without RevenueCat keys still render; purchases are
 *   simply reported as unavailable.
 */
export function BillingProvider({
  children,
}: BillingProviderProps): React.JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    access,
    isLoading,
    error,
    refresh,
    refreshFromProviders,
    syncRevenueCat,
  } = useAccess();
  const [isConfigured, setIsConfigured] = useState(false);
  const linkedUserRef = useRef<string | null>(null);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId) {
      setIsConfigured(false);
      linkedUserRef.current = null;
      void logOutRevenueCat();
      setLocalAccess(FREE_ACCESS);
      return;
    }

    let cancelled = false;

    // Dogfood runs get a throwaway RevenueCat customer so a Test Store
    // purchase cannot survive into the next Revyl run. Real users are always
    // keyed on the Clerk ID so entitlements follow the account.
    const appUserId = env.skipAuth ? getEphemeralAppUserId() : userId;

    void configureRevenueCat(appUserId).then(async (configured) => {
      if (cancelled) {
        return;
      }

      setIsConfigured(configured);

      if (!configured) {
        return;
      }

      // Skip-auth builds hold access in memory and never call Convex, so
      // there is nothing to link. Access starts Free and is only ever raised
      // by a purchase or restore made in this session.
      if (env.skipAuth) {
        return;
      }

      if (linkedUserRef.current === userId) {
        return;
      }

      linkedUserRef.current = userId;

      try {
        await convexMutation(LINK_REVENUECAT_ACCOUNT, {
          revenueCatAppUserId: userId,
        });
      } catch (caught) {
        linkedUserRef.current = null;
        logger.warn("Failed to link RevenueCat account in Convex", {
          userId,
          extra: {
            error: caught instanceof Error ? caught.message : String(caught),
          },
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  /**
   * Re-reads access immediately after a purchase or restore.
   *
   * Returns:
   *   The access record reflecting the completed transaction.
   *
   * Edge cases:
   *   Goes to RevenueCat rather than to stored grants, because the RevenueCat
   *   webhook can lag by seconds and until it lands Convex still says Free.
   */
  const syncAfterPurchase = useCallback(async (): Promise<PlusAccess> => {
    if (env.skipAuth) {
      const local = await readRevenueCatAccess();
      setLocalAccess(local);
      return local;
    }

    return syncRevenueCat();
  }, [syncRevenueCat]);

  /**
   * Re-reads access for the Subscription screen's Refresh action.
   *
   * Returns:
   *   The current access record.
   *
   * Edge cases:
   *   Returns the in-memory record in skip-auth builds without touching the
   *   network, which is what keeps dogfood runs deterministic. Builds with no
   *   RevenueCat key fall back to re-deriving stored grants so a Whop-only
   *   user is not reported as Free when RevenueCat is unreachable.
   */
  const refreshAccess = useCallback(async (): Promise<PlusAccess> => {
    if (env.skipAuth) {
      return refresh();
    }

    return isConfigured ? syncRevenueCat() : refreshFromProviders();
  }, [refresh, refreshFromProviders, syncRevenueCat, isConfigured]);

  const upgrade = useCallback(async (): Promise<PaywallOutcome> => {
    const outcome = await presentPaywall();

    if (outcome.kind === "purchased" || outcome.kind === "restored") {
      await syncAfterPurchase();
    }

    return outcome;
  }, [syncAfterPurchase]);

  const restore = useCallback(async (): Promise<RestoreOutcome> => {
    const outcome = await restorePurchases();

    if (outcome.kind === "restored") {
      await syncAfterPurchase();
    }

    return outcome;
  }, [syncAfterPurchase]);

  const connectWhop = useCallback(async (): Promise<WhopConnectOutcome> => {
    if (env.skipAuth) {
      return {
        kind: "unavailable",
        message: "Connecting Whop requires signing in.",
      };
    }

    const outcome = await startWhopConnect();

    if (outcome.kind === "connected") {
      await refresh();
    }

    return outcome;
  }, [refresh]);

  const disconnectWhop = useCallback(async (): Promise<PlusAccess> => {
    if (env.skipAuth) {
      return access;
    }

    await convexMutation<PlusAccess>(DISCONNECT_WHOP);
    return refresh();
  }, [access, refresh]);

  const value = useMemo<BillingContextValue>(
    () => ({
      access,
      isLoading,
      error,
      isPurchaseAvailable: isConfigured && isRevenueCatConfigured(),
      isWhopAvailable: !env.skipAuth && isWhopConfigured(),
      upgrade,
      restore,
      refresh: refreshAccess,
      openStoreManagement: presentCustomerCenter,
      connectWhop,
      disconnectWhop,
    }),
    [
      access,
      isLoading,
      error,
      isConfigured,
      upgrade,
      restore,
      refreshAccess,
      connectWhop,
      disconnectWhop,
    ]
  );

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

/**
 * Returns the billing context.
 *
 * Returns:
 *   The current BillingContextValue.
 *
 * Throws:
 *   Error when called outside BillingProvider.
 */
export function useBilling(): BillingContextValue {
  const value = useContext(BillingContext);

  if (!value) {
    throw new Error("useBilling must be used within a BillingProvider");
  }

  return value;
}
