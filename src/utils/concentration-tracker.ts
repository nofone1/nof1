/**
 * Concentration tracking utility.
 * Calculates estimated blood concentration based on dose history and pharmacokinetics.
 */

import type { DoseEntry } from "@/types/tracking";
import type { Pharmacokinetics } from "@/types/peptide";
import { calculateDecay } from "./pharmacokinetics";

export interface ConcentrationLevel {
  peptideName: string;
  peptideId: string | null;
  percentage: number;
  status: "higher" | "declining" | "low";
  lastDoseTime: Date;
  halfLifeHours: number;
}

/**
 * Calculate current estimated concentration for each peptide based on dose history.
 * @param doses - Recent dose entries
 * @param pharmacokineticsMap - Map of peptideId to pharmacokinetics data
 * @returns Array of concentration levels per peptide
 */
export function calculateConcentrations(
  doses: DoseEntry[],
  pharmacokineticsMap: Map<string, Pharmacokinetics>,
): ConcentrationLevel[] {
  const now = new Date();
  const peptideDoses = new Map<string, DoseEntry[]>();

  // Group doses by peptide
  for (const dose of doses) {
    const key = dose.peptideId ?? dose.name;
    const existing = peptideDoses.get(key) ?? [];
    existing.push(dose);
    peptideDoses.set(key, existing);
  }

  const results: ConcentrationLevel[] = [];

  for (const peptideDoseList of peptideDoses.values()) {
    const firstDose = peptideDoseList[0];
    const pk = firstDose.peptideId ? pharmacokineticsMap.get(firstDose.peptideId) : undefined;
    if (!pk) continue;

    // Sum concentration from all recent doses (superposition)
    let totalConcentration = 0;
    let lastDoseTime = new Date(0);

    for (const dose of peptideDoseList) {
      const doseTime = new Date(dose.timestamp);
      const hoursElapsed = (now.getTime() - doseTime.getTime()) / (1000 * 60 * 60);
      totalConcentration += calculateDecay(pk.halfLifeHours, hoursElapsed);

      if (doseTime > lastDoseTime) {
        lastDoseTime = doseTime;
      }
    }

    // Cap at 100%
    const percentage = Math.min(totalConcentration, 100);

    // Determine status
    let status: ConcentrationLevel["status"];
    if (percentage > 40) {
      status = "higher";
    } else if (percentage > 10) {
      status = "declining";
    } else {
      status = "low";
    }

    results.push({
      peptideName: firstDose.name,
      peptideId: firstDose.peptideId,
      percentage,
      status,
      lastDoseTime,
      halfLifeHours: pk.halfLifeHours,
    });
  }

  return results.sort((a, b) => b.percentage - a.percentage);
}
