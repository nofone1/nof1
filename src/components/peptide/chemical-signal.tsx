/**
 * Chemical signal visualization for mitohormone / signaling peptides.
 * Renders role, pathway, formula/CAS, and a color-coded residue sequence.
 */

import React from "react";
import { View, Text, StyleSheet, Linking, Pressable } from "react-native";
import { colors, spacing, typography } from "@/theme";
import type { ChemicalSignal, MolecularInfo } from "@/types/peptide";

/**
 * Amino-acid residue class used for chip coloring.
 */
type ResidueClass = "basic" | "acidic" | "polar" | "hydrophobic" | "special" | "unknown";

/**
 * Props for the ChemicalSignalCard component.
 * @property chemicalSignal - Chemical-signal metadata for the peptide
 * @property molecularInfo - Molecular details used for formula/CAS/sequence display
 * @property peptideName - Display name used in accessibility labels
 */
export interface ChemicalSignalCardProps {
  chemicalSignal: ChemicalSignal;
  molecularInfo: MolecularInfo;
  peptideName: string;
}

/**
 * Maps a one-letter amino acid code to a residue chemistry class.
 *
 * @param residue - Single-letter amino acid code
 * @returns Residue class used for chip styling
 * @edgecases Non A-Z / lowercase / multi-char input returns "unknown"
 */
function getResidueClass(residue: string): ResidueClass {
  const code = residue.trim().toUpperCase();
  if (code.length !== 1) {
    return "unknown";
  }

  switch (code) {
    case "R":
    case "K":
    case "H":
      return "basic";
    case "D":
    case "E":
      return "acidic";
    case "S":
    case "T":
    case "N":
    case "Q":
    case "Y":
    case "C":
      return "polar";
    case "A":
    case "V":
    case "L":
    case "I":
    case "M":
    case "F":
    case "W":
      return "hydrophobic";
    case "G":
    case "P":
      return "special";
    default:
      return "unknown";
  }
}

/**
 * Returns the background color for a residue chemistry class.
 *
 * @param residueClass - Residue chemistry classification
 * @returns Hex color string for the chip background
 */
function getResidueColor(residueClass: ResidueClass): string {
  switch (residueClass) {
    case "basic":
      return "#3B82F6";
    case "acidic":
      return "#EF4444";
    case "polar":
      return "#10B981";
    case "hydrophobic":
      return "#8B5CF6";
    case "special":
      return "#F59E0B";
    case "unknown":
      return colors.text.tertiary;
    default: {
      const _exhaustive: never = residueClass;
      return _exhaustive;
    }
  }
}

/**
 * Splits a one-letter peptide sequence into individual residue tokens.
 *
 * @param sequence - One-letter amino acid sequence (may include separators)
 * @returns Array of single-letter residues
 * @edgecases Empty/whitespace sequences return an empty array
 */
function parseOneLetterSequence(sequence: string): string[] {
  return sequence
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .split("")
    .filter((residue) => residue.length === 1);
}

/**
 * Displays chemical-signal identity for a peptide: role, pathway, formula/CAS,
 * and a color-coded primary-structure residue strip.
 *
 * @param props - Component props
 * @returns The rendered chemical signal card contents
 * @throws Does not throw; missing optional fields are omitted from the UI
 */
export function ChemicalSignalCard({
  chemicalSignal,
  molecularInfo,
  peptideName,
}: ChemicalSignalCardProps): React.JSX.Element {
  const residues = parseOneLetterSequence(molecularInfo.sequence);

  const handleOpenPubChem = (): void => {
    if (!chemicalSignal.pubChemCid) {
      return;
    }
    void Linking.openURL(
      `https://pubchem.ncbi.nlm.nih.gov/compound/${chemicalSignal.pubChemCid}`,
    );
  };

  return (
    <View
      accessibilityLabel={`${peptideName} chemical signal`}
      style={styles.container}
    >
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Role</Text>
          <Text style={styles.metaValue}>{chemicalSignal.role}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Pathway</Text>
          <Text style={styles.metaValue}>{chemicalSignal.pathway}</Text>
        </View>
      </View>

      {(molecularInfo.formula || molecularInfo.casNumber) && (
        <View style={styles.identityRow}>
          {molecularInfo.formula ? (
            <View style={styles.identityItem}>
              <Text style={styles.metaLabel}>Formula</Text>
              <Text style={styles.formulaText}>{molecularInfo.formula}</Text>
            </View>
          ) : null}
          {molecularInfo.casNumber ? (
            <View style={styles.identityItem}>
              <Text style={styles.metaLabel}>CAS</Text>
              <Text style={styles.metaValue}>{molecularInfo.casNumber}</Text>
            </View>
          ) : null}
        </View>
      )}

      {residues.length > 0 ? (
        <View style={styles.sequenceBlock}>
          <Text style={styles.metaLabel}>Primary Structure</Text>
          <View style={styles.residueRow}>
            {residues.map((residue, index) => {
              const residueClass = getResidueClass(residue);
              return (
                <View
                  key={`${residue}-${index}`}
                  style={[
                    styles.residueChip,
                    { backgroundColor: getResidueColor(residueClass) },
                  ]}
                >
                  <Text style={styles.residueText}>{residue}</Text>
                </View>
              );
            })}
          </View>
          {chemicalSignal.threeLetterSequence ? (
            <Text style={styles.threeLetterText}>
              {chemicalSignal.threeLetterSequence}
            </Text>
          ) : null}
        </View>
      ) : null}

      {chemicalSignal.pubChemCid ? (
        <Pressable
          onPress={handleOpenPubChem}
          accessibilityRole="link"
          accessibilityLabel={`Open ${peptideName} on PubChem`}
          style={styles.pubChemLink}
        >
          <Text style={styles.pubChemLinkText}>
            PubChem CID {chemicalSignal.pubChemCid}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  metaRow: {
    gap: spacing.md,
  },
  metaItem: {
    gap: spacing.xs,
  },
  metaLabel: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
  },
  metaValue: {
    ...typography.small,
    fontWeight: "500",
    color: colors.text.primary,
    lineHeight: 20,
  },
  identityRow: {
    flexDirection: "row",
    gap: spacing.base,
  },
  identityItem: {
    flex: 1,
    gap: spacing.xs,
  },
  formulaText: {
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "600",
    color: colors.primary[400],
  },
  sequenceBlock: {
    backgroundColor: colors.background.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  residueRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  residueChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  residueText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  threeLetterText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: colors.text.secondary,
    lineHeight: 16,
  },
  pubChemLink: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  pubChemLinkText: {
    ...typography.small,
    color: colors.primary[400],
    fontWeight: "500",
  },
});
