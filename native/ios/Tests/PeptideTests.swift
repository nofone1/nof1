import Foundation
import XCTest
@testable import Nof1Native

final class PeptideTests: XCTestCase {
    func testSharedCatalogDecodesAll71PeptidesWithoutLosingDetails() throws {
        #if os(Linux)
        let url = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .appendingPathComponent("../../shared/catalog.json")
            .standardizedFileURL
        #else
        let url = try XCTUnwrap(Bundle.main.url(forResource: "catalog", withExtension: "json"))
        #endif
        let data = try Data(contentsOf: url)
        let peptides = try JSONDecoder().decode([Peptide].self, from: data)
        let original = try JSONDecoder().decode(JSONValue.self, from: data)

        XCTAssertEqual(peptides.count, 71)
        XCTAssertEqual(Set(peptides.map(\.id)).count, 71)
        XCTAssertEqual(try JSONValue.encode(peptides), original)
        XCTAssertTrue(peptides.allSatisfy { !$0.name.isEmpty && !$0.overview.description.isEmpty })
    }

    func testCatalogModelPreservesEveryAuthoritativeDetailField() throws {
        let input = Data("""
        {
          "id": "catalog/arbitrary-id", "name": "Catalog fixture", "shortCode": "CF",
          "subtitle": "Contract fixture", "researchLevel": "emerging_research",
          "administrationRoutes": ["injectable", "oral"], "categories": ["tissue_repair"],
          "dosing": {
            "typicalDose": "250 mcg", "frequency": "Daily", "route": "Subcutaneous",
            "routeDetails": "Rotate sites", "cycleDuration": "4 weeks", "storageTemp": "2–8°C",
            "storageNotes": "Protect from light"
          },
          "overview": {"description": "Description", "keyBenefits": "Benefits", "mechanism": "Mechanism"},
          "molecularInfo": {"weight": "1419.5 Da", "length": 15, "type": "Peptide", "sequence": "GEPP", "sequenceNote": "Note"},
          "indications": [{
            "name": "Recovery", "effectiveness": "moderate",
            "details": [{"title": "Research", "description": "Details"}]
          }],
          "protocols": [{"goal": "Recovery", "dose": "250 mcg", "frequency": "Daily", "route": "Subcutaneous"}],
          "sideEffects": ["Irritation"], "safetyNotes": ["Research only"],
          "storage": {"temperature": "2–8°C", "condition": "Refrigerated", "reconstitutedStability": "28 days"},
          "timeline": [{"week": "1–2", "description": "Early observations"}],
          "pharmacokinetics": {"peakTime": "1 hour", "halfLife": "4 hours", "clearanceTime": "20 hours", "halfLifeHours": 4.5},
          "interactions": [{"peptideId": "tb-500", "peptideName": "TB-500", "type": "compatible", "description": "Interaction details"}],
          "studies": [{"title": "Study", "authors": "Authors", "year": 2025, "journal": "Journal", "doi": "10.1234/fixture", "summary": "Summary"}],
          "reconstitution": {
            "defaultPeptideMg": 5.5, "defaultVialMl": 2.5, "solvent": "Bacteriostatic Water",
            "steps": ["Step one", "Step two"], "qualityIndicators": {"good": ["Clear"], "bad": ["Cloudy"]}
          }
        }
        """.utf8)

        let peptide = try JSONDecoder().decode(Peptide.self, from: input)
        let original = try JSONDecoder().decode(JSONValue.self, from: input)
        XCTAssertEqual(try JSONValue.encode(peptide), original)
        XCTAssertEqual(peptide.molecularInfo.sequenceNote, "Note")
        XCTAssertEqual(peptide.indications[0].details[0].description, "Details")
        XCTAssertEqual(peptide.pharmacokinetics?.halfLifeHours, 4.5)
        XCTAssertEqual(peptide.reconstitution?.qualityIndicators.bad, ["Cloudy"])
        XCTAssertEqual(peptide.studies?[0].doi, "10.1234/fixture")

        var minimal = peptide
        minimal.molecularInfo.sequenceNote = nil
        minimal.pharmacokinetics = nil
        minimal.interactions = nil
        minimal.studies = nil
        minimal.reconstitution = nil
        let decoded = try JSONDecoder().decode(Peptide.self, from: JSONEncoder().encode(minimal))
        XCTAssertEqual(decoded, minimal)
    }
}
