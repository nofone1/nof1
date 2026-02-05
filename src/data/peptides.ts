/**
 * Static peptide database.
 * Contains comprehensive data for peptides used in N-of-1 experiments.
 * Data sourced from PepPedia research database.
 */

import {
  type Peptide,
  ResearchLevel,
  AdministrationRoute,
  PeptideCategory,
} from "@/types/peptide";

/**
 * MOTS-c peptide data.
 * Mitochondrial-derived peptide for metabolism and anti-aging.
 */
const MOTSc: Peptide = {
  id: "mots-c",
  name: "MOTS-c",
  shortCode: "MOT",
  subtitle: "Mitochondrial Open Reading Frame of the 12S rRNA-c",
  researchLevel: ResearchLevel.EXTENSIVELY_STUDIED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [
    PeptideCategory.METABOLISM,
    PeptideCategory.ANTI_AGING,
    PeptideCategory.EXERCISE,
    PeptideCategory.DIABETES,
  ],
  dosing: {
    typicalDose: "5-15mg",
    frequency: "1x daily or 3x weekly",
    route: "Injectable",
    routeDetails: "Subcutaneous: abdomen, thigh, upper arm (rotate sites)",
    cycleDuration: "4-12 weeks",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description:
      "MOTS-c is a 16-amino acid mitochondrial-derived peptide encoded by the mitochondrial genome. It acts as a mitohormone that regulates metabolic homeostasis, enhances insulin sensitivity, and promotes longevity. MOTS-c operates through the Folate-AICAR-AMPK pathway and can translocate to the nucleus under metabolic stress to regulate gene expression.",
    keyBenefits:
      "Enhanced insulin sensitivity, improved glucose metabolism, activation of AMPK pathway, mitochondrial function optimization, exercise performance enhancement, and potential longevity benefits.",
    mechanism:
      "MOTS-c operates through the Folate-AICAR-AMPK pathway, inhibiting the folate cycle and leading to AMPK activation. Under metabolic stress, it translocates to the nucleus and binds to stress-response transcription factors (NRF2, ATF1/ATF7) to regulate gene expression involved in metabolism, antioxidant response, and cellular stress adaptation.",
  },
  molecularInfo: {
    weight: "2,174.6 Da",
    length: 16,
    type: "Mitochondrial-derived peptide (MDP)",
    sequence: "MRWQEMGYIFYPRKLR",
    sequenceNote: "Encoded by mitochondrial DNA (MT-RNR1 gene) within the 12S rRNA",
  },
  indications: [
    {
      name: "Metabolic",
      effectiveness: "most_effective",
      details: [
        {
          title: "Insulin Resistance",
          description:
            "Improves insulin sensitivity by ~30% in animal studies through AMPK activation. Enhances glucose uptake in skeletal muscle and improves glucose tolerance.",
        },
        {
          title: "Type 2 Diabetes",
          description:
            "Clinical trials show improved glucose homeostasis. Restores metabolic function through enhanced insulin receptor sensitization and AMPK-mediated metabolic regulation.",
        },
        {
          title: "Obesity Prevention",
          description:
            "Prevents obesity despite identical caloric intake in animal models. Promotes fatty acid oxidation and thermogenesis through mitochondrial activation.",
        },
      ],
    },
    {
      name: "Anti-Aging",
      effectiveness: "effective",
      details: [
        {
          title: "Cellular Longevity",
          description:
            "Enhances mitochondrial function and cellular stress resistance, key factors in aging.",
        },
      ],
    },
    {
      name: "Exercise",
      effectiveness: "moderate",
      details: [
        {
          title: "Performance Enhancement",
          description:
            "Single dose improved running time by 12% and distance by 15% in untrained mice.",
        },
      ],
    },
  ],
  protocols: [
    {
      goal: "Metabolic health",
      dose: "5-10mg",
      frequency: "Once daily",
      route: "Subcutaneous",
    },
    {
      goal: "Anti-aging protocol",
      dose: "15mg",
      frequency: "3x weekly",
      route: "Subcutaneous",
    },
    {
      goal: "Exercise performance",
      dose: "10-15mg",
      frequency: "Pre-workout",
      route: "Subcutaneous",
    },
    {
      goal: "Conservative start",
      dose: "5mg",
      frequency: "Once daily",
      route: "Subcutaneous",
    },
  ],
  sideEffects: [
    "Generally well-tolerated in animal studies with minimal side effects",
    "Monitor blood glucose if using diabetes medications - may require dose adjustments",
    "Limited long-term human safety data - use with appropriate medical supervision",
    "May cause mild injection site reactions (redness, swelling)",
    "Not recommended during pregnancy or breastfeeding",
    "Prohibited by WADA for competitive athletes (metabolic modulator)",
  ],
  safetyNotes: [
    "Monitor blood glucose if using diabetes medications",
    "Not FDA approved for human therapeutic use",
    "WADA banned substance for athletes",
    "Limited human clinical data available",
  ],
  storage: {
    temperature: "2-8°C",
    condition: "Refrigerated",
    reconstitutedStability: "14 days",
  },
  timeline: [
    {
      week: "1-2",
      description: "AMPK pathway activation, initial glucose tolerance improvements",
    },
    {
      week: "2-4",
      description: "Enhanced exercise capacity, improved insulin sensitivity",
    },
    {
      week: "4-8",
      description: "Sustained metabolic benefits, potential body composition improvements",
    },
    {
      week: "8-12",
      description: "Maximum mitochondrial function enhancement, metabolic flexibility",
    },
  ],
};

/**
 * Pinealon peptide data.
 * Synthetic tripeptide for neuroprotection and cognitive enhancement.
 */
const Pinealon: Peptide = {
  id: "pinealon",
  name: "Pinealon",
  shortCode: "PIN",
  subtitle: "Synthetic Tripeptide | Neuroprotection & Cognitive Enhancement",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [
    AdministrationRoute.INJECTABLE,
    AdministrationRoute.ORAL,
    AdministrationRoute.NASAL,
  ],
  categories: [
    PeptideCategory.NEUROPROTECTION,
    PeptideCategory.COGNITIVE,
    PeptideCategory.ANTI_AGING,
  ],
  dosing: {
    typicalDose: "5mg",
    frequency: "Once daily",
    route: "Injectable",
    routeDetails: "Subcutaneous: abdomen, thigh, upper arm",
    cycleDuration: "20 days",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description:
      "Pinealon (Glu-Asp-Arg/EDR) is a synthetic tripeptide bioregulator developed in Russia that demonstrates unique DNA-interaction capabilities for neuroprotection and cognitive enhancement. Research suggests benefits for traumatic brain injury recovery, age-related cognitive decline, and cellular aging processes through direct gene expression modulation.",
    keyBenefits:
      "Highest bioavailability, direct systemic delivery, established clinical protocols with proven efficacy for neuroprotection and cognitive enhancement.",
    mechanism:
      "Subcutaneous injection provides optimal bioavailability and systemic distribution for neuroprotection and DNA interaction. Pinealon directly interacts with DNA to modulate gene expression related to neuronal health and cognitive function.",
  },
  molecularInfo: {
    weight: "418.4 Da",
    length: 3,
    type: "Tripeptide",
    sequence: "Glu-Asp-Arg (EDR)",
    sequenceNote: "Synthetic peptide bioregulator with direct DNA interaction capabilities",
  },
  indications: [
    {
      name: "Neuroprotection",
      effectiveness: "most_effective",
      details: [
        {
          title: "Traumatic Brain Injury",
          description:
            "Clinical protocol of 5mg daily subcutaneous injection showed significant cognitive improvements in 72-patient study.",
        },
        {
          title: "Direct CNS Delivery",
          description:
            "Subcutaneous administration allows systemic circulation to brain tissue for neuroprotective effects.",
        },
        {
          title: "Optimal Bioavailability",
          description:
            "Injectable route provides highest systemic exposure for maximal therapeutic effects.",
        },
      ],
    },
    {
      name: "Cognitive",
      effectiveness: "effective",
      details: [
        {
          title: "Memory Enhancement",
          description:
            "Enhanced NMDA receptor expression in hippocampus with neuroplasticity improvements.",
        },
      ],
    },
    {
      name: "Anti-Aging",
      effectiveness: "moderate",
      details: [
        {
          title: "Cellular Protection",
          description:
            "Antioxidant effects at lower concentrations with cell cycle modulation at higher doses.",
        },
      ],
    },
  ],
  protocols: [
    {
      goal: "Neuroprotection",
      dose: "5mg daily",
      frequency: "Once daily",
      route: "Subcutaneous",
    },
    {
      goal: "Cognitive Enhancement",
      dose: "100-300μg",
      frequency: "Daily or every other day",
      route: "Subcutaneous",
    },
    {
      goal: "Anti-aging Protocol",
      dose: "5mg daily",
      frequency: "20 days, 2-3x yearly",
      route: "Subcutaneous",
    },
  ],
  sideEffects: [
    "Use sterile injection technique",
    "Rotate injection sites to prevent irritation",
    "Store reconstituted peptide in refrigerator",
    "Medical supervision recommended",
  ],
  safetyNotes: [
    "Generally well-tolerated with minimal side effects",
    "Rotate injection sites to prevent tissue irritation",
    "Medical supervision recommended for optimal results",
  ],
  storage: {
    temperature: "2-8°C",
    condition: "Refrigerated",
    reconstitutedStability: "30 days",
  },
  timeline: [
    {
      week: "1-2",
      description: "Improved mental clarity and focus",
    },
    {
      week: "2-3",
      description: "Enhanced cognitive processing and memory",
    },
    {
      week: "3-4",
      description: "Peak neuroprotective and anti-aging benefits",
    },
  ],
};

/**
 * Tesamorelin peptide data.
 * FDA-approved GHRH analog for visceral fat reduction.
 */
const Tesamorelin: Peptide = {
  id: "tesamorelin",
  name: "Tesamorelin",
  shortCode: "TES",
  subtitle: "GHRH Analog | Visceral Fat Reduction",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [
    PeptideCategory.WEIGHT_LOSS,
    PeptideCategory.METABOLISM,
    PeptideCategory.MUSCLE_GROWTH,
    PeptideCategory.GROWTH_HORMONE,
  ],
  dosing: {
    typicalDose: "1.4-2mg",
    frequency: "Once daily",
    route: "Injectable",
    routeDetails: "SubQ: Abdomen (avoid navel ±2 inches), rotate sites, avoid bruises/scars",
    cycleDuration: "Continuous",
    storageTemp: "20-25°C",
    storageNotes: "Room temperature before reconstitution",
  },
  overview: {
    description:
      "Tesamorelin is an FDA-approved synthetic growth hormone-releasing hormone (GHRH) analog designed for treating HIV-associated lipodystrophy. This 44-amino acid peptide with a trans-3-hexenoic acid modification selectively reduces visceral adipose tissue while preserving subcutaneous fat, making it unique among growth hormone therapies.",
    keyBenefits:
      "FDA-approved formulation, selective visceral fat targeting, proven clinical efficacy, standardized dosing for reliable results.",
    mechanism:
      "Subcutaneous injection provides optimal bioavailability for GHRH receptor binding and pulsatile GH release stimulation. Selectively targets visceral fat while preserving subcutaneous fat stores.",
  },
  molecularInfo: {
    weight: "5,135.9 Da",
    length: 44,
    type: "GHRH analog",
    sequence:
      "His-Ala-Asp-Gly-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-Gln-Gln-Gly-Glu-Ser-Asn-Gln-Glu-Arg-Gly-Ala-Arg-Ala-Arg-Leu",
    sequenceNote: "Modified with trans-3-hexenoic acid at N-terminus for enhanced stability",
  },
  indications: [
    {
      name: "Weight Loss",
      effectiveness: "most_effective",
      details: [
        {
          title: "HIV-Associated Lipodystrophy",
          description:
            "FDA-approved indication showing 15-20% visceral fat reduction in clinical trials.",
        },
        {
          title: "Selective Visceral Fat Targeting",
          description:
            "Unique mechanism spares subcutaneous fat while reducing harmful visceral adiposity.",
        },
        {
          title: "Sustained Fat Loss",
          description:
            "Maintained weight loss with continuous treatment over 52+ weeks in clinical studies.",
        },
      ],
    },
    {
      name: "Metabolic",
      effectiveness: "effective",
      details: [
        {
          title: "Triglyceride Reduction",
          description: "Improves lipid profile and reduces cardiovascular risk factors.",
        },
      ],
    },
    {
      name: "Muscle Growth",
      effectiveness: "moderate",
      details: [
        {
          title: "Lean Mass Preservation",
          description: "Helps maintain lean body mass during fat loss through GH stimulation.",
        },
      ],
    },
  ],
  protocols: [
    {
      goal: "HIV Lipodystrophy (FDA Approved)",
      dose: "1.4mg daily",
      frequency: "Once daily",
      route: "Subcutaneous injection (abdomen)",
    },
    {
      goal: "Visceral Fat Reduction",
      dose: "2mg daily",
      frequency: "Once daily",
      route: "Subcutaneous injection (rotate sites)",
    },
    {
      goal: "Anti-aging/Body Composition",
      dose: "1-2mg daily",
      frequency: "5-7 days/week",
      route: "Subcutaneous injection (evening)",
    },
    {
      goal: "NAFLD Treatment",
      dose: "2mg daily",
      frequency: "Once daily",
      route: "Subcutaneous injection for 12 months",
    },
  ],
  sideEffects: [
    "Monitor blood glucose regularly - 3.3-fold increased diabetes risk documented",
    "IGF-1 levels should be checked monthly - 47% exceed normal range at 26 weeks",
    "Contraindicated in active malignancy or pituitary disorders",
    "Common side effects include injection site reactions (17%) and joint pain (13%)",
  ],
  safetyNotes: [
    "FDA approved for HIV-associated lipodystrophy",
    "Monitor blood glucose and IGF-1 levels regularly",
    "Contraindicated in active malignancy or pituitary disorders",
    "Effects reverse upon discontinuation",
  ],
  storage: {
    temperature: "20-25°C",
    condition: "Room temperature",
    reconstitutedStability: "7 days (WR formulation)",
  },
  timeline: [
    {
      week: "1-2",
      description:
        "IGF-1 levels begin to rise, possible mild water retention or joint discomfort",
    },
    {
      week: "4-6",
      description: "Early metabolic changes, slight improvements in energy and sleep quality",
    },
    {
      week: "8-12",
      description: "Visible visceral fat reduction begins, waist circumference may decrease",
    },
    {
      week: "12-26",
      description: "Peak effects achieved with significant body composition improvements",
    },
  ],
};

/**
 * Retatrutide peptide data.
 * Triple GLP-1/GIP/Glucagon agonist for weight loss.
 */
const Retatrutide: Peptide = {
  id: "retatrutide",
  name: "Retatrutide",
  shortCode: "RET",
  subtitle: "Triple GLP-1/GIP/Glucagon Agonist | Weight Loss & Diabetes",
  researchLevel: ResearchLevel.EXTENSIVELY_STUDIED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [
    PeptideCategory.WEIGHT_LOSS,
    PeptideCategory.DIABETES,
    PeptideCategory.CARDIOVASCULAR,
    PeptideCategory.METABOLISM,
  ],
  dosing: {
    typicalDose: "0.5-12mg weekly",
    frequency: "Once weekly",
    route: "Injectable",
    routeDetails: "Abdomen, thigh, upper arm - rotate weekly to prevent lipodystrophy",
    cycleDuration: "Continuous therapy",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description:
      "Retatrutide (LY3437943) is a novel triple hormone receptor agonist targeting GLP-1, GIP, and glucagon receptors. Phase III TRIUMPH-4 trial (Dec 2025) achieved 28.7% weight loss (71.2 lbs) at 68 weeks with 12mg dose - the highest recorded for any obesity medication. Currently in late-stage Phase III development by Eli Lilly with FDA approval expected 2026-2027.",
    keyBenefits:
      "Triple hormone receptor activation provides superior weight loss (24.2%), improved glycemic control, and enhanced cardiovascular benefits compared to single or dual agonists.",
    mechanism:
      "Activates GLP-1 for appetite suppression, GIP for insulin sensitivity, and glucagon for increased energy expenditure and hepatic fat oxidation. The triple mechanism provides synergistic effects for weight management.",
  },
  molecularInfo: {
    weight: "4,731.33 Da",
    length: 39,
    type: "Triple GLP-1/GIP/glucagon agonist",
    sequence:
      "His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly-Pro-Ser-Ser-Gly-Ala-Pro-Pro-Pro-Ser",
    sequenceNote: "C20 fatty acid conjugation with Aib residues for DPP-4 resistance",
  },
  indications: [
    {
      name: "Weight Loss",
      effectiveness: "most_effective",
      details: [
        {
          title: "Superior Weight Reduction",
          description:
            "Clinical trials demonstrate 17.5% at 24 weeks and 24.2% at 48 weeks - highest recorded for any obesity medication in development.",
        },
        {
          title: "Sustained Weight Management",
          description:
            "Continuous weight loss throughout trials with no plateau reached at 48 weeks, suggesting greater long-term potential than current therapies.",
        },
        {
          title: "Triple Mechanism Obesity Treatment",
          description:
            "Addresses obesity through appetite suppression, increased energy expenditure, and improved metabolic efficiency via three hormone pathways.",
        },
      ],
    },
    {
      name: "Diabetes",
      effectiveness: "effective",
      details: [
        {
          title: "Glycemic Control",
          description:
            "Superior glucose control through GLP-1 and GIP receptor activation with glucose-dependent insulin release.",
        },
      ],
    },
    {
      name: "Cardiovascular",
      effectiveness: "moderate",
      details: [
        {
          title: "Cardiometabolic Benefits",
          description:
            "Improvements in blood pressure, lipid profiles, and inflammatory markers observed in clinical trials.",
        },
      ],
    },
  ],
  protocols: [
    {
      goal: "Conservative Starting Dose (Week 1-4)",
      dose: "0.5mg weekly",
      frequency: "Once weekly",
      route: "Subcutaneous injection",
    },
    {
      goal: "Low Maintenance Dose (Week 4-8)",
      dose: "1mg weekly",
      frequency: "Once weekly",
      route: "Subcutaneous injection",
    },
    {
      goal: "Standard Escalation (Week 8-12)",
      dose: "2mg weekly",
      frequency: "Once weekly",
      route: "Subcutaneous injection",
    },
    {
      goal: "Moderate Weight Loss (Week 12-16)",
      dose: "4mg weekly",
      frequency: "Once weekly",
      route: "Subcutaneous injection",
    },
    {
      goal: "Advanced Weight Loss (Week 16-20)",
      dose: "8mg weekly",
      frequency: "Once weekly",
      route: "Subcutaneous injection",
    },
    {
      goal: "Maximum Efficacy (Week 20+)",
      dose: "12mg weekly",
      frequency: "Once weekly",
      route: "Subcutaneous injection",
    },
  ],
  sideEffects: [
    "Most common side effects are gastrointestinal (nausea 43%, diarrhea 33% at 12mg) - typically mild to moderate and dose-dependent",
    "Dysesthesia (abnormal touch sensations) reported in 8.8-20.9% of participants at 9-12mg doses",
    "Conservative start at 0.5mg weekly minimizes GI side effects (13% vs 73-94% at higher doses)",
    "Phase III discontinuation rates: 12.2% (9mg) and 18.2% (12mg) due to adverse events",
    "Monitor for signs of pancreatitis (severe abdominal pain radiating to back)",
    "Heart rate increases are common, especially in first 24 weeks",
    "Contraindicated in patients with personal/family history of medullary thyroid carcinoma or MEN2 syndrome",
    "May cause rapid weight loss - some discontinuations due to perceived excessive weight loss",
  ],
  safetyNotes: [
    "Not yet FDA approved - in Phase III clinical trials",
    "Gradual dose escalation essential to minimize GI side effects",
    "Contraindicated in MTC or MEN2 syndrome history",
    "Monitor for pancreatitis symptoms",
    "Effects reverse upon discontinuation",
  ],
  storage: {
    temperature: "2-8°C",
    condition: "Refrigerated",
    reconstitutedStability: "28 days",
  },
  timeline: [
    {
      week: "1-2",
      description:
        "Initial appetite suppression and mild GI effects as body adapts to triple hormone activation",
    },
    {
      week: "2-4",
      description: "Noticeable reduction in food cravings and portion sizes, early weight loss (2-5%)",
    },
    {
      week: "4-8",
      description:
        "Significant appetite control and steady weight loss (5-10%), improved glucose control if diabetic",
    },
    {
      week: "8-16",
      description:
        "Substantial weight reduction (10-18%) with enhanced energy expenditure and metabolic improvements",
    },
    {
      week: "16-24",
      description:
        "Major weight loss milestone (15-22%) with cardiovascular benefits and liver fat reduction",
    },
    {
      week: "24-48",
      description:
        "Maximum clinical efficacy (20-24.2%) with comprehensive metabolic improvements and sustained benefits",
    },
  ],
};

/**
 * Complete peptide database.
 * Array of all available peptides for browsing and selection.
 */
export const PEPTIDES: Peptide[] = [MOTSc, Pinealon, Tesamorelin, Retatrutide];

/**
 * Get a peptide by its ID.
 * @param id - The peptide ID to look up
 * @returns The peptide if found, undefined otherwise
 */
export function getPeptideById(id: string): Peptide | undefined {
  return PEPTIDES.find((p) => p.id === id);
}

/**
 * Get peptides filtered by category.
 * @param category - The category to filter by
 * @returns Array of peptides in the specified category
 */
export function getPeptidesByCategory(category: PeptideCategory): Peptide[] {
  return PEPTIDES.filter((p) => p.categories.includes(category));
}

/**
 * Get peptides filtered by research level.
 * @param level - The research level to filter by
 * @returns Array of peptides with the specified research level
 */
export function getPeptidesByResearchLevel(level: ResearchLevel): Peptide[] {
  return PEPTIDES.filter((p) => p.researchLevel === level);
}

/**
 * Search peptides by name or description.
 * @param query - The search query
 * @returns Array of peptides matching the query
 */
export function searchPeptides(query: string): Peptide[] {
  const lowerQuery = query.toLowerCase();
  return PEPTIDES.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.subtitle.toLowerCase().includes(lowerQuery) ||
      p.overview.description.toLowerCase().includes(lowerQuery)
  );
}
