import Foundation

struct LocalSnapshot: Codable {
    var tracking = TrackingSnapshot(doses: [], metrics: [], stack: [])
    var protocols: [DosingProtocol] = []
    var experiments: [Experiment] = []
}

struct LocalRepository {
    private let directory: URL?

    init(directory: URL? = nil) { self.directory = directory }

    private var url: URL {
        get throws {
            let root: URL
            if let directory { root = directory }
            else {
                root = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                    .appendingPathComponent("Nof1NativeLocalDemo", isDirectory: true)
            }
            try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
            var protectedRoot = root
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            try protectedRoot.setResourceValues(values)
            return root.appendingPathComponent("local-demo-v1.json")
        }
    }

    func load() throws -> LocalSnapshot {
        let path = try url
        guard FileManager.default.fileExists(atPath: path.path) else { return LocalSnapshot() }
        return try JSONDecoder().decode(LocalSnapshot.self, from: Data(contentsOf: path))
    }

    func save(_ snapshot: LocalSnapshot) throws {
        try JSONEncoder().encode(snapshot).write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    func delete() throws {
        let path = try url
        if FileManager.default.fileExists(atPath: path.path) { try FileManager.default.removeItem(at: path) }
    }
}
