#if canImport(ConvexMobile)
import ConvexMobile
import Foundation
import XCTest
@testable import Nof1Native

final class SDKSerializationTests: XCTestCase {
    func testConvexArgumentUsesJSONNumbersRatherThanInt64Tags() throws {
        let schedule = ExperimentSchedule(startDate: "2026-09-11T00:00:00.000Z", phaseDurationDays: 7, totalPhases: 4)
        let argument = EncodedArgument(value: schedule)
        let encoded = try argument.convexEncode()
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(encoded.utf8)) as? [String: Any])
        XCTAssertEqual(object["phaseDurationDays"] as? Double, 7)
        XCTAssertEqual(object["totalPhases"] as? Double, 4)
        XCTAssertFalse(encoded.contains("$integer"))
    }

    func testConvexArgumentPreservesExplicitNullAndOmittedOptionals() throws {
        let entry = DoseEntry(id: "dose-arbitrary", name: "Custom", dosage: "1 mg", timestamp: "2026-09-11T12:00:00Z")
        let encoded = try EncodedArgument(value: entry).convexEncode()
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(encoded.utf8)) as? [String: Any])
        XCTAssertTrue(object["peptideId"] is NSNull)
        XCTAssertNil(object["notes"])
        XCTAssertNil(object["userId"])
    }

    func testConvexNestedMetricValueTypesRemainIntact() throws {
        let fields: [String: JSONValue] = ["number": .number(8.25), "boolean": .bool(true), "text": .string("rested")]
        let encoded = try EncodedArgument(value: fields).convexEncode()
        XCTAssertEqual(try JSONDecoder().decode([String: JSONValue].self, from: Data(encoded.utf8)), fields)
    }
}
#endif
