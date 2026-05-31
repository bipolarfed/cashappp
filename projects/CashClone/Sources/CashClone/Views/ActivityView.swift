import SwiftUI

struct ActivityView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(appState.transactions) { tx in
                        TransactionRow(transaction: tx)
                        Divider().background(Color.white.opacity(0.08))
                    }
                }
                .padding(.top, 8)
            }
            .background(CashTheme.darkBg)
            .navigationTitle("Activity")
            .navigationBarTitleDisplayMode(.large)
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ActivityView()
        .environmentObject(AppState())
}
