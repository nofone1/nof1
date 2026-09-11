import SwiftUI

struct CatalogView: View {
    @Environment(AppStore.self) private var store
    @State private var search = ""
    @State private var category = ""
    @State private var researchLevel = ""
    @State private var favoritesOnly = false

    private var hasFilters: Bool {
        !search.isEmpty || !category.isEmpty || !researchLevel.isEmpty || favoritesOnly
    }

    private var filteredPeptides: [Peptide] {
        let query = search.trimmingCharacters(in: .whitespacesAndNewlines)
        return store.catalog.filter { peptide in
            (category.isEmpty || peptide.categories.contains(category)) &&
            (researchLevel.isEmpty || peptide.researchLevel == researchLevel) &&
            (!favoritesOnly || store.favorites.contains(peptide.id)) &&
            (query.isEmpty || ([peptide.name, peptide.shortCode, peptide.subtitle, peptide.overview.description] + peptide.categories.map(catalogLabel))
                .contains { $0.localizedCaseInsensitiveContains(query) })
        }
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(hasFilters ? "\(filteredPeptides.count) of \(store.catalog.count) peptides" : "\(store.catalog.count) peptides available for research")
                        .font(.subheadline).foregroundStyle(CatalogPalette.secondary)
                        .accessibilityIdentifier("catalog.resultCount")
                }

                VStack(alignment: .leading, spacing: 12) {
                    CatalogFilterRow(title: "Category", values: Array(Set(store.catalog.flatMap(\.categories))).sorted(), selection: $category, identifier: "catalog.categoryFilter")
                    CatalogFilterRow(title: "Research level", values: Array(Set(store.catalog.map(\.researchLevel))).sorted(), selection: $researchLevel, identifier: "catalog.researchFilter")
                    Toggle("Favorites only", isOn: $favoritesOnly)
                        .accessibilityIdentifier("catalog.favoritesFilter")
                    if hasFilters {
                        Button("Clear search & filters", systemImage: "xmark.circle") {
                            search = ""
                            category = ""
                            researchLevel = ""
                            favoritesOnly = false
                        }
                        .accessibilityIdentifier("catalog.clearFilters")
                    }
                }
                .padding(.bottom, 8)

                if let error = store.catalogError {
                    CatalogSection(title: "Catalog unavailable", icon: "exclamationmark.triangle") {
                        Text(error).foregroundStyle(CatalogPalette.warning)
                        Text("The bundled research catalog could not be read. No substitute entries have been created.")
                            .font(.subheadline).foregroundStyle(CatalogPalette.secondary)
                    }
                    .accessibilityIdentifier("catalog.error")
                }

                if filteredPeptides.isEmpty, store.catalogError == nil {
                    VStack(spacing: 12) {
                        Image(systemName: favoritesOnly ? "heart" : "magnifyingglass").font(.system(size: 38)).foregroundStyle(CatalogPalette.accent)
                        Text(favoritesOnly ? "No matching favorites" : "No peptides found").font(.headline)
                        Text(store.catalog.isEmpty ? "The catalog has not loaded." : "Try another search or clear your filters.")
                            .foregroundStyle(CatalogPalette.secondary)
                    }
                    .frame(maxWidth: .infinity).padding(.vertical, 40)
                    .accessibilityIdentifier("catalog.empty")
                }

                ForEach(filteredPeptides) { peptide in
                    HStack(alignment: .top, spacing: 12) {
                        NavigationLink {
                            PeptideDetailView(peptide: peptide)
                        } label: {
                            CatalogPeptideRow(peptide: peptide)
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("catalog.peptide.\(peptide.id)")

                        Button {
                            store.toggleFavorite(id: peptide.id)
                        } label: {
                            Image(systemName: store.favorites.contains(peptide.id) ? "heart.fill" : "heart")
                                .font(.title3).foregroundStyle(CatalogPalette.accent)
                                .frame(width: 44, height: 44)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("\(store.favorites.contains(peptide.id) ? "Remove" : "Add") \(peptide.name) \(store.favorites.contains(peptide.id) ? "from" : "to") favorites")
                        .accessibilityIdentifier("catalog.favorite.\(peptide.id)")
                    }
                    .padding(16)
                    .background(CatalogPalette.surface, in: RoundedRectangle(cornerRadius: 18))
                    .overlay(RoundedRectangle(cornerRadius: 18).stroke(.white.opacity(0.06), lineWidth: 1))
                }

                Text("Educational information only. Inclusion in this library is not a recommendation to obtain or use a compound.")
                    .font(.footnote).foregroundStyle(CatalogPalette.secondary).padding(.vertical, 8)
            }
            .padding(20)
        }
        .background(CatalogPalette.background).foregroundStyle(CatalogPalette.text).tint(CatalogPalette.accent)
        .navigationTitle("Peptide Database")
        .searchable(text: $search, prompt: "Search peptides, uses, or categories")
        .autocorrectionDisabled()
        .accessibilityIdentifier("catalog.screen")
    }
}

private struct CatalogPeptideRow: View {
    let peptide: Peptide

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Text(peptide.shortCode).font(.caption.weight(.bold)).monospaced()
                    .foregroundStyle(CatalogPalette.text)
                    .frame(minWidth: 40, minHeight: 40)
                    .padding(.horizontal, 4)
                    .background(CatalogPalette.accent, in: RoundedRectangle(cornerRadius: 10))
                VStack(alignment: .leading, spacing: 4) {
                    Text(peptide.name).font(.headline).foregroundStyle(CatalogPalette.text)
                    Text(peptide.subtitle).font(.subheadline).foregroundStyle(CatalogPalette.secondary)
                }
                Spacer(minLength: 0)
            }
            CatalogCategoryChips(categories: peptide.categories)
            Divider()
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 10) {
                    researchBadge
                    Spacer(minLength: 4)
                    Text("Learn more").font(.caption.weight(.semibold)).foregroundStyle(CatalogPalette.accent)
                }
                VStack(alignment: .leading, spacing: 8) {
                    researchBadge
                    Text("Learn more").font(.caption.weight(.semibold)).foregroundStyle(CatalogPalette.accent)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }

    private var researchBadge: some View {
        Text(catalogLabel(peptide.researchLevel)).font(.caption2.weight(.semibold))
            .foregroundStyle(CatalogPalette.text)
            .padding(.horizontal, 8).padding(.vertical, 6)
            .background(catalogResearchColor(peptide.researchLevel), in: RoundedRectangle(cornerRadius: 6))
    }
}

struct PeptideDetailView: View {
    @Environment(AppStore.self) private var store
    let peptide: Peptide
    @State private var showStackSheet = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                detailHeader
                NavigationLink {
                    LegalDocumentView(document: .medical)
                } label: {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "exclamationmark.triangle").foregroundStyle(CatalogPalette.warning)
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Educational information only").font(.headline).foregroundStyle(CatalogPalette.text)
                            Text("Not medical advice or a recommendation to use this compound. Consult a qualified clinician before making health decisions.")
                                .font(.subheadline).foregroundStyle(CatalogPalette.secondary)
                            Text("Read Medical Safety").font(.caption.weight(.semibold)).foregroundStyle(CatalogPalette.accent)
                        }
                    }
                    .padding(18)
                    .background(CatalogPalette.warning.opacity(0.08), in: RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("peptide.medicalNotice")

                researchActions
                overviewSection
                dosingSection
                molecularSection
                safetySection
                storageSection
                pharmacokineticsSection
                indicationsSection
                protocolsSection
                timelineSection
                interactionsSection
                studiesSection
                reconstitutionSection
            }
            .padding(20)
            .textSelection(.enabled)
        }
        .background(CatalogPalette.background).foregroundStyle(CatalogPalette.text).tint(CatalogPalette.accent)
        .navigationTitle(peptide.name).navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    store.toggleFavorite(id: peptide.id)
                } label: {
                    Image(systemName: store.favorites.contains(peptide.id) ? "heart.fill" : "heart")
                }
                .accessibilityLabel(store.favorites.contains(peptide.id) ? "Remove from favorites" : "Add to favorites")
                .accessibilityIdentifier("peptide.favorite")
            }
        }
        .sheet(isPresented: $showStackSheet) {
            NavigationStack {
                AddStackItemView(peptide: peptide)
                    .safeAreaInset(edge: .bottom) {
                        if store.isLocal {
                            Text("Local workspace · this device only")
                                .font(.caption).foregroundStyle(CatalogPalette.accent)
                                .frame(maxWidth: .infinity).padding(12).background(CatalogPalette.background)
                        }
                    }
            }
        }
        .accessibilityIdentifier("peptide.detail.\(peptide.id)")
    }

    private var detailHeader: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 16) {
                Text(peptide.shortCode).font(.headline.monospaced()).foregroundStyle(CatalogPalette.text)
                    .padding(14).background(CatalogPalette.accent, in: RoundedRectangle(cornerRadius: 14))
                VStack(alignment: .leading, spacing: 8) {
                    Text(peptide.name).font(.largeTitle.weight(.bold)).accessibilityAddTraits(.isHeader)
                    Text(catalogLabel(peptide.researchLevel)).font(.caption.weight(.semibold))
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        .background(catalogResearchColor(peptide.researchLevel), in: Capsule())
                }
            }
            Text(peptide.subtitle).foregroundStyle(CatalogPalette.secondary)
            CatalogCategoryChips(categories: peptide.categories)
            CatalogField(title: "Administration routes", value: peptide.administrationRoutes.map(catalogLabel).joined(separator: ", "))
            Text("Research and effectiveness labels reproduce the source catalog; they do not establish safety, approval for every use, or an individual outcome.")
                .font(.footnote).foregroundStyle(CatalogPalette.secondary)
        }
    }

    private var researchActions: some View {
        CatalogSection(title: "Make it your research", icon: "square.and.pencil") {
            NavigationLink {
                DoseLogForm(peptide: peptide)
                    .navigationTitle("Log dose").navigationBarTitleDisplayMode(.inline)
            } label: {
                Label("Log dose", systemImage: "plus.circle")
                    .frame(maxWidth: .infinity).padding(.vertical, 4)
            }
            .buttonStyle(.borderedProminent)
            .accessibilityIdentifier("peptide.logDose")
            NavigationLink {
                CreateProtocolView(peptide: peptide)
            } label: {
                Label("Create protocol", systemImage: "list.clipboard")
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 4)
            }
            .accessibilityIdentifier("peptide.createProtocol")
            NavigationLink {
                CreateExperimentView(peptide: peptide)
            } label: {
                Label("Create experiment", systemImage: "chart.xyaxis.line")
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 4)
            }
            .accessibilityIdentifier("peptide.createExperiment")
            Button { showStackSheet = true } label: {
                Label("Add to stack", systemImage: "square.stack.3d.up")
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 4)
            }
            .disabled(!store.canWrite || store.isMutating)
            .accessibilityIdentifier("peptide.addToStack")
            if !store.canWrite {
                Text("Saving is currently unavailable. Your research information remains readable.")
                    .font(.footnote).foregroundStyle(CatalogPalette.secondary)
            }
        }
    }

    private var overviewSection: some View {
        CatalogSection(title: "Overview", icon: "book") {
            CatalogField(title: "What is \(peptide.name)?", value: peptide.overview.description)
            CatalogField(title: "Key benefits described in research", value: peptide.overview.keyBenefits)
            CatalogField(title: "Mechanism of action", value: peptide.overview.mechanism)
        }
    }

    private var dosingSection: some View {
        CatalogSection(title: "Dosing reference", icon: "text.book.closed") {
            Text("Source reference only, not a prescription or personal dosing recommendation.")
                .font(.footnote).foregroundStyle(CatalogPalette.warning)
            CatalogField(title: "Typical dose", value: peptide.dosing.typicalDose)
            CatalogField(title: "Frequency", value: peptide.dosing.frequency)
            CatalogField(title: "Route", value: peptide.dosing.route)
            CatalogField(title: "Route details", value: peptide.dosing.routeDetails)
            CatalogField(title: "Cycle duration", value: peptide.dosing.cycleDuration)
            CatalogField(title: "Storage temperature", value: peptide.dosing.storageTemp)
            CatalogField(title: "Storage notes", value: peptide.dosing.storageNotes)
        }
    }

    private var molecularSection: some View {
        CatalogSection(title: "Molecular information", icon: "hexagon") {
            CatalogField(title: "Weight", value: peptide.molecularInfo.weight)
            CatalogField(title: "Length", value: "\(peptide.molecularInfo.length) amino acids")
            CatalogField(title: "Type", value: peptide.molecularInfo.type)
            VStack(alignment: .leading, spacing: 8) {
                Text("Amino acid sequence").font(.subheadline.weight(.semibold))
                Text(peptide.molecularInfo.sequence).font(.footnote.monospaced())
                    .foregroundStyle(CatalogPalette.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if let note = peptide.molecularInfo.sequenceNote { CatalogField(title: "Sequence note", value: note) }
        }
    }

    private var safetySection: some View {
        CatalogSection(title: "Side effects & safety", icon: "exclamationmark.shield") {
            Text("Known side effects").font(.subheadline.weight(.semibold))
            CatalogBulletList(items: peptide.sideEffects)
            Text("Safety notes & contraindications").font(.subheadline.weight(.semibold))
            CatalogBulletList(items: peptide.safetyNotes)
            Text("This is not an exhaustive safety review. A missing warning does not mean a compound or combination is safe.")
                .font(.footnote).foregroundStyle(CatalogPalette.warning)
        }
    }

    private var storageSection: some View {
        CatalogSection(title: "Storage", icon: "thermometer.medium") {
            CatalogField(title: "Temperature", value: peptide.storage.temperature)
            CatalogField(title: "Condition", value: peptide.storage.condition)
            CatalogField(title: "Reconstituted stability", value: peptide.storage.reconstitutedStability)
        }
    }

    @ViewBuilder private var pharmacokineticsSection: some View {
        if let kinetics = peptide.pharmacokinetics {
            CatalogSection(title: "Pharmacokinetics", icon: "chart.line.downtrend.xyaxis") {
                CatalogField(title: "Time to peak", value: kinetics.peakTime)
                CatalogField(title: "Half-life", value: kinetics.halfLife)
                CatalogField(title: "Clearance time", value: kinetics.clearanceTime)
                CatalogField(title: "Half-life used by the educational model", value: "\(kinetics.halfLifeHours.formatted()) hours")
                CatalogDecayCalculator(halfLifeHours: kinetics.halfLifeHours)
            }
        }
    }

    @ViewBuilder private var indicationsSection: some View {
        if !peptide.indications.isEmpty {
            CatalogSection(title: "Research indications", icon: "chart.bar") {
                ForEach(Array(peptide.indications.enumerated()), id: \.offset) { index, indication in
                    if index > 0 { Divider() }
                    Text(indication.name).font(.headline)
                    Text("Catalog rating: \(catalogLabel(indication.effectiveness))")
                        .font(.caption).foregroundStyle(CatalogPalette.accent)
                    ForEach(Array(indication.details.enumerated()), id: \.offset) { _, detail in
                        CatalogField(title: detail.title, value: detail.description)
                    }
                }
            }
        }
    }

    @ViewBuilder private var protocolsSection: some View {
        if !peptide.protocols.isEmpty {
            CatalogSection(title: "Research protocols", icon: "list.clipboard") {
                Text("These are source catalog descriptions, not treatment plans.").font(.footnote).foregroundStyle(CatalogPalette.warning)
                ForEach(Array(peptide.protocols.enumerated()), id: \.offset) { index, researchProtocol in
                    if index > 0 { Divider() }
                    CatalogField(title: "Goal", value: researchProtocol.goal)
                    CatalogField(title: "Dose", value: researchProtocol.dose)
                    CatalogField(title: "Frequency", value: researchProtocol.frequency)
                    CatalogField(title: "Route", value: researchProtocol.route)
                }
            }
        }
    }

    @ViewBuilder private var timelineSection: some View {
        if !peptide.timeline.isEmpty {
            CatalogSection(title: "Research timeline", icon: "calendar") {
                Text("Reported expectations are not guaranteed individual results.").font(.footnote).foregroundStyle(CatalogPalette.secondary)
                ForEach(Array(peptide.timeline.enumerated()), id: \.offset) { _, entry in
                    CatalogField(title: "Week \(entry.week)", value: entry.description)
                }
            }
        }
    }

    @ViewBuilder private var interactionsSection: some View {
        if let interactions = peptide.interactions, !interactions.isEmpty {
            CatalogSection(title: "Peptide interactions", icon: "arrow.triangle.branch") {
                ForEach(Array(interactions.enumerated()), id: \.offset) { index, interaction in
                    if index > 0 { Divider() }
                    if let related = store.catalog.first(where: { $0.id == interaction.peptideId }) {
                        NavigationLink {
                            PeptideDetailView(peptide: related)
                        } label: {
                            Label(interaction.peptideName, systemImage: "arrow.up.right")
                        }
                        .accessibilityIdentifier("peptide.interaction.\(interaction.peptideId)")
                    } else {
                        Text(interaction.peptideName).font(.headline)
                    }
                    Text("Catalog classification: \(catalogLabel(interaction.type))")
                        .font(.caption).foregroundStyle(interaction.type == "caution" ? CatalogPalette.warning : CatalogPalette.accent)
                    Text(interaction.description).foregroundStyle(CatalogPalette.secondary)
                }
                Text("A compatibility or synergy label is not a clinical recommendation to combine substances.")
                    .font(.footnote).foregroundStyle(CatalogPalette.warning)
            }
        }
    }

    @ViewBuilder private var studiesSection: some View {
        if let studies = peptide.studies, !studies.isEmpty {
            CatalogSection(title: "Research studies", icon: "bookmark") {
                ForEach(Array(studies.enumerated()), id: \.offset) { index, study in
                    if index > 0 { Divider() }
                    Text(study.title).font(.headline)
                    Text("\(study.authors) (\(String(study.year))) · \(study.journal)")
                        .font(.caption).foregroundStyle(CatalogPalette.secondary)
                    Text(study.summary).foregroundStyle(CatalogPalette.secondary)
                    if let url = URL(string: "https://doi.org/\(study.doi)") {
                        Link(destination: url) { Label("Read study · \(study.doi)", systemImage: "arrow.up.right.square") }
                            .font(.subheadline)
                            .accessibilityLabel("Open research study: \(study.title)")
                    } else {
                        CatalogField(title: "DOI", value: study.doi)
                    }
                }
            }
        }
    }

    @ViewBuilder private var reconstitutionSection: some View {
        if let info = peptide.reconstitution {
            CatalogSection(title: "Reconstitution reference", icon: "drop") {
                Text("Educational source material only. Never prepare or administer a substance based only on this app. Confirm the product, solvent, concentration, and instructions with a licensed clinician and pharmacist.")
                    .font(.footnote).foregroundStyle(CatalogPalette.warning)
                CatalogField(title: "Source peptide amount", value: "\(info.defaultPeptideMg.formatted()) mg")
                CatalogField(title: "Source vial volume", value: "\(info.defaultVialMl.formatted()) mL")
                CatalogField(title: "Solvent", value: info.solvent)
                ForEach(Array(info.steps.enumerated()), id: \.offset) { index, step in
                    CatalogField(title: "Source step \(index + 1)", value: step)
                }
                Text("Source quality indicators").font(.subheadline.weight(.semibold))
                CatalogBulletList(items: info.qualityIndicators.good)
                Text("Source warning indicators").font(.subheadline.weight(.semibold))
                CatalogBulletList(items: info.qualityIndicators.bad)
                CatalogConcentrationCalculator(info: info)
            }
        }
    }
}

private struct CatalogDecayCalculator: View {
    let halfLifeHours: Double
    @State private var elapsed = ""

    private var percentage: Double? {
        guard halfLifeHours.isFinite, halfLifeHours > 0,
              let hours = Double(elapsed.replacingOccurrences(of: ",", with: ".")), hours.isFinite, hours >= 0 else { return nil }
        return 100 * pow(0.5, hours / halfLifeHours)
    }

    var body: some View {
        DisclosureGroup("Educational decay calculation") {
            VStack(alignment: .leading, spacing: 12) {
                Text("A simple single-dose exponential model: 100 × 0.5^(elapsed hours / half-life hours). It does not model absorption, repeated doses, individual clearance, or actual blood concentrations.")
                    .font(.footnote).foregroundStyle(CatalogPalette.secondary)
                TextField("Elapsed time in hours", text: $elapsed).keyboardType(.decimalPad).textFieldStyle(.roundedBorder)
                    .accessibilityLabel("Decay model elapsed time in hours").accessibilityIdentifier("decay.elapsedHours")
                if let percentage {
                    Text("\(percentage.formatted(.number.precision(.fractionLength(0...4))))% of the normalized starting amount")
                        .font(.headline).accessibilityIdentifier("decay.result")
                } else {
                    Text("Enter a nonnegative elapsed time. A positive catalog half-life is required.")
                        .font(.footnote).foregroundStyle(CatalogPalette.secondary)
                }
                Text("For education only. Do not use this estimate to choose a dose, decide when to redose, or judge whether a substance is cleared or safe.")
                    .font(.footnote).foregroundStyle(CatalogPalette.warning)
            }
            .padding(.top, 12)
        }
        .accessibilityIdentifier("peptide.decayCalculator")
    }
}

private struct CatalogConcentrationCalculator: View {
    @State private var amountMg: String
    @State private var volumeMl: String
    @State private var desiredMcg = ""

    init(info: ReconstitutionInfo) {
        _amountMg = State(initialValue: String(info.defaultPeptideMg))
        _volumeMl = State(initialValue: String(info.defaultVialMl))
    }

    private var calculation: (concentration: Double, volume: Double?)? {
        guard let amount = Double(amountMg.replacingOccurrences(of: ",", with: ".")), amount.isFinite, amount > 0,
              let volume = Double(volumeMl.replacingOccurrences(of: ",", with: ".")), volume.isFinite, volume > 0 else { return nil }
        let concentration = amount * 1_000 / volume
        guard concentration.isFinite, concentration > 0 else { return nil }
        let desired = Double(desiredMcg.replacingOccurrences(of: ",", with: "."))
        let calculatedVolume = desired.map { $0 / concentration }
        let validVolume: Double?
        if let desired, let calculatedVolume, desired.isFinite, desired > 0, desired <= amount * 1_000,
           calculatedVolume.isFinite, calculatedVolume > 0 {
            validVolume = calculatedVolume
        } else {
            validVolume = nil
        }
        return (concentration, validVolume)
    }

    var body: some View {
        DisclosureGroup("Concentration arithmetic") {
            VStack(alignment: .leading, spacing: 12) {
                Text("Amounts start from the source catalog, not a verified product label. This is unit conversion, not preparation guidance.")
                    .font(.footnote).foregroundStyle(CatalogPalette.secondary)
                TextField("Total peptide amount (mg)", text: $amountMg)
                    .accessibilityLabel("Total peptide amount in milligrams").accessibilityIdentifier("concentration.amountMg")
                TextField("Final solution volume (mL)", text: $volumeMl)
                    .accessibilityLabel("Final solution volume in milliliters").accessibilityIdentifier("concentration.volumeMl")
                TextField("Amount to convert (mcg, optional)", text: $desiredMcg)
                    .accessibilityLabel("Amount to convert in micrograms, optional").accessibilityIdentifier("concentration.desiredMcg")
                if let calculation {
                    Text("\(calculation.concentration.formatted(.number.precision(.significantDigits(1...6)))) mcg/mL")
                        .font(.headline).accessibilityIdentifier("concentration.result")
                    if let volume = calculation.volume {
                        Text("Calculated volume: \(volume.formatted(.number.precision(.significantDigits(1...6)))) mL")
                            .accessibilityIdentifier("concentration.convertedVolume")
                    } else if !desiredMcg.isEmpty {
                        Text("The amount to convert must be positive and no greater than the total peptide amount.")
                            .font(.footnote).foregroundStyle(CatalogPalette.warning)
                    }
                } else {
                    Text("Enter positive, finite amounts and volumes.").font(.footnote).foregroundStyle(CatalogPalette.secondary)
                }
                Text("Concentration = mg × 1,000 ÷ mL. Calculated volume = mcg ÷ concentration. Syringe units and administration instructions are not inferred. Confirm all calculations with a licensed clinician and pharmacist.")
                    .font(.footnote).foregroundStyle(CatalogPalette.warning)
            }
            .keyboardType(.decimalPad).textFieldStyle(.roundedBorder)
            .padding(.top, 12)
        }
        .accessibilityIdentifier("peptide.concentrationCalculator")
    }
}

private struct CatalogField: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.subheadline.weight(.semibold))
            Text(value.isEmpty ? "Not provided in the source catalog." : value)
                .foregroundStyle(CatalogPalette.secondary).fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
    }
}

private struct CatalogFilterRow: View {
    let title: String
    let values: [String]
    @Binding var selection: String
    let identifier: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased()).font(.caption2.weight(.semibold)).tracking(1.2)
                .foregroundStyle(CatalogPalette.secondary).accessibilityAddTraits(.isHeader)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach([""] + values, id: \.self) { value in
                        Button {
                            selection = selection == value ? "" : value
                        } label: {
                            Text(value.isEmpty ? "All" : catalogLabel(value)).font(.caption)
                                .foregroundStyle(selection == value ? CatalogPalette.text : CatalogPalette.secondary)
                                .padding(.horizontal, 14).padding(.vertical, 9)
                                .background(selection == value ? CatalogPalette.accent : CatalogPalette.surface, in: Capsule())
                                .frame(minHeight: 44)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("\(title): \(value.isEmpty ? "All" : catalogLabel(value))")
                        .accessibilityAddTraits(selection == value ? [.isSelected] : [])
                        .accessibilityIdentifier("\(identifier).\(value.isEmpty ? "all" : value)")
                    }
                }
            }
        }
        .accessibilityIdentifier(identifier)
    }
}

private struct CatalogCategoryChips: View {
    let categories: [String]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(categories, id: \.self) { category in
                    Text(catalogLabel(category).uppercased())
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(Color(red: 196 / 255, green: 181 / 255, blue: 253 / 255))
                        .padding(.horizontal, 8).padding(.vertical, 5)
                        .background(Theme.secondary.opacity(0.18), in: Capsule())
                }
            }
        }
    }
}

private struct CatalogBulletList: View {
    let items: [String]

    var body: some View {
        if items.isEmpty {
            Text("Not provided in the source catalog.").foregroundStyle(CatalogPalette.secondary)
        } else {
            ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                HStack(alignment: .top, spacing: 10) {
                    Text("•").foregroundStyle(CatalogPalette.accent).accessibilityHidden(true)
                    Text(item).foregroundStyle(CatalogPalette.secondary).fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }
}

private struct CatalogSection<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label(title, systemImage: icon).font(.headline).foregroundStyle(CatalogPalette.text)
                .accessibilityAddTraits(.isHeader)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(CatalogPalette.surface, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(.white.opacity(0.06), lineWidth: 1))
    }
}

private func catalogLabel(_ raw: String) -> String {
    switch raw {
    case "fda_approved": "FDA Approved"
    case "anti_aging": "Anti-Aging"
    case "anti_inflammatory": "Anti-Inflammatory"
    default: raw.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

private func catalogResearchColor(_ level: String) -> Color {
    switch level {
    case "limited_research": Color(red: 107 / 255, green: 114 / 255, blue: 128 / 255)
    case "emerging_research": Color(red: 245 / 255, green: 158 / 255, blue: 11 / 255)
    case "well_researched": Color(red: 59 / 255, green: 130 / 255, blue: 246 / 255)
    case "extensively_studied": Theme.secondary
    case "fda_approved": Color(red: 16 / 255, green: 185 / 255, blue: 129 / 255)
    default: Theme.muted
    }
}

private enum CatalogPalette {
    static let background = Theme.background
    static let surface = Theme.surface
    static let accent = Theme.accent
    static let text = Theme.text
    static let secondary = Theme.muted
    static let warning = Color(red: 212 / 255, green: 160 / 255, blue: 74 / 255)
}
