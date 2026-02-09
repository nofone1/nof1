/**
 * Quick Log screen for adding dose and metric entries.
 * Features tabbed interface for logging doses or metrics.
 */

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Card, Button, Input, Icon, PeptidePicker } from "@/components/ui";
import { useTrackingStore } from "@/stores/tracking-store";
import { useLogger } from "@/hooks/use-logger";
import { colors, spacing, typography } from "@/theme";
import type { MainTabScreenProps } from "@/types/navigation";
import type { Peptide } from "@/types/peptide";
import { QuickMetricType, QUICK_METRIC_INFO } from "@/types/tracking";

type LogTab = "dose" | "metric";

/**
 * Quick Log screen component for adding entries.
 *
 * @param navigation - Navigation prop for screen transitions
 * @returns The Quick Log screen JSX element
 */
export function QuickLogScreen({
  navigation,
}: MainTabScreenProps<"Log">): React.JSX.Element {
  const { logDose, logMetric, addToStack } = useTrackingStore();
  const { log } = useLogger("QuickLog");

  const [activeTab, setActiveTab] = useState<LogTab>("dose");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dose form state
  const [selectedPeptideId, setSelectedPeptideId] = useState<string | null>(null);
  const [doseName, setDoseName] = useState("");
  const [dosage, setDosage] = useState("");
  const [doseNotes, setDoseNotes] = useState("");
  const [addToStackChecked, setAddToStackChecked] = useState(false);

  // Metric form state
  const [selectedMetricType, setSelectedMetricType] = useState<QuickMetricType>(QuickMetricType.ENERGY);
  const [metricValue, setMetricValue] = useState(5);
  const [metricNotes, setMetricNotes] = useState("");

  const handlePeptideSelect = useCallback((peptide: Peptide | null) => {
    if (peptide) {
      setSelectedPeptideId(peptide.id);
      setDoseName(peptide.name);
      setDosage(peptide.dosing.typicalDose);
    } else {
      setSelectedPeptideId("custom");
      setDoseName("");
      setDosage("");
    }
  }, []);

  const handleLogDose = useCallback(async () => {
    if (!doseName.trim() || !dosage.trim()) return;

    setIsLoading(true);
    try {
      await logDose({
        peptideId: selectedPeptideId === "custom" ? null : selectedPeptideId,
        name: doseName.trim(),
        dosage: dosage.trim(),
        notes: doseNotes.trim() || undefined,
      });

      if (addToStackChecked && selectedPeptideId !== "custom") {
        await addToStack({
          peptideId: selectedPeptideId,
          name: doseName.trim(),
          dosage: dosage.trim(),
          frequency: "Once daily",
        });
      }

      log.info("Dose logged successfully", { extra: { name: doseName } });
      setSuccess(true);

      // Reset form
      setSelectedPeptideId(null);
      setDoseName("");
      setDosage("");
      setDoseNotes("");
      setAddToStackChecked(false);

      // Navigate to Daily tab after brief delay
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate("Daily");
      }, 1000);
    } catch (error) {
      log.error("Failed to log dose", {}, error instanceof Error ? error : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [doseName, dosage, doseNotes, selectedPeptideId, addToStackChecked, logDose, addToStack, log, navigation]);

  const handleLogMetric = useCallback(async () => {
    setIsLoading(true);
    try {
      await logMetric({
        metricType: selectedMetricType,
        value: metricValue,
        notes: metricNotes.trim() || undefined,
      });

      log.info("Metric logged successfully", { extra: { type: selectedMetricType, value: metricValue } });
      setSuccess(true);

      // Reset form
      setMetricValue(5);
      setMetricNotes("");

      // Navigate to Daily tab after brief delay
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate("Daily");
      }, 1000);
    } catch (error) {
      log.error("Failed to log metric", {}, error instanceof Error ? error : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMetricType, metricValue, metricNotes, logMetric, log, navigation]);

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={48} color={colors.primary[500]} />
          </View>
          <Text style={styles.successText}>Logged!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log Entry</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === "dose" && styles.tabActive]}
            onPress={() => setActiveTab("dose")}
          >
            <Icon
              name="droplet"
              size={18}
              color={activeTab === "dose" ? colors.primary[500] : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === "dose" && styles.tabTextActive]}>
              Dose
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "metric" && styles.tabActive]}
            onPress={() => setActiveTab("metric")}
          >
            <Icon
              name="activity"
              size={18}
              color={activeTab === "metric" ? colors.primary[500] : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === "metric" && styles.tabTextActive]}>
              Metric
            </Text>
          </Pressable>
        </View>

        {/* Dose Form */}
        {activeTab === "dose" && (
          <Card style={styles.formCard}>
            <PeptidePicker
              selectedPeptideId={selectedPeptideId}
              onSelect={handlePeptideSelect}
              showCustomOption={true}
            />

            {selectedPeptideId === "custom" && (
              <>
                <View style={styles.spacer} />
                <Input
                  label="Name"
                  placeholder="e.g., Vitamin D3"
                  value={doseName}
                  onChangeText={setDoseName}
                />
              </>
            )}

            <View style={styles.spacer} />
            <Input
              label="Dosage"
              placeholder="e.g., 5mg"
              value={dosage}
              onChangeText={setDosage}
            />

            <View style={styles.spacer} />
            <Input
              label="Notes (optional)"
              placeholder="Any notes about this dose..."
              value={doseNotes}
              onChangeText={setDoseNotes}
              multiline
              numberOfLines={2}
            />

            {selectedPeptideId && selectedPeptideId !== "custom" && (
              <Pressable
                style={styles.checkboxRow}
                onPress={() => setAddToStackChecked(!addToStackChecked)}
              >
                <View style={[styles.checkbox, addToStackChecked && styles.checkboxChecked]}>
                  {addToStackChecked && <Icon name="check" size={14} color={colors.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Add to my daily stack</Text>
              </Pressable>
            )}

            <View style={styles.spacerLarge} />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleLogDose}
              disabled={!doseName.trim() || !dosage.trim()}
            >
              Log Dose
            </Button>
          </Card>
        )}

        {/* Metric Form */}
        {activeTab === "metric" && (
          <Card style={styles.formCard}>
            <Text style={styles.fieldLabel}>WHAT ARE YOU TRACKING?</Text>
            <View style={styles.metricGrid}>
              {Object.entries(QUICK_METRIC_INFO)
                .filter(([key]) => key !== QuickMetricType.CUSTOM)
                .map(([key, info]) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.metricOption,
                      selectedMetricType === key && styles.metricOptionSelected,
                    ]}
                    onPress={() => setSelectedMetricType(key as QuickMetricType)}
                  >
                    <Icon
                      name={info.icon as any}
                      size={20}
                      color={selectedMetricType === key ? colors.primary[500] : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.metricOptionText,
                        selectedMetricType === key && styles.metricOptionTextSelected,
                      ]}
                    >
                      {info.label}
                    </Text>
                  </Pressable>
                ))}
            </View>

            <View style={styles.spacerLarge} />
            <Text style={styles.fieldLabel}>
              {QUICK_METRIC_INFO[selectedMetricType].label.toUpperCase()} LEVEL
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                {QUICK_METRIC_INFO[selectedMetricType].lowLabel}
              </Text>
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={metricValue}
                  onValueChange={setMetricValue}
                  minimumTrackTintColor={colors.primary[500]}
                  maximumTrackTintColor={colors.border.default}
                  thumbTintColor={colors.primary[500]}
                />
                <Text style={styles.sliderValue}>{metricValue}</Text>
              </View>
              <Text style={styles.sliderLabel}>
                {QUICK_METRIC_INFO[selectedMetricType].highLabel}
              </Text>
            </View>

            <View style={styles.spacer} />
            <Input
              label="Notes (optional)"
              placeholder="Any notes about how you feel..."
              value={metricNotes}
              onChangeText={setMetricNotes}
              multiline
              numberOfLines={2}
            />

            <View style={styles.spacerLarge} />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleLogMetric}
            >
              {`Log ${QUICK_METRIC_INFO[selectedMetricType].label}`}
            </Button>
          </Card>
        )}

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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface.default,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surface.elevated,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[500],
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  spacer: {
    height: spacing.base,
  },
  spacerLarge: {
    height: spacing.xl,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.base,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface.default,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  metricOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.surface.elevated,
  },
  metricOptionText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  metricOptionTextSelected: {
    color: colors.primary[500],
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sliderLabel: {
    ...typography.small,
    color: colors.text.tertiary,
    width: 60,
  },
  sliderWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    ...typography.heading3,
    color: colors.primary[500],
    width: 32,
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(91, 138, 114, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successText: {
    ...typography.heading2,
    color: colors.text.primary,
  },
  bottomSpacer: {
    height: 120,
  },
});
