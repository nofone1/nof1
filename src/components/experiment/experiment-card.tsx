/**
 * Experiment card component for displaying experiment summaries.
 * Features Feather icons, thin progress bar, and elegant badge styling.
 *
 * @param experiment - Experiment data to display
 * @param onPress - Press handler for navigation
 * @param index - Optional index for staggered animation
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { colors, spacing, typography } from "@/theme";
import type { Experiment, ExperimentStatus } from "@/types/experiment";

export interface ExperimentCardProps {
  /** Experiment data to display */
  experiment: Experiment;
  /** Press handler for navigation */
  onPress?: () => void;
  /** Optional index for staggered animation */
  index?: number;
}

const statusConfig: Record<ExperimentStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: "default", label: "Draft" },
  active: { variant: "success", label: "Active" },
  paused: { variant: "warning", label: "Paused" },
  completed: { variant: "primary", label: "Completed" },
  cancelled: { variant: "error", label: "Cancelled" },
};

/**
 * Calculates experiment progress as a percentage.
 *
 * @param experiment - Experiment to calculate progress for
 * @returns Progress percentage (0-100)
 */
function calculateProgress(experiment: Experiment): number {
  const { schedule, entries } = experiment;
  const totalDays = schedule.phaseDurationDays * schedule.totalPhases * 2;
  const entriesCount = entries.length;
  return Math.min(Math.round((entriesCount / totalDays) * 100), 100);
}

/**
 * Formats a date for display.
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Experiment card component with elegant styling and animations.
 *
 * @example
 * <ExperimentCard
 *   experiment={experiment}
 *   onPress={() => navigate('ExperimentDetail', { experimentId: experiment.id })}
 *   index={0}
 * />
 */
export function ExperimentCard({
  experiment,
  onPress,
  index = 0,
}: ExperimentCardProps): React.JSX.Element {
  const status = statusConfig[experiment.status];
  const progress = calculateProgress(experiment);
  const showProgress = experiment.status === "active" || experiment.status === "paused";

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      style={styles.card}
      animated
      animationDelay={index * 80}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {experiment.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {experiment.intervention.name} · {experiment.intervention.dosage}
          </Text>
        </View>
        <Badge variant={status.variant}>{status.label}</Badge>
      </View>

      {/* Hypothesis */}
      <Text style={styles.hypothesis} numberOfLines={2}>
        {experiment.hypothesis}
      </Text>

      {/* Progress bar */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Icon name="edit-3" size={14} color={colors.text.tertiary} />
          <Text style={styles.statText}>{experiment.entries.length}</Text>
        </View>
        <View style={styles.stat}>
          <Icon name="bar-chart-2" size={14} color={colors.text.tertiary} />
          <Text style={styles.statText}>{experiment.metrics.length}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={12} color={colors.text.muted} />
          <Text style={styles.date}>{formatDate(experiment.schedule.startDate)}</Text>
        </View>
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
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.heading3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  hypothesis: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
  },
  progressValue: {
    ...typography.captionSmall,
    color: colors.primary[500],
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
    gap: spacing.xs,
  },
  statText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: spacing.xs,
  },
  date: {
    ...typography.captionSmall,
    color: colors.text.muted,
  },
});
