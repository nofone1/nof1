import Foundation

struct AppConfiguration {
    enum Mode: String { case cloud; case localDemo = "local-demo" }
    let mode: Mode?
    let clerkPublishableKey: String
    let convexURL: String

    init(bundle: Bundle = .main) {
        mode = Mode(rawValue: bundle.object(forInfoDictionaryKey: "Nof1Mode") as? String ?? "")
        clerkPublishableKey = bundle.object(forInfoDictionaryKey: "Nof1ClerkPublishableKey") as? String ?? ""
        convexURL = bundle.object(forInfoDictionaryKey: "Nof1ConvexURL") as? String ?? ""
    }

    var error: String? {
        guard let mode else { return "Choose cloud or local-demo with the native iOS configuration script, then rebuild." }
        guard mode == .cloud else { return nil }
        guard clerkPublishableKey.hasPrefix("pk_test_") || clerkPublishableKey.hasPrefix("pk_live_") else {
            return "This cloud build is missing its Clerk publishable key. Configure and rebuild the app."
        }
        guard let url = URL(string: convexURL), url.scheme == "https", url.host != nil, url.user == nil, url.password == nil else {
            return "This cloud build is missing a valid HTTPS Convex deployment URL. Configure and rebuild the app."
        }
        return nil
    }
}
