import Foundation

struct Experiment: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var userId: String? = nil
    var name: String
    var hypothesis: String
    var intervention: Intervention
    var metrics: [ExperimentMetric]
    var schedule: ExperimentSchedule
    var status: String
    var entries: [ExperimentEntry]
    var createdAt: String
    var updatedAt: String
}

struct Intervention: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var name: String
    var type: String
    var dosage: String
    var frequency: String
    var instructions: String? = nil
}

struct ExperimentMetric: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var name: String
    var description: String? = nil
    var type: String
    var minValue: Double? = nil
    var maxValue: Double? = nil
    var unit: String? = nil
}

struct ExperimentSchedule: Codable, Equatable, Sendable {
    var startDate: String
    var endDate: String? = nil
    var phaseDurationDays: Int
    var totalPhases: Int
    var reminderTime: String? = nil
}

struct ExperimentEntry: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var experimentId: String
    var date: String
    var isInterventionDay: Bool
    var metricValues: [MetricValue]
    var notes: String? = nil
    var createdAt: String
}

struct MetricValue: Codable, Equatable, Sendable {
    var metricId: String
    var value: JSONValue
}
