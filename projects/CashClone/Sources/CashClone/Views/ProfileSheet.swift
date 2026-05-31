import SwiftUI

struct ProfileSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 16) {
                        Circle()
                            .fill(CashTheme.green.opacity(0.3))
                            .frame(width: 64, height: 64)
                            .overlay {
                                Text(String(appState.cashtag.dropFirst().prefix(1)).uppercased())
                                    .font(.title.bold())
                                    .foregroundStyle(CashTheme.green)
                            }
                        VStack(alignment: .leading) {
                            Text(appState.cashtag)
                                .font(.title2.bold())
                            Text("Personal Account")
                                .font(.caption)
                                .foregroundStyle(CashTheme.subtleText)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section("Account") {
                    profileRow(icon: "person", title: "Personal Info")
                    profileRow(icon: "lock", title: "Security")
                    profileRow(icon: "bell", title: "Notifications")
                }

                Section("Support") {
                    profileRow(icon: "questionmark.circle", title: "Help")
                    profileRow(icon: "doc.text", title: "Documents")
                }

                Section {
                    HStack {
                        Text("Balance")
                        Spacer()
                        Text(appState.formattedBalance)
                            .foregroundStyle(CashTheme.green)
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func profileRow(icon: String, title: String) -> some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 28)
                .foregroundStyle(CashTheme.green)
            Text(title)
        }
    }
}

#Preview {
    ProfileSheet()
        .environmentObject(AppState())
}
