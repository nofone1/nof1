/**
 * Create Protocol screen.
 * Form for creating a new recurring intervention routine.
 */

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Card, Icon, AnimatedPressable } from "@/components/ui";
import { useProtocolStore } from "@/stores/protocol-store";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";

/**
 * Create Protocol screen component.
 */
export function CreateProtocolScreen({
  navigation,
}: MainStackScreenProps<"CreateProtocol">): React.JSX.Element {
  const { createProtocol } = useProtocolStore();

  const [name, setName] = useState("");
  const [interventionName, setInterventionName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [route, setRoute] = useState("");
  const [cycleDuration, setCycleDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !interventionName.trim() || !dosage.trim() || !frequency.trim()) {
      setError("Please fill in the required fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createProtocol({
        userId: "current-user",
        name: name.trim(),
        peptideId: undefined,
        peptideName: interventionName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        route: route.trim(),
        cycleDuration: cycleDuration.trim(),
        startDate: new Date(),
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch {
      setError("Failed to create protocol.");
    } finally {
      setIsLoading(false);
    }
  }, [name, interventionName, dosage, frequency, route, cycleDuration, notes, createProtocol, navigation]);

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
              Save a routine you independently chose so you can track adherence
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Card style={styles.section} animated animationDelay={0}>
            <View style={styles.sectionHeader}>
              <Icon name="edit-3" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Protocol Details</Text>
            </View>
            <View style={styles.spacer} />
            <Input
              label="Protocol Name"
              placeholder="e.g., Morning movement routine"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.spacer} />
            <Input
              label="Intervention Name"
              placeholder="e.g., Morning walk"
              value={interventionName}
              onChangeText={setInterventionName}
              hint="Enter only an intervention you independently decided to track"
            />
            <View style={styles.spacer} />
            <Input label="Amount or Duration" placeholder="e.g., 20 minutes" value={dosage} onChangeText={setDosage} />
            <View style={styles.spacer} />
            <Input label="Frequency" placeholder="e.g., Weekday mornings" value={frequency} onChangeText={setFrequency} />
            <View style={styles.spacer} />
            <Input label="Method (optional)" placeholder="e.g., Outdoors" value={route} onChangeText={setRoute} />
            <View style={styles.spacer} />
            <Input label="Routine Duration (optional)" placeholder="e.g., 4 weeks" value={cycleDuration} onChangeText={setCycleDuration} />
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
            disabled={!name.trim() || !interventionName.trim() || !dosage.trim() || !frequency.trim()}
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
