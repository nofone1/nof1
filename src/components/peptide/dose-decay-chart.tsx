/**
 * Dose decay visualization component.
 * Shows exponential decay curve using simple View-based bars.
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/theme";
import { generateDecayCurve, formatDuration } from "@/utils/pharmacokinetics";
import type { Pharmacokinetics } from "@/types/peptide";

interface DoseDecayChartProps {
  pharmacokinetics: Pharmacokinetics;
}

/**
 * Displays a dose decay bar chart for a peptide's pharmacokinetic profile.
 *
 * @param pharmacokinetics - Pharmacokinetic data (peak, half-life, clearance)
 */
export function DoseDecayChart({ pharmacokinetics }: DoseDecayChartProps): React.JSX.Element {
  const { halfLifeHours } = pharmacokinetics;
  const totalHours = halfLifeHours * 5; // ~3% remaining

  const dataPoints = useMemo(
    () => generateDecayCurve(halfLifeHours, totalHours, 10),
    [halfLifeHours, totalHours],
  );

  return (
    <View style={styles.container}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Peak</Text>
          <Text style={styles.statValue}>{pharmacokinetics.peakTime}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Half-life</Text>
          <Text style={styles.statValue}>{pharmacokinetics.halfLife}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Clearance</Text>
          <Text style={styles.statValue}>{pharmacokinetics.clearanceTime}</Text>
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartContainer}>
        {dataPoints.map((point, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.max(point.percentage, 2)}%`,
                    backgroundColor:
                      point.percentage > 50
                        ? colors.primary[500]
                        : point.percentage > 20
                          ? colors.accent.warning
                          : colors.text.tertiary,
                  },
                ]}
              />
            </View>
            {index % 3 === 0 && (
              <Text style={styles.barLabel}>{formatDuration(point.hour)}</Text>
            )}
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
  statsRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  chartContainer: {
    flexDirection: "row",
    height: 100,
    alignItems: "flex-end",
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barTrack: {
    width: "100%",
    height: 80,
    justifyContent: "flex-end",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    fontSize: 9,
    marginTop: 4,
  },
});
