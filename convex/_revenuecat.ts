/**
 * Pure mapping from RevenueCat's REST subscriber payload to an entitlement
 * grant.
 *
 * RevenueCat recommends treating webhook events as a signal to re-read the
 * subscriber, so the grant is always derived from current provider state
 * rather than from the individual event body.
 */

import { PLUS_ENTITLEMENT, toMillis, type GrantStatus } from "./_billing";

/** Subset of a RevenueCat v1 subscriber entitlement we depend on. */
interface RevenueCatEntitlement {
  expires_date?: string | null;
  product_identifier?: string | null;
  purchase_date?: string | null;
}

/** Subset of a RevenueCat v1 subscriber subscription we depend on. */
interface RevenueCatSubscription {
  billing_issues_detected_at?: string | null;
  refunded_at?: string | null;
  grace_period_expires_date?: string | null;
}

/** Subset of the RevenueCat v1 subscriber response we depend on. */
export interface RevenueCatSubscriber {
  original_app_user_id?: string | null;
  entitlements?: Record<string, RevenueCatEntitlement> | null;
  subscriptions?: Record<string, RevenueCatSubscription> | null;
}

/** Grant fields derived from RevenueCat's current subscriber state. */
export interface RevenueCatGrant {
  status: GrantStatus;
  productId?: string;
  expiresAt?: string;
  providerRecordId: string;
}

/**
 * Derives the nof1_plus grant from a RevenueCat subscriber payload.
 *
 * Params:
 *   subscriber: Subscriber object from GET /v1/subscribers/{app_user_id}.
 *   appUserId: The app user ID the subscriber was fetched for, used as the
 *     fallback provider record ID.
 *   now: Current time as an ISO timestamp.
 *
 * Returns:
 *   The grant fields to persist for the "revenuecat" provider.
 *
 * Edge cases:
 *   A refund produces "revoked" so it stays distinguishable from a lapsed
 *   subscription. A detected billing issue produces "grace_period", which
 *   still confers access until the expiry passes. A missing entitlement
 *   produces "expired" rather than deleting the row, so the history and the
 *   ordering guard survive.
 */
export function resolveGrantFromSubscriber(
  subscriber: RevenueCatSubscriber,
  appUserId: string,
  now: string
): RevenueCatGrant {
  const providerRecordId = subscriber.original_app_user_id || appUserId;
  const entitlement = subscriber.entitlements?.[PLUS_ENTITLEMENT];

  if (!entitlement) {
    return { status: "expired", providerRecordId };
  }

  const productId = entitlement.product_identifier ?? undefined;
  const subscription = productId
    ? subscriber.subscriptions?.[productId]
    : undefined;

  if (subscription?.refunded_at) {
    return { status: "revoked", productId, providerRecordId };
  }

  const expiresAt = entitlement.expires_date ?? undefined;
  const expiryMs = toMillis(expiresAt);
  const nowMs = toMillis(now) ?? Date.now();

  if (expiryMs !== null && expiryMs <= nowMs) {
    return { status: "expired", productId, expiresAt, providerRecordId };
  }

  const status: GrantStatus = subscription?.billing_issues_detected_at
    ? "grace_period"
    : "active";

  return { status, productId, expiresAt, providerRecordId };
}
