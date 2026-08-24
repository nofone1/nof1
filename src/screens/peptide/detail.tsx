/**
 * Peptide Detail screen.
 * Displays comprehensive peptide information on a liquid-glass material surface.
 */

import React, { useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Loading,
  Icon,
  AnimatedPressable,
  Badge,
  GlassChip,
  GlassSurface,
  LiquidGlassAtmosphere,
} from "@/components/ui";
import { DoseDecayChart } from "@/components/peptide";
import { usePeptideStore } from "@/stores/peptide-store";
import { colors, spacing, typography } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import {
  getResearchLevelDisplay,
  getResearchLevelColor,
  getCategoryDisplay,
} from "@/types/peptide";

/**
 * Peptide detail screen component.
 * Shows comprehensive peptide information with a liquid-glass treatment.
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
      { text: "Cancel", style: "cancel" },
    ]);
  }, [selectedPeptide, navigation]);

  if (!selectedPeptide) {
    return (
      <View style={styles.screen}>
        <LiquidGlassAtmosphere />
        <SafeAreaView style={styles.safeArea}>
          <Loading fullScreen message="Loading peptide..." />
        </SafeAreaView>
      </View>
    );
  }

  const peptide = selectedPeptide;
  const researchLevelColor = getResearchLevelColor(peptide.researchLevel);
  const researchLevelText = getResearchLevelDisplay(peptide.researchLevel);

  return (
    <View style={styles.screen}>
      <LiquidGlassAtmosphere />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassChip tint="teal" onPress={() => navigation.goBack()} style={styles.backChip}>
            <View style={styles.backRow}>
              <Icon name="arrow-left" size={18} color={colors.primary[200]} />
              <Text style={styles.backText}>Back</Text>
            </View>
          </GlassChip>

          <GlassSurface intensity="prominent" tint="teal" style={styles.heroCard}>
            <View style={styles.titleRow}>
              <GlassSurface
                intensity="subtle"
                tint="teal"
                style={styles.shortCodeBadge}
                contentStyle={styles.shortCodeContent}
              >
                <Text style={styles.shortCodeText}>{peptide.shortCode}</Text>
              </GlassSurface>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{peptide.name}</Text>
                <View style={[styles.researchBadge, { backgroundColor: researchLevelColor }]}>
                  <Text style={styles.researchBadgeText}>{researchLevelText}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.subtitle}>{peptide.subtitle}</Text>
            <View style={styles.categoriesContainer}>
              {peptide.categories.map((category) => (
                <Badge key={category} variant="purple" size="md">
                  {getCategoryDisplay(category)}
                </Badge>
              ))}
            </View>
          </GlassSurface>

          <GlassSurface
            tint="amber"
            intensity="regular"
            onPress={() => navigation.navigate("Legal", { document: "medical" })}
            style={styles.section}
          >
            <View style={styles.medicalNotice}>
              <Icon name="alert-triangle" size={18} color={colors.accent.warning} />
              <View style={styles.medicalNoticeContent}>
                <Text style={styles.medicalNoticeTitle}>Educational information only</Text>
                <Text style={styles.medicalNoticeText}>
                  Not medical advice or a recommendation to use this compound. Consult a
                  qualified clinician before making health decisions.
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.text.secondary} />
            </View>
          </GlassSurface>

          <GlassSurface style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="book-open" size={18} color={colors.primary[300]} />
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
          </GlassSurface>

          <GlassSurface style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="hexagon" size={18} color={colors.primary[300]} />
              <Text style={styles.sectionTitle}>Molecular Information</Text>
            </View>
            <View style={styles.molecularGrid}>
              <GlassSurface intensity="subtle" style={styles.molecularItem}>
                <Text style={styles.molecularLabel}>Weight</Text>
                <Text style={styles.molecularValue}>{peptide.molecularInfo.weight}</Text>
              </GlassSurface>
              <GlassSurface intensity="subtle" style={styles.molecularItem}>
                <Text style={styles.molecularLabel}>Length</Text>
                <Text style={styles.molecularValue}>{peptide.molecularInfo.length} amino acids</Text>
              </GlassSurface>
              <GlassSurface intensity="subtle" style={styles.molecularItem}>
                <Text style={styles.molecularLabel}>Type</Text>
                <Text style={styles.molecularValue}>{peptide.molecularInfo.type}</Text>
              </GlassSurface>
            </View>
            <GlassSurface intensity="subtle" tint="teal" style={styles.sequenceContainer}>
              <Text style={styles.sequenceLabel}>Amino Acid Sequence</Text>
              <Text style={styles.sequenceText}>{peptide.molecularInfo.sequence}</Text>
              {peptide.molecularInfo.sequenceNote && (
                <Text style={styles.sequenceNote}>{peptide.molecularInfo.sequenceNote}</Text>
              )}
            </GlassSurface>
          </GlassSurface>

          <GlassSurface style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="calendar" size={18} color={colors.primary[300]} />
              <Text style={styles.sectionTitle}>What to Expect</Text>
            </View>
            {peptide.timeline.map((entry, index) => (
              <View key={index} style={styles.timelineRow}>
                <GlassChip tint="teal" style={styles.timelineChip}>
                  <Text style={styles.timelineWeekText}>Week {entry.week}</Text>
                </GlassChip>
                <Text style={styles.timelineDescription}>{entry.description}</Text>
              </View>
            ))}
          </GlassSurface>

          <GlassSurface tint="amber" style={styles.section}>
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
          </GlassSurface>

          <GlassSurface style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="thermometer" size={18} color={colors.primary[300]} />
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
          </GlassSurface>

          {peptide.pharmacokinetics && (
            <GlassSurface style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="trending-down" size={18} color={colors.primary[300]} />
                <Text style={styles.sectionTitle}>Pharmacokinetics</Text>
              </View>
              <DoseDecayChart pharmacokinetics={peptide.pharmacokinetics} />
            </GlassSurface>
          )}

          {peptide.indications.length > 0 && (
            <GlassSurface style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="bar-chart-2" size={18} color={colors.primary[300]} />
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
            </GlassSurface>
          )}

          {peptide.interactions && peptide.interactions.length > 0 && (
            <GlassSurface style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="git-merge" size={18} color={colors.primary[300]} />
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
            </GlassSurface>
          )}

          {peptide.studies && peptide.studies.length > 0 && (
            <GlassSurface style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="bookmark" size={18} color={colors.primary[300]} />
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
            </GlassSurface>
          )}

          <GlassSurface intensity="prominent" tint="teal" style={styles.actionCard}>
            <Pressable onLongPress={handleMoreActions} style={styles.logDoseWrapper}>
              <Button variant="primary" size="lg" fullWidth onPress={handleLogDose}>
                Log Dose
              </Button>
            </Pressable>
            <AnimatedPressable onPress={handleMoreActions} haptic="light">
              <GlassSurface
                intensity="subtle"
                style={styles.moreActionsCard}
                contentStyle={styles.moreActionsRow}
              >
                <Icon name="more-horizontal" size={16} color={colors.text.secondary} />
                <Text style={styles.actionHint}>Protocol, Experiment, Stack...</Text>
                <Icon name="chevron-right" size={14} color={colors.text.tertiary} />
              </GlassSurface>
            </AnimatedPressable>
          </GlassSurface>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  backChip: {
    marginBottom: spacing.xl,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.primary[200],
  },
  heroCard: {
    marginBottom: spacing.base,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  shortCodeBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    padding: 0,
    marginRight: spacing.base,
  },
  shortCodeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: 999,
  },
  researchBadgeText: {
    ...typography.captionSmall,
    fontWeight: "600",
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  medicalNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  medicalNoticeContent: {
    flex: 1,
  },
  medicalNoticeTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  medicalNoticeText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    lineHeight: 18,
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
  overviewLabel: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[300],
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
    gap: spacing.sm,
  },
  molecularItem: {
    flex: 1,
    padding: spacing.md,
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
    color: colors.primary[200],
    marginBottom: spacing.sm,
  },
  sequenceNote: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  timelineChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  timelineWeekText: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[200],
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
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
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
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
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
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  studyTitle: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[300],
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
  moreActionsCard: {
    marginTop: spacing.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  moreActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
