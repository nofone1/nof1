/**
 * Peptide Detail screen.
 * Displays comprehensive peptide information on liquid-glass panels
 * over a luminous dark atmosphere.
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
  LiquidGlass,
  GlassPill,
  GlassAtmosphere,
  type IconName,
} from "@/components/ui";
import { DoseDecayChart } from "@/components/peptide";
import { usePeptideStore } from "@/stores/peptide-store";
import { colors, spacing, typography, glass, type GlassTint } from "@/theme";
import type { MainStackScreenProps } from "@/types/navigation";
import {
  getResearchLevelDisplay,
  getResearchLevelColor,
  getCategoryDisplay,
} from "@/types/peptide";

interface DetailSectionProps {
  /** Feather icon shown beside the section title. */
  icon: IconName;
  /** Uppercase section title. */
  title: string;
  /** Icon color. Defaults to sage. */
  iconColor?: string;
  /** Glass material for the section panel. */
  tint?: GlassTint;
  /** Section body. */
  children: React.ReactNode;
}

/**
 * Glass-wrapped section with a titled header row.
 *
 * Params:
 *   icon: Feather icon name.
 *   title: Section heading.
 *   iconColor: Optional icon color.
 *   tint: Optional glass tint. Defaults to clear.
 *   children: Section body.
 *
 * Returns:
 *   The rendered glass section.
 */
function DetailSection({
  icon,
  title,
  iconColor = colors.primary[400],
  tint = "clear",
  children,
}: DetailSectionProps): React.JSX.Element {
  return (
    <LiquidGlass tint={tint} style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Icon name={icon} size={18} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </LiquidGlass>
  );
}

/**
 * Peptide detail screen with liquid-glass materials.
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
      <SafeAreaView style={styles.container}>
        <GlassAtmosphere />
        <Loading fullScreen message="Loading peptide..." />
      </SafeAreaView>
    );
  }

  const peptide = selectedPeptide;
  const researchLevelColor = getResearchLevelColor(peptide.researchLevel);
  const researchLevelText = getResearchLevelDisplay(peptide.researchLevel);

  return (
    <SafeAreaView style={styles.container}>
      <GlassAtmosphere />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GlassPill onPress={() => navigation.goBack()} style={styles.backPill}>
          <View style={styles.backPillInner}>
            <Icon name="arrow-left" size={18} color={colors.text.primary} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </GlassPill>

        <LiquidGlass tint="elevated" radius={glass.radius.hero} style={styles.hero}>
          <View style={styles.titleRow}>
            <LiquidGlass tint="sage" radius={18} padding={0} style={styles.shortCodeBadge}>
              <View style={styles.shortCodeInner}>
                <Text style={styles.shortCodeText}>{peptide.shortCode}</Text>
              </View>
            </LiquidGlass>
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
        </LiquidGlass>

        <LiquidGlass
          tint="amber"
          onPress={() => navigation.navigate("Legal", { document: "medical" })}
          style={styles.medicalNotice}
        >
          <View style={styles.medicalNoticeRow}>
            <Icon name="alert-triangle" size={18} color={colors.accent.warning} />
            <View style={styles.medicalNoticeContent}>
              <Text style={styles.medicalNoticeTitle}>Educational information only</Text>
              <Text style={styles.medicalNoticeText}>
                Not medical advice or a recommendation to use this compound. Consult a
                qualified clinician before making health decisions.
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.text.muted} />
          </View>
        </LiquidGlass>

        <DetailSection icon="book-open" title="Overview">
          <Text style={styles.overviewLabel}>What is {peptide.name}?</Text>
          <Text style={styles.overviewText}>{peptide.overview.description}</Text>
          <View style={styles.spacer} />
          <Text style={styles.overviewLabel}>Key Benefits</Text>
          <Text style={styles.overviewText}>{peptide.overview.keyBenefits}</Text>
          <View style={styles.spacer} />
          <Text style={styles.overviewLabel}>Mechanism of Action</Text>
          <Text style={styles.overviewText}>{peptide.overview.mechanism}</Text>
        </DetailSection>

        <DetailSection icon="hexagon" title="Molecular Information">
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
          <LiquidGlass tint="sage" radius={glass.radius.inset} padding={spacing.md}>
            <Text style={styles.sequenceLabel}>Amino Acid Sequence</Text>
            <Text style={styles.sequenceText}>{peptide.molecularInfo.sequence}</Text>
            {peptide.molecularInfo.sequenceNote && (
              <Text style={styles.sequenceNote}>{peptide.molecularInfo.sequenceNote}</Text>
            )}
          </LiquidGlass>
        </DetailSection>

        <DetailSection icon="calendar" title="What to Expect">
          {peptide.timeline.map((entry, index) => (
            <View
              key={index}
              style={[
                styles.timelineRow,
                index === peptide.timeline.length - 1 && styles.rowLast,
              ]}
            >
              <View style={styles.timelineWeek}>
                <Text style={styles.timelineWeekText}>Week {entry.week}</Text>
              </View>
              <Text style={styles.timelineDescription}>{entry.description}</Text>
            </View>
          ))}
        </DetailSection>

        <DetailSection
          icon="alert-triangle"
          title="Side Effects & Safety"
          iconColor={colors.accent.warning}
          tint="amber"
        >
          {peptide.sideEffects.map((effect, index) => (
            <View key={index} style={styles.sideEffectRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.sideEffectText}>{effect}</Text>
            </View>
          ))}
        </DetailSection>

        <DetailSection icon="thermometer" title="Storage">
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
        </DetailSection>

        {peptide.pharmacokinetics && (
          <DetailSection icon="trending-down" title="Pharmacokinetics">
            <DoseDecayChart pharmacokinetics={peptide.pharmacokinetics} />
          </DetailSection>
        )}

        {peptide.indications.length > 0 && (
          <DetailSection icon="bar-chart-2" title="Research Indications">
            {peptide.indications.map((indication, index) => (
              <View
                key={index}
                style={[
                  styles.indicationRow,
                  index === peptide.indications.length - 1 && styles.rowLast,
                ]}
              >
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
          </DetailSection>
        )}

        {peptide.interactions && peptide.interactions.length > 0 && (
          <DetailSection icon="git-merge" title="Peptide Interactions">
            {peptide.interactions.map((interaction, index, interactions) => (
              <AnimatedPressable
                key={index}
                style={[
                  styles.interactionRow,
                  index === interactions.length - 1 && styles.rowLast,
                ]}
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
          </DetailSection>
        )}

        {peptide.studies && peptide.studies.length > 0 && (
          <DetailSection icon="bookmark" title="Research Studies">
            {peptide.studies.map((study, index, studies) => (
              <AnimatedPressable
                key={index}
                style={[
                  styles.studyRow,
                  index === studies.length - 1 && styles.rowLast,
                ]}
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
          </DetailSection>
        )}

        <LiquidGlass tint="elevated" radius={glass.radius.hero} style={styles.actionCard}>
          <Pressable onLongPress={handleMoreActions} style={styles.logDoseWrapper}>
            <Button variant="primary" size="lg" fullWidth onPress={handleLogDose}>
              Log Dose
            </Button>
          </Pressable>
          <GlassPill onPress={handleMoreActions} style={styles.moreActionsPill}>
            <View style={styles.moreActionsRow}>
              <Icon name="more-horizontal" size={16} color={colors.text.secondary} />
              <Text style={styles.actionHint}>Protocol, Experiment, Stack...</Text>
              <Icon name="chevron-right" size={14} color={colors.text.tertiary} />
            </View>
          </GlassPill>
        </LiquidGlass>

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
  backPill: {
    marginBottom: spacing.xl,
  },
  backPillInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  hero: {
    marginBottom: spacing.base,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  shortCodeBadge: {
    width: 58,
    height: 58,
    marginRight: spacing.base,
  },
  shortCodeInner: {
    width: 58,
    height: 58,
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
    marginBottom: spacing.base,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  medicalNotice: {
    marginBottom: spacing.base,
  },
  medicalNoticeRow: {
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
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  timelineWeek: {
    width: 80,
  },
  timelineWeekText: {
    ...typography.small,
    fontWeight: "500",
    color: colors.primary[300],
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
    flexShrink: 1,
    textAlign: "right",
    marginLeft: spacing.md,
  },
  indicationRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  rowLast: {
    borderBottomWidth: 0,
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
  moreActionsPill: {
    marginTop: spacing.base,
    alignSelf: "stretch",
  },
  moreActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  bottomSpacer: {
    height: spacing["2xl"],
  },
});
