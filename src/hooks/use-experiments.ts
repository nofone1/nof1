/**
 * Custom hook for experiment operations.
 * Provides convenient access to experiment store with loading handling.
 *
 * @example
 * ```tsx
 * function ExperimentList() {
 *   const { experiments, isLoading, refresh } = useExperiments();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return experiments.map(exp => <ExperimentCard key={exp.id} experiment={exp} />);
 * }
 * ```
 */

import { useEffect, useCallback } from "react";
import { useExperimentStore } from "@/stores/experiment-store";
import type { Experiment, CreateExperimentInput, ExperimentStatus } from "@/types";

/**
 * Return type for the useExperiments hook.
 */
interface UseExperimentsReturn {
  /** All experiments */
  experiments: Experiment[];
  /** Currently selected experiment */
  currentExperiment: Experiment | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh experiments from storage */
  refresh: () => Promise<void>;
  /** Create a new experiment */
  create: (input: CreateExperimentInput) => Promise<Experiment>;
  /** Update an experiment */
  update: (id: string, updates: Partial<Experiment>) => Promise<void>;
  /** Delete an experiment */
  remove: (id: string) => Promise<void>;
  /** Select an experiment */
  select: (id: string | null) => void;
  /** Update experiment status */
  updateStatus: (id: string, status: ExperimentStatus) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for managing experiments with automatic loading.
 * Loads experiments from storage on mount and provides CRUD operations.
 *
 * @param autoLoad - Whether to automatically load experiments on mount (default: true)
 * @returns Object with experiment state and operations
 *
 * @example
 * ```tsx
 * function HomeScreen() {
 *   const {
 *     experiments,
 *     isLoading,
 *     refresh,
 *     create,
 *   } = useExperiments();
 *
 *   const handleCreateExperiment = async () => {
 *     await create({
 *       name: 'Test Creatine',
 *       hypothesis: 'Creatine will improve energy',
 *       // ... other fields
 *     });
 *   };
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <View>
 *       {experiments.map(exp => (
 *         <ExperimentCard key={exp.id} experiment={exp} />
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */
export function useExperiments(autoLoad = true): UseExperimentsReturn {
  const {
    experiments,
    currentExperiment,
    isLoading,
    error,
    loadExperiments,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    setCurrentExperiment,
    updateStatus,
    clearError,
  } = useExperimentStore();

  /**
   * Load experiments on mount if autoLoad is enabled.
   */
  useEffect(() => {
    if (autoLoad) {
      loadExperiments();
    }
  }, [autoLoad, loadExperiments]);

  /**
   * Refresh experiments from storage.
   */
  const refresh = useCallback(async () => {
    await loadExperiments();
  }, [loadExperiments]);

  /**
   * Create a new experiment.
   */
  const create = useCallback(
    async (input: CreateExperimentInput) => {
      return await createExperiment(input);
    },
    [createExperiment]
  );

  /**
   * Update an experiment.
   */
  const update = useCallback(
    async (id: string, updates: Partial<Experiment>) => {
      await updateExperiment(id, updates);
    },
    [updateExperiment]
  );

  /**
   * Delete an experiment.
   */
  const remove = useCallback(
    async (id: string) => {
      await deleteExperiment(id);
    },
    [deleteExperiment]
  );

  /**
   * Select an experiment.
   */
  const select = useCallback(
    (id: string | null) => {
      setCurrentExperiment(id);
    },
    [setCurrentExperiment]
  );

  return {
    experiments,
    currentExperiment,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
    select,
    updateStatus,
    clearError,
  };
}
