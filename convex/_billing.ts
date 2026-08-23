/**
 * Pure billing rules shared by Convex billing functions and webhook handlers.
 *
 * This module deliberately imports nothing from the Convex runtime so the
 * access decision and webhook ordering rules can be unit tested directly.
 */

/** Internal entitlement key granted by every paid channel. */
export const PLUS_ENTITLEMENT = "nof1_plus";

/**
 * Experiments a Free user may have in progress at once.
 * Manual tracking stays unlimited; only concurrent experiments are gated.
 */
export const FREE_IN_PROGRESS_EXPERIMENT_LIMIT = 1;

/** Experiment statuses that count against the Free limit. */
export const IN_PROGRESS_EXPERIMENT_STATUSES: readonly string[] = [
  "draft",
  "active",
  "paused",
];

/**
 * Returns whether an experiment status counts against the Free limit.
 *
 * Params:
 *   status: Experiment status string.
 *
 * Returns:
 *   True for draft, active, and paused experiments.
 */
export function isInProgressExperimentStatus(status: unknown): boolean {
  return (
    typeof status === "string" &&
    IN_PROGRESS_EXPERIMENT_STATUSES.includes(status)
  );
}

export const BILLING_PROVIDERS = ["revenuecat", "whop", "manual"] as const;
export type BillingProviderId = (typeof BILLING_PROVIDERS)[number];

export const GRANT_STATUSES = [
  "active",
  "grace_period",
  "expired",
  "revoked",
] as const;
export type GrantStatus = (typeof GRANT_STATUSES)[number];

/**
 * Tie-breaker when two providers grant access for the same duration.
 * RevenueCat wins because store-managed billing is the harder one to change.
 */
const PROVIDER_PRIORITY: readonly BillingProviderId[] = [
  "revenuecat",
  "whop",
  "manual",
];

/** One provider's stored claim on an entitlement. */
export interface EntitlementGrant {
  userId: string;
  entitlement: string;
  provider: BillingProviderId;
  status: GrantStatus;
  productId?: string;
  providerRecordId: string;
  expiresAt?: string;
  providerUpdatedAt: string;
}

/** A single grant, flattened for client consumption. */
export interface AccessSource {
  provider: BillingProviderId;
  status: GrantStatus;
  productId: string | null;
  expiresAt: string | null;
}

/** Combined access decision returned to the app. */
export interface PlusAccess {
  entitlement: string;
  hasPlus: boolean;
  sources: AccessSource[];
  primarySource: BillingProviderId | null;
  expiresAt: string | null;
  inGracePeriod: boolean;
  hasMultipleActiveProviders: boolean;
}

/**
 * Parses an ISO timestamp into epoch milliseconds.
 *
 * Params:
 *   value: ISO timestamp, or null/undefined for "no timestamp".
 *
 * Returns:
 *   Epoch milliseconds, or null when the value is absent or unparseable.
 */
export function toMillis(value: string | null | undefined): number | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Coerces an arbitrary string into a known grant status.
 *
 * Params:
 *   value: Raw status string from a provider payload or stored document.
 *
 * Returns:
 *   The matching GrantStatus, or "expired" when unrecognized.
 *
 * Edge cases:
 *   Falls back to the non-granting status so an unknown value can never
 *   accidentally hand out premium access.
 */
export function toGrantStatus(value: unknown): GrantStatus {
  return GRANT_STATUSES.includes(value as GrantStatus)
    ? (value as GrantStatus)
    : "expired";
}

/**
 * Coerces an arbitrary string into a known billing provider.
 *
 * Params:
 *   value: Raw provider string.
 *
 * Returns:
 *   The matching BillingProviderId.
 *
 * Throws:
 *   Error when the value is not a supported provider.
 */
export function toBillingProviderId(value: unknown): BillingProviderId {
  if (BILLING_PROVIDERS.includes(value as BillingProviderId)) {
    return value as BillingProviderId;
  }

  throw new Error(`Unsupported billing provider: ${String(value)}`);
}

/**
 * Returns whether a stored grant currently confers Plus access.
 *
 * Params:
 *   grant: Stored entitlement grant.
 *   nowMs: Current time in epoch milliseconds.
 *
 * Returns:
 *   True when the grant is for nof1_plus, is active or in grace period, and
 *   has not passed its expiry.
 *
 * Edge cases:
 *   A grant with no expiresAt never expires (lifetime or manual grant).
 */
export function isGrantActive(
  grant: EntitlementGrant,
  nowMs: number
): boolean {
  if (grant.entitlement !== PLUS_ENTITLEMENT) {
    return false;
  }

  if (grant.status !== "active" && grant.status !== "grace_period") {
    return false;
  }

  const expiry = toMillis(grant.expiresAt);
  return expiry === null || expiry > nowMs;
}

/**
 * Converts a stored grant into the client-facing source shape.
 *
 * Params:
 *   grant: Stored entitlement grant.
 *
 * Returns:
 *   AccessSource with optional fields normalized to null.
 */
function toAccessSource(grant: EntitlementGrant): AccessSource {
  return {
    provider: grant.provider,
    status: grant.status,
    productId: grant.productId ?? null,
    expiresAt: grant.expiresAt ?? null,
  };
}

/**
 * Ranks two granting sources, longest-lasting access first.
 *
 * Params:
 *   a: First source.
 *   b: Second source.
 *
 * Returns:
 *   Negative when `a` should sort before `b`.
 *
 * Edge cases:
 *   A source with no expiry outranks every dated source; equal durations fall
 *   back to PROVIDER_PRIORITY so the result is stable.
 */
function compareSources(a: AccessSource, b: AccessSource): number {
  const aExpiry = toMillis(a.expiresAt);
  const bExpiry = toMillis(b.expiresAt);

  if (aExpiry === null && bExpiry !== null) {
    return -1;
  }

  if (aExpiry !== null && bExpiry === null) {
    return 1;
  }

  if (aExpiry !== null && bExpiry !== null && aExpiry !== bExpiry) {
    return bExpiry - aExpiry;
  }

  return (
    PROVIDER_PRIORITY.indexOf(a.provider) -
    PROVIDER_PRIORITY.indexOf(b.provider)
  );
}

/**
 * Returns the access record for a user with no grants at all.
 *
 * Returns:
 *   A Free PlusAccess result.
 */
export function emptyAccess(): PlusAccess {
  return {
    entitlement: PLUS_ENTITLEMENT,
    hasPlus: false,
    sources: [],
    primarySource: null,
    expiresAt: null,
    inGracePeriod: false,
    hasMultipleActiveProviders: false,
  };
}

/**
 * Combines every provider grant into one access decision.
 *
 * Params:
 *   grants: All stored grants for a single user (any entitlement).
 *   now: Current time as an ISO timestamp.
 *
 * Returns:
 *   PlusAccess describing whether the user has Plus and where it comes from.
 *
 * Edge cases:
 *   Providers are independent: a revoked Whop grant cannot cancel out an
 *   active RevenueCat grant. `expiresAt` is null when any granting source is
 *   open-ended, otherwise it is the latest expiry across granting sources.
 */
export function resolveAccess(
  grants: readonly EntitlementGrant[],
  now: string
): PlusAccess {
  const nowMs = toMillis(now) ?? Date.now();
  const granting = grants
    .filter((grant) => isGrantActive(grant, nowMs))
    .map(toAccessSource)
    .sort(compareSources);

  if (granting.length === 0) {
    return emptyAccess();
  }

  const hasOpenEndedSource = granting.some(
    (source) => toMillis(source.expiresAt) === null
  );
  const latestExpiry = granting.reduce<number | null>((latest, source) => {
    const expiry = toMillis(source.expiresAt);
    if (expiry === null) {
      return latest;
    }
    return latest === null || expiry > latest ? expiry : latest;
  }, null);

  return {
    entitlement: PLUS_ENTITLEMENT,
    hasPlus: true,
    sources: granting,
    primarySource: granting[0].provider,
    expiresAt:
      hasOpenEndedSource || latestExpiry === null
        ? null
        : new Date(latestExpiry).toISOString(),
    inGracePeriod: granting.every((source) => source.status === "grace_period"),
    hasMultipleActiveProviders: granting.length > 1,
  };
}

/**
 * Returns whether an incoming provider update should be ignored as stale.
 *
 * Params:
 *   storedProviderUpdatedAt: providerUpdatedAt on the existing grant.
 *   incomingProviderUpdatedAt: providerUpdatedAt from the new webhook.
 *
 * Returns:
 *   True when the incoming update is older than or identical to what is
 *   already stored, meaning the webhook was redelivered or arrived late.
 *
 * Edge cases:
 *   When either timestamp is unparseable the update is applied (last write
 *   wins) rather than silently dropped, since ordering cannot be established.
 */
export function isStaleProviderUpdate(
  storedProviderUpdatedAt: string | null | undefined,
  incomingProviderUpdatedAt: string | null | undefined
): boolean {
  const stored = toMillis(storedProviderUpdatedAt);
  const incoming = toMillis(incomingProviderUpdatedAt);

  if (stored === null || incoming === null) {
    return false;
  }

  return incoming <= stored;
}
