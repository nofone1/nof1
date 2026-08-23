/**
 * RevenueCat adapter for native App Store and Play Store subscriptions.
 *
 * Every entry point is safe to call in builds without RevenueCat keys (local
 * dev, Revyl dogfood): they log and return an "unavailable" result instead of
 * throwing, so the app never crashes on a missing configuration.
 */

import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesEntitlementInfo,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { env } from "@/config/env";
import { logger } from "@/services/logging";
import {
  FREE_ACCESS,
  PLUS_ENTITLEMENT,
  type PlusAccess,
} from "./types";

/** Result of presenting the RevenueCat paywall. */
export type PaywallOutcome =
  | { kind: "purchased" }
  | { kind: "restored" }
  | { kind: "cancelled" }
  | { kind: "not_presented" }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string };

/** Result of a restore-purchases attempt. */
export type RestoreOutcome =
  | { kind: "restored"; hasPlus: boolean }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string };

const UNAVAILABLE_MESSAGE =
  "In-app purchases are not configured for this build.";

let configuredAppUserId: string | null = null;
let ephemeralAppUserId: string | null = null;

/**
 * Returns a RevenueCat app user ID unique to this app launch.
 *
 * Returns:
 *   An ID of the form `dogfood-<random>`, stable for the process lifetime.
 *
 * Edge cases:
 *   Skip-auth builds only. Every Revyl run signs in as the same shared
 *   `dev-bypass-user` identity, and Test Store purchases persist on
 *   RevenueCat's servers against whatever app user ID bought them. Reusing the
 *   Clerk ID would therefore carry a purchase from one run into the next,
 *   suppressing the paywall and breaking the free-user flows. A fresh customer
 *   per launch isolates runs without touching any Revyl configuration.
 */
export function getEphemeralAppUserId(): string {
  if (ephemeralAppUserId === null) {
    ephemeralAppUserId = `dogfood-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  return ephemeralAppUserId;
}

/**
 * Returns the RevenueCat SDK key for the current platform.
 *
 * Returns:
 *   The Test Store key when set, otherwise the iOS or Android public key, or
 *   an empty string when this build has no key.
 *
 * Edge cases:
 *   The Test Store key wins deliberately so dogfood and E2E builds can never
 *   accidentally hit real store billing.
 */
function resolveApiKey(): string {
  if (env.revenueCatTestApiKey) {
    return env.revenueCatTestApiKey;
  }

  return Platform.OS === "ios"
    ? env.revenueCatIosApiKey
    : env.revenueCatAndroidApiKey;
}

/**
 * Returns whether this build can talk to RevenueCat.
 *
 * Returns:
 *   True when an SDK key is present for the current platform.
 */
export function isRevenueCatConfigured(): boolean {
  return resolveApiKey().length > 0;
}

/**
 * Returns whether this build is pointed at the RevenueCat Test Store.
 *
 * Returns:
 *   True when EXPO_PUBLIC_REVENUECAT_TEST_API_KEY is set.
 */
export function isTestStore(): boolean {
  return env.revenueCatTestApiKey.length > 0;
}

/**
 * Configures the RevenueCat SDK against a known user.
 *
 * Params:
 *   appUserId: Clerk user ID. RevenueCat is keyed on this so entitlements
 *     follow the account across devices and reinstalls.
 *
 * Returns:
 *   True when the SDK is configured and usable.
 *
 * Edge cases:
 *   Never configures anonymously — v1 requires login before purchase, which
 *   keeps webhook reconciliation unambiguous. Repeated calls with the same ID
 *   are a no-op; a different ID issues a RevenueCat logIn so the purchase
 *   history transfers rather than starting a second customer.
 */
export async function configureRevenueCat(
  appUserId: string
): Promise<boolean> {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    logger.info("RevenueCat not configured: no SDK key for this build");
    return false;
  }

  if (!appUserId) {
    logger.warn("RevenueCat configure skipped: missing app user ID");
    return false;
  }

  if (configuredAppUserId === appUserId) {
    return true;
  }

  try {
    if (configuredAppUserId === null) {
      if (env.isDevelopment) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey, appUserID: appUserId });
    } else {
      await Purchases.logIn(appUserId);
    }

    configuredAppUserId = appUserId;
    logger.info("RevenueCat configured", {
      userId: appUserId,
      extra: { testStore: isTestStore() },
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("RevenueCat configure failed", { userId: appUserId }, new Error(message));
    return false;
  }
}

/**
 * Clears the RevenueCat session when the user signs out.
 *
 * Returns:
 *   void.
 *
 * Edge cases:
 *   Safe to call when RevenueCat was never configured.
 */
export async function logOutRevenueCat(): Promise<void> {
  if (configuredAppUserId === null) {
    return;
  }

  try {
    await Purchases.logOut();
  } catch (error) {
    logger.warn("RevenueCat logout failed", {
      extra: { error: error instanceof Error ? error.message : String(error) },
    });
  } finally {
    configuredAppUserId = null;
  }
}

/**
 * Reads the current customer state from RevenueCat.
 *
 * Returns:
 *   CustomerInfo, or null when RevenueCat is unconfigured or the call failed.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRevenueCatConfigured() || configuredAppUserId === null) {
    return null;
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    logger.warn("RevenueCat getCustomerInfo failed", {
      extra: { error: error instanceof Error ? error.message : String(error) },
    });
    return null;
  }
}

/**
 * Converts a RevenueCat entitlement into the app's access shape.
 *
 * Params:
 *   entitlement: Active nof1_plus entitlement from CustomerInfo.
 *
 * Returns:
 *   A PlusAccess record sourced entirely from RevenueCat.
 *
 * Edge cases:
 *   A detected billing issue is reported as a grace period so the UI can warn
 *   the user before access actually lapses.
 */
function toAccess(entitlement: PurchasesEntitlementInfo): PlusAccess {
  const status =
    entitlement.billingIssueDetectedAt === null ? "active" : "grace_period";

  return {
    entitlement: PLUS_ENTITLEMENT,
    hasPlus: true,
    sources: [
      {
        provider: "revenuecat",
        status,
        productId: entitlement.productIdentifier,
        expiresAt: entitlement.expirationDate,
      },
    ],
    primarySource: "revenuecat",
    expiresAt: entitlement.expirationDate,
    inGracePeriod: status === "grace_period",
    hasMultipleActiveProviders: false,
  };
}

/**
 * Derives access purely from RevenueCat's local customer state.
 *
 * Returns:
 *   PlusAccess reflecting RevenueCat only, or FREE_ACCESS when there is no
 *   active nof1_plus entitlement.
 *
 * Edge cases:
 *   This is the optimistic, client-side view. Convex remains the source of
 *   truth for signed-in users and for anything server-gated.
 */
export async function readRevenueCatAccess(): Promise<PlusAccess> {
  const info = await getCustomerInfo();
  const entitlement = info?.entitlements.active[PLUS_ENTITLEMENT];

  return entitlement ? toAccess(entitlement) : FREE_ACCESS;
}

/**
 * Presents the remote RevenueCat paywall.
 *
 * Returns:
 *   A PaywallOutcome describing what the user did.
 *
 * Edge cases:
 *   Returns `unavailable` rather than throwing when the build has no SDK key,
 *   so the Subscription screen can show an explanation instead of crashing.
 */
export async function presentPaywall(): Promise<PaywallOutcome> {
  if (!isRevenueCatConfigured() || configuredAppUserId === null) {
    return { kind: "unavailable", message: UNAVAILABLE_MESSAGE };
  }

  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PLUS_ENTITLEMENT,
    });

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        return { kind: "purchased" };
      case PAYWALL_RESULT.RESTORED:
        return { kind: "restored" };
      case PAYWALL_RESULT.CANCELLED:
        return { kind: "cancelled" };
      case PAYWALL_RESULT.NOT_PRESENTED:
        return { kind: "not_presented" };
      case PAYWALL_RESULT.ERROR:
        return { kind: "error", message: "The paywall could not be shown." };
      default: {
        const exhaustive: never = result;
        return { kind: "error", message: `Unexpected paywall result: ${exhaustive}` };
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn("RevenueCat paywall failed", { extra: { error: message } });
    return { kind: "error", message };
  }
}

/**
 * Restores previous purchases for the signed-in RevenueCat user.
 *
 * Returns:
 *   A RestoreOutcome carrying whether Plus is now active.
 */
export async function restorePurchases(): Promise<RestoreOutcome> {
  if (!isRevenueCatConfigured() || configuredAppUserId === null) {
    return { kind: "unavailable", message: UNAVAILABLE_MESSAGE };
  }

  try {
    const info = await Purchases.restorePurchases();
    return {
      kind: "restored",
      hasPlus: Boolean(info.entitlements.active[PLUS_ENTITLEMENT]),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn("RevenueCat restore failed", { extra: { error: message } });
    return { kind: "error", message };
  }
}

/**
 * Opens the RevenueCat Customer Center for store-managed subscriptions.
 *
 * Returns:
 *   True when the Customer Center was presented.
 *
 * Edge cases:
 *   Only meaningful for Apple and Google purchases; Whop members manage their
 *   membership on Whop instead.
 */
export async function presentCustomerCenter(): Promise<boolean> {
  if (!isRevenueCatConfigured() || configuredAppUserId === null) {
    return false;
  }

  try {
    await RevenueCatUI.presentCustomerCenter();
    return true;
  } catch (error) {
    logger.warn("RevenueCat customer center failed", {
      extra: { error: error instanceof Error ? error.message : String(error) },
    });
    return false;
  }
}
