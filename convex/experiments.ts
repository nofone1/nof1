import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { nowIso, requireUserId, toIso } from "./_auth";

function normalizeSchedule(schedule: unknown): {
  startDate: string;
  endDate?: string;
  phaseDurationDays: number;
  totalPhases: number;
  reminderTime?: string;
} {
  const input =
    schedule && typeof schedule === "object"
      ? (schedule as Record<string, unknown>)
      : {};

  const normalized = {
    startDate: toIso(input.startDate),
    phaseDurationDays:
      typeof input.phaseDurationDays === "number" ? input.phaseDurationDays : 7,
    totalPhases: typeof input.totalPhases === "number" ? input.totalPhases : 4,
  } as {
    startDate: string;
    endDate?: string;
    phaseDurationDays: number;
    totalPhases: number;
    reminderTime?: string;
  };

  if (input.endDate) {
    normalized.endDate = toIso(input.endDate);
  }

  if (typeof input.reminderTime === "string") {
    normalized.reminderTime = input.reminderTime;
  }

  return normalized;
}

function normalizeEntry(entry: unknown, experimentId: string) {
  const input =
    entry && typeof entry === "object"
      ? (entry as Record<string, unknown>)
      : {};

  return {
    id:
      typeof input.id === "string"
        ? input.id
        : `entry-${Date.now()}-${Math.random()}`,
    experimentId,
    date: toIso(input.date),
    isInterventionDay:
      typeof input.isInterventionDay === "boolean"
        ? input.isInterventionDay
        : true,
    metricValues: Array.isArray(input.metricValues) ? input.metricValues : [],
    notes: typeof input.notes === "string" ? input.notes : undefined,
    createdAt: toIso(input.createdAt),
  };
}

function stripInternal<T extends Record<string, unknown>>(doc: T) {
  const { _id, _creationTime, ...rest } = doc;
  return rest;
}

async function findExperiment(ctx: any, userId: string, id: string) {
  const docs = await ctx.db.query("experiments").withIndex("by_userId_and_id").collect();
  return docs.find((doc: any) => doc.userId === userId && doc.id === id) ?? null;
}

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const docs = await ctx.db.query("experiments").withIndex("by_userId").collect();

    return docs
      .filter((doc: any) => doc.userId === userId)
      .map((doc: any) => stripInternal(doc))
      .sort((a: any, b: any) => b.updatedAt.localeCompare(a.updatedAt));
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

    const id =
      typeof input.id === "string"
        ? input.id
        : `exp-${Date.now()}-${Math.random()}`;
    const existing = await findExperiment(ctx, userId, id);

    const now = nowIso();
    const doc = {
      userId,
      id,
      name: typeof input.name === "string" ? input.name : "Untitled Experiment",
      hypothesis: typeof input.hypothesis === "string" ? input.hypothesis : "",
      intervention:
        input.intervention && typeof input.intervention === "object"
          ? input.intervention
          : {},
      metrics: Array.isArray(input.metrics) ? input.metrics : [],
      schedule: normalizeSchedule(input.schedule),
      status: typeof input.status === "string" ? input.status : "draft",
      entries: Array.isArray(input.entries)
        ? input.entries.map((entry) => normalizeEntry(entry, id))
        : [],
      createdAt: existing?.createdAt ?? toIso(input.createdAt, now),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return doc;
    }

    await ctx.db.insert("experiments", doc);
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
    const existing = await findExperiment(ctx, userId, args.id);

    if (!existing) {
      throw new Error("Experiment not found");
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

    if (updates.schedule) {
      updates.schedule = normalizeSchedule({
        ...existing.schedule,
        ...(updates.schedule as Record<string, unknown>),
      });
    }

    if (Array.isArray(updates.entries)) {
      updates.entries = updates.entries.map((entry) =>
        normalizeEntry(entry, args.id)
      );
    }

    const patched = {
      ...updates,
      updatedAt: nowIso(),
    };

    await ctx.db.patch(existing._id, patched);

    return {
      ...stripInternal(existing),
      ...patched,
    };
  },
});

export const remove = mutationGeneric({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findExperiment(ctx, userId, args.id);

    if (!existing) {
      return { success: false };
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const addEntry = mutationGeneric({
  args: {
    experimentId: v.string(),
    entry: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await findExperiment(ctx, userId, args.experimentId);

    if (!existing) {
      throw new Error("Experiment not found");
    }

    const newEntry = normalizeEntry(args.entry, args.experimentId);
    const entries = [...existing.entries, newEntry];

    await ctx.db.patch(existing._id, {
      entries,
      updatedAt: nowIso(),
    });

    return newEntry;
  },
});
