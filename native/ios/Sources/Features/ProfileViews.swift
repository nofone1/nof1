import SwiftUI

struct ProfileView: View {
    @Environment(AppStore.self) private var store
    @State private var showSignOut = false
    @State private var showDeletion = false
    @State private var isSigningOut = false
    @State private var actionError: String?

    private var busy: Bool { store.isMutating || isSigningOut }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("YOUR NOF1").font(.caption.weight(.semibold)).tracking(2).foregroundStyle(ProfilePalette.accent)
                    Text("Your data. Your decisions.").font(.title2.weight(.semibold))
                    Text("Manage your account, understand your access, and review the information behind your research.")
                        .foregroundStyle(ProfilePalette.secondary)
                }

                ProfileSection(title: "Account") {
                    HStack(alignment: .top, spacing: 16) {
                        Image(systemName: store.isLocal ? "iphone" : "person.crop.circle")
                            .font(.system(size: 30))
                            .foregroundStyle(ProfilePalette.accent)
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 8) {
                            Text(store.isLocal ? "Local workspace" : "Signed-in account").font(.headline)
                            Text(store.isLocal
                                 ? "Stored on this device. Local mode is not a Clerk account and does not sync to the cloud."
                                 : store.connectionMessage)
                                .font(.subheadline).foregroundStyle(ProfilePalette.secondary)
                            if !store.isLocal, let identity = store.identity {
                                Text(identity).font(.caption.monospaced()).textSelection(.enabled)
                                    .foregroundStyle(ProfilePalette.secondary)
                            }
                        }
                    }
                }

                ProfileSection(title: "Nof1 Plus") {
                    subscriptionStatus
                    NavigationLink {
                        SubscriptionStatusView()
                    } label: {
                        Label("Subscription details", systemImage: "creditcard")
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .accessibilityIdentifier("profile.subscription")
                }

                ProfileSection(title: "Your research") {
                    NavigationLink {
                        ExperimentsView()
                    } label: {
                        ProfileNavigationRow(title: "My experiments", subtitle: "Your n-of-1 trials and analysis", icon: "chart.xyaxis.line")
                    }
                    .accessibilityIdentifier("profile.experiments")
                    Divider()
                    NavigationLink {
                        NativeHealthStatusView()
                    } label: {
                        ProfileNavigationRow(title: "Health connections", subtitle: "Unavailable in this native version", icon: "heart.text.square")
                    }
                    .accessibilityIdentifier("profile.health")
                }

                ProfileSection(title: "Native feature availability") {
                    LabeledContent("Profile editing", value: "Unavailable")
                    LabeledContent("Notification settings", value: "Unavailable")
                    LabeledContent("Data & diagnostic exports", value: "Unavailable")
                    Text("These controls are not implemented in this native version. No profile change, reminder, export, or log-clearing action is performed here.")
                        .font(.footnote).foregroundStyle(ProfilePalette.secondary)
                }
                .accessibilityIdentifier("profile.unsupportedFeatures")

                ProfileSection(title: "About & safety") {
                    ForEach(LegalDocument.allCases) { document in
                        NavigationLink {
                            LegalDocumentView(document: document)
                        } label: {
                            ProfileNavigationRow(title: document.title, subtitle: nil, icon: document.icon)
                        }
                        .accessibilityIdentifier("profile.legal.\(document.rawValue)")
                        if document != .medical { Divider() }
                    }
                    Divider()
                    LabeledContent("Version", value: (Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String) ?? "Unavailable")
                        .font(.subheadline).foregroundStyle(ProfilePalette.secondary)
                    Link("Contact support", destination: URL(string: "mailto:anam@revyl.ai")!)
                        .accessibilityIdentifier("profile.support")
                }

                if let error = actionError ?? store.error {
                    Label(error, systemImage: "exclamationmark.triangle")
                        .font(.subheadline).foregroundStyle(ProfilePalette.warning)
                        .accessibilityIdentifier("profile.error")
                }

                VStack(spacing: 16) {
                    Button {
                        showSignOut = true
                    } label: {
                        HStack {
                            if isSigningOut { ProgressView() }
                            Text(store.isLocal ? "Leave local workspace" : "Sign out")
                        }
                        .frame(maxWidth: .infinity).padding(.vertical, 8)
                    }
                    .buttonStyle(.bordered).disabled(busy)
                    .accessibilityIdentifier("profile.signOut")

                    Button(role: .destructive) { showDeletion = true } label: {
                        Text(store.isLocal ? "Delete local data" : "Delete account")
                            .frame(maxWidth: .infinity).padding(.vertical, 8)
                    }
                    .disabled(busy)
                    .accessibilityIdentifier("profile.deleteAccount")
                }
            }
            .padding(20)
        }
        .background(ProfilePalette.background)
        .foregroundStyle(ProfilePalette.text)
        .tint(ProfilePalette.accent)
        .navigationTitle("Profile")
        .confirmationDialog(store.isLocal ? "Leave this local workspace?" : "Sign out of Nof1?", isPresented: $showSignOut, titleVisibility: .visible) {
            Button(store.isLocal ? "Leave local workspace" : "Sign out") {
                Task { await signOut() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This does not delete your data or cancel subscriptions.")
        }
        .sheet(isPresented: $showDeletion) {
            DeleteAccountConfirmationView()
        }
    }

    @ViewBuilder private var subscriptionStatus: some View {
        if store.isLocal {
            Text("Local mode · subscription status unavailable").font(.headline)
            Text("Local mode does not verify a paid entitlement.").font(.subheadline).foregroundStyle(ProfilePalette.secondary)
        } else if let access = store.access {
            Text(access.hasPlus ? "Nof1 Plus" : "Free plan").font(.headline)
            Text("Status reported by your account’s billing service.").font(.subheadline).foregroundStyle(ProfilePalette.secondary)
        } else {
            Text("Subscription status unavailable").font(.headline)
            Text("Your current entitlement has not been verified. This does not mean you have a free plan.")
                .font(.subheadline).foregroundStyle(ProfilePalette.secondary)
        }
    }

    @MainActor private func signOut() async {
        guard !busy else { return }
        isSigningOut = true
        actionError = nil
        defer { isSigningOut = false }
        do {
            try await store.signOut()
        } catch {
            actionError = "Could not sign out: \(error.localizedDescription)"
        }
    }
}

struct SubscriptionStatusView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                ProfileSection(title: "Verified account access") {
                    if store.isLocal {
                        Text("Unavailable in local mode").font(.title3.weight(.semibold))
                        Text("This workspace cannot establish whether you have Nof1 Plus. A local session never represents a paid subscription.")
                    } else if let access = store.access {
                        Text(access.hasPlus ? "Nof1 Plus" : "Free plan").font(.title3.weight(.semibold))
                        LabeledContent("Provider", value: access.primarySource ?? "Not reported")
                        LabeledContent("Access expires", value: access.expiresAt ?? "Not reported")
                        LabeledContent("Grace period", value: access.inGracePeriod ? "Yes" : "No")
                        if access.inGracePeriod {
                            Text("Access is in a billing grace period. Review payment status with the provider that processed your purchase.")
                                .foregroundStyle(ProfilePalette.warning)
                        }
                        if access.hasMultipleActiveProviders {
                            Label("Multiple active providers reported. Review your subscriptions to avoid duplicate charges.", systemImage: "exclamationmark.triangle")
                                .foregroundStyle(ProfilePalette.warning)
                        }
                        Text("This status comes from the account billing service, not a locally simulated purchase.")
                            .font(.footnote).foregroundStyle(ProfilePalette.secondary)
                    } else {
                        Text("Status unavailable").font(.title3.weight(.semibold))
                        Text("The billing service has not supplied your current entitlement. No plan or purchase is being assumed.")
                    }
                }
                ProfileSection(title: "Native billing availability") {
                    Text("RevenueCat purchases and restores, and Whop membership connection and management, are not integrated in this native version.")
                    Text("There is no in-app purchase or restore flow here. To manage or cancel an existing subscription, use the store or provider where you purchased it.")
                    Text("Deleting your Nof1 account or this app does not cancel an App Store, Google Play, or Whop subscription.")
                        .foregroundStyle(ProfilePalette.warning)
                    Link("Manage Apple subscriptions", destination: URL(string: "https://apps.apple.com/account/subscriptions")!)
                    NavigationLink("Read subscription terms") { LegalDocumentView(document: .terms) }
                }
                if let error = store.error {
                    Text(error).foregroundStyle(ProfilePalette.warning)
                }
            }
            .padding(20)
        }
        .background(ProfilePalette.background).foregroundStyle(ProfilePalette.text).tint(ProfilePalette.accent)
        .navigationTitle("Subscription").navigationBarTitleDisplayMode(.inline)
        .accessibilityIdentifier("subscription.status")
    }
}

private struct NativeHealthStatusView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Image(systemName: "heart.text.square").font(.system(size: 48)).foregroundStyle(ProfilePalette.accent).accessibilityHidden(true)
                Text("Health connections aren’t available yet.").font(.title2.weight(.semibold))
                Text("Apple Health, Google Fit, and Terra are not connected through this native version. It does not request health permissions, import health records, or claim an active connection.")
                    .foregroundStyle(ProfilePalette.secondary)
                Text("You can still record your observations manually in your experiments. Connections previously made outside this version are not managed here.")
                    .foregroundStyle(ProfilePalette.secondary)
                NavigationLink("How health information is handled") { LegalDocumentView(document: .privacy) }
            }
            .padding(24)
        }
        .background(ProfilePalette.background).foregroundStyle(ProfilePalette.text).tint(ProfilePalette.accent)
        .navigationTitle("Health connections").navigationBarTitleDisplayMode(.inline)
        .accessibilityIdentifier("health.unavailable")
    }
}

private struct DeleteAccountConfirmationView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var confirmation = ""
    @State private var showFinalConfirmation = false
    @State private var isDeleting = false
    @State private var deletionError: String?

    private var busy: Bool { isDeleting || store.isMutating }

    var body: some View {
        NavigationStack {
            Form {
                Section("Before you continue") {
                    Text(store.isLocal ? "This permanently clears this local workspace’s data on this device. It does not delete a Clerk account or cloud data."
                         : "This permanently deletes your app-owned cloud records, including experiments, protocols, tracking data, stack items, and billing-access links, then deletes your Clerk account and clears local app data.")
                    Text("This cannot be undone. Payment processors and app stores may retain transaction records when legally required.")
                    Text("Deleting your account does not cancel any App Store, Google Play, or Whop subscription. Cancel subscriptions separately with the provider where you purchased them.")
                        .foregroundStyle(ProfilePalette.warning)
                }
                Section("Type DELETE to continue") {
                    TextField("DELETE", text: $confirmation)
                        .textInputAutocapitalization(.characters).autocorrectionDisabled()
                        .accessibilityLabel("Type DELETE to confirm deletion")
                        .accessibilityIdentifier("accountDeletion.confirmation")
                        .disabled(busy)
                }
                if let deletionError {
                    Section("Deletion did not complete") {
                        Text(deletionError).foregroundStyle(ProfilePalette.warning)
                        Text("If the issue persists, contact anam@revyl.ai. Some data may already have been removed if deletion failed partway through.")
                    }
                }
                Section {
                    Button(role: .destructive) { showFinalConfirmation = true } label: {
                        HStack {
                            if isDeleting { ProgressView() }
                            Text(isDeleting ? "Deleting…" : "Continue to final confirmation")
                        }
                    }
                    .disabled(confirmation != "DELETE" || busy)
                    .accessibilityIdentifier("accountDeletion.continue")
                }
            }
            .scrollContentBackground(.hidden).background(ProfilePalette.background)
            .foregroundStyle(ProfilePalette.text).tint(ProfilePalette.accent)
            .navigationTitle(store.isLocal ? "Delete local data" : "Delete account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.disabled(busy)
                }
            }
            .alert("Final confirmation", isPresented: $showFinalConfirmation) {
                Button("Keep my data", role: .cancel) {}
                Button("Delete permanently", role: .destructive) {
                    Task { await deleteAccount() }
                }
                .accessibilityIdentifier("accountDeletion.finalDelete")
            } message: {
                Text(store.isLocal ? "Permanently remove this device’s local workspace data? This cannot be undone."
                     : "Permanently remove your Nof1 data and account? This cannot be undone and will not cancel subscriptions.")
            }
        }
        .interactiveDismissDisabled(busy)
    }

    @MainActor private func deleteAccount() async {
        guard confirmation == "DELETE", !busy else { return }
        isDeleting = true
        deletionError = nil
        defer { isDeleting = false }
        do {
            try await store.deleteAccount()
            dismiss()
        } catch {
            deletionError = error.localizedDescription
        }
    }
}

enum LegalDocument: String, CaseIterable, Identifiable {
    case privacy, terms, medical

    var id: String { rawValue }
    var title: String {
        switch self {
        case .privacy: "Privacy Policy"
        case .terms: "Terms of Service"
        case .medical: "Medical Safety"
        }
    }
    var icon: String {
        switch self {
        case .privacy: "hand.raised"
        case .terms: "doc.text"
        case .medical: "cross.case"
        }
    }

    var sections: [(heading: String, body: String)] {
        switch self {
        case .privacy:
            [
                ("Information we collect", "We process account information such as your name, email address, and account identifier; content you choose to enter such as experiments, protocols, dose logs, metrics, notes, schedules, and stack items; subscription identifiers and entitlement status; and technical information needed to secure, operate, and troubleshoot the app. If you connect a health service, the app may process the health and activity information you authorize that service to provide."),
                ("How we use information", "We use this information to provide account sync, tracking, analysis, reminders, subscription access, support, security, and product reliability. We do not sell personal information or use health information for advertising."),
                ("Service providers", "We use service providers to operate the app, including Clerk for authentication, Convex for synced application data, RevenueCat and Apple or Google for in-app subscriptions, Whop for connected web memberships, and Terra or the health platform you choose for optional health connections. Each provider processes information under its own terms and privacy commitments."),
                ("Storage and retention", "Some settings and cached records are stored on your device. Signed-in experiment, protocol, tracking, and billing-access records can be stored in our cloud systems so they sync across devices. We retain information while your account is active and as reasonably necessary for security, legal, tax, dispute, and transaction-record obligations."),
                ("Your choices and deletion", "You can disconnect optional health or Whop connections and delete individual records in the app. You can permanently delete your Nof1 account from Profile. Account deletion removes app-owned cloud records and local app data; payment processors and app stores may retain transaction records when legally required."),
                ("Security and age", "We use reasonable safeguards, but no storage or transmission system is completely secure. Nof1 is intended only for adults age 18 or older and is not directed to children."),
                ("Contact", "Questions or privacy requests can be sent to anam@revyl.ai.")
            ]
        case .terms:
            [
                ("Eligibility and acceptance", "You must be at least 18 years old to use Nof1. By creating an account or using the app, you agree to these Terms and the Privacy Policy."),
                ("Educational tracking tool", "Nof1 is an informational and self-tracking tool. It is not a medical device, healthcare provider, pharmacy, or substitute for professional medical judgment. The app does not diagnose, treat, cure, or prevent any disease and does not prescribe a dose, treatment, or course of action."),
                ("Medical decisions", "Consult a qualified healthcare professional before using any medication, supplement, peptide, research compound, protocol, calculation, or health intervention. Do not use app content to delay or replace medical care. For an emergency, contact local emergency services."),
                ("Subscriptions", "Nof1 Plus is offered at a target U.S. price of $9.99 per month or $79.99 per year. Your store displays and confirms the final localized price before purchase. Subscriptions renew automatically unless cancelled through the store account that processed the purchase. Deleting the app or your Nof1 account does not automatically cancel a subscription."),
                ("Your content and conduct", "You are responsible for the accuracy of information you enter and for maintaining the security of your account. You may use the app only lawfully and may not interfere with its operation, attempt unauthorized access, or misuse another person's information."),
                ("Availability and disclaimers", "The app and its content are provided on an as-available basis. Research summaries, estimates, calculations, and external-source information may be incomplete, outdated, or inaccurate. To the extent permitted by law, we disclaim implied warranties and liability for decisions made from app content."),
                ("Changes and contact", "We may update the service or these Terms and will identify material revisions by a new effective date. Questions can be sent to anam@revyl.ai.")
            ]
        case .medical:
            [
                ("Not medical advice", "Nof1 is an educational tracking application, not a medical device. It does not diagnose, treat, cure, prevent, monitor, or prescribe for any disease or condition. Information in the app is general and is not personalized medical advice."),
                ("Research compounds", "Some compounds described in the app may be investigational, unapproved for human use, prohibited in sport, or supported mainly by animal or early-stage research. Inclusion in the library is not a recommendation to obtain or use them."),
                ("Doses and calculations", "Any dose, timing, concentration, reconstitution, pharmacokinetic, or protocol information is an educational estimate and can be wrong. Never prepare, inject, ingest, stop, or change a substance based only on this app. Confirm the exact product, concentration, route, interactions, contraindications, and instructions with a licensed clinician and pharmacist."),
                ("Get professional help", "Talk with a qualified healthcare professional before beginning or changing any intervention, especially if you are pregnant, nursing, under medical care, taking medication, or managing a health condition. Contact local emergency services or poison control for urgent concerns.")
            ]
        }
    }
}

struct LegalDocumentView: View {
    let document: LegalDocument

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Last updated August 23, 2026").font(.subheadline).foregroundStyle(ProfilePalette.secondary)
                ForEach(document.sections, id: \.heading) { section in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(section.heading).font(.headline).accessibilityAddTraits(.isHeader)
                        Text(section.body).lineSpacing(5).foregroundStyle(ProfilePalette.secondary)
                    }
                }
            }
            .padding(24).textSelection(.enabled)
        }
        .background(ProfilePalette.background).foregroundStyle(ProfilePalette.text)
        .navigationTitle(document.title).navigationBarTitleDisplayMode(.inline)
        .accessibilityIdentifier("legal.\(document.rawValue)")
    }
}

private struct ProfileNavigationRow: View {
    let title: String
    let subtitle: String?
    let icon: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon).foregroundStyle(ProfilePalette.accent).frame(width: 24).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).foregroundStyle(ProfilePalette.text)
                if let subtitle { Text(subtitle).font(.caption).foregroundStyle(ProfilePalette.secondary) }
            }
            Spacer(minLength: 8)
            Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(ProfilePalette.secondary).accessibilityHidden(true)
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
    }
}

private struct ProfileSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title.uppercased()).font(.caption.weight(.semibold)).tracking(1.5)
                .foregroundStyle(ProfilePalette.secondary).accessibilityAddTraits(.isHeader)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(ProfilePalette.surface, in: RoundedRectangle(cornerRadius: 20))
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(.white.opacity(0.06), lineWidth: 1))
    }
}

private enum ProfilePalette {
    static let background = Theme.background
    static let surface = Theme.surface
    static let accent = Theme.accent
    static let text = Theme.text
    static let secondary = Theme.muted
    static let warning = Color(red: 212 / 255, green: 160 / 255, blue: 74 / 255)
}
