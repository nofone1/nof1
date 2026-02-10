/**
 * Peptide card component for displaying peptide summaries in browse list.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colors, spacing, typography } from "@/theme";
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
          <Badge key={category} variant="purple" size="sm">
            {getCategoryDisplay(category)}
          </Badge>
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
        <Text style={styles.learnMore}>Learn More</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  shortCodeBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  shortCodeText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  dosingContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  dosingItem: {
    flex: 1,
    alignItems: "center",
  },
  dosingLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  dosingValue: {
    ...typography.small,
    fontWeight: "500",
    color: colors.text.primary,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  researchBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  researchBadgeText: {
    ...typography.captionSmall,
    fontWeight: "600",
    color: colors.white,
  },
  learnMore: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[400],
  },
});
