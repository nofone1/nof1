/**
 * Create Experiment screen.
 * Features Feather icons, elegant typography, and refined form styling.
 */

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Card, Icon, AnimatedPressable } from "@/components/ui";
import { useExperiments, useLogger } from "@/hooks";
import {
  ExperimentStatus,
  InterventionType,
  MetricType,
  type CreateExperimentInput,
} from "@/types/experiment";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import { EXPERIMENT_DEFAULTS, METRIC_PRESETS } from "@/utils/constants";

/**
 * Create Experiment screen component.
 *
 * @param navigation - Navigation prop for screen transitions
 * @returns The Create Experiment screen JSX element
 */
export function CreateExperimentScreen({
  navigation,
}: MainStackScreenProps<"CreateExperiment">): React.JSX.Element {
  const { create } = useExperiments(false);
  const { log } = useLogger("CreateExperiment");

  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [interventionName, setInterventionName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
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
      setError("Please enter the amount or duration you chose.");
      return false;
    }
    if (!frequency.trim()) {
      setError("Please enter the frequency you chose.");
      return false;
    }
    const parsedPhaseDuration = Number(phaseDuration);
    if (!Number.isInteger(parsedPhaseDuration) || parsedPhaseDuration < 1 || parsedPhaseDuration > 30) {
      setError("Phase duration must be a whole number from 1 to 30 days.");
      return false;
    }
    const parsedCycles = Number(totalPhases);
    if (!Number.isInteger(parsedCycles) || parsedCycles < 1 || parsedCycles > 12) {
      setError("Total cycles must be a whole number from 1 to 12.");
      return false;
    }
    return true;
  }, [name, hypothesis, interventionName, dosage, frequency, phaseDuration, totalPhases]);

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
          type: InterventionType.OTHER,
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
          phaseDurationDays: Number(phaseDuration),
          totalPhases: Number(totalPhases),
          reminderTime: EXPERIMENT_DEFAULTS.REMINDER_TIME,
        },
        status: ExperimentStatus.ACTIVE,
      };

      await create(input);
      navigation.navigate("Experiments");
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
          <AnimatedPressable style={styles.backButton} onPress={() => navigation.goBack()} haptic="light">
            <Icon name="arrow-left" size={20} color={colors.primary[500]} />
            <Text style={styles.backText}>Back</Text>
          </AnimatedPressable>

          <View style={styles.header}>
            <Text style={styles.title}>New Experiment</Text>
            <Text style={styles.subtitle}>
              Track an intervention you independently chose. Nof1 does not provide medical advice.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Basic Information */}
          <Card style={styles.section} animated animationDelay={0}>
            <View style={styles.sectionHeader}>
              <Icon name="file-text" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
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
              hint="e.g., A morning walk may coincide with higher afternoon energy ratings"
            />
          </Card>

          {/* Intervention */}
          <Card style={styles.section} animated animationDelay={80}>
            <View style={styles.sectionHeader}>
              <Icon name="package" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>What You're Testing</Text>
            </View>
            <View style={styles.spacer} />
            <Input
              label="Intervention Name"
              placeholder="e.g., Morning walk"
              value={interventionName}
              onChangeText={setInterventionName}
              hint="Enter only an intervention you independently decided to track"
            />
            <View style={styles.spacer} />
            <Input
              label="Amount or Duration"
              placeholder="e.g., 20 minutes"
              value={dosage}
              onChangeText={setDosage}
            />
            <View style={styles.spacer} />
            <Input
              label="Frequency"
              placeholder="e.g., Weekday mornings"
              value={frequency}
              onChangeText={setFrequency}
            />
          </Card>

          {/* Schedule */}
          <Card style={styles.section} animated animationDelay={160}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Schedule</Text>
            </View>
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
    marginBottom: spacing["2xl"],
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorBox: {
    backgroundColor: "rgba(196, 91, 91, 0.08)",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.small,
    color: colors.accent.error,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.primary,
  },
  spacer: {
    height: spacing.base,
  },
  bottomSpacer: {
    height: 120,
  },
});
