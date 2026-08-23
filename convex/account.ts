/** Account lifecycle mutations. */

import { mutationGeneric } from "convex/server";
import { requireUserId } from "./_auth";

/**
 * Permanently deletes every app-owned record associated with the caller.
 *
 * The client invokes this mutation before deleting the Clerk identity so the
 * authenticated user can remove their own synced health and billing data.
 * Provider transaction records may still be retained by Apple, Google,
 * RevenueCat, or Whop under their own legal obligations.
 */
export const deleteMyData = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    let deleted = 0;

    const experiments = await ctx.db
      .query("experiments")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of experiments) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const protocols = await ctx.db
      .query("protocols")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of protocols) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const doses = await ctx.db
      .query("doses")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of doses) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const metrics = await ctx.db
      .query("metrics")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of metrics) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const stackItems = await ctx.db
      .query("stackItems")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of stackItems) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const migrations = await ctx.db
      .query("migrationState")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of migrations) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const billingAccounts = await ctx.db
      .query("billingAccounts")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of billingAccounts) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    const grants = await ctx.db
      .query("entitlementGrants")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .collect();
    for (const record of grants) {
      await ctx.db.delete(record._id);
      deleted += 1;
    }

    return { deleted };
  },
});
