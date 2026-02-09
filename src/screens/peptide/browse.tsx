/**
 * Peptide browse screen displaying list of peptides.
 */

import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PeptideCard } from "@/components/peptide";
import { usePeptideStore } from "@/stores/peptide-store";
import { colors } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import type { Peptide } from "@/types/peptide";

/**
 * Peptide browse screen component.
 * Displays a list of peptides with their key information.
 *
 * @param props - Navigation props
 * @returns The rendered browse screen
 */
export function PeptideBrowseScreen({
  navigation,
}: MainTabScreenProps<"Peptides">): React.JSX.Element {
  const { peptides, loadPeptides } = usePeptideStore();

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

  const renderListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.headerTitle}>Peptide Database</Text>
        <Text style={styles.headerSubtitle}>
          {peptides.length} peptides available for research
        </Text>
      </View>
    ),
    [peptides.length]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>💊</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
  },
});
