---
name: Peptide Selection Feature
overview: Add a peptide selection UI to the experiment creation screen with selectable cards, and expand the peptide database with popular peptides from Pep-Pedia.
todos:
  - id: expand-database
    content: Add ~25 new peptides to src/data/peptides.ts from Pep-Pedia categories
    status: pending
  - id: create-picker
    content: Create PeptidePicker component with selectable cards
    status: pending
  - id: integrate-picker
    content: Integrate PeptidePicker into create experiment screen with auto-fill logic
    status: pending
isProject: false
---

# Peptide Selection with Expanded Database

## Overview

1. Expand the peptide database with popular peptides from [Pep-Pedia](https://pep-pedia.org/browse)
2. Add a simple peptide picker UI to the experiment creation screen

## Part 1: Expand Peptide Database

Add the following peptides to [`src/data/peptides.ts`](src/data/peptides.ts):

### Weight Loss (4)
- **Semaglutide** - GLP-1 agonist, FDA approved, 0.25-2.4mg weekly
- **Tirzepatide** - Dual GIP/GLP-1 agonist, FDA approved, 2.5-15mg weekly
- **Mazdutide** - Dual GLP-1/Glucagon agonist, 3-9mg weekly
- **Survodutide** - Dual GLP-1/Glucagon agonist, 0.6-4.8mg weekly

### Growth Hormone (5)
- **CJC-1295 (no DAC)** - GHRH analog, 100-300mcg daily
- **Ipamorelin** - Selective GHRP, 100-300mcg 2-3x daily
- **Sermorelin** - GHRH 1-29 analog, 200-500mcg daily
- **MK-677** - Ghrelin receptor agonist, 10-25mg daily (oral)
- **HGH (Somatropin)** - FDA approved, 0.1-0.3mg daily

### Healing/Recovery (4)
- **BPC-157** - Body protection compound, 250-500mcg 1-2x daily
- **TB-500** - Thymosin Beta-4 fragment, 2-5mg 2x weekly
- **Thymosin Beta-4** - Full peptide, 750mcg-1.5mg daily
- **KPV** - Anti-inflammatory tripeptide, 200-400mcg daily

### Cognitive (5)
- **Semax** - ACTH analog, 200-600mcg daily (nasal)
- **Selank** - Tuftsin analog, 250-500mcg daily
- **Dihexa** - Synaptogenic peptide, 10-20mg daily (oral)
- **P21** - CNTF-derived, 500-1000mcg daily
- **NA Semax Amidate** - Enhanced Semax, 200-600mcg daily

### Anti-Aging (4)
- **Epithalon** - Telomerase activator, 5-10mg daily for 10-20 days
- **GHK-Cu** - Copper peptide, 1-2mg daily
- **FOXO4-DRI** - Senolytic peptide, 5-10mg 3x weekly
- **NAD+** - Cellular coenzyme, 100-500mg IV or sublingual

### Sexual Health (3)
- **PT-141** - Melanocortin agonist, FDA approved, 1.75mg as needed
- **Kisspeptin** - Reproductive neuropeptide, 1-10mcg/kg
- **Melanotan II** - Melanocortin peptide, 0.25-0.5mg daily

### Other (1)
- **Oxytocin** - Social bonding hormone, FDA approved, 10-40 IU nasal

**Total: ~26 new peptides** (bringing database from 4 to ~30)

## Part 2: Peptide Picker UI

### Create PeptidePicker Component

Create `src/components/ui/peptide-picker.tsx`:
- 2-column grid of selectable cards
- Each card shows: name + typical dose
- "Custom" option for manual entry
- Selected state with accent border

### Update Create Experiment Screen

Modify [`src/screens/experiment/create.tsx`](src/screens/experiment/create.tsx):
- Replace intervention name input with peptide picker
- Auto-fill name, dosage, frequency from `peptide.dosing`
- Keep dosage/frequency fields editable

### UI Flow

```
┌─────────────────────────────────────────────────────────────┐
│  SELECT A PEPTIDE                                           │
│  ┌─────────────────────┐ ┌─────────────────────┐           │
│  │ Semaglutide         │ │ Tirzepatide         │           │
│  │ 0.25-2.4mg weekly   │ │ 2.5-15mg weekly     │           │
│  └─────────────────────┘ └─────────────────────┘           │
│  ┌─────────────────────┐ ┌─────────────────────┐           │
│  │ BPC-157             │ │ TB-500              │           │
│  │ 250-500mcg daily    │ │ 2-5mg 2x weekly     │           │
│  └─────────────────────┘ └─────────────────────┘           │
│  ... more peptides ...                                      │
│  ┌─────────────────────┐                                   │
│  │ Custom              │                                   │
│  └─────────────────────┘                                   │
├─────────────────────────────────────────────────────────────┤
│  DOSAGE (pre-filled, editable)                             │
│  FREQUENCY (pre-filled, editable)                          │
└─────────────────────────────────────────────────────────────┘
```

## Files to Modify

1. **[`src/data/peptides.ts`](src/data/peptides.ts)** - Add ~26 new peptides with dosing data
2. **[`src/components/ui/peptide-picker.tsx`](src/components/ui/peptide-picker.tsx)** (new) - Peptide selection cards
3. **[`src/components/ui/index.ts`](src/components/ui/index.ts)** - Export new component
4. **[`src/screens/experiment/create.tsx`](src/screens/experiment/create.tsx)** - Integrate picker
