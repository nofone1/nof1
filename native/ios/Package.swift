// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Nof1NativeDomain",
    platforms: [.iOS(.v17)],
    products: [.library(name: "Nof1Native", targets: ["Nof1Native"])],
    targets: [
        .target(name: "Nof1Native", path: "Sources", exclude: ["App", "Features", "Data/AppStore.swift", "Data/ClerkTokenProvider.swift"], sources: ["Domain", "Data/LocalRepository.swift"]),
        .testTarget(name: "Nof1NativeTests", dependencies: ["Nof1Native"], path: "Tests")
    ],
    swiftLanguageModes: [.v5]
)
