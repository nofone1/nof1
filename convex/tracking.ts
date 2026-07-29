import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { nowIso, requireUserId, toIso } from "./_auth";

function stripInternal<T extends Record<string, unknown>>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}

async function findByUserAndId(
  ctx: any,
  table: "doses" | "metrics" | "stackItems",
  userId: string,
  id: string
) {
  const docs = await ctx.db.query(table).withIndex("by_userId_and_id").collect();
  return docs.find((doc: any) => doc.userId === userId && doc.id === id) ?? null;
}

export const getAll = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const [doses, metrics, stack] = await Promise.all([
      ctx.db.query("doses").withIndex("by_userId").collect(),
      ctx.db.query("metrics").withIndex("by_userId").collect(),
      ctx.db.query("stackItems").withIndex("by_userId").collect(),
    ]);

    return {
      doses: doses
        .filter((doc: any) => doc.userId === userId)
        .map((doc: any) => stripInternal(doc))
        .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp)),
      metrics: metrics
        .filter((doc: any) => doc.userId === userId)
        .map((doc: any) => stripInternal(doc))
        .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp)),
      stack: stack
        .filter((doc: any) => doc.userId === userId)
        .map((doc: any) => stripInternal(doc))
        .sort((a: any, b: any) => b.addedAt.localeCompare(a.addedAt)),
    };
  },
});

export const logDose = mutationGeneric({
  args: {
    entry: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const entry =
      args.entry && typeof args.entry === "object"
        ? (args.entry as Record<string, unknown>)
        : {};

    const id =
      typeof entry.id === "string"
        ? entry.id
        : `dose-${Date.now()}-${Math.random()}`;
    const doc = {
      userId,
      id,
      peptideId: typeof entry.peptideId === "string" ? entry.peptideId : null,
      name: typeof entry.name === "string" ? entry.name : "",
      dosage: typeof entry.dosage === "string" ? entry.dosage : "",
      timestamp: toIso(entry.timestamp),
      notes: typeof entry.notes === "string" ? entry.notes : undefined,
      injectionSite:
        typeof entry.injectionSite === "string" ? entry.injectionSite : undefined,
    };

    await ctx.db.insert("doses", doc);
    return doc;
  },
});

export const logMetric = mutationGeneric({
  args: {
    entry: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const entry =
      args.entry && typeof args.entry === "object"
        ? (args.entry as Record<string, unknown>)
        : {};

    const id =
      typeof entry.id === "string"
        ? entry.id
        : `metric-${Date.now()}-${Math.random()}`;

    const doc = {
      userId,
      id,
      metricType: typeof entry.metricType === "string" ? entry.metricType : "custom",
      customName:
        typeof entry.customName === "string" ? entry.customName : undefined,
      value: typeof entry.value === "number" ? entry.value : 0,
      timestamp: toIso(entry.timestamp),
      notes: typeof entry.notes === "string" ? entry.notes : undefined,
      unit: typeof entry.unit === "string" ? entry.unit : undefined,
      numericValue:
        typeof entry.numericValue === "number" ? entry.numericValue : undefined,
    };

    await ctx.db.insert("metrics", doc);
    return doc;
  },
});

export const addToStack = mutationGeneric({
  args: {
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const input =
      args.input && typeof args.input === "object"
        ? (args.input as Record<string, unknown>)
        : {};

    const id =
      typeof input.id === "string"
        ? input.id
        : `stack-${Date.now()}-${Math.random()}`;

    const existing = await findByUserAndId(ctx, "stackItems", userId, id);

    const now = nowIso();
    const doc = {
      userId,
      id,
      peptideId: typeof input.peptideId === "string" ? input.peptideId : null,
      name: typeof input.name === "string" ? input.name : "",
      dosage: typeof input.dosage === "string" ? input.dosage : "",
      frequency:
        typeof input.frequency === "string" ? input.frequency : "Once daily",
      timeOfDay:
        typeof input.timeOfDay === "string" ? input.timeOfDay : undefined,
      isActive: typeof input.isActive === "boolean" ? input.isActive : true,
      addedAt: toIso(input.addedAt, now),
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return doc;
    }

    await ctx.db.insert("stackItems", doc);
    return doc;
  },
});

export const removeFromStack = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findByUserAndId(ctx, "stackItems", userId, args.id);

    if (!existing) {
      return { success: false };
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const toggleStackItem = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findByUserAndId(ctx, "stackItems", userId, args.id);

    if (!existing) {
      throw new Error("Stack item not found");
    }

    const isActive = !existing.isActive;
    await ctx.db.patch(existing._id, { isActive });

    return {
      ...stripInternal(existing),
      isActive,
    };
  },
});

export const deleteDose = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findByUserAndId(ctx, "doses", userId, args.id);

    if (!existing) {
      return { success: false };
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const deleteMetric = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findByUserAndId(ctx, "metrics", userId, args.id);

    if (!existing) {
      return { success: false };
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});
