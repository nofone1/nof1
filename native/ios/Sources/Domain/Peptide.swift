import Foundation

struct Peptide: Codable, Identifiable, Equatable, Sendable {
    var id: String
    var name: String
    var shortCode: String
    var subtitle: String
    var researchLevel: String
    var administrationRoutes: [String]
    var categories: [String]
    var dosing: DosingInfo
    var overview: PeptideOverview
    var molecularInfo: MolecularInfo
    var indications: [ResearchIndication]
    var protocols: [ResearchProtocol]
    var sideEffects: [String]
    var safetyNotes: [String]
    var storage: StorageInfo
    var timeline: [TimelineEntry]
    var pharmacokinetics: Pharmacokinetics? = nil
    var interactions: [PeptideInteraction]? = nil
    var studies: [ResearchStudy]? = nil
    var reconstitution: ReconstitutionInfo? = nil
}

struct DosingInfo: Codable, Equatable, Sendable {
    var typicalDose: String
    var frequency: String
    var route: String
    var routeDetails: String
    var cycleDuration: String
    var storageTemp: String
    var storageNotes: String
}

struct PeptideOverview: Codable, Equatable, Sendable {
    var description: String
    var keyBenefits: String
    var mechanism: String
}

struct MolecularInfo: Codable, Equatable, Sendable {
    var weight: String
    var length: Int
    var type: String
    var sequence: String
    var sequenceNote: String? = nil
}

struct ResearchProtocol: Codable, Equatable, Sendable {
    var goal: String
    var dose: String
    var frequency: String
    var route: String
}

struct ResearchIndication: Codable, Equatable, Sendable {
    var name: String
    var effectiveness: String
    var details: [ResearchIndicationDetail]
}

struct ResearchIndicationDetail: Codable, Equatable, Sendable {
    var title: String
    var description: String
}

struct StorageInfo: Codable, Equatable, Sendable {
    var temperature: String
    var condition: String
    var reconstitutedStability: String
}

struct TimelineEntry: Codable, Equatable, Sendable {
    var week: String
    var description: String
}

struct Pharmacokinetics: Codable, Equatable, Sendable {
    var peakTime: String
    var halfLife: String
    var clearanceTime: String
    var halfLifeHours: Double
}

struct PeptideInteraction: Codable, Equatable, Sendable {
    var peptideId: String
    var peptideName: String
    var type: String
    var description: String
}

struct ResearchStudy: Codable, Equatable, Sendable {
    var title: String
    var authors: String
    var year: Int
    var journal: String
    var doi: String
    var summary: String
}

struct ReconstitutionInfo: Codable, Equatable, Sendable {
    var defaultPeptideMg: Double
    var defaultVialMl: Double
    var solvent: String
    var steps: [String]
    var qualityIndicators: ReconstitutionQualityIndicators
}

struct ReconstitutionQualityIndicators: Codable, Equatable, Sendable {
    var good: [String]
    var bad: [String]
}
