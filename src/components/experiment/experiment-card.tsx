/**
 * Experiment card component for displaying experiment summaries.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { colors } from "@/theme";
import type { Experiment, ExperimentStatus } from "@/types/experiment";

export interface ExperimentCardProps {
  experiment: Experiment;
  onPress?: () => void;
}

const statusConfig: Record<ExperimentStatus, { color: string; label: string }> = {
  draft: { color: colors.text.tertiary, label: "Draft" },
  active: { color: colors.accent.success, label: "Active" },
  paused: { color: colors.accent.warning, label: "Paused" },
  completed: { color: colors.primary[500], label: "Completed" },
  cancelled: { color: colors.accent.error, label: "Cancelled" },
};

function calculateProgress(experiment: Experiment): number {
  const { schedule, entries } = experiment;
  const totalDays = schedule.phaseDurationDays * schedule.totalPhases * 2;
  const entriesCount = entries.length;
  return Math.min(Math.round((entriesCount / totalDays) * 100), 100);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ExperimentCard({ experiment, onPress }: ExperimentCardProps): React.JSX.Element {
  const status = statusConfig[experiment.status];
  const progress = calculateProgress(experiment);
  const isActive = experiment.status === "active";

  return (
    <Card variant="elevated" onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {experiment.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {experiment.intervention.name} • {experiment.intervention.dosage}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.hypothesis} numberOfLines={2}>
        {experiment.hypothesis}
      </Text>

      {(isActive || experiment.status === "paused") && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressLabel}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>📝</Text>
          <Text style={styles.statText}>{experiment.entries.length} entries</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statText}>{experiment.metrics.length} metrics</Text>
        </View>
        <Text style={styles.date}>Started {formatDate(experiment.schedule.startDate)}</Text>
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
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  hypothesis: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  statIcon: {
    marginRight: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: "auto",
  },
});
