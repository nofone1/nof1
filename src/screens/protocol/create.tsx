/**
 * Create Protocol screen.
 * Form for creating a new dosing protocol.
 */

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Card, Icon, AnimatedPressable, PeptidePicker } from "@/components/ui";
import { useProtocolStore } from "@/stores/protocol-store";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import type { Peptide } from "@/types/peptide";

/**
 * Create Protocol screen component.
 */
export function CreateProtocolScreen({
  navigation,
}: MainStackScreenProps<"CreateProtocol">): React.JSX.Element {
  const { createProtocol } = useProtocolStore();

  const [name, setName] = useState("");
  const [selectedPeptideId, setSelectedPeptideId] = useState<string | null>(null);
  const [peptideName, setPeptideName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [route, setRoute] = useState("");
  const [cycleDuration, setCycleDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePeptideSelect = useCallback((peptide: Peptide | null) => {
    if (peptide) {
      setSelectedPeptideId(peptide.id);
      setPeptideName(peptide.name);
      setDosage(peptide.dosing.typicalDose);
      setFrequency(peptide.dosing.frequency);
      setRoute(peptide.dosing.route);
      setCycleDuration(peptide.dosing.cycleDuration);
      setName(`${peptide.name} Protocol`);
    } else {
      setSelectedPeptideId("custom");
      setPeptideName("");
      setDosage("");
      setFrequency("");
      setRoute("");
      setCycleDuration("");
    }
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !peptideName.trim() || !dosage.trim()) {
      setError("Please fill in the required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createProtocol({
        userId: "current-user",
        name: name.trim(),
        peptideId: selectedPeptideId === "custom" ? undefined : (selectedPeptideId ?? undefined),
        peptideName: peptideName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim() || "Once daily",
        route: route.trim() || "Subcutaneous",
        cycleDuration: cycleDuration.trim() || "4 weeks",
        startDate: new Date(),
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch {
      setError("Failed to create protocol.");
    } finally {
      setIsLoading(false);
    }
  }, [name, selectedPeptideId, peptideName, dosage, frequency, route, cycleDuration, notes, createProtocol, navigation]);

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
          <AnimatedPressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            haptic="light"
          >
            <Icon name="arrow-left" size={20} color={colors.primary[500]} />
            <Text style={styles.backText}>Back</Text>
          </AnimatedPressable>

          <View style={styles.header}>
            <Text style={styles.title}>New Protocol</Text>
            <Text style={styles.subtitle}>
              Create a structured dosing plan to track adherence
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Card style={styles.section} animated animationDelay={0}>
            <View style={styles.sectionHeader}>
              <Icon name="package" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Peptide Selection</Text>
            </View>
            <View style={styles.spacer} />
            <PeptidePicker
              selectedPeptideId={selectedPeptideId}
              onSelect={handlePeptideSelect}
              showCustomOption={true}
            />
          </Card>

          <Card style={styles.section} animated animationDelay={80}>
            <View style={styles.sectionHeader}>
              <Icon name="edit-3" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Protocol Details</Text>
            </View>
            <View style={styles.spacer} />
            <Input
              label="Protocol Name"
              placeholder="e.g., BPC-157 Recovery Protocol"
              value={name}
              onChangeText={setName}
            />
            {selectedPeptideId === "custom" && (
              <>
                <View style={styles.spacer} />
                <Input
                  label="Peptide/Supplement Name"
                  placeholder="e.g., BPC-157"
                  value={peptideName}
                  onChangeText={setPeptideName}
                />
              </>
            )}
            <View style={styles.spacer} />
            <Input label="Dosage" placeholder="e.g., 250mcg" value={dosage} onChangeText={setDosage} />
            <View style={styles.spacer} />
            <Input label="Frequency" placeholder="e.g., Twice daily" value={frequency} onChangeText={setFrequency} />
            <View style={styles.spacer} />
            <Input label="Route" placeholder="e.g., Subcutaneous" value={route} onChangeText={setRoute} />
            <View style={styles.spacer} />
            <Input label="Cycle Duration" placeholder="e.g., 4-8 weeks" value={cycleDuration} onChangeText={setCycleDuration} />
            <View style={styles.spacer} />
            <Input
              label="Notes (optional)"
              placeholder="Any additional protocol notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </Card>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleCreate}
            disabled={!name.trim() || !peptideName.trim() || !dosage.trim()}
          >
            Start Protocol
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
