/**
 * Unit tests for the webhook-facing billing core.
 *
 * Providers redeliver webhooks and deliver them out of order, so these cover
 * the two properties that keep entitlements correct under both: deduplication
 * on (provider, eventId), and discarding grant writes that are not newer than
 * what is already stored.
 */

import {
  applyProviderGrant,
  claimWebhookEvent,
  type ApplyGrantArgs,
} from "../billing";
import { resolveAccess } from "../_billing";
import { FakeBillingDb } from "./fake-billing-db";

const USER_ID = "user_abc123";
const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-02-01T00:00:00.000Z";
const FAR_FUTURE = "2030-01-01T00:00:00.000Z";

/**
 * Builds grant arguments with sensible defaults for a RevenueCat subscription.
 *
 * Params:
 *   overrides: Fields to replace on the default active monthly grant.
 *
 * Returns:
 *   Arguments ready to pass to applyProviderGrant.
 */
function grantArgs(overrides: Partial<ApplyGrantArgs> = {}): ApplyGrantArgs {
  return {
    userId: USER_ID,
    provider: "revenuecat",
    status: "active",
    productId: "nof1_plus_monthly",
    providerRecordId: "sub_1",
    expiresAt: FAR_FUTURE,
    providerUpdatedAt: T1,
    ...overrides,
  };
}

describe("claimWebhookEvent", () => {
  it("claims an event the first time it is delivered", async () => {
    const db = new FakeBillingDb();

    const result = await claimWebhookEvent(db, {
      provider: "revenuecat",
      eventId: "evt_1",
      eventType: "INITIAL_PURCHASE",
    });

    expect(result.alreadyProcessed).toBe(false);
    expect(db.rows("billingEvents")).toHaveLength(1);
  });

  it("skips a redelivery of an event that already finished processing", async () => {
    const db = new FakeBillingDb();
    const event = {
      provider: "revenuecat",
      eventId: "evt_1",
      eventType: "INITIAL_PURCHASE",
    };

    await claimWebhookEvent(db, event);
    const [stored] = db.rows("billingEvents");
    await db.patch(stored._id, { status: "processed" });

    const redelivery = await claimWebhookEvent(db, event);

    expect(redelivery.alreadyProcessed).toBe(true);
    expect(db.rows("billingEvents")).toHaveLength(1);
  });

  it("retries an event whose previous run never completed", async () => {
    const db = new FakeBillingDb();
    const event = {
      provider: "whop",
      eventId: "evt_2",
      eventType: "membership.activated",
    };

    await claimWebhookEvent(db, event);
    const redelivery = await claimWebhookEvent(db, event);

    expect(redelivery.alreadyProcessed).toBe(false);
    expect(db.rows("billingEvents")).toHaveLength(1);
  });

  it("treats the same event ID from two providers as two events", async () => {
    const db = new FakeBillingDb();

    await claimWebhookEvent(db, {
      provider: "revenuecat",
      eventId: "shared",
      eventType: "RENEWAL",
    });
    const whop = await claimWebhookEvent(db, {
      provider: "whop",
      eventId: "shared",
      eventType: "payment.succeeded",
    });

    expect(whop.alreadyProcessed).toBe(false);
    expect(db.rows("billingEvents")).toHaveLength(2);
  });
});

describe("applyProviderGrant", () => {
  it("creates a grant on first delivery", async () => {
    const db = new FakeBillingDb();

    const result = await applyProviderGrant(db, grantArgs());

    expect(result).toEqual({ applied: true, reason: "created" });
    expect(db.rows("entitlementGrants")).toHaveLength(1);
  });

  it("updates the existing row rather than adding a second one", async () => {
    const db = new FakeBillingDb();

    await applyProviderGrant(db, grantArgs());
    const result = await applyProviderGrant(
      db,
      grantArgs({ status: "expired", providerUpdatedAt: T2 })
    );

    expect(result).toEqual({ applied: true, reason: "updated" });

    const rows = db.rows("entitlementGrants");
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("expired");
  });

  it("ignores a duplicate delivery carrying the same providerUpdatedAt", async () => {
    const db = new FakeBillingDb();

    await applyProviderGrant(db, grantArgs({ status: "expired" }));
    const duplicate = await applyProviderGrant(db, grantArgs({ status: "expired" }));

    expect(duplicate).toEqual({ applied: false, reason: "stale" });
    expect(db.rows("entitlementGrants")).toHaveLength(1);
  });

  it("ignores an out-of-order delivery that would resurrect an expired grant", async () => {
    const db = new FakeBillingDb();

    await applyProviderGrant(
      db,
      grantArgs({ status: "expired", providerUpdatedAt: T2 })
    );
    const late = await applyProviderGrant(
      db,
      grantArgs({ status: "active", providerUpdatedAt: T1 })
    );

    expect(late).toEqual({ applied: false, reason: "stale" });
    expect(db.rows("entitlementGrants")[0].status).toBe("expired");
  });

  it("keeps one row per provider so a Whop revocation leaves RevenueCat intact", async () => {
    const db = new FakeBillingDb();

    await applyProviderGrant(db, grantArgs());
    await applyProviderGrant(
      db,
      grantArgs({
        provider: "whop",
        providerRecordId: "mem_1",
        productId: "prod_plus_community",
      })
    );
    await applyProviderGrant(
      db,
      grantArgs({
        provider: "whop",
        providerRecordId: "mem_1",
        status: "revoked",
        providerUpdatedAt: T2,
      })
    );

    const rows = db.rows("entitlementGrants");
    expect(rows).toHaveLength(2);

    const access = resolveAccess(rows as never, T2);
    expect(access.hasPlus).toBe(true);
    expect(access.sources.map((source) => source.provider)).toEqual([
      "revenuecat",
    ]);
  });

  it("grants access from Whop alone once RevenueCat has expired", async () => {
    const db = new FakeBillingDb();

    await applyProviderGrant(
      db,
      grantArgs({ status: "expired", expiresAt: T2, providerUpdatedAt: T2 })
    );
    await applyProviderGrant(
      db,
      grantArgs({
        provider: "whop",
        providerRecordId: "mem_1",
        providerUpdatedAt: T2,
      })
    );

    const access = resolveAccess(db.rows("entitlementGrants") as never, T2);

    expect(access.hasPlus).toBe(true);
    expect(access.primarySource).toBe("whop");
    expect(access.hasMultipleActiveProviders).toBe(false);
  });

  it("flags a user paying through both providers", async () => {
    const db = new FakeBillingDb();

    await applyProviderGrant(db, grantArgs());
    await applyProviderGrant(
      db,
      grantArgs({ provider: "whop", providerRecordId: "mem_1" })
    );

    const access = resolveAccess(db.rows("entitlementGrants") as never, T1);

    expect(access.hasPlus).toBe(true);
    expect(access.hasMultipleActiveProviders).toBe(true);
  });
});
