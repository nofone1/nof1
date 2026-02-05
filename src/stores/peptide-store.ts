/**
 * Zustand store for peptide database state management.
 * Provides access to peptide data with filtering and search capabilities.
 *
 * @example
 * ```tsx
 * function PeptideBrowseScreen() {
 *   const { peptides, searchQuery, setSearchQuery } = usePeptideStore();
 *
 *   return (
 *     <FlatList
 *       data={peptides}
 *       renderItem={({ item }) => <PeptideCard peptide={item} />}
 *     />
 *   );
 * }
 * ```
 */

import { create } from "zustand";
import type { Peptide, PeptideCategory, ResearchLevel } from "@/types/peptide";
import {
  PEPTIDES,
  getPeptideById,
  getPeptidesByCategory,
  getPeptidesByResearchLevel,
  searchPeptides,
} from "@/data/peptides";

/**
 * Peptide store state interface.
 * @property peptides - Array of all peptides (filtered if filters active)
 * @property allPeptides - Complete array of all peptides (unfiltered)
 * @property selectedPeptide - Currently selected peptide for detail view
 * @property searchQuery - Current search query string
 * @property categoryFilter - Active category filter
 * @property researchLevelFilter - Active research level filter
 * @property isLoading - Whether peptides are being loaded/filtered
 */
interface PeptideState {
  peptides: Peptide[];
  allPeptides: Peptide[];
  selectedPeptide: Peptide | null;
  searchQuery: string;
  categoryFilter: PeptideCategory | null;
  researchLevelFilter: ResearchLevel | null;
  isLoading: boolean;
}

/**
 * Peptide store actions interface.
 * @property loadPeptides - Initializes the peptide database
 * @property selectPeptide - Selects a peptide by ID for detail view
 * @property clearSelection - Clears the selected peptide
 * @property setSearchQuery - Sets the search query and filters results
 * @property setCategoryFilter - Sets the category filter
 * @property setResearchLevelFilter - Sets the research level filter
 * @property clearFilters - Clears all filters and search
 * @property getPeptideById - Gets a peptide by ID without selecting it
 */
interface PeptideActions {
  loadPeptides: () => void;
  selectPeptide: (id: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: PeptideCategory | null) => void;
  setResearchLevelFilter: (level: ResearchLevel | null) => void;
  clearFilters: () => void;
  getPeptideById: (id: string) => Peptide | undefined;
}

/**
 * Combined store type.
 */
type PeptideStore = PeptideState & PeptideActions;

/**
 * Applies all active filters to the peptide list.
 * @param peptides - Array of peptides to filter
 * @param searchQuery - Search query string
 * @param categoryFilter - Category filter
 * @param researchLevelFilter - Research level filter
 * @returns Filtered array of peptides
 */
function applyFilters(
  peptides: Peptide[],
  searchQuery: string,
  categoryFilter: PeptideCategory | null,
  researchLevelFilter: ResearchLevel | null
): Peptide[] {
  let filtered = peptides;

  // Apply search query
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.subtitle.toLowerCase().includes(lowerQuery) ||
        p.overview.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Apply category filter
  if (categoryFilter) {
    filtered = filtered.filter((p) => p.categories.includes(categoryFilter));
  }

  // Apply research level filter
  if (researchLevelFilter) {
    filtered = filtered.filter((p) => p.researchLevel === researchLevelFilter);
  }

  return filtered;
}

/**
 * Zustand store for peptide database management.
 *
 * Features:
 * - Static peptide data loaded from local database
 * - Search functionality across name, subtitle, and description
 * - Category and research level filtering
 * - Selection state for detail view navigation
 *
 * @example
 * ```tsx
 * // Access store in component
 * const peptides = usePeptideStore((state) => state.peptides);
 * const selectPeptide = usePeptideStore((state) => state.selectPeptide);
 *
 * // Or use multiple selectors
 * const { peptides, searchQuery, setSearchQuery } = usePeptideStore();
 * ```
 */
export const usePeptideStore = create<PeptideStore>((set, get) => ({
  // Initial state
  peptides: PEPTIDES,
  allPeptides: PEPTIDES,
  selectedPeptide: null,
  searchQuery: "",
  categoryFilter: null,
  researchLevelFilter: null,
  isLoading: false,

  /**
   * Initializes the peptide database.
   * Loads static peptide data into the store.
   */
  loadPeptides: () => {
    set({
      peptides: PEPTIDES,
      allPeptides: PEPTIDES,
      isLoading: false,
    });
  },

  /**
   * Selects a peptide by ID for detail view.
   * @param id - Peptide ID to select
   */
  selectPeptide: (id: string) => {
    const peptide = getPeptideById(id);
    if (peptide) {
      set({ selectedPeptide: peptide });
    }
  },

  /**
   * Clears the selected peptide.
   */
  clearSelection: () => {
    set({ selectedPeptide: null });
  },

  /**
   * Sets the search query and filters results.
   * @param query - Search query string
   */
  setSearchQuery: (query: string) => {
    const { allPeptides, categoryFilter, researchLevelFilter } = get();
    const filtered = applyFilters(
      allPeptides,
      query,
      categoryFilter,
      researchLevelFilter
    );
    set({ searchQuery: query, peptides: filtered });
  },

  /**
   * Sets the category filter.
   * @param category - Category to filter by, or null to clear
   */
  setCategoryFilter: (category: PeptideCategory | null) => {
    const { allPeptides, searchQuery, researchLevelFilter } = get();
    const filtered = applyFilters(
      allPeptides,
      searchQuery,
      category,
      researchLevelFilter
    );
    set({ categoryFilter: category, peptides: filtered });
  },

  /**
   * Sets the research level filter.
   * @param level - Research level to filter by, or null to clear
   */
  setResearchLevelFilter: (level: ResearchLevel | null) => {
    const { allPeptides, searchQuery, categoryFilter } = get();
    const filtered = applyFilters(allPeptides, searchQuery, categoryFilter, level);
    set({ researchLevelFilter: level, peptides: filtered });
  },

  /**
   * Clears all filters and search.
   */
  clearFilters: () => {
    set({
      searchQuery: "",
      categoryFilter: null,
      researchLevelFilter: null,
      peptides: PEPTIDES,
    });
  },

  /**
   * Gets a peptide by ID without selecting it.
   * @param id - Peptide ID to look up
   * @returns The peptide if found, undefined otherwise
   */
  getPeptideById: (id: string) => {
    return getPeptideById(id);
  },
}));

/**
 * Selector hooks for common use cases.
 */

/**
 * Returns the count of all peptides.
 */
export const usePeptideCount = (): number =>
  usePeptideStore((state) => state.allPeptides.length);

/**
 * Returns peptides filtered by a specific category.
 * @param category - Category to filter by
 */
export const usePeptidesByCategory = (category: PeptideCategory): Peptide[] =>
  usePeptideStore((state) =>
    state.allPeptides.filter((p) => p.categories.includes(category))
  );

/**
 * Returns whether any filters are active.
 */
export const useHasActiveFilters = (): boolean =>
  usePeptideStore(
    (state) =>
      state.searchQuery.trim() !== "" ||
      state.categoryFilter !== null ||
      state.researchLevelFilter !== null
  );
