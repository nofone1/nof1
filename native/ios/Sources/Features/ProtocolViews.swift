import SwiftUI

struct ProtocolsView: View {
    @Environment(AppStore.self) private var store
    @State private var showingCreate = false
    @State private var filter = "all"

    private var visibleProtocols: [DosingProtocol] {
        store.protocols.filter { filter == "all" || (filter == "active" ? $0.isActive : !$0.isActive) }
    }

    var body: some View {
        List {
            Section {
                Text("Your routine, recorded.").font(.title2.weight(.semibold))
                Text("Build a dosing plan and record taken or skipped days. Adherence is based on logged outcomes, not scheduled days.")
                    .foregroundStyle(Theme.muted)
                Picker("Show protocols", selection: $filter) {
                    Text("All").tag("all")
                    Text("Active").tag("active")
                    Text("Paused").tag("paused")
                }.pickerStyle(.segmented).accessibilityIdentifier("protocols.filter")
            }
            FlowStoreStatus()
            if visibleProtocols.isEmpty && !store.isLoading {
                EmptyState(title: "No \(filter == "all" ? "" : filter + " ")protocols",
                           message: "Create a plan using a catalog peptide or a custom entry.", systemImage: "list.clipboard")
            }
            ForEach(visibleProtocols, id: \.id) { item in
                NavigationLink {
                    ProtocolDetailView(protocolID: item.id)
                } label: {
                    VStack(alignment: .leading, spacing: 7) {
                        HStack {
                            Text(item.name).font(.headline)
                            Spacer()
                            Text(item.isActive ? "Active" : "Paused")
                                .font(.caption).foregroundStyle(item.isActive ? Theme.accent : Theme.muted)
                        }
                        Text("\(item.peptideName) · \(item.dosage)").foregroundStyle(Theme.muted)
                        Text("\(item.frequency) · \(item.route)").font(.caption).foregroundStyle(Theme.muted)
                        if !item.adherence.isEmpty {
                            Text("\(item.adherencePercentage)% taken · \(item.adherence.count) logged days")
                                .font(.caption).foregroundStyle(Theme.accent)
                        }
                    }.padding(.vertical, 5)
                }.accessibilityIdentifier("protocols.open.\(item.id)")
            }
        }
        .navigationTitle("Protocols")
        .scrollContentBackground(.hidden).background(Theme.background)
        .refreshable { await store.refresh() }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showingCreate = true } label: { Label("Create protocol", systemImage: "plus") }
                    .disabled(!store.canWrite).accessibilityIdentifier("protocols.create")
            }
        }
        .sheet(isPresented: $showingCreate) { NavigationStack { CreateProtocolView() } }
    }
}

struct ProtocolDetailView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let protocolID: String
    @State private var showingEdit = false
    @State private var showingAdherence = false
    @State private var confirmingDelete = false
    @State private var isSaving = false
    @State private var error: String?

    private var item: DosingProtocol? { store.protocols.first { $0.id == protocolID } }

    var body: some View {
        List {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            if let item {
                Section {
                    Text(item.name).font(.title2.weight(.semibold))
                    Label(item.isActive ? "Active protocol" : "Paused protocol", systemImage: item.isActive ? "play.circle" : "pause.circle")
                        .foregroundStyle(Theme.accent)
                    LabeledContent("Peptide / supplement", value: item.peptideName)
                    LabeledContent("Dosage", value: item.dosage)
                    LabeledContent("Frequency", value: item.frequency)
                    LabeledContent("Route", value: item.route)
                    LabeledContent("Cycle", value: item.cycleDuration)
                    LabeledContent("Start", value: FlowDate.display(item.startDate))
                    if let end = item.endDate { LabeledContent("End", value: FlowDate.display(end)) }
                    if let notes = item.notes, !notes.isEmpty { Text(notes) }
                }
                Section {
                    if item.adherence.isEmpty {
                        Text("No outcomes recorded yet.").foregroundStyle(Theme.muted)
                    } else {
                        LabeledContent("Taken", value: "\(item.adherencePercentage)% of logged days")
                    }
                    Button { showingAdherence = true } label: {
                        Label("Record taken or skipped", systemImage: "checkmark.circle")
                    }.accessibilityIdentifier("protocol.logAdherence")
                        .disabled(!store.canWrite || store.isMutating || isSaving)
                    ForEach(item.adherence.sorted { $0.date > $1.date }, id: \.date) { entry in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(entry.date + " · UTC").font(.subheadline.monospaced())
                                Spacer()
                                Text(entry.taken ? "Taken" : entry.skipped == true ? "Skipped" : "Not taken")
                                    .foregroundStyle(entry.taken ? Theme.accent : Theme.muted)
                            }
                            if let notes = entry.notes, !notes.isEmpty { Text(notes).font(.subheadline).foregroundStyle(Theme.muted) }
                        }
                    }
                } header: { Text("Adherence") } footer: {
                    Text("One outcome per UTC day. Recording the same day replaces its previous outcome. Adherence does not add a dose to Today.")
                }
                Section("Manage") {
                    Button("Edit protocol") { showingEdit = true }.accessibilityIdentifier("protocol.edit")
                    Button(item.isActive ? "Pause protocol" : "Resume protocol") {
                        Task { await mutate { try await store.toggleProtocol(id: protocolID) } }
                    }.accessibilityIdentifier("protocol.toggle")
                    Button("Delete protocol", role: .destructive) { confirmingDelete = true }
                        .accessibilityIdentifier("protocol.delete")
                }.disabled(!store.canWrite || store.isMutating || isSaving)
            } else if !store.isLoading {
                EmptyState(title: "Protocol unavailable", message: "This protocol may have been removed. Refresh your records to check.", systemImage: "list.clipboard")
            }
        }
        .navigationTitle("Protocol")
        .navigationBarTitleDisplayMode(.inline)
        .scrollContentBackground(.hidden).background(Theme.background)
        .refreshable { await store.refresh() }
        .sheet(isPresented: $showingEdit) {
            if let item { NavigationStack { CreateProtocolView(protocolToEdit: item) } }
        }
        .sheet(isPresented: $showingAdherence) {
            NavigationStack { ProtocolAdherenceForm(protocolID: protocolID) }
        }
        .confirmationDialog("Delete this protocol?", isPresented: $confirmingDelete, titleVisibility: .visible) {
            Button("Delete protocol", role: .destructive) {
                Task {
                    await mutate {
                        try await store.deleteProtocol(id: protocolID)
                        dismiss()
                    }
                }
            }.accessibilityIdentifier("protocol.confirmDelete")
            Button("Cancel", role: .cancel) {}.accessibilityIdentifier("protocol.cancelDelete")
        } message: { Text("The plan and its adherence history will be permanently deleted. Dose logs are kept.") }
    }

    @MainActor private func mutate(_ action: () async throws -> Void) async {
        guard !isSaving, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do { try await action() } catch { self.error = error.localizedDescription }
    }
}

struct CreateProtocolView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    private let original: DosingProtocol?
    @State private var name: String
    @State private var peptideID: String
    @State private var peptideName: String
    @State private var dosage: String
    @State private var frequency: String
    @State private var route: String
    @State private var cycleDuration: String
    @State private var startDate: Date
    @State private var endDate: Date
    @State private var hasEndDate: Bool
    @State private var active: Bool
    @State private var notes: String
    @State private var error: String?
    @State private var isSaving = false

    init(peptide: Peptide? = nil, protocolToEdit: DosingProtocol? = nil) {
        original = protocolToEdit
        _name = State(initialValue: protocolToEdit?.name ?? peptide.map { "\($0.name) Protocol" } ?? "")
        _peptideID = State(initialValue: protocolToEdit?.peptideId ?? peptide?.id ?? "")
        _peptideName = State(initialValue: protocolToEdit?.peptideName ?? peptide?.name ?? "")
        _dosage = State(initialValue: protocolToEdit?.dosage ?? "")
        _frequency = State(initialValue: protocolToEdit?.frequency ?? "")
        _route = State(initialValue: protocolToEdit?.route ?? "")
        _cycleDuration = State(initialValue: protocolToEdit?.cycleDuration ?? "")
        _startDate = State(initialValue: protocolToEdit.flatMap { FlowDate.parse($0.startDate) } ?? Date())
        _endDate = State(initialValue: protocolToEdit?.endDate.flatMap(FlowDate.parse) ?? Date())
        _hasEndDate = State(initialValue: protocolToEdit?.endDate != nil)
        _active = State(initialValue: protocolToEdit?.isActive ?? true)
        _notes = State(initialValue: protocolToEdit?.notes ?? "")
    }

    private var isValid: Bool {
        ![name, peptideName, dosage, frequency, route, cycleDuration].contains { FlowInput.trimmed($0).isEmpty }
            && (!hasEndDate || endDate >= startDate)
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            Section {
                TextField("Protocol name", text: $name).accessibilityIdentifier("protocolForm.name")
                if original == nil {
                    Picker("Peptide or custom", selection: $peptideID) {
                        Text("Custom entry").tag("")
                        ForEach(store.catalog, id: \.id) { Text($0.name).tag($0.id) }
                    }.accessibilityIdentifier("protocolForm.peptide")
                        .onChange(of: peptideID) { _, id in
                            peptideName = store.catalog.first { $0.id == id }?.name ?? ""
                            if let peptide = store.catalog.first(where: { $0.id == id }), name.isEmpty {
                                name = "\(peptide.name) Protocol"
                            }
                            dosage = ""
                        }
                }
                TextField("Peptide / supplement name", text: $peptideName)
                    .disabled(!peptideID.isEmpty).accessibilityIdentifier("protocolForm.peptideName")
                TextField("Dosage, including units", text: $dosage).accessibilityIdentifier("protocolForm.dosage")
                TextField("Frequency", text: $frequency).accessibilityIdentifier("protocolForm.frequency")
                TextField("Administration route", text: $route).accessibilityIdentifier("protocolForm.route")
                TextField("Cycle duration", text: $cycleDuration).accessibilityIdentifier("protocolForm.cycleDuration")
            } header: { Text("Your plan") } footer: {
                Text("All plan fields are required. Enter your own plan. Catalog selection does not prescribe or prefill a dose.")
            }
            .disabled(isSaving)
            Section {
                DatePicker("Start date", selection: $startDate, displayedComponents: .date)
                    .accessibilityIdentifier("protocolForm.startDate")
                Toggle("Set an end date", isOn: $hasEndDate)
                    .disabled(original?.endDate != nil).accessibilityIdentifier("protocolForm.hasEndDate")
                if hasEndDate {
                    DatePicker("End date", selection: $endDate, in: startDate..., displayedComponents: .date)
                        .accessibilityIdentifier("protocolForm.endDate")
                }
                Toggle("Active", isOn: $active).accessibilityIdentifier("protocolForm.active")
            } header: { Text("Schedule") } footer: {
                if original?.endDate != nil {
                    Text("An existing end date can be changed, but the current API cannot clear it.")
                }
            }
            .disabled(isSaving)
            Section("Notes") {
                TextField("Notes (optional)", text: $notes, axis: .vertical).lineLimit(3...6)
                    .accessibilityIdentifier("protocolForm.notes")
            }.disabled(isSaving)
            Section {
                SaveButton(title: original == nil ? "Create protocol" : "Save changes", isSaving: isSaving,
                           disabled: !isValid || !store.canWrite || store.isMutating) { await save() }
                    .accessibilityIdentifier("protocolForm.save")
            }
        }
        .navigationTitle(original == nil ? "New Protocol" : "Edit Protocol")
        .navigationBarTitleDisplayMode(.inline)
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }.disabled(isSaving).accessibilityIdentifier("protocolForm.cancel")
            }
        }
    }

    @MainActor private func save() async {
        guard !isSaving, isValid, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            if let original {
                var updates: [String: JSONValue] = [
                    "name": .string(FlowInput.trimmed(name)), "peptideName": .string(FlowInput.trimmed(peptideName)),
                    "dosage": .string(FlowInput.trimmed(dosage)), "frequency": .string(FlowInput.trimmed(frequency)),
                    "route": .string(FlowInput.trimmed(route)), "cycleDuration": .string(FlowInput.trimmed(cycleDuration)),
                    "startDate": .string(FlowDate.iso(startDate)), "isActive": .bool(active), "notes": .string(FlowInput.trimmed(notes))
                ]
                if hasEndDate { updates["endDate"] = .string(FlowDate.iso(endDate)) }
                try await store.updateProtocol(id: original.id, updates: updates)
            } else {
                try await store.createProtocol(DosingProtocol(
                    id: UUID().uuidString, name: FlowInput.trimmed(name), peptideId: FlowInput.optional(peptideID),
                    peptideName: FlowInput.trimmed(peptideName), dosage: FlowInput.trimmed(dosage),
                    frequency: FlowInput.trimmed(frequency), route: FlowInput.trimmed(route),
                    cycleDuration: FlowInput.trimmed(cycleDuration), startDate: FlowDate.iso(startDate),
                    endDate: hasEndDate ? FlowDate.iso(endDate) : nil, isActive: active,
                    notes: FlowInput.optional(notes), adherence: [], createdAt: FlowDate.iso()
                ))
            }
            dismiss()
        } catch { self.error = error.localizedDescription }
    }
}

private struct ProtocolAdherenceForm: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let protocolID: String
    @State private var date = Date()
    @State private var outcome = "taken"
    @State private var notes = ""
    @State private var error: String?
    @State private var isSaving = false

    private var existing: AdherenceEntry? {
        store.protocols.first { $0.id == protocolID }?.adherence.first { $0.date == FlowDate.utcDay(date) }
    }

    var body: some View {
        Form {
            FlowStoreStatus()
            FlowErrorSection(message: error)
            Section {
                DatePicker("UTC day", selection: $date, in: ...Date(), displayedComponents: .date)
                    .environment(\.timeZone, TimeZone(secondsFromGMT: 0)!)
                    .accessibilityIdentifier("adherence.date")
                Text("Recording for \(FlowDate.utcDay(date)) UTC").font(.caption).foregroundStyle(Theme.muted)
                Picker("Outcome", selection: $outcome) {
                    Text("Taken").tag("taken")
                    Text("Skipped").tag("skipped")
                }.pickerStyle(.segmented).accessibilityIdentifier("adherence.outcome")
                TextField("Notes (optional)", text: $notes, axis: .vertical)
                    .lineLimit(3...6).accessibilityIdentifier("adherence.notes")
            }.disabled(isSaving)
            if let existing {
                Section {
                    Text("This day is already marked \(existing.taken ? "taken" : existing.skipped == true ? "skipped" : "not taken"). Saving replaces that outcome and its notes.")
                        .foregroundStyle(Theme.muted)
                }
            }
            Section {
                SaveButton(title: existing == nil ? "Save outcome" : "Replace outcome", isSaving: isSaving,
                           disabled: !store.canWrite || store.isMutating) { await save() }
                    .accessibilityIdentifier("adherence.save")
            }
        }
        .navigationTitle("Record Adherence")
        .navigationBarTitleDisplayMode(.inline)
        .scrollContentBackground(.hidden).background(Theme.background)
        .interactiveDismissDisabled(isSaving)
        .onAppear { loadExisting() }
        .onChange(of: date) { _, _ in loadExisting() }
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }.disabled(isSaving).accessibilityIdentifier("adherence.cancel")
            }
        }
    }

    private func loadExisting() {
        outcome = existing?.taken == false ? "skipped" : "taken"
        notes = existing?.notes ?? ""
    }

    @MainActor private func save() async {
        guard !isSaving, store.canWrite else { return }
        isSaving = true
        error = nil
        defer { isSaving = false }
        do {
            try await store.logAdherence(protocolID: protocolID, entry: AdherenceEntry(
                date: FlowDate.utcDay(date), taken: outcome == "taken", skipped: outcome == "skipped", notes: FlowInput.optional(notes)
            ))
            dismiss()
        } catch { self.error = error.localizedDescription }
    }
}
