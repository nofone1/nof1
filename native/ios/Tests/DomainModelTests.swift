import Foundation
import XCTest
@testable import Nof1Native

final class DomainModelTests: XCTestCase {
    private let timestamp = "2026-09-11T12:34:56.789Z"

    func testCustomDoseEncodesExplicitNullPeptideID() throws {
        let dose = DoseEntry(
            id: "dose-1720000000-0.123/custom",
            name: "Custom supplement",
            dosage: "1.5 mg",
            timestamp: timestamp
        )

        XCTAssertEqual(try JSONValue.encode(dose), .object([
            "id": .string(dose.id),
            "peptideId": .null,
            "name": .string(dose.name),
            "dosage": .string(dose.dosage),
            "timestamp": .string(timestamp)
        ]))
        XCTAssertEqual(try roundTrip(dose), dose)
    }

    func testCatalogDosePreservesArbitraryIDsAndOptionalFields() throws {
        let dose = DoseEntry(
            id: "legacy-dose:abc",
            peptideId: "bpc-157",
            name: "BPC-157",
            dosage: "250 mcg",
            timestamp: timestamp,
            notes: "With food",
            injectionSite: "abdomen_left"
        )

        XCTAssertEqual(try roundTrip(dose), dose)
        XCTAssertEqual(try object(dose)["peptideId"], .string("bpc-157"))
    }

    func testCustomStackItemEncodesExplicitNullPeptideID() throws {
        let item = StackItem(
            id: "stack-0.456",
            name: "Custom",
            dosage: "2 mg",
            frequency: "Once daily",
            isActive: true,
            addedAt: timestamp
        )

        let encoded = try object(item)
        XCTAssertEqual(encoded["peptideId"], .null)
        XCTAssertNil(encoded["timeOfDay"])
        XCTAssertEqual(try roundTrip(item), item)
    }

    func testMetricNumbersRemainDoubleJSONNumbers() throws {
        let metric = MetricEntry(
            id: "metric:weight/imported",
            metricType: "weight",
            value: 72.35,
            timestamp: timestamp,
            unit: "kg",
            numericValue: 72.35
        )

        let encoded = try object(metric)
        XCTAssertEqual(encoded["value"], .number(72.35))
        XCTAssertEqual(encoded["numericValue"], .number(72.35))
        XCTAssertNil(encoded["$integer"])
        XCTAssertEqual(try roundTrip(metric), metric)

        let whole = try JSONDecoder().decode(
            JSONValue.self,
            from: Data("9223372036854775808".utf8)
        )
        XCTAssertEqual(whole, .number(9_223_372_036_854_775_808))
        XCTAssertEqual(try roundTrip(JSONValue.number(7)), .number(7))
    }

    func testTrackingSnapshotDecodesBackendUserFieldsAndIntegerNumbers() throws {
        let data = Data("""
        {
          "doses": [{
            "userId": "user_clerk", "id": "dose-backend-0.2", "peptideId": null,
            "name": "Custom", "dosage": "1 mg", "timestamp": "2026-09-11T12:00:00Z"
          }],
          "metrics": [{
            "userId": "user_clerk", "id": "metric-backend-0.3", "metricType": "energy",
            "value": 7, "timestamp": "2026-09-11T12:00:00.000Z"
          }],
          "stack": [{
            "userId": "user_clerk", "id": "stack-backend-0.4", "peptideId": "bpc-157",
            "name": "BPC-157", "dosage": "250 mcg", "frequency": "Daily",
            "isActive": false, "addedAt": "2026-09-11T12:00:00Z"
          }]
        }
        """.utf8)

        let snapshot = try JSONDecoder().decode(TrackingSnapshot.self, from: data)
        XCTAssertEqual(snapshot.doses[0].id, "dose-backend-0.2")
        XCTAssertNil(snapshot.doses[0].peptideId)
        XCTAssertNil(snapshot.doses[0].notes)
        XCTAssertEqual(snapshot.metrics[0].value, 7.0)
        XCTAssertNil(snapshot.metrics[0].numericValue)
        XCTAssertEqual(snapshot.stack[0].peptideId, "bpc-157")
        XCTAssertEqual(try roundTrip(snapshot), snapshot)
    }

    func testProtocolOptionalServerUserAndAdherenceRoundTrip() throws {
        var protocolValue = makeProtocol()
        let initial = try object(protocolValue)
        XCTAssertNil(initial["userId"])
        XCTAssertNil(initial["peptideId"])
        XCTAssertNil(initial["endDate"])
        XCTAssertEqual(protocolValue.adherencePercentage, 0)

        protocolValue.userId = "user_server-only"
        protocolValue.adherence = [
            AdherenceEntry(date: "2026-09-09", taken: true),
            AdherenceEntry(date: "2026-09-10", taken: false, skipped: true, notes: "Skipped"),
            AdherenceEntry(date: "2026-09-11", taken: true, skipped: false)
        ]

        XCTAssertEqual(protocolValue.adherencePercentage, 67)
        XCTAssertEqual(try roundTrip(protocolValue), protocolValue)
        XCTAssertEqual(try roundTrip(protocolValue).userId, "user_server-only")
        XCTAssertEqual(try object(protocolValue.adherence[0]), [
            "date": .string("2026-09-09"),
            "taken": .bool(true)
        ])
    }

    func testAdherenceCountsTakenRatherThanSkippedAndRoundsLikeJavaScript() {
        var protocolValue = makeProtocol()
        protocolValue.adherence = (1...8).map {
            AdherenceEntry(date: "2026-09-0\($0)", taken: $0 == 1, skipped: true)
        }
        XCTAssertEqual(protocolValue.adherencePercentage, 13)

        protocolValue.adherence = [AdherenceEntry(date: "2026-09-11", taken: false)]
        XCTAssertEqual(protocolValue.adherencePercentage, 0)
        protocolValue.adherence = [AdherenceEntry(date: "2026-09-11", taken: true)]
        XCTAssertEqual(protocolValue.adherencePercentage, 100)
    }

    func testExperimentPreservesMetricUnionAndNestedArbitraryIDs() throws {
        let data = Data("""
        {
          "id": "exp-1720000000-0.123", "userId": "user_clerk", "name": "Sleep experiment",
          "hypothesis": "A routine improves sleep", "status": "paused",
          "intervention": {
            "id": "intervention/custom", "name": "Evening routine", "type": "lifestyle",
            "dosage": "10 minutes", "frequency": "Daily"
          },
          "metrics": [
            {"id": "metric-number", "name": "Sleep", "type": "number", "minValue": 0, "maxValue": 24.5, "unit": "hours"},
            {"id": "metric-bool", "name": "Rested", "type": "boolean"},
            {"id": "metric-text", "name": "Notes", "type": "text"}
          ],
          "schedule": {"startDate": "2026-09-01T00:00:00Z", "phaseDurationDays": 7, "totalPhases": 2},
          "entries": [{
            "id": "entry-0.123", "experimentId": "exp-1720000000-0.123",
            "date": "2026-09-11T00:00:00.000Z", "isInterventionDay": false,
            "metricValues": [
              {"metricId": "metric-number", "value": 7.25},
              {"metricId": "metric-bool", "value": true},
              {"metricId": "metric-text", "value": "Feeling rested"}
            ],
            "createdAt": "2026-09-11T12:34:56.789Z"
          }],
          "createdAt": "2026-08-31T12:00:00Z", "updatedAt": "2026-09-11T12:34:56.789Z"
        }
        """.utf8)

        let experiment = try JSONDecoder().decode(Experiment.self, from: data)
        XCTAssertEqual(experiment.id, "exp-1720000000-0.123")
        XCTAssertEqual(experiment.intervention.id, "intervention/custom")
        XCTAssertNil(experiment.intervention.instructions)
        XCTAssertEqual(experiment.metrics[0].minValue, 0.0)
        XCTAssertEqual(experiment.metrics[0].maxValue, 24.5)
        XCTAssertNil(experiment.metrics[1].description)
        XCTAssertNil(experiment.schedule.endDate)
        XCTAssertEqual(experiment.entries[0].metricValues.map(\.value), [
            .number(7.25), .bool(true), .string("Feeling rested")
        ])
        XCTAssertEqual(experiment.entries[0].experimentId, experiment.id)
        XCTAssertEqual(try roundTrip(experiment), experiment)

        var local = experiment
        local.userId = nil
        XCTAssertNil(try object(local)["userId"])
        XCTAssertEqual(try roundTrip(local), local)
    }

    func testJSONValueRecursiveValuesAndBooleanNumberDistinction() throws {
        let value = JSONValue.object([
            "nested": .array([.null, .bool(false), .bool(true), .number(0), .number(1), .number(1.25)]),
            "text": .string("Unicode: μg"),
            "object": .object(["id": .string("not-a-uuid")])
        ])

        XCTAssertEqual(try roundTrip(value), value)
        XCTAssertNotEqual(JSONValue.bool(true), .number(1))
        XCTAssertNotEqual(JSONValue.bool(false), .number(0))
        XCTAssertNotEqual(JSONValue.string("1"), .number(1))
    }

    func testJSONValueRejectsInvalidAndNonFiniteJSON() throws {
        XCTAssertThrowsError(try JSONDecoder().decode(JSONValue.self, from: Data("undefined".utf8)))
        XCTAssertThrowsError(try JSONEncoder().encode(JSONValue.number(.infinity)))
        XCTAssertThrowsError(try JSONEncoder().encode(JSONValue.number(.nan)))
    }

    private func makeProtocol() -> DosingProtocol {
        DosingProtocol(
            id: "protocol-imported-0.789",
            name: "Custom protocol",
            peptideName: "Custom",
            dosage: "1 mg",
            frequency: "Daily",
            route: "Oral",
            cycleDuration: "4 weeks",
            startDate: timestamp,
            isActive: true,
            adherence: [],
            createdAt: timestamp
        )
    }

    private func roundTrip<T: Codable>(_ value: T) throws -> T {
        try JSONDecoder().decode(T.self, from: JSONEncoder().encode(value))
    }

    private func object<T: Encodable>(_ value: T) throws -> [String: JSONValue] {
        let encoded = try JSONValue.encode(value)
        guard case .object(let object) = encoded else {
            XCTFail("Expected a JSON object")
            return [:]
        }
        return object
    }
}
