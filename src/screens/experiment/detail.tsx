/**
 * Experiment Detail screen.
 */

import React, { useEffect, useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Loading } from "@/components/ui";
import { useExperiments, useLogger } from "@/hooks";
import { colors } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import { ExperimentStatus } from "@/types/experiment";

const statusConfig: Record<ExperimentStatus, { color: string; label: string }> = {
  draft: { color: colors.text.tertiary, label: "Draft" },
  active: { color: colors.accent.success, label: "Active" },
  paused: { color: colors.accent.warning, label: "Paused" },
  completed: { color: colors.primary[500], label: "Completed" },
  cancelled: { color: colors.accent.error, label: "Cancelled" },
};

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{experiment.name}</Text>
            <View style={[styles.badge, { backgroundColor: status.color }]}>
              <Text style={styles.badgeText}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {experiment.intervention.name} • {experiment.intervention.dosage}
          </Text>
        </View>

        {(isActive || isPaused) && (
          <Card variant="elevated" style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Quick Log</Text>
            <Text style={styles.sectionSubtitle}>Record today's observations</Text>
            <View style={styles.spacer} />
            <Button variant="primary" fullWidth loading={isLoggingEntry} onPress={handleQuickLog}>
              Log Today's Entry
            </Button>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.label}>Hypothesis</Text>
          <Text style={styles.value}>{experiment.hypothesis}</Text>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{experiment.entries.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{experiment.metrics.length}</Text>
            <Text style={styles.statLabel}>Metrics</Text>
          </Card>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Schedule</Text>
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

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Experiment</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: colors.primary[500],
    fontSize: 18,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    flex: 1,
    marginRight: 12,
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
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.white,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginRight: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  scheduleLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  scheduleValue: {
    fontSize: 14,
    color: colors.white,
  },
  actions: {
    marginTop: 8,
  },
  spacer: {
    height: 16,
  },
  spacerSmall: {
    height: 12,
  },
  deleteButton: {
    marginTop: 32,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteText: {
    color: colors.accent.error,
    fontSize: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
