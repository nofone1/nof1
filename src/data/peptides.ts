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
  pharmacokinetics: {
    peakTime: "24-72 hrs",
    halfLife: "5 days",
    clearanceTime: "21 days",
    halfLifeHours: 120,
  },
  interactions: [
    { peptideId: "semaglutide", peptideName: "Semaglutide", type: "caution", description: "Do not combine - overlapping GLP-1 mechanism increases GI side effects." },
    { peptideId: "tirzepatide", peptideName: "Tirzepatide", type: "caution", description: "Do not combine - overlapping GLP-1/GIP mechanisms." },
    { peptideId: "bpc-157", peptideName: "BPC-157", type: "compatible", description: "No negative interactions, different pathways." },
    { peptideId: "ipamorelin", peptideName: "Ipamorelin", type: "compatible", description: "No known interactions with GH secretagogues." },
  ],
  studies: [
    { title: "Retatrutide Phase 2 Trial (TRIUMPH-2)", authors: "Jastreboff AM et al.", year: 2023, journal: "New England Journal of Medicine", doi: "10.1056/NEJMoa2301972", summary: "Phase 2 trial demonstrating 24.2% body weight reduction at 48 weeks with 12mg dose." },
    { title: "Retatrutide for Type 2 Diabetes", authors: "Rosenstock J et al.", year: 2023, journal: "The Lancet", doi: "10.1016/S0140-6736(23)01053-X", summary: "Phase 2 trial showing superior HbA1c reduction and weight loss in T2D patients." },
  ],
  reconstitution: {
    defaultPeptideMg: 12,
    defaultVialMl: 3,
    solvent: "Bacteriostatic Water",
    steps: [
      "Sterilize work area",
      "Draw prescribed BAC water volume",
      "Inject slowly down vial wall",
      "Gently swirl to dissolve",
      "Refrigerate and use within 28 days",
    ],
    qualityIndicators: {
      good: ["White to off-white powder", "Clear colorless solution after mixing"],
      bad: ["Discolored powder", "Particles visible after reconstitution"],
    },
  },
};

/**
 * Semaglutide peptide data.
 * GLP-1 receptor agonist for weight loss and diabetes.
 */
const Semaglutide: Peptide = {
  id: "semaglutide",
  name: "Semaglutide",
  shortCode: "SEM",
  subtitle: "GLP-1 Receptor Agonist | Weight Loss & Diabetes",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.DIABETES, PeptideCategory.METABOLISM],
  dosing: {
    typicalDose: "0.25-2.4mg",
    frequency: "Once weekly",
    route: "Injectable",
    routeDetails: "Subcutaneous: abdomen, thigh, upper arm",
    cycleDuration: "Continuous",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Semaglutide is an FDA-approved GLP-1 receptor agonist used for weight management and type 2 diabetes. It mimics the incretin hormone GLP-1, reducing appetite and food intake while improving glycemic control.",
    keyBenefits: "Significant weight loss (15-20%), improved blood sugar control, reduced cardiovascular risk, once-weekly dosing convenience.",
    mechanism: "Activates GLP-1 receptors to slow gastric emptying, increase satiety, and stimulate glucose-dependent insulin secretion while suppressing glucagon release.",
  },
  molecularInfo: {
    weight: "4,113.6 Da",
    length: 31,
    type: "GLP-1 analog",
    sequence: "Modified GLP-1 with fatty acid chain",
  },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Obesity Treatment", description: "FDA-approved for chronic weight management with 15-20% weight loss in clinical trials." }] },
    { name: "Diabetes", effectiveness: "most_effective", details: [{ title: "Type 2 Diabetes", description: "Excellent glycemic control with HbA1c reductions of 1.5-2%." }] },
  ],
  protocols: [
    { goal: "Weight Loss", dose: "2.4mg", frequency: "Once weekly", route: "Subcutaneous" },
    { goal: "Diabetes Management", dose: "0.5-1mg", frequency: "Once weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Nausea (common initially)", "Vomiting", "Diarrhea", "Constipation", "Injection site reactions"],
  safetyNotes: ["FDA approved", "Contraindicated in MTC/MEN2 history", "Monitor for pancreatitis"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "56 days" },
  timeline: [
    { week: "1-4", description: "Dose titration, initial appetite suppression" },
    { week: "4-12", description: "Significant weight loss begins (5-10%)" },
    { week: "12-52", description: "Maximum weight loss achieved (15-20%)" },
  ],
  pharmacokinetics: {
    peakTime: "1-3 days",
    halfLife: "7 days",
    clearanceTime: "5 weeks",
    halfLifeHours: 168,
  },
  interactions: [
    { peptideId: "tirzepatide", peptideName: "Tirzepatide", type: "caution", description: "Do not combine - overlapping GLP-1 mechanism." },
    { peptideId: "retatrutide", peptideName: "Retatrutide", type: "caution", description: "Do not combine - overlapping GLP-1 mechanism." },
    { peptideId: "bpc-157", peptideName: "BPC-157", type: "compatible", description: "No known interactions, different pathways." },
    { peptideId: "ipamorelin", peptideName: "Ipamorelin", type: "compatible", description: "No known negative interactions." },
  ],
  studies: [
    { title: "STEP 1: Semaglutide 2.4 mg for Weight Management", authors: "Wilding JPH et al.", year: 2021, journal: "New England Journal of Medicine", doi: "10.1056/NEJMoa2032183", summary: "Mean body weight change of -14.9% vs -2.4% placebo at 68 weeks in adults with obesity." },
    { title: "SUSTAIN-6: Cardiovascular Outcomes with Semaglutide", authors: "Marso SP et al.", year: 2016, journal: "New England Journal of Medicine", doi: "10.1056/NEJMoa1607141", summary: "26% reduction in major adverse cardiovascular events vs placebo in T2D patients." },
    { title: "SELECT Trial: Cardiovascular Benefits in Obesity", authors: "Lincoff AM et al.", year: 2023, journal: "New England Journal of Medicine", doi: "10.1056/NEJMoa2307563", summary: "20% reduction in MACE in overweight/obese patients without diabetes." },
  ],
};

/**
 * Tirzepatide peptide data.
 * Dual GIP/GLP-1 receptor agonist for weight loss and diabetes.
 */
const Tirzepatide: Peptide = {
  id: "tirzepatide",
  name: "Tirzepatide",
  shortCode: "TIR",
  subtitle: "Dual GIP/GLP-1 Agonist | Weight Loss & Diabetes",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.DIABETES, PeptideCategory.METABOLISM],
  dosing: {
    typicalDose: "2.5-15mg",
    frequency: "Once weekly",
    route: "Injectable",
    routeDetails: "Subcutaneous: abdomen, thigh, upper arm",
    cycleDuration: "Continuous",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Tirzepatide is an FDA-approved dual GIP and GLP-1 receptor agonist that provides superior weight loss compared to single-agonist therapies. It represents a new class of incretin-based treatments.",
    keyBenefits: "Superior weight loss (20-25%), excellent glycemic control, cardiovascular benefits, once-weekly dosing.",
    mechanism: "Dual activation of GIP and GLP-1 receptors provides synergistic effects on appetite, glucose metabolism, and energy expenditure.",
  },
  molecularInfo: {
    weight: "4,813.5 Da",
    length: 39,
    type: "Dual GIP/GLP-1 agonist",
    sequence: "Modified peptide with C20 fatty acid",
  },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Obesity Treatment", description: "Up to 22.5% weight loss in SURMOUNT trials - highest of any approved medication." }] },
    { name: "Diabetes", effectiveness: "most_effective", details: [{ title: "Type 2 Diabetes", description: "Superior HbA1c reduction compared to other GLP-1 agonists." }] },
  ],
  protocols: [
    { goal: "Weight Loss", dose: "15mg", frequency: "Once weekly", route: "Subcutaneous" },
    { goal: "Diabetes", dose: "5-15mg", frequency: "Once weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Nausea", "Diarrhea", "Decreased appetite", "Vomiting", "Constipation"],
  safetyNotes: ["FDA approved", "Gradual dose escalation required", "Monitor for GI side effects"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "21 days" },
  timeline: [
    { week: "1-4", description: "Dose titration phase, appetite changes" },
    { week: "4-16", description: "Rapid weight loss (10-15%)" },
    { week: "16-72", description: "Maximum efficacy (20-25% weight loss)" },
  ],
  pharmacokinetics: {
    peakTime: "8-72 hrs",
    halfLife: "5 days",
    clearanceTime: "25 days",
    halfLifeHours: 120,
  },
  interactions: [
    { peptideId: "semaglutide", peptideName: "Semaglutide", type: "caution", description: "Do not combine - overlapping GLP-1 mechanism increases GI side effects." },
    { peptideId: "retatrutide", peptideName: "Retatrutide", type: "caution", description: "Do not combine - overlapping GIP/GLP-1 mechanisms." },
    { peptideId: "bpc-157", peptideName: "BPC-157", type: "compatible", description: "No known interactions." },
    { peptideId: "ipamorelin", peptideName: "Ipamorelin", type: "compatible", description: "No known negative interactions with GH secretagogues." },
  ],
  studies: [
    { title: "SURMOUNT-1: Tirzepatide for Treatment of Obesity", authors: "Jastreboff AM et al.", year: 2022, journal: "New England Journal of Medicine", doi: "10.1056/NEJMoa2206038", summary: "22.5% body weight reduction at 72 weeks with 15mg dose - highest of any approved medication." },
    { title: "SURPASS-1: Tirzepatide for Type 2 Diabetes", authors: "Rosenstock J et al.", year: 2021, journal: "The Lancet", doi: "10.1016/S0140-6736(21)01324-6", summary: "Superior HbA1c reduction (up to -2.07%) vs placebo with significant weight loss." },
  ],
};

/**
 * BPC-157 peptide data.
 * Body protection compound for healing and recovery.
 */
const BPC157: Peptide = {
  id: "bpc-157",
  name: "BPC-157",
  shortCode: "BPC",
  subtitle: "Body Protection Compound | Healing & Recovery",
  researchLevel: ResearchLevel.EXTENSIVELY_STUDIED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.TISSUE_REPAIR, PeptideCategory.MUSCLE_GROWTH],
  dosing: {
    typicalDose: "250-500mcg",
    frequency: "1-2x daily",
    route: "Injectable",
    routeDetails: "Subcutaneous near injury site or systemically",
    cycleDuration: "4-12 weeks",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "BPC-157 is a 15-amino acid peptide derived from human gastric juice. It demonstrates remarkable healing properties for tendons, ligaments, muscles, and the GI tract.",
    keyBenefits: "Accelerated wound healing, tendon/ligament repair, gut healing, anti-inflammatory effects.",
    mechanism: "Promotes angiogenesis, increases growth factor expression, and modulates nitric oxide system for tissue repair.",
  },
  molecularInfo: {
    weight: "1,419 Da",
    length: 15,
    type: "Pentadecapeptide",
    sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
  },
  indications: [
    { name: "Tissue Repair", effectiveness: "most_effective", details: [{ title: "Tendon Healing", description: "Accelerates tendon-to-bone healing and repair." }] },
    { name: "GI Health", effectiveness: "most_effective", details: [{ title: "Gut Healing", description: "Protects and heals GI tract, beneficial for IBD and ulcers." }] },
  ],
  protocols: [
    { goal: "Injury Recovery", dose: "250-500mcg", frequency: "Twice daily", route: "Subcutaneous" },
    { goal: "Gut Health", dose: "250mcg", frequency: "Once daily", route: "Oral" },
  ],
  sideEffects: ["Generally well-tolerated", "Mild injection site reactions possible"],
  safetyNotes: ["Not FDA approved", "Extensive animal research", "Limited human trials"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [
    { week: "1-2", description: "Initial healing response, reduced inflammation" },
    { week: "2-4", description: "Accelerated tissue repair" },
    { week: "4-8", description: "Significant healing progress" },
  ],
  pharmacokinetics: {
    peakTime: "1 hr",
    halfLife: "4 hrs",
    clearanceTime: "20 hrs",
    halfLifeHours: 4,
  },
  interactions: [
    { peptideId: "tb-500", peptideName: "TB-500", type: "synergistic", description: "Complementary healing mechanisms, often used together for enhanced tissue repair." },
    { peptideId: "ipamorelin", peptideName: "Ipamorelin", type: "synergistic", description: "GH release amplifies BPC-157 healing effects." },
    { peptideId: "cjc-1295", peptideName: "CJC-1295", type: "synergistic", description: "GH receptor upregulation enhances healing response." },
    { peptideId: "ghk-cu", peptideName: "GHK-Cu", type: "compatible", description: "No negative interactions, distinct repair mechanisms." },
  ],
  studies: [
    { title: "BPC 157 as Potential Treatment for Various Conditions", authors: "Sikiric P et al.", year: 2020, journal: "Gut and Liver", doi: "10.5009/gnl18490", summary: "Comprehensive review of BPC-157 cytoprotective and healing effects across multiple organ systems." },
    { title: "Safety Evaluation of BPC-157", authors: "Vukojevic J et al.", year: 2020, journal: "Regulatory Toxicology and Pharmacology", doi: "10.1016/j.yrtph.2020.104665", summary: "Multi-species toxicology study up to 1000 mcg/kg showing favorable safety profile." },
    { title: "BPC-157 and Spinal Cord Injury Recovery", authors: "Chang CH et al.", year: 2019, journal: "Journal of Orthopaedic Surgery and Research", doi: "10.1186/s13018-019-1242-6", summary: "30-day rat study demonstrating functional improvement after spinal cord injury." },
    { title: "VEGF and Angiogenesis Promotion", authors: "Hsieh MJ et al.", year: 2017, journal: "Journal of Molecular Medicine", doi: "10.1007/s00109-016-1488-y", summary: "Demonstrated VEGFR2 activation and enhanced angiogenesis with BPC-157 treatment." },
  ],
  reconstitution: {
    defaultPeptideMg: 5,
    defaultVialMl: 2,
    solvent: "Bacteriostatic Water",
    steps: [
      "Sterilize work area and wash hands",
      "Calculate required BAC water volume",
      "Draw BAC water into insulin syringe",
      "Inject slowly down the inside wall of the vial (never directly onto powder)",
      "Gently swirl to dissolve - never shake",
      "Refrigerate and use within 28 days",
    ],
    qualityIndicators: {
      good: ["White fluffy cake or powder at vial bottom", "Crystal clear solution after reconstitution", "Minor clumping acceptable if dissolves completely"],
      bad: ["Collapsed or melted-looking powder", "Persistent cloudiness after mixing", "Particles that won't dissolve"],
    },
  },
};

/**
 * TB-500 peptide data.
 * Thymosin Beta-4 fragment for tissue repair.
 */
const TB500: Peptide = {
  id: "tb-500",
  name: "TB-500",
  shortCode: "TB5",
  subtitle: "Thymosin Beta-4 Fragment | Tissue Repair",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.TISSUE_REPAIR, PeptideCategory.MUSCLE_GROWTH],
  dosing: {
    typicalDose: "2-5mg",
    frequency: "2x weekly",
    route: "Injectable",
    routeDetails: "Subcutaneous or intramuscular",
    cycleDuration: "4-6 weeks",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "TB-500 is a synthetic fragment of Thymosin Beta-4, a naturally occurring peptide involved in tissue repair and regeneration.",
    keyBenefits: "Accelerated healing, reduced inflammation, improved flexibility, muscle repair.",
    mechanism: "Upregulates actin, promotes cell migration, and enhances angiogenesis for tissue repair.",
  },
  molecularInfo: { weight: "4,963 Da", length: 43, type: "Thymosin fragment", sequence: "Ac-LKKTETQ" },
  indications: [{ name: "Tissue Repair", effectiveness: "most_effective", details: [{ title: "Muscle/Tendon Healing", description: "Promotes rapid tissue regeneration." }] }],
  protocols: [{ goal: "Recovery", dose: "2.5mg", frequency: "2x weekly", route: "Subcutaneous" }],
  sideEffects: ["Head rush", "Lethargy", "Injection site irritation"],
  safetyNotes: ["Not FDA approved", "WADA banned"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-2", description: "Initial healing response" }, { week: "2-6", description: "Progressive tissue repair" }],
  pharmacokinetics: {
    peakTime: "2-3 hrs",
    halfLife: "6 hrs",
    clearanceTime: "24 hrs",
    halfLifeHours: 6,
  },
  interactions: [
    { peptideId: "bpc-157", peptideName: "BPC-157", type: "synergistic", description: "Complementary healing pathways - BPC-157 for localized repair, TB-500 for systemic." },
    { peptideId: "ghk-cu", peptideName: "GHK-Cu", type: "compatible", description: "Different tissue repair mechanisms, safe to combine." },
    { peptideId: "ipamorelin", peptideName: "Ipamorelin", type: "compatible", description: "No negative interactions, GH may support recovery." },
  ],
  studies: [
    { title: "Thymosin Beta-4 in Wound Healing", authors: "Malinda KM et al.", year: 1999, journal: "Journal of Investigative Dermatology", doi: "10.1046/j.1523-1747.1999.00708.x", summary: "Demonstrated accelerated wound closure and enhanced angiogenesis with thymosin beta-4." },
    { title: "Thymosin Beta-4 and Cardiac Repair", authors: "Bock-Marquette I et al.", year: 2004, journal: "Nature", doi: "10.1038/nature02517", summary: "TB4 activates Akt signaling and promotes survival of cardiomyocytes after injury." },
  ],
  reconstitution: {
    defaultPeptideMg: 5,
    defaultVialMl: 2,
    solvent: "Bacteriostatic Water",
    steps: [
      "Sterilize work area and wash hands",
      "Draw BAC water into syringe",
      "Inject slowly down the vial wall",
      "Gently swirl until fully dissolved",
      "Refrigerate and use within 14 days",
    ],
    qualityIndicators: {
      good: ["White lyophilized powder", "Clear solution after reconstitution"],
      bad: ["Discolored powder", "Cloudy solution that won't clear"],
    },
  },
};

/**
 * Ipamorelin peptide data.
 * Selective growth hormone secretagogue.
 */
const Ipamorelin: Peptide = {
  id: "ipamorelin",
  name: "Ipamorelin",
  shortCode: "IPA",
  subtitle: "Selective GHRP | Growth Hormone Release",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.ANTI_AGING, PeptideCategory.MUSCLE_GROWTH],
  dosing: {
    typicalDose: "100-300mcg",
    frequency: "2-3x daily",
    route: "Injectable",
    routeDetails: "Subcutaneous, ideally before bed",
    cycleDuration: "8-12 weeks",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Ipamorelin is a selective growth hormone releasing peptide that stimulates natural GH release without significantly affecting cortisol or prolactin.",
    keyBenefits: "Clean GH release, improved sleep, fat loss, muscle growth, anti-aging benefits.",
    mechanism: "Selectively binds to ghrelin receptors to stimulate pulsatile GH release from the pituitary.",
  },
  molecularInfo: { weight: "711.9 Da", length: 5, type: "Pentapeptide GHRP", sequence: "Aib-His-D-2-Nal-D-Phe-Lys-NH2" },
  indications: [{ name: "Growth Hormone", effectiveness: "most_effective", details: [{ title: "GH Optimization", description: "Clean, selective GH release without side effects." }] }],
  protocols: [{ goal: "Anti-aging/Body Composition", dose: "200-300mcg", frequency: "Before bed", route: "Subcutaneous" }],
  sideEffects: ["Increased hunger", "Water retention", "Tingling/numbness"],
  safetyNotes: ["Not FDA approved", "Generally well-tolerated"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "21 days" },
  timeline: [{ week: "1-4", description: "Improved sleep quality" }, { week: "4-12", description: "Body composition improvements" }],
};

/**
 * CJC-1295 peptide data.
 * GHRH analog for growth hormone release.
 */
const CJC1295: Peptide = {
  id: "cjc-1295",
  name: "CJC-1295 (no DAC)",
  shortCode: "CJC",
  subtitle: "GHRH Analog | Growth Hormone Release",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.ANTI_AGING, PeptideCategory.MUSCLE_GROWTH],
  dosing: {
    typicalDose: "100-300mcg",
    frequency: "1-3x daily",
    route: "Injectable",
    routeDetails: "Subcutaneous, often combined with Ipamorelin",
    cycleDuration: "8-12 weeks",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "CJC-1295 (Mod GRF 1-29) is a modified growth hormone releasing hormone analog that stimulates natural GH production.",
    keyBenefits: "Enhanced GH release, synergistic with GHRPs, improved recovery, anti-aging.",
    mechanism: "Binds to GHRH receptors on pituitary somatotrophs to stimulate GH synthesis and release.",
  },
  molecularInfo: { weight: "3,367.9 Da", length: 29, type: "GHRH analog", sequence: "Modified GRF 1-29" },
  indications: [{ name: "Growth Hormone", effectiveness: "most_effective", details: [{ title: "GH Optimization", description: "Amplifies natural GH pulses." }] }],
  protocols: [{ goal: "GH Enhancement", dose: "100mcg", frequency: "2-3x daily with Ipamorelin", route: "Subcutaneous" }],
  sideEffects: ["Flushing", "Headache", "Dizziness"],
  safetyNotes: ["Not FDA approved", "Best combined with GHRP"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "21 days" },
  timeline: [{ week: "1-4", description: "Enhanced GH pulses" }, { week: "4-12", description: "Cumulative benefits" }],
};

/**
 * Sermorelin peptide data.
 * GHRH 1-29 analog for growth hormone.
 */
const Sermorelin: Peptide = {
  id: "sermorelin",
  name: "Sermorelin",
  shortCode: "SER",
  subtitle: "GHRH 1-29 | Growth Hormone Releasing",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.ANTI_AGING],
  dosing: {
    typicalDose: "200-500mcg",
    frequency: "Once daily",
    route: "Injectable",
    routeDetails: "Subcutaneous before bed",
    cycleDuration: "3-6 months",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Sermorelin is a bioidentical GHRH fragment that stimulates the pituitary to produce and release growth hormone naturally.",
    keyBenefits: "Natural GH stimulation, improved sleep, anti-aging, body composition.",
    mechanism: "Mimics endogenous GHRH to stimulate pituitary GH release.",
  },
  molecularInfo: { weight: "3,358 Da", length: 29, type: "GHRH 1-29", sequence: "First 29 amino acids of GHRH" },
  indications: [{ name: "Growth Hormone", effectiveness: "effective", details: [{ title: "GH Deficiency", description: "Restores natural GH production." }] }],
  protocols: [{ goal: "Anti-aging", dose: "300mcg", frequency: "Before bed", route: "Subcutaneous" }],
  sideEffects: ["Injection site reactions", "Headache", "Flushing"],
  safetyNotes: ["Previously FDA approved for pediatric use", "Generally safe"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-4", description: "Improved sleep" }, { week: "4-12", description: "Body composition changes" }],
};

/**
 * MK-677 (Ibutamoren) data.
 * Oral growth hormone secretagogue.
 */
const MK677: Peptide = {
  id: "mk-677",
  name: "MK-677",
  shortCode: "MK6",
  subtitle: "Ibutamoren | Oral GH Secretagogue",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.ORAL],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.MUSCLE_GROWTH, PeptideCategory.ANTI_AGING],
  dosing: {
    typicalDose: "10-25mg",
    frequency: "Once daily",
    route: "Oral",
    routeDetails: "Taken orally, usually before bed",
    cycleDuration: "8-12 weeks",
    storageTemp: "20-25°C",
    storageNotes: "Room temperature",
  },
  overview: {
    description: "MK-677 (Ibutamoren) is an oral ghrelin receptor agonist that stimulates growth hormone release without injections.",
    keyBenefits: "Oral convenience, sustained GH elevation, improved sleep, increased appetite.",
    mechanism: "Mimics ghrelin to stimulate GH release from the pituitary gland.",
  },
  molecularInfo: { weight: "528.7 Da", length: 0, type: "Non-peptide GH secretagogue", sequence: "Small molecule" },
  indications: [{ name: "Growth Hormone", effectiveness: "effective", details: [{ title: "GH Enhancement", description: "Sustained IGF-1 elevation." }] }],
  protocols: [{ goal: "GH/IGF-1 Elevation", dose: "10-25mg", frequency: "Once daily", route: "Oral" }],
  sideEffects: ["Increased appetite", "Water retention", "Lethargy", "Blood sugar changes"],
  safetyNotes: ["Not FDA approved", "Monitor blood glucose"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [{ week: "1-2", description: "Increased appetite, better sleep" }, { week: "4-12", description: "IGF-1 elevation, body composition" }],
};

/**
 * Semax peptide data.
 * Cognitive enhancement and neuroprotection.
 */
const Semax: Peptide = {
  id: "semax",
  name: "Semax",
  shortCode: "SMX",
  subtitle: "ACTH Analog | Cognitive Enhancement",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.NASAL],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.NEUROPROTECTION],
  dosing: {
    typicalDose: "200-600mcg",
    frequency: "1-2x daily",
    route: "Nasal",
    routeDetails: "Intranasal spray",
    cycleDuration: "10-14 days",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Semax is a synthetic ACTH analog developed in Russia for cognitive enhancement and stroke recovery.",
    keyBenefits: "Enhanced focus, memory improvement, neuroprotection, mood support.",
    mechanism: "Modulates BDNF expression and dopamine/serotonin systems.",
  },
  molecularInfo: { weight: "813.9 Da", length: 7, type: "ACTH 4-10 analog", sequence: "Met-Glu-His-Phe-Pro-Gly-Pro" },
  indications: [{ name: "Cognitive", effectiveness: "most_effective", details: [{ title: "Focus/Memory", description: "Enhances cognitive function and mental clarity." }] }],
  protocols: [{ goal: "Cognitive Enhancement", dose: "300-600mcg", frequency: "1-2x daily", route: "Nasal" }],
  sideEffects: ["Nasal irritation", "Headache (rare)"],
  safetyNotes: ["Approved in Russia", "Generally well-tolerated"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "1-2", description: "Improved focus and clarity" }],
};

/**
 * Selank peptide data.
 * Anxiolytic and cognitive peptide.
 */
const Selank: Peptide = {
  id: "selank",
  name: "Selank",
  shortCode: "SEL",
  subtitle: "Tuftsin Analog | Anxiety & Cognition",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.NASAL, AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.MOOD, PeptideCategory.IMMUNE_SUPPORT],
  dosing: {
    typicalDose: "250-500mcg",
    frequency: "1-2x daily",
    route: "Nasal",
    routeDetails: "Intranasal or subcutaneous",
    cycleDuration: "14-21 days",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Selank is a synthetic tuftsin analog with anxiolytic and nootropic properties, developed in Russia.",
    keyBenefits: "Anxiety reduction, cognitive enhancement, immune modulation, no sedation.",
    mechanism: "Modulates GABA, serotonin, and dopamine systems; enhances BDNF.",
  },
  molecularInfo: { weight: "751.9 Da", length: 7, type: "Tuftsin analog", sequence: "Thr-Lys-Pro-Arg-Pro-Gly-Pro" },
  indications: [{ name: "Mood", effectiveness: "most_effective", details: [{ title: "Anxiety Relief", description: "Reduces anxiety without sedation." }] }],
  protocols: [{ goal: "Anxiety/Cognition", dose: "250-500mcg", frequency: "1-2x daily", route: "Nasal" }],
  sideEffects: ["Fatigue (rare)", "Nasal irritation"],
  safetyNotes: ["Approved in Russia", "Non-addictive"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "1-2", description: "Reduced anxiety, improved mood" }],
};

/**
 * Epithalon peptide data.
 * Telomerase activator for anti-aging.
 */
const Epithalon: Peptide = {
  id: "epithalon",
  name: "Epithalon",
  shortCode: "EPI",
  subtitle: "Telomerase Activator | Anti-Aging",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.ANTI_AGING],
  dosing: {
    typicalDose: "5-10mg",
    frequency: "Once daily",
    route: "Injectable",
    routeDetails: "Subcutaneous or intramuscular",
    cycleDuration: "10-20 days, 2-3x yearly",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Epithalon is a synthetic tetrapeptide that activates telomerase, potentially extending cellular lifespan.",
    keyBenefits: "Telomere extension, cellular rejuvenation, improved sleep, potential longevity.",
    mechanism: "Activates telomerase enzyme to maintain telomere length.",
  },
  molecularInfo: { weight: "390.4 Da", length: 4, type: "Tetrapeptide", sequence: "Ala-Glu-Asp-Gly" },
  indications: [{ name: "Anti-Aging", effectiveness: "effective", details: [{ title: "Longevity", description: "Activates telomerase for cellular health." }] }],
  protocols: [{ goal: "Anti-aging", dose: "5-10mg", frequency: "Daily for 10-20 days", route: "Subcutaneous" }],
  sideEffects: ["Generally well-tolerated", "Injection site reactions"],
  safetyNotes: ["Not FDA approved", "Research ongoing"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-3", description: "Improved sleep, energy" }],
};

/**
 * GHK-Cu peptide data.
 * Copper peptide for skin and healing.
 */
const GHKCu: Peptide = {
  id: "ghk-cu",
  name: "GHK-Cu",
  shortCode: "GHK",
  subtitle: "Copper Peptide | Skin & Healing",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.ANTI_AGING, PeptideCategory.TISSUE_REPAIR],
  dosing: {
    typicalDose: "1-2mg",
    frequency: "Once daily",
    route: "Injectable or Topical",
    routeDetails: "Subcutaneous or topical application",
    cycleDuration: "4-8 weeks",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "GHK-Cu is a naturally occurring copper peptide with powerful regenerative and anti-aging properties.",
    keyBenefits: "Skin rejuvenation, wound healing, collagen synthesis, hair growth.",
    mechanism: "Stimulates collagen, elastin, and glycosaminoglycan synthesis; promotes tissue remodeling.",
  },
  molecularInfo: { weight: "403.9 Da", length: 3, type: "Copper tripeptide", sequence: "Gly-His-Lys-Cu" },
  indications: [{ name: "Anti-Aging", effectiveness: "most_effective", details: [{ title: "Skin Health", description: "Promotes collagen and skin regeneration." }] }],
  protocols: [{ goal: "Skin/Healing", dose: "1-2mg", frequency: "Once daily", route: "Subcutaneous" }],
  sideEffects: ["Injection site irritation", "Skin sensitivity"],
  safetyNotes: ["Naturally occurring", "Generally safe"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "2-4", description: "Improved skin texture" }, { week: "4-8", description: "Visible rejuvenation" }],
};

/**
 * PT-141 peptide data.
 * Sexual dysfunction treatment.
 */
const PT141: Peptide = {
  id: "pt-141",
  name: "PT-141",
  shortCode: "PT1",
  subtitle: "Bremelanotide | Sexual Health",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.SEXUAL_HEALTH],
  dosing: {
    typicalDose: "1.75mg",
    frequency: "As needed",
    route: "Injectable",
    routeDetails: "Subcutaneous, 45 min before activity",
    cycleDuration: "As needed",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "PT-141 (Bremelanotide) is an FDA-approved melanocortin receptor agonist for treating hypoactive sexual desire disorder.",
    keyBenefits: "Increased sexual desire, works on brain pathways, effective for both men and women.",
    mechanism: "Activates melanocortin receptors in the brain to enhance sexual arousal.",
  },
  molecularInfo: { weight: "1,025.2 Da", length: 7, type: "Melanocortin agonist", sequence: "Cyclic heptapeptide" },
  indications: [{ name: "Sexual Health", effectiveness: "most_effective", details: [{ title: "HSDD", description: "FDA-approved for hypoactive sexual desire disorder." }] }],
  protocols: [{ goal: "Sexual Function", dose: "1.75mg", frequency: "As needed", route: "Subcutaneous" }],
  sideEffects: ["Nausea", "Flushing", "Headache", "Injection site reactions"],
  safetyNotes: ["FDA approved", "Max 8 doses/month", "Avoid with cardiovascular disease"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "0", description: "Effects within 45-60 minutes of injection" }],
};

/**
 * Oxytocin peptide data.
 * Social bonding and reproductive hormone.
 */
const Oxytocin: Peptide = {
  id: "oxytocin",
  name: "Oxytocin",
  shortCode: "OXY",
  subtitle: "Bonding Hormone | Social & Reproductive",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.NASAL, AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.SOCIAL, PeptideCategory.MOOD, PeptideCategory.SEXUAL_HEALTH],
  dosing: {
    typicalDose: "10-40 IU",
    frequency: "As needed",
    route: "Nasal",
    routeDetails: "Intranasal spray or injection",
    cycleDuration: "As needed",
    storageTemp: "2-8°C",
    storageNotes: "Refrigerated",
  },
  overview: {
    description: "Oxytocin is a naturally occurring hormone involved in social bonding, trust, and reproductive functions.",
    keyBenefits: "Enhanced social bonding, reduced anxiety, improved trust, mood enhancement.",
    mechanism: "Binds to oxytocin receptors in the brain to modulate social behavior and emotional responses.",
  },
  molecularInfo: { weight: "1,007.2 Da", length: 9, type: "Nonapeptide hormone", sequence: "Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly" },
  indications: [
    { name: "Social", effectiveness: "most_effective", details: [{ title: "Social Bonding", description: "Enhances trust and social connection." }] },
    { name: "Mood", effectiveness: "effective", details: [{ title: "Anxiety", description: "Reduces social anxiety." }] },
  ],
  protocols: [{ goal: "Social/Mood", dose: "20-40 IU", frequency: "As needed", route: "Nasal" }],
  sideEffects: ["Nasal irritation", "Headache", "Nausea (rare)"],
  safetyNotes: ["FDA approved for labor induction", "Research use for social/mood"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "0", description: "Effects within 30-60 minutes" }],
};

const AOD9604: Peptide = {
  id: "aod-9604",
  name: "AOD-9604",
  shortCode: "AOD",
  subtitle: "Modified hGH Fragment 176-191 | Fat Loss",
  researchLevel: ResearchLevel.EXTENSIVELY_STUDIED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.JOINT_HEALTH],
  dosing: { typicalDose: "250-500mcg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh (morning, empty stomach)", cycleDuration: "8-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "AOD-9604 is a 17-amino acid modified fragment of human growth hormone (hGH 176-191) with an added N-terminal tyrosine. It targets fat loss through selective lipolysis without triggering growth hormone's metabolic side effects such as hyperglycemia or IGF-1 elevation.",
    keyBenefits: "Selective fat loss via lipolysis, no effect on blood glucose or IGF-1, cartilage repair potential, GRAS status for food use.",
    mechanism: "Stimulates lipolysis and inhibits lipogenesis through beta-3 adrenergic receptor upregulation without binding to the GH receptor, avoiding hyperglycemia, insulin resistance, and cell proliferation.",
  },
  molecularInfo: { weight: "1,815.1 Da", length: 17, type: "Modified hGH C-terminal fragment", sequence: "Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe", sequenceNote: "hGH fragment 176-191 with N-terminal tyrosine; disulfide bond between Cys183 and Cys189" },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Fat Reduction", description: "Increases fat oxidation and plasma glycerol levels, reduces body weight in obese models without affecting glucose metabolism." }, { title: "Anti-Lipogenic", description: "Reduces fat synthesis and storage in adipose tissue." }] },
    { name: "Joint Health", effectiveness: "effective", details: [{ title: "Cartilage Repair", description: "Enhanced cartilage regeneration and accelerated recovery, synergistic with hyaluronic acid." }] },
  ],
  protocols: [
    { goal: "Fat loss", dose: "250-300mcg", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Enhanced fat loss", dose: "400-500mcg", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Joint support", dose: "250mcg", frequency: "Once daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Generally well-tolerated", "Does not affect blood glucose or insulin", "Does not increase IGF-1", "Mild injection site reactions possible"],
  safetyNotes: ["Not FDA approved as therapeutic drug (GRAS status for food)", "WADA prohibited substance", "Does not affect GH axis"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "28 days" },
  timeline: [
    { week: "1-2", description: "Minimal noticeable effects, compound building in system" },
    { week: "3-4", description: "Subtle changes in body composition" },
    { week: "5-8", description: "Noticeable fat loss with diet and exercise" },
    { week: "8-12", description: "Continued fat reduction and improved body composition" },
  ],
  pharmacokinetics: { peakTime: "15 min", halfLife: "30 min", clearanceTime: "2.5 hrs", halfLifeHours: 0.5 },
};

const FiveAmino1MQ: Peptide = {
  id: "5-amino-1mq",
  name: "5-Amino-1MQ",
  shortCode: "5MQ",
  subtitle: "NNMT Inhibitor | Metabolic Enhancement",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.ORAL],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "50-150mg", frequency: "Once daily", route: "Oral", routeDetails: "Oral capsule, taken with or without food", cycleDuration: "4-12 weeks", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "5-Amino-1MQ is a small molecule inhibitor of nicotinamide N-methyltransferase (NNMT), an enzyme that regulates cellular energy metabolism. By inhibiting NNMT, it increases intracellular NAD+ and S-adenosylmethionine (SAM) levels, promoting fat cell shrinkage and metabolic activation.",
    keyBenefits: "Increases NAD+ and SAM levels, promotes fat cell shrinkage, enhances cellular energy metabolism, oral convenience.",
    mechanism: "Selectively inhibits NNMT enzyme, preventing the methylation and depletion of NAD+. This increases available NAD+ for mitochondrial energy production and activates SAM-dependent metabolic pathways, leading to reduced lipogenesis and increased lipolysis in adipocytes.",
  },
  molecularInfo: { weight: "~250 Da", length: 0, type: "Small molecule NNMT inhibitor", sequence: "Small molecule (not a peptide)" },
  indications: [
    { name: "Weight Loss", effectiveness: "effective", details: [{ title: "Fat Cell Reduction", description: "NNMT inhibition shrinks fat cells and reduces lipid accumulation in preclinical models." }] },
    { name: "Metabolic", effectiveness: "effective", details: [{ title: "NAD+ Restoration", description: "Increases intracellular NAD+ levels, supporting mitochondrial function and cellular energy." }] },
  ],
  protocols: [
    { goal: "Metabolic enhancement", dose: "50-100mg", frequency: "Once daily", route: "Oral" },
    { goal: "Weight management", dose: "100-150mg", frequency: "Once daily", route: "Oral" },
  ],
  sideEffects: ["Limited human safety data", "Gastrointestinal discomfort possible", "Headache reported anecdotally"],
  safetyNotes: ["Not FDA approved", "Emerging research compound", "Limited long-term safety data"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [
    { week: "1-2", description: "Metabolic enzyme inhibition begins, subtle energy changes" },
    { week: "2-4", description: "Improved metabolic markers, early body composition changes" },
    { week: "4-12", description: "Progressive fat reduction with diet and exercise" },
  ],
};

const Adipotide: Peptide = {
  id: "adipotide",
  name: "Adipotide",
  shortCode: "ADI",
  subtitle: "Prohibitin-Targeting Peptidomimetic | Experimental Anti-Obesity",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM],
  dosing: { typicalDose: "0.5mg/kg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous or intraperitoneal (research setting)", cycleDuration: "4 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Adipotide (CKGGRAKDC-GG-D(KLAKLAK)2) is a prohibitin-targeting peptidomimetic that selectively destroys blood vessels supplying white adipose tissue. Developed at MD Anderson Cancer Center, it causes rapid and significant fat loss in primate studies by inducing apoptosis in vascular endothelial cells feeding fat deposits.",
    keyBenefits: "Targeted destruction of fat tissue vasculature, rapid fat loss in primate models, selective for white adipose tissue.",
    mechanism: "Contains a homing sequence (CKGGRAKDC) that targets prohibitin on the surface of blood vessels supplying white fat, coupled to a pro-apoptotic peptide D(KLAKLAK)2 that disrupts mitochondrial membranes, causing vascular apoptosis and fat tissue death.",
  },
  molecularInfo: { weight: "~2,500 Da", length: 0, type: "Chimeric peptidomimetic", sequence: "CKGGRAKDC-GG-D(KLAKLAK)2", sequenceNote: "Homing peptide fused to pro-apoptotic mitochondrial disruption sequence" },
  indications: [{ name: "Weight Loss", effectiveness: "effective", details: [{ title: "Rapid Fat Loss", description: "Rhesus monkey study showed 11% body weight loss and 39% reduction in abdominal fat over 4 weeks." }] }],
  protocols: [{ goal: "Research protocol", dose: "0.5mg/kg", frequency: "Once daily", route: "Subcutaneous" }],
  sideEffects: ["Renal toxicity observed in primate studies", "Dehydration risk", "Not tested in humans", "Potential off-target vascular effects"],
  safetyNotes: ["Experimental research compound only", "Significant renal toxicity concerns", "Not FDA approved", "No human trials conducted"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "7 days" },
  timeline: [{ week: "1-4", description: "Rapid fat loss observed in primate models" }],
};

const Bioglutide: Peptide = {
  id: "bioglutide",
  name: "Bioglutide",
  shortCode: "BIO",
  subtitle: "Quadruple IGF-1/GLP-1/GIP/Glucagon Agonist | Weight Loss",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.DIABETES, PeptideCategory.METABOLISM],
  dosing: { typicalDose: "TBD", frequency: "Once weekly (expected)", route: "Injectable", routeDetails: "Subcutaneous", cycleDuration: "Continuous therapy", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Bioglutide (NA-931) is a novel quadruple agonist targeting IGF-1, GLP-1, GIP, and glucagon receptors simultaneously. Currently in early clinical development, it represents the next evolution beyond triple agonists like retatrutide by adding IGF-1 receptor activation for enhanced metabolic and anabolic effects.",
    keyBenefits: "Four-receptor activation for maximal metabolic coverage, potential for superior weight loss, combined metabolic and anabolic benefits.",
    mechanism: "Simultaneously activates GLP-1 for appetite suppression, GIP for insulin sensitivity, glucagon for energy expenditure, and IGF-1 for anabolic tissue effects, providing the broadest receptor coverage of any incretin-based therapy.",
  },
  molecularInfo: { weight: "~5,000 Da", length: 0, type: "Quadruple receptor agonist", sequence: "Proprietary sequence" },
  indications: [
    { name: "Weight Loss", effectiveness: "effective", details: [{ title: "Multi-Receptor Obesity Treatment", description: "Quadruple receptor activation expected to provide superior weight loss through four complementary metabolic pathways." }] },
    { name: "Diabetes", effectiveness: "moderate", details: [{ title: "Glycemic Control", description: "GLP-1 and GIP components provide glucose-dependent insulin secretion." }] },
  ],
  protocols: [{ goal: "Weight loss (anticipated)", dose: "TBD", frequency: "Once weekly", route: "Subcutaneous" }],
  sideEffects: ["Expected GI side effects (nausea, vomiting) based on GLP-1 class", "Safety profile still being established", "Clinical data pending"],
  safetyNotes: ["Early-stage research compound", "Not FDA approved", "Limited human data available"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "TBD" },
  timeline: [{ week: "1-4", description: "Clinical data pending - timeline based on GLP-1 class expectations" }],
};

const Cagrilintide: Peptide = {
  id: "cagrilintide",
  name: "Cagrilintide",
  shortCode: "CAG",
  subtitle: "Long-Acting Amylin Analog | Weight Management",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.DIABETES],
  dosing: { typicalDose: "2.4mg", frequency: "Once weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh, upper arm", cycleDuration: "Continuous therapy", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Cagrilintide is a long-acting acylated amylin analog developed by Novo Nordisk. Amylin is a pancreatic hormone co-secreted with insulin that promotes satiety and slows gastric emptying. The CagriSema combination (cagrilintide + semaglutide 2.4mg) achieved up to 25.3% weight loss at 68 weeks in REDEFINE Phase 3 trials.",
    keyBenefits: "Complementary amylin pathway to GLP-1 agonists, enhanced satiety, superior weight loss in CagriSema combination (25.3%), once-weekly dosing.",
    mechanism: "Activates amylin receptors (AMY1-3) in the area postrema and hypothalamus to reduce appetite, slow gastric emptying, and suppress postprandial glucagon. Complementary to GLP-1 pathway for additive appetite suppression.",
  },
  molecularInfo: { weight: "~3,950 Da", length: 37, type: "Acylated amylin analog", sequence: "Modified human amylin with C18 fatty acid", sequenceNote: "Engineered for extended half-life via albumin binding" },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "CagriSema Combination", description: "CagriSema achieved 25.3% weight loss at 68 weeks in REDEFINE 1 Phase 3 trial." }, { title: "Monotherapy", description: "Cagrilintide 4.5mg achieved ~10.8% weight loss at 26 weeks in Phase 2." }] },
    { name: "Diabetes", effectiveness: "effective", details: [{ title: "Glycemic Control", description: "Amylin-mediated glucagon suppression and delayed gastric emptying improve postprandial glucose." }] },
  ],
  protocols: [
    { goal: "Weight loss (monotherapy)", dose: "2.4mg", frequency: "Once weekly", route: "Subcutaneous" },
    { goal: "Weight loss (CagriSema)", dose: "2.4mg + semaglutide 2.4mg", frequency: "Once weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Nausea (most common, dose-dependent)", "Vomiting and diarrhea", "Injection site reactions", "Decreased appetite"],
  safetyNotes: ["Not yet FDA approved - Phase 3 trials (REDEFINE program)", "Gradual dose escalation recommended", "Monitor for pancreatitis"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "Pre-filled pen" },
  timeline: [
    { week: "1-4", description: "Dose titration, initial appetite suppression" },
    { week: "4-12", description: "Significant appetite reduction and steady weight loss" },
    { week: "12-26", description: "Continued weight loss trajectory" },
    { week: "26-68", description: "Maximum weight loss (up to 25% with CagriSema)" },
  ],
};

const Mazdutide: Peptide = {
  id: "mazdutide",
  name: "Mazdutide",
  shortCode: "MAZ",
  subtitle: "Dual GLP-1/Glucagon Agonist | Weight Loss & Diabetes",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.DIABETES, PeptideCategory.METABOLISM],
  dosing: { typicalDose: "4-9mg", frequency: "Once weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh, upper arm", cycleDuration: "Continuous therapy", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Mazdutide (IBI362) is a dual GLP-1 and glucagon receptor agonist developed by Innovent Biologics/Eli Lilly. Phase 2 data showed up to 17.4% weight loss at 48 weeks with the 9mg dose, combining appetite suppression with enhanced hepatic fat oxidation.",
    keyBenefits: "Dual receptor activation, up to 17.4% weight loss, hepatic fat reduction for MASLD/MASH, once-weekly dosing.",
    mechanism: "Activates GLP-1 receptors for appetite suppression and insulin secretion, and glucagon receptors for increased hepatic energy expenditure and fatty acid oxidation.",
  },
  molecularInfo: { weight: "~4,200 Da", length: 30, type: "Dual GLP-1/glucagon agonist", sequence: "Modified oxyntomodulin analog with C18 fatty acid" },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Dual-Mechanism Weight Reduction", description: "Up to 17.4% body weight loss at 48 weeks with 9mg dose in Phase 2." }] },
    { name: "Diabetes", effectiveness: "effective", details: [{ title: "Glycemic Control", description: "GLP-1 component provides robust HbA1c reduction." }] },
  ],
  protocols: [
    { goal: "Weight loss", dose: "9mg", frequency: "Once weekly", route: "Subcutaneous" },
    { goal: "Diabetes management", dose: "4-6mg", frequency: "Once weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Nausea (dose-dependent)", "Vomiting and diarrhea", "Decreased appetite", "GI side effects typically diminish"],
  safetyNotes: ["Not yet FDA approved - Phase 3 ongoing", "Developed by Innovent Biologics/Eli Lilly", "Gradual dose escalation recommended"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "Pre-filled pen" },
  timeline: [
    { week: "1-4", description: "Dose titration, initial appetite suppression" },
    { week: "4-12", description: "Progressive weight loss (5-10%)" },
    { week: "12-48", description: "Maximum efficacy approaching 15-17% weight loss" },
  ],
};

const Orforglipron: Peptide = {
  id: "orforglipron",
  name: "Orforglipron",
  shortCode: "ORF",
  subtitle: "Oral Small-Molecule GLP-1 Agonist | Weight Loss & Diabetes",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.ORAL],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.DIABETES, PeptideCategory.METABOLISM],
  dosing: { typicalDose: "36-72mg", frequency: "Once daily", route: "Oral", routeDetails: "Oral tablet on empty stomach", cycleDuration: "Continuous therapy", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "Orforglipron (LY3502970) is the first oral non-peptide small-molecule GLP-1 receptor agonist by Eli Lilly. Unlike oral semaglutide which requires absorption enhancers, orforglipron has conventional oral bioavailability. Phase 2 showed up to 14.7% weight loss at 36 weeks. Currently in Phase 3 (ATTAIN program).",
    keyBenefits: "Oral convenience (no injections), once-daily pill, comparable efficacy to injectable GLP-1s, no absorption enhancer needed, room temperature storage.",
    mechanism: "Non-peptide small molecule that binds and activates GLP-1 receptors, suppressing appetite, slowing gastric emptying, and stimulating glucose-dependent insulin secretion—all via oral delivery.",
  },
  molecularInfo: { weight: "~550 Da", length: 0, type: "Non-peptide GLP-1 receptor agonist", sequence: "Small molecule (not a peptide)" },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Oral Weight Management", description: "Phase 2 showed up to 14.7% weight loss at 36 weeks, rivaling injectable GLP-1 agonists." }] },
    { name: "Diabetes", effectiveness: "effective", details: [{ title: "Type 2 Diabetes", description: "HbA1c reduction of up to 2.1% in Phase 2 trials." }] },
  ],
  protocols: [
    { goal: "Weight loss", dose: "36mg", frequency: "Once daily", route: "Oral" },
    { goal: "Higher dose", dose: "72mg", frequency: "Once daily", route: "Oral" },
  ],
  sideEffects: ["Nausea (dose-dependent, transient)", "Vomiting and diarrhea", "Decreased appetite", "Constipation"],
  safetyNotes: ["Not yet FDA approved - Phase 3 ongoing (ATTAIN program)", "Developed by Eli Lilly", "Gradual dose escalation essential"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [
    { week: "1-4", description: "Dose titration, initial appetite suppression" },
    { week: "4-12", description: "Meaningful weight loss (5-8%)" },
    { week: "12-36", description: "Maximum efficacy (10-15%)" },
  ],
};

const Survodutide: Peptide = {
  id: "survodutide",
  name: "Survodutide",
  shortCode: "SUR",
  subtitle: "Dual GLP-1/Glucagon Agonist | Obesity & MASH",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.CARDIOVASCULAR],
  dosing: { typicalDose: "2.4-6mg", frequency: "Once weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh, upper arm", cycleDuration: "Continuous therapy", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Survodutide (BI 456906) is a dual GLP-1/glucagon receptor agonist by Boehringer Ingelheim/Zealand Pharma. Phase 2 showed 18.7% weight loss at 46 weeks and 83% MASH resolution rate. In Phase 3 for obesity (SYNCHRONIZE) and MASH (LIVERAGE).",
    keyBenefits: "Up to 18.7% weight loss, significant liver fat reduction for MASH, dual pathway activation, once-weekly dosing.",
    mechanism: "GLP-1 activation suppresses appetite and improves glycemic control while glucagon activation increases hepatic energy expenditure and fatty acid oxidation, reducing hepatic steatosis.",
  },
  molecularInfo: { weight: "~4,100 Da", length: 29, type: "Dual GLP-1/glucagon agonist", sequence: "Modified glucagon/GLP-1 hybrid with fatty acid" },
  indications: [
    { name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Robust Weight Reduction", description: "Phase 2 showed up to 18.7% body weight loss at 46 weeks with 6mg weekly." }] },
    { name: "Metabolic", effectiveness: "most_effective", details: [{ title: "MASH Resolution", description: "83% of patients achieved MASH resolution and 64% achieved fibrosis improvement at 48 weeks in Phase 2." }] },
  ],
  protocols: [
    { goal: "Weight loss", dose: "6mg", frequency: "Once weekly", route: "Subcutaneous" },
    { goal: "MASH treatment", dose: "4.8-6mg", frequency: "Once weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Nausea (transient, dose-dependent)", "Vomiting and diarrhea", "Decreased appetite", "Mild heart rate increase"],
  safetyNotes: ["Not yet FDA approved - Phase 3 ongoing", "Developed by Boehringer Ingelheim/Zealand Pharma", "Gradual dose escalation essential"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "Pre-filled pen" },
  timeline: [
    { week: "1-4", description: "Dose titration, appetite suppression" },
    { week: "4-12", description: "Progressive weight loss, liver fat reduction begins" },
    { week: "12-46", description: "Maximum efficacy (up to 18.7% weight loss), MASH resolution" },
  ],
};

const Tesofensine: Peptide = {
  id: "tesofensine",
  name: "Tesofensine",
  shortCode: "TSF",
  subtitle: "Triple Monoamine Reuptake Inhibitor | Weight Loss",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.ORAL],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM],
  dosing: { typicalDose: "0.25-0.5mg", frequency: "Once daily", route: "Oral", routeDetails: "Oral tablet", cycleDuration: "Continuous", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "Tesofensine is a triple monoamine reuptake inhibitor (serotonin, norepinephrine, dopamine) originally developed for neurological conditions. Phase 2 trials for obesity showed up to 12.8% weight loss at 24 weeks with 0.5mg, making it one of the most effective oral weight loss agents.",
    keyBenefits: "Significant oral weight loss (up to 12.8%), appetite suppression via central monoamine pathways, once-daily dosing, mood enhancement.",
    mechanism: "Inhibits reuptake of serotonin, norepinephrine, and dopamine in the CNS, reducing appetite through enhanced satiety signaling, increasing thermogenesis, and improving mood/motivation.",
  },
  molecularInfo: { weight: "283.8 Da", length: 0, type: "Triple monoamine reuptake inhibitor", sequence: "Small molecule (not a peptide)" },
  indications: [{ name: "Weight Loss", effectiveness: "most_effective", details: [{ title: "Central Appetite Suppression", description: "Phase 2 showed 12.8% weight loss at 24 weeks with 0.5mg dose via triple monoamine mechanism." }] }],
  protocols: [
    { goal: "Weight loss (low dose)", dose: "0.25mg", frequency: "Once daily", route: "Oral" },
    { goal: "Weight loss (standard)", dose: "0.5mg", frequency: "Once daily", route: "Oral" },
  ],
  sideEffects: ["Dry mouth", "Insomnia", "Elevated heart rate", "Constipation", "Mood changes", "Blood pressure increase possible"],
  safetyNotes: ["Not FDA approved - Phase 3 in select markets", "Monitor heart rate and blood pressure", "Contraindicated with MAOIs", "Cardiovascular monitoring recommended"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [
    { week: "1-2", description: "Appetite suppression, possible mild stimulant effects" },
    { week: "2-8", description: "Progressive weight loss (5-8%)" },
    { week: "8-24", description: "Maximum weight loss (10-13%)" },
  ],
};

const LCarnitine: Peptide = {
  id: "l-carnitine",
  name: "L-Carnitine",
  shortCode: "LCR",
  subtitle: "Amino Acid Derivative | Fat Metabolism & Energy",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.ENERGY, PeptideCategory.CARDIOVASCULAR],
  dosing: { typicalDose: "500-2000mg", frequency: "Once daily", route: "Injectable or Oral", routeDetails: "IM/IV injection or oral capsules/liquid", cycleDuration: "Ongoing", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "L-Carnitine is a naturally occurring amino acid derivative essential for transporting long-chain fatty acids into mitochondria for beta-oxidation. It plays a critical role in cellular energy production and is widely used for fat metabolism support, exercise performance, and cardiovascular health.",
    keyBenefits: "Enhanced fat oxidation, improved exercise performance, cardiovascular support, mitochondrial energy production, recovery enhancement.",
    mechanism: "Shuttles long-chain fatty acids across the inner mitochondrial membrane via the carnitine palmitoyltransferase (CPT) system for beta-oxidation, converting fat into ATP energy.",
  },
  molecularInfo: { weight: "161.2 Da", length: 0, type: "Amino acid derivative", sequence: "Small molecule (not a peptide)" },
  indications: [
    { name: "Metabolic", effectiveness: "effective", details: [{ title: "Fat Oxidation", description: "Facilitates mitochondrial fatty acid transport for energy production." }] },
    { name: "Cardiovascular", effectiveness: "effective", details: [{ title: "Heart Health", description: "Improves cardiac energy metabolism; FDA approved for carnitine deficiency." }] },
  ],
  protocols: [
    { goal: "Fat metabolism", dose: "500-1000mg", frequency: "Once daily", route: "Oral" },
    { goal: "Athletic performance", dose: "1000-2000mg", frequency: "Pre-workout", route: "Oral" },
    { goal: "Clinical deficiency", dose: "1000mg", frequency: "1-2x daily", route: "IV/IM" },
  ],
  sideEffects: ["Fishy body odor at high doses", "GI discomfort", "Nausea", "Diarrhea at high oral doses"],
  safetyNotes: ["FDA approved for carnitine deficiency", "Generally well-tolerated", "TMAO concerns with chronic high oral doses"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [
    { week: "1-2", description: "Improved exercise tolerance and energy" },
    { week: "2-8", description: "Enhanced fat oxidation with exercise" },
    { week: "8-12", description: "Cumulative metabolic and performance benefits" },
  ],
};

const LipoC: Peptide = {
  id: "lipo-c",
  name: "Lipo-C",
  shortCode: "LIP",
  subtitle: "Lipotropic Injection | MIC + B Vitamins",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.ENERGY],
  dosing: { typicalDose: "1ml", frequency: "1x weekly", route: "Injectable", routeDetails: "Intramuscular: deltoid or gluteal", cycleDuration: "Ongoing", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Lipo-C is a lipotropic injection blend containing MIC (Methionine, Inositol, Choline) plus B vitamins (B1, B2, B5, B6, B12). These compounds support hepatic fat metabolism, bile production, and cellular energy. Widely used in medical weight loss clinics.",
    keyBenefits: "Enhanced hepatic fat processing, B vitamin energy support, improved bile flow, metabolic cofactor replenishment.",
    mechanism: "Methionine assists in fat breakdown, Inositol aids lipid transport, Choline prevents fat accumulation in the liver, and B vitamins serve as essential cofactors for energy metabolism pathways.",
  },
  molecularInfo: { weight: "N/A", length: 0, type: "Lipotropic compound blend", sequence: "Methionine + Inositol + Choline + B vitamins" },
  indications: [{ name: "Weight Loss", effectiveness: "moderate", details: [{ title: "Metabolic Support", description: "Supports hepatic fat processing and energy metabolism as adjunct to diet and exercise." }] }],
  protocols: [{ goal: "Weight management support", dose: "1ml", frequency: "1x weekly", route: "Intramuscular" }],
  sideEffects: ["Injection site discomfort", "Mild GI upset", "Urine discoloration (B vitamins)"],
  safetyNotes: ["Components are generally well-tolerated", "Compounding pharmacy product", "Not FDA approved as combination"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "90 days" },
  timeline: [
    { week: "1-2", description: "Improved energy from B vitamin replenishment" },
    { week: "2-8", description: "Enhanced fat metabolism with diet and exercise" },
  ],
};

const CJC1295DAC: Peptide = {
  id: "cjc-1295-dac",
  name: "CJC-1295 with DAC",
  shortCode: "CJD",
  subtitle: "Long-Acting GHRH Analog | Extended GH Release",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.ANTI_AGING, PeptideCategory.MUSCLE_GROWTH],
  dosing: { typicalDose: "2mg", frequency: "1x weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh", cycleDuration: "8-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "CJC-1295 with DAC (Drug Affinity Complex) is a long-acting GHRH analog with a maleimidopropionic acid linker that binds to albumin, extending its half-life to approximately 8 days. This provides sustained GH elevation with once-weekly dosing, unlike the no-DAC version which requires multiple daily injections.",
    keyBenefits: "Once-weekly dosing convenience, sustained GH elevation, improved body composition, enhanced recovery.",
    mechanism: "Binds GHRH receptors on pituitary somatotrophs to stimulate GH synthesis. The DAC moiety binds serum albumin, creating a sustained-release depot that maintains elevated GH and IGF-1 levels for days.",
  },
  molecularInfo: { weight: "3,647.3 Da", length: 30, type: "GHRH analog with Drug Affinity Complex", sequence: "Modified GRF 1-29 with maleimidopropionic acid-DAC" },
  indications: [{ name: "Growth Hormone", effectiveness: "most_effective", details: [{ title: "Sustained GH Elevation", description: "Single dose raises GH levels for 6-8 days, increasing IGF-1 by 200-300% above baseline." }] }],
  protocols: [
    { goal: "GH optimization", dose: "2mg", frequency: "Once weekly", route: "Subcutaneous" },
    { goal: "Anti-aging", dose: "1-2mg", frequency: "Once weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Water retention", "Flushing", "Headache", "Potential GH side effects (joint pain, carpal tunnel)", "Less pulsatile GH release than no-DAC version"],
  safetyNotes: ["Not FDA approved", "Monitor IGF-1 levels", "Less physiological than pulsatile GH release", "WADA banned substance"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "21 days" },
  timeline: [
    { week: "1-2", description: "IGF-1 elevation, improved sleep quality" },
    { week: "2-8", description: "Body composition changes, enhanced recovery" },
    { week: "8-12", description: "Cumulative anti-aging and muscle benefits" },
  ],
  pharmacokinetics: { peakTime: "24-48 hrs", halfLife: "8 days", clearanceTime: "30 days", halfLifeHours: 192 },
};

const Hexarelin: Peptide = {
  id: "hexarelin",
  name: "Hexarelin",
  shortCode: "HEX",
  subtitle: "Hexapeptide GHRP | GH Release & Cardioprotection",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.CARDIOVASCULAR, PeptideCategory.MUSCLE_GROWTH],
  dosing: { typicalDose: "100-200mcg", frequency: "2-3x daily", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh", cycleDuration: "8-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Hexarelin is a synthetic hexapeptide growth hormone releasing peptide (GHRP) and the strongest GHRP available. It stimulates potent GH release and has unique cardioprotective properties independent of GH release, acting directly on cardiac tissue.",
    keyBenefits: "Strongest GH release of any GHRP, cardioprotective effects, improved cardiac function, robust muscle growth stimulus.",
    mechanism: "Binds ghrelin/GHS-R1a receptors on pituitary somatotrophs for potent GH release. Also activates cardiac GHS receptors for direct cardioprotective effects including improved left ventricular function and reduced fibrosis.",
  },
  molecularInfo: { weight: "887 Da", length: 6, type: "Hexapeptide GHRP", sequence: "His-D-2-MeTrp-Ala-Trp-D-Phe-Lys-NH2" },
  indications: [
    { name: "Growth Hormone", effectiveness: "most_effective", details: [{ title: "Potent GH Release", description: "Strongest GH secretagogue peptide available, with greater GH release than GHRP-6 or Ipamorelin." }] },
    { name: "Cardiovascular", effectiveness: "effective", details: [{ title: "Cardioprotection", description: "Direct cardiac protective effects independent of GH, improving cardiac function in heart failure models." }] },
  ],
  protocols: [
    { goal: "GH optimization", dose: "100-200mcg", frequency: "2-3x daily", route: "Subcutaneous" },
    { goal: "Cardioprotection", dose: "100mcg", frequency: "2x daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Increased cortisol and prolactin (more than Ipamorelin)", "Increased hunger", "Water retention", "Desensitization with chronic use"],
  safetyNotes: ["Not FDA approved", "Raises cortisol/prolactin unlike Ipamorelin", "Rapid desensitization at higher doses", "WADA banned"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "21 days" },
  timeline: [
    { week: "1-2", description: "Immediate GH release, improved sleep" },
    { week: "2-8", description: "Body composition improvements, cardiac benefits" },
    { week: "8-12", description: "Note: desensitization may occur, cycling recommended" },
  ],
};

const HGH: Peptide = {
  id: "hgh",
  name: "HGH",
  shortCode: "HGH",
  subtitle: "Human Growth Hormone | 191aa Recombinant Somatropin",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.ANTI_AGING, PeptideCategory.MUSCLE_GROWTH],
  dosing: { typicalDose: "1-4 IU", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh (morning or before bed)", cycleDuration: "3-6 months", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Human Growth Hormone (somatropin) is a 191-amino acid recombinant protein identical to endogenous pituitary GH. FDA approved for GH deficiency, Turner syndrome, and other conditions. Widely used off-label for anti-aging, body composition, and performance.",
    keyBenefits: "FDA approved, direct GH replacement, improved body composition, enhanced recovery, anti-aging effects, bone density improvement.",
    mechanism: "Binds GH receptors to stimulate IGF-1 production, promote protein synthesis, enhance lipolysis, increase bone mineralization, and support immune function.",
  },
  molecularInfo: { weight: "22,124 Da", length: 191, type: "Recombinant human growth hormone", sequence: "191-amino acid single-chain polypeptide" },
  indications: [
    { name: "Growth Hormone", effectiveness: "most_effective", details: [{ title: "GH Deficiency", description: "FDA-approved standard of care for adult and pediatric GH deficiency." }] },
    { name: "Anti-Aging", effectiveness: "effective", details: [{ title: "Body Composition", description: "Reduces fat mass, increases lean mass, improves skin thickness and bone density." }] },
  ],
  protocols: [
    { goal: "GH deficiency (FDA)", dose: "1-2 IU", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Anti-aging", dose: "2-3 IU", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Performance", dose: "3-4 IU", frequency: "Once daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Joint pain", "Water retention/edema", "Carpal tunnel syndrome", "Insulin resistance", "Potential tumor growth stimulation"],
  safetyNotes: ["FDA approved for specific indications", "Monitor IGF-1 levels", "Contraindicated in active malignancy", "Can worsen insulin resistance"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [
    { week: "1-4", description: "Improved sleep, energy, skin quality" },
    { week: "4-12", description: "Fat loss, lean mass gains" },
    { week: "12-24", description: "Maximum body composition and anti-aging benefits" },
  ],
  pharmacokinetics: { peakTime: "2-6 hrs", halfLife: "3-5 hrs", clearanceTime: "20 hrs", halfLifeHours: 4 },
};

const IGF1LR3: Peptide = {
  id: "igf1-lr3",
  name: "IGF-1 LR3",
  shortCode: "IGF",
  subtitle: "Modified Growth Factor | Muscle Growth & Recovery",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.MUSCLE_GROWTH, PeptideCategory.TISSUE_REPAIR, PeptideCategory.METABOLISM],
  dosing: { typicalDose: "20-60mcg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous or intramuscular", cycleDuration: "4-6 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "IGF-1 LR3 is an 83-amino acid analog of IGF-1 with an arginine substitution at position 3 and a 13-amino acid N-terminal extension. These modifications reduce IGF binding protein affinity, resulting in a 2-3x longer half-life and greater bioactivity than native IGF-1.",
    keyBenefits: "Extended half-life vs native IGF-1, potent anabolic effects, hyperplasia (new muscle cell creation), enhanced recovery.",
    mechanism: "Binds IGF-1 receptors with reduced IGFBP sequestration, activating PI3K/AKT and MAPK/ERK pathways for protein synthesis, cell proliferation (hyperplasia), and anti-apoptotic effects in muscle tissue.",
  },
  molecularInfo: { weight: "9,111 Da", length: 83, type: "Modified IGF-1 analog", sequence: "83aa IGF-1 analog with Arg3 substitution and 13aa N-terminal extension" },
  indications: [{ name: "Muscle Growth", effectiveness: "most_effective", details: [{ title: "Anabolic/Hyperplastic", description: "Promotes both hypertrophy and hyperplasia (new muscle cell creation), a unique mechanism not shared by other peptides." }] }],
  protocols: [
    { goal: "Muscle growth", dose: "20-50mcg", frequency: "Once daily (post-workout)", route: "Intramuscular or subcutaneous" },
    { goal: "Recovery", dose: "40-60mcg", frequency: "Once daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Hypoglycemia (most significant risk)", "Joint pain", "Jaw/hand growth with chronic use", "Organ growth potential"],
  safetyNotes: ["Research chemical only - not FDA approved", "Hypoglycemia risk requires glucose monitoring", "Theoretical cancer risk from cell proliferation", "Short cycles recommended"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [
    { week: "1-2", description: "Enhanced recovery, possible hypoglycemia" },
    { week: "2-4", description: "Muscle fullness, strength gains" },
    { week: "4-6", description: "Maximum anabolic effects, cycle off recommended" },
  ],
};

const PEGMGF: Peptide = {
  id: "peg-mgf",
  name: "PEG-MGF",
  shortCode: "PMG",
  subtitle: "Pegylated Mechano Growth Factor | Muscle Repair",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.MUSCLE_GROWTH, PeptideCategory.TISSUE_REPAIR],
  dosing: { typicalDose: "200mcg", frequency: "2-3x weekly", route: "Injectable", routeDetails: "Intramuscular near target muscle", cycleDuration: "4-6 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "PEG-MGF is a pegylated form of Mechano Growth Factor, a splice variant of IGF-1 produced in response to mechanical muscle damage. PEGylation extends its half-life from minutes to hours, allowing systemic administration for muscle repair and growth.",
    keyBenefits: "Extended half-life vs native MGF, targeted muscle repair, satellite cell activation, enhanced recovery from training.",
    mechanism: "Activates muscle satellite (stem) cells and promotes their proliferation and differentiation into new muscle fibers. PEGylation prevents rapid degradation.",
  },
  molecularInfo: { weight: "~5,000 Da", length: 24, type: "PEGylated IGF-1 splice variant", sequence: "PEGylated MGF C-terminal peptide" },
  indications: [{ name: "Muscle Growth", effectiveness: "effective", details: [{ title: "Satellite Cell Activation", description: "Activates dormant muscle stem cells for muscle fiber repair and new fiber creation." }] }],
  protocols: [{ goal: "Muscle repair/growth", dose: "200mcg", frequency: "2-3x weekly", route: "Intramuscular" }],
  sideEffects: ["Injection site pain", "Hypoglycemia possible", "Limited human data"],
  safetyNotes: ["Research chemical only", "Not FDA approved", "WADA banned", "Limited human safety data"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-2", description: "Enhanced recovery" }, { week: "2-6", description: "Muscle repair and growth" }],
};

const Follistatin344: Peptide = {
  id: "follistatin-344",
  name: "Follistatin 344",
  shortCode: "FST",
  subtitle: "Myostatin Inhibitor | TGF-β Antagonist",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.MUSCLE_GROWTH, PeptideCategory.TISSUE_REPAIR],
  dosing: { typicalDose: "100mcg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous", cycleDuration: "10-30 days", storageTemp: "-20°C", storageNotes: "Frozen; very fragile protein" },
  overview: {
    description: "Follistatin 344 is a naturally occurring glycoprotein that binds and neutralizes myostatin (GDF-8) and other TGF-β superfamily members like activin. By inhibiting myostatin, it removes the brake on muscle growth, leading to significant muscle hypertrophy in animal models.",
    keyBenefits: "Myostatin neutralization, enhanced muscle growth potential, removal of natural muscle growth limitation.",
    mechanism: "Binds myostatin and activin with high affinity, preventing them from activating ActRIIB receptors. This removes the negative regulation of muscle growth, allowing enhanced protein synthesis and muscle hypertrophy.",
  },
  molecularInfo: { weight: "~37,000 Da", length: 344, type: "Glycoprotein myostatin inhibitor", sequence: "344-amino acid glycoprotein with 3 follistatin domains" },
  indications: [{ name: "Muscle Growth", effectiveness: "effective", details: [{ title: "Myostatin Inhibition", description: "Dramatic muscle growth in animal models through myostatin neutralization; human data limited." }] }],
  protocols: [{ goal: "Muscle growth", dose: "100mcg", frequency: "Once daily for 10-30 days", route: "Subcutaneous" }],
  sideEffects: ["Potential tendon/ligament vulnerability (muscle outgrows connective tissue)", "Unknown long-term effects", "Possible reproductive effects"],
  safetyNotes: ["Research chemical only", "Extremely limited human data", "Very fragile protein requiring careful handling", "WADA banned"],
  storage: { temperature: "-20°C", condition: "Frozen", reconstitutedStability: "7 days refrigerated" },
  timeline: [{ week: "1-2", description: "Early anabolic signaling" }, { week: "2-4", description: "Muscle growth acceleration" }],
};

const HCG: Peptide = {
  id: "hcg",
  name: "HCG",
  shortCode: "HCG",
  subtitle: "Human Chorionic Gonadotropin | LH Receptor Agonist",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.HORMONAL, PeptideCategory.SEXUAL_HEALTH],
  dosing: { typicalDose: "250-500 IU", frequency: "2-3x weekly", route: "Injectable", routeDetails: "Subcutaneous or intramuscular", cycleDuration: "Ongoing or cyclical", storageTemp: "2-8°C", storageNotes: "Refrigerated after reconstitution" },
  overview: {
    description: "Human Chorionic Gonadotropin is a glycoprotein hormone that mimics luteinizing hormone (LH). FDA approved for fertility, it is widely used off-label to maintain testicular function, fertility, and intratesticular testosterone during TRT or hormonal therapies.",
    keyBenefits: "Maintains testicular function during TRT, preserves fertility, prevents testicular atrophy, supports intratesticular testosterone.",
    mechanism: "Binds LH/CG receptors on Leydig cells, stimulating intratesticular testosterone production and maintaining spermatogenesis independently of pituitary LH.",
  },
  molecularInfo: { weight: "36,700 Da", length: 0, type: "Heterodimeric glycoprotein hormone", sequence: "Alpha subunit (92aa) + Beta subunit (145aa)" },
  indications: [
    { name: "Hormonal", effectiveness: "most_effective", details: [{ title: "Testicular Maintenance", description: "Prevents testicular atrophy and maintains fertility during TRT." }] },
    { name: "Sexual Health", effectiveness: "effective", details: [{ title: "Fertility Preservation", description: "Maintains spermatogenesis when exogenous testosterone suppresses pituitary LH." }] },
  ],
  protocols: [
    { goal: "TRT adjunct", dose: "250 IU", frequency: "Every other day", route: "Subcutaneous" },
    { goal: "Fertility preservation", dose: "500 IU", frequency: "2-3x weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Gynecomastia (estrogen conversion)", "Water retention", "Mood changes", "Headache"],
  safetyNotes: ["FDA approved for fertility indications", "Monitor estradiol levels", "Not for use in prostate/breast cancer"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "1-2", description: "Testicular volume maintenance" }, { week: "2-8", description: "Sustained intratesticular testosterone and fertility" }],
};

const TRT: Peptide = {
  id: "trt",
  name: "TRT",
  shortCode: "TRT",
  subtitle: "Testosterone Replacement Therapy | Cypionate & Enanthate",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.HORMONAL, PeptideCategory.MUSCLE_GROWTH, PeptideCategory.METABOLISM, PeptideCategory.MOOD],
  dosing: { typicalDose: "100-200mg", frequency: "1x weekly", route: "Injectable", routeDetails: "IM or SubQ: glute, deltoid, thigh", cycleDuration: "Ongoing", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "Testosterone Replacement Therapy using testosterone cypionate or enanthate esters. FDA approved for male hypogonadism, it restores physiological testosterone levels to improve energy, body composition, mood, libido, and bone density.",
    keyBenefits: "Restored testosterone levels, improved energy and mood, increased muscle mass, fat reduction, enhanced libido, bone density support.",
    mechanism: "Exogenous testosterone binds androgen receptors throughout the body, restoring anabolic signaling for protein synthesis, erythropoiesis, bone mineralization, and CNS function.",
  },
  molecularInfo: { weight: "412.6 Da (cypionate)", length: 0, type: "Androgen hormone ester", sequence: "Testosterone with cypionate/enanthate ester" },
  indications: [
    { name: "Hormonal", effectiveness: "most_effective", details: [{ title: "Hypogonadism", description: "FDA-approved standard of care for male testosterone deficiency." }] },
    { name: "Muscle Growth", effectiveness: "effective", details: [{ title: "Body Composition", description: "Increases lean mass and reduces fat mass." }] },
  ],
  protocols: [
    { goal: "TRT standard", dose: "100-150mg", frequency: "1x weekly", route: "IM or SubQ" },
    { goal: "Optimization", dose: "150-200mg", frequency: "1x weekly (or split 2x)", route: "IM or SubQ" },
  ],
  sideEffects: ["Erythrocytosis (elevated hematocrit)", "Acne", "Hair loss (genetic predisposition)", "Testicular atrophy", "Mood changes", "Estrogen conversion"],
  safetyNotes: ["FDA approved for hypogonadism", "Monitor hematocrit, PSA, lipids, estradiol", "Suppresses endogenous production", "Use HCG to preserve fertility"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A (oil solution)" },
  timeline: [
    { week: "1-2", description: "Improved energy and mood" },
    { week: "4-8", description: "Libido improvement, early body composition changes" },
    { week: "8-16", description: "Significant muscle gain, fat loss, full mood benefits" },
  ],
  pharmacokinetics: { peakTime: "24-48 hrs", halfLife: "8 days", clearanceTime: "40 days", halfLifeHours: 192 },
};

const Kisspeptin: Peptide = {
  id: "kisspeptin",
  name: "Kisspeptin",
  shortCode: "KIS",
  subtitle: "KISS1 Gene Product | Reproductive Neuropeptide",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.HORMONAL, PeptideCategory.SEXUAL_HEALTH],
  dosing: { typicalDose: "1-10nmol/kg", frequency: "Once daily or pulsatile", route: "Injectable", routeDetails: "Subcutaneous or IV (research)", cycleDuration: "Research protocols vary", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Kisspeptin is the product of the KISS1 gene and the master upstream regulator of the hypothalamic-pituitary-gonadal axis. It stimulates GnRH neurons to trigger pulsatile LH and FSH release, making it a physiological way to stimulate endogenous testosterone and reproductive function.",
    keyBenefits: "Physiological HPG axis stimulation, endogenous testosterone boost, fertility applications, diagnostic tool for puberty disorders.",
    mechanism: "Binds KISS1R (GPR54) on GnRH neurons in the hypothalamus, triggering GnRH release which stimulates pituitary LH and FSH secretion for downstream sex hormone production.",
  },
  molecularInfo: { weight: "5,901 Da (KP-54)", length: 54, type: "Neuropeptide hormone", sequence: "54aa (KP-54), 14aa (KP-14), or 10aa (KP-10) active forms" },
  indications: [
    { name: "Hormonal", effectiveness: "effective", details: [{ title: "HPG Axis Stimulation", description: "Physiological stimulation of endogenous testosterone via GnRH/LH pathway." }] },
    { name: "Sexual Health", effectiveness: "effective", details: [{ title: "Fertility", description: "Triggers oocyte maturation in IVF protocols; stimulates LH surge." }] },
  ],
  protocols: [{ goal: "Research protocol", dose: "1-10nmol/kg", frequency: "Variable (pulsatile or bolus)", route: "Subcutaneous" }],
  sideEffects: ["Facial flushing", "Injection site reactions", "Possible desensitization with continuous dosing"],
  safetyNotes: ["Research compound", "Not FDA approved", "Pulsatile dosing may be required to avoid desensitization"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "7 days" },
  timeline: [{ week: "0", description: "Rapid LH surge within 30-60 minutes of injection" }],
};

const Dihexa: Peptide = {
  id: "dihexa",
  name: "Dihexa",
  shortCode: "DIH",
  subtitle: "Synaptogenic Peptide | Cognitive Enhancement",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.ORAL, AdministrationRoute.INJECTABLE, AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.NEUROPROTECTION],
  dosing: { typicalDose: "8-10mg", frequency: "Once daily", route: "Oral", routeDetails: "Oral capsule (morning) or SubQ or topical cream", cycleDuration: "4-8 weeks on, 2-4 weeks off", storageTemp: "20-25°C", storageNotes: "Room temperature (oral); 2-8°C (injectable)" },
  overview: {
    description: "Dihexa is a modified angiotensin IV-derived oligopeptide developed at Washington State University. It is 10 million times more potent than BDNF at stimulating new synaptic connections. It crosses the blood-brain barrier and potentiates hepatocyte growth factor (HGF)/c-Met signaling for synaptogenesis.",
    keyBenefits: "Dramatic synaptogenesis, memory and learning enhancement, neuroprotection, crosses BBB, oral bioavailability.",
    mechanism: "Binds HGF with high affinity, potentiating c-Met receptor activity and activating PI3K/AKT pathways to promote new synaptic connections at levels far exceeding BDNF.",
  },
  molecularInfo: { weight: "504.7 Da", length: 3, type: "Modified oligopeptide", sequence: "Hexanoyl-Tyr-Ile-Ahx-NH2", sequenceNote: "N-terminal hexanoic acid for BBB penetration" },
  indications: [
    { name: "Cognitive", effectiveness: "most_effective", details: [{ title: "Synaptogenesis", description: "10 million times more potent than BDNF at promoting new synaptic connections in preclinical models." }] },
    { name: "Neuroprotection", effectiveness: "effective", details: [{ title: "Cognitive Recovery", description: "Completely reversed scopolamine-induced cognitive deficits and restored aged rat cognition to young levels." }] },
  ],
  protocols: [
    { goal: "Cognitive enhancement", dose: "8-10mg", frequency: "Once daily (morning)", route: "Oral" },
    { goal: "Neuroprotection", dose: "5-8mg", frequency: "Daily or 3x weekly", route: "Oral or SubQ" },
  ],
  sideEffects: ["Headaches (most common)", "Anxiety", "Sleep disruption if dosed late", "Overstimulation possible"],
  safetyNotes: ["Research compound only", "No long-term human safety data", "Theoretical c-Met cancer risk", "Contraindicated in cancer history", "Requires cycling"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "30 days (injectable)" },
  timeline: [
    { week: "1-2", description: "Subtle cognitive changes, possible headaches" },
    { week: "2-4", description: "Improved focus and memory formation" },
    { week: "4-8", description: "Peak cognitive benefits" },
  ],
  pharmacokinetics: { peakTime: "2 hrs", halfLife: "12 hrs", clearanceTime: "2.5 days", halfLifeHours: 12 },
};

const Cerebrolysin: Peptide = {
  id: "cerebrolysin",
  name: "Cerebrolysin",
  shortCode: "CER",
  subtitle: "Neuropeptide Preparation | Neurological Recovery",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.NEUROPROTECTION],
  dosing: { typicalDose: "5-30ml", frequency: "Once daily", route: "Injectable", routeDetails: "IV infusion or IM injection", cycleDuration: "10-20 days per cycle", storageTemp: "2-8°C", storageNotes: "Refrigerated; protect from light" },
  overview: {
    description: "Cerebrolysin is a porcine brain-derived neuropeptide preparation containing low-molecular-weight peptides and free amino acids. Approved in 40+ countries for stroke, dementia, and TBI, it mimics BDNF and CNTF neurotrophic activity for neuronal repair and plasticity.",
    keyBenefits: "Approved in 40+ countries, neurotrophic factor mimicry, stroke recovery, dementia support, established clinical protocols.",
    mechanism: "Contains peptide fragments that mimic BDNF, CNTF, and other neurotrophic factors. Promotes neuronal survival, axonal sprouting, synaptogenesis, and neuroplasticity through multiple signaling cascades.",
  },
  molecularInfo: { weight: "~10,000 Da (mixture)", length: 0, type: "Porcine brain-derived neuropeptide preparation", sequence: "Complex mixture of neuropeptides and amino acids" },
  indications: [
    { name: "Neuroprotection", effectiveness: "most_effective", details: [{ title: "Stroke Recovery", description: "Approved for acute ischemic stroke in 40+ countries; improves neurological outcomes when given within 72 hours." }] },
    { name: "Cognitive", effectiveness: "effective", details: [{ title: "Dementia/Alzheimer's", description: "Modest but significant cognitive improvements in Alzheimer's clinical trials." }] },
  ],
  protocols: [
    { goal: "Stroke recovery", dose: "30ml IV", frequency: "Once daily for 10-21 days", route: "IV infusion" },
    { goal: "Cognitive enhancement", dose: "5-10ml", frequency: "Once daily for 10-20 days", route: "IM injection" },
  ],
  sideEffects: ["Dizziness", "Headache", "Agitation", "Injection site reactions", "Rare allergic reactions"],
  safetyNotes: ["Approved in 40+ countries (not FDA approved in US)", "Porcine-derived - avoid if pork allergy", "IV requires medical supervision"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "N/A (liquid preparation)" },
  timeline: [
    { week: "1-2", description: "Neurotrophic signaling activation" },
    { week: "2-3", description: "Improved cognitive processing, neuroplasticity" },
  ],
};

const NASemax: Peptide = {
  id: "na-semax-amidate",
  name: "NA-Semax-Amidate",
  shortCode: "NSA",
  subtitle: "Enhanced Nootropic | Next-Gen Semax Derivative",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.NASAL],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.NEUROPROTECTION, PeptideCategory.MOOD],
  dosing: { typicalDose: "200-600mcg", frequency: "1-2x daily", route: "Nasal", routeDetails: "Intranasal spray", cycleDuration: "10-14 days", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "NA-Semax-Amidate (N-Acetyl Semax Amidate) is an enhanced derivative of Semax with N-acetyl and C-amide modifications that improve blood-brain barrier penetration, potency, and duration of action. It provides stronger nootropic and neuroprotective effects than standard Semax.",
    keyBenefits: "Enhanced BBB penetration, more potent and longer-lasting than Semax, stronger BDNF upregulation, improved focus and memory.",
    mechanism: "Modulates BDNF, NGF, and TrkB receptor expression with enhanced CNS delivery due to N-acetylation and C-amidation. Increases dopamine and serotonin turnover in prefrontal cortex.",
  },
  molecularInfo: { weight: "~900 Da", length: 7, type: "Modified ACTH 4-10 analog", sequence: "N-Acetyl-Met-Glu-His-Phe-Pro-Gly-Pro-amide" },
  indications: [{ name: "Cognitive", effectiveness: "most_effective", details: [{ title: "Enhanced Focus/Memory", description: "Stronger and longer-lasting cognitive enhancement than parent compound Semax." }] }],
  protocols: [{ goal: "Cognitive enhancement", dose: "200-600mcg", frequency: "1-2x daily", route: "Nasal spray" }],
  sideEffects: ["Nasal irritation", "Headache (rare)", "Overstimulation at high doses"],
  safetyNotes: ["Not FDA approved", "More potent than Semax - start low", "Generally well-tolerated"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "1-2", description: "Enhanced focus, memory, and mental clarity" }],
};

const Adalank: Peptide = {
  id: "adalank",
  name: "N-Acetyl Selank Amidate",
  shortCode: "ADA",
  subtitle: "Enhanced Tuftsin Analog | Anxiolytic & Nootropic",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.NASAL],
  categories: [PeptideCategory.MOOD, PeptideCategory.COGNITIVE, PeptideCategory.IMMUNE_SUPPORT],
  dosing: { typicalDose: "250-500mcg", frequency: "1-2x daily", route: "Nasal", routeDetails: "Intranasal spray", cycleDuration: "14-21 days", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "N-Acetyl Selank Amidate (Adalank) is an enhanced derivative of Selank with N-acetyl and C-amide modifications for improved stability, BBB penetration, and potency. It provides more potent anxiolytic and nootropic effects than standard Selank without sedation.",
    keyBenefits: "Enhanced anxiolytic effects, improved BBB penetration, longer duration, cognitive enhancement without sedation, immune modulation.",
    mechanism: "Modulates GABA-A receptor allosteric sites, enhances serotonin and dopamine signaling, and upregulates BDNF with improved CNS delivery via molecular modifications.",
  },
  molecularInfo: { weight: "~800 Da", length: 7, type: "Modified tuftsin analog", sequence: "N-Acetyl-Thr-Lys-Pro-Arg-Pro-Gly-Pro-amide" },
  indications: [{ name: "Mood", effectiveness: "most_effective", details: [{ title: "Enhanced Anxiety Relief", description: "More potent and longer-lasting anxiolytic effects than parent compound Selank, without sedation or dependence." }] }],
  protocols: [{ goal: "Anxiety/Cognition", dose: "250-500mcg", frequency: "1-2x daily", route: "Nasal spray" }],
  sideEffects: ["Nasal irritation", "Fatigue (rare)"],
  safetyNotes: ["Not FDA approved", "More potent than Selank - start low", "Non-addictive"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "1-2", description: "Reduced anxiety, improved mood and cognition" }],
};

const Omberacetam: Peptide = {
  id: "omberacetam",
  name: "Omberacetam",
  shortCode: "NOP",
  subtitle: "Noopept | Synthetic Dipeptide Nootropic",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.ORAL, AdministrationRoute.NASAL],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.NEUROPROTECTION],
  dosing: { typicalDose: "10-30mg", frequency: "1-3x daily", route: "Oral", routeDetails: "Oral or sublingual", cycleDuration: "1.5-3 months", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "Omberacetam (Noopept/GVS-111) is a synthetic dipeptide nootropic derived from cycloprolylglycine. It is 1000x more potent by weight than piracetam and enhances BDNF and NGF expression for cognitive enhancement and neuroprotection. Approved in Russia for cognitive disorders.",
    keyBenefits: "Rapid onset cognitive enhancement, BDNF/NGF upregulation, neuroprotection, oral convenience, ultra-low effective dose.",
    mechanism: "Enhances BDNF and NGF expression, modulates AMPA and NMDA glutamate receptors, and provides antioxidant neuroprotection. Metabolized to cycloprolylglycine which has endogenous nootropic activity.",
  },
  molecularInfo: { weight: "318.4 Da", length: 2, type: "Synthetic dipeptide nootropic", sequence: "N-Phenylacetyl-L-prolylglycine ethyl ester" },
  indications: [{ name: "Cognitive", effectiveness: "most_effective", details: [{ title: "Cognitive Enhancement", description: "Improves memory consolidation, learning, and focus with rapid onset (15-20 minutes sublingual)." }] }],
  protocols: [
    { goal: "Cognitive enhancement", dose: "10-20mg", frequency: "2-3x daily", route: "Oral/sublingual" },
    { goal: "Neuroprotection", dose: "20-30mg", frequency: "1-2x daily", route: "Oral" },
  ],
  sideEffects: ["Headache", "Irritability at high doses", "Insomnia if taken late", "Restlessness"],
  safetyNotes: ["Approved in Russia", "1000x more potent than piracetam by weight", "Generally well-tolerated"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [{ week: "1", description: "Rapid cognitive effects (15-20 min onset)" }, { week: "1-4", description: "Progressive BDNF/NGF upregulation and sustained benefits" }],
  pharmacokinetics: { peakTime: "15-20 min", halfLife: "30-60 min", clearanceTime: "4 hrs", halfLifeHours: 0.75 },
};

const P21: Peptide = {
  id: "p21",
  name: "P21",
  shortCode: "P21",
  subtitle: "CNTF-Derived Neurogenic Peptide | Cognitive Enhancement",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.NASAL, AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.COGNITIVE, PeptideCategory.NEUROPROTECTION],
  dosing: { typicalDose: "1-2mg", frequency: "Once daily", route: "Nasal", routeDetails: "Intranasal spray or subcutaneous", cycleDuration: "4-8 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "P21 is an 11-amino acid peptide derived from CNTF (Ciliary Neurotrophic Factor) that promotes hippocampal neurogenesis. It crosses the BBB and stimulates new neuron formation without the appetite-suppressing side effects of full CNTF.",
    keyBenefits: "Hippocampal neurogenesis, cognitive enhancement without appetite suppression, memory improvement, BBB penetration.",
    mechanism: "Mimics CNTF neurotrophic signaling to stimulate neural progenitor cell proliferation and differentiation in the hippocampal dentate gyrus, creating new neurons for memory formation.",
  },
  molecularInfo: { weight: "~2,000 Da", length: 11, type: "CNTF-derived peptide", sequence: "11-amino acid CNTF fragment" },
  indications: [{ name: "Cognitive", effectiveness: "effective", details: [{ title: "Neurogenesis", description: "Promotes new neuron creation in the hippocampus, the brain's memory center." }] }],
  protocols: [{ goal: "Cognitive enhancement", dose: "1-2mg", frequency: "Once daily", route: "Nasal spray" }],
  sideEffects: ["Headache", "Nasal irritation", "Limited human safety data"],
  safetyNotes: ["Research compound only", "Not FDA approved", "Limited human data"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "2-4", description: "Early cognitive improvements" }, { week: "4-8", description: "Peak neurogenic effects" }],
};

const PE2228: Peptide = {
  id: "pe-22-28",
  name: "PE-22-28",
  shortCode: "PE2",
  subtitle: "Mini-Spadin | TREK-1 Channel Blocker",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.NASAL, AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.MOOD, PeptideCategory.COGNITIVE],
  dosing: { typicalDose: "50-100mcg", frequency: "Once daily", route: "Nasal", routeDetails: "Intranasal spray", cycleDuration: "2-4 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "PE-22-28 (Mini-Spadin) is a 7-amino acid peptide that blocks TREK-1 potassium channels, producing rapid antidepressant-like effects. Derived from the sortilin propeptide spadin, it acts within hours rather than weeks like traditional SSRIs.",
    keyBenefits: "Rapid-onset antidepressant effects (hours vs weeks), cognitive enhancement, novel non-serotonergic mechanism, neurogenesis promotion.",
    mechanism: "Blocks TREK-1 (TWIK-related K+ channel) background potassium channels, increasing neuronal excitability and enhancing serotonergic and noradrenergic neurotransmission. Also promotes hippocampal neurogenesis.",
  },
  molecularInfo: { weight: "~800 Da", length: 7, type: "TREK-1 channel blocker peptide", sequence: "7-amino acid spadin fragment (PE-22-28)" },
  indications: [{ name: "Mood", effectiveness: "effective", details: [{ title: "Rapid Antidepressant", description: "Antidepressant-like effects within hours in animal models, compared to weeks for SSRIs." }] }],
  protocols: [{ goal: "Mood/Antidepressant", dose: "50-100mcg", frequency: "Once daily", route: "Nasal spray" }],
  sideEffects: ["Limited human data", "Nasal irritation", "Potential overstimulation"],
  safetyNotes: ["Research compound only", "Not FDA approved", "Very limited human data", "Novel mechanism requires caution"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "0", description: "Rapid mood effects (hours)" }, { week: "1-4", description: "Sustained mood and cognitive benefits" }],
};

const CyclicGP: Peptide = {
  id: "cyclic-gp",
  name: "Cyclic Glycine-Proline",
  shortCode: "CGP",
  subtitle: "cGP | IGF-1 Bioavailability Regulator",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.ORAL],
  categories: [PeptideCategory.NEUROPROTECTION, PeptideCategory.METABOLISM, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "10-20mg", frequency: "Once daily", route: "Oral", routeDetails: "Oral capsule", cycleDuration: "Ongoing", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "Cyclic Glycine-Proline (cGP) is a naturally occurring cyclic dipeptide found in the brain that regulates IGF-1 bioavailability. It displaces IGF-1 from IGF binding proteins, increasing free/bioactive IGF-1 for neuroprotection and metabolic signaling.",
    keyBenefits: "Increases bioactive IGF-1, neuroprotection, oral bioavailability, naturally occurring compound, metabolic support.",
    mechanism: "Competitively displaces IGF-1 from IGF binding protein-3 (IGFBP-3), increasing the free/bioactive fraction of circulating IGF-1 available for receptor binding and neuroprotective signaling.",
  },
  molecularInfo: { weight: "154.2 Da", length: 2, type: "Cyclic dipeptide", sequence: "cyclo(Gly-Pro)" },
  indications: [{ name: "Neuroprotection", effectiveness: "effective", details: [{ title: "IGF-1 Modulation", description: "Increases bioactive IGF-1 for neuronal survival and repair signaling." }] }],
  protocols: [{ goal: "Neuroprotection/metabolic", dose: "10-20mg", frequency: "Once daily", route: "Oral" }],
  sideEffects: ["Generally well-tolerated", "Limited clinical data"],
  safetyNotes: ["Naturally occurring compound", "Not FDA approved", "Research stage"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [{ week: "1-4", description: "Gradual increase in bioactive IGF-1" }, { week: "4-8", description: "Neuroprotective and metabolic benefits" }],
};

const DSIP: Peptide = {
  id: "dsip",
  name: "DSIP",
  shortCode: "DSI",
  subtitle: "Delta Sleep-Inducing Peptide | Sleep & Stress Modulator",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.NASAL],
  categories: [PeptideCategory.SLEEP, PeptideCategory.MOOD, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "100-300mcg", frequency: "Once daily before bed", route: "Injectable", routeDetails: "Subcutaneous or intranasal, 30-60 min before sleep", cycleDuration: "10-14 days", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Delta Sleep-Inducing Peptide is a 9-amino acid neuropeptide originally isolated from cerebral venous blood of sleeping rabbits. It promotes delta wave (deep) sleep, modulates stress responses, and has analgesic and antioxidant properties.",
    keyBenefits: "Promotes deep delta wave sleep, stress modulation, pain relief, cortisol regulation, no morning grogginess.",
    mechanism: "Modulates GABAergic and glutamatergic neurotransmission to promote slow-wave sleep. Reduces cortisol and ACTH levels, provides antioxidant protection, and modulates opioid signaling for analgesic effects.",
  },
  molecularInfo: { weight: "849 Da", length: 9, type: "Neuropeptide", sequence: "Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu" },
  indications: [
    { name: "Sleep", effectiveness: "most_effective", details: [{ title: "Deep Sleep Promotion", description: "Enhances delta wave sleep patterns without morning sedation or dependence." }] },
    { name: "Mood", effectiveness: "effective", details: [{ title: "Stress Reduction", description: "Reduces cortisol and ACTH levels, modulating the stress response." }] },
  ],
  protocols: [
    { goal: "Sleep improvement", dose: "100-200mcg", frequency: "Before bed", route: "Subcutaneous" },
    { goal: "Stress/sleep", dose: "200-300mcg", frequency: "Before bed", route: "Subcutaneous or nasal" },
  ],
  sideEffects: ["Mild drowsiness", "Headache (rare)", "Generally well-tolerated"],
  safetyNotes: ["Not FDA approved", "Non-addictive", "Does not cause next-day sedation"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "0", description: "Improved sleep onset and depth within first use" }, { week: "1-2", description: "Sustained deep sleep and stress reduction" }],
};

const ThymosinAlpha1: Peptide = {
  id: "thymosin-alpha-1",
  name: "Thymosin Alpha 1",
  shortCode: "TA1",
  subtitle: "Synthetic Thymic Hormone | Immune Modulation",
  researchLevel: ResearchLevel.EXTENSIVELY_STUDIED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.IMMUNE_SUPPORT, PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "1.6mg", frequency: "2x weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh (rotate sites)", cycleDuration: "6 months typical", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Thymosin Alpha 1 (Thymalfasin/Zadaxin) is a synthetic 28-amino acid thymic peptide studied in 11,000+ patients across 30+ clinical trials. It has FDA orphan designations for four conditions and is approved in 35+ countries for immune modulation, hepatitis, and cancer adjunct therapy.",
    keyBenefits: "T-cell maturation, NK cell activation, dendritic cell modulation, approved in 35+ countries, exceptional safety profile (<1% serious AEs).",
    mechanism: "Activates multiple toll-like receptor pathways, enhances T-cell maturation from precursors, stimulates natural killer cells, and modulates dendritic cell activity for comprehensive immune enhancement.",
  },
  molecularInfo: { weight: "3,108 Da", length: 28, type: "Acetylated polypeptide", sequence: "Ac-Ser-Asp-Ala-Ala-Val-Asp-Thr-Ser-Ser-Glu-Ile-Thr-Thr-Lys-Asp-Leu-Lys-Glu-Lys-Lys-Glu-Val-Val-Glu-Glu-Ala-Glu-Asn" },
  indications: [
    { name: "Immune Support", effectiveness: "most_effective", details: [{ title: "Immune Enhancement", description: "FDA orphan designation for DiGeorge syndrome; enhanced vaccine responses in elderly and immunocompromised." }, { title: "Viral Hepatitis", description: "Approved in 35+ countries for hepatitis B/C treatment adjunct." }] },
    { name: "Anti-Inflammatory", effectiveness: "effective", details: [{ title: "Cytokine Storm Mitigation", description: "40-60% cytokine reduction observed in COVID-19 patients." }] },
  ],
  protocols: [
    { goal: "Immune support", dose: "1.6mg", frequency: "2x weekly", route: "Subcutaneous" },
    { goal: "Acute conditions", dose: "1.6mg", frequency: "2x daily x5 days, then daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Exceptional safety profile (<1% serious AEs)", "Mild injection site reactions (<10%)"],
  safetyNotes: ["Approved in 35+ countries (not US)", "Contraindicated in organ transplant recipients (graft rejection risk)", "Not recommended in pregnancy"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "7 days" },
  timeline: [
    { week: "1-2", description: "Initial immune activation" },
    { week: "2-6", description: "Enhanced immune function, reduced infection risk" },
    { week: "6-12", description: "Maximum immunomodulatory benefits" },
  ],
  pharmacokinetics: { peakTime: "2 hrs", halfLife: "2 hrs", clearanceTime: "10 hrs", halfLifeHours: 2 },
};

const ThymosinBeta4: Peptide = {
  id: "thymosin-beta-4",
  name: "Thymosin Beta-4",
  shortCode: "TB4",
  subtitle: "43-Amino Acid Regenerative Peptide | Full-Length",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.TISSUE_REPAIR, PeptideCategory.CARDIOVASCULAR, PeptideCategory.NEUROPROTECTION],
  dosing: { typicalDose: "750mcg-6mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous or intramuscular", cycleDuration: "4-6 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Thymosin Beta-4 is the full-length 43-amino acid peptide (distinct from the TB-500 fragment). It is the major actin-sequestering protein in cells and plays critical roles in tissue repair, cardiac regeneration, and neuroprotection through multiple repair pathways.",
    keyBenefits: "Full-length protein with complete biological activity, cardiac regeneration, neuroprotection, comprehensive tissue repair.",
    mechanism: "Sequesters G-actin to regulate cytoskeletal dynamics for cell migration. Activates Akt signaling for cardiomyocyte survival, promotes epicardial progenitor cell mobilization, and reduces inflammation via NF-κB modulation.",
  },
  molecularInfo: { weight: "4,963 Da", length: 43, type: "Actin-sequestering peptide", sequence: "Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES", sequenceNote: "Full-length thymosin beta-4; TB-500 is a synthetic fragment (Ac-LKKTETQ)" },
  indications: [
    { name: "Tissue Repair", effectiveness: "most_effective", details: [{ title: "Comprehensive Repair", description: "Promotes tissue repair through cell migration, angiogenesis, and anti-inflammatory mechanisms." }] },
    { name: "Cardiovascular", effectiveness: "effective", details: [{ title: "Cardiac Regeneration", description: "Activates Akt signaling in cardiomyocytes, promoting survival after ischemic injury." }] },
  ],
  protocols: [
    { goal: "Tissue repair", dose: "750mcg-2mg", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Cardiac/neuro protection", dose: "2-6mg", frequency: "Once daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Head rush", "Lethargy", "Injection site irritation"],
  safetyNotes: ["Not FDA approved", "WADA banned", "Distinct from TB-500 fragment"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-2", description: "Initial healing response" }, { week: "2-6", description: "Progressive tissue repair and recovery" }],
};

const Thymulin: Peptide = {
  id: "thymulin",
  name: "Thymulin",
  shortCode: "THM",
  subtitle: "Zinc-Dependent Thymic Nonapeptide | Immune Modulation",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.IMMUNE_SUPPORT, PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "1-10mg", frequency: "1x weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh", cycleDuration: "4-8 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated; requires zinc for biological activity" },
  overview: {
    description: "Thymulin is a zinc-dependent nonapeptide hormone produced by thymic epithelial cells. Biologically active only when bound to zinc in 1:1 ratio. Levels decline with age as the thymus involutes, making it a key mediator of immunosenescence.",
    keyBenefits: "T-cell maturation, immune balance restoration in aging, anti-inflammatory and analgesic effects, neuroendocrine-immune axis modulation.",
    mechanism: "Binds high-affinity receptors on T-cell precursors to promote differentiation into mature CD4+/CD8+ T-cells. Modulates IL-2, IL-6, TNF-alpha. Zinc binding to Glu-Ala-Lys motif is essential for activity.",
  },
  molecularInfo: { weight: "858 Da", length: 9, type: "Metallopeptide (zinc-dependent)", sequence: "Glu-Ala-Lys-Ser-Gln-Gly-Gly-Ser-Asn", sequenceNote: "Active only when complexed with Zn2+" },
  indications: [{ name: "Immune Support", effectiveness: "effective", details: [{ title: "Immunosenescence Reversal", description: "Restores T-cell function in aging by compensating for declining endogenous thymulin." }] }],
  protocols: [{ goal: "Immune restoration", dose: "1-5mg", frequency: "1x weekly", route: "Subcutaneous" }],
  sideEffects: ["Limited human safety data", "Mild injection site reactions", "Requires adequate zinc status"],
  safetyNotes: ["Not FDA approved", "Zinc cofactor required for activity", "Caution in autoimmune conditions"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-2", description: "Early T-cell modulation" }, { week: "4-8", description: "Peak immune modulation" }],
};

const LL37: Peptide = {
  id: "ll-37",
  name: "LL-37",
  shortCode: "LL3",
  subtitle: "Human Cathelicidin | Antimicrobial & Wound Healing",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.IMMUNE_SUPPORT, PeptideCategory.TISSUE_REPAIR, PeptideCategory.SKIN_HEALTH],
  dosing: { typicalDose: "10-50mcg", frequency: "Once daily", route: "Injectable or Topical", routeDetails: "Subcutaneous near wound/infection or topical", cycleDuration: "2-6 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "LL-37 is the only human cathelicidin antimicrobial peptide, a 37-amino acid alpha-helical peptide from neutrophils and epithelial cells. It has broad-spectrum antimicrobial activity against bacteria (including MRSA), viruses, and fungi, plus wound healing and biofilm disruption capabilities.",
    keyBenefits: "Broad-spectrum antimicrobial, biofilm disruption, wound healing, immune cell recruitment, endotoxin neutralization.",
    mechanism: "Disrupts microbial membranes through electrostatic interactions, neutralizes LPS endotoxin, activates FPRL1 for immune chemotaxis, and promotes angiogenesis and keratinocyte migration for wound healing.",
  },
  molecularInfo: { weight: "4,493 Da", length: 37, type: "Cathelicidin antimicrobial peptide", sequence: "LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES" },
  indications: [
    { name: "Immune Support", effectiveness: "most_effective", details: [{ title: "Antimicrobial", description: "Broad-spectrum activity against drug-resistant organisms including MRSA; disrupts bacterial biofilms." }] },
    { name: "Tissue Repair", effectiveness: "effective", details: [{ title: "Wound Healing", description: "Promotes keratinocyte migration, angiogenesis, and re-epithelialization." }] },
  ],
  protocols: [
    { goal: "Antimicrobial", dose: "10-50mcg", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Wound healing", dose: "10-25mcg", frequency: "Once daily", route: "Topical or SubQ" },
  ],
  sideEffects: ["Injection site irritation", "Potential mast cell activation at high doses", "Caution in rosacea/psoriasis"],
  safetyNotes: ["Not FDA approved", "Use low doses - very potent", "Vitamin D-dependent endogenous production"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "7 days" },
  timeline: [{ week: "1", description: "Rapid antimicrobial effects" }, { week: "1-4", description: "Wound healing and infection resolution" }],
};

const KPV: Peptide = {
  id: "kpv",
  name: "KPV",
  shortCode: "KPV",
  subtitle: "Anti-Inflammatory Tripeptide | Alpha-MSH Fragment",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL, AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.GUT_HEALTH, PeptideCategory.IMMUNE_SUPPORT, PeptideCategory.SKIN_HEALTH],
  dosing: { typicalDose: "200-500mcg", frequency: "1-2x daily", route: "Injectable", routeDetails: "SubQ (abdomen for gut), oral, or topical", cycleDuration: "4-8 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "KPV is a tripeptide derived from alpha-MSH's C-terminal fragment providing potent anti-inflammatory and antimicrobial properties without melanin production effects. It shows particular promise for IBD, skin conditions, and systemic inflammation by directly inhibiting NF-κB signaling.",
    keyBenefits: "Potent anti-inflammatory without immunosuppression, gut healing for IBD, antimicrobial, no tanning effects, multiple routes.",
    mechanism: "Enters cells and inhibits NF-κB signaling at the nuclear level, reducing TNF-α and IL-6 production. Provides selective antimicrobial activity preserving beneficial gut microbiota.",
  },
  molecularInfo: { weight: "~375 Da", length: 3, type: "Alpha-MSH C-terminal tripeptide", sequence: "Lys-Pro-Val" },
  indications: [
    { name: "Anti-Inflammatory", effectiveness: "most_effective", details: [{ title: "Systemic Inflammation", description: "Reduces TNF-α and IL-6 markers through direct NF-κB pathway inhibition." }] },
    { name: "Gut Health", effectiveness: "effective", details: [{ title: "IBD Support", description: "Significant reduction in inflammatory markers and improved intestinal barrier function in IBD models." }] },
  ],
  protocols: [
    { goal: "General anti-inflammatory", dose: "200-300mcg", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Gut health/IBD", dose: "200-500mcg", frequency: "2-3x daily", route: "Oral" },
    { goal: "Skin conditions", dose: "0.1-0.5% cream", frequency: "2-3x daily", route: "Topical" },
  ],
  sideEffects: ["Excellent safety profile", "Minimal side effects reported", "No immunosuppression"],
  safetyNotes: ["Not FDA approved", "Emerging research stage", "Well-tolerated at higher doses"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [
    { week: "0-1", description: "Subtle inflammation reduction" },
    { week: "1-2", description: "Noticeable symptom decrease" },
    { week: "4-8", description: "Significant condition improvement" },
  ],
  pharmacokinetics: { peakTime: "15 min", halfLife: "30 min", clearanceTime: "2.5 hrs", halfLifeHours: 0.5 },
};

const VIP: Peptide = {
  id: "vip",
  name: "VIP",
  shortCode: "VIP",
  subtitle: "Vasoactive Intestinal Peptide | Immune & Neuro Regulation",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.NASAL, AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.NEUROPROTECTION, PeptideCategory.CARDIOVASCULAR, PeptideCategory.GUT_HEALTH],
  dosing: { typicalDose: "50-100mcg", frequency: "1-2x daily", route: "Nasal", routeDetails: "Intranasal spray or subcutaneous", cycleDuration: "4-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Vasoactive Intestinal Peptide is a 28-amino acid neuropeptide widely distributed in the CNS and GI tract. It has potent anti-inflammatory, vasodilatory, and neuroprotective properties. Used clinically for CIRS (Chronic Inflammatory Response Syndrome) and mold illness by Dr. Shoemaker protocol.",
    keyBenefits: "Broad anti-inflammatory, vasodilation, neuroprotection, GI motility regulation, CIRS/mold illness treatment, pulmonary arterial pressure reduction.",
    mechanism: "Binds VPAC1/VPAC2 receptors to activate cAMP signaling, suppressing inflammatory cytokine production, promoting vasodilation, and modulating T-cell differentiation toward regulatory phenotypes.",
  },
  molecularInfo: { weight: "3,326 Da", length: 28, type: "Neuropeptide", sequence: "His-Ser-Asp-Ala-Val-Phe-Thr-Asp-Asn-Tyr-Thr-Arg-Leu-Arg-Lys-Gln-Met-Ala-Val-Lys-Lys-Tyr-Leu-Asn-Ser-Ile-Leu-Asn" },
  indications: [
    { name: "Anti-Inflammatory", effectiveness: "most_effective", details: [{ title: "CIRS Treatment", description: "Used in Shoemaker protocol for chronic inflammatory response syndrome and mold illness." }] },
    { name: "Neuroprotection", effectiveness: "effective", details: [{ title: "Neuroprotective", description: "Protects neurons from oxidative stress and inflammatory damage." }] },
  ],
  protocols: [
    { goal: "CIRS/Mold illness", dose: "50mcg", frequency: "4x daily", route: "Nasal spray" },
    { goal: "General anti-inflammatory", dose: "50-100mcg", frequency: "1-2x daily", route: "Nasal or SubQ" },
  ],
  sideEffects: ["Hypotension (vasodilation)", "Diarrhea", "Flushing", "Nasal irritation"],
  safetyNotes: ["Not FDA approved for inflammatory conditions", "Can cause significant blood pressure drop", "Start with low doses"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-2", description: "Anti-inflammatory effects begin" }, { week: "2-8", description: "Progressive immune modulation and symptom improvement" }],
};

const Ara290: Peptide = {
  id: "ara-290",
  name: "Ara 290",
  shortCode: "ARA",
  subtitle: "Tissue-Protective Peptide | Innate Repair Receptor Agonist",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.NEUROPROTECTION, PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.TISSUE_REPAIR],
  dosing: { typicalDose: "2-4mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous", cycleDuration: "4-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Ara 290 (cibinetide) is an 11-amino acid peptide derived from erythropoietin (EPO) that selectively activates the innate repair receptor (IRR) without stimulating erythropoiesis. It provides tissue protection and repair for neuropathy, diabetic complications, and inflammatory conditions.",
    keyBenefits: "Tissue protection without erythropoiesis, neuropathy treatment, anti-inflammatory, safe for diabetic patients.",
    mechanism: "Selectively activates the innate repair receptor (heteromer of EPOR and β-common receptor) for tissue-protective signaling including anti-apoptotic, anti-inflammatory, and neuroplastic effects, without stimulating red blood cell production.",
  },
  molecularInfo: { weight: "~1,300 Da", length: 11, type: "Non-erythropoietic EPO derivative", sequence: "11-amino acid EPO-derived peptide" },
  indications: [
    { name: "Neuroprotection", effectiveness: "effective", details: [{ title: "Neuropathy Treatment", description: "Phase 2 trials showed improvement in sarcoidosis-related small fiber neuropathy symptoms." }] },
    { name: "Anti-Inflammatory", effectiveness: "effective", details: [{ title: "Tissue Protection", description: "Anti-inflammatory and anti-apoptotic effects without erythropoietic stimulation." }] },
  ],
  protocols: [{ goal: "Neuropathy/tissue protection", dose: "2-4mg", frequency: "Once daily", route: "Subcutaneous" }],
  sideEffects: ["Generally well-tolerated in clinical trials", "Mild injection site reactions"],
  safetyNotes: ["Not FDA approved", "Phase 2 clinical data available", "No erythropoietic risk"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-4", description: "Initial neuroprotective effects" }, { week: "4-12", description: "Progressive nerve function improvement" }],
};

const Glutathione: Peptide = {
  id: "glutathione",
  name: "Glutathione",
  shortCode: "GSH",
  subtitle: "Master Antioxidant Tripeptide | Detoxification",
  researchLevel: ResearchLevel.EXTENSIVELY_STUDIED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.IMMUNE_SUPPORT, PeptideCategory.ANTI_AGING, PeptideCategory.ENERGY],
  dosing: { typicalDose: "200-600mg", frequency: "1-3x weekly", route: "Injectable", routeDetails: "IV push, IM injection, or oral (liposomal preferred)", cycleDuration: "Ongoing", storageTemp: "2-8°C", storageNotes: "Refrigerated; protect from light" },
  overview: {
    description: "Glutathione (GSH) is a tripeptide and the body's master antioxidant, present in every cell. It is critical for detoxification, immune function, and protection against oxidative stress. Levels decline with age, illness, and toxin exposure.",
    keyBenefits: "Master antioxidant defense, Phase II detoxification, immune cell optimization, mitochondrial protection, skin brightening.",
    mechanism: "Neutralizes free radicals directly and serves as cofactor for glutathione peroxidase. Conjugates toxins via glutathione S-transferase for Phase II hepatic detoxification. Maintains immune cell function by preserving intracellular redox balance.",
  },
  molecularInfo: { weight: "307.3 Da", length: 3, type: "Tripeptide antioxidant", sequence: "γ-Glu-Cys-Gly", sequenceNote: "Gamma-peptide bond between glutamate and cysteine (not alpha)" },
  indications: [
    { name: "Immune Support", effectiveness: "most_effective", details: [{ title: "Antioxidant Defense", description: "Central to cellular antioxidant defense and immune cell function; depletion compromises immunity." }] },
    { name: "Anti-Aging", effectiveness: "effective", details: [{ title: "Detoxification", description: "Essential for Phase II hepatic detoxification of drugs, toxins, and environmental pollutants." }] },
  ],
  protocols: [
    { goal: "Detoxification", dose: "600mg", frequency: "1-2x weekly", route: "IV push" },
    { goal: "Immune/antioxidant", dose: "200-400mg", frequency: "2-3x weekly", route: "IM or IV" },
    { goal: "Oral maintenance", dose: "500-1000mg liposomal", frequency: "Once daily", route: "Oral" },
  ],
  sideEffects: ["Sulfur taste with IV (temporary)", "Mild nausea", "Zinc depletion with chronic high doses"],
  safetyNotes: ["Extensively studied and generally safe", "IV requires medical supervision", "Oral bioavailability poor unless liposomal"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "24 hours (IV)" },
  timeline: [{ week: "0", description: "Immediate antioxidant effects with IV" }, { week: "1-4", description: "Cumulative detoxification and immune benefits" }],
};

const SS31: Peptide = {
  id: "ss-31",
  name: "SS-31",
  shortCode: "SS3",
  subtitle: "Elamipretide | Mitochondrial-Targeted Peptide",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.ENERGY, PeptideCategory.CARDIOVASCULAR, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "5-40mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous: abdomen, thigh (morning preferred)", cycleDuration: "4-12 weeks continuous", storageTemp: "2-8°C", storageNotes: "Refrigerated; protect from light" },
  overview: {
    description: "SS-31 (Elamipretide/FORZINITY) is an aromatic-cationic tetrapeptide that selectively targets mitochondrial cardiolipin. FDA approved September 2025 for Barth syndrome. It optimizes electron transport chain function and prevents lipid peroxidation for mitochondrial diseases and aging.",
    keyBenefits: "FDA approved (Barth syndrome), direct mitochondrial protection, enhanced ATP production, reduced oxidative stress, improved exercise capacity.",
    mechanism: "Selectively binds cardiolipin in the inner mitochondrial membrane, preventing lipid peroxidation and stabilizing electron transport chain complexes for optimal ATP production.",
  },
  molecularInfo: { weight: "~640 Da", length: 4, type: "Aromatic-cationic tetrapeptide", sequence: "D-Arg-Dmt-Lys-Phe-NH2", sequenceNote: "Dmt = 2',6'-dimethyltyrosine; selectively penetrates mitochondria" },
  indications: [
    { name: "Energy", effectiveness: "most_effective", details: [{ title: "Mitochondrial Support", description: "Enhances ATP production and reduces oxidative stress by protecting cardiolipin in the inner mitochondrial membrane." }] },
    { name: "Cardiovascular", effectiveness: "effective", details: [{ title: "Cardiac Protection", description: "Reduced cardiac injury markers and improved mitochondrial function in cardiac surgery patients." }] },
  ],
  protocols: [
    { goal: "General mitochondrial support", dose: "5-10mg", frequency: "Once daily", route: "Subcutaneous" },
    { goal: "Clinical protocol (Barth)", dose: "40mg", frequency: "Once daily", route: "Subcutaneous" },
  ],
  sideEffects: ["Mild injection site reactions", "Excellent safety profile in clinical trials", "Rare allergic responses"],
  safetyNotes: ["FDA approved for Barth syndrome (Sept 2025)", "Safe for long-term continuous use", "No known drug interactions"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [
    { week: "0-1", description: "Subtle energy improvements, reduced fatigue" },
    { week: "1-4", description: "Better endurance, faster recovery" },
    { week: "4-12", description: "Significant exercise capacity gains, sustained energy" },
  ],
  pharmacokinetics: { peakTime: "30 min", halfLife: "4 hrs", clearanceTime: "20 hrs", halfLifeHours: 4 },
};

const FOXO4DRI: Peptide = {
  id: "foxo4-dri",
  name: "FOXO4-DRI",
  shortCode: "FOX",
  subtitle: "Senolytic Peptide | FOXO4-p53 Disruption",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.ANTI_AGING, PeptideCategory.ANTI_INFLAMMATORY],
  dosing: { typicalDose: "5-10mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous", cycleDuration: "3-5 days per cycle, repeat monthly", storageTemp: "-20°C", storageNotes: "Frozen; fragile D-retro-inverso peptide" },
  overview: {
    description: "FOXO4-DRI is a D-retro-inverso peptide that selectively induces apoptosis in senescent cells by disrupting the FOXO4-p53 interaction. Senescent cells accumulate with aging and drive chronic inflammation (SASP). By clearing them, FOXO4-DRI reverses aspects of aging in preclinical models.",
    keyBenefits: "Selective senescent cell clearance, reverses age-related tissue dysfunction, reduces SASP inflammatory burden, restored fitness in aged mice.",
    mechanism: "Disrupts the FOXO4-p53 protein interaction that keeps senescent cells alive. Without FOXO4 sequestering p53, p53 translocates to mitochondria and triggers apoptosis selectively in senescent cells.",
  },
  molecularInfo: { weight: "~5,000 Da", length: 0, type: "D-retro-inverso peptide", sequence: "D-amino acid retro-inverso FOXO4 fragment", sequenceNote: "D-amino acids resist protease degradation" },
  indications: [{ name: "Anti-Aging", effectiveness: "effective", details: [{ title: "Senolysis", description: "Selectively clears senescent cells in aged mice, restoring fur density, fitness, and renal function." }] }],
  protocols: [{ goal: "Senolytic cycling", dose: "5-10mg", frequency: "Once daily for 3-5 days, monthly", route: "Subcutaneous" }],
  sideEffects: ["Temporary flu-like symptoms (senescent cell clearance)", "Injection site reactions", "Unknown long-term human effects"],
  safetyNotes: ["Research compound only", "No human clinical trials", "Theoretical risk of impaired wound healing", "Very expensive"],
  storage: { temperature: "-20°C", condition: "Frozen", reconstitutedStability: "7 days refrigerated" },
  timeline: [{ week: "0-1", description: "Senescent cell clearance (may feel flu-like)" }, { week: "2-4", description: "Tissue rejuvenation effects in preclinical models" }],
};

const NADPlus: Peptide = {
  id: "nad-plus",
  name: "NAD+",
  shortCode: "NAD",
  subtitle: "Essential Cellular Coenzyme | Anti-Aging",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL, AdministrationRoute.NASAL],
  categories: [PeptideCategory.ENERGY, PeptideCategory.ANTI_AGING, PeptideCategory.NEUROPROTECTION],
  dosing: { typicalDose: "100-500mg", frequency: "1-3x weekly", route: "Injectable", routeDetails: "IV infusion (250-500mg), IM injection (100-250mg), or SubQ", cycleDuration: "4-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "NAD+ (Nicotinamide Adenine Dinucleotide) is an essential coenzyme present in every cell, critical for energy production, DNA repair, and sirtuin activation. Levels decline 50%+ by age 60, contributing to metabolic dysfunction and aging. Direct supplementation restores cellular NAD+ for anti-aging benefits.",
    keyBenefits: "Cellular energy restoration, DNA repair via PARP enzymes, sirtuin longevity pathway activation, neuroprotection, 100% bioavailability (IV).",
    mechanism: "Direct delivery restores intracellular NAD+ for mitochondrial ATP synthesis (Complex I), DNA repair (PARP-1/2), epigenetic regulation (sirtuins 1-7), and calcium signaling (CD38). Supports 500+ enzymatic reactions.",
  },
  molecularInfo: { weight: "663.4 Da", length: 0, type: "Dinucleotide coenzyme", sequence: "Adenine-Ribose-Phosphate-Phosphate-Ribose-Nicotinamide" },
  indications: [
    { name: "Energy", effectiveness: "most_effective", details: [{ title: "Cellular Energy", description: "Restores mitochondrial ATP synthesis and enhances glucose/fat metabolism." }] },
    { name: "Anti-Aging", effectiveness: "effective", details: [{ title: "Longevity Pathways", description: "Activates sirtuins and PARP DNA repair enzymes, reducing cellular senescence." }] },
  ],
  protocols: [
    { goal: "General wellness", dose: "100-250mg", frequency: "1-2x weekly", route: "IM injection" },
    { goal: "Anti-aging", dose: "250-500mg", frequency: "2-3x weekly", route: "IV infusion" },
    { goal: "Cognitive", dose: "500-1000mg", frequency: "1-2x weekly", route: "IV infusion" },
  ],
  sideEffects: ["Chest tightness during IV (rate-dependent)", "Nausea", "Flushing", "Cramping during infusion"],
  safetyNotes: ["IV requires medical supervision and slow infusion rate", "Start low to assess tolerance", "Avoid alcohol during treatment"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "28 days" },
  timeline: [
    { week: "1-2", description: "Energy and mental clarity improvements" },
    { week: "3-4", description: "Enhanced physical performance and recovery" },
    { week: "5-12", description: "Sustained energy, improved sleep, cognitive benefits" },
  ],
  pharmacokinetics: { peakTime: "30 min", halfLife: "45 min", clearanceTime: "3.8 hrs", halfLifeHours: 0.75 },
};

const AHKCu: Peptide = {
  id: "ahk-cu",
  name: "AHK-Cu",
  shortCode: "AHK",
  subtitle: "Hair Growth Copper Peptide | Dermal Papilla Stimulator",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.HAIR_GROWTH, PeptideCategory.SKIN_HEALTH, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "0.5-2mg", frequency: "Once daily", route: "Topical", routeDetails: "Topical scalp application or mesotherapy", cycleDuration: "3-6 months", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "AHK-Cu is a copper-binding tripeptide (Ala-His-Lys-Cu) that specifically stimulates dermal papilla cells for hair follicle growth. Similar to GHK-Cu but optimized for hair growth signaling, it promotes follicle proliferation and extends the anagen (growth) phase.",
    keyBenefits: "Targeted hair follicle stimulation, extends anagen growth phase, dermal papilla cell proliferation, copper-mediated growth signaling.",
    mechanism: "Stimulates dermal papilla cells via copper-dependent growth factor signaling, upregulating VEGF and Wnt/β-catenin pathways critical for hair follicle cycling and growth phase extension.",
  },
  molecularInfo: { weight: "~420 Da", length: 3, type: "Copper tripeptide", sequence: "Ala-His-Lys-Cu" },
  indications: [{ name: "Hair Growth", effectiveness: "effective", details: [{ title: "Follicle Stimulation", description: "Stimulates dermal papilla cell proliferation and extends anagen phase for hair growth." }] }],
  protocols: [{ goal: "Hair growth", dose: "0.5-2mg topical", frequency: "Once daily", route: "Topical scalp" }],
  sideEffects: ["Scalp irritation possible", "Limited clinical data"],
  safetyNotes: ["Not FDA approved", "Emerging research", "Topical use considered low-risk"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "4-8", description: "Reduced hair shedding" }, { week: "8-24", description: "New hair growth visible" }],
};

const SNAP8: Peptide = {
  id: "snap-8",
  name: "SNAP-8",
  shortCode: "SN8",
  subtitle: "Acetyl Octapeptide-3 | Anti-Wrinkle Peptide",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.TOPICAL],
  categories: [PeptideCategory.SKIN_HEALTH, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "0.5-3% cream", frequency: "1-2x daily", route: "Topical", routeDetails: "Topical application to expression lines", cycleDuration: "Ongoing", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "SNAP-8 (Acetyl Octapeptide-3) is an 8-amino acid peptide that reduces expression lines by modulating SNARE complex formation at the neuromuscular junction. Often called 'topical Botox,' it reduces muscle contraction intensity to soften wrinkles without injections.",
    keyBenefits: "Non-invasive wrinkle reduction, inhibits expression line formation, topical convenience, no injection required.",
    mechanism: "Competes with SNAP-25 for position in the SNARE complex, reducing vesicle docking and acetylcholine release at the neuromuscular junction. This moderately reduces muscle contraction intensity, softening expression lines.",
  },
  molecularInfo: { weight: "1,075 Da", length: 8, type: "Acetylated octapeptide", sequence: "Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH2" },
  indications: [{ name: "Skin Health", effectiveness: "effective", details: [{ title: "Anti-Wrinkle", description: "Clinical studies show up to 63% reduction in wrinkle depth after 28 days at 10% concentration." }] }],
  protocols: [{ goal: "Anti-wrinkle", dose: "3-10% cream", frequency: "Twice daily", route: "Topical to expression lines" }],
  sideEffects: ["Mild skin irritation (rare)", "Generally very well-tolerated topically"],
  safetyNotes: ["Cosmetic ingredient, not FDA regulated as drug", "Well-studied safety profile", "Topical only"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [{ week: "2-4", description: "Initial smoothing of expression lines" }, { week: "4-8", description: "Maximum wrinkle reduction" }],
};

const MelanotanI: Peptide = {
  id: "melanotan-1",
  name: "Melanotan I",
  shortCode: "MT1",
  subtitle: "Afamelanotide | Melanocortin Agonist for UV Protection",
  researchLevel: ResearchLevel.FDA_APPROVED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.SKIN_HEALTH, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "16mg implant", frequency: "Every 60 days", route: "Injectable", routeDetails: "Subcutaneous implant", cycleDuration: "As needed seasonally", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Melanotan I (Afamelanotide/Scenesse) is a 13-amino acid linear melanocortin-1 receptor agonist. FDA approved for erythropoietic protoporphyria (EPP), it increases eumelanin production for photoprotection without UV exposure, offering protection against sun damage.",
    keyBenefits: "FDA approved (EPP), increases protective eumelanin, UV-free tanning, photoprotection, linear peptide with fewer side effects than MT-II.",
    mechanism: "Selectively activates MC1R on melanocytes, stimulating eumelanin (brown/black protective pigment) synthesis via cAMP/PKA pathway without requiring UV exposure.",
  },
  molecularInfo: { weight: "1,646 Da", length: 13, type: "Linear melanocortin-1 receptor agonist", sequence: "Ac-Ser-Tyr-Ser-Nle-Glu-His-D-Phe-Arg-Trp-Gly-Lys-Pro-Val-NH2" },
  indications: [{ name: "Skin Health", effectiveness: "most_effective", details: [{ title: "Photoprotection", description: "FDA approved for EPP; increases eumelanin production for UV protection without sun exposure." }] }],
  protocols: [{ goal: "EPP/Photoprotection", dose: "16mg implant", frequency: "Every 60 days", route: "Subcutaneous implant" }],
  sideEffects: ["Nausea", "Headache", "Skin darkening (desired effect)", "Implant site reactions"],
  safetyNotes: ["FDA approved for EPP (Scenesse)", "Monitor for new/changing moles", "Linear peptide - more selective than MT-II"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "Implant form" },
  timeline: [{ week: "1-2", description: "Gradual skin darkening begins" }, { week: "2-8", description: "Full photoprotective melanin production" }],
};

const MelanotanII: Peptide = {
  id: "melanotan-2",
  name: "Melanotan II",
  shortCode: "MT2",
  subtitle: "Synthetic Melanocortin | Tanning & Sexual Function",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.NASAL],
  categories: [PeptideCategory.SKIN_HEALTH, PeptideCategory.SEXUAL_HEALTH],
  dosing: { typicalDose: "0.25-0.5mg", frequency: "Every other day (loading), then 1x weekly", route: "Injectable", routeDetails: "Subcutaneous: abdomen", cycleDuration: "Loading 2-3 weeks, maintenance ongoing", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Melanotan II is a cyclic heptapeptide melanocortin agonist that stimulates melanogenesis (tanning), sexual arousal, and appetite suppression. Unlike the linear MT-I, it activates multiple melanocortin receptors (MC1R-MC5R), producing broader effects including sexual function enhancement.",
    keyBenefits: "Rapid tanning without sun, sexual arousal enhancement, appetite suppression, once-weekly maintenance after loading.",
    mechanism: "Non-selective melanocortin agonist activating MC1R (tanning), MC3R/MC4R (sexual arousal, appetite), and MC5R (sebaceous gland function). The cyclic structure provides multi-receptor activity.",
  },
  molecularInfo: { weight: "1,024 Da", length: 7, type: "Cyclic melanocortin agonist", sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2" },
  indications: [
    { name: "Skin Health", effectiveness: "most_effective", details: [{ title: "Tanning", description: "Potent melanogenesis stimulation for UV-free tanning; much stronger than MT-I." }] },
    { name: "Sexual Health", effectiveness: "effective", details: [{ title: "Sexual Arousal", description: "MC3R/MC4R activation enhances sexual desire and function in both sexes." }] },
  ],
  protocols: [
    { goal: "Tanning (loading)", dose: "0.25-0.5mg", frequency: "Every other day for 2-3 weeks", route: "Subcutaneous" },
    { goal: "Tanning (maintenance)", dose: "0.5mg", frequency: "1x weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Nausea (common initially)", "Facial flushing", "Spontaneous erections", "Darkening of moles/nevi (monitor carefully)", "Appetite suppression"],
  safetyNotes: ["Not FDA approved", "Monitor moles for changes (melanoma concern)", "Non-selective receptor activation", "Start with very low dose to assess tolerance"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [
    { week: "1-2", description: "Initial skin darkening, possible nausea" },
    { week: "2-4", description: "Significant tan development" },
    { week: "4+", description: "Maintenance phase with weekly dosing" },
  ],
};

const Cartalax: Peptide = {
  id: "cartalax",
  name: "Cartalax",
  shortCode: "CAR",
  subtitle: "Bioregulatory Tripeptide | Cartilage & Connective Tissue",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.JOINT_HEALTH, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "5-10mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous or oral capsule", cycleDuration: "10-20 days, repeat 2-3x yearly", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Cartalax (Ala-Glu-Asp) is a synthetic tripeptide bioregulator from the Khavinson peptide series developed in Russia. It targets cartilage and connective tissue maintenance, promoting chondrocyte function and collagen synthesis for joint health and anti-aging.",
    keyBenefits: "Cartilage regeneration support, connective tissue maintenance, joint health, anti-aging bioregulation.",
    mechanism: "Interacts with DNA to modulate gene expression related to chondrocyte proliferation, collagen type II synthesis, and extracellular matrix maintenance in cartilage tissue.",
  },
  molecularInfo: { weight: "~360 Da", length: 3, type: "Bioregulatory tripeptide", sequence: "Ala-Glu-Asp" },
  indications: [{ name: "Joint Health", effectiveness: "effective", details: [{ title: "Cartilage Support", description: "Promotes chondrocyte function and collagen synthesis for joint tissue maintenance." }] }],
  protocols: [{ goal: "Joint health", dose: "5-10mg", frequency: "Once daily for 10-20 days", route: "Subcutaneous or oral" }],
  sideEffects: ["Generally well-tolerated", "Mild injection site reactions"],
  safetyNotes: ["Not FDA approved", "Russian bioregulator peptide", "Limited Western clinical data"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-3", description: "Bioregulatory gene modulation" }, { week: "3-8", description: "Improved joint comfort" }],
};

const Testagen: Peptide = {
  id: "testagen",
  name: "Testagen",
  shortCode: "TSG",
  subtitle: "KEDG Tetrapeptide | Anterior Pituitary Bioregulator",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.HORMONAL, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "10-20mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous or oral capsule", cycleDuration: "10 days, repeat 2-3x yearly", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Testagen (Lys-Glu-Asp-Gly) is a synthetic tetrapeptide bioregulator targeting the anterior pituitary gland. Part of the Khavinson peptide series, it supports thyroid and hormonal function by modulating pituitary gene expression.",
    keyBenefits: "Pituitary bioregulation, thyroid function support, hormonal balance, anti-aging neuroendocrine effects.",
    mechanism: "Interacts with DNA in anterior pituitary cells to modulate expression of genes related to TSH, LH, FSH, and other tropic hormones for neuroendocrine homeostasis.",
  },
  molecularInfo: { weight: "~460 Da", length: 4, type: "Bioregulatory tetrapeptide", sequence: "Lys-Glu-Asp-Gly" },
  indications: [{ name: "Hormonal", effectiveness: "moderate", details: [{ title: "Pituitary Support", description: "Modulates anterior pituitary function for thyroid and hormonal balance." }] }],
  protocols: [{ goal: "Hormonal bioregulation", dose: "10-20mg", frequency: "Once daily for 10 days", route: "Subcutaneous or oral" }],
  sideEffects: ["Generally well-tolerated", "Limited safety data in Western literature"],
  safetyNotes: ["Not FDA approved", "Russian bioregulator", "Caution in thyroid disorders"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-2", description: "Neuroendocrine modulation begins" }],
};

const Prostamax: Peptide = {
  id: "prostamax",
  name: "Prostamax",
  shortCode: "PRX",
  subtitle: "Synthetic Tetrapeptide | Prostate Bioregulator",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE, AdministrationRoute.ORAL],
  categories: [PeptideCategory.HORMONAL, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "5-10mg", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous or oral capsule", cycleDuration: "10-20 days, repeat 2-3x yearly", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Prostamax is a synthetic tetrapeptide bioregulator from the Khavinson series targeting prostate tissue. It modulates gene expression in prostatic cells to support glandular function and may help manage age-related prostate changes.",
    keyBenefits: "Prostate tissue bioregulation, age-related prostate support, glandular function maintenance.",
    mechanism: "Interacts with DNA in prostatic epithelial cells to normalize gene expression related to cell proliferation, apoptosis, and glandular secretory function.",
  },
  molecularInfo: { weight: "~430 Da", length: 4, type: "Bioregulatory tetrapeptide", sequence: "Synthetic tetrapeptide (proprietary sequence)" },
  indications: [{ name: "Hormonal", effectiveness: "moderate", details: [{ title: "Prostate Health", description: "Supports prostate tissue function and may help manage age-related changes." }] }],
  protocols: [{ goal: "Prostate support", dose: "5-10mg", frequency: "Once daily for 10-20 days", route: "Subcutaneous or oral" }],
  sideEffects: ["Generally well-tolerated", "Limited safety data"],
  safetyNotes: ["Not FDA approved", "Russian bioregulator", "Consult urologist for prostate concerns"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [{ week: "1-3", description: "Bioregulatory effects on prostate tissue" }],
};

const SLUPP332: Peptide = {
  id: "slu-pp-332",
  name: "SLU-PP-332",
  shortCode: "SLU",
  subtitle: "Pan-ERR Agonist | Exercise Mimetic",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.ORAL],
  categories: [PeptideCategory.EXERCISE, PeptideCategory.METABOLISM, PeptideCategory.CARDIOVASCULAR],
  dosing: { typicalDose: "10-50mg", frequency: "Once daily", route: "Oral", routeDetails: "Oral", cycleDuration: "4-8 weeks", storageTemp: "20-25°C", storageNotes: "Room temperature" },
  overview: {
    description: "SLU-PP-332 is a synthetic pan-ERR (Estrogen-Related Receptor) agonist developed at Washington University. It mimics exercise adaptations by activating ERRα, ERRβ, and ERRγ transcription factors that control mitochondrial biogenesis, fatty acid oxidation, and muscle fiber type switching.",
    keyBenefits: "Exercise mimicry, enhanced endurance without training, mitochondrial biogenesis, slow-twitch fiber conversion, fat oxidation.",
    mechanism: "Activates all three ERR transcription factors to upregulate genes for mitochondrial biogenesis, oxidative phosphorylation, fatty acid beta-oxidation, and type I (slow-twitch) muscle fiber conversion.",
  },
  molecularInfo: { weight: "~450 Da", length: 0, type: "Small molecule ERR agonist", sequence: "Small molecule (not a peptide)" },
  indications: [{ name: "Exercise", effectiveness: "effective", details: [{ title: "Exercise Mimicry", description: "Increased running endurance by 50-70% in sedentary mice and improved fatigue resistance by 40%." }] }],
  protocols: [{ goal: "Exercise mimetic", dose: "10-50mg", frequency: "Once daily", route: "Oral" }],
  sideEffects: ["No human safety data", "Preclinical only", "Potential hormonal effects from ERR activation"],
  safetyNotes: ["Research compound only", "No human trials", "Theoretical endocrine effects"],
  storage: { temperature: "20-25°C", condition: "Room temperature", reconstitutedStability: "N/A" },
  timeline: [{ week: "1-4", description: "Exercise adaptation mimicry in preclinical models" }],
};

const FatBlaster: Peptide = {
  id: "fat-blaster",
  name: "Fat Blaster",
  shortCode: "FBL",
  subtitle: "Enhanced Lipotropic Blend | L-Carnitine + MIC + B Vitamins",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.WEIGHT_LOSS, PeptideCategory.METABOLISM, PeptideCategory.ENERGY],
  dosing: { typicalDose: "1ml", frequency: "1x weekly", route: "Injectable", routeDetails: "Intramuscular: deltoid or gluteal", cycleDuration: "Ongoing", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "Fat Blaster is an enhanced lipotropic injection combining L-Carnitine with the standard MIC complex (Methionine, Inositol, Choline) and B vitamins. The addition of L-Carnitine enhances mitochondrial fatty acid transport beyond standard Lipo-C formulations.",
    keyBenefits: "Enhanced fat metabolism via L-Carnitine + MIC synergy, B vitamin energy support, improved hepatic fat processing.",
    mechanism: "L-Carnitine shuttles fatty acids into mitochondria while MIC compounds support hepatic fat processing, bile flow, and methylation. B vitamins serve as metabolic cofactors for energy production.",
  },
  molecularInfo: { weight: "N/A", length: 0, type: "Lipotropic compound blend", sequence: "L-Carnitine + Methionine + Inositol + Choline + B vitamins" },
  indications: [{ name: "Weight Loss", effectiveness: "moderate", details: [{ title: "Enhanced Fat Metabolism", description: "Supports fat processing through multiple metabolic pathways as adjunct to diet and exercise." }] }],
  protocols: [{ goal: "Weight management", dose: "1ml", frequency: "1x weekly", route: "Intramuscular" }],
  sideEffects: ["Injection site discomfort", "Mild GI upset", "Urine discoloration (B vitamins)"],
  safetyNotes: ["Components well-tolerated", "Compounding pharmacy product", "Not FDA approved as combination"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "90 days" },
  timeline: [{ week: "1-2", description: "Improved energy" }, { week: "2-8", description: "Enhanced fat metabolism with exercise" }],
};

const GlowProtocol: Peptide = {
  id: "glow-protocol",
  name: "Glow Protocol",
  shortCode: "GLW",
  subtitle: "Multi-Peptide Skin Rejuvenation Complex",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.TOPICAL, AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.SKIN_HEALTH, PeptideCategory.TISSUE_REPAIR, PeptideCategory.ANTI_AGING],
  dosing: { typicalDose: "Per protocol", frequency: "Once daily", route: "Topical", routeDetails: "Topical serum or mesotherapy injection", cycleDuration: "8-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "The Glow Protocol is a multi-peptide skin rejuvenation complex combining GHK-Cu, EGF, and other regenerative peptides for comprehensive skin repair. It targets collagen synthesis, cellular turnover, and skin barrier restoration for anti-aging and rejuvenation.",
    keyBenefits: "Multi-peptide synergy for skin, collagen stimulation, cellular turnover, barrier repair, comprehensive rejuvenation.",
    mechanism: "GHK-Cu stimulates collagen/elastin synthesis, EGF promotes keratinocyte proliferation, and additional peptides support extracellular matrix remodeling for comprehensive skin regeneration.",
  },
  molecularInfo: { weight: "N/A", length: 0, type: "Multi-peptide blend", sequence: "GHK-Cu + EGF + additional peptides" },
  indications: [{ name: "Skin Health", effectiveness: "effective", details: [{ title: "Skin Rejuvenation", description: "Multi-target approach to skin aging addressing collagen, elastin, hydration, and cellular turnover." }] }],
  protocols: [{ goal: "Skin rejuvenation", dose: "Per protocol", frequency: "Once daily (topical) or weekly (mesotherapy)", route: "Topical or injectable" }],
  sideEffects: ["Mild skin irritation possible", "Redness at injection sites (mesotherapy)"],
  safetyNotes: ["Compounding pharmacy product", "Patch test recommended", "Professional application recommended for mesotherapy"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "30 days" },
  timeline: [{ week: "2-4", description: "Improved skin texture and hydration" }, { week: "4-12", description: "Visible rejuvenation and collagen improvement" }],
};

const WolverineStack: Peptide = {
  id: "wolverine-stack",
  name: "Wolverine Stack",
  shortCode: "WLV",
  subtitle: "BPC-157 + TB-500 | Tissue Repair Protocol",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.TISSUE_REPAIR, PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.MUSCLE_GROWTH],
  dosing: { typicalDose: "BPC-157 250-500mcg + TB-500 2-5mg", frequency: "BPC daily, TB-500 2x weekly", route: "Injectable", routeDetails: "Subcutaneous near injury site or systemically", cycleDuration: "4-8 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "The Wolverine Stack combines BPC-157 and TB-500 for synergistic tissue repair. BPC-157 provides localized healing via angiogenesis and growth factor modulation, while TB-500 offers systemic repair through actin regulation and cell migration. Together they address injuries from multiple pathways.",
    keyBenefits: "Synergistic healing from two complementary mechanisms, accelerated injury recovery, both local and systemic repair, well-established combination.",
    mechanism: "BPC-157 promotes angiogenesis, VEGF expression, and nitric oxide modulation for localized repair. TB-500 upregulates actin for cell migration and promotes systemic tissue remodeling. The combination provides faster and more complete healing than either alone.",
  },
  molecularInfo: { weight: "N/A", length: 0, type: "Peptide combination protocol", sequence: "BPC-157 (15aa) + TB-500 (7aa fragment)" },
  indications: [{ name: "Tissue Repair", effectiveness: "most_effective", details: [{ title: "Synergistic Healing", description: "Complementary local (BPC-157) and systemic (TB-500) repair mechanisms for accelerated recovery from injuries." }] }],
  protocols: [
    { goal: "Injury recovery", dose: "BPC 500mcg + TB-500 2.5mg", frequency: "BPC 2x daily, TB-500 2x weekly", route: "Subcutaneous" },
    { goal: "Maintenance/prevention", dose: "BPC 250mcg + TB-500 2mg", frequency: "BPC daily, TB-500 2x weekly", route: "Subcutaneous" },
  ],
  sideEffects: ["Injection site irritation", "Mild lethargy (TB-500)", "Generally well-tolerated"],
  safetyNotes: ["Neither component FDA approved", "WADA banned (TB-500)", "Well-established combination in peptide community"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [
    { week: "1-2", description: "Reduced inflammation, initial healing response" },
    { week: "2-4", description: "Accelerated tissue repair" },
    { week: "4-8", description: "Significant recovery progress" },
  ],
};

const KLOWProtocol: Peptide = {
  id: "klow-protocol",
  name: "KLOW Protocol",
  shortCode: "KLO",
  subtitle: "GHK-Cu + TB-500 + BPC-157 + KPV | Regenerative Blend",
  researchLevel: ResearchLevel.EMERGING_RESEARCH,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.TISSUE_REPAIR, PeptideCategory.ANTI_INFLAMMATORY, PeptideCategory.SKIN_HEALTH],
  dosing: { typicalDose: "Per protocol blend", frequency: "Once daily", route: "Injectable", routeDetails: "Subcutaneous", cycleDuration: "4-8 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "The KLOW Protocol is a four-peptide regenerative blend combining GHK-Cu (collagen/tissue remodeling), TB-500 (systemic repair), BPC-157 (localized healing), and KPV (anti-inflammatory). It provides comprehensive wound healing and recovery through four complementary mechanisms.",
    keyBenefits: "Four-pathway regeneration, collagen stimulation + tissue repair + healing + anti-inflammatory, comprehensive recovery protocol.",
    mechanism: "GHK-Cu stimulates collagen/elastin for tissue remodeling, TB-500 promotes cell migration via actin regulation, BPC-157 drives angiogenesis for localized repair, and KPV inhibits NF-κB to control inflammation throughout the healing process.",
  },
  molecularInfo: { weight: "N/A", length: 0, type: "Four-peptide protocol blend", sequence: "GHK-Cu + TB-500 + BPC-157 + KPV" },
  indications: [{ name: "Tissue Repair", effectiveness: "most_effective", details: [{ title: "Comprehensive Regeneration", description: "Four complementary pathways for tissue remodeling, repair, healing, and inflammation control." }] }],
  protocols: [{ goal: "Wound healing/recovery", dose: "Per protocol", frequency: "Once daily", route: "Subcutaneous" }],
  sideEffects: ["Injection site reactions", "Mild lethargy possible", "Generally well-tolerated"],
  safetyNotes: ["Compounding pharmacy product", "No single-product FDA approval", "Monitor for allergic reactions to multi-component blend"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "14 days" },
  timeline: [
    { week: "1-2", description: "Inflammation reduction, initial repair signaling" },
    { week: "2-4", description: "Active tissue regeneration" },
    { week: "4-8", description: "Comprehensive healing and remodeling" },
  ],
};

const CJCIpa: Peptide = {
  id: "cjc-ipa",
  name: "CJC-1295/Ipamorelin",
  shortCode: "CIP",
  subtitle: "GHRH + GHRP Combination | Pulsatile GH Optimization",
  researchLevel: ResearchLevel.WELL_RESEARCHED,
  administrationRoutes: [AdministrationRoute.INJECTABLE],
  categories: [PeptideCategory.GROWTH_HORMONE, PeptideCategory.ANTI_AGING, PeptideCategory.MUSCLE_GROWTH],
  dosing: { typicalDose: "CJC 100mcg + Ipa 100-300mcg", frequency: "1-3x daily", route: "Injectable", routeDetails: "Subcutaneous, ideally before bed and/or morning fasted", cycleDuration: "8-12 weeks", storageTemp: "2-8°C", storageNotes: "Refrigerated" },
  overview: {
    description: "The CJC-1295/Ipamorelin combination is the most widely used GH-releasing peptide stack. CJC-1295 (Mod GRF 1-29) amplifies GH pulses via GHRH receptors while Ipamorelin triggers clean GH release via ghrelin receptors. Together they produce synergistic, pulsatile GH release mimicking natural physiology.",
    keyBenefits: "Synergistic GH release, physiological pulsatile pattern, clean release without cortisol/prolactin elevation, improved sleep/recovery/body composition.",
    mechanism: "CJC-1295 binds GHRH receptors to prime somatotrophs for GH synthesis, while Ipamorelin binds ghrelin/GHS-R1a receptors to trigger GH release. The combination produces 3-5x greater GH output than either alone in a natural pulsatile pattern.",
  },
  molecularInfo: { weight: "N/A", length: 0, type: "GHRH + GHRP combination protocol", sequence: "CJC-1295 (29aa GHRH analog) + Ipamorelin (5aa GHRP)" },
  indications: [{ name: "Growth Hormone", effectiveness: "most_effective", details: [{ title: "Synergistic GH Release", description: "3-5x greater GH release than either peptide alone with clean pulsatile release pattern." }] }],
  protocols: [
    { goal: "Anti-aging/sleep", dose: "CJC 100mcg + Ipa 200mcg", frequency: "Before bed", route: "Subcutaneous" },
    { goal: "Body composition", dose: "CJC 100mcg + Ipa 300mcg", frequency: "2-3x daily (morning fasted + before bed)", route: "Subcutaneous" },
  ],
  sideEffects: ["Increased hunger (mild)", "Water retention", "Tingling/numbness", "Flushing (CJC component)"],
  safetyNotes: ["Neither component FDA approved", "Clean GH release without cortisol/prolactin increase", "Most popular GH peptide combination"],
  storage: { temperature: "2-8°C", condition: "Refrigerated", reconstitutedStability: "21 days" },
  timeline: [
    { week: "1-2", description: "Improved sleep quality, vivid dreams" },
    { week: "2-4", description: "Enhanced recovery, improved skin" },
    { week: "4-12", description: "Body composition improvements, fat loss, lean mass" },
  ],
};

/**
 * Complete peptide database.
 * Array of all available peptides for browsing and selection.
 */
export const PEPTIDES: Peptide[] = [
  // Original 18
  MOTSc,
  Pinealon,
  Tesamorelin,
  Retatrutide,
  Semaglutide,
  Tirzepatide,
  BPC157,
  TB500,
  Ipamorelin,
  CJC1295,
  Sermorelin,
  MK677,
  Semax,
  Selank,
  Epithalon,
  GHKCu,
  PT141,
  Oxytocin,
  // Weight Loss & Metabolic
  AOD9604,
  FiveAmino1MQ,
  Adipotide,
  Bioglutide,
  Cagrilintide,
  Mazdutide,
  Orforglipron,
  Survodutide,
  Tesofensine,
  LCarnitine,
  LipoC,
  // Growth Hormone & Muscle
  CJC1295DAC,
  Hexarelin,
  HGH,
  IGF1LR3,
  PEGMGF,
  Follistatin344,
  HCG,
  TRT,
  Kisspeptin,
  // Cognitive & Neurological
  Dihexa,
  Cerebrolysin,
  NASemax,
  Adalank,
  Omberacetam,
  P21,
  PE2228,
  CyclicGP,
  DSIP,
  // Immune & Healing
  ThymosinAlpha1,
  ThymosinBeta4,
  Thymulin,
  LL37,
  KPV,
  VIP,
  Ara290,
  Glutathione,
  // Anti-Aging & Skin
  SS31,
  FOXO4DRI,
  NADPlus,
  AHKCu,
  SNAP8,
  MelanotanI,
  MelanotanII,
  // Misc & Bioregulators
  Cartalax,
  Testagen,
  Prostamax,
  SLUPP332,
  FatBlaster,
  GlowProtocol,
  // Combination Protocols
  WolverineStack,
  KLOWProtocol,
  CJCIpa,
];

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
