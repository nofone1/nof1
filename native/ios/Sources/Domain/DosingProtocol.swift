import Foundation

struct DosingProtocol: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var userId: String? = nil
    var name: String
    var peptideId: String? = nil
    var peptideName: String
    var dosage: String
    var frequency: String
    var route: String
    var cycleDuration: String
    var startDate: String
    var endDate: String? = nil
    var isActive: Bool
    var notes: String? = nil
    var adherence: [AdherenceEntry]
    var createdAt: String

    var adherencePercentage: Int {
        guard !adherence.isEmpty else { return 0 }
        let taken = adherence.filter(\.taken).count
        return Int((Double(taken) / Double(adherence.count) * 100).rounded())
    }
}

struct AdherenceEntry: Codable, Equatable, Sendable {
    var date: String
    var taken: Bool
    var skipped: Bool? = nil
    var notes: String? = nil
}
