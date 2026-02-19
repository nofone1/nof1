import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { nowIso, requireUserId, toIso } from "./_auth";

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

async function findMigrationState(ctx: any, userId: string, version: number) {
  const states = await ctx.db.query("migrationState").withIndex("by_userId_and_version").collect();
  return states.find((state: any) => state.userId === userId && state.version === version) ?? null;
}

async function findByUserAndId(
  ctx: any,
  table: "experiments" | "protocols" | "doses" | "metrics" | "stackItems",
  userId: string,
  id: string
) {
  const docs = await ctx.db.query(table).withIndex("by_userId_and_id").collect();
  return docs.find((doc: any) => doc.userId === userId && doc.id === id) ?? null;
}

export const getMigrationState = queryGeneric({
  args: {
    version: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (typeof args.version === "number") {
      const state = await findMigrationState(ctx, userId, args.version as number);

      if (!state) {
        return null;
      }

      const { _id, _creationTime, ...rest } = state;
      return rest;
    }

    const states = await ctx.db.query("migrationState").withIndex("by_userId").collect();

    return states
      .filter((state: any) => state.userId === userId)
      .map(({ _id, _creationTime, ...rest }: any) => rest)
      .sort((a: any, b: any) => b.version - a.version);
  },
});

export const importLocalCoreData = mutationGeneric({
  args: {
    payload: v.any(),
    version: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const version = typeof args.version === "number" ? args.version : 1;

    const existingState = await findMigrationState(ctx, userId, version);

    if (existingState) {
      return {
        skipped: true,
        version,
        counts: existingState.counts,
      };
    }

    const payload =
      args.payload && typeof args.payload === "object"
        ? (args.payload as Record<string, unknown>)
        : {};

    const counts = {
      experiments: 0,
      protocols: 0,
      doses: 0,
      metrics: 0,
      stack: 0,
    };

    for (const raw of asArray(payload.experiments)) {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id = typeof item.id === "string" ? item.id : `exp-${Date.now()}-${Math.random()}`;

      const existing = await findByUserAndId(ctx, "experiments", userId, id);

      const doc = {
        userId,
        id,
        name: typeof item.name === "string" ? item.name : "Untitled Experiment",
        hypothesis: typeof item.hypothesis === "string" ? item.hypothesis : "",
        intervention:
          item.intervention && typeof item.intervention === "object"
            ? item.intervention
            : {},
        metrics: asArray(item.metrics),
        schedule:
          item.schedule && typeof item.schedule === "object"
            ? {
                ...(item.schedule as Record<string, unknown>),
                startDate: toIso((item.schedule as Record<string, unknown>).startDate),
                endDate: (item.schedule as Record<string, unknown>).endDate
                  ? toIso((item.schedule as Record<string, unknown>).endDate)
                  : undefined,
              }
            : {
                startDate: nowIso(),
                phaseDurationDays: 7,
                totalPhases: 4,
              },
        status: typeof item.status === "string" ? item.status : "draft",
        entries: asArray(item.entries).map((entry) => {
          const value =
            entry && typeof entry === "object"
              ? (entry as Record<string, unknown>)
              : {};
          return {
            ...value,
            id:
              typeof value.id === "string"
                ? value.id
                : `entry-${Date.now()}-${Math.random()}`,
            experimentId: id,
            date: toIso(value.date),
            createdAt: toIso(value.createdAt),
            metricValues: asArray(value.metricValues),
          };
        }),
        createdAt: toIso(item.createdAt),
        updatedAt: toIso(item.updatedAt),
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("experiments", doc);
      }

      counts.experiments += 1;
    }

    for (const raw of asArray(payload.protocols)) {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id =
        typeof item.id === "string"
          ? item.id
          : `protocol-${Date.now()}-${Math.random()}`;

      const existing = await findByUserAndId(ctx, "protocols", userId, id);

      const doc = {
        userId,
        id,
        name: typeof item.name === "string" ? item.name : "Untitled Protocol",
        peptideId: typeof item.peptideId === "string" ? item.peptideId : undefined,
        peptideName: typeof item.peptideName === "string" ? item.peptideName : "Custom",
        dosage: typeof item.dosage === "string" ? item.dosage : "",
        frequency: typeof item.frequency === "string" ? item.frequency : "Once daily",
        route: typeof item.route === "string" ? item.route : "Subcutaneous",
        cycleDuration:
          typeof item.cycleDuration === "string" ? item.cycleDuration : "4 weeks",
        startDate: toIso(item.startDate),
        endDate: item.endDate ? toIso(item.endDate) : undefined,
        isActive: typeof item.isActive === "boolean" ? item.isActive : true,
        notes: typeof item.notes === "string" ? item.notes : undefined,
        adherence: asArray(item.adherence),
        createdAt: toIso(item.createdAt),
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("protocols", doc);
      }

      counts.protocols += 1;
    }

    for (const raw of asArray(payload.doses)) {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id = typeof item.id === "string" ? item.id : `dose-${Date.now()}-${Math.random()}`;

      const existing = await findByUserAndId(ctx, "doses", userId, id);

      const doc = {
        userId,
        id,
        peptideId: typeof item.peptideId === "string" ? item.peptideId : null,
        name: typeof item.name === "string" ? item.name : "",
        dosage: typeof item.dosage === "string" ? item.dosage : "",
        timestamp: toIso(item.timestamp),
        notes: typeof item.notes === "string" ? item.notes : undefined,
        injectionSite:
          typeof item.injectionSite === "string" ? item.injectionSite : undefined,
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("doses", doc);
      }

      counts.doses += 1;
    }

    for (const raw of asArray(payload.metrics)) {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id =
        typeof item.id === "string"
          ? item.id
          : `metric-${Date.now()}-${Math.random()}`;

      const existing = await findByUserAndId(ctx, "metrics", userId, id);

      const doc = {
        userId,
        id,
        metricType: typeof item.metricType === "string" ? item.metricType : "custom",
        customName: typeof item.customName === "string" ? item.customName : undefined,
        value: typeof item.value === "number" ? item.value : 0,
        timestamp: toIso(item.timestamp),
        notes: typeof item.notes === "string" ? item.notes : undefined,
        unit: typeof item.unit === "string" ? item.unit : undefined,
        numericValue:
          typeof item.numericValue === "number" ? item.numericValue : undefined,
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("metrics", doc);
      }

      counts.metrics += 1;
    }

    for (const raw of asArray(payload.stack)) {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id =
        typeof item.id === "string"
          ? item.id
          : `stack-${Date.now()}-${Math.random()}`;

      const existing = await findByUserAndId(ctx, "stackItems", userId, id);

      const doc = {
        userId,
        id,
        peptideId: typeof item.peptideId === "string" ? item.peptideId : null,
        name: typeof item.name === "string" ? item.name : "",
        dosage: typeof item.dosage === "string" ? item.dosage : "",
        frequency:
          typeof item.frequency === "string" ? item.frequency : "Once daily",
        timeOfDay: typeof item.timeOfDay === "string" ? item.timeOfDay : undefined,
        isActive: typeof item.isActive === "boolean" ? item.isActive : true,
        addedAt: toIso(item.addedAt),
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("stackItems", doc);
      }

      counts.stack += 1;
    }

    await ctx.db.insert("migrationState", {
      userId,
      version,
      importedAt: nowIso(),
      counts,
    });

    return {
      skipped: false,
      version,
      counts,
    };
  },
});
