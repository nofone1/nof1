/**
 * Peptide Detail screen.
 * Displays comprehensive information about a peptide including dosing, protocols, and safety.
 */

import React, { useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Loading } from "@/components/ui";
import { usePeptideStore } from "@/stores/peptide-store";
import { colors } from "@/theme";
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

  useEffect(() => {
    selectPeptide(peptideId);
    return () => clearSelection();
  }, [peptideId, selectPeptide, clearSelection]);

  const handleUseInExperiment = useCallback(() => {
    if (selectedPeptide) {
      navigation.navigate("Tabs", {
        screen: "CreateExperiment",
        params: { peptideId: selectedPeptide.id },
      });
    }
  }, [selectedPeptide, navigation]);

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

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
            <View key={category} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getCategoryDisplay(category)}</Text>
            </View>
          ))}
        </View>

        {/* Quick Dosing Info */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Dosing Overview</Text>
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
          <Text style={styles.sectionTitle}>📖 Overview</Text>
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
          <Text style={styles.sectionTitle}>🧬 Molecular Information</Text>
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
          <Text style={styles.sectionTitle}>📋 Research Protocols</Text>
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
          <Text style={styles.sectionTitle}>📅 What to Expect</Text>
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
          <Text style={styles.sectionTitle}>⚠️ Side Effects & Safety</Text>
          {peptide.sideEffects.map((effect, index) => (
            <View key={index} style={styles.sideEffectRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.sideEffectText}>{effect}</Text>
            </View>
          ))}
        </Card>

        {/* Storage */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🧊 Storage</Text>
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

        {/* Use in Experiment Button */}
        <View style={styles.actionContainer}>
          <Button variant="primary" size="lg" fullWidth onPress={handleUseInExperiment}>
            Use in Experiment
          </Button>
          <Text style={styles.actionHint}>
            Pre-fill experiment form with {peptide.name} dosing information
          </Text>
        </View>

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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: colors.primary[500],
    fontSize: 18,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  shortCodeBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  shortCodeText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  researchBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  researchBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary[400],
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 16,
  },
  dosingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  dosingItem: {
    width: "50%",
    marginBottom: 12,
  },
  dosingLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dosingValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  routeDetails: {
    fontSize: 13,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[400],
    marginBottom: 8,
  },
  overviewText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  spacer: {
    height: 16,
  },
  molecularGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  molecularItem: {
    flex: 1,
  },
  molecularLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  molecularValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  sequenceContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 12,
  },
  sequenceLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  sequenceText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: colors.primary[400],
    marginBottom: 8,
  },
  sequenceNote: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  protocolRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  protocolGoal: {
    flex: 1,
  },
  protocolGoalText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  protocolDetails: {
    flex: 1,
    alignItems: "flex-end",
  },
  protocolDetailText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  protocolRouteText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  timelineRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  timelineWeek: {
    width: 80,
  },
  timelineWeekText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary[400],
  },
  timelineDescription: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  sideEffectRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.accent.warning,
    marginRight: 8,
    marginTop: 2,
  },
  sideEffectText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  storageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  storageLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  actionContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  actionHint: {
    marginTop: 12,
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  bottomSpacer: {
    height: 32,
  },
});
