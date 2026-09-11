import Foundation
import XCTest
@testable import Nof1Native

final class LocalRepositoryTests: XCTestCase {
    private func temporaryDirectory() throws -> URL {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        addTeardownBlock { try? FileManager.default.removeItem(at: directory) }
        return directory
    }

    func testLocalRecordsSurviveRepositoryRestart() throws {
        let directory = try temporaryDirectory()
        let first = LocalRepository(directory: directory)
        var snapshot = LocalSnapshot()
        let dose = DoseEntry(id: "local-fixture-dose", name: "Synthetic fixture", dosage: "1 unit", timestamp: "2026-09-11T12:00:00Z")
        snapshot.tracking.doses = [dose]
        try first.save(snapshot)
        let restarted = LocalRepository(directory: directory)
        XCTAssertEqual(try restarted.load().tracking.doses, [dose])
    }

    func testAbsentAndDeletedLocalWorkspaceAreEmpty() throws {
        let repository = LocalRepository(directory: try temporaryDirectory())
        XCTAssertTrue(try repository.load().tracking.doses.isEmpty)
        var snapshot = LocalSnapshot()
        snapshot.tracking.metrics = [MetricEntry(id: "metric-fixture", metricType: "energy", value: 7, timestamp: "2026-09-11T12:00:00Z")]
        try repository.save(snapshot)
        try repository.delete()
        XCTAssertTrue(try repository.load().tracking.metrics.isEmpty)
    }

    func testCorruptedSnapshotIsNotSilentlyReplacedWithSuccess() throws {
        let directory = try temporaryDirectory()
        let repository = LocalRepository(directory: directory)
        try repository.save(LocalSnapshot())
        let path = directory.appendingPathComponent("local-demo-v1.json")
        try Data("not valid JSON".utf8).write(to: path)
        XCTAssertThrowsError(try repository.load())
        XCTAssertEqual(try String(contentsOf: path, encoding: .utf8), "not valid JSON")
    }

    func testSeparateWorkspacesNeverReadEachOthersData() throws {
        let first = LocalRepository(directory: try temporaryDirectory())
        let second = LocalRepository(directory: try temporaryDirectory())
        var snapshot = LocalSnapshot()
        snapshot.tracking.doses = [DoseEntry(id: "isolated-fixture", name: "Synthetic", dosage: "1 unit", timestamp: "2026-09-11T12:00:00Z")]
        try first.save(snapshot)
        XCTAssertTrue(try second.load().tracking.doses.isEmpty)
        XCTAssertEqual(try first.load().tracking.doses.count, 1)
    }
}
