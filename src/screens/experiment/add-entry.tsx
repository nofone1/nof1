/** Records one real, persisted observation for an experiment. */

import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable, Button, Card, Icon, Input } from "@/components/ui";
import { useExperiments } from "@/hooks";
import { MetricType, type MetricValue } from "@/types/experiment";
import type { MainStackScreenProps } from "@/types/navigation";
import { colors, spacing, typography } from "@/theme";

export function AddExperimentEntryScreen({
  route,
  navigation,
}: MainStackScreenProps<"AddEntry">): React.JSX.Element {
  const { experimentId } = route.params;
  const { experiments, addEntry } = useExperiments(false);
  const experiment = experiments.find((item) => item.id === experimentId);
  const [isInterventionDay, setIsInterventionDay] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => experiment?.metrics ?? [], [experiment]);

  const valueFor = useCallback(
    (metricId: string, minimum = 1, maximum = 10): string =>
      values[metricId] ?? String(Math.round((minimum + maximum) / 2)),
    [values]
  );

  const setValue = useCallback((metricId: string, value: string) => {
    setValues((current) => ({ ...current, [metricId]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!experiment) {
      setError("This experiment is no longer available.");
      return;
    }

    const metricValues: MetricValue[] = metrics.map((metric) => {
      const raw = valueFor(metric.id, metric.minValue, metric.maxValue);
      if (metric.type === MetricType.BOOLEAN) {
        return { metricId: metric.id, value: raw !== "false" };
      }
      if (metric.type === MetricType.NUMBER || metric.type === MetricType.SCALE) {
        return { metricId: metric.id, value: Number(raw) };
      }
      return { metricId: metric.id, value: raw };
    });

    if (metricValues.some((item) => typeof item.value === "number" && !Number.isFinite(item.value))) {
      setError("Enter a valid value for every numeric metric.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await addEntry(experimentId, {
        experimentId,
        date: new Date(),
        isInterventionDay,
        metricValues,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The entry could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }, [addEntry, experiment, experimentId, isInterventionDay, metrics, navigation, notes, valueFor]);

  if (!experiment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.missing}>
          <Text style={styles.error}>This experiment is no longer available.</Text>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AnimatedPressable style={styles.back} onPress={() => navigation.goBack()} haptic="light">
            <Icon name="arrow-left" size={20} color={colors.primary[500]} />
            <Text style={styles.backText}>Back</Text>
          </AnimatedPressable>

          <Text style={styles.title}>Today's Observation</Text>
          <Text style={styles.subtitle}>{experiment.name}</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <Card style={styles.card}>
            <Text style={styles.label}>PLANNED PHASE</Text>
            <View style={styles.phaseRow}>
              <Button
                variant={isInterventionDay ? "primary" : "outline"}
                onPress={() => setIsInterventionDay(true)}
              >
                Intervention
              </Button>
              <Button
                variant={!isInterventionDay ? "primary" : "outline"}
                onPress={() => setIsInterventionDay(false)}
              >
                Comparison
              </Button>
            </View>
          </Card>

          {metrics.map((metric) => {
            const minimum = metric.minValue ?? 1;
            const maximum = metric.maxValue ?? 10;
            const current = valueFor(metric.id, minimum, maximum);

            return (
              <Card key={metric.id} style={styles.card}>
                <Text style={styles.metricName}>{metric.name}</Text>
                {metric.description && <Text style={styles.metricDescription}>{metric.description}</Text>}

                {metric.type === MetricType.SCALE ? (
                  <>
                    <Text style={styles.scaleValue}>{current}</Text>
                    <Slider
                      minimumValue={minimum}
                      maximumValue={maximum}
                      step={1}
                      value={Number(current)}
                      onValueChange={(value) => setValue(metric.id, String(value))}
                      minimumTrackTintColor={colors.primary[500]}
                      maximumTrackTintColor={colors.border.default}
                      thumbTintColor={colors.primary[500]}
                    />
                  </>
                ) : metric.type === MetricType.BOOLEAN ? (
                  <View style={styles.phaseRow}>
                    <Button variant={current !== "false" ? "primary" : "outline"} onPress={() => setValue(metric.id, "true")}>Yes</Button>
                    <Button variant={current === "false" ? "primary" : "outline"} onPress={() => setValue(metric.id, "false")}>No</Button>
                  </View>
                ) : (
                  <Input
                    label="Value"
                    value={values[metric.id] ?? ""}
                    onChangeText={(value) => setValue(metric.id, value)}
                    keyboardType={metric.type === MetricType.NUMBER ? "decimal-pad" : "default"}
                    placeholder={metric.unit ? `Value in ${metric.unit}` : "Enter your observation"}
                  />
                )}
              </Card>
            );
          })}

          <Card style={styles.card}>
            <Input
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add context about today's observation"
              multiline
              numberOfLines={3}
            />
          </Card>

          <Button fullWidth size="lg" loading={isSaving} onPress={handleSave}>
            Save Observation
          </Button>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  back: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  backText: { ...typography.bodyMedium, color: colors.primary[500] },
  title: { ...typography.heading1, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  error: { ...typography.small, color: colors.accent.error, marginBottom: spacing.lg },
  card: { marginBottom: spacing.base },
  label: { ...typography.caption, color: colors.text.tertiary, marginBottom: spacing.md },
  phaseRow: { flexDirection: "row", gap: spacing.md },
  metricName: { ...typography.heading3, color: colors.text.primary },
  metricDescription: { ...typography.small, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.md },
  scaleValue: { ...typography.heading2, color: colors.primary[500], textAlign: "center", marginVertical: spacing.md },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  bottomSpacer: { height: 80 },
});
