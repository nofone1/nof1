import SwiftUI

struct ExperimentsView: View {
    @Environment(AppStore.self) private var store
    @State private var showingCreate = false
    @State private var filter = "all"

    private var visibleExperiments: [Experiment] {
        store.experiments.filter { filter == "all" || $0.status == filter }
    }

    var body: some View {
        List {
            Section {
                Text("Find your own evidence.").font(.title2.weight(.semibold))
                Text("Define a hypothesis, alternate on/off phases, and record what you observe.")
                    .foregroundStyle(Theme.muted)
                Picker("Experiment status", selection: $filter) {
                    Text("All experiments").tag("all")
                    ForEach(["draft", "active", "paused", "completed", "cancelled"], id: \.self) {
                        Text($0.capitalized).tag($0)
                    }
                }.accessibilityIdentifier("experiments.filter")
            }
            FlowStoreStatus()
            if visibleExperiments.isEmpty && !store.isLoading {
                EmptyState(title: "No \(filter == "all" ? "" : filter + " ")experiments",
                           message: "Start with a question you can measure.", systemImage: "chart.xyaxis.line")
            }
            ForEach(visibleExperiments, id: \.id) { experiment in
                NavigationLink {
                    ExperimentDetailView(experimentID: experiment.id)
                } label: {
                    VStack(alignment: .leading, spacing: 7) {
                        HStack(alignment: .top) {
                            Text(experiment.name).font(.headline)
                            Spacer()
                            Text(experiment.status.capitalized).font(.caption)
                                .foregroundStyle(experiment.status == "active" ? Theme.accent : Theme.muted)
                        }
                        Text(experiment.hypothesis).font(.subheadline).lineLimit(2).foregroundStyle(Theme.muted)
                        Text("\(experiment.intervention.name) · \(experiment.intervention.dosage)")
                            .font(.caption).foregroundStyle(Theme.muted)
                        Text("\(experiment.entries.count) entries · \(experiment.metrics.count) metrics")
                            .font(.caption).foregroundStyle(Theme.secondary)
                    }.padding(.vertical, 5)
                }.accessibilityIdentifier("experiments.open.\(experiment.id)")
            }
        }
        .navigationTitle("Experiments")
        .scrollContentBackground(.hidden).background(Theme.background)
        .refreshable { await store.refresh() }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showingCreate = true } label: { Label("Create experiment", systemImage: "plus") }
                    .disabled(!store.canWrite).accessibilityIdentifier("experiments.create")
            }
        }
        .sheet(isPresented: $showingCreate) { NavigationStack { CreateExperimentView() } }
    }
}

struct ExperimentDetailView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let experimentID: String
    @State private var showingEntry = false
    @State private var showingEdit = false
    @State private var confirmingDelete = false
    @State private var pendingStatus: String?
    @State private var error: String?
    @State private var isSaving = false

    private var experiment: Experiment? { store.experiments.first { $0.id == experimentID } }

    var body: some View {
        List {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            if let experiment {
                Section {
                    Text(experiment.name).font(.title2.weight(.semibold))
                    Text(experiment.status.capitalized).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.accent)
                    Text(experiment.hypothesis).foregroundStyle(Theme.text)
                } header: { Text("Hypothesis") }
                Section("Intervention") {
                    LabeledContent("Name", value: experiment.intervention.name)
                    LabeledContent("Type", value: experiment.intervention.type.capitalized)
                    LabeledContent("Dosage", value: experiment.intervention.dosage)
                    LabeledContent("Frequency", value: experiment.intervention.frequency)
                    if let instructions = experiment.intervention.instructions, !instructions.isEmpty { Text(instructions) }
                }
                Section {
                    TimelineView(.periodic(from: .now, by: 60)) { context in
                        if let phase = experiment.schedule.phaseSummary(on: context.date) {
                            VStack(alignment: .leading, spacing: 6) {
                                if !phase.hasStarted {
                                    Text("Not started yet").font(.headline)
                                } else if phase.isComplete {
                                    Text("Planned schedule finished").font(.headline)
                                    Text("Review your observations before marking the experiment complete.")
                                        .font(.caption).foregroundStyle(Theme.muted)
                                } else {
                                    Text("Phase \(phase.phaseNumber) of \(phase.totalPhaseCount)").font(.headline)
                                    Text("Day \(phase.dayInPhase) · \(phase.isInterventionDay ? "On / intervention" : "Off / comparison") phase")
                                        .foregroundStyle(Theme.accent)
                                }
                                ProgressView(value: Double(phase.daysElapsed), total: Double(phase.totalDays))
                                    .accessibilityLabel("Planned schedule progress")
                            }
                        } else {
                            Text("This record has an invalid schedule. Edit it to restore phase tracking.")
                                .foregroundStyle(Theme.muted)
                        }
                    }
                    LabeledContent("Start", value: FlowDate.display(experiment.schedule.startDate))
                    LabeledContent("Days per phase", value: String(experiment.schedule.phaseDurationDays))
                    LabeledContent("On/off cycles", value: String(experiment.schedule.totalPhases))
                } header: { Text("Schedule") } footer: {
                    Text("Phases follow UTC calendar days from the start date. Pausing changes status; it does not shift the planned schedule.")
                }
                Section("Metrics") {
                    ForEach(experiment.metrics, id: \.id) { metric in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(metric.name).font(.headline)
                            Text(metric.type.capitalized + (metric.unit.map { " · \($0)" } ?? ""))
                                .font(.caption).foregroundStyle(Theme.muted)
                            if let description = metric.description, !description.isEmpty {
                                Text(description).font(.subheadline).foregroundStyle(Theme.muted)
                            }
                        }
                    }
                    if experiment.metrics.isEmpty { Text("No metrics configured.").foregroundStyle(Theme.muted) }
                }
                Section("Observations") {
                    if experiment.status == "active" || experiment.status == "paused" {
                        Button { showingEntry = true } label: { Label("Record an entry", systemImage: "square.and.pencil") }
                            .disabled(!store.canWrite || store.isMutating || isSaving || experiment.metrics.isEmpty)
                            .accessibilityIdentifier("experiment.logEntry")
                    }
                    if experiment.entries.isEmpty {
                        Text("No entries recorded. Saved observations will appear here with their measured values.")
                            .foregroundStyle(Theme.muted)
                    }
                    ForEach(experiment.entries.sorted { $0.date > $1.date }, id: \.id) { entry in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(FlowDate.display(entry.date)).font(.headline)
                            Text(entry.isInterventionDay ? "Intervention taken" : "No intervention")
                                .font(.caption).foregroundStyle(Theme.accent)
                            ForEach(Array(entry.metricValues.enumerated()), id: \.offset) { _, value in
                                let metric = experiment.metrics.first { $0.id == value.metricId }
                                LabeledContent(metric?.name ?? "Metric \(value.metricId)") {
                                    Text(displayMetricValue(value.value, unit: metric?.unit))
                                        .multilineTextAlignment(.trailing)
                                }.font(.subheadline)
                            }
                            if let notes = entry.notes, !notes.isEmpty { Text(notes).font(.subheadline).foregroundStyle(Theme.muted) }
                        }.padding(.vertical, 5)
                    }
                }
                Section("Manage") {
                    Button("Edit experiment") { showingEdit = true }.accessibilityIdentifier("experiment.edit")
                    if experiment.status == "draft" {
                        Button("Start experiment") { Task { await changeStatus("active") } }
                            .accessibilityIdentifier("experiment.start")
                    } else if experiment.status == "active" {
                        Button("Pause experiment") { Task { await changeStatus("paused") } }
                            .accessibilityIdentifier("experiment.pause")
                    } else if experiment.status == "paused" {
                        Button("Resume experiment") { Task { await changeStatus("active") } }
                            .accessibilityIdentifier("experiment.resume")
                    }
                    if ["draft", "active", "paused"].contains(experiment.status) {
                        Button("Mark complete") { pendingStatus = "completed" }.accessibilityIdentifier("experiment.complete")
                        Button("Cancel experiment", role: .destructive) { pendingStatus = "cancelled" }
                            .accessibilityIdentifier("experiment.cancel")
                    } else {
                        Button("Reopen as draft") { pendingStatus = "draft" }.accessibilityIdentifier("experiment.reopen")
                    }
                    Button("Delete experiment", role: .destructive) { confirmingDelete = true }
                        .accessibilityIdentifier("experiment.delete")
                }.disabled(!store.canWrite || store.isMutating || isSaving)
            } else if !store.isLoading {
                EmptyState(title: "Experiment unavailable", message: "This experiment may have been removed. Refresh your records to check.", systemImage: "chart.xyaxis.line")
            }
        }
        .navigationTitle("Experiment")
        .navigationBarTitleDisplayMode(.inline)
        .scrollContentBackground(.hidden).background(Theme.background)
        .refreshable { await store.refresh() }
        .sheet(isPresented: $showingEntry) { NavigationStack { ExperimentEntryForm(experimentID: experimentID) } }
        .sheet(isPresented: $showingEdit) {
            if let experiment { NavigationStack { CreateExperimentView(experimentToEdit: experiment) } }
        }
        .confirmationDialog("Delete this experiment?", isPresented: $confirmingDelete, titleVisibility: .visible) {
            Button("Delete experiment", role: .destructive) {
                Task {
                    await mutate {
                        try await store.deleteExperiment(id: experimentID)
                        dismiss()
                    }
                }
            }.accessibilityIdentifier("experiment.confirmDelete")
            Button("Cancel", role: .cancel) {}.accessibilityIdentifier("experiment.cancelDelete")
        } message: { Text("The experiment and every recorded observation will be permanently deleted.") }
        .confirmationDialog("Change experiment status?", isPresented: Binding(
            get: { pendingStatus != nil }, set: { if !$0 { pendingStatus = nil } }
        ), titleVisibility: .visible) {
            if let status = pendingStatus {
                Button("Set status to \(status)") { Task { await changeStatus(status) } }
                    .accessibilityIdentifier("experiment.confirmStatus")
            }
            Button("Keep current status", role: .cancel) { pendingStatus = nil }
                .accessibilityIdentifier("experiment.keepStatus")
        } message: { Text("Your recorded observations will be kept. Account limits are checked by the server.") }
    }

    private func displayMetricValue(_ value: JSONValue, unit: String?) -> String {
        switch value {
        case .string(let text): return text
        case .number(let number): return number.formatted() + (unit.map { " \($0)" } ?? "")
        case .bool(let value): return value ? "Yes" : "No"
        case .null: return "Not recorded"
        case .array, .object: return "Unsupported recorded value"
        }
    }

    @MainActor private func changeStatus(_ status: String) async {
        await mutate { try await store.updateExperiment(id: experimentID, updates: ["status": .string(status)]) }
    }

    @MainActor private func mutate(_ action: () async throws -> Void) async {
        guard !isSaving, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do { try await action() } catch { self.error = error.localizedDescription }
    }
}

private struct ExperimentMetricDraft: Identifiable {
    let id: String
    var name: String
    var description: String
    var type: String
    var minimum: String
    var maximum: String
    var unit: String

    init(metric: ExperimentMetric? = nil) {
        id = metric?.id ?? UUID().uuidString
        name = metric?.name ?? ""
        description = metric?.description ?? ""
        type = metric?.type ?? "scale"
        minimum = metric?.minValue.map { String($0) } ?? (metric == nil ? "1" : "")
        maximum = metric?.maxValue.map { String($0) } ?? (metric == nil ? "10" : "")
        unit = metric?.unit ?? ""
    }

    var isValid: Bool {
        guard !FlowInput.trimmed(name).isEmpty, ["scale", "boolean", "number", "text"].contains(type) else { return false }
        guard type == "number" || type == "scale" else { return true }
        let min = FlowInput.number(minimum)
        let max = FlowInput.number(maximum)
        if type == "scale" { return min != nil && max != nil && min! < max! }
        if !FlowInput.trimmed(minimum).isEmpty && min == nil { return false }
        if !FlowInput.trimmed(maximum).isEmpty && max == nil { return false }
        if let min, let max { return min < max }
        return true
    }

    var metric: ExperimentMetric {
        let numeric = type == "scale" || type == "number"
        return ExperimentMetric(id: id, name: FlowInput.trimmed(name), description: FlowInput.optional(description),
                                type: type, minValue: numeric ? FlowInput.number(minimum) : nil,
                                maxValue: numeric ? FlowInput.number(maximum) : nil,
                                unit: numeric ? FlowInput.optional(unit) : nil)
    }
}

struct CreateExperimentView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    private let original: Experiment?
    @State private var name: String
    @State private var hypothesis: String
    @State private var peptideID: String
    @State private var interventionName: String
    @State private var interventionType: String
    @State private var dosage: String
    @State private var frequency: String
    @State private var instructions: String
    @State private var startDate: Date
    @State private var phaseDays: String
    @State private var totalCycles: String
    @State private var status: String
    @State private var metrics: [ExperimentMetricDraft]
    @State private var isSaving = false
    @State private var error: String?

    init(peptide: Peptide? = nil, experimentToEdit: Experiment? = nil) {
        original = experimentToEdit
        _name = State(initialValue: experimentToEdit?.name ?? peptide.map { "Testing \($0.name)" } ?? "")
        _hypothesis = State(initialValue: experimentToEdit?.hypothesis ?? "")
        _peptideID = State(initialValue: peptide?.id ?? "")
        _interventionName = State(initialValue: experimentToEdit?.intervention.name ?? peptide?.name ?? "")
        _interventionType = State(initialValue: experimentToEdit?.intervention.type ?? (peptide == nil ? "supplement" : "peptide"))
        _dosage = State(initialValue: experimentToEdit?.intervention.dosage ?? "")
        _frequency = State(initialValue: experimentToEdit?.intervention.frequency ?? "")
        _instructions = State(initialValue: experimentToEdit?.intervention.instructions ?? "")
        _startDate = State(initialValue: experimentToEdit.flatMap { FlowDate.parse($0.schedule.startDate) } ?? Date())
        _phaseDays = State(initialValue: String(experimentToEdit?.schedule.phaseDurationDays ?? 7))
        _totalCycles = State(initialValue: String(experimentToEdit?.schedule.totalPhases ?? 4))
        _status = State(initialValue: experimentToEdit?.status ?? "draft")
        _metrics = State(initialValue: experimentToEdit?.metrics.map { ExperimentMetricDraft(metric: $0) } ?? [ExperimentMetricDraft()])
    }

    private var metricsLocked: Bool {
        guard let original else { return false }
        return !original.entries.isEmpty || store.experiments.first { $0.id == original.id }?.entries.isEmpty == false
    }
    private var isValid: Bool {
        guard ![name, hypothesis, interventionName, dosage, frequency].contains(where: { FlowInput.trimmed($0).isEmpty }),
              !metrics.isEmpty, (metricsLocked || metrics.allSatisfy(\.isValid)),
              let days = Int(phaseDays), days > 0, let cycles = Int(totalCycles), cycles > 0 else { return false }
        let (phases, phaseOverflow) = cycles.multipliedReportingOverflow(by: 2)
        let (_, daysOverflow) = days.multipliedReportingOverflow(by: phases)
        return !phaseOverflow && !daysOverflow
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            Section("Your question") {
                TextField("Experiment name", text: $name).accessibilityIdentifier("experimentForm.name")
                TextField("Hypothesis: what do you expect?", text: $hypothesis, axis: .vertical)
                    .lineLimit(3...6).accessibilityIdentifier("experimentForm.hypothesis")
            }.disabled(isSaving)
            Section {
                Picker("Catalog or custom", selection: $peptideID) {
                    Text("Custom intervention").tag("")
                    ForEach(store.catalog, id: \.id) { Text($0.name).tag($0.id) }
                }.accessibilityIdentifier("experimentForm.peptide")
                    .onChange(of: peptideID) { _, id in
                        interventionName = store.catalog.first { $0.id == id }?.name ?? ""
                        interventionType = id.isEmpty ? "supplement" : "peptide"
                        dosage = ""
                    }
                TextField("Intervention name", text: $interventionName).disabled(!peptideID.isEmpty)
                    .accessibilityIdentifier("experimentForm.interventionName")
                Picker("Intervention type", selection: $interventionType) {
                    ForEach(["supplement", "peptide", "medication", "lifestyle", "diet", "other"], id: \.self) {
                        Text($0.capitalized).tag($0)
                    }
                }.accessibilityIdentifier("experimentForm.interventionType")
                TextField("Dosage or amount", text: $dosage).accessibilityIdentifier("experimentForm.dosage")
                TextField("Frequency", text: $frequency).accessibilityIdentifier("experimentForm.frequency")
                TextField("Instructions (optional)", text: $instructions, axis: .vertical)
                    .lineLimit(2...4).accessibilityIdentifier("experimentForm.instructions")
            } header: { Text("What you’re testing") } footer: {
                Text("For a lifestyle intervention, the amount can be a duration or activity. No dosage is recommended by this app.")
            }
            .disabled(isSaving)
            ForEach($metrics) { $metric in
                ExperimentMetricEditor(metric: $metric, canRemove: metrics.count > 1 && !metricsLocked) {
                    let id = metric.id
                    metrics.removeAll { $0.id == id }
                }.disabled(isSaving || metricsLocked)
            }
            Section {
                if metricsLocked {
                    Text("Metric definitions are locked after the first observation so recorded values keep their meaning.")
                        .foregroundStyle(Theme.muted)
                } else {
                    Button { metrics.append(ExperimentMetricDraft()) } label: { Label("Add metric", systemImage: "plus.circle") }
                        .disabled(isSaving).accessibilityIdentifier("experimentForm.addMetric")
                }
            }
            Section {
                DatePicker("Start date (UTC)", selection: $startDate, displayedComponents: .date)
                    .environment(\.timeZone, TimeZone(secondsFromGMT: 0)!).accessibilityIdentifier("experimentForm.startDate")
                TextField("Days per phase", text: $phaseDays).keyboardType(.numberPad)
                    .accessibilityIdentifier("experimentForm.phaseDays")
                TextField("On/off cycles", text: $totalCycles).keyboardType(.numberPad)
                    .accessibilityIdentifier("experimentForm.totalCycles")
                if original == nil {
                    Picker("Initial status", selection: $status) {
                        Text("Draft").tag("draft")
                        Text("Active").tag("active")
                    }.accessibilityIdentifier("experimentForm.status")
                }
            } header: { Text("Schedule") } footer: {
                Text("Use positive whole numbers. Each cycle contains one on phase and one off phase. Draft, active, and paused experiments count toward server-enforced account limits.")
            }
            .disabled(isSaving)
            Section {
                SaveButton(title: original == nil ? "Create experiment" : "Save changes", isSaving: isSaving,
                           disabled: !isValid || !store.canWrite || store.isMutating) { await save() }
                    .accessibilityIdentifier("experimentForm.save")
            } footer: { Text("A name, hypothesis, intervention, dosage or amount, frequency, and at least one valid metric are required.") }
        }
        .navigationTitle(original == nil ? "New Experiment" : "Edit Experiment")
        .navigationBarTitleDisplayMode(.inline)
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }.disabled(isSaving).accessibilityIdentifier("experimentForm.cancel")
            }
        }
    }

    @MainActor private func save() async {
        guard !isSaving, isValid, store.canWrite, let days = Int(phaseDays), let cycles = Int(totalCycles) else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            let intervention = Intervention(
                id: original?.intervention.id ?? UUID().uuidString, name: FlowInput.trimmed(interventionName), type: interventionType,
                dosage: FlowInput.trimmed(dosage), frequency: FlowInput.trimmed(frequency), instructions: FlowInput.optional(instructions)
            )
            let schedule = ExperimentSchedule(startDate: FlowDate.iso(startDate), endDate: original?.schedule.endDate,
                                              phaseDurationDays: days, totalPhases: cycles, reminderTime: original?.schedule.reminderTime)
            if let original {
                var updates: [String: JSONValue] = [
                    "name": .string(FlowInput.trimmed(name)), "hypothesis": .string(FlowInput.trimmed(hypothesis)),
                    "intervention": try JSONValue.encode(intervention), "schedule": try JSONValue.encode(schedule)
                ]
                if !metricsLocked { updates["metrics"] = try JSONValue.encode(metrics.map(\.metric)) }
                try await store.updateExperiment(id: original.id, updates: updates)
            } else {
                try await store.createExperiment(Experiment(
                    id: UUID().uuidString, name: FlowInput.trimmed(name), hypothesis: FlowInput.trimmed(hypothesis),
                    intervention: intervention, metrics: metrics.map(\.metric), schedule: schedule, status: status,
                    entries: [], createdAt: FlowDate.iso(), updatedAt: FlowDate.iso()
                ))
            }
            dismiss()
        } catch { self.error = error.localizedDescription }
    }
}

private struct ExperimentMetricEditor: View {
    @Binding var metric: ExperimentMetricDraft
    let canRemove: Bool
    let remove: () -> Void

    var body: some View {
        Section {
            TextField("Metric name", text: $metric.name).accessibilityIdentifier("experimentMetric.name.\(metric.id)")
            Picker("Value type", selection: $metric.type) {
                Text("Scale").tag("scale")
                Text("Yes / no").tag("boolean")
                Text("Number").tag("number")
                Text("Text").tag("text")
            }.accessibilityIdentifier("experimentMetric.type.\(metric.id)")
                .onChange(of: metric.type) { _, type in
                    metric.minimum = type == "scale" ? "1" : ""
                    metric.maximum = type == "scale" ? "10" : ""
                    metric.unit = ""
                }
            TextField("What to measure (optional)", text: $metric.description, axis: .vertical)
                .accessibilityIdentifier("experimentMetric.description.\(metric.id)")
            if metric.type == "scale" || metric.type == "number" {
                TextField(metric.type == "scale" ? "Minimum" : "Minimum (optional)", text: $metric.minimum)
                    .keyboardType(.numbersAndPunctuation).accessibilityIdentifier("experimentMetric.minimum.\(metric.id)")
                TextField(metric.type == "scale" ? "Maximum" : "Maximum (optional)", text: $metric.maximum)
                    .keyboardType(.numbersAndPunctuation).accessibilityIdentifier("experimentMetric.maximum.\(metric.id)")
                TextField("Unit (optional)", text: $metric.unit).accessibilityIdentifier("experimentMetric.unit.\(metric.id)")
            }
            if canRemove {
                Button("Remove metric", role: .destructive, action: remove)
                    .accessibilityIdentifier("experimentMetric.remove.\(metric.id)")
            }
        } header: { Text(metric.name.isEmpty ? "Metric" : metric.name) } footer: {
            if metric.type == "scale" { Text("A scale needs a minimum and maximum. The maximum must be greater than the minimum.") }
        }
    }
}

struct ExperimentQuickLogView: View {
    @Environment(AppStore.self) private var store
    @State private var selectedExperiment: Experiment?

    private var eligible: [Experiment] { store.experiments.filter { $0.status == "active" || $0.status == "paused" } }

    var body: some View {
        List {
            FlowStoreStatus()
            Section {
                if eligible.isEmpty && !store.isLoading {
                    EmptyState(title: "No experiments to log", message: "Create and start an experiment from Profile → My experiments.", systemImage: "chart.xyaxis.line")
                }
                ForEach(eligible, id: \.id) { experiment in
                    Button {
                        selectedExperiment = experiment
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(experiment.name).font(.headline)
                            Text("\(experiment.status.capitalized) · \(experiment.metrics.count) metrics")
                                .font(.subheadline).foregroundStyle(Theme.muted)
                        }
                    }
                    .disabled(!store.canWrite || store.isMutating || experiment.metrics.isEmpty)
                    .accessibilityIdentifier("quickLog.experiment.\(experiment.id)")
                }
            } header: { Text("Choose an experiment") }
        }
        .scrollContentBackground(.hidden).background(Theme.background)
        .sheet(item: $selectedExperiment) { experiment in
            NavigationStack { ExperimentEntryForm(experimentID: experiment.id) }
        }
    }
}

struct ExperimentEntryForm: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let experimentID: String
    @State private var date = Date()
    @State private var interventionTaken = false
    @State private var values: [String: String] = [:]
    @State private var notes = ""
    @State private var error: String?
    @State private var isSaving = false

    private var experiment: Experiment? { store.experiments.first { $0.id == experimentID } }
    private var isValid: Bool {
        guard let experiment, ["active", "paused"].contains(experiment.status), !experiment.metrics.isEmpty else { return false }
        return experiment.metrics.allSatisfy { typedValue(for: $0) != nil }
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            if let experiment {
                Section {
                    Text(experiment.name).font(.headline)
                    DatePicker("Recorded at", selection: $date, in: ...Date()).accessibilityIdentifier("experimentEntry.date")
                    Toggle("Intervention taken", isOn: $interventionTaken).accessibilityIdentifier("experimentEntry.interventionTaken")
                    if let phase = experiment.schedule.phaseSummary(on: date), phase.hasStarted && !phase.isComplete {
                        Text("Planned phase \(phase.phaseNumber): \(phase.isInterventionDay ? "on / intervention" : "off / comparison"). Record what actually happened.")
                            .font(.caption).foregroundStyle(Theme.muted)
                    }
                    let count = experiment.entries.filter { FlowDate.isOnUTCDay($0.date, date: date) }.count
                    if count > 0 {
                        Text("\(count) entries already recorded on \(FlowDate.utcDay(date)) UTC. Saving adds another entry; it does not replace them.")
                            .font(.caption).foregroundStyle(Theme.muted)
                    }
                }.disabled(isSaving)
                ForEach(experiment.metrics, id: \.id) { metric in
                    Section {
                        if let description = metric.description, !description.isEmpty {
                            Text(description).font(.subheadline).foregroundStyle(Theme.muted)
                        }
                        switch metric.type {
                        case "boolean":
                            Picker(metric.name, selection: valueBinding(for: metric.id)) {
                                Text("Select an answer").tag("")
                                Text("Yes").tag("true")
                                Text("No").tag("false")
                            }.accessibilityIdentifier("experimentEntry.value.\(metric.id)")
                        case "scale", "number":
                            TextField(metric.unit.map { "Value (\($0))" } ?? "Value", text: valueBinding(for: metric.id))
                                .keyboardType(.numbersAndPunctuation)
                                .accessibilityLabel(metric.name + " value")
                                .accessibilityIdentifier("experimentEntry.value.\(metric.id)")
                            if let minimum = metric.minValue { Text("Minimum: \(minimum.formatted())").font(.caption).foregroundStyle(Theme.muted) }
                            if let maximum = metric.maxValue { Text("Maximum: \(maximum.formatted())").font(.caption).foregroundStyle(Theme.muted) }
                        case "text":
                            TextField("Observation", text: valueBinding(for: metric.id), axis: .vertical)
                                .lineLimit(3...6).accessibilityLabel(metric.name + " observation")
                                .accessibilityIdentifier("experimentEntry.value.\(metric.id)")
                        default:
                            Text("Unsupported metric type: \(metric.type). This entry cannot be saved.").foregroundStyle(.red)
                        }
                    } header: { Text(metric.name) }
                    .disabled(isSaving)
                }
                Section("Notes") {
                    TextField("Notes (optional)", text: $notes, axis: .vertical)
                        .lineLimit(3...6).accessibilityIdentifier("experimentEntry.notes")
                }.disabled(isSaving)
                Section {
                    SaveButton(title: "Save entry", isSaving: isSaving,
                               disabled: !isValid || !store.canWrite || store.isMutating) { await save() }
                        .accessibilityIdentifier("experimentEntry.save")
                } footer: { Text("Complete every metric using the configured value type and bounds. Saving records your observations, not a dose log.") }
            } else {
                EmptyState(title: "Experiment unavailable", message: "Return to your experiments and refresh your records.", systemImage: "chart.xyaxis.line")
            }
        }
        .navigationTitle("Record Entry")
        .navigationBarTitleDisplayMode(.inline)
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }.disabled(isSaving).accessibilityIdentifier("experimentEntry.cancel")
            }
        }
    }

    private func valueBinding(for id: String) -> Binding<String> {
        Binding(get: { values[id] ?? "" }, set: { values[id] = $0 })
    }

    private func typedValue(for metric: ExperimentMetric) -> JSONValue? {
        let input = FlowInput.trimmed(values[metric.id] ?? "")
        switch metric.type {
        case "boolean": return input == "true" ? .bool(true) : input == "false" ? .bool(false) : nil
        case "text": return input.isEmpty ? nil : .string(input)
        case "scale", "number":
            guard let number = FlowInput.number(input) else { return nil }
            if let min = metric.minValue, number < min { return nil }
            if let max = metric.maxValue, number > max { return nil }
            return .number(number)
        default: return nil
        }
    }

    @MainActor private func save() async {
        guard !isSaving, isValid, store.canWrite, let experiment else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            let recorded = experiment.metrics.compactMap { metric -> MetricValue? in
                guard let value = typedValue(for: metric) else { return nil }
                return MetricValue(metricId: metric.id, value: value)
            }
            guard recorded.count == experiment.metrics.count else { return }
            try await store.addEntry(experimentID: experimentID, entry: ExperimentEntry(
                id: UUID().uuidString, experimentId: experimentID, date: FlowDate.iso(date),
                isInterventionDay: interventionTaken, metricValues: recorded, notes: FlowInput.optional(notes), createdAt: FlowDate.iso()
            ))
            dismiss()
        } catch { self.error = error.localizedDescription }
    }
}
