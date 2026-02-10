/**
 * Reconstitution calculator component.
 * Calculates BAC water volume, units per injection, and doses per vial.
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { Icon } from "@/components/ui/icon";
import { colors, spacing, typography } from "@/theme";
import type { ReconstitutionInfo } from "@/types/peptide";

interface ReconstitutionCalculatorProps {
  reconstitution: ReconstitutionInfo;
  peptideName: string;
}

const VIAL_SIZES = [2, 3, 5, 10];

/**
 * Interactive reconstitution calculator for peptide preparation.
 *
 * @param reconstitution - Reconstitution info from peptide data
 * @param peptideName - Name of the peptide
 */
export function ReconstitutionCalculator({
  reconstitution,
  peptideName,
}: ReconstitutionCalculatorProps): React.JSX.Element {
  const [peptideMg, setPeptideMg] = useState(reconstitution.defaultPeptideMg);
  const [vialMl, setVialMl] = useState(reconstitution.defaultVialMl);
  const [dosePerInjectionMcg, setDosePerInjectionMcg] = useState(250);

  const calculations = useMemo(() => {
    const totalMcg = peptideMg * 1000;
    const concentration = totalMcg / vialMl; // mcg per mL
    const volumePerDose = dosePerInjectionMcg / concentration; // mL per dose
    const dosesPerVial = Math.floor(totalMcg / dosePerInjectionMcg);
    const unitsPerDose = Math.round(volumePerDose * 100); // insulin units (100 per mL)

    return {
      concentration: concentration.toFixed(0),
      volumePerDose: volumePerDose.toFixed(2),
      dosesPerVial,
      unitsPerDose,
    };
  }, [peptideMg, vialMl, dosePerInjectionMcg]);

  return (
    <View style={styles.container}>
      {/* Inputs */}
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Peptide (mg)</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={() => setPeptideMg(Math.max(1, peptideMg - 1))}>
              <Icon name="minus" size={14} color={colors.text.secondary} />
            </Pressable>
            <Text style={styles.stepperValue}>{peptideMg}</Text>
            <Pressable style={styles.stepperButton} onPress={() => setPeptideMg(peptideMg + 1)}>
              <Icon name="plus" size={14} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vial (mL)</Text>
          <View style={styles.vialOptions}>
            {VIAL_SIZES.map((size) => (
              <Pressable
                key={size}
                style={[styles.vialOption, vialMl === size && styles.vialOptionSelected]}
                onPress={() => setVialMl(size)}
              >
                <Text style={[styles.vialOptionText, vialMl === size && styles.vialOptionTextSelected]}>
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Dose per injection (mcg)</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperButton} onPress={() => setDosePerInjectionMcg(Math.max(50, dosePerInjectionMcg - 50))}>
              <Icon name="minus" size={14} color={colors.text.secondary} />
            </Pressable>
            <Text style={styles.stepperValue}>{dosePerInjectionMcg}</Text>
            <Pressable style={styles.stepperButton} onPress={() => setDosePerInjectionMcg(dosePerInjectionMcg + 50)}>
              <Icon name="plus" size={14} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Results */}
      <View style={styles.results}>
        <View style={styles.resultItem}>
          <Text style={styles.resultValue}>{calculations.concentration}</Text>
          <Text style={styles.resultLabel}>mcg/mL</Text>
        </View>
        <View style={styles.resultDivider} />
        <View style={styles.resultItem}>
          <Text style={styles.resultValue}>{calculations.unitsPerDose}</Text>
          <Text style={styles.resultLabel}>units/dose</Text>
        </View>
        <View style={styles.resultDivider} />
        <View style={styles.resultItem}>
          <Text style={styles.resultValue}>{calculations.dosesPerVial}</Text>
          <Text style={styles.resultLabel}>doses/vial</Text>
        </View>
      </View>

      {/* Quality Indicators */}
      <View style={styles.qualitySection}>
        <Text style={styles.qualityTitle}>Quality Check</Text>
        {reconstitution.qualityIndicators.good.map((indicator, i) => (
          <View key={`good-${i}`} style={styles.qualityRow}>
            <Icon name="check-circle" size={14} color={colors.primary[500]} />
            <Text style={styles.qualityText}>{indicator}</Text>
          </View>
        ))}
        {reconstitution.qualityIndicators.bad.map((indicator, i) => (
          <View key={`bad-${i}`} style={styles.qualityRow}>
            <Icon name="x-circle" size={14} color={colors.accent.error} />
            <Text style={styles.qualityText}>{indicator}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    padding: spacing.xs,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface.default,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
    textAlign: "center",
  },
  vialOptions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  vialOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    alignItems: "center",
  },
  vialOptionSelected: {
    backgroundColor: "rgba(91, 138, 114, 0.2)",
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  vialOptionText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  vialOptionTextSelected: {
    color: colors.primary[400],
    fontWeight: "600",
  },
  results: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  resultItem: {
    flex: 1,
    alignItems: "center",
  },
  resultValue: {
    ...typography.heading3,
    color: colors.primary[400],
    marginBottom: spacing.xs,
  },
  resultLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
  },
  resultDivider: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  qualitySection: {
    marginTop: spacing.sm,
  },
  qualityTitle: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  qualityText: {
    ...typography.small,
    color: colors.text.secondary,
    flex: 1,
  },
});
