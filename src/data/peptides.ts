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

/**
 * Complete peptide database.
 * Array of all available peptides for browsing and selection.
 */
export const PEPTIDES: Peptide[] = [
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
