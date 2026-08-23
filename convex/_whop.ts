/**
 * Pure mapping from Whop membership state to an entitlement grant.
 *
 * Kept free of Convex runtime imports so the status mapping and membership
 * selection can be unit tested.
 */

import { toMillis, type GrantStatus } from "./_billing";

/** Base URL for the Whop REST API. */
export const WHOP_API_BASE = "https://api.whop.com/api/v1";

/** Base URL for Whop OAuth endpoints. Shared by sandbox and production. */
export const WHOP_OAUTH_BASE = "https://api.whop.com/oauth";

/** Subset of the Whop membership object we depend on. */
export interface WhopMembership {
  id: string;
  status: string;
  user_id: string | null;
  product_id: string;
  plan_id: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

/** Grant fields derived from current Whop membership state. */
export interface WhopGrant {
  status: GrantStatus;
  productId: string;
  expiresAt?: string;
  providerRecordId: string;
}

/**
 * Maps a Whop billing status onto an entitlement grant status.
 *
 * Params:
 *   status: Whop membership status.
 *
 * Returns:
 *   The equivalent GrantStatus.
 *
 * Edge cases:
 *   `completed` covers one-time purchases that keep access, so it maps to
 *   active. `past_due` is Whop's post-failed-payment grace window. Anything
 *   unrecognized maps to expired so an unknown state can never grant access.
 */
export function toGrantStatusFromMembership(status: string): GrantStatus {
  switch (status) {
    case "active":
    case "trialing":
    case "completed":
      return "active";
    case "past_due":
      return "grace_period";
    case "canceled":
    case "expired":
    case "unresolved":
      return "expired";
    default:
      return "expired";
  }
}

/**
 * Picks the membership that grants the longest access.
 *
 * Params:
 *   memberships: Memberships for one user and product.
 *
 * Returns:
 *   The best membership, or null when the list is empty.
 *
 * Edge cases:
 *   Access-granting memberships always beat non-granting ones. Among those, a
 *   membership with no period end (one-time purchase) wins, then the latest
 *   `current_period_end`. This keeps a re-subscribe from being masked by an
 *   older canceled row.
 */
export function selectBestMembership(
  memberships: readonly WhopMembership[]
): WhopMembership | null {
  if (memberships.length === 0) {
    return null;
  }

  const ranked = [...memberships].sort((a, b) => {
    const aGrants = toGrantStatusFromMembership(a.status) !== "expired";
    const bGrants = toGrantStatusFromMembership(b.status) !== "expired";

    if (aGrants !== bGrants) {
      return aGrants ? -1 : 1;
    }

    const aEnd = toMillis(a.current_period_end);
    const bEnd = toMillis(b.current_period_end);

    if (aEnd === null && bEnd !== null) {
      return -1;
    }

    if (aEnd !== null && bEnd === null) {
      return 1;
    }

    if (aEnd !== null && bEnd !== null && aEnd !== bEnd) {
      return bEnd - aEnd;
    }

    return a.id.localeCompare(b.id);
  });

  return ranked[0];
}

/**
 * Derives the nof1_plus grant from a user's Whop memberships.
 *
 * Params:
 *   memberships: Memberships returned for the user and the Plus product.
 *   productId: The configured Whop Plus product ID, used when the user has no
 *     membership at all.
 *
 * Returns:
 *   Grant fields to persist for the "whop" provider, or null when there is no
 *   membership to record.
 *
 * Edge cases:
 *   A membership set to cancel at period end still grants access until the
 *   period ends, so `cancel_at_period_end` intentionally does not change the
 *   status — only the expiry matters.
 */
export function resolveGrantFromMemberships(
  memberships: readonly WhopMembership[],
  productId: string
): WhopGrant | null {
  const membership = selectBestMembership(memberships);

  if (!membership) {
    return null;
  }

  return {
    status: toGrantStatusFromMembership(membership.status),
    productId: membership.product_id || productId,
    expiresAt: membership.current_period_end ?? undefined,
    providerRecordId: membership.id,
  };
}
