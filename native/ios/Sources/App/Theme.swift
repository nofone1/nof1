import SwiftUI

enum Theme {
    static let background = Color(red: 10 / 255, green: 11 / 255, blue: 15 / 255)
    static let surface = Color(red: 20 / 255, green: 21 / 255, blue: 26 / 255)
    static let accent = Color(red: 91 / 255, green: 138 / 255, blue: 114 / 255)
    static let secondary = Color(red: 139 / 255, green: 92 / 255, blue: 246 / 255)
    static let text = Color(red: 234 / 255, green: 234 / 255, blue: 234 / 255)
    static let muted = Color(red: 154 / 255, green: 154 / 255, blue: 154 / 255)
}

struct AppCard<Content: View>: View {
    let title: String?
    @ViewBuilder let content: () -> Content

    init(title: String? = nil, @ViewBuilder content: @escaping () -> Content) {
        self.title = title
        self.content = content
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let title { Text(title).font(.headline) }
            content()
        }.frame(maxWidth: .infinity, alignment: .leading)
            .padding(18).background(Theme.surface, in: RoundedRectangle(cornerRadius: 18))
    }
}

struct EmptyState: View {
    let title: String
    let message: String
    let systemImage: String
    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: systemImage).font(.largeTitle).foregroundStyle(Theme.accent).accessibilityHidden(true)
            Text(title).font(.title3.weight(.semibold))
            Text(message).font(.body).foregroundStyle(Theme.muted).multilineTextAlignment(.center)
        }.frame(maxWidth: .infinity).padding(28)
    }
}

struct SaveButton: View {
    var title = "Save"
    let isSaving: Bool
    let disabled: Bool
    let action: () async -> Void
    var body: some View {
        Button { Task { await action() } } label: {
            HStack {
                if isSaving { ProgressView() }
                Text(isSaving ? "Saving…" : title)
            }.frame(maxWidth: .infinity)
        }.buttonStyle(.borderedProminent).controlSize(.large)
            .disabled(disabled || isSaving).accessibilityIdentifier("form.save")
    }
}
