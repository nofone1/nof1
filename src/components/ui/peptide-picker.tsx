/**
 * PeptidePicker component for selecting peptides from the database.
 * Displays a grid of selectable cards with peptide name and typical dose.
 *
 * @param selectedPeptideId - Currently selected peptide ID (null for custom)
 * @param onSelect - Callback when a peptide is selected
 * @param showCustomOption - Whether to show the "Custom" option (default: true)
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AnimatedPressable } from "./animated-pressable";
import { colors, spacing } from "@/theme";
import { usePeptideStore } from "@/stores/peptide-store";
import type { Peptide } from "@/types/peptide";

/**
 * Props for the PeptidePicker component.
 * @property selectedPeptideId - ID of the currently selected peptide, or "custom" for custom entry
 * @property onSelect - Callback fired when a peptide is selected, receives the peptide or null for custom
 * @property showCustomOption - Whether to display the custom entry option
 */
export interface PeptidePickerProps {
  selectedPeptideId: string | null;
  onSelect: (peptide: Peptide | null) => void;
  showCustomOption?: boolean;
}

/**
 * A grid-based peptide selection component.
 * Displays all available peptides as selectable cards with name and dosage info.
 *
 * @example
 * ```tsx
 * <PeptidePicker
 *   selectedPeptideId={selectedPeptide?.id ?? null}
 *   onSelect={(peptide) => {
 *     if (peptide) {
 *       setInterventionName(peptide.name);
 *       setDosage(peptide.dosing.typicalDose);
 *       setFrequency(peptide.dosing.frequency);
 *     }
 *   }}
 * />
 * ```
 */
export function PeptidePicker({
  selectedPeptideId,
  onSelect,
  showCustomOption = true,
}: PeptidePickerProps): React.JSX.Element {
  const peptides = usePeptideStore((state) => state.peptides);

  const isCustomSelected = selectedPeptideId === "custom";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SELECT A PEPTIDE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {peptides.map((peptide) => {
          const isSelected = selectedPeptideId === peptide.id;
          return (
            <PeptideCard
              key={peptide.id}
              peptide={peptide}
              isSelected={isSelected}
              onPress={() => onSelect(peptide)}
            />
          );
        })}
        {showCustomOption && (
          <CustomCard
            isSelected={isCustomSelected}
            onPress={() => onSelect(null)}
          />
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Props for the PeptideCard component.
 */
interface PeptideCardProps {
  peptide: Peptide;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Individual peptide selection card.
 * Shows peptide name and typical dose with selection state.
 *
 * @param peptide - The peptide data to display
 * @param isSelected - Whether this card is currently selected
 * @param onPress - Callback when the card is pressed
 */
function PeptideCard({
  peptide,
  isSelected,
  onPress,
}: PeptideCardProps): React.JSX.Element {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.card, isSelected && styles.cardSelected]}
      haptic="light"
    >
      <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>
        {peptide.name}
      </Text>
      <Text style={[styles.cardDose, isSelected && styles.cardDoseSelected]}>
        {peptide.dosing.typicalDose}
      </Text>
    </AnimatedPressable>
  );
}

/**
 * Props for the CustomCard component.
 */
interface CustomCardProps {
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Custom entry card for manual peptide/intervention input.
 *
 * @param isSelected - Whether custom entry is currently selected
 * @param onPress - Callback when the card is pressed
 */
function CustomCard({ isSelected, onPress }: CustomCardProps): React.JSX.Element {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.card, styles.customCard, isSelected && styles.cardSelected]}
      haptic="light"
    >
      <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>
        Custom
      </Text>
      <Text style={[styles.cardDose, isSelected && styles.cardDoseSelected]}>
        Manual entry
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingRight: spacing.base,
    gap: spacing.sm,
  },
  card: {
    width: 140,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface.default,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.surface.elevated,
  },
  customCard: {
    borderStyle: "dashed",
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardNameSelected: {
    color: colors.primary[400],
  },
  cardDose: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardDoseSelected: {
    color: colors.primary[300],
  },
});

export default PeptidePicker;
