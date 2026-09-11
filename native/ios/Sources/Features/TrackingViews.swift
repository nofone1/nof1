import SwiftUI

enum FlowDate {
    static func iso(_ date: Date = Date()) -> String {
        DomainDate.isoString(date)
    }

    static func parse(_ value: String) -> Date? {
        DomainDate.parse(value)
    }

    static func utcDay(_ date: Date = Date()) -> String {
        DomainDate.dayKey(date)
    }

    static func isOnUTCDay(_ timestamp: String, date: Date) -> Bool {
        guard let recorded = parse(timestamp) else { return false }
        return utcDay(recorded) == utcDay(date)
    }

    static func display(_ value: String) -> String {
        guard let date = parse(value) else { return value }
        return date.formatted(date: .abbreviated, time: .shortened)
    }
}

enum FlowInput {
    static func trimmed(_ value: String) -> String {
        value.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func optional(_ value: String) -> String? {
        let result = trimmed(value)
        return result.isEmpty ? nil : result
    }

    static func number(_ value: String) -> Double? {
        guard let number = Double(trimmed(value).replacingOccurrences(of: ",", with: ".")), number.isFinite else {
            return nil
        }
        return number
    }
}

struct FlowErrorSection: View {
    let message: String?

    var body: some View {
        if let message, !message.isEmpty {
            Section {
                Label(message, systemImage: "exclamationmark.triangle")
                    .foregroundStyle(.red)
                    .accessibilityIdentifier("form.error")
            }
        }
    }
}

struct FlowStoreStatus: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        if store.isLoading {
            Section { ProgressView("Loading your records…") }
        }
        if let error = store.error {
            Section {
                Label(error, systemImage: "exclamationmark.triangle")
                    .foregroundStyle(.red)
                Button("Refresh") { Task { await store.refresh() } }
                    .accessibilityIdentifier("records.refresh")
                    .disabled(store.isLoading || store.isMutating)
            }
        }
        if !store.canWrite && !store.isMutating && !store.isLoading {
            Section {
                Label("Records are read-only. Sign in or resolve the connection issue before saving.", systemImage: "lock")
                    .foregroundStyle(Theme.muted)
            }
        }
    }
}

private enum TrackingMetricKind: String, CaseIterable, Identifiable {
    case energy, mood, sleep, focus, stress, anxiety, pain, weight, headache, nausea
    case injectionSitePain = "injection_site_pain"
    case fatigue, appetite, libido, custom

    var id: String { rawValue }
    var label: String {
        self == .injectionSitePain ? "Injection site pain" : rawValue.capitalized
    }
}

private let trackingInjectionSites: [(value: String, label: String)] = [
    ("abdomen_left", "Abdomen (left)"), ("abdomen_right", "Abdomen (right)"),
    ("thigh_left", "Thigh (left)"), ("thigh_right", "Thigh (right)"),
    ("arm_left", "Arm (left)"), ("arm_right", "Arm (right)"),
    ("glute_left", "Glute (left)"), ("glute_right", "Glute (right)")
]

private struct TrackingConcentration: Identifiable {
    let id: String
    let name: String
    let percentage: Double
    let lastDoseTime: Date
    let halfLifeHours: Double

    var status: String {
        percentage > 40 ? "Higher estimate" : percentage > 10 ? "Declining estimate" : "Low estimate"
    }

    static func calculate(doses: [DoseEntry], catalog: [Peptide], at now: Date) -> [TrackingConcentration] {
        let cutoff = now.addingTimeInterval(-7 * 24 * 60 * 60)
        let recent = doses.compactMap { dose -> (dose: DoseEntry, date: Date)? in
            guard let date = DomainDate.parse(dose.timestamp), date >= cutoff else { return nil }
            return (dose, date)
        }
        let grouped = Dictionary(grouping: recent) { $0.dose.peptideId ?? $0.dose.name }
        return grouped.compactMap { key, entries -> TrackingConcentration? in
            guard let first = entries.first,
                  let peptideID = first.dose.peptideId,
                  let pk = catalog.first(where: { $0.id == peptideID })?.pharmacokinetics,
                  pk.halfLifeHours.isFinite, pk.halfLifeHours > 0,
                  let lastDoseTime = entries.map(\.date).max() else { return nil }
            let total = entries.reduce(0.0) { total, entry in
                let hoursElapsed = now.timeIntervalSince(entry.date) / 3600
                guard hoursElapsed >= 0 else { return total }
                return total + 100 * pow(0.5, hoursElapsed / pk.halfLifeHours)
            }
            return TrackingConcentration(id: key, name: first.dose.name, percentage: min(total, 100),
                                         lastDoseTime: lastDoseTime, halfLifeHours: pk.halfLifeHours)
        }.sorted { $0.percentage > $1.percentage }
    }
}

struct TodayView: View {
    @Environment(AppStore.self) private var store
    @State private var showingLog = false
    @State private var showingStack = false
    @State private var selectedStack: StackItem?
    @State private var pendingDelete: TrackingDeletion?
    @State private var error: String?
    @State private var isSaving = false

    private enum TrackingDeletion {
        case dose(DoseEntry), metric(MetricEntry)
    }

    var body: some View {
        TimelineView(.periodic(from: .now, by: 60)) { context in
            let doses = store.tracking.doses.filter { FlowDate.isOnUTCDay($0.timestamp, date: context.date) }
                .sorted { $0.timestamp > $1.timestamp }
            let metrics = store.tracking.metrics.filter { FlowDate.isOnUTCDay($0.timestamp, date: context.date) }
                .sorted { $0.timestamp > $1.timestamp }
            let concentrations = TrackingConcentration.calculate(doses: store.tracking.doses, catalog: store.catalog, at: context.date)
            List {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("YOUR DAILY LOG · UTC")
                            .font(.caption.weight(.semibold)).tracking(1.5).foregroundStyle(Theme.muted)
                        Text(context.date, format: Date.FormatStyle(date: .omitted, time: .omitted, timeZone: TimeZone(secondsFromGMT: 0)!)
                            .weekday(.wide).month(.abbreviated).day())
                            .font(.title.weight(.semibold)).foregroundStyle(Theme.text)
                        Text("\(doses.count) doses · \(metrics.count) observations")
                            .foregroundStyle(Theme.muted)
                    }
                    .padding(.vertical, 8)
                    Button { showingLog = true } label: {
                        Label("Log Entry", systemImage: "plus.circle.fill")
                            .font(.headline).frame(maxWidth: .infinity).padding(.vertical, 5)
                    }
                    .buttonStyle(.borderedProminent).controlSize(.large)
                    .disabled(!store.canWrite)
                    .accessibilityIdentifier("today.logEntry")
                }.listRowBackground(Theme.surface)
                FlowStoreStatus()
                FlowErrorSection(message: error)
                Section {
                    let active = store.tracking.stack.filter(\.isActive)
                    if active.isEmpty {
                        Text("No active stack items. Add a peptide or a custom supplement to organize your routine.")
                            .foregroundStyle(Theme.muted)
                    }
                    ForEach(active, id: \.id) { item in
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.name).font(.headline)
                                Text("\(item.dosage) · \(item.frequency)")
                                    .font(.subheadline).foregroundStyle(Theme.muted)
                                if doses.contains(where: { $0.name == item.name || (item.peptideId != nil && $0.peptideId == item.peptideId) }) {
                                    Label("Logged today", systemImage: "checkmark.circle")
                                        .font(.caption).foregroundStyle(Theme.accent)
                                }
                            }
                            Spacer()
                            Button("Log dose") {
                                selectedStack = item
                            }
                            .buttonStyle(.bordered)
                            .disabled(!store.canWrite || store.isMutating)
                            .accessibilityLabel("Log dose of \(item.name)")
                            .accessibilityIdentifier("today.stack.log.\(item.id)")
                        }
                        .padding(.vertical, 4)
                    }
                    Button("Manage stack") { showingStack = true }
                        .accessibilityIdentifier("today.manageStack")
                } header: { Label("My Stack", systemImage: "square.stack.3d.up") }
                    .listRowBackground(Theme.surface)
                if !concentrations.isEmpty {
                    Section {
                        ForEach(concentrations) { level in
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(level.name).font(.headline)
                                    Spacer()
                                    Text("\(Int(level.percentage.rounded()))%")
                                        .font(.headline.monospacedDigit()).foregroundStyle(Theme.accent)
                                }
                                Text(level.status).font(.caption).foregroundStyle(Theme.muted)
                                ProgressView(value: level.percentage, total: 100)
                                    .accessibilityLabel("\(level.name) equal-dose decay estimate")
                                    .accessibilityValue("\(Int(level.percentage.rounded())) percent, \(level.status)")
                                Text("Latest dose: \(level.lastDoseTime.formatted(date: .abbreviated, time: .shortened)) · Half-life: \(level.halfLifeHours.formatted()) hours")
                                    .font(.caption).foregroundStyle(Theme.muted)
                            }.padding(.vertical, 4)
                                .accessibilityIdentifier("today.concentration.\(level.id)")
                        }
                    } header: { Label("Estimated concentrations", systemImage: "waveform.path") } footer: {
                        Text("Simplified equal-dose decay from the last seven days, capped at 100%. It ignores dose amount, absorption, administration route, and individual differences. This is not a blood measurement, dosing guide, or medical prediction.")
                    }
                    .listRowBackground(Theme.surface)
                }
                Section("Today’s doses") {
                    if doses.isEmpty && !store.isLoading {
                        Text("No doses recorded for this UTC day.").foregroundStyle(Theme.muted)
                    }
                    ForEach(doses, id: \.id) { dose in
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(dose.name).font(.headline)
                                Text(dose.dosage).foregroundStyle(Theme.accent)
                                if let site = dose.injectionSite {
                                    Text(trackingInjectionSites.first { $0.value == site }?.label ?? site)
                                        .font(.caption).foregroundStyle(Theme.muted)
                                }
                                Text(FlowDate.display(dose.timestamp)).font(.caption).foregroundStyle(Theme.muted)
                                if let notes = dose.notes, !notes.isEmpty { Text(notes).font(.subheadline) }
                            }
                            Spacer()
                            Button(role: .destructive) { pendingDelete = .dose(dose) } label: {
                                Image(systemName: "trash").frame(width: 44, height: 44)
                            }
                            .buttonStyle(.borderless)
                            .disabled(!store.canWrite || isSaving || store.isMutating)
                            .accessibilityLabel("Delete dose of \(dose.name)")
                            .accessibilityIdentifier("today.deleteDose.\(dose.id)")
                        }
                    }
                }.listRowBackground(Theme.surface)
                Section("Today’s observations") {
                    if metrics.isEmpty && !store.isLoading {
                        Text("No observations recorded for this UTC day.").foregroundStyle(Theme.muted)
                    }
                    ForEach(metrics, id: \.id) { metric in
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(metric.customName ?? TrackingMetricKind(rawValue: metric.metricType)?.label ?? metric.metricType)
                                    .font(.headline)
                                if let number = metric.numericValue {
                                    Text("\(number.formatted()) \(metric.unit ?? "")").foregroundStyle(Theme.secondary)
                                } else if metric.metricType == "weight" {
                                    Text("\(metric.value.formatted()) \(metric.unit ?? "")").foregroundStyle(Theme.secondary)
                                } else {
                                    Text("\(metric.value.formatted()) / 10").foregroundStyle(Theme.secondary)
                                }
                                Text(FlowDate.display(metric.timestamp)).font(.caption).foregroundStyle(Theme.muted)
                                if let notes = metric.notes, !notes.isEmpty { Text(notes).font(.subheadline) }
                            }
                            Spacer()
                            Button(role: .destructive) { pendingDelete = .metric(metric) } label: {
                                Image(systemName: "trash").frame(width: 44, height: 44)
                            }
                            .buttonStyle(.borderless)
                            .disabled(!store.canWrite || isSaving || store.isMutating)
                            .accessibilityLabel("Delete \(metric.customName ?? metric.metricType) observation")
                            .accessibilityIdentifier("today.deleteMetric.\(metric.id)")
                        }
                    }
                }.listRowBackground(Theme.surface)
            }
            .scrollContentBackground(.hidden)
            .background(Theme.background)
            .refreshable { await store.refresh() }
        }
        .navigationTitle("Today")
        .sheet(isPresented: $showingLog) {
            NavigationStack {
                QuickLogView()
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("Done") { showingLog = false }
                                .disabled(store.isMutating).accessibilityIdentifier("quickLog.done")
                        }
                    }
            }
        }
        .sheet(isPresented: $showingStack) { NavigationStack { StackManagementView() } }
        .sheet(item: $selectedStack) { item in
            NavigationStack { DoseLogForm(stackItem: item, dismissOnSave: true).navigationTitle("Confirm dose") }
        }
        .confirmationDialog("Delete this entry?", isPresented: Binding(
            get: { pendingDelete != nil }, set: { if !$0 { pendingDelete = nil } }
        ), titleVisibility: .visible) {
            if let deletion = pendingDelete {
                Button("Delete entry", role: .destructive) { Task { await delete(deletion) } }
                    .accessibilityIdentifier("today.confirmDelete")
            }
            Button("Cancel", role: .cancel) { pendingDelete = nil }.accessibilityIdentifier("today.cancelDelete")
        } message: { Text("This permanently removes the recorded entry.") }
    }

    @MainActor private func delete(_ deletion: TrackingDeletion) async {
        guard !isSaving, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            switch deletion {
            case .dose(let dose): try await store.deleteDose(id: dose.id)
            case .metric(let metric): try await store.deleteMetric(id: metric.id)
            }
        } catch { self.error = error.localizedDescription }
    }
}

struct QuickLogView: View {
    @Environment(AppStore.self) private var store
    @State private var kind = "dose"

    var body: some View {
        VStack(spacing: 0) {
            Picker("Entry type", selection: $kind) {
                Text("Dose").tag("dose")
                Text("Metric").tag("metric")
                Text("Experiment").tag("experiment")
            }
            .pickerStyle(.segmented).padding()
            .disabled(store.isMutating)
            .accessibilityIdentifier("quickLog.entryType")
            switch kind {
            case "metric": MetricLogForm()
            case "experiment": ExperimentQuickLogView()
            default: DoseLogForm()
            }
        }
        .background(Theme.background)
        .navigationTitle("Quick Log")
    }
}

struct DoseLogForm: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    private let dismissOnSave: Bool
    private let allowsAddingToStack: Bool
    @State private var peptideID: String
    @State private var name: String
    @State private var dosage: String
    @State private var timestamp = Date()
    @State private var notes = ""
    @State private var injectionSite = ""
    @State private var addToStack = false
    @State private var stackFrequency = ""
    @State private var stackItemID = UUID().uuidString
    @State private var pendingStackItem: StackItem?
    @State private var stackSaved = false
    @State private var isSaving = false
    @State private var saved = false
    @State private var error: String?

    init(stackItem: StackItem? = nil, peptide: Peptide? = nil, dismissOnSave: Bool = false) {
        self.dismissOnSave = dismissOnSave
        allowsAddingToStack = stackItem == nil
        _peptideID = State(initialValue: stackItem?.peptideId ?? peptide?.id ?? "")
        _name = State(initialValue: stackItem?.name ?? peptide?.name ?? "")
        _dosage = State(initialValue: stackItem?.dosage ?? "")
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            if saved {
                Section {
                    Label(stackSaved ? "Dose and stack saved" : "Dose saved", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(Theme.accent)
                    if pendingStackItem != nil {
                        Text("Your dose is already recorded. Retry only updates the stack; it will not log the dose again.")
                            .font(.subheadline).foregroundStyle(Theme.muted)
                        SaveButton(title: "Retry stack only", isSaving: isSaving, disabled: !store.canWrite || store.isMutating) {
                            await retryStack()
                        }.accessibilityIdentifier("dose.retryStackOnly")
                    } else {
                        Button("Log another dose") {
                            saved = false
                            stackSaved = false
                            addToStack = false
                            stackFrequency = ""
                            stackItemID = UUID().uuidString
                            timestamp = Date()
                            notes = ""
                            injectionSite = ""
                        }.disabled(isSaving).accessibilityIdentifier("dose.logAnother")
                    }
                }
            }
            Section {
                Picker("Peptide or custom", selection: $peptideID) {
                    Text("Custom entry").tag("")
                    ForEach(store.catalog, id: \.id) { Text($0.name).tag($0.id) }
                }
                .accessibilityIdentifier("dose.peptide")
                .onChange(of: peptideID) { _, id in
                    name = store.catalog.first { $0.id == id }?.name ?? ""
                    dosage = ""
                    saved = false
                }
                TextField("Name", text: $name).accessibilityIdentifier("dose.name")
                    .disabled(!peptideID.isEmpty)
                TextField("Dosage, including units", text: $dosage).accessibilityIdentifier("dose.dosage")
                Picker("Injection site (optional)", selection: $injectionSite) {
                    Text("Not recorded").tag("")
                    ForEach(trackingInjectionSites, id: \.value) { Text($0.label).tag($0.value) }
                }.accessibilityIdentifier("dose.injectionSite")
            } header: { Text("Dose details") } footer: {
                Text("Name and dosage are required. Record the amount you actually took. This app does not recommend a dosage.")
            }
            .disabled(isSaving || saved)
            if allowsAddingToStack {
                Section {
                    Toggle("Add to Stack", isOn: $addToStack).accessibilityIdentifier("dose.addToStack")
                    if addToStack {
                        TextField("Stack frequency", text: $stackFrequency).accessibilityIdentifier("dose.stackFrequency")
                    }
                } footer: {
                    Text("Optionally save this name and dosage to your daily stack. Enter a frequency, such as once daily. Dose and stack writes are confirmed separately.")
                }
                .disabled(isSaving || saved)
            }
            Section("When and notes") {
                DatePicker("Taken at", selection: $timestamp, in: ...Date())
                    .accessibilityIdentifier("dose.timestamp")
                TextField("Notes (optional)", text: $notes, axis: .vertical)
                    .lineLimit(3...6).accessibilityIdentifier("dose.notes")
            }.disabled(isSaving || saved)
            Section {
                SaveButton(title: addToStack ? "Save dose and stack" : "Save dose", isSaving: isSaving,
                           disabled: saved || !store.canWrite || store.isMutating || FlowInput.trimmed(name).isEmpty || FlowInput.trimmed(dosage).isEmpty || (addToStack && FlowInput.trimmed(stackFrequency).isEmpty)) {
                    await save()
                }.accessibilityIdentifier("dose.save")
            }
        }
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
        .toolbar {
            if dismissOnSave {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.disabled(isSaving).accessibilityIdentifier("dose.cancel")
                }
            }
        }
    }

    @MainActor private func save() async {
        guard !isSaving, !saved, store.canWrite,
              !FlowInput.trimmed(name).isEmpty, !FlowInput.trimmed(dosage).isEmpty,
              !addToStack || !FlowInput.trimmed(stackFrequency).isEmpty else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            try await store.logDose(DoseEntry(
                id: UUID().uuidString, peptideId: FlowInput.optional(peptideID), name: FlowInput.trimmed(name),
                dosage: FlowInput.trimmed(dosage), timestamp: FlowDate.iso(timestamp), notes: FlowInput.optional(notes),
                injectionSite: FlowInput.optional(injectionSite)
            ))
            saved = true
        } catch {
            self.error = error.localizedDescription
            return
        }
        if addToStack {
            pendingStackItem = StackItem(
                id: stackItemID, peptideId: FlowInput.optional(peptideID), name: FlowInput.trimmed(name),
                dosage: FlowInput.trimmed(dosage), frequency: FlowInput.trimmed(stackFrequency),
                isActive: true, addedAt: FlowDate.iso()
            )
            guard await savePendingStack() else { return }
        }
        if dismissOnSave { dismiss() }
    }

    @MainActor private func retryStack() async {
        guard !isSaving, saved, pendingStackItem != nil, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        if await savePendingStack(), dismissOnSave { dismiss() }
    }

    @MainActor private func savePendingStack() async -> Bool {
        guard let pendingStackItem else { return false }
        do {
            try await store.addToStack(pendingStackItem)
            self.pendingStackItem = nil
            stackSaved = true
            return true
        } catch {
            self.error = "Dose saved; stack update failed. \(error.localizedDescription)"
            return false
        }
    }
}

private struct MetricLogForm: View {
    @Environment(AppStore.self) private var store
    @State private var kind: TrackingMetricKind = .energy
    @State private var customName = ""
    @State private var customMeasurement = "scale"
    @State private var scale = 5.0
    @State private var numeric = ""
    @State private var unit = ""
    @State private var timestamp = Date()
    @State private var notes = ""
    @State private var error: String?
    @State private var isSaving = false
    @State private var saved = false

    private var isNumber: Bool { kind == .weight || (kind == .custom && customMeasurement == "number") }
    private var isValid: Bool {
        if kind == .custom && FlowInput.trimmed(customName).isEmpty { return false }
        if isNumber {
            guard let value = FlowInput.number(numeric) else { return false }
            return kind != .weight || (value > 0 && !FlowInput.trimmed(unit).isEmpty)
        }
        return true
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            if saved {
                Section {
                    Label("Observation saved", systemImage: "checkmark.circle.fill").foregroundStyle(Theme.accent)
                    Button("Log another observation") { saved = false; timestamp = Date(); notes = "" }
                        .accessibilityIdentifier("metric.logAnother")
                }
            }
            Section {
                Picker("Metric", selection: $kind) {
                    ForEach(TrackingMetricKind.allCases) { Text($0.label).tag($0) }
                }.accessibilityIdentifier("metric.type")
                    .onChange(of: kind) { _, value in
                        numeric = ""
                        unit = value == .weight ? "kg" : ""
                    }
                if kind == .custom {
                    TextField("Metric name", text: $customName).accessibilityIdentifier("metric.customName")
                    Picker("Measurement", selection: $customMeasurement) {
                        Text("Scale (1–10)").tag("scale")
                        Text("Number").tag("number")
                    }.accessibilityIdentifier("metric.measurement")
                }
                if isNumber {
                    TextField("Value", text: $numeric).keyboardType(.numbersAndPunctuation)
                        .accessibilityIdentifier("metric.number")
                    if kind == .weight {
                        Picker("Unit", selection: $unit) {
                            Text("Kilograms (kg)").tag("kg")
                            Text("Pounds (lb)").tag("lb")
                        }.accessibilityIdentifier("metric.unit")
                    } else {
                        TextField("Unit (optional)", text: $unit).accessibilityIdentifier("metric.unit")
                    }
                } else {
                    LabeledContent(kind.label, value: "\(Int(scale)) / 10")
                    Slider(value: $scale, in: 1...10, step: 1) { Text("Rating") }
                        minimumValueLabel: { Text("1") } maximumValueLabel: { Text("10") }
                        .accessibilityLabel("\(kind.label) rating")
                        .accessibilityIdentifier("metric.scale")
                }
            } header: { Text("What are you tracking?") } footer: {
                if isNumber {
                    Text(kind == .weight ? "Enter a positive weight and choose its unit." : "Enter a finite number. Units are optional.")
                }
            }
            .disabled(isSaving || saved)
            Section("When and notes") {
                DatePicker("Recorded at", selection: $timestamp, in: ...Date())
                    .accessibilityIdentifier("metric.timestamp")
                TextField("Notes (optional)", text: $notes, axis: .vertical)
                    .lineLimit(3...6).accessibilityIdentifier("metric.notes")
            }.disabled(isSaving || saved)
            Section {
                SaveButton(title: "Save observation", isSaving: isSaving,
                           disabled: !isValid || saved || !store.canWrite || store.isMutating) { await save() }
                    .accessibilityIdentifier("metric.save")
            }
        }
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
    }

    @MainActor private func save() async {
        guard !isSaving, !saved, isValid, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            let value = isNumber ? FlowInput.number(numeric)! : scale
            try await store.logMetric(MetricEntry(
                id: UUID().uuidString, metricType: kind.rawValue,
                customName: kind == .custom ? FlowInput.trimmed(customName) : nil,
                value: value, timestamp: FlowDate.iso(timestamp), notes: FlowInput.optional(notes),
                unit: isNumber ? FlowInput.optional(unit) : nil, numericValue: isNumber ? value : nil
            ))
            saved = true
        } catch { self.error = error.localizedDescription }
    }
}

struct StackManagementView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var showingAdd = false
    @State private var removing: StackItem?
    @State private var error: String?
    @State private var isSaving = false

    var body: some View {
        List {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            if store.tracking.stack.isEmpty && !store.isLoading {
                EmptyState(title: "Build your stack", message: "Save your own routine without logging a dose.", systemImage: "square.stack.3d.up")
            }
            ForEach(store.tracking.stack, id: \.id) { item in
                Section {
                    VStack(alignment: .leading, spacing: 5) {
                        Text(item.name).font(.headline)
                        Text("\(item.dosage) · \(item.frequency)").foregroundStyle(Theme.muted)
                        if let time = item.timeOfDay { Text(time).font(.caption).foregroundStyle(Theme.muted) }
                        Text(item.isActive ? "Active" : "Paused").font(.caption).foregroundStyle(Theme.accent)
                    }
                    Button(item.isActive ? "Pause item" : "Resume item") {
                        Task { await mutate { try await store.toggleStackItem(id: item.id) } }
                    }.accessibilityIdentifier("stack.toggle.\(item.id)")
                    Button("Remove from stack", role: .destructive) { removing = item }
                        .accessibilityIdentifier("stack.remove.\(item.id)")
                }.disabled(isSaving || store.isMutating || !store.canWrite)
            }
        }
        .navigationTitle("My Stack")
        .scrollContentBackground(.hidden).background(Theme.background)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Done") { dismiss() }.disabled(isSaving).accessibilityIdentifier("stack.done")
            }
            ToolbarItem(placement: .primaryAction) {
                Button { showingAdd = true } label: { Label("Add stack item", systemImage: "plus") }
                    .disabled(!store.canWrite).accessibilityIdentifier("stack.add")
            }
        }
        .sheet(isPresented: $showingAdd) { NavigationStack { AddStackItemView() } }
        .confirmationDialog("Remove this stack item?", isPresented: Binding(
            get: { removing != nil }, set: { if !$0 { removing = nil } }
        ), titleVisibility: .visible) {
            if let item = removing {
                Button("Remove item", role: .destructive) {
                    Task { await mutate { try await store.removeFromStack(id: item.id) } }
                }.accessibilityIdentifier("stack.confirmRemove")
            }
            Button("Cancel", role: .cancel) { removing = nil }.accessibilityIdentifier("stack.cancelRemove")
        } message: { Text("Previously logged doses will be kept.") }
    }

    @MainActor private func mutate(_ action: () async throws -> Void) async {
        guard !isSaving, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do { try await action() } catch { self.error = error.localizedDescription }
    }
}

struct AddStackItemView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var peptideID: String
    @State private var name: String
    @State private var dosage = ""
    @State private var frequency = ""
    @State private var timeOfDay = ""
    @State private var error: String?
    @State private var isSaving = false

    init(peptide: Peptide? = nil) {
        _peptideID = State(initialValue: peptide?.id ?? "")
        _name = State(initialValue: peptide?.name ?? "")
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            Section("Routine") {
                Picker("Peptide or custom", selection: $peptideID) {
                    Text("Custom item").tag("")
                    ForEach(store.catalog, id: \.id) { Text($0.name).tag($0.id) }
                }.accessibilityIdentifier("stack.peptide")
                    .onChange(of: peptideID) { _, id in
                        name = store.catalog.first { $0.id == id }?.name ?? ""
                        dosage = ""
                    }
                TextField("Name", text: $name).disabled(!peptideID.isEmpty).accessibilityIdentifier("stack.name")
                TextField("Dosage, including units", text: $dosage).accessibilityIdentifier("stack.dosage")
                TextField("Frequency", text: $frequency).accessibilityIdentifier("stack.frequency")
                TextField("Time of day (optional)", text: $timeOfDay).accessibilityIdentifier("stack.timeOfDay")
            }.disabled(isSaving)
            Section {
                SaveButton(title: "Add to stack", isSaving: isSaving,
                           disabled: !store.canWrite || store.isMutating || [name, dosage, frequency].contains { FlowInput.trimmed($0).isEmpty }) {
                    await save()
                }.accessibilityIdentifier("stack.save")
            } footer: { Text("Adding an item does not record a dose or schedule a notification.") }
        }
        .navigationTitle("Add to Stack")
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }.disabled(isSaving).accessibilityIdentifier("stack.cancel")
            }
        }
    }

    @MainActor private func save() async {
        guard !isSaving, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            try await store.addToStack(StackItem(
                id: UUID().uuidString, peptideId: FlowInput.optional(peptideID), name: FlowInput.trimmed(name),
                dosage: FlowInput.trimmed(dosage), frequency: FlowInput.trimmed(frequency),
                timeOfDay: FlowInput.optional(timeOfDay), isActive: true, addedAt: FlowDate.iso()
            ))
            dismiss()
        } catch { self.error = error.localizedDescription }
    }
}
