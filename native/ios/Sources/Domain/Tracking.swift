import Foundation

struct DoseEntry: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var peptideId: String? = nil
    var name: String
    var dosage: String
    var timestamp: String
    var notes: String? = nil
    var injectionSite: String? = nil

    enum CodingKeys: String, CodingKey {
        case id, peptideId, name, dosage, timestamp, notes, injectionSite
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(peptideId, forKey: .peptideId)
        try container.encode(name, forKey: .name)
        try container.encode(dosage, forKey: .dosage)
        try container.encode(timestamp, forKey: .timestamp)
        try container.encodeIfPresent(notes, forKey: .notes)
        try container.encodeIfPresent(injectionSite, forKey: .injectionSite)
    }
}

struct MetricEntry: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var metricType: String
    var customName: String? = nil
    var value: Double
    var timestamp: String
    var notes: String? = nil
    var unit: String? = nil
    var numericValue: Double? = nil
}

struct StackItem: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var peptideId: String? = nil
    var name: String
    var dosage: String
    var frequency: String
    var timeOfDay: String? = nil
    var isActive: Bool
    var addedAt: String

    enum CodingKeys: String, CodingKey {
        case id, peptideId, name, dosage, frequency, timeOfDay, isActive, addedAt
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(peptideId, forKey: .peptideId)
        try container.encode(name, forKey: .name)
        try container.encode(dosage, forKey: .dosage)
        try container.encode(frequency, forKey: .frequency)
        try container.encodeIfPresent(timeOfDay, forKey: .timeOfDay)
        try container.encode(isActive, forKey: .isActive)
        try container.encode(addedAt, forKey: .addedAt)
    }
}

struct TrackingSnapshot: Codable, Equatable, Sendable {
    var doses: [DoseEntry]
    var metrics: [MetricEntry]
    var stack: [StackItem]
}
