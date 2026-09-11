import Foundation
import XCTest
@testable import Nof1Native

final class DomainDateTests: XCTestCase {
    func testISOParserAcceptsWholeAndFractionalSeconds() throws {
        let whole = try XCTUnwrap(DomainDate.parse("2026-09-11T12:34:56Z"))
        let milliseconds = try XCTUnwrap(DomainDate.parse("2026-09-11T12:34:56.789Z"))
        let longer = try XCTUnwrap(DomainDate.parse("2026-09-11T12:34:56.789123Z"))

        XCTAssertEqual(milliseconds.timeIntervalSince(whole), 0.789, accuracy: 0.001)
        XCTAssertEqual(longer.timeIntervalSince(whole), 0.789123, accuracy: 0.001)
        XCTAssertEqual(DomainDate.isoString(milliseconds), "2026-09-11T12:34:56.789Z")
        XCTAssertEqual(DomainDate.parse("2026-09-11"), DomainDate.parse("2026-09-11T00:00:00Z"))
    }

    func testUTCKeyCrossesLocalDayAndYearBoundaries() throws {
        let negativeOffset = try XCTUnwrap(DomainDate.parse("2026-12-31T23:30:00-08:00"))
        let positiveOffset = try XCTUnwrap(DomainDate.parse("2026-01-01T00:30:00+09:00"))

        XCTAssertEqual(DomainDate.dayKey(negativeOffset), "2027-01-01")
        XCTAssertEqual(DomainDate.dayKey(positiveOffset), "2025-12-31")
        XCTAssertEqual(DomainDate.isoString(negativeOffset), "2027-01-01T07:30:00.000Z")
    }

    func testInvalidDatesReturnNil() {
        XCTAssertNil(DomainDate.parse(""))
        XCTAssertNil(DomainDate.parse("not-a-date"))
        XCTAssertNil(DomainDate.parse("09/11/2026"))
    }

    func testPhaseAlternatesForCompleteOnOffCycles() throws {
        let schedule = ExperimentSchedule(startDate: "2026-09-01T00:00:00Z", phaseDurationDays: 7, totalPhases: 2)
        let cases: [(String, Int, Int, Bool)] = [
            ("2026-09-01T00:00:00Z", 1, 1, true),
            ("2026-09-07T23:59:59.999Z", 1, 7, true),
            ("2026-09-08T00:00:00Z", 2, 1, false),
            ("2026-09-14T23:59:59Z", 2, 7, false),
            ("2026-09-15T00:00:00Z", 3, 1, true),
            ("2026-09-22T00:00:00Z", 4, 1, false),
            ("2026-09-28T23:59:59Z", 4, 7, false)
        ]

        for (date, phase, day, intervention) in cases {
            let summary = try summary(schedule, on: date)
            XCTAssertEqual(summary.phaseNumber, phase, date)
            XCTAssertEqual(summary.dayInPhase, day, date)
            XCTAssertEqual(summary.isInterventionDay, intervention, date)
            XCTAssertEqual(summary.totalPhaseCount, 4)
            XCTAssertEqual(summary.totalDays, 28)
            XCTAssertTrue(summary.hasStarted)
            XCTAssertFalse(summary.isComplete)
        }
    }

    func testPhaseBoundsBeforeStartAndAfterCompletion() throws {
        let schedule = ExperimentSchedule(startDate: "2026-09-01T00:00:00Z", phaseDurationDays: 7, totalPhases: 2)
        let before = try summary(schedule, on: "2026-08-31T23:59:59Z")
        XCTAssertEqual(before.phaseNumber, 1)
        XCTAssertEqual(before.dayInPhase, 1)
        XCTAssertEqual(before.daysElapsed, 0)
        XCTAssertFalse(before.hasStarted)
        XCTAssertFalse(before.isComplete)
        XCTAssertFalse(before.isInterventionDay)

        let complete = try summary(schedule, on: "2026-09-29T00:00:00Z")
        XCTAssertEqual(complete.phaseNumber, 4)
        XCTAssertEqual(complete.dayInPhase, 7)
        XCTAssertEqual(complete.daysElapsed, 28)
        XCTAssertTrue(complete.hasStarted)
        XCTAssertTrue(complete.isComplete)
        XCTAssertFalse(complete.isInterventionDay)
        XCTAssertEqual(try summary(schedule, on: "2030-01-01T00:00:00Z"), complete)
    }

    func testPhaseUsesUTCDaysRatherThanLocalDaysOrElapsedHours() throws {
        let schedule = ExperimentSchedule(startDate: "2026-03-07T23:30:00Z", phaseDurationDays: 1, totalPhases: 2)
        let first = try summary(schedule, on: "2026-03-07T23:59:59Z")
        let second = try summary(schedule, on: "2026-03-07T16:01:00-08:00")
        let third = try summary(schedule, on: "2026-03-08T17:01:00-07:00")

        XCTAssertEqual(first.phaseNumber, 1)
        XCTAssertEqual(second.phaseNumber, 2)
        XCTAssertEqual(second.daysElapsed, 1)
        XCTAssertFalse(second.isInterventionDay)
        XCTAssertEqual(third.phaseNumber, 3)
        XCTAssertTrue(third.isInterventionDay)
    }

    func testInvalidAndOverflowingSchedulesReturnNil() throws {
        let date = try XCTUnwrap(DomainDate.parse("2026-09-11T00:00:00Z"))
        for (duration, count) in [(0, 2), (-1, 2), (7, 0), (7, -1), (Int.max, 2), (7, Int.max)] {
            let schedule = ExperimentSchedule(startDate: "2026-09-01", phaseDurationDays: duration, totalPhases: count)
            XCTAssertNil(schedule.phaseSummary(on: date))
        }
        let invalidDate = ExperimentSchedule(startDate: "invalid", phaseDurationDays: 7, totalPhases: 2)
        XCTAssertNil(invalidDate.phaseSummary(on: date))
    }

    private func summary(_ schedule: ExperimentSchedule, on value: String) throws -> ExperimentPhaseSummary {
        let date = try XCTUnwrap(DomainDate.parse(value))
        return try XCTUnwrap(schedule.phaseSummary(on: date))
    }
}
