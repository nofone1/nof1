/**
 * Zustand store for daily tracking state management.
 * Handles doses, metrics, and user's supplement stack with local persistence.
 *
 * @example
 * ```tsx
 * function DailyLogScreen() {
 *   const { todaysDoses, todaysMetrics, logDose } = useTrackingStore();
 *
 *   return <DailyLog doses={todaysDoses} metrics={todaysMetrics} />;
 * }
 * ```
 */

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

/** Storage keys for tracking data */
const TRACKING_STORAGE_KEYS = {
  DOSES: "@nof1/doses",
  METRICS: "@nof1/metrics",
  STACK: "@nof1/stack",
} as const;

/**
 * Generates a unique identifier.
 * @returns A unique string ID
 */
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
};

/**
 * Tracking store state interface.
 * @property doses - Array of all logged doses
 * @property metrics - Array of all logged metrics
 * @property stack - User's current supplement/peptide stack
 * @property isLoading - Whether data is being loaded
 * @property error - Error message if operation failed
 */
interface TrackingState {
  doses: DoseEntry[];
  metrics: MetricEntry[];
  stack: StackItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Tracking store actions interface.
 */
interface TrackingActions {
  /** Loads all tracking data from storage */
  loadTrackingData: () => Promise<void>;
  /** Logs a new dose entry */
  logDose: (input: CreateDoseInput) => Promise<DoseEntry>;
  /** Logs a new metric entry */
  logMetric: (input: CreateMetricInput) => Promise<MetricEntry>;
  /** Adds an item to the user's stack */
  addToStack: (input: AddStackItemInput) => Promise<StackItem>;
  /** Removes an item from the stack */
  removeFromStack: (id: string) => Promise<void>;
  /** Toggles a stack item's active status */
  toggleStackItem: (id: string) => Promise<void>;
  /** Deletes a dose entry */
  deleteDose: (id: string) => Promise<void>;
  /** Deletes a metric entry */
  deleteMetric: (id: string) => Promise<void>;
  /** Gets doses for a specific date */
  getDosesForDate: (date: string) => DoseEntry[];
  /** Gets metrics for a specific date */
  getMetricsForDate: (date: string) => MetricEntry[];
  /** Clears the error state */
  clearError: () => void;
}

/**
 * Combined store type.
 */
type TrackingStore = TrackingState & TrackingActions;

/**
 * Persists doses to async storage.
 * @param doses - Array of doses to persist
 */
async function persistDoses(doses: DoseEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRACKING_STORAGE_KEYS.DOSES, JSON.stringify(doses));
    logger.debug("Doses persisted to storage", { extra: { count: doses.length } });
  } catch (error) {
    logger.error("Failed to persist doses", {}, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Persists metrics to async storage.
 * @param metrics - Array of metrics to persist
 */
async function persistMetrics(metrics: MetricEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRACKING_STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    logger.debug("Metrics persisted to storage", { extra: { count: metrics.length } });
  } catch (error) {
    logger.error("Failed to persist metrics", {}, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Persists stack to async storage.
 * @param stack - Array of stack items to persist
 */
async function persistStack(stack: StackItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRACKING_STORAGE_KEYS.STACK, JSON.stringify(stack));
    logger.debug("Stack persisted to storage", { extra: { count: stack.length } });
  } catch (error) {
    logger.error("Failed to persist stack", {}, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Zustand store for tracking management.
 *
 * Features:
 * - Local persistence with AsyncStorage
 * - Dose and metric logging
 * - User's supplement stack management
 * - Date-based filtering
 */
export const useTrackingStore = create<TrackingStore>((set, get) => ({
  // Initial state
  doses: [],
  metrics: [],
  stack: [],
  isLoading: false,
  error: null,

  /**
   * Loads all tracking data from async storage.
   * Should be called on app startup.
   */
  loadTrackingData: async () => {
    set({ isLoading: true, error: null });
    logger.info("Loading tracking data from storage");

    try {
      const [dosesJson, metricsJson, stackJson] = await Promise.all([
        AsyncStorage.getItem(TRACKING_STORAGE_KEYS.DOSES),
        AsyncStorage.getItem(TRACKING_STORAGE_KEYS.METRICS),
        AsyncStorage.getItem(TRACKING_STORAGE_KEYS.STACK),
      ]);

      const doses: DoseEntry[] = dosesJson ? JSON.parse(dosesJson) : [];
      const metrics: MetricEntry[] = metricsJson ? JSON.parse(metricsJson) : [];
      const stack: StackItem[] = stackJson ? JSON.parse(stackJson) : [];

      // Parse date strings back to Date objects
      const parsedDoses = doses.map((d) => ({
        ...d,
        timestamp: new Date(d.timestamp),
      }));

      const parsedMetrics = metrics.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));

      const parsedStack = stack.map((s) => ({
        ...s,
        addedAt: new Date(s.addedAt),
      }));

      set({
        doses: parsedDoses,
        metrics: parsedMetrics,
        stack: parsedStack,
        isLoading: false,
      });

      logger.info("Tracking data loaded successfully", {
        extra: { doses: parsedDoses.length, metrics: parsedMetrics.length, stack: parsedStack.length },
      });
    } catch (error) {
      const errorMessage = "Failed to load tracking data";
      logger.error(errorMessage, {}, error instanceof Error ? error : new Error(String(error)));
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Logs a new dose entry.
   * @param input - Dose data without auto-generated fields
   * @returns The created dose entry
   * @throws Error if persistence fails
   */
  logDose: async (input: CreateDoseInput) => {
    logger.info("Logging dose", { extra: { name: input.name } });

    // Capture original state BEFORE mutation for rollback
    const { doses: originalDoses } = get();

    const newDose: DoseEntry = {
      ...input,
      id: generateId(),
      timestamp: input.timestamp ?? new Date(),
    };

    try {
      const updatedDoses = [newDose, ...originalDoses];

      set({ doses: updatedDoses });
      await persistDoses(updatedDoses);

      logger.info("Dose logged successfully", { extra: { doseId: newDose.id } });
      return newDose;
    } catch (error) {
      // Rollback to original state on persistence failure
      set({ doses: originalDoses, error: "Failed to log dose" });
      throw error;
    }
  },

  /**
   * Logs a new metric entry.
   * @param input - Metric data without auto-generated fields
   * @returns The created metric entry
   * @throws Error if persistence fails
   */
  logMetric: async (input: CreateMetricInput) => {
    logger.info("Logging metric", { extra: { type: input.metricType } });

    // Capture original state BEFORE mutation for rollback
    const { metrics: originalMetrics } = get();

    const newMetric: MetricEntry = {
      ...input,
      id: generateId(),
      timestamp: input.timestamp ?? new Date(),
    };

    try {
      const updatedMetrics = [newMetric, ...originalMetrics];

      set({ metrics: updatedMetrics });
      await persistMetrics(updatedMetrics);

      logger.info("Metric logged successfully", { extra: { metricId: newMetric.id } });
      return newMetric;
    } catch (error) {
      // Rollback to original state on persistence failure
      set({ metrics: originalMetrics, error: "Failed to log metric" });
      throw error;
    }
  },

  /**
   * Adds an item to the user's stack.
   * @param input - Stack item data without auto-generated fields
   * @returns The created stack item
   * @throws Error if persistence fails
   */
  addToStack: async (input: AddStackItemInput) => {
    logger.info("Adding to stack", { extra: { name: input.name } });

    // Capture original state BEFORE mutation for rollback
    const { stack: originalStack } = get();

    const newItem: StackItem = {
      ...input,
      id: generateId(),
      isActive: true,
      addedAt: new Date(),
    };

    try {
      const updatedStack = [...originalStack, newItem];

      set({ stack: updatedStack });
      await persistStack(updatedStack);

      logger.info("Added to stack successfully", { extra: { itemId: newItem.id } });
      return newItem;
    } catch (error) {
      // Rollback to original state on persistence failure
      set({ stack: originalStack, error: "Failed to add to stack" });
      throw error;
    }
  },

  /**
   * Removes an item from the stack.
   * @param id - Stack item ID to remove
   */
  removeFromStack: async (id: string) => {
    logger.info("Removing from stack", { extra: { itemId: id } });

    const { stack } = get();
    const updatedStack = stack.filter((s) => s.id !== id);

    try {
      set({ stack: updatedStack });
      await persistStack(updatedStack);

      logger.info("Removed from stack successfully", { extra: { itemId: id } });
    } catch (error) {
      set({ stack, error: "Failed to remove from stack" });
      throw error;
    }
  },

  /**
   * Toggles a stack item's active status.
   * @param id - Stack item ID to toggle
   * @throws Error if item not found or persistence fails
   */
  toggleStackItem: async (id: string) => {
    const { stack } = get();
    const index = stack.findIndex((s) => s.id === id);

    if (index === -1) {
      const error = new Error("Stack item not found");
      set({ error: error.message });
      throw error;
    }

    const updatedStack = [...stack];
    updatedStack[index] = {
      ...updatedStack[index],
      isActive: !updatedStack[index].isActive,
    };

    try {
      set({ stack: updatedStack });
      await persistStack(updatedStack);

      logger.info("Stack item toggled", { extra: { itemId: id, isActive: updatedStack[index].isActive } });
    } catch (error) {
      set({ stack, error: "Failed to toggle stack item" });
      throw error;
    }
  },

  /**
   * Deletes a dose entry.
   * @param id - Dose ID to delete
   */
  deleteDose: async (id: string) => {
    const { doses } = get();
    const updatedDoses = doses.filter((d) => d.id !== id);

    try {
      set({ doses: updatedDoses });
      await persistDoses(updatedDoses);

      logger.info("Dose deleted", { extra: { doseId: id } });
    } catch (error) {
      set({ doses, error: "Failed to delete dose" });
      throw error;
    }
  },

  /**
   * Deletes a metric entry.
   * @param id - Metric ID to delete
   */
  deleteMetric: async (id: string) => {
    const { metrics } = get();
    const updatedMetrics = metrics.filter((m) => m.id !== id);

    try {
      set({ metrics: updatedMetrics });
      await persistMetrics(updatedMetrics);

      logger.info("Metric deleted", { extra: { metricId: id } });
    } catch (error) {
      set({ metrics, error: "Failed to delete metric" });
      throw error;
    }
  },

  /**
   * Gets doses for a specific date.
   * @param date - Date string in YYYY-MM-DD format
   * @returns Array of doses for that date
   */
  getDosesForDate: (date: string) => {
    const { doses } = get();
    return doses.filter((d) => formatDateString(d.timestamp) === date);
  },

  /**
   * Gets metrics for a specific date.
   * @param date - Date string in YYYY-MM-DD format
   * @returns Array of metrics for that date
   */
  getMetricsForDate: (date: string) => {
    const { metrics } = get();
    return metrics.filter((m) => formatDateString(m.timestamp) === date);
  },

  /**
   * Clears the error state.
   */
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Selector hooks for common use cases.
 * Uses useShallow to prevent infinite re-renders from array filtering.
 */

/**
 * Returns today's doses.
 */
export function useTodaysDoses(): DoseEntry[] {
  return useTrackingStore(
    useShallow((state) => {
      const today = getTodayDateString();
      return state.doses.filter((d) => formatDateString(d.timestamp) === today);
    })
  );
}

/**
 * Returns today's metrics.
 */
export function useTodaysMetrics(): MetricEntry[] {
  return useTrackingStore(
    useShallow((state) => {
      const today = getTodayDateString();
      return state.metrics.filter((m) => formatDateString(m.timestamp) === today);
    })
  );
}

/**
 * Returns active stack items.
 */
export function useActiveStack(): StackItem[] {
  return useTrackingStore(useShallow((state) => state.stack.filter((s) => s.isActive)));
}

/**
 * Returns the count of today's logged doses.
 */
export function useTodaysDoseCount(): number {
  return useTrackingStore((state) => {
    const today = getTodayDateString();
    return state.doses.filter((d) => formatDateString(d.timestamp) === today).length;
  });
}
