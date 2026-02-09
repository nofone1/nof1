/**
 * Create Experiment screen.
 * Features Feather icons, elegant typography, and refined form styling.
 */

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Card, Icon, PeptidePicker } from "@/components/ui";
import { useExperiments, useLogger } from "@/hooks";
import {
  ExperimentStatus,
  InterventionType,
  MetricType,
  type CreateExperimentInput,
} from "@/types/experiment";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import type { Peptide } from "@/types/peptide";
import { EXPERIMENT_DEFAULTS, METRIC_PRESETS } from "@/utils/constants";
import { usePeptideStore } from "@/stores/peptide-store";

/**
 * Create Experiment screen component.
 *
 * @param navigation - Navigation prop for screen transitions
 * @param route - Route params potentially containing peptideId
 * @returns The Create Experiment screen JSX element
 */
export function CreateExperimentScreen({
  navigation,
  route,
}: MainStackScreenProps<"CreateExperiment">): React.JSX.Element {
  const { create } = useExperiments(false);
  const { log } = useLogger("CreateExperiment");
  const { getPeptideById } = usePeptideStore();

  // Get peptideId from route params if provided
  const peptideId = route.params?.peptideId;

  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [interventionName, setInterventionName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [phaseDuration, setPhaseDuration] = useState(String(EXPERIMENT_DEFAULTS.PHASE_DURATION_DAYS));
  const [totalPhases, setTotalPhases] = useState(String(EXPERIMENT_DEFAULTS.TOTAL_PHASES));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPeptidePreFilled, setIsPeptidePreFilled] = useState(false);
  const [selectedPeptideId, setSelectedPeptideId] = useState<string | null>(null);

  // Pre-fill form with peptide data if peptideId is provided
  useEffect(() => {
    if (peptideId) {
      const peptide = getPeptideById(peptideId);
      if (peptide) {
        setSelectedPeptideId(peptide.id);
        setInterventionName(peptide.name);
        setDosage(peptide.dosing.typicalDose);
        setFrequency(peptide.dosing.frequency);
        setName(`Testing ${peptide.name}`);
        setHypothesis(`Testing the effects of ${peptide.name} on my health and wellbeing.`);
        setIsPeptidePreFilled(true);
        log.info("Pre-filled form with peptide data", { extra: { peptideId } });
      }
    }
  }, [peptideId, getPeptideById, log]);

  /**
   * Handles peptide selection from the picker.
   * Auto-fills form fields when a peptide is selected, clears them for custom entry.
   *
   * @param peptide - The selected peptide, or null for custom entry
   */
  const handlePeptideSelect = useCallback((peptide: Peptide | null) => {
    if (peptide) {
      setSelectedPeptideId(peptide.id);
      setInterventionName(peptide.name);
      setDosage(peptide.dosing.typicalDose);
      setFrequency(peptide.dosing.frequency);
      setIsPeptidePreFilled(true);
      log.info("Selected peptide from picker", { extra: { peptideId: peptide.id } });
    } else {
      // Custom entry selected
      setSelectedPeptideId("custom");
      setInterventionName("");
      setDosage("");
      setFrequency("Once daily");
      setIsPeptidePreFilled(false);
      log.info("Selected custom entry");
    }
  }, [log]);

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
          type: isPeptidePreFilled ? InterventionType.PEPTIDE : InterventionType.SUPPLEMENT,
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
      navigation.navigate("Tabs", { screen: "Experiments" });
    } catch (err) {
      log.error("Failed to create experiment", {}, err instanceof Error ? err : undefined);
      setError("Failed to create experiment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, name, hypothesis, interventionName, dosage, frequency, phaseDuration, totalPhases, create, navigation, log, isPeptidePreFilled]);

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

          {isPeptidePreFilled && (
            <View style={styles.peptideInfoBox}>
              <Icon name="info" size={16} color={colors.primary[400]} style={styles.infoIcon} />
              <Text style={styles.peptideInfoText}>
                Pre-filled with peptide data from the database
              </Text>
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
              hint="e.g., Taking creatine daily will improve my afternoon energy levels"
            />
          </Card>

          {/* Intervention */}
          <Card style={styles.section} animated animationDelay={80}>
            <View style={styles.sectionHeader}>
              <Icon name="package" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>What You're Testing</Text>
            </View>
            <View style={styles.spacer} />
            <PeptidePicker
              selectedPeptideId={selectedPeptideId}
              onSelect={handlePeptideSelect}
              showCustomOption={true}
            />
            {selectedPeptideId === "custom" && (
              <>
                <Input
                  label="Supplement/Intervention Name"
                  placeholder="e.g., Creatine Monohydrate"
                  value={interventionName}
                  onChangeText={setInterventionName}
                />
                <View style={styles.spacer} />
              </>
            )}
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
  peptideInfoBox: {
    backgroundColor: "rgba(91, 138, 114, 0.08)",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  peptideInfoText: {
    ...typography.small,
    color: colors.primary[400],
    flex: 1,
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
