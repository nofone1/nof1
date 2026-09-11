import ClerkKit
import ClerkKitUI
import SwiftUI

@main
struct Nof1NativeApp: App {
    @State private var store: AppStore
    private let configuration: AppConfiguration

    init() {
        let configuration = AppConfiguration()
        self.configuration = configuration
        _store = State(initialValue: AppStore(configuration: configuration))
        if configuration.mode == .cloud, configuration.error == nil {
            Clerk.configure(publishableKey: configuration.clerkPublishableKey, options: .init(telemetryEnabled: false))
        }
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if let error = configuration.error {
                    EmptyState(title: "Build configuration required", message: error, systemImage: "gear.badge.exclamationmark")
                        .padding()
                } else if configuration.mode == .localDemo {
                    LocalRootView()
                } else {
                    CloudRootView().environment(Clerk.shared)
                }
            }
            .environment(store)
            .tint(Theme.accent)
            .preferredColorScheme(.dark)
            .background(Theme.background)
        }
    }
}

private struct LocalRootView: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        if store.identity != nil {
            MainTabsView().id(store.identity)
        } else {
            WelcomeView(subtitle: "Local development mode", explanation: "This explicitly configured build saves synthetic tracking data on this device only. It does not authenticate, sync to Convex, or grant a paid subscription.", buttonTitle: "Enter local demo") {
                store.startLocal()
            }
        }
    }
}

private struct CloudRootView: View {
    @Environment(Clerk.self) private var clerk
    @Environment(AppStore.self) private var store
    @State private var presentAuth = false
    @State private var loadingTimedOut = false
    @State private var authError: String?
    @State private var isRetrying = false

    private var sessionKey: String {
        "\(clerk.isLoaded)-\(clerk.session?.id ?? "none")-\(clerk.session?.status.rawValue ?? "none")-\(clerk.user?.id ?? "none")"
    }

    var body: some View {
        Group {
            if !clerk.isLoaded {
                VStack(spacing: 20) {
                    ProgressView("Loading secure authentication…")
                    if loadingTimedOut {
                        Text(authError ?? "Authentication is taking longer than expected. Check your connection and this app's Clerk Native API configuration.")
                            .foregroundStyle(Theme.muted)
                        Button("Retry authentication") { Task { await retryAuthentication() } }
                            .disabled(isRetrying)
                            .accessibilityIdentifier("auth.retry")
                    }
                }.padding(24)
                    .task {
                        try? await Task.sleep(for: .seconds(15))
                        guard !Task.isCancelled else { return }
                        loadingTimedOut = true
                    }
            } else if let user = clerk.user, let session = clerk.session, session.status == .active {
                if store.matchesSession(userID: user.id, sessionID: session.id) {
                    MainTabsView().id(session.id)
                } else {
                    ProgressView("Switching to your account…")
                        .accessibilityIdentifier("auth.switchingAccount")
                }
            } else {
                WelcomeView(subtitle: "One person. Better evidence.", explanation: "Track your daily stack, build thoughtful protocols, and learn from your own experiments. Your cloud records stay tied to your secure account.", buttonTitle: "Sign in or create an account") {
                    presentAuth = true
                }
                .sheet(isPresented: $presentAuth) { AuthView() }
            }
        }
        .task(id: sessionKey) {
            let active = clerk.isLoaded && clerk.session?.status == .active
            await store.connect(userID: active ? clerk.user?.id : nil, sessionID: active ? clerk.session?.id : nil)
            if active { presentAuth = false }
        }
    }

    private func retryAuthentication() async {
        isRetrying = true
        defer { isRetrying = false }
        do {
            _ = try await clerk.refreshEnvironment()
            _ = try await clerk.refreshClient()
            authError = nil
        } catch {
            authError = "Authentication is unavailable. Verify your network and Clerk Native API configuration, then try again."
        }
    }
}

private struct WelcomeView: View {
    let subtitle: String
    let explanation: String
    let buttonTitle: String
    let action: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 26) {
                Image(systemName: "waveform.path.ecg")
                    .font(.system(size: 52, weight: .light))
                    .foregroundStyle(Theme.accent)
                    .accessibilityHidden(true)
                Text("Nof1").font(.system(size: 54, weight: .bold, design: .rounded))
                Text(subtitle).font(.title2.weight(.semibold))
                Text(explanation).font(.body).foregroundStyle(Theme.muted)
                Button(buttonTitle, action: action)
                    .buttonStyle(.borderedProminent).controlSize(.large)
                    .accessibilityIdentifier("auth.continue")
                Text("An educational self-tracking tool. Not medical advice. For adults 18 and older.")
                    .font(.footnote).foregroundStyle(Theme.muted)
            }.frame(maxWidth: 540, alignment: .leading).padding(32).padding(.top, 64)
        }.frame(maxWidth: .infinity).background(Theme.background)
    }
}

struct MainTabsView: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        VStack(spacing: 0) {
            if store.isLocal || store.isLoading || store.error != nil {
                VStack(alignment: .leading, spacing: 6) {
                    if store.isLocal {
                        Label("LOCAL DEVELOPMENT · DEVICE ONLY", systemImage: "externaldrive")
                            .font(.caption2.weight(.bold)).foregroundStyle(Theme.accent)
                            .accessibilityIdentifier("mode.local-demo")
                    }
                    if store.isLoading {
                        HStack { ProgressView(); Text(store.connectionMessage).font(.caption) }
                    }
                    if let error = store.error {
                        HStack(alignment: .top) {
                            Image(systemName: "exclamationmark.triangle")
                            Text(error).font(.caption)
                            Spacer(minLength: 4)
                            Button("Reconnect") { Task { await store.refresh() } }
                                .font(.caption.weight(.semibold)).disabled(store.isMutating)
                                .accessibilityIdentifier("sync.retry")
                        }.foregroundStyle(.orange)
                    }
                }
                .padding(.horizontal, 16).padding(.vertical, 8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .fixedSize(horizontal: false, vertical: true)
                .background(Theme.surface)
            }
            TabView {
                NavigationStack { TodayView() }
                    .tabItem { Label("Today", systemImage: "sun.max") }.accessibilityIdentifier("tab.today")
                NavigationStack { CatalogView() }
                    .tabItem { Label("Peptides", systemImage: "flask") }.accessibilityIdentifier("tab.peptides")
                NavigationStack { QuickLogView() }
                    .tabItem { Label("Log", systemImage: "plus.circle") }.accessibilityIdentifier("tab.log")
                NavigationStack { ProtocolsView() }
                    .tabItem { Label("Protocols", systemImage: "list.clipboard") }.accessibilityIdentifier("tab.protocols")
                NavigationStack { ProfileView() }
                    .tabItem { Label("Profile", systemImage: "person.crop.circle") }.accessibilityIdentifier("tab.profile")
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .background(Theme.background)
    }
}
