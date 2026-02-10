/**
 * Body map component for selecting injection sites.
 * Uses flexbox rows with a centered body silhouette and tappable site buttons.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AnimatedPressable } from "./animated-pressable";
import { colors, spacing, typography } from "@/theme";
import { InjectionSite, INJECTION_SITE_LABELS } from "@/types/tracking";

interface BodyMapProps {
  selectedSite?: InjectionSite;
  onSelectSite: (site: InjectionSite) => void;
  recentSites?: InjectionSite[];
}

function SiteButton({
  site,
  label,
  isSelected,
  isRecent,
  onPress,
}: {
  site: InjectionSite;
  label: string;
  isSelected: boolean;
  isRecent: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <AnimatedPressable
      style={[styles.siteZone, isSelected && styles.siteZoneSelected]}
      onPress={onPress}
      haptic="light"
    >
      <Text style={[styles.siteLabel, isSelected && styles.siteLabelSelected]}>
        {label}
      </Text>
      {isRecent && !isSelected && <View style={styles.recentDot} />}
    </AnimatedPressable>
  );
}

/**
 * Interactive body map for selecting injection sites.
 *
 * @param selectedSite - Currently selected injection site
 * @param onSelectSite - Callback when a site is selected
 * @param recentSites - Recently used sites (shown with dot indicator)
 */
export function BodyMap({ selectedSite, onSelectSite, recentSites = [] }: BodyMapProps): React.JSX.Element {
  const site = (s: InjectionSite, label: string) => ({
    site: s,
    label,
    isSelected: selectedSite === s,
    isRecent: recentSites.includes(s),
    onPress: () => onSelectSite(s),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Injection Site</Text>

      <View style={styles.body}>
        {/* Head */}
        <View style={styles.headRow}>
          <View style={styles.head} />
        </View>

        {/* Arms + Torso */}
        <View style={styles.row}>
          <SiteButton {...site(InjectionSite.ARM_LEFT, "L Arm")} />
          <View style={styles.torso} />
          <SiteButton {...site(InjectionSite.ARM_RIGHT, "R Arm")} />
        </View>

        {/* Abdomen */}
        <View style={styles.row}>
          <View style={styles.spacer} />
          <View style={styles.abdRow}>
            <SiteButton {...site(InjectionSite.ABDOMEN_LEFT, "L Abd")} />
            <SiteButton {...site(InjectionSite.ABDOMEN_RIGHT, "R Abd")} />
          </View>
          <View style={styles.spacer} />
        </View>

        {/* Glutes */}
        <View style={styles.row}>
          <SiteButton {...site(InjectionSite.GLUTE_LEFT, "L Glute")} />
          <View style={styles.gap} />
          <SiteButton {...site(InjectionSite.GLUTE_RIGHT, "R Glute")} />
        </View>

        {/* Thighs */}
        <View style={styles.row}>
          <SiteButton {...site(InjectionSite.THIGH_LEFT, "L Thigh")} />
          <View style={styles.gap} />
          <SiteButton {...site(InjectionSite.THIGH_RIGHT, "R Thigh")} />
        </View>
      </View>

      {selectedSite && (
        <Text style={styles.selectedText}>
          {INJECTION_SITE_LABELS[selectedSite]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    ...typography.caption,
    color: colors.text.primary,
    marginBottom: spacing.md,
    alignSelf: "flex-start",
  },
  body: {
    width: "100%",
    alignItems: "center",
    gap: spacing.sm,
  },
  headRow: {
    alignItems: "center",
  },
  head: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  torso: {
    width: 64,
    height: 72,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
  },
  abdRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  spacer: {
    width: 72,
  },
  gap: {
    width: 24,
  },
  siteZone: {
    width: 72,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  siteZoneSelected: {
    backgroundColor: "rgba(91, 138, 114, 0.2)",
    borderColor: colors.primary[500],
  },
  siteLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  siteLabelSelected: {
    color: colors.primary[400],
    fontWeight: "600",
  },
  recentDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple[400],
  },
  selectedText: {
    ...typography.small,
    color: colors.primary[400],
    marginTop: spacing.md,
    fontWeight: "500",
  },
});
