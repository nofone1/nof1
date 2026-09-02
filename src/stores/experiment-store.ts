import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Experiment,
  ExperimentEntry,
  CreateExperimentInput,
  CreateEntryInput,
  ExperimentStatus,
} from "@/types/experiment";
import { logger } from "@/services/logging";
import { STORAGE_KEYS } from "@/utils/constants";
import {
  convexMutation,
  convexQuery,
  isConvexConfigured,
} from "@/services/backend/convex-client";

const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
};

interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  isLoading: boolean;
  error: string | null;
}

interface ExperimentActions {
  loadExperiments: () => Promise<void>;
  createExperiment: (input: CreateExperimentInput) => Promise<Experiment>;
  updateExperiment: (id: string, updates: Partial<Experiment>) => Promise<void>;
  deleteExperiment: (id: string) => Promise<void>;
  setCurrentExperiment: (id: string | null) => void;
  addEntry: (experimentId: string, entry: CreateEntryInput) => Promise<void>;
  updateStatus: (id: string, status: ExperimentStatus) => Promise<void>;
  clearError: () => void;
}

type ExperimentStore = ExperimentState & ExperimentActions;

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(String(value));
}

function toIso(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function parseExperiment(raw: Record<string, any>): Experiment {
  return {
    ...(raw as Experiment),
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
    schedule: {
      ...raw.schedule,
      startDate: toDate(raw.schedule?.startDate),
      endDate: raw.schedule?.endDate ? toDate(raw.schedule.endDate) : undefined,
    },
    entries: Array.isArray(raw.entries)
      ? raw.entries.map((entry: Record<string, any>) => ({
          ...(entry as ExperimentEntry),
          date: toDate(entry.date),
          createdAt: toDate(entry.createdAt),
        }))
      : [],
  };
}

function serializeExperimentInput(input: CreateExperimentInput): Record<string, unknown> {
  return {
    ...input,
    schedule: {
      ...input.schedule,
      startDate: toIso(input.schedule.startDate),
      endDate: input.schedule.endDate ? toIso(input.schedule.endDate) : undefined,
    },
    entries: [],
  };
}

function serializeUpdates(updates: Partial<Experiment>): Record<string, unknown> {
  const serialized: Record<string, unknown> = { ...updates };

  if (updates.schedule) {
    serialized.schedule = {
      ...updates.schedule,
      startDate: updates.schedule.startDate
        ? toIso(updates.schedule.startDate)
        : undefined,
      endDate: updates.schedule.endDate ? toIso(updates.schedule.endDate) : undefined,
    };
  }

  if (updates.entries) {
    serialized.entries = updates.entries.map((entry) => ({
      ...entry,
      date: toIso(entry.date),
      createdAt: toIso(entry.createdAt),
    }));
  }

  if (updates.createdAt) {
    serialized.createdAt = toIso(updates.createdAt);
  }

  if (updates.updatedAt) {
    serialized.updatedAt = toIso(updates.updatedAt);
  }

  return serialized;
}

function serializeEntry(entry: CreateEntryInput): Record<string, unknown> {
  return {
    ...entry,
    date: toIso(entry.date),
  };
}

async function loadLocalExperiments(): Promise<Experiment[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
  const experiments: Experiment[] = stored ? JSON.parse(stored) : [];
  return experiments.map((experiment) => parseExperiment(experiment as any));
}

async function persistLocalExperiments(experiments: Experiment[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(experiments));
}

export const useExperimentStore = create<ExperimentStore>((set, get) => ({
  experiments: [],
  currentExperiment: null,
  isLoading: false,
  error: null,

  loadExperiments: async () => {
    set({ isLoading: true, error: null });

    try {
      if (isConvexConfigured()) {
        const experiments = await convexQuery<Record<string, any>[]>("experiments:list");
        const parsed = experiments.map((experiment) => parseExperiment(experiment));
        set({ experiments: parsed, isLoading: false });
        return;
      }

      const local = await loadLocalExperiments();
      set({ experiments: local, isLoading: false });
    } catch (error) {
      logger.error(
        "Failed to load experiments",
        {},
        error instanceof Error ? error : new Error(String(error))
      );
      set({ error: "Failed to load experiments", isLoading: false });
    }
  },

  createExperiment: async (input: CreateExperimentInput) => {
    if (isConvexConfigured()) {
      const created = await convexMutation<Record<string, any>>("experiments:create", {
        input: serializeExperimentInput(input),
      });
      const parsed = parseExperiment(created);
      const updated = [parsed, ...get().experiments];
      set({ experiments: updated });
      return parsed;
    }

    const now = new Date();
    const experiment: Experiment = {
      ...input,
      id: generateId(),
      entries: [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [experiment, ...get().experiments];
    set({ experiments: updated });
    await persistLocalExperiments(updated);
    return experiment;
  },

  updateExperiment: async (id: string, updates: Partial<Experiment>) => {
    if (isConvexConfigured()) {
      const result = await convexMutation<Record<string, any>>("experiments:update", {
        id,
        updates: serializeUpdates(updates),
      });

      const parsed = parseExperiment(result);
      const experiments = get().experiments.map((experiment) =>
        experiment.id === id ? parsed : experiment
      );

      set({
        experiments,
        currentExperiment:
          get().currentExperiment?.id === id ? parsed : get().currentExperiment,
      });
      return;
    }

    const experiments = get().experiments.map((experiment) =>
      experiment.id === id
        ? {
            ...experiment,
            ...updates,
            updatedAt: new Date(),
          }
        : experiment
    );

    set({
      experiments,
      currentExperiment:
        get().currentExperiment?.id === id
          ? experiments.find((item) => item.id === id) ?? null
          : get().currentExperiment,
    });
    await persistLocalExperiments(experiments);
  },

  deleteExperiment: async (id: string) => {
    if (isConvexConfigured()) {
      await convexMutation("experiments:remove", { id });
      const experiments = get().experiments.filter((experiment) => experiment.id !== id);
      set({
        experiments,
        currentExperiment:
          get().currentExperiment?.id === id ? null : get().currentExperiment,
      });
      return;
    }

    const experiments = get().experiments.filter((experiment) => experiment.id !== id);
    set({
      experiments,
      currentExperiment:
        get().currentExperiment?.id === id ? null : get().currentExperiment,
    });
    await persistLocalExperiments(experiments);
  },

  setCurrentExperiment: (id: string | null) => {
    if (!id) {
      set({ currentExperiment: null });
      return;
    }

    const experiment = get().experiments.find((item) => item.id === id) ?? null;
    set({ currentExperiment: experiment });
  },

  addEntry: async (experimentId: string, entry: CreateEntryInput) => {
    if (isConvexConfigured()) {
      await convexMutation("experiments:addEntry", {
        experimentId,
        entry: serializeEntry(entry),
      });
      await get().loadExperiments();
      const selected = get().currentExperiment;
      if (selected?.id === experimentId) {
        const refreshed = get().experiments.find((item) => item.id === experimentId) ?? null;
        set({ currentExperiment: refreshed });
      }
      return;
    }

    const experiments = get().experiments.map((experiment) => {
      if (experiment.id !== experimentId) {
        return experiment;
      }

      const newEntry: ExperimentEntry = {
        ...entry,
        id: generateId(),
        createdAt: new Date(),
      };

      return {
        ...experiment,
        entries: [...experiment.entries, newEntry],
        updatedAt: new Date(),
      };
    });

    set({
      experiments,
      currentExperiment:
        get().currentExperiment?.id === experimentId
          ? experiments.find((item) => item.id === experimentId) ?? null
          : get().currentExperiment,
    });
    await persistLocalExperiments(experiments);
  },

  updateStatus: async (id: string, status: ExperimentStatus) => {
    await get().updateExperiment(id, { status });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const useActiveExperiments = (): Experiment[] =>
  useExperimentStore((state) =>
    state.experiments.filter((experiment) => experiment.status === "active")
  );

export const useActiveExperimentsCount = (): number =>
  useExperimentStore(
    (state) => state.experiments.filter((experiment) => experiment.status === "active").length
  );
