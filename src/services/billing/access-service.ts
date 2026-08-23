/**
 * Resolves the user's Nof1 Plus access.
 *
 * Convex is the source of truth for signed-in users. Skip-auth builds (local
 * dev and Revyl dogfood sessions) have no Clerk identity and send no Convex
 * token, so access is held in process memory instead: Free by default, and
 * only ever raised by a RevenueCat Test Store purchase made in that session.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { env } from "@/config/env";
import { logger } from "@/services/logging";
import { useAuth } from "@/services/auth";
import {
  convexAction,
  convexMutation,
  convexQuery,
  isConvexConfigured,
} from "@/services/backend/convex-client";
import { FREE_ACCESS, type PlusAccess, type UseAccessResult } from "./types";

const GET_ACCESS = "billing:getAccess" as const;
const REFRESH_ACCESS = "billing:refreshAccess" as const;
const SYNC_REVENUECAT = "billing:syncRevenueCat" as const;

let localAccess: PlusAccess = FREE_ACCESS;
const localAccessListeners = new Set<() => void>();

/**
 * Overrides the in-memory access record used by skip-auth builds.
 *
 * Params:
 *   access: Access record to publish to subscribers.
 *
 * Returns:
 *   void.
 *
 * Edge cases:
 *   No-ops outside skip-auth builds so a client-side call can never grant
 *   premium access to a real signed-in user.
 */
export function setLocalAccess(access: PlusAccess): void {
  if (!env.skipAuth) {
    return;
  }

  localAccess = access;
  localAccessListeners.forEach((listener) => listener());
}

/**
 * Resets skip-auth access back to Free.
 *
 * Returns:
 *   void.
 */
export function clearLocalAccess(): void {
  setLocalAccess(FREE_ACCESS);
}

/**
 * Registers a listener for skip-auth access changes.
 *
 * Params:
 *   listener: Callback invoked whenever local access changes.
 *
 * Returns:
 *   Unsubscribe function.
 */
function subscribeLocalAccess(listener: () => void): () => void {
  localAccessListeners.add(listener);
  return () => {
    localAccessListeners.delete(listener);
  };
}

/**
 * Returns the current skip-auth access snapshot for useSyncExternalStore.
 *
 * Returns:
 *   The in-memory access record.
 */
function getLocalAccessSnapshot(): PlusAccess {
  return localAccess;
}

/**
 * Subscribes to the in-memory skip-auth access record.
 *
 * Returns:
 *   Current local access record.
 */
function useLocalAccess(): PlusAccess {
  return useSyncExternalStore(
    subscribeLocalAccess,
    getLocalAccessSnapshot,
    getLocalAccessSnapshot
  );
}

/**
 * Reads the stored access record for the signed-in user from Convex.
 *
 * Returns:
 *   The user's PlusAccess record.
 *
 * Throws:
 *   Error when Convex is unreachable or the request is unauthenticated.
 */
export async function fetchAccess(): Promise<PlusAccess> {
  return convexQuery<PlusAccess>(GET_ACCESS);
}

/**
 * Asks Convex to re-derive access, expiring any lapsed grants first.
 *
 * Returns:
 *   The refreshed PlusAccess record.
 *
 * Throws:
 *   Error when Convex is unreachable or the request is unauthenticated.
 *
 * Edge cases:
 *   Call this after a purchase or restore so the UI does not wait on the
 *   provider webhook.
 */
export async function refreshAccessFromProviders(): Promise<PlusAccess> {
  return convexMutation<PlusAccess>(REFRESH_ACCESS);
}

/**
 * Pulls live RevenueCat state into Convex and returns the resulting access.
 *
 * Returns:
 *   The PlusAccess record after the RevenueCat grant has been rewritten.
 *
 * Throws:
 *   Error when Convex is unreachable, the request is unauthenticated, or
 *   RevenueCat rejects the server's read.
 *
 * Edge cases:
 *   Use this after a purchase or restore. `refreshAccessFromProviders` only
 *   re-derives from grants already stored, so on its own it would still report
 *   Free until the provider webhook lands.
 */
export async function syncRevenueCatAccess(): Promise<PlusAccess> {
  return convexAction<PlusAccess>(SYNC_REVENUECAT);
}

/**
 * Subscribes to the user's combined Nof1 Plus access.
 *
 * Returns:
 *   UseAccessResult with the current access record, loading and error state,
 *   and refresh helpers.
 *
 * Edge cases:
 *   Returns Free without any network call while signed out, when Convex is not
 *   configured, or in skip-auth builds. Fetch failures resolve to Free with an
 *   error message rather than throwing, so premium UI stays locked by default.
 */
export function useAccess(): UseAccessResult {
  const { isLoaded, isSignedIn } = useAuth();
  const localAccessRecord = useLocalAccess();
  const [access, setAccess] = useState<PlusAccess>(FREE_ACCESS);
  const [isLoading, setIsLoading] = useState<boolean>(!env.skipAuth);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (reader: () => Promise<PlusAccess>): Promise<PlusAccess> => {
      if (env.skipAuth) {
        return getLocalAccessSnapshot();
      }

      if (!isLoaded || !isSignedIn) {
        if (isMountedRef.current) {
          setAccess(FREE_ACCESS);
          setIsLoading(!isLoaded);
          setError(null);
        }
        return FREE_ACCESS;
      }

      if (!isConvexConfigured()) {
        if (isMountedRef.current) {
          setAccess(FREE_ACCESS);
          setIsLoading(false);
          setError("Billing is unavailable: Convex is not configured.");
        }
        return FREE_ACCESS;
      }

      if (isMountedRef.current) {
        setIsLoading(true);
      }

      try {
        const next = await reader();
        if (isMountedRef.current) {
          setAccess(next);
          setError(null);
          setIsLoading(false);
        }
        return next;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : String(caught);
        logger.warn("Failed to load Plus access", { extra: { error: message } });

        if (isMountedRef.current) {
          setAccess(FREE_ACCESS);
          setError(message);
          setIsLoading(false);
        }
        return FREE_ACCESS;
      }
    },
    [isLoaded, isSignedIn]
  );

  const refresh = useCallback(() => load(fetchAccess), [load]);
  const refreshFromProviders = useCallback(
    () => load(refreshAccessFromProviders),
    [load]
  );
  const syncRevenueCat = useCallback(
    () => load(syncRevenueCatAccess),
    [load]
  );

  useEffect(() => {
    if (env.skipAuth) {
      return;
    }

    void refresh();
  }, [refresh]);

  if (env.skipAuth) {
    return {
      access: localAccessRecord,
      isLoading: false,
      error: null,
      refresh: async () => getLocalAccessSnapshot(),
      refreshFromProviders: async () => getLocalAccessSnapshot(),
      syncRevenueCat: async () => getLocalAccessSnapshot(),
    };
  }

  return {
    access,
    isLoading,
    error,
    refresh,
    refreshFromProviders,
    syncRevenueCat,
  };
}
