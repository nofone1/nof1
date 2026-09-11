import ClerkKit
import ConvexMobile
import Foundation

enum NativeError: LocalizedError {
    case authentication, sessionChanged, unavailable, busy, storage, missingRecord, plusRequired, invalidInput(String), backend, partialDeletion

    var errorDescription: String? {
        switch self {
        case .authentication: return "Authentication could not be verified. Check your connection, sign in again, and verify the Clerk convex JWT template is configured."
        case .sessionChanged: return "The account changed while this request was running. Its result was not applied to this account."
        case .unavailable: return "Your data connection is not ready. Reconnect before making changes."
        case .busy: return "Another change is still being saved. Wait for it to finish."
        case .storage: return "The device could not save or read local data. No successful save has been recorded."
        case .missingRecord: return "This record is no longer available. Refresh your data."
        case .plusRequired: return "Nof1 Plus is required for more than one draft, active, or paused experiment. Manage your existing experiment or subscription first."
        case .invalidInput(let message): return message
        case .backend: return "The server did not confirm this change. Check your connection and refresh your records before trying again to avoid duplicates."
        case .partialDeletion: return "Your synced app data was deleted, but Clerk could not delete your identity. No new records can be saved. Retry account deletion to finish, or contact support. Store subscriptions are not cancelled by account deletion."
        }
    }
}

@MainActor
final class ClerkTokenProvider: AuthProvider {
    typealias T = String
    private let sessionID: String
    private var callback: (@Sendable (String?) -> Void)?
    private var valid = true

    init(sessionID: String) { self.sessionID = sessionID }

    func login(onIdToken: @Sendable @escaping (String?) -> Void) async throws -> String {
        try await loginFromCache(onIdToken: onIdToken)
    }

    func loginFromCache(onIdToken: @Sendable @escaping (String?) -> Void) async throws -> String {
        callback = onIdToken
        do {
            guard valid, Clerk.shared.isLoaded, let session = Clerk.shared.session,
                  session.id == sessionID, session.status == .active else { throw NativeError.authentication }
            guard let token = try await session.getToken(.init(template: "convex", expirationBuffer: 20, skipCache: true)),
                  valid, Clerk.shared.session?.id == sessionID,
                  Clerk.shared.session?.status == .active else { throw NativeError.authentication }
            try Task.checkCancellation()
            return token
        } catch {
            onIdToken(nil)
            throw NativeError.authentication
        }
    }

    nonisolated func extractIdToken(from authResult: String) -> String { authResult }

    func logout() async throws { invalidate() }

    func invalidate() {
        valid = false
        callback?(nil)
        callback = nil
    }
}
