/**
 * Peptide card component for displaying peptide summaries in browse list.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { colors } from "@/theme";
import type { Peptide } from "@/types/peptide";
import {
  getResearchLevelDisplay,
  getResearchLevelColor,
  getCategoryDisplay,
} from "@/types/peptide";

/**
 * Props for the PeptideCard component.
 * @property peptide - The peptide data to display
 * @property onPress - Callback when the card is pressed
 */
export interface PeptideCardProps {
  peptide: Peptide;
  onPress?: () => void;
}

/**
 * Displays a peptide summary card for the browse list.
 * Shows short code badge, name, subtitle, research level, categories, and dosing info.
 *
 * @param props - Component props
 * @returns The rendered peptide card
 *
 * @example
 * ```tsx
 * <PeptideCard
 *   peptide={peptideData}
 *   onPress={() => navigation.navigate('PeptideDetail', { peptideId: peptideData.id })}
 * />
 * ```
 */
export function PeptideCard({ peptide, onPress }: PeptideCardProps): React.JSX.Element {
  const researchLevelColor = getResearchLevelColor(peptide.researchLevel);
  const researchLevelText = getResearchLevelDisplay(peptide.researchLevel);

  // Show first 3 categories max
  const displayCategories = peptide.categories.slice(0, 3);

  return (
    <Card variant="elevated" onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.shortCodeBadge}>
          <Text style={styles.shortCodeText}>{peptide.shortCode}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {peptide.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {peptide.subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        {displayCategories.map((category) => (
          <View key={category} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryDisplay(category)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.dosingContainer}>
        <View style={styles.dosingItem}>
          <Text style={styles.dosingLabel}>Dose</Text>
          <Text style={styles.dosingValue}>{peptide.dosing.typicalDose}</Text>
        </View>
        <View style={styles.dosingItem}>
          <Text style={styles.dosingLabel}>Frequency</Text>
          <Text style={styles.dosingValue}>{peptide.dosing.frequency}</Text>
        </View>
        <View style={styles.dosingItem}>
          <Text style={styles.dosingLabel}>Cycle</Text>
          <Text style={styles.dosingValue}>{peptide.dosing.cycleDuration}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.researchBadge, { backgroundColor: researchLevelColor }]}>
          <Text style={styles.researchBadgeText}>{researchLevelText}</Text>
        </View>
        <Text style={styles.learnMore}>Learn More →</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  shortCodeBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  shortCodeText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary[400],
  },
  dosingContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  dosingItem: {
    flex: 1,
    alignItems: "center",
  },
  dosingLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dosingValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  researchBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  researchBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  learnMore: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary[400],
  },
});
