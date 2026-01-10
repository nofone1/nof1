/**
 * Zustand store for experiment state management.
 * Handles CRUD operations for experiments with local persistence.
 *
 * @example
 * ```tsx
 * function HomeScreen() {
 *   const { experiments, isLoading, loadExperiments } = useExperimentStore();
 *
 *   useEffect(() => {
 *     loadExperiments();
 *   }, []);
 *
 *   return <ExperimentList experiments={experiments} />;
 * }
 * ```
 */

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
 * Experiment store state interface.
 * @property experiments - Array of all experiments
 * @property currentExperiment - Currently selected experiment
 * @property isLoading - Whether experiments are being loaded
 * @property error - Error message if operation failed
 */
interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Experiment store actions interface.
 * @property loadExperiments - Loads experiments from storage
 * @property createExperiment - Creates a new experiment
 * @property updateExperiment - Updates an existing experiment
 * @property deleteExperiment - Deletes an experiment
 * @property setCurrentExperiment - Sets the currently selected experiment
 * @property addEntry - Adds an entry to an experiment
 * @property updateStatus - Updates an experiment's status
 * @property clearError - Clears the error state
 */
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

/**
 * Combined store type.
 */
type ExperimentStore = ExperimentState & ExperimentActions;

/**
 * Persists experiments to async storage.
 * @param experiments - Array of experiments to persist
 */
async function persistExperiments(experiments: Experiment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXPERIMENTS,
      JSON.stringify(experiments)
    );
    logger.debug("Experiments persisted to storage", {
      extra: { count: experiments.length },
    });
  } catch (error) {
    logger.error(
      "Failed to persist experiments",
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Zustand store for experiment management.
 *
 * Features:
 * - Local persistence with AsyncStorage
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Logging for observability
 *
 * @example
 * ```tsx
 * // Access store in component
 * const experiments = useExperimentStore((state) => state.experiments);
 * const createExperiment = useExperimentStore((state) => state.createExperiment);
 *
 * // Or use multiple selectors
 * const { experiments, isLoading, loadExperiments } = useExperimentStore();
 * ```
 */
export const useExperimentStore = create<ExperimentStore>((set, get) => ({
  // Initial state
  experiments: [],
  currentExperiment: null,
  isLoading: false,
  error: null,

  /**
   * Loads experiments from async storage.
   * Should be called on app startup.
   */
  loadExperiments: async () => {
    set({ isLoading: true, error: null });
    logger.info("Loading experiments from storage");

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
      const experiments: Experiment[] = stored ? JSON.parse(stored) : [];

      // Parse date strings back to Date objects
      const parsedExperiments = experiments.map((exp) => ({
        ...exp,
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.updatedAt),
        schedule: {
          ...exp.schedule,
          startDate: new Date(exp.schedule.startDate),
          endDate: exp.schedule.endDate
            ? new Date(exp.schedule.endDate)
            : undefined,
        },
        entries: exp.entries.map((entry) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
        })),
      }));

      set({ experiments: parsedExperiments, isLoading: false });
      logger.info("Experiments loaded successfully", {
        extra: { count: parsedExperiments.length },
      });
    } catch (error) {
      const errorMessage = "Failed to load experiments";
      logger.error(
        errorMessage,
        {},
        error instanceof Error ? error : new Error(String(error))
      );
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Creates a new experiment.
   * @param input - Experiment data without auto-generated fields
   * @returns The created experiment
   */
  createExperiment: async (input: CreateExperimentInput) => {
    logger.info("Creating new experiment", { extra: { name: input.name } });

    const now = new Date();
    const newExperiment: Experiment = {
      ...input,
      id: generateId(),
      entries: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { experiments } = get();
      const updatedExperiments = [...experiments, newExperiment];

      // Optimistic update
      set({ experiments: updatedExperiments });

      // Persist to storage
      await persistExperiments(updatedExperiments);

      logger.info("Experiment created successfully", {
        experimentId: newExperiment.id,
      });

      return newExperiment;
    } catch (error) {
      // Rollback on error
      const { experiments } = get();
      set({
        experiments: experiments.filter((e) => e.id !== newExperiment.id),
        error: "Failed to create experiment",
      });
      throw error;
    }
  },

  /**
   * Updates an existing experiment.
   * @param id - Experiment ID to update
   * @param updates - Partial experiment data to merge
   */
  updateExperiment: async (id: string, updates: Partial<Experiment>) => {
    logger.info("Updating experiment", { experimentId: id });

    const { experiments } = get();
    const index = experiments.findIndex((e) => e.id === id);

    if (index === -1) {
      const error = "Experiment not found";
      logger.warn(error, { experimentId: id });
      set({ error });
      return;
    }

    const updatedExperiment: Experiment = {
      ...experiments[index],
      ...updates,
      updatedAt: new Date(),
    };

    const updatedExperiments = [...experiments];
    updatedExperiments[index] = updatedExperiment;

    try {
      set({ experiments: updatedExperiments });
      await persistExperiments(updatedExperiments);

      // Update currentExperiment if it's the one being updated
      const { currentExperiment } = get();
      if (currentExperiment?.id === id) {
        set({ currentExperiment: updatedExperiment });
      }

      logger.info("Experiment updated successfully", { experimentId: id });
    } catch (error) {
      set({ experiments, error: "Failed to update experiment" });
      throw error;
    }
  },

  /**
   * Deletes an experiment.
   * @param id - Experiment ID to delete
   */
  deleteExperiment: async (id: string) => {
    logger.info("Deleting experiment", { experimentId: id });

    const { experiments, currentExperiment } = get();
    const updatedExperiments = experiments.filter((e) => e.id !== id);

    try {
      set({
        experiments: updatedExperiments,
        currentExperiment:
          currentExperiment?.id === id ? null : currentExperiment,
      });
      await persistExperiments(updatedExperiments);

      logger.info("Experiment deleted successfully", { experimentId: id });
    } catch (error) {
      set({ experiments, error: "Failed to delete experiment" });
      throw error;
    }
  },

  /**
   * Sets the currently selected experiment.
   * @param id - Experiment ID or null to clear selection
   */
  setCurrentExperiment: (id: string | null) => {
    if (id === null) {
      set({ currentExperiment: null });
      return;
    }

    const { experiments } = get();
    const experiment = experiments.find((e) => e.id === id);

    if (experiment) {
      set({ currentExperiment: experiment });
      logger.debug("Current experiment set", { experimentId: id });
    } else {
      logger.warn("Experiment not found for selection", { experimentId: id });
    }
  },

  /**
   * Adds an entry to an experiment.
   * @param experimentId - ID of the experiment to add entry to
   * @param entry - Entry data without auto-generated fields
   */
  addEntry: async (experimentId: string, entry: CreateEntryInput) => {
    logger.info("Adding entry to experiment", { experimentId });

    const { experiments } = get();
    const index = experiments.findIndex((e) => e.id === experimentId);

    if (index === -1) {
      set({ error: "Experiment not found" });
      return;
    }

    const newEntry: ExperimentEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date(),
    };

    const updatedExperiment: Experiment = {
      ...experiments[index],
      entries: [...experiments[index].entries, newEntry],
      updatedAt: new Date(),
    };

    const updatedExperiments = [...experiments];
    updatedExperiments[index] = updatedExperiment;

    try {
      set({ experiments: updatedExperiments });
      await persistExperiments(updatedExperiments);

      // Update currentExperiment if necessary
      const { currentExperiment } = get();
      if (currentExperiment?.id === experimentId) {
        set({ currentExperiment: updatedExperiment });
      }

      logger.info("Entry added successfully", {
        experimentId,
        extra: { entryId: newEntry.id },
      });
    } catch (error) {
      set({ experiments, error: "Failed to add entry" });
      throw error;
    }
  },

  /**
   * Updates an experiment's status.
   * @param id - Experiment ID
   * @param status - New status
   */
  updateStatus: async (id: string, status: ExperimentStatus) => {
    logger.info("Updating experiment status", {
      experimentId: id,
      extra: { status },
    });
    await get().updateExperiment(id, { status });
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
 */

/**
 * Returns only active experiments.
 */
export const useActiveExperiments = (): Experiment[] =>
  useExperimentStore((state) =>
    state.experiments.filter((e) => e.status === "active")
  );

/**
 * Returns the count of active experiments.
 */
export const useActiveExperimentsCount = (): number =>
  useExperimentStore(
    (state) => state.experiments.filter((e) => e.status === "active").length
  );
