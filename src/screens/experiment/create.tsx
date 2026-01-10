/**
 * Create Experiment screen.
 */

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Card } from "@/components/ui";
import { useExperiments, useLogger } from "@/hooks";
import {
  ExperimentStatus,
  InterventionType,
  MetricType,
  type CreateExperimentInput,
} from "@/types/experiment";
import { colors } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import { EXPERIMENT_DEFAULTS, METRIC_PRESETS } from "@/utils/constants";

export function CreateExperimentScreen({
  navigation,
}: MainTabScreenProps<"CreateExperiment">): React.JSX.Element {
  const { create } = useExperiments(false);
  const { log } = useLogger("CreateExperiment");

  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [interventionName, setInterventionName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [phaseDuration, setPhaseDuration] = useState(String(EXPERIMENT_DEFAULTS.PHASE_DURATION_DAYS));
  const [totalPhases, setTotalPhases] = useState(String(EXPERIMENT_DEFAULTS.TOTAL_PHASES));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    if (!name.trim()) {
      setError("Please enter an experiment name.");
      return false;
    }
    if (!hypothesis.trim()) {
      setError("Please enter your hypothesis.");
      return false;
    }
    if (!interventionName.trim()) {
      setError("Please enter what you're testing.");
      return false;
    }
    if (!dosage.trim()) {
      setError("Please enter the dosage.");
      return false;
    }
    return true;
  }, [name, hypothesis, interventionName, dosage]);

  const handleCreate = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const input: CreateExperimentInput = {
        userId: "current-user",
        name: name.trim(),
        hypothesis: hypothesis.trim(),
        intervention: {
          id: `int-${Date.now()}`,
          name: interventionName.trim(),
          type: InterventionType.SUPPLEMENT,
          dosage: dosage.trim(),
          frequency: frequency.trim(),
        },
        metrics: [
          {
            id: `metric-${Date.now()}`,
            name: METRIC_PRESETS[0].name,
            description: METRIC_PRESETS[0].description,
            type: MetricType.SCALE,
            minValue: 1,
            maxValue: 10,
          },
        ],
        schedule: {
          startDate: new Date(),
          phaseDurationDays: parseInt(phaseDuration, 10) || EXPERIMENT_DEFAULTS.PHASE_DURATION_DAYS,
          totalPhases: parseInt(totalPhases, 10) || EXPERIMENT_DEFAULTS.TOTAL_PHASES,
          reminderTime: EXPERIMENT_DEFAULTS.REMINDER_TIME,
        },
        status: ExperimentStatus.ACTIVE,
      };

      await create(input);
      navigation.navigate("Home");
    } catch (err) {
      log.error("Failed to create experiment", {}, err instanceof Error ? err : undefined);
      setError("Failed to create experiment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, name, hypothesis, interventionName, dosage, frequency, phaseDuration, totalPhases, create, navigation, log]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>New Experiment</Text>
            <Text style={styles.subtitle}>
              Set up your N-of-1 experiment to test what works for you
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Basic Information</Text>
            <View style={styles.spacer} />
            <Input
              label="Experiment Name"
              placeholder="e.g., Testing Creatine for Energy"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.spacer} />
            <Input
              label="Hypothesis"
              placeholder="What do you expect to observe?"
              value={hypothesis}
              onChangeText={setHypothesis}
              multiline
              numberOfLines={3}
              hint="e.g., Taking creatine daily will improve my afternoon energy levels"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💊 What You're Testing</Text>
            <View style={styles.spacer} />
            <Input
              label="Supplement/Intervention Name"
              placeholder="e.g., Creatine Monohydrate"
              value={interventionName}
              onChangeText={setInterventionName}
            />
            <View style={styles.spacer} />
            <Input
              label="Dosage"
              placeholder="e.g., 5g"
              value={dosage}
              onChangeText={setDosage}
            />
            <View style={styles.spacer} />
            <Input
              label="Frequency"
              placeholder="e.g., Once daily"
              value={frequency}
              onChangeText={setFrequency}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Schedule</Text>
            <View style={styles.spacer} />
            <Input
              label="Phase Duration (days)"
              placeholder="7"
              value={phaseDuration}
              onChangeText={setPhaseDuration}
              keyboardType="number-pad"
              hint="How many days for each on/off phase"
            />
            <View style={styles.spacer} />
            <Input
              label="Total Cycles"
              placeholder="4"
              value={totalPhases}
              onChangeText={setTotalPhases}
              keyboardType="number-pad"
              hint="Number of complete on/off cycles"
            />
          </Card>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleCreate}
          >
            Start Experiment
          </Button>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: colors.accent.error,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  spacer: {
    height: 16,
  },
  bottomSpacer: {
    height: 96,
  },
});
