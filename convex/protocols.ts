import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { requireUserId, toIso } from "./_auth";

function normalizeAdherence(adherence: unknown) {
  if (!Array.isArray(adherence)) {
    return [] as Array<{
      date: string;
      taken: boolean;
      skipped?: boolean;
      notes?: string;
    }>;
  }

  return adherence.map((entry) => {
    const item =
      entry && typeof entry === "object"
        ? (entry as Record<string, unknown>)
        : {};

    return {
      date: typeof item.date === "string" ? item.date : "",
      taken: typeof item.taken === "boolean" ? item.taken : false,
      skipped: typeof item.skipped === "boolean" ? item.skipped : undefined,
      notes: typeof item.notes === "string" ? item.notes : undefined,
    };
  });
}

function stripInternal<T extends Record<string, unknown>>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}

async function findProtocol(ctx: any, userId: string, id: string) {
  const docs = await ctx.db.query("protocols").withIndex("by_userId_and_id").collect();
  return docs.find((doc: any) => doc.userId === userId && doc.id === id) ?? null;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const docs = await ctx.db.query("protocols").withIndex("by_userId").collect();

    return docs
      .filter((doc: any) => doc.userId === userId)
      .map((doc: any) => stripInternal(doc))
      .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const create = mutationGeneric({
  args: {
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const input =
      args.input && typeof args.input === "object"
        ? (args.input as Record<string, unknown>)
        : {};

    const now = new Date().toISOString();
    const doc = {
      userId,
      id:
        typeof input.id === "string"
          ? input.id
          : `protocol-${Date.now()}-${Math.random()}`,
      name: typeof input.name === "string" ? input.name : "Untitled Protocol",
      peptideId:
        typeof input.peptideId === "string" ? input.peptideId : undefined,
      peptideName:
        typeof input.peptideName === "string" ? input.peptideName : "Custom",
      dosage: typeof input.dosage === "string" ? input.dosage : "",
      frequency:
        typeof input.frequency === "string" ? input.frequency : "Once daily",
      route: typeof input.route === "string" ? input.route : "Subcutaneous",
      cycleDuration:
        typeof input.cycleDuration === "string" ? input.cycleDuration : "4 weeks",
      startDate: toIso(input.startDate, now),
      endDate: input.endDate ? toIso(input.endDate) : undefined,
      isActive: typeof input.isActive === "boolean" ? input.isActive : true,
      notes: typeof input.notes === "string" ? input.notes : undefined,
      adherence: normalizeAdherence(input.adherence),
      createdAt: toIso(input.createdAt, now),
    };

    await ctx.db.insert("protocols", doc);
    return doc;
  },
});

export const update = mutationGeneric({
  args: {
    id: v.string(),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findProtocol(ctx, userId, args.id);

    if (!existing) {
      throw new Error("Protocol not found");
    }

    const updates =
      args.updates && typeof args.updates === "object"
        ? ({ ...(args.updates as Record<string, unknown>) } as Record<
            string,
            unknown
          >)
        : {};

    delete updates.userId;
    delete updates.id;
    delete updates.createdAt;

    if (updates.startDate) {
      updates.startDate = toIso(updates.startDate);
    }

    if (updates.endDate) {
      updates.endDate = toIso(updates.endDate);
    }

    if (updates.adherence) {
      updates.adherence = normalizeAdherence(updates.adherence);
    }

    await ctx.db.patch(existing._id, updates);

    return {
      ...stripInternal(existing),
      ...updates,
    };
  },
});

export const remove = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findProtocol(ctx, userId, args.id);

    if (!existing) {
      return { success: false };
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const toggleActive = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findProtocol(ctx, userId, args.id);

    if (!existing) {
      throw new Error("Protocol not found");
    }

    const isActive = !existing.isActive;
    await ctx.db.patch(existing._id, { isActive });

    return {
      ...stripInternal(existing),
      isActive,
    };
  },
});

export const logAdherence = mutationGeneric({
  args: {
    protocolId: v.string(),
    entry: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findProtocol(ctx, userId, args.protocolId);

    if (!existing) {
      throw new Error("Protocol not found");
    }

    const item =
      args.entry && typeof args.entry === "object"
        ? (args.entry as Record<string, unknown>)
        : {};

    const newEntry = {
      date: typeof item.date === "string" ? item.date : "",
      taken: typeof item.taken === "boolean" ? item.taken : false,
      skipped: typeof item.skipped === "boolean" ? item.skipped : undefined,
      notes: typeof item.notes === "string" ? item.notes : undefined,
    };

    const adherence = [...existing.adherence];
    const existingIndex = adherence.findIndex((a) => a.date === newEntry.date);

    if (existingIndex >= 0) {
      adherence[existingIndex] = newEntry;
    } else {
      adherence.push(newEntry);
    }

    await ctx.db.patch(existing._id, { adherence });

    return {
      ...stripInternal(existing),
      adherence,
    };
  },
});
