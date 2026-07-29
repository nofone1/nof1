import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  DoseEntry,
  MetricEntry,
  StackItem,
  CreateDoseInput,
  CreateMetricInput,
  AddStackItemInput,
} from "@/types/tracking";
import { getTodayDateString, formatDateString } from "@/types/tracking";
import { logger } from "@/services/logging";
import {
  convexMutation,
  convexQuery,
  isConvexConfigured,
} from "@/services/backend/convex-client";

const TRACKING_STORAGE_KEYS = {
  DOSES: "@nof1/doses",
  METRICS: "@nof1/metrics",
  STACK: "@nof1/stack",
} as const;

const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
};

interface TrackingState {
  doses: DoseEntry[];
  metrics: MetricEntry[];
  stack: StackItem[];
  isLoading: boolean;
  error: string | null;
}

interface TrackingActions {
  loadTrackingData: () => Promise<void>;
  logDose: (input: CreateDoseInput) => Promise<DoseEntry>;
  logMetric: (input: CreateMetricInput) => Promise<MetricEntry>;
  addToStack: (input: AddStackItemInput) => Promise<StackItem>;
  removeFromStack: (id: string) => Promise<void>;
  toggleStackItem: (id: string) => Promise<void>;
  deleteDose: (id: string) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  getDosesForDate: (date: string) => DoseEntry[];
  getMetricsForDate: (date: string) => MetricEntry[];
  clearError: () => void;
}

type TrackingStore = TrackingState & TrackingActions;

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

function parseDose(raw: Record<string, any>): DoseEntry {
  return {
    ...(raw as DoseEntry),
    timestamp: toDate(raw.timestamp),
  };
}

function parseMetric(raw: Record<string, any>): MetricEntry {
  return {
    ...(raw as MetricEntry),
    timestamp: toDate(raw.timestamp),
  };
}

function parseStackItem(raw: Record<string, any>): StackItem {
  return {
    ...(raw as StackItem),
    addedAt: toDate(raw.addedAt),
  };
}

async function loadLocal(): Promise<{
  doses: DoseEntry[];
  metrics: MetricEntry[];
  stack: StackItem[];
}> {
  const [dosesJson, metricsJson, stackJson] = await Promise.all([
    AsyncStorage.getItem(TRACKING_STORAGE_KEYS.DOSES),
    AsyncStorage.getItem(TRACKING_STORAGE_KEYS.METRICS),
    AsyncStorage.getItem(TRACKING_STORAGE_KEYS.STACK),
  ]);

  const doses: DoseEntry[] = dosesJson ? JSON.parse(dosesJson) : [];
  const metrics: MetricEntry[] = metricsJson ? JSON.parse(metricsJson) : [];
  const stack: StackItem[] = stackJson ? JSON.parse(stackJson) : [];

  return {
    doses: doses.map((dose) => parseDose(dose as any)),
    metrics: metrics.map((metric) => parseMetric(metric as any)),
    stack: stack.map((item) => parseStackItem(item as any)),
  };
}

async function persistLocal(
  doses: DoseEntry[],
  metrics: MetricEntry[],
  stack: StackItem[]
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TRACKING_STORAGE_KEYS.DOSES, JSON.stringify(doses)),
    AsyncStorage.setItem(TRACKING_STORAGE_KEYS.METRICS, JSON.stringify(metrics)),
    AsyncStorage.setItem(TRACKING_STORAGE_KEYS.STACK, JSON.stringify(stack)),
  ]);
}

export const useTrackingStore = create<TrackingStore>((set, get) => ({
  doses: [],
  metrics: [],
  stack: [],
  isLoading: false,
  error: null,

  loadTrackingData: async () => {
    set({ isLoading: true, error: null });

    try {
      if (isConvexConfigured()) {
        const data = await convexQuery<{
          doses: Record<string, any>[];
          metrics: Record<string, any>[];
          stack: Record<string, any>[];
        }>("tracking:getAll");

        set({
          doses: data.doses.map((dose) => parseDose(dose)),
          metrics: data.metrics.map((metric) => parseMetric(metric)),
          stack: data.stack.map((item) => parseStackItem(item)),
          isLoading: false,
        });
        return;
      }

      const local = await loadLocal();
      set({ ...local, isLoading: false });
    } catch (error) {
      logger.error(
        "Failed to load tracking data",
        {},
        error instanceof Error ? error : new Error(String(error))
      );
      set({ error: "Failed to load tracking data", isLoading: false });
    }
  },

  logDose: async (input: CreateDoseInput) => {
    if (isConvexConfigured()) {
      const created = await convexMutation<Record<string, any>>("tracking:logDose", {
        entry: {
          ...input,
          timestamp: toIso(input.timestamp),
        },
      });

      const parsed = parseDose(created);
      set({ doses: [parsed, ...get().doses] });
      return parsed;
    }

    const newDose: DoseEntry = {
      ...input,
      id: generateId(),
      timestamp: input.timestamp ?? new Date(),
    };

    const doses = [newDose, ...get().doses];
    set({ doses });
    await persistLocal(doses, get().metrics, get().stack);
    return newDose;
  },

  logMetric: async (input: CreateMetricInput) => {
    if (isConvexConfigured()) {
      const created = await convexMutation<Record<string, any>>("tracking:logMetric", {
        entry: {
          ...input,
          timestamp: toIso(input.timestamp),
        },
      });

      const parsed = parseMetric(created);
      set({ metrics: [parsed, ...get().metrics] });
      return parsed;
    }

    const newMetric: MetricEntry = {
      ...input,
      id: generateId(),
      timestamp: input.timestamp ?? new Date(),
    };

    const metrics = [newMetric, ...get().metrics];
    set({ metrics });
    await persistLocal(get().doses, metrics, get().stack);
    return newMetric;
  },

  addToStack: async (input: AddStackItemInput) => {
    if (isConvexConfigured()) {
      const created = await convexMutation<Record<string, any>>("tracking:addToStack", {
        input: {
          ...input,
          isActive: true,
          addedAt: new Date().toISOString(),
        },
      });

      const parsed = parseStackItem(created);
      const stack = [parsed, ...get().stack.filter((item) => item.id !== parsed.id)];
      set({ stack });
      return parsed;
    }

    const newItem: StackItem = {
      ...input,
      id: generateId(),
      isActive: true,
      addedAt: new Date(),
    };

    const stack = [...get().stack, newItem];
    set({ stack });
    await persistLocal(get().doses, get().metrics, stack);
    return newItem;
  },

  removeFromStack: async (id: string) => {
    if (isConvexConfigured()) {
      await convexMutation("tracking:removeFromStack", { id });
      set({ stack: get().stack.filter((item) => item.id !== id) });
      return;
    }

    const stack = get().stack.filter((item) => item.id !== id);
    set({ stack });
    await persistLocal(get().doses, get().metrics, stack);
  },

  toggleStackItem: async (id: string) => {
    if (isConvexConfigured()) {
      const updated = await convexMutation<Record<string, any>>("tracking:toggleStackItem", {
        id,
      });
      const parsed = parseStackItem(updated);
      set({
        stack: get().stack.map((item) => (item.id === id ? parsed : item)),
      });
      return;
    }

    const stack = get().stack.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    set({ stack });
    await persistLocal(get().doses, get().metrics, stack);
  },

  deleteDose: async (id: string) => {
    if (isConvexConfigured()) {
      await convexMutation("tracking:deleteDose", { id });
      set({ doses: get().doses.filter((dose) => dose.id !== id) });
      return;
    }

    const doses = get().doses.filter((dose) => dose.id !== id);
    set({ doses });
    await persistLocal(doses, get().metrics, get().stack);
  },

  deleteMetric: async (id: string) => {
    if (isConvexConfigured()) {
      await convexMutation("tracking:deleteMetric", { id });
      set({ metrics: get().metrics.filter((metric) => metric.id !== id) });
      return;
    }

    const metrics = get().metrics.filter((metric) => metric.id !== id);
    set({ metrics });
    await persistLocal(get().doses, metrics, get().stack);
  },

  getDosesForDate: (date: string) => {
    return get().doses.filter((dose) => formatDateString(dose.timestamp) === date);
  },

  getMetricsForDate: (date: string) => {
    return get().metrics.filter((metric) => formatDateString(metric.timestamp) === date);
  },

  clearError: () => {
    set({ error: null });
  },
}));

export function useTodaysDoses(): DoseEntry[] {
  return useTrackingStore(
    useShallow((state) => {
      const today = getTodayDateString();
      return state.doses.filter((dose) => formatDateString(dose.timestamp) === today);
    })
  );
}

export function useTodaysMetrics(): MetricEntry[] {
  return useTrackingStore(
    useShallow((state) => {
      const today = getTodayDateString();
      return state.metrics.filter((metric) => formatDateString(metric.timestamp) === today);
    })
  );
}

export function useActiveStack(): StackItem[] {
  return useTrackingStore(useShallow((state) => state.stack.filter((item) => item.isActive)));
}

export function useTodaysDoseCount(): number {
  return useTrackingStore((state) => {
    const today = getTodayDateString();
    return state.doses.filter((dose) => formatDateString(dose.timestamp) === today).length;
  });
}
