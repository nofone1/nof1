/**
 * Concentration dashboard component.
 * Shows estimated blood concentration levels for active peptides.
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, Icon } from "@/components/ui";
import { colors, spacing, typography } from "@/theme";
import { calculateConcentrations, type ConcentrationLevel } from "@/utils/concentration-tracker";
import type { DoseEntry } from "@/types/tracking";
import type { Pharmacokinetics } from "@/types/peptide";

interface ConcentrationDashboardProps {
  doses: DoseEntry[];
  pharmacokineticsMap: Map<string, Pharmacokinetics>;
}

const STATUS_COLORS = {
  therapeutic: colors.primary[500],
  sub_therapeutic: colors.accent.warning,
  cleared: colors.text.tertiary,
};

const STATUS_LABELS = {
  therapeutic: "Active",
  sub_therapeutic: "Declining",
  cleared: "Cleared",
};

/**
 * Dashboard showing estimated concentration for each peptide.
 *
 * @param doses - Recent dose entries
 * @param pharmacokineticsMap - Map of peptideId to pharmacokinetics data
 */
export function ConcentrationDashboard({
  doses,
  pharmacokineticsMap,
}: ConcentrationDashboardProps): React.JSX.Element | null {
  const concentrations = useMemo(
    () => calculateConcentrations(doses, pharmacokineticsMap),
    [doses, pharmacokineticsMap],
  );

  if (concentrations.length === 0) return null;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Icon name="activity" size={18} color={colors.primary[500]} />
          <Text style={styles.headerTitle}>Active Concentrations</Text>
        </View>
      </View>

      {concentrations.map((level, index) => (
        <ConcentrationRow key={`${level.peptideId}-${index}`} level={level} />
      ))}
    </Card>
  );
}

function ConcentrationRow({ level }: { level: ConcentrationLevel }): React.JSX.Element {
  const statusColor = STATUS_COLORS[level.status];

  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.peptideName}>{level.peptideName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[level.status]}
          </Text>
          {level.nextDoseOptimal && (
            <Text style={styles.nextDose}>
              Next dose in {level.nextDoseOptimal}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.max(level.percentage, 2)}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color: statusColor }]}>
          {Math.round(level.percentage)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.base,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.caption,
    color: colors.text.primary,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  rowInfo: {
    marginBottom: spacing.sm,
  },
  peptideName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.captionSmall,
    fontWeight: "600",
  },
  nextDose: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.default,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentage: {
    ...typography.small,
    fontWeight: "600",
    width: 36,
    textAlign: "right",
  },
});
