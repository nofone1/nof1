/**
 * Client-side billing types.
 *
 * These mirror the structured result returned by the Convex `billing:getAccess`
 * query so the app never has to reason about raw provider payloads.
 */

/** Internal entitlement key granted by every paid channel. */
export const PLUS_ENTITLEMENT = "nof1_plus";

/** Channel that granted access. */
export type BillingProviderId = "revenuecat" | "whop" | "manual";

/** Lifecycle state of a single provider grant. */
export type GrantStatus = "active" | "grace_period" | "expired" | "revoked";

/**
 * One provider's contribution to the user's access.
 * @property provider - Channel that granted access
 * @property status - Lifecycle state of the grant
 * @property productId - Provider product identifier, when known
 * @property expiresAt - ISO expiry, or null for open-ended grants
 */
export interface AccessSource {
  provider: BillingProviderId;
  status: GrantStatus;
  productId: string | null;
  expiresAt: string | null;
}

/**
 * Combined Plus access decision.
 * @property entitlement - Entitlement key this record describes
 * @property hasPlus - Whether any provider currently grants access
 * @property sources - Every currently granting provider, best first
 * @property primarySource - Provider whose grant lasts longest, or null
 * @property expiresAt - Latest expiry across sources, null when open-ended
 * @property inGracePeriod - True when access is only held by a grace period
 * @property hasMultipleActiveProviders - True when the user pays twice
 */
export interface PlusAccess {
  entitlement: string;
  hasPlus: boolean;
  sources: AccessSource[];
  primarySource: BillingProviderId | null;
  expiresAt: string | null;
  inGracePeriod: boolean;
  hasMultipleActiveProviders: boolean;
}

/** Access record for a user with no grants. */
export const FREE_ACCESS: PlusAccess = {
  entitlement: PLUS_ENTITLEMENT,
  hasPlus: false,
  sources: [],
  primarySource: null,
  expiresAt: null,
  inGracePeriod: false,
  hasMultipleActiveProviders: false,
};

/**
 * Result of the `useAccess` hook.
 * @property access - Current combined access decision
 * @property isLoading - True while the first fetch is in flight
 * @property error - Human-readable failure reason, or null
 * @property refresh - Re-reads stored access from Convex
 * @property refreshFromProviders - Re-derives access, expiring lapsed grants
 * @property syncRevenueCat - Pulls live RevenueCat state into Convex, then
 *   returns the resulting access
 */
export interface UseAccessResult {
  access: PlusAccess;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<PlusAccess>;
  refreshFromProviders: () => Promise<PlusAccess>;
  syncRevenueCat: () => Promise<PlusAccess>;
}

/**
 * Returns a human-readable label for a provider.
 *
 * Params:
 *   provider: Provider to describe, or null when the user is Free.
 *
 * Returns:
 *   Display label such as "App Store" or "Whop".
 *
 * Edge cases:
 *   RevenueCat is presented as the underlying store because that is what the
 *   user recognizes on their receipt.
 */
export function describeProvider(provider: BillingProviderId | null): string {
  switch (provider) {
    case "revenuecat":
      return "App Store / Play Store";
    case "whop":
      return "Whop";
    case "manual":
      return "Granted by Nof1";
    case null:
      return "None";
    default: {
      const exhaustive: never = provider;
      return exhaustive;
    }
  }
}
