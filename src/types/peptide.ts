/**
 * Core types for peptide database functionality.
 * These types define the structure of peptides, dosing protocols, and research information.
 */

/**
 * Represents the research/approval level of a peptide.
 */
export enum ResearchLevel {
  /** Limited research data available */
  LIMITED_RESEARCH = "limited_research",
  /** Emerging research with early studies */
  EMERGING_RESEARCH = "emerging_research",
  /** Well researched with substantial evidence */
  WELL_RESEARCHED = "well_researched",
  /** Extensively studied with comprehensive data */
  EXTENSIVELY_STUDIED = "extensively_studied",
  /** FDA approved for specific indications */
  FDA_APPROVED = "fda_approved",
}

/**
 * Represents the administration route for a peptide.
 */
export enum AdministrationRoute {
  /** Subcutaneous injection */
  INJECTABLE = "injectable",
  /** Oral administration */
  ORAL = "oral",
  /** Nasal spray */
  NASAL = "nasal",
  /** Topical application */
  TOPICAL = "topical",
}

/**
 * Represents the category/application area of a peptide.
 */
export enum PeptideCategory {
  /** Weight loss and fat reduction */
  WEIGHT_LOSS = "weight_loss",
  /** Metabolic health and insulin sensitivity */
  METABOLISM = "metabolism",
  /** Anti-aging and longevity */
  ANTI_AGING = "anti_aging",
  /** Cognitive enhancement */
  COGNITIVE = "cognitive",
  /** Neuroprotection */
  NEUROPROTECTION = "neuroprotection",
  /** Tissue repair and healing */
  TISSUE_REPAIR = "tissue_repair",
  /** Muscle growth */
  MUSCLE_GROWTH = "muscle_growth",
  /** Cardiovascular health */
  CARDIOVASCULAR = "cardiovascular",
  /** Diabetes management */
  DIABETES = "diabetes",
  /** Growth hormone related */
  GROWTH_HORMONE = "growth_hormone",
  /** Exercise and performance */
  EXERCISE = "exercise",
  /** Sexual health and function */
  SEXUAL_HEALTH = "sexual_health",
  /** Immune system support */
  IMMUNE_SUPPORT = "immune_support",
  /** Mood and mental health */
  MOOD = "mood",
  /** Social bonding and behavior */
  SOCIAL = "social",
}

/**
 * Represents dosing information for a peptide.
 * @property typicalDose - Standard dose range (e.g., "5-15mg")
 * @property frequency - How often to administer (e.g., "Once daily")
 * @property route - Primary administration route description
 * @property routeDetails - Additional details about injection sites
 * @property cycleDuration - Typical cycle length (e.g., "4-12 weeks")
 * @property storageTemp - Storage temperature range
 * @property storageNotes - Additional storage instructions
 */
export interface DosingInfo {
  typicalDose: string;
  frequency: string;
  route: string;
  routeDetails: string;
  cycleDuration: string;
  storageTemp: string;
  storageNotes: string;
}

/**
 * Represents the overview/description of a peptide.
 * @property description - What the peptide is and its origin
 * @property keyBenefits - Primary benefits and effects
 * @property mechanism - How the peptide works (mechanism of action)
 */
export interface PeptideOverview {
  description: string;
  keyBenefits: string;
  mechanism: string;
}

/**
 * Represents molecular information about a peptide.
 * @property weight - Molecular weight in Daltons
 * @property length - Number of amino acids
 * @property type - Classification (e.g., "Tripeptide", "GHRH analog")
 * @property sequence - Amino acid sequence
 * @property sequenceNote - Additional notes about the sequence
 */
export interface MolecularInfo {
  weight: string;
  length: number;
  type: string;
  sequence: string;
  sequenceNote?: string;
}

/**
 * Represents a research protocol for a peptide.
 * @property goal - Target outcome (e.g., "Metabolic health")
 * @property dose - Recommended dose for this protocol
 * @property frequency - Administration frequency
 * @property route - Administration route
 */
export interface ResearchProtocol {
  goal: string;
  dose: string;
  frequency: string;
  route: string;
}

/**
 * Represents a research indication with effectiveness rating.
 * @property name - Name of the indication (e.g., "Weight Loss")
 * @property effectiveness - Effectiveness level
 * @property details - Array of specific use cases with descriptions
 */
export interface ResearchIndication {
  name: string;
  effectiveness: "most_effective" | "effective" | "moderate";
  details: Array<{
    title: string;
    description: string;
  }>;
}

/**
 * Represents storage information for a peptide.
 * @property temperature - Storage temperature (e.g., "2-8°C")
 * @property condition - Storage condition (e.g., "Refrigerated")
 * @property reconstitutedStability - How long reconstituted solution is stable
 */
export interface StorageInfo {
  temperature: string;
  condition: string;
  reconstitutedStability: string;
}

/**
 * Represents what to expect timeline for a peptide.
 * @property week - Week range (e.g., "1-2")
 * @property description - What to expect during this period
 */
export interface TimelineEntry {
  week: string;
  description: string;
}

/**
 * Represents a complete peptide entry in the database.
 * @property id - Unique identifier for the peptide
 * @property name - Display name (e.g., "MOTS-c")
 * @property shortCode - Short code for badges (e.g., "MOT")
 * @property subtitle - Descriptive subtitle
 * @property researchLevel - Research/approval status
 * @property administrationRoutes - Available administration routes
 * @property categories - Application categories
 * @property dosing - Dosing information
 * @property overview - Description and mechanism
 * @property molecularInfo - Molecular details
 * @property indications - Research indications with effectiveness
 * @property protocols - Research protocols
 * @property sideEffects - Known side effects
 * @property safetyNotes - Safety warnings and contraindications
 * @property storage - Storage requirements
 * @property timeline - What to expect timeline
 */
export interface Peptide {
  id: string;
  name: string;
  shortCode: string;
  subtitle: string;
  researchLevel: ResearchLevel;
  administrationRoutes: AdministrationRoute[];
  categories: PeptideCategory[];
  dosing: DosingInfo;
  overview: PeptideOverview;
  molecularInfo: MolecularInfo;
  indications: ResearchIndication[];
  protocols: ResearchProtocol[];
  sideEffects: string[];
  safetyNotes: string[];
  storage: StorageInfo;
  timeline: TimelineEntry[];
}

/**
 * Helper function to get display text for research level.
 * @param level - The research level enum value
 * @returns Human-readable display text
 */
export function getResearchLevelDisplay(level: ResearchLevel): string {
  const displayMap: Record<ResearchLevel, string> = {
    [ResearchLevel.LIMITED_RESEARCH]: "Limited Research",
    [ResearchLevel.EMERGING_RESEARCH]: "Emerging Research",
    [ResearchLevel.WELL_RESEARCHED]: "Well Researched",
    [ResearchLevel.EXTENSIVELY_STUDIED]: "Extensively Studied",
    [ResearchLevel.FDA_APPROVED]: "FDA Approved",
  };
  return displayMap[level];
}

/**
 * Helper function to get display text for peptide category.
 * @param category - The category enum value
 * @returns Human-readable display text
 */
export function getCategoryDisplay(category: PeptideCategory): string {
  const displayMap: Record<PeptideCategory, string> = {
    [PeptideCategory.WEIGHT_LOSS]: "Weight Loss",
    [PeptideCategory.METABOLISM]: "Metabolism",
    [PeptideCategory.ANTI_AGING]: "Anti-Aging",
    [PeptideCategory.COGNITIVE]: "Cognitive",
    [PeptideCategory.NEUROPROTECTION]: "Neuroprotection",
    [PeptideCategory.TISSUE_REPAIR]: "Tissue Repair",
    [PeptideCategory.MUSCLE_GROWTH]: "Muscle Growth",
    [PeptideCategory.CARDIOVASCULAR]: "Cardiovascular",
    [PeptideCategory.DIABETES]: "Diabetes",
    [PeptideCategory.GROWTH_HORMONE]: "Growth Hormone",
    [PeptideCategory.EXERCISE]: "Exercise",
    [PeptideCategory.SEXUAL_HEALTH]: "Sexual Health",
    [PeptideCategory.IMMUNE_SUPPORT]: "Immune Support",
    [PeptideCategory.MOOD]: "Mood",
    [PeptideCategory.SOCIAL]: "Social",
  };
  return displayMap[category];
}

/**
 * Helper function to get color for research level badges.
 * @param level - The research level enum value
 * @returns Color string for the badge
 */
export function getResearchLevelColor(level: ResearchLevel): string {
  const colorMap: Record<ResearchLevel, string> = {
    [ResearchLevel.LIMITED_RESEARCH]: "#6B7280",
    [ResearchLevel.EMERGING_RESEARCH]: "#F59E0B",
    [ResearchLevel.WELL_RESEARCHED]: "#3B82F6",
    [ResearchLevel.EXTENSIVELY_STUDIED]: "#8B5CF6",
    [ResearchLevel.FDA_APPROVED]: "#10B981",
  };
  return colorMap[level];
}
