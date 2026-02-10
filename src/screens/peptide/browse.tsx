/**
 * Peptide browse screen displaying list of peptides.
 */

import React, { useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PeptideCard } from "@/components/peptide";
import { FilterChips } from "@/components/peptide/filter-chips";
import { Icon } from "@/components/ui";
import { usePeptideStore, useHasActiveFilters } from "@/stores/peptide-store";
import { colors, spacing, typography } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import type { Peptide } from "@/types/peptide";
import {
  PeptideCategory,
  ResearchLevel,
  getCategoryDisplay,
  getResearchLevelDisplay,
} from "@/types/peptide";

const CATEGORY_ITEMS = Object.values(PeptideCategory).map((value) => ({
  label: getCategoryDisplay(value),
  value,
}));

const RESEARCH_LEVEL_ITEMS = Object.values(ResearchLevel).map((value) => ({
  label: getResearchLevelDisplay(value),
  value,
}));

export function PeptideBrowseScreen({
  navigation,
}: MainTabScreenProps<"Peptides">): React.JSX.Element {
  const {
    peptides,
    allPeptides,
    searchQuery,
    categoryFilter,
    researchLevelFilter,
    loadPeptides,
    setSearchQuery,
    setCategoryFilter,
    setResearchLevelFilter,
    clearFilters,
  } = usePeptideStore();

  const hasActiveFilters = useHasActiveFilters();

  useEffect(() => {
    loadPeptides();
  }, [loadPeptides]);

  const handlePeptidePress = useCallback(
    (peptideId: string) => {
      navigation.navigate("PeptideDetail", { peptideId });
    },
    [navigation]
  );

  const renderPeptideItem = useCallback(
    ({ item }: { item: Peptide }) => (
      <PeptideCard peptide={item} onPress={() => handlePeptidePress(item.id)} />
    ),
    [handlePeptidePress]
  );

  const subtitleText = useMemo(() => {
    if (hasActiveFilters) {
      return `${peptides.length} of ${allPeptides.length} peptides`;
    }
    return `${allPeptides.length} peptides available for research`;
  }, [hasActiveFilters, peptides.length, allPeptides.length]);

  const renderListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.headerTitle}>Peptide Database</Text>
        <Text style={styles.headerSubtitle}>{subtitleText}</Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search peptides..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={colors.primary[500]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              hitSlop={8}
            >
              <Icon name="x" size={16} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        <FilterChips
          label="CATEGORY"
          items={CATEGORY_ITEMS}
          selected={categoryFilter}
          onSelect={(val) => setCategoryFilter(val as PeptideCategory | null)}
        />

        <FilterChips
          label="RESEARCH LEVEL"
          items={RESEARCH_LEVEL_ITEMS}
          selected={researchLevelFilter}
          onSelect={(val) => setResearchLevelFilter(val as ResearchLevel | null)}
        />

        {hasActiveFilters && (
          <Pressable onPress={clearFilters} style={styles.clearButton}>
            <Icon name="x-circle" size={14} color={colors.primary[400]} />
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </Pressable>
        )}
      </View>
    ),
    [
      subtitleText,
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
      researchLevelFilter,
      setResearchLevelFilter,
      hasActiveFilters,
      clearFilters,
    ]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Icon name="book-open" size={48} color={colors.primary[500]} />
        </View>
        <Text style={styles.emptyTitle}>No peptides found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search or filters.
        </Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={peptides}
        keyExtractor={(item) => item.id}
        renderItem={renderPeptideItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[400],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["5xl"],
    paddingHorizontal: spacing["2xl"],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(91, 138, 114, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing["2xl"],
  },
});
