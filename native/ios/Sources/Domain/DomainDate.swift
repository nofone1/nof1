import Foundation

enum DomainDate {
    static func parse(_ value: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: value) {
            return date
        }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: value) {
            return date
        }
        guard value.count == 10 else { return nil }
        formatter.formatOptions = [.withFullDate]
        return formatter.date(from: value)
    }

    static func isoString(_ date: Date = Date()) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter.string(from: date)
    }

    static func dayKey(_ date: Date = Date()) -> String {
        String(isoString(date).prefix(10))
    }
}

struct ExperimentPhaseSummary: Codable, Equatable, Sendable {
    var phaseNumber: Int
    var totalPhaseCount: Int
    var dayInPhase: Int
    var totalDays: Int
    var daysElapsed: Int
    var isInterventionDay: Bool
    var hasStarted: Bool
    var isComplete: Bool
}

extension ExperimentSchedule {
    func phaseSummary(on date: Date = Date()) -> ExperimentPhaseSummary? {
        guard phaseDurationDays > 0, totalPhases > 0,
              let start = DomainDate.parse(startDate) else { return nil }
        let (phaseCount, phaseOverflow) = totalPhases.multipliedReportingOverflow(by: 2)
        guard !phaseOverflow else { return nil }
        let (totalDays, dayOverflow) = phaseDurationDays.multipliedReportingOverflow(by: phaseCount)
        guard !dayOverflow else { return nil }

        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0)!
        guard let elapsed = calendar.dateComponents(
            [.day],
            from: calendar.startOfDay(for: start),
            to: calendar.startOfDay(for: date)
        ).day else { return nil }

        let boundedDay = min(max(elapsed, 0), totalDays - 1)
        let phaseIndex = boundedDay / phaseDurationDays
        let hasStarted = elapsed >= 0
        let isComplete = elapsed >= totalDays

        return ExperimentPhaseSummary(
            phaseNumber: phaseIndex + 1,
            totalPhaseCount: phaseCount,
            dayInPhase: boundedDay % phaseDurationDays + 1,
            totalDays: totalDays,
            daysElapsed: min(max(elapsed, 0), totalDays),
            isInterventionDay: hasStarted && !isComplete && phaseIndex.isMultiple(of: 2),
            hasStarted: hasStarted,
            isComplete: isComplete
        )
    }
}
