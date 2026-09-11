import ClerkKit
import Combine
import ConvexMobile
import CryptoKit
import Foundation
import Observation

struct BillingAccess: Decodable {
    let hasPlus: Bool
    let primarySource: String?
    let expiresAt: String?
    let inGracePeriod: Bool
    let hasMultipleActiveProviders: Bool
}

struct EncodedArgument<Value: Encodable>: ConvexEncodable {
    let value: Value
    func convexEncode() throws -> String {
        String(decoding: try JSONEncoder().encode(value), as: UTF8.self)
    }
}

@MainActor
@Observable
final class AppStore {
    let configuration: AppConfiguration
    private(set) var identity: String?
    private(set) var catalog: [Peptide] = []
    private(set) var catalogError: String?
    private(set) var tracking = TrackingSnapshot(doses: [], metrics: [], stack: [])
    private(set) var protocols: [DosingProtocol] = []
    private(set) var experiments: [Experiment] = []
    private(set) var access: BillingAccess?
    private(set) var favorites: Set<String> = []
    private(set) var isMutating = false
    private(set) var isLoading = false
    private(set) var error: String?
    private(set) var connectionMessage = "Not connected"
    private var authenticated = false
    private var sessionID: String?
    private var generation = 0
    private var readyQueries: Set<String> = []
    private var pendingQueries: Set<String> = []
    private var deletionStarted = false
    @ObservationIgnored private var subscriptions: Set<AnyCancellable> = []
    @ObservationIgnored private var authSubscription: AnyCancellable?
    @ObservationIgnored private var timeoutTask: Task<Void, Never>?
    @ObservationIgnored private var client: ConvexClientWithAuth<String>?
    @ObservationIgnored private var tokenProvider: ClerkTokenProvider?
    @ObservationIgnored private let local = LocalRepository()

    init(configuration: AppConfiguration) {
        self.configuration = configuration
        do {
            guard let url = Bundle.main.url(forResource: "catalog", withExtension: "json") else { throw NativeError.missingRecord }
            catalog = try JSONDecoder().decode([Peptide].self, from: Data(contentsOf: url))
            guard catalog.count == 71 else { throw NativeError.missingRecord }
        } catch {
            catalogError = "The bundled research catalog could not be loaded. Rebuild with native/shared/catalog.json."
        }
    }

    var isLocal: Bool { configuration.mode == .localDemo }
    func matchesSession(userID: String, sessionID: String) -> Bool {
        identity == userID && self.sessionID == sessionID
    }
    var canWrite: Bool {
        identity != nil && authenticated && !isLoading && !isMutating && !deletionStarted && readyQueries.isSuperset(of: ["tracking", "protocols", "experiments"])
    }

    func startLocal() {
        guard isLocal else { return }
        reset()
        identity = "local-demo"
        loadFavorites()
        do {
            apply(try local.load())
            authenticated = true
            readyQueries = ["tracking", "protocols", "experiments"]
            connectionMessage = "Local development data · this device only"
        } catch {
            self.error = NativeError.storage.localizedDescription
        }
    }

    func connect(userID: String?, sessionID: String?) async {
        guard !isLocal else { return }
        guard self.sessionID != sessionID || identity != userID else { return }
        reset()
        guard configuration.error == nil, let userID, let sessionID else { return }
        identity = userID
        self.sessionID = sessionID
        loadFavorites()
        await establishConnection()
    }

    private func establishConnection() async {
        guard let sessionID, identity != nil else { return }
        let current = generation
        isLoading = true
        error = nil
        access = nil
        connectionMessage = "Verifying your cloud session…"
        let provider = ClerkTokenProvider(sessionID: sessionID)
        let newClient = ConvexClientWithAuth(deploymentUrl: configuration.convexURL, authProvider: provider)
        tokenProvider = provider
        client = newClient
        let result = await newClient.loginFromCache()
        guard current == generation else { provider.invalidate(); return }
        switch result {
        case .failure:
            isLoading = false
            error = NativeError.authentication.localizedDescription
            connectionMessage = "Cloud authentication failed"
        case .success:
            authenticated = true
            authSubscription = newClient.authState.receive(on: DispatchQueue.main).sink { [weak self] state in
                guard let self, self.generation == current else { return }
                if case .unauthenticated = state {
                    self.subscriptions.removeAll()
                    self.authenticated = false
                    self.readyQueries = []
                    self.pendingQueries = []
                    self.clearRecords()
                    self.isLoading = false
                    self.error = NativeError.authentication.localizedDescription
                    self.connectionMessage = "Session expired · reconnect required"
                }
            }
            subscribeToData(newClient, generation: current)
        }
    }

    private func subscribeToData(_ client: ConvexClientWithAuth<String>, generation current: Int) {
        pendingQueries = ["tracking", "protocols", "experiments"]
        readyQueries = []
        connectionMessage = "Syncing your records…"
        watch(client, query: "tracking:getAll", key: "tracking", generation: current) { self.tracking = $0 }
        watch(client, query: "protocols:list", key: "protocols", generation: current) { self.protocols = $0 }
        watch(client, query: "experiments:list", key: "experiments", generation: current) { self.experiments = $0 }
        watch(client, query: "billing:getAccess", key: "billing", generation: current) { self.access = $0 }
        timeoutTask?.cancel()
        timeoutTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(20))
            guard !Task.isCancelled, let self, current == self.generation, !self.pendingQueries.isEmpty else { return }
            self.error = "Cloud sync is taking longer than expected. Check your connection or reconnect. No local fallback has been used."
        }
    }

    private func watch<Value: Decodable>(_ client: ConvexClient, query: String, key: String, generation current: Int, update: @escaping (Value) -> Void) {
        client.subscribe(to: query, yielding: Value.self)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completion in
                guard let self, current == self.generation else { return }
                if case .failure = completion {
                    if key == "billing" { self.access = nil }
                    self.pendingQueries.remove(key)
                    self.readyQueries.remove(key)
                    self.isLoading = !self.pendingQueries.isEmpty
                    self.error = key == "billing" ? "Subscription access could not be verified. Paid access has not been assumed." : "Your \(key) could not be synced. Reconnect to try reading them again."
                    self.connectionMessage = "Cloud sync needs attention"
                }
            }, receiveValue: { [weak self] value in
                guard let self, current == self.generation, self.authenticated else { return }
                update(value)
                self.pendingQueries.remove(key)
                self.readyQueries.insert(key)
                self.isLoading = !self.pendingQueries.isEmpty
                if self.readyQueries.isSuperset(of: ["tracking", "protocols", "experiments"]) {
                    self.connectionMessage = "Connected to your cloud account"
                }
            }).store(in: &subscriptions)
    }

    func refresh() async {
        guard !isMutating else { return }
        if isLocal { startLocal(); return }
        guard identity != nil else { return }
        generation += 1
        subscriptions.removeAll()
        authSubscription = nil
        timeoutTask?.cancel()
        tokenProvider?.invalidate()
        client = nil
        authenticated = false
        readyQueries = []
        await establishConnection()
    }

    func showError(_ error: Error) {
        self.error = Self.safeError(error).localizedDescription
    }

    func toggleFavorite(id: String) {
        guard identity != nil else { return }
        if favorites.contains(id) { favorites.remove(id) } else { favorites.insert(id) }
        UserDefaults.standard.set(Array(favorites).sorted(), forKey: favoritesKey)
    }

    private var favoritesKey: String {
        let hash = SHA256.hash(data: Data((identity ?? "signed-out").utf8)).map { String(format: "%02x", $0) }.joined()
        return "native.favorites.\(isLocal ? "local" : "cloud").\(hash)"
    }

    private func loadFavorites() { favorites = Set(UserDefaults.standard.stringArray(forKey: favoritesKey) ?? []) }

    func signOut() async throws {
        guard !isMutating else { throw NativeError.busy }
        let wasLocal = isLocal
        let previousIdentity = identity
        let previousSession = sessionID
        reset()
        let current = generation
        if !wasLocal {
            do { try await Clerk.shared.auth.signOut() }
            catch {
                if generation == current {
                    identity = previousIdentity
                    sessionID = previousSession
                    self.error = "Sign-out was not confirmed. Your records have been cleared from this view. Retry sign-out or reconnect."
                }
                throw NativeError.authentication
            }
        }
    }

    func deleteAccount() async throws {
        guard identity != nil, !isMutating else { throw NativeError.busy }
        if isLocal {
            do { try local.delete() } catch { throw NativeError.storage }
            UserDefaults.standard.removeObject(forKey: favoritesKey)
            reset()
            return
        }
        guard let client, authenticated, let user = Clerk.shared.user, user.id == identity,
              let deletionSessionID = sessionID,
              Clerk.shared.session?.id == deletionSessionID,
              Clerk.shared.session?.status == .active else { throw NativeError.authentication }
        let deletionUserID = user.id
        let current = generation
        isMutating = true
        defer { if current == generation { isMutating = false } }
        if !deletionStarted {
            do {
                let _: JSONValue = try await client.mutation("account:deleteMyData")
                guard current == generation else { throw NativeError.sessionChanged }
                deletionStarted = true
                clearRecords()
            } catch { throw Self.safeError(error) }
        }
        guard current == generation, Clerk.shared.user?.id == deletionUserID,
              Clerk.shared.session?.id == deletionSessionID,
              Clerk.shared.session?.status == .active else { throw NativeError.sessionChanged }
        do {
            _ = try await user.delete()
            guard current == generation else { return }
            UserDefaults.standard.removeObject(forKey: favoritesKey)
            reset()
        } catch { throw NativeError.partialDeletion }
    }

    func logDose(_ entry: DoseEntry) async throws {
        guard !entry.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, !entry.dosage.isEmpty else { throw NativeError.invalidInput("Enter a substance and dose.") }
        try await write("tracking:logDose", args: ["entry": EncodedArgument(value: entry)]) { $0.tracking.doses.insert(entry, at: 0) }
    }

    func logMetric(_ entry: MetricEntry) async throws {
        guard entry.value.isFinite, entry.numericValue?.isFinite != false else { throw NativeError.invalidInput("Enter a finite metric value.") }
        try await write("tracking:logMetric", args: ["entry": EncodedArgument(value: entry)]) { $0.tracking.metrics.insert(entry, at: 0) }
    }

    func addToStack(_ item: StackItem) async throws {
        try await write("tracking:addToStack", args: ["input": EncodedArgument(value: item)]) { snapshot in
            snapshot.tracking.stack.removeAll { $0.id == item.id }
            snapshot.tracking.stack.insert(item, at: 0)
        }
    }

    func deleteDose(id: String) async throws {
        try await write("tracking:deleteDose", args: ["id": id]) { snapshot in
            guard snapshot.tracking.doses.contains(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.tracking.doses.removeAll { $0.id == id }
        }
    }

    func deleteMetric(id: String) async throws {
        try await write("tracking:deleteMetric", args: ["id": id]) { snapshot in
            guard snapshot.tracking.metrics.contains(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.tracking.metrics.removeAll { $0.id == id }
        }
    }

    func removeFromStack(id: String) async throws {
        try await write("tracking:removeFromStack", args: ["id": id]) { snapshot in
            guard snapshot.tracking.stack.contains(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.tracking.stack.removeAll { $0.id == id }
        }
    }

    func toggleStackItem(id: String) async throws {
        try await write("tracking:toggleStackItem", args: ["id": id]) { snapshot in
            guard let index = snapshot.tracking.stack.firstIndex(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.tracking.stack[index].isActive.toggle()
        }
    }

    func createProtocol(_ value: DosingProtocol) async throws {
        var input = value
        input.userId = nil
        try await write("protocols:create", args: ["input": EncodedArgument(value: input)]) { $0.protocols.insert(input, at: 0) }
    }

    func updateProtocol(id: String, updates: [String: JSONValue]) async throws {
        try await write("protocols:update", args: ["id": id, "updates": EncodedArgument(value: updates)]) { snapshot in
            guard let index = snapshot.protocols.firstIndex(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.protocols[index] = try Self.patch(snapshot.protocols[index], updates: updates)
        }
    }

    func deleteProtocol(id: String) async throws {
        try await write("protocols:remove", args: ["id": id]) { snapshot in
            guard snapshot.protocols.contains(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.protocols.removeAll { $0.id == id }
        }
    }

    func toggleProtocol(id: String) async throws {
        try await write("protocols:toggleActive", args: ["id": id]) { snapshot in
            guard let index = snapshot.protocols.firstIndex(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.protocols[index].isActive.toggle()
        }
    }

    func logAdherence(protocolID: String, entry: AdherenceEntry) async throws {
        try await write("protocols:logAdherence", args: ["protocolId": protocolID, "entry": EncodedArgument(value: entry)]) { snapshot in
            guard let index = snapshot.protocols.firstIndex(where: { $0.id == protocolID }) else { throw NativeError.missingRecord }
            snapshot.protocols[index].adherence.removeAll { $0.date == entry.date }
            snapshot.protocols[index].adherence.append(entry)
        }
    }

    func createExperiment(_ value: Experiment) async throws {
        var input = value
        input.userId = nil
        try await write("experiments:create", args: ["input": EncodedArgument(value: input)]) { snapshot in
            if Self.inProgress(input.status), snapshot.experiments.contains(where: { $0.id != input.id && Self.inProgress($0.status) }) { throw NativeError.plusRequired }
            snapshot.experiments.removeAll { $0.id == input.id }
            snapshot.experiments.insert(input, at: 0)
        }
    }

    func updateExperiment(id: String, updates: [String: JSONValue]) async throws {
        try await write("experiments:update", args: ["id": id, "updates": EncodedArgument(value: updates)]) { snapshot in
            guard let index = snapshot.experiments.firstIndex(where: { $0.id == id }) else { throw NativeError.missingRecord }
            var updated = try Self.patch(snapshot.experiments[index], updates: updates)
            if Self.inProgress(updated.status), !Self.inProgress(snapshot.experiments[index].status), snapshot.experiments.contains(where: { $0.id != id && Self.inProgress($0.status) }) { throw NativeError.plusRequired }
            updated.updatedAt = ISO8601DateFormatter().string(from: Date())
            snapshot.experiments[index] = updated
        }
    }

    func deleteExperiment(id: String) async throws {
        try await write("experiments:remove", args: ["id": id]) { snapshot in
            guard snapshot.experiments.contains(where: { $0.id == id }) else { throw NativeError.missingRecord }
            snapshot.experiments.removeAll { $0.id == id }
        }
    }

    func addEntry(experimentID: String, entry: ExperimentEntry) async throws {
        try await write("experiments:addEntry", args: ["experimentId": experimentID, "entry": EncodedArgument(value: entry)]) { snapshot in
            guard let index = snapshot.experiments.firstIndex(where: { $0.id == experimentID }) else { throw NativeError.missingRecord }
            snapshot.experiments[index].entries.append(entry)
            snapshot.experiments[index].updatedAt = ISO8601DateFormatter().string(from: Date())
        }
    }

    private func write(_ function: String, args: [String: ConvexEncodable?], localChange: (inout LocalSnapshot) throws -> Void) async throws {
        guard !isMutating else { throw NativeError.busy }
        guard canWrite else { throw NativeError.unavailable }
        let current = generation
        isMutating = true
        defer { if current == generation { isMutating = false } }
        if isLocal {
            var snapshot = LocalSnapshot(tracking: tracking, protocols: protocols, experiments: experiments)
            try localChange(&snapshot)
            do { try local.save(snapshot) } catch { throw NativeError.storage }
            apply(snapshot)
        } else {
            guard let client else { throw NativeError.unavailable }
            do {
                let receipt: JSONValue = try await client.mutation(function, with: args)
                guard current == generation else { throw NativeError.sessionChanged }
                try MutationReceipt.validate(receipt)
            } catch { throw Self.safeError(error) }
        }
    }

    private static func patch<Value: Codable>(_ value: Value, updates: [String: JSONValue]) throws -> Value {
        var fields = try JSONDecoder().decode([String: JSONValue].self, from: JSONEncoder().encode(value))
        for (key, value) in updates where !["id", "userId", "createdAt"].contains(key) { fields[key] = value }
        return try JSONDecoder().decode(Value.self, from: JSONEncoder().encode(fields))
    }

    private static func inProgress(_ status: String) -> Bool { ["draft", "active", "paused"].contains(status) }

    private static func safeError(_ error: Error) -> NativeError {
        if let native = error as? NativeError { return native }
        if error is MutationReceiptError { return .missingRecord }
        if String(describing: error).contains("Nof1 Plus required") { return .plusRequired }
        return .backend
    }

    private func apply(_ snapshot: LocalSnapshot) {
        tracking = snapshot.tracking
        protocols = snapshot.protocols
        experiments = snapshot.experiments
    }

    private func clearRecords() {
        tracking = TrackingSnapshot(doses: [], metrics: [], stack: [])
        protocols = []
        experiments = []
        access = nil
    }

    private func reset() {
        generation += 1
        subscriptions.removeAll()
        authSubscription = nil
        timeoutTask?.cancel()
        tokenProvider?.invalidate()
        tokenProvider = nil
        client = nil
        sessionID = nil
        identity = nil
        authenticated = false
        isLoading = false
        isMutating = false
        readyQueries = []
        pendingQueries = []
        favorites = []
        error = nil
        deletionStarted = false
        connectionMessage = "Not connected"
        clearRecords()
    }
}
