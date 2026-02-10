/**
 * Peptide Detail screen.
 * Displays comprehensive information about a peptide including dosing, protocols, and safety.
 */

import React, { useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Loading, Icon, AnimatedPressable, Badge } from "@/components/ui";
import { DoseDecayChart, ReconstitutionCalculator } from "@/components/peptide";
import { usePeptideStore } from "@/stores/peptide-store";
import { useTrackingStore } from "@/stores/tracking-store";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import {
  getResearchLevelDisplay,
  getResearchLevelColor,
  getCategoryDisplay,
} from "@/types/peptide";

/**
 * Peptide detail screen component.
 * Shows comprehensive peptide information with option to use in experiment.
 *
 * @param props - Navigation props with peptideId param
 * @returns The rendered detail screen
 */
export function PeptideDetailScreen({
  route,
  navigation,
}: MainStackScreenProps<"PeptideDetail">): React.JSX.Element {
  const { peptideId } = route.params;
  const { selectedPeptide, selectPeptide, clearSelection } = usePeptideStore();
  const { addToStack } = useTrackingStore();

  useEffect(() => {
    selectPeptide(peptideId);
    return () => clearSelection();
  }, [peptideId, selectPeptide, clearSelection]);

  const handleLogDose = useCallback(() => {
    navigation.navigate("Tabs", { screen: "Log" });
  }, [navigation]);

  const handleMoreActions = useCallback(() => {
    if (!selectedPeptide) return;
    Alert.alert(selectedPeptide.name, "Choose an action", [
      {
        text: "Use in Protocol",
        onPress: () => navigation.navigate("CreateProtocol"),
      },
      {
        text: "Use in Experiment",
        onPress: () => navigation.navigate("CreateExperiment", { peptideId: selectedPeptide.id }),
      },
      {
        text: "Add to My Stack",
        onPress: () => addToStack({
          peptideId: selectedPeptide.id,
          name: selectedPeptide.name,
          dosage: selectedPeptide.dosing.typicalDose,
          frequency: selectedPeptide.dosing.frequency,
        }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [selectedPeptide, navigation, addToStack]);

  if (!selectedPeptide) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen message="Loading peptide..." />
      </SafeAreaView>
    );
  }

  const peptide = selectedPeptide;
  const researchLevelColor = getResearchLevelColor(peptide.researchLevel);
  const researchLevelText = getResearchLevelDisplay(peptide.researchLevel);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedPressable style={styles.backButton} onPress={() => navigation.goBack()} haptic="light">
          <Icon name="arrow-left" size={20} color={colors.primary[500]} />
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.shortCodeBadge}>
              <Text style={styles.shortCodeText}>{peptide.shortCode}</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{peptide.name}</Text>
              <View style={[styles.researchBadge, { backgroundColor: researchLevelColor }]}>
                <Text style={styles.researchBadgeText}>{researchLevelText}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.subtitle}>{peptide.subtitle}</Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {peptide.categories.map((category) => (
            <Badge key={category} variant="purple" size="md">
              {getCategoryDisplay(category)}
            </Badge>
          ))}
        </View>

        {/* Quick Dosing Info */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="clipboard" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Dosing Overview</Text>
          </View>
          <View style={styles.dosingGrid}>
            <View style={styles.dosingItem}>
              <Text style={styles.dosingLabel}>Typical Dose</Text>
              <Text style={styles.dosingValue}>{peptide.dosing.typicalDose}</Text>
            </View>
            <View style={styles.dosingItem}>
              <Text style={styles.dosingLabel}>Frequency</Text>
              <Text style={styles.dosingValue}>{peptide.dosing.frequency}</Text>
            </View>
            <View style={styles.dosingItem}>
              <Text style={styles.dosingLabel}>Route</Text>
              <Text style={styles.dosingValue}>{peptide.dosing.route}</Text>
            </View>
            <View style={styles.dosingItem}>
              <Text style={styles.dosingLabel}>Cycle</Text>
              <Text style={styles.dosingValue}>{peptide.dosing.cycleDuration}</Text>
            </View>
          </View>
          <Text style={styles.routeDetails}>{peptide.dosing.routeDetails}</Text>
        </Card>

        {/* Overview */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="book-open" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>
          <Text style={styles.overviewLabel}>What is {peptide.name}?</Text>
          <Text style={styles.overviewText}>{peptide.overview.description}</Text>
          <View style={styles.spacer} />
          <Text style={styles.overviewLabel}>Key Benefits</Text>
          <Text style={styles.overviewText}>{peptide.overview.keyBenefits}</Text>
          <View style={styles.spacer} />
          <Text style={styles.overviewLabel}>Mechanism of Action</Text>
          <Text style={styles.overviewText}>{peptide.overview.mechanism}</Text>
        </Card>

        {/* Molecular Info */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="hexagon" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Molecular Information</Text>
          </View>
          <View style={styles.molecularGrid}>
            <View style={styles.molecularItem}>
              <Text style={styles.molecularLabel}>Weight</Text>
              <Text style={styles.molecularValue}>{peptide.molecularInfo.weight}</Text>
            </View>
            <View style={styles.molecularItem}>
              <Text style={styles.molecularLabel}>Length</Text>
              <Text style={styles.molecularValue}>{peptide.molecularInfo.length} amino acids</Text>
            </View>
            <View style={styles.molecularItem}>
              <Text style={styles.molecularLabel}>Type</Text>
              <Text style={styles.molecularValue}>{peptide.molecularInfo.type}</Text>
            </View>
          </View>
          <View style={styles.sequenceContainer}>
            <Text style={styles.sequenceLabel}>Amino Acid Sequence</Text>
            <Text style={styles.sequenceText}>{peptide.molecularInfo.sequence}</Text>
            {peptide.molecularInfo.sequenceNote && (
              <Text style={styles.sequenceNote}>{peptide.molecularInfo.sequenceNote}</Text>
            )}
          </View>
        </Card>

        {/* Research Protocols */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="file-text" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Research Protocols</Text>
          </View>
          {peptide.protocols.map((protocol, index) => (
            <View key={index} style={styles.protocolRow}>
              <View style={styles.protocolGoal}>
                <Text style={styles.protocolGoalText}>{protocol.goal}</Text>
              </View>
              <View style={styles.protocolDetails}>
                <Text style={styles.protocolDetailText}>
                  {protocol.dose} • {protocol.frequency}
                </Text>
                <Text style={styles.protocolRouteText}>{protocol.route}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* What to Expect */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="calendar" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>What to Expect</Text>
          </View>
          {peptide.timeline.map((entry, index) => (
            <View key={index} style={styles.timelineRow}>
              <View style={styles.timelineWeek}>
                <Text style={styles.timelineWeekText}>Week {entry.week}</Text>
              </View>
              <Text style={styles.timelineDescription}>{entry.description}</Text>
            </View>
          ))}
        </Card>

        {/* Side Effects & Safety */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="alert-triangle" size={18} color={colors.accent.warning} />
            <Text style={styles.sectionTitle}>Side Effects & Safety</Text>
          </View>
          {peptide.sideEffects.map((effect, index) => (
            <View key={index} style={styles.sideEffectRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.sideEffectText}>{effect}</Text>
            </View>
          ))}
        </Card>

        {/* Storage */}
        <Card style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="thermometer" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Storage</Text>
          </View>
          <View style={styles.storageRow}>
            <Text style={styles.storageLabel}>Temperature</Text>
            <Text style={styles.storageValue}>{peptide.storage.temperature}</Text>
          </View>
          <View style={styles.storageRow}>
            <Text style={styles.storageLabel}>Condition</Text>
            <Text style={styles.storageValue}>{peptide.storage.condition}</Text>
          </View>
          <View style={styles.storageRow}>
            <Text style={styles.storageLabel}>Reconstituted Stability</Text>
            <Text style={styles.storageValue}>{peptide.storage.reconstitutedStability}</Text>
          </View>
        </Card>

        {/* Pharmacokinetics */}
        {peptide.pharmacokinetics && (
          <Card style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="trending-down" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Pharmacokinetics</Text>
            </View>
            <DoseDecayChart pharmacokinetics={peptide.pharmacokinetics} />
          </Card>
        )}

        {/* Research Indications */}
        {peptide.indications.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="bar-chart-2" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Research Indications</Text>
            </View>
            {peptide.indications.map((indication, index) => (
              <View key={index} style={styles.indicationRow}>
                <View style={styles.indicationHeader}>
                  <Text style={styles.indicationName}>{indication.name}</Text>
                  <Badge
                    variant={
                      indication.effectiveness === "most_effective"
                        ? "success"
                        : indication.effectiveness === "effective"
                          ? "primary"
                          : "default"
                    }
                    size="sm"
                  >
                    {indication.effectiveness === "most_effective"
                      ? "Most Effective"
                      : indication.effectiveness === "effective"
                        ? "Effective"
                        : "Moderate"}
                  </Badge>
                </View>
                {indication.details.map((detail, dIndex) => (
                  <View key={dIndex} style={styles.indicationDetail}>
                    <Text style={styles.indicationDetailTitle}>{detail.title}</Text>
                    <Text style={styles.indicationDetailText}>{detail.description}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Card>
        )}

        {/* Interactions */}
        {peptide.interactions && peptide.interactions.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="git-merge" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Peptide Interactions</Text>
            </View>
            {peptide.interactions.map((interaction, index) => (
              <AnimatedPressable
                key={index}
                style={styles.interactionRow}
                onPress={() => navigation.push("PeptideDetail", { peptideId: interaction.peptideId })}
                haptic="light"
              >
                <View style={styles.interactionInfo}>
                  <Text style={styles.interactionName}>{interaction.peptideName}</Text>
                  <Text style={styles.interactionDesc}>{interaction.description}</Text>
                </View>
                <Badge
                  variant={
                    interaction.type === "synergistic"
                      ? "success"
                      : interaction.type === "caution"
                        ? "warning"
                        : "default"
                  }
                  size="sm"
                >
                  {interaction.type === "synergistic"
                    ? "Synergistic"
                    : interaction.type === "caution"
                      ? "Caution"
                      : "Compatible"}
                </Badge>
              </AnimatedPressable>
            ))}
          </Card>
        )}

        {/* Reconstitution Calculator */}
        {peptide.reconstitution && (
          <Card style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="sliders" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Reconstitution Calculator</Text>
            </View>
            <ReconstitutionCalculator
              reconstitution={peptide.reconstitution}
              peptideName={peptide.name}
            />
          </Card>
        )}

        {/* Research Studies */}
        {peptide.studies && peptide.studies.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="bookmark" size={18} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Research Studies</Text>
            </View>
            {peptide.studies.map((study, index) => (
              <AnimatedPressable
                key={index}
                style={styles.studyRow}
                onPress={() => Linking.openURL(`https://doi.org/${study.doi}`)}
                haptic="light"
              >
                <Text style={styles.studyTitle}>{study.title}</Text>
                <Text style={styles.studyMeta}>
                  {study.authors} ({study.year}) · {study.journal}
                </Text>
                <Text style={styles.studySummary}>{study.summary}</Text>
              </AnimatedPressable>
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        <Card variant="elevated" style={styles.actionCard}>
          <Pressable onLongPress={handleMoreActions} style={styles.logDoseWrapper}>
            <Button variant="primary" size="lg" fullWidth onPress={handleLogDose}>
              Log Dose
            </Button>
          </Pressable>
          <AnimatedPressable onPress={handleMoreActions} style={styles.moreActionsRow} haptic="light">
            <Icon name="more-horizontal" size={16} color={colors.text.secondary} />
            <Text style={styles.actionHint}>
              Protocol, Experiment, Stack...
            </Text>
            <Icon name="chevron-right" size={14} color={colors.text.tertiary} />
          </AnimatedPressable>
        </Card>

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
    marginBottom: spacing.base,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  shortCodeBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.base,
  },
  shortCodeText: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  researchBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  researchBadgeText: {
    ...typography.captionSmall,
    fontWeight: "600",
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.primary,
  },
  dosingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  dosingItem: {
    width: "50%",
    marginBottom: spacing.md,
  },
  dosingLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  dosingValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  routeDetails: {
    ...typography.small,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  overviewLabel: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[400],
    marginBottom: spacing.sm,
  },
  overviewText: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  spacer: {
    height: spacing.base,
  },
  molecularGrid: {
    flexDirection: "row",
    marginBottom: spacing.base,
  },
  molecularItem: {
    flex: 1,
  },
  molecularLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  molecularValue: {
    ...typography.small,
    fontWeight: "500",
    color: colors.text.primary,
  },
  sequenceContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  sequenceLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  sequenceText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: colors.primary[400],
    marginBottom: spacing.sm,
  },
  sequenceNote: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  protocolRow: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  protocolGoal: {
    flex: 1,
  },
  protocolGoalText: {
    ...typography.small,
    fontWeight: "500",
    color: colors.text.primary,
  },
  protocolDetails: {
    flex: 1,
    alignItems: "flex-end",
  },
  protocolDetailText: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  protocolRouteText: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
  },
  timelineRow: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  timelineWeek: {
    width: 80,
  },
  timelineWeekText: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[400],
  },
  timelineDescription: {
    flex: 1,
    ...typography.small,
    color: colors.text.secondary,
  },
  sideEffectRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.small,
    color: colors.accent.warning,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  sideEffectText: {
    flex: 1,
    ...typography.small,
    color: colors.text.secondary,
  },
  storageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  storageLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  storageValue: {
    ...typography.small,
    fontWeight: "500",
    color: colors.text.primary,
  },
  indicationRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  indicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  indicationName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  indicationDetail: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
  indicationDetailTitle: {
    ...typography.small,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  indicationDetailText: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  interactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  interactionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  interactionName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  interactionDesc: {
    ...typography.small,
    color: colors.text.secondary,
  },
  studyRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  studyTitle: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[400],
    marginBottom: spacing.xs,
  },
  studyMeta: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  studySummary: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  logDoseWrapper: {
    borderRadius: 100,
    overflow: "hidden",
  },
  actionHint: {
    ...typography.small,
    color: colors.text.secondary,
    flex: 1,
  },
  moreActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
