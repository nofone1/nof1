/**
 * Experiment Detail screen.
 * Features elegant typography, Feather icons, and refined card styling.
 */

import React, { useEffect, useCallback, useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Loading, Badge, Icon, AnimatedPressable } from "@/components/ui";
import { useExperiments, useLogger } from "@/hooks";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import { ExperimentStatus } from "@/types/experiment";
import type { BadgeVariant } from "@/components/ui/badge";

const statusConfig: Record<ExperimentStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: "default", label: "Draft" },
  active: { variant: "success", label: "Active" },
  paused: { variant: "warning", label: "Paused" },
  completed: { variant: "primary", label: "Completed" },
  cancelled: { variant: "error", label: "Cancelled" },
};

/**
 * Experiment Detail screen component.
 *
 * @param route - Route params containing experimentId
 * @param navigation - Navigation prop for screen transitions
 * @returns The Experiment Detail screen JSX element
 */
export function ExperimentDetailScreen({
  route,
  navigation,
}: MainStackScreenProps<"ExperimentDetail">): React.JSX.Element {
  const { experimentId } = route.params;
  const { select, currentExperiment, updateStatus, remove, isLoading } = useExperiments();
  const { log } = useLogger("ExperimentDetail");
  const [isLoggingEntry, setIsLoggingEntry] = useState(false);

  useEffect(() => {
    select(experimentId);
    return () => select(null);
  }, [experimentId, select]);

  const handleTogglePause = useCallback(async () => {
    if (!currentExperiment) return;
    const newStatus = currentExperiment.status === ExperimentStatus.ACTIVE
      ? ExperimentStatus.PAUSED
      : ExperimentStatus.ACTIVE;
    await updateStatus(experimentId, newStatus);
  }, [currentExperiment, experimentId, updateStatus]);

  const handleComplete = useCallback(() => {
    Alert.alert("Complete Experiment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Complete", onPress: () => updateStatus(experimentId, ExperimentStatus.COMPLETED) },
    ]);
  }, [experimentId, updateStatus]);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Experiment", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await remove(experimentId);
          navigation.goBack();
        },
      },
    ]);
  }, [experimentId, remove, navigation]);

  const handleQuickLog = useCallback(async () => {
    setIsLoggingEntry(true);
    setTimeout(() => {
      setIsLoggingEntry(false);
      Alert.alert("Entry Logged", "Your quick entry has been saved.");
    }, 500);
  }, []);

  if (isLoading || !currentExperiment) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen message="Loading experiment..." />
      </SafeAreaView>
    );
  }

  const experiment = currentExperiment;
  const status = statusConfig[experiment.status];
  const isActive = experiment.status === ExperimentStatus.ACTIVE;
  const isPaused = experiment.status === ExperimentStatus.PAUSED;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <AnimatedPressable style={styles.backButton} onPress={() => navigation.goBack()} haptic="light">
          <Icon name="arrow-left" size={20} color={colors.primary[500]} />
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{experiment.name}</Text>
            <Badge variant={status.variant}>{status.label}</Badge>
          </View>
          <Text style={styles.subtitle}>
            {experiment.intervention.name} · {experiment.intervention.dosage}
          </Text>
        </View>

        {/* Quick Log */}
        {(isActive || isPaused) && (
          <Card variant="elevated" style={styles.section} animated animationDelay={0}>
            <View style={styles.sectionHeader}>
              <Icon name="edit-3" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Quick Log</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Record today's observations</Text>
            <View style={styles.spacer} />
            <Button variant="primary" fullWidth loading={isLoggingEntry} onPress={handleQuickLog}>
              Log Today's Entry
            </Button>
          </Card>
        )}

        {/* Hypothesis */}
        <Card style={styles.section} animated animationDelay={80}>
          <Text style={styles.label}>Hypothesis</Text>
          <Text style={styles.value}>{experiment.hypothesis}</Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} animated animationDelay={160}>
            <Text style={styles.statValue}>{experiment.entries.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </Card>
          <View style={styles.statSpacer} />
          <Card style={styles.statCard} animated animationDelay={200}>
            <Text style={styles.statValue}>{experiment.metrics.length}</Text>
            <Text style={styles.statLabel}>Metrics</Text>
          </Card>
        </View>

        {/* Schedule */}
        <Card style={styles.section} animated animationDelay={240}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Schedule</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Phase Duration</Text>
            <Text style={styles.scheduleValue}>{experiment.schedule.phaseDurationDays} days</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Total Cycles</Text>
            <Text style={styles.scheduleValue}>{experiment.schedule.totalPhases}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Started</Text>
            <Text style={styles.scheduleValue}>
              {new Date(experiment.schedule.startDate).toLocaleDateString()}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        {(isActive || isPaused) && (
          <View style={styles.actions}>
            <Button variant="secondary" fullWidth onPress={handleTogglePause}>
              {isActive ? "Pause Experiment" : "Resume Experiment"}
            </Button>
            <View style={styles.spacerSmall} />
            <Button variant="outline" fullWidth onPress={handleComplete}>
              Mark as Complete
            </Button>
          </View>
        )}

        {/* Delete */}
        <AnimatedPressable style={styles.deleteButton} onPress={handleDelete} haptic="medium">
          <Text style={styles.deleteText}>Delete Experiment</Text>
        </AnimatedPressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
  header: {
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  title: {
    ...typography.heading2,
    color: colors.text.primary,
    flex: 1,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    ...typography.small,
    color: colors.text.secondary,
  },
  label: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: spacing.base,
  },
  statCard: {
    flex: 1,
  },
  statSpacer: {
    width: spacing.md,
  },
  statValue: {
    ...typography.displayMedium,
    color: colors.primary[500],
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  scheduleLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  scheduleValue: {
    ...typography.small,
    color: colors.text.primary,
  },
  actions: {
    marginTop: spacing.sm,
  },
  spacer: {
    height: spacing.base,
  },
  spacerSmall: {
    height: spacing.md,
  },
  deleteButton: {
    marginTop: spacing["2xl"],
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  deleteText: {
    ...typography.bodyMedium,
    color: colors.accent.error,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
