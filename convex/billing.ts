/**
 * Convex billing functions.
 *
 * Every paid channel writes its own entitlement grant row and the combined
 * access decision is derived at read time, so one provider can never clear
 * another provider's access.
 */

import {
  actionGeneric,
  anyApi,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import { v } from "convex/values";
import { nowIso, requireUserId, type AuthCtx } from "./_auth";
import {
  exchangeWhopCode,
  fetchWhopMemberships,
  fetchWhopUserId,
  requireWhopPlusProductId,
} from "./_whop_client";
import { resolveGrantFromMemberships } from "./_whop";
import { fetchSubscriberState } from "./_revenuecat_client";
import { resolveGrantFromSubscriber } from "./_revenuecat";
import {
  emptyAccess,
  isGrantActive,
  isStaleProviderUpdate,
  PLUS_ENTITLEMENT,
  resolveAccess,
  toBillingProviderId,
  toGrantStatus,
  toMillis,
  type BillingProviderId,
  type EntitlementGrant,
  type PlusAccess,
} from "./_billing";

/** Minimal shape of the Convex database handle used by these helpers. */
export interface BillingDb {
  query: (table: string) => any;
  insert: (table: string, doc: Record<string, unknown>) => Promise<unknown>;
  patch: (id: unknown, updates: Record<string, unknown>) => Promise<unknown>;
  delete: (id: unknown) => Promise<unknown>;
}

interface BillingCtx extends AuthCtx {
  db: BillingDb;
}

type StoredGrant = EntitlementGrant & { _id: unknown };

/**
 * Reads every entitlement grant belonging to a user.
 *
 * Params:
 *   db: Convex database handle.
 *   userId: Clerk user ID.
 *
 * Returns:
 *   All stored grants for the user, across providers and entitlements.
 */
async function listGrants(
  db: BillingDb,
  userId: string
): Promise<StoredGrant[]> {
  return db
    .query("entitlementGrants")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
}

/**
 * Reads the single grant a provider owns for a user.
 *
 * Params:
 *   db: Convex database handle.
 *   userId: Clerk user ID.
 *   provider: Billing provider that owns the grant.
 *
 * Returns:
 *   The stored grant, or null when the provider has never granted access.
 */
async function findProviderGrant(
  db: BillingDb,
  userId: string,
  provider: BillingProviderId
): Promise<StoredGrant | null> {
  const docs: StoredGrant[] = await db
    .query("entitlementGrants")
    .withIndex("by_userId_and_provider", (q: any) =>
      q.eq("userId", userId).eq("provider", provider)
    )
    .collect();

  return (
    docs.find((doc) => doc.entitlement === PLUS_ENTITLEMENT) ?? null
  );
}

/**
 * Marks grants whose expiry has passed as expired.
 *
 * Params:
 *   db: Convex database handle.
 *   grants: Grants previously read for the user.
 *   now: Current time as an ISO timestamp.
 *
 * Returns:
 *   The grants with expired statuses applied in memory, matching what was
 *   written to the database.
 *
 * Edge cases:
 *   Only active and grace-period grants are touched; revoked grants keep their
 *   status so refunds stay distinguishable from lapsed subscriptions.
 */
async function expireLapsedGrants(
  db: BillingDb,
  grants: StoredGrant[],
  now: string
): Promise<StoredGrant[]> {
  const nowMs = toMillis(now) ?? Date.now();
  const updated: StoredGrant[] = [];

  for (const grant of grants) {
    const isPending =
      grant.status === "active" || grant.status === "grace_period";

    if (isPending && !isGrantActive(grant, nowMs)) {
      await db.patch(grant._id, { status: "expired" });
      updated.push({ ...grant, status: "expired" });
      continue;
    }

    updated.push(grant);
  }

  return updated;
}

/**
 * Creates or updates the billing account row that links provider identities.
 *
 * Params:
 *   db: Convex database handle.
 *   userId: Clerk user ID.
 *   updates: Provider identifiers to merge into the account.
 *
 * Returns:
 *   void.
 */
async function upsertBillingAccount(
  db: BillingDb,
  userId: string,
  updates: Record<string, string | undefined>
): Promise<void> {
  const existing = await db
    .query("billingAccounts")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  const now = nowIso();

  if (existing) {
    await db.patch(existing._id, { ...updates, updatedAt: now });
    return;
  }

  await db.insert("billingAccounts", {
    userId,
    ...updates,
    updatedAt: now,
  });
}

/**
 * Throws unless the user currently has Nof1 Plus.
 *
 * Params:
 *   ctx: Convex query or mutation context.
 *   userId: Clerk user ID to check.
 *
 * Returns:
 *   The resolved access record when the user has Plus.
 *
 * Throws:
 *   Error("Nof1 Plus required") when no provider grants access.
 *
 * Edge cases:
 *   This is the server-side gate. Never rely on client entitlement state for
 *   operations that must be paid for.
 */
export async function requirePlus(
  ctx: BillingCtx,
  userId: string
): Promise<PlusAccess> {
  const grants = await listGrants(ctx.db, userId);
  const access = resolveAccess(grants, nowIso());

  if (!access.hasPlus) {
    throw new Error("Nof1 Plus required");
  }

  return access;
}

/**
 * Returns the combined Plus access decision for the signed-in user.
 *
 * Returns:
 *   PlusAccess describing whether the user has Plus and from which providers.
 *
 * Throws:
 *   Error("Unauthorized") when no Clerk identity is attached to the request.
 */
export const getAccess = queryGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireUserId(ctx);
    const grants = await listGrants(ctx.db, userId);
    return resolveAccess(grants, nowIso());
  },
});

/**
 * Re-derives access for the signed-in user, expiring any lapsed grants.
 *
 * Returns:
 *   The refreshed PlusAccess record.
 *
 * Throws:
 *   Error("Unauthorized") when no Clerk identity is attached to the request.
 *
 * Edge cases:
 *   Called after a purchase or restore so the UI does not have to wait for the
 *   provider webhook to land.
 */
export const refreshAccess = mutationGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireUserId(ctx);
    const now = nowIso();
    const grants = await listGrants(ctx.db, userId);
    const refreshed = await expireLapsedGrants(ctx.db, grants, now);
    return resolveAccess(refreshed, now);
  },
});

/**
 * Pulls current RevenueCat state for the signed-in user and stores the grant.
 *
 * Returns:
 *   The user's PlusAccess after the RevenueCat grant has been written.
 *
 * Throws:
 *   Error("Unauthorized") when signed out, and an error when RevenueCat is
 *   unreachable or REVENUECAT_SECRET_API_KEY is unset.
 *
 * Edge cases:
 *   Call this straight after a purchase or restore. The RevenueCat webhook is
 *   authoritative but can lag by seconds, and until it lands the stored grants
 *   still say Free, which would leave `requirePlus` rejecting a user who has
 *   just paid. Ordering is keyed on RevenueCat's own `request_date`, so this
 *   and the webhook can race safely in either direction.
 */
export const syncRevenueCat = actionGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireUserId(ctx);
    const { subscriber, requestedAt } = await fetchSubscriberState(
      userId,
      nowIso()
    );
    const grant = resolveGrantFromSubscriber(subscriber, userId, nowIso());

    await ctx.runMutation(anyApi.billing.applyGrant, {
      userId,
      provider: "revenuecat",
      status: grant.status,
      productId: grant.productId,
      providerRecordId: grant.providerRecordId,
      expiresAt: grant.expiresAt,
      providerUpdatedAt: requestedAt,
    });

    return ctx.runMutation(anyApi.billing.refreshAccessForUser, { userId });
  },
});

/**
 * Re-derives access for an arbitrary user, expiring lapsed grants first.
 *
 * Params:
 *   userId: Clerk user ID.
 *
 * Returns:
 *   The refreshed PlusAccess record.
 *
 * Edge cases:
 *   Internal counterpart to `refreshAccess`, for actions that have already
 *   authenticated the caller and cannot read the identity from a mutation.
 */
export const refreshAccessForUser = internalMutationGeneric({
  args: {
    userId: v.string(),
  },
  handler: async (ctx: any, args: { userId: string }) => {
    const now = nowIso();
    const grants = await listGrants(ctx.db, args.userId);
    const refreshed = await expireLapsedGrants(ctx.db, grants, now);
    return resolveAccess(refreshed, now);
  },
});

/**
 * Records the RevenueCat app user ID for the signed-in user.
 *
 * Params:
 *   revenueCatAppUserId: The ID the client configured RevenueCat with. This is
 *     the Clerk user ID; storing it makes webhook reconciliation auditable.
 *
 * Returns:
 *   `{ success: true }`.
 *
 * Throws:
 *   Error("Unauthorized") when no Clerk identity is attached to the request.
 *   Error when the supplied ID does not match the caller's Clerk user ID.
 */
export const linkRevenueCatAccount = mutationGeneric({
  args: {
    revenueCatAppUserId: v.string(),
  },
  handler: async (ctx: any, args: { revenueCatAppUserId: string }) => {
    const userId = await requireUserId(ctx);

    if (args.revenueCatAppUserId !== userId) {
      throw new Error(
        "RevenueCat app user ID must match the signed-in Clerk user ID"
      );
    }

    await upsertBillingAccount(ctx.db, userId, {
      revenueCatAppUserId: args.revenueCatAppUserId,
    });

    return { success: true };
  },
});

/** Provider state a webhook or link flow wants written to a grant row. */
export interface ApplyGrantArgs {
  userId: string;
  provider: string;
  status: string;
  productId?: string;
  providerRecordId: string;
  expiresAt?: string;
  providerUpdatedAt: string;
}

/** Outcome of a grant write, distinguishing ignored stale updates. */
export interface ApplyGrantResult {
  applied: boolean;
  reason: "created" | "updated" | "stale";
}

/**
 * Creates or updates a single provider's grant, ignoring stale updates.
 *
 * Params:
 *   db: Convex database handle.
 *   args: Provider state to write.
 *
 * Returns:
 *   `{ applied, reason }` where `applied` is false for ignored stale updates.
 *
 * Edge cases:
 *   Webhooks can be redelivered and can arrive out of order, so any update
 *   whose providerUpdatedAt is not newer than the stored value is discarded.
 *   Only the row for `args.provider` is touched; other providers are untouched.
 */
export async function applyProviderGrant(
  db: BillingDb,
  args: ApplyGrantArgs
): Promise<ApplyGrantResult> {
  const provider = toBillingProviderId(args.provider);
  const status = toGrantStatus(args.status);
  const existing = await findProviderGrant(db, args.userId, provider);

  if (
    existing &&
    isStaleProviderUpdate(existing.providerUpdatedAt, args.providerUpdatedAt)
  ) {
    return { applied: false, reason: "stale" };
  }

  const doc = {
    userId: args.userId,
    entitlement: PLUS_ENTITLEMENT,
    provider,
    status,
    productId: args.productId,
    providerRecordId: args.providerRecordId,
    expiresAt: args.expiresAt,
    providerUpdatedAt: args.providerUpdatedAt,
  };

  if (existing) {
    await db.patch(existing._id, doc);
    return { applied: true, reason: "updated" };
  }

  await db.insert("entitlementGrants", doc);
  return { applied: true, reason: "created" };
}

/**
 * Internal mutation wrapper around {@link applyProviderGrant}.
 *
 * Returns:
 *   `{ applied, reason }` from the underlying write.
 */
export const applyGrant = internalMutationGeneric({
  args: {
    userId: v.string(),
    provider: v.string(),
    status: v.string(),
    productId: v.optional(v.string()),
    providerRecordId: v.string(),
    expiresAt: v.optional(v.string()),
    providerUpdatedAt: v.string(),
  },
  handler: async (ctx: any, args: ApplyGrantArgs) =>
    applyProviderGrant(ctx.db, args),
});

/**
 * Grants or revokes Plus manually, for support and comped accounts.
 *
 * Params:
 *   userId: Clerk user ID to grant.
 *   status: Grant status to store.
 *   expiresAt: Optional ISO expiry; omit for an open-ended grant.
 *   note: Free-text reason stored as the provider record ID for auditing.
 *
 * Returns:
 *   `{ applied, reason }` from the underlying grant write.
 *
 * Edge cases:
 *   Internal-only, so it is callable from the Convex dashboard but never from
 *   the app. Uses the current time as providerUpdatedAt so a manual grant
 *   always wins over an earlier manual grant.
 */
export const setManualGrant = internalMutationGeneric({
  args: {
    userId: v.string(),
    status: v.string(),
    expiresAt: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (
    ctx: any,
    args: {
      userId: string;
      status: string;
      expiresAt?: string;
      note?: string;
    }
  ) => {
    const existing = await findProviderGrant(ctx.db, args.userId, "manual");
    const doc = {
      userId: args.userId,
      entitlement: PLUS_ENTITLEMENT,
      provider: "manual" as const,
      status: toGrantStatus(args.status),
      productId: undefined,
      providerRecordId: args.note ?? "manual",
      expiresAt: args.expiresAt,
      providerUpdatedAt: nowIso(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return { applied: true, reason: "updated" as const };
    }

    await ctx.db.insert("entitlementGrants", doc);
    return { applied: true, reason: "created" as const };
  },
});

/**
 * Resolves the Clerk user ID behind a RevenueCat app user ID.
 *
 * Params:
 *   appUserId: The RevenueCat app_user_id from a webhook payload.
 *
 * Returns:
 *   The Clerk user ID, or null when the ID is anonymous or unknown.
 *
 * Edge cases:
 *   RevenueCat is always configured with the Clerk user ID, so the mapping is
 *   the identity function. Anonymous IDs ($RCAnonymousID:...) are rejected
 *   because v1 requires login before purchase.
 */
export const resolveUserForRevenueCat = internalQueryGeneric({
  args: {
    appUserId: v.string(),
  },
  handler: async (_ctx: any, args: { appUserId: string }) => {
    if (args.appUserId.startsWith("$RCAnonymousID:")) {
      return null;
    }

    return args.appUserId;
  },
});

/** Identity of an inbound provider webhook delivery. */
export interface WebhookEventArgs {
  provider: string;
  eventId: string;
  eventType: string;
}

/**
 * Claims a webhook event for processing, deduplicating redeliveries.
 *
 * Params:
 *   db: Convex database handle.
 *   args: Provider, event ID, and event type from the delivery.
 *
 * Returns:
 *   `{ alreadyProcessed }`. When true the caller must acknowledge with 200 and
 *   do nothing else.
 *
 * Edge cases:
 *   An event previously recorded but left in "received" (a crashed run) is
 *   retried rather than skipped.
 */
export async function claimWebhookEvent(
  db: BillingDb,
  args: WebhookEventArgs
): Promise<{ alreadyProcessed: boolean }> {
  const existing = await db
    .query("billingEvents")
    .withIndex("by_provider_and_eventId", (q: any) =>
      q.eq("provider", args.provider).eq("eventId", args.eventId)
    )
    .first();

  if (existing && existing.status === "processed") {
    return { alreadyProcessed: true };
  }

  if (existing) {
    await db.patch(existing._id, {
      eventType: args.eventType,
      receivedAt: nowIso(),
      status: "received",
    });
    return { alreadyProcessed: false };
  }

  await db.insert("billingEvents", {
    provider: args.provider,
    eventId: args.eventId,
    eventType: args.eventType,
    receivedAt: nowIso(),
    status: "received",
  });

  return { alreadyProcessed: false };
}

/**
 * Internal mutation wrapper around {@link claimWebhookEvent}.
 *
 * Returns:
 *   `{ alreadyProcessed }` for the delivery.
 */
export const beginWebhookEvent = internalMutationGeneric({
  args: {
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
  },
  handler: async (ctx: any, args: WebhookEventArgs) =>
    claimWebhookEvent(ctx.db, args),
});

/**
 * Records the terminal outcome of a webhook event.
 *
 * Params:
 *   provider: Provider that sent the webhook.
 *   eventId: Provider-side unique event ID.
 *   status: "processed" | "ignored" | "failed".
 *   error: Failure detail, when status is "failed".
 *
 * Returns:
 *   `{ success: boolean }` — false when the event row is missing.
 */
export const completeWebhookEvent = internalMutationGeneric({
  args: {
    provider: v.string(),
    eventId: v.string(),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (
    ctx: any,
    args: {
      provider: string;
      eventId: string;
      status: string;
      error?: string;
    }
  ) => {
    const existing = await ctx.db
      .query("billingEvents")
      .withIndex("by_provider_and_eventId", (q: any) =>
        q.eq("provider", args.provider).eq("eventId", args.eventId)
      )
      .first();

    if (!existing) {
      return { success: false };
    }

    await ctx.db.patch(existing._id, {
      status: args.status,
      error: args.error,
      processedAt: nowIso(),
    });

    return { success: true };
  },
});

/**
 * Returns the access record for an arbitrary user, for internal callers.
 *
 * Params:
 *   userId: Clerk user ID.
 *
 * Returns:
 *   PlusAccess for that user, or the empty Free record when they have no
 *   grants.
 */
export const getAccessForUser = internalQueryGeneric({
  args: {
    userId: v.string(),
  },
  handler: async (ctx: any, args: { userId: string }) => {
    const grants = await listGrants(ctx.db, args.userId);
    return grants.length === 0
      ? emptyAccess()
      : resolveAccess(grants, nowIso());
  },
});

/**
 * Resolves the Clerk user ID linked to a Whop user.
 *
 * Params:
 *   whopUserId: Whop user ID from a webhook payload.
 *
 * Returns:
 *   The linked Clerk user ID, or null when the Whop account has never been
 *   connected.
 *
 * Edge cases:
 *   Returning null is expected and normal: someone can buy on Whop before
 *   installing the app. The webhook records the event and does nothing until
 *   they connect.
 */
export const resolveUserForWhop = internalQueryGeneric({
  args: {
    whopUserId: v.string(),
  },
  handler: async (ctx: any, args: { whopUserId: string }) => {
    const account = await ctx.db
      .query("billingAccounts")
      .withIndex("by_whopUserId", (q: any) =>
        q.eq("whopUserId", args.whopUserId)
      )
      .first();

    return account?.userId ?? null;
  },
});

/**
 * Links a verified Whop account to a Clerk user and records its grant.
 *
 * Params:
 *   userId: Clerk user ID performing the connection.
 *   whopUserId: Verified Whop user ID from the OAuth exchange.
 *   membershipId: Whop membership ID, when the user has one.
 *   status: Grant status derived from the membership.
 *   productId: Whop product the membership belongs to.
 *   expiresAt: ISO period end, omitted for non-expiring memberships.
 *
 * Returns:
 *   The user's refreshed PlusAccess.
 *
 * Throws:
 *   Error when the Whop account is already linked to a different Clerk user.
 *
 * Edge cases:
 *   Re-linking the same Whop account to the same Clerk user is allowed and
 *   simply refreshes the grant.
 */
export const linkWhopAccount = internalMutationGeneric({
  args: {
    userId: v.string(),
    whopUserId: v.string(),
    membershipId: v.optional(v.string()),
    status: v.string(),
    productId: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (
    ctx: any,
    args: {
      userId: string;
      whopUserId: string;
      membershipId?: string;
      status: string;
      productId?: string;
      expiresAt?: string;
    }
  ) => {
    const conflicting = await ctx.db
      .query("billingAccounts")
      .withIndex("by_whopUserId", (q: any) =>
        q.eq("whopUserId", args.whopUserId)
      )
      .first();

    if (conflicting && conflicting.userId !== args.userId) {
      throw new Error(
        "This Whop account is already connected to a different Nof1 account."
      );
    }

    await upsertBillingAccount(ctx.db, args.userId, {
      whopUserId: args.whopUserId,
      whopMembershipId: args.membershipId,
    });

    const existing = await findProviderGrant(ctx.db, args.userId, "whop");
    const doc = {
      userId: args.userId,
      entitlement: PLUS_ENTITLEMENT,
      provider: "whop" as const,
      status: toGrantStatus(args.status),
      productId: args.productId,
      providerRecordId: args.membershipId ?? args.whopUserId,
      expiresAt: args.expiresAt,
      providerUpdatedAt: nowIso(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("entitlementGrants", doc);
    }

    const grants = await listGrants(ctx.db, args.userId);
    return resolveAccess(grants, nowIso());
  },
});

/**
 * Connects the signed-in user's Whop account after an OAuth redirect.
 *
 * Params:
 *   code: Authorization code returned to nof1://oauth/whop.
 *   codeVerifier: PKCE verifier the client generated for this request.
 *   redirectUri: The exact redirect URI the client used.
 *
 * Returns:
 *   `{ connected: true, access }` when a membership was found, or
 *   `{ connected: false, reason }` when the Whop account has no membership to
 *   the configured product.
 *
 * Throws:
 *   Error("Unauthorized") when signed out, and an error when the Whop account
 *   is already linked to a different Nof1 account or when Whop rejects the
 *   exchange.
 *
 * Edge cases:
 *   Runs entirely server-side: the app never sees the Whop app secret or the
 *   user's Whop access token. Membership is verified with the server
 *   credential rather than trusting anything the client sent.
 */
export const connectWhop = actionGeneric({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
    redirectUri: v.string(),
  },
  handler: async (
    ctx: any,
    args: { code: string; codeVerifier: string; redirectUri: string }
  ) => {
    const userId = await requireUserId(ctx);
    const accessToken = await exchangeWhopCode(
      args.code,
      args.codeVerifier,
      args.redirectUri
    );
    const whopUserId = await fetchWhopUserId(accessToken);
    const memberships = await fetchWhopMemberships(whopUserId);
    const grant = resolveGrantFromMemberships(
      memberships,
      requireWhopPlusProductId()
    );

    if (!grant) {
      return {
        connected: false as const,
        reason:
          "That Whop account has no Nof1 Plus Community membership. Purchase on Whop, then connect again.",
      };
    }

    const access = await ctx.runMutation(anyApi.billing.linkWhopAccount, {
      userId,
      whopUserId,
      membershipId: grant.providerRecordId,
      status: grant.status,
      productId: grant.productId,
      expiresAt: grant.expiresAt,
    });

    return { connected: true as const, access };
  },
});

/**
 * Disconnects the signed-in user's Whop account.
 *
 * Returns:
 *   The user's refreshed PlusAccess.
 *
 * Throws:
 *   Error("Unauthorized") when no Clerk identity is attached to the request.
 *
 * Edge cases:
 *   Revokes only the Whop grant. A RevenueCat subscription is untouched, and
 *   disconnecting here does not cancel anything on Whop's side.
 */
export const disconnectWhop = mutationGeneric({
  args: {},
  handler: async (ctx: any) => {
    const userId = await requireUserId(ctx);
    const account = await ctx.db
      .query("billingAccounts")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();

    if (account) {
      await ctx.db.patch(account._id, {
        whopUserId: undefined,
        whopMembershipId: undefined,
        updatedAt: nowIso(),
      });
    }

    const existing = await findProviderGrant(ctx.db, userId, "whop");

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "revoked",
        providerUpdatedAt: nowIso(),
      });
    }

    const grants = await listGrants(ctx.db, userId);
    return resolveAccess(grants, nowIso());
  },
});
