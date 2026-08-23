import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  experiments: defineTable({
    userId: v.string(),
    id: v.string(),
    name: v.string(),
    hypothesis: v.string(),
    intervention: v.any(),
    metrics: v.array(v.any()),
    schedule: v.any(),
    status: v.string(),
    entries: v.array(v.any()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),

  protocols: defineTable({
    userId: v.string(),
    id: v.string(),
    name: v.string(),
    peptideId: v.optional(v.string()),
    peptideName: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    route: v.string(),
    cycleDuration: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    adherence: v.array(v.any()),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),

  doses: defineTable({
    userId: v.string(),
    id: v.string(),
    peptideId: v.union(v.string(), v.null()),
    name: v.string(),
    dosage: v.string(),
    timestamp: v.string(),
    notes: v.optional(v.string()),
    injectionSite: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),

  metrics: defineTable({
    userId: v.string(),
    id: v.string(),
    metricType: v.string(),
    customName: v.optional(v.string()),
    value: v.number(),
    timestamp: v.string(),
    notes: v.optional(v.string()),
    unit: v.optional(v.string()),
    numericValue: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),

  stackItems: defineTable({
    userId: v.string(),
    id: v.string(),
    peptideId: v.union(v.string(), v.null()),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    timeOfDay: v.optional(v.string()),
    isActive: v.boolean(),
    addedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),

  migrationState: defineTable({
    userId: v.string(),
    version: v.number(),
    importedAt: v.string(),
    counts: v.any(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_version", ["userId", "version"]),

  // Maps a Clerk user to their identifiers at each billing provider.
  billingAccounts: defineTable({
    userId: v.string(),
    revenueCatAppUserId: v.optional(v.string()),
    whopUserId: v.optional(v.string()),
    whopMembershipId: v.optional(v.string()),
    updatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_whopUserId", ["whopUserId"]),

  // One row per (userId, provider). Providers never overwrite each other.
  entitlementGrants: defineTable({
    userId: v.string(),
    entitlement: v.string(),
    provider: v.string(),
    status: v.string(),
    productId: v.optional(v.string()),
    providerRecordId: v.string(),
    expiresAt: v.optional(v.string()),
    providerUpdatedAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_provider", ["userId", "provider"]),

  // Webhook receipt log used for idempotency across redelivered events.
  billingEvents: defineTable({
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    receivedAt: v.string(),
    processedAt: v.optional(v.string()),
    status: v.string(),
    error: v.optional(v.string()),
  }).index("by_provider_and_eventId", ["provider", "eventId"]),
});
