import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @Binding var selectedTab: CashTab
    @State private var showPayment = false
    @State private var isRequestFlow = false
    @State private var paymentAmount: Decimal = 0

    var body: some View {
        NumpadView(
            onPay: { amount in
                paymentAmount = amount
                isRequestFlow = false
                showPayment = true
            },
            onRequest: { amount in
                paymentAmount = amount
                isRequestFlow = true
                showPayment = true
            },
            onProfileTap: { appState.showProfile = true },
            onActivityTap: { selectedTab = .activity }
        )
        .sheet(isPresented: $showPayment) {
            PaymentFlowView(amount: paymentAmount, isRequest: isRequestFlow)
        }
        .sheet(isPresented: $appState.showProfile) {
            ProfileSheet()
        }
    }
}

#Preview {
    HomeView(selectedTab: .constant(.home))
        .environmentObject(AppState())
}
