import SwiftUI

struct MoneyView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    balanceCard
                    savingsCard
                    bitcoinCard
                    stocksCard
                }
                .padding(20)
            }
            .background(CashTheme.darkBg)
            .navigationTitle("Money")
            .navigationBarTitleDisplayMode(.large)
        }
        .preferredColorScheme(.dark)
    }

    private var balanceCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Cash Balance")
                .font(.subheadline)
                .foregroundStyle(CashTheme.subtleText)
            Text(appState.formattedBalance)
                .font(.system(size: 40, weight: .bold, design: .rounded))
            HStack(spacing: 12) {
                moneyActionButton(title: "Add Cash", icon: "plus")
                moneyActionButton(title: "Cash Out", icon: "arrow.up")
            }
            .padding(.top, 8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(CashTheme.cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var savingsCard: some View {
        MoneyFeatureCard(
            title: "Savings",
            subtitle: "Earn 4.50% APY",
            amount: "$0.00",
            icon: "banknote.fill",
            tint: .blue
        )
    }

    private var bitcoinCard: some View {
        MoneyFeatureCard(
            title: "Bitcoin",
            subtitle: "▲ 2.4% today",
            amount: "$0.00",
            icon: "bitcoinsign.circle.fill",
            tint: .orange
        )
    }

    private var stocksCard: some View {
        MoneyFeatureCard(
            title: "Stocks",
            subtitle: "Start investing",
            amount: "$0.00",
            icon: "chart.line.uptrend.xyaxis",
            tint: CashTheme.green
        )
    }

    private func moneyActionButton(title: String, icon: String) -> some View {
        Button {} label: {
            HStack {
                Image(systemName: icon)
                Text(title)
            }
            .font(.subheadline.weight(.semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.white.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
    }
}

struct MoneyFeatureCard: View {
    let title: String
    let subtitle: String
    let amount: String
    let icon: String
    let tint: Color

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(CashTheme.subtleText)
                Text(amount)
                    .font(.title2.bold())
                    .padding(.top, 4)
            }
            Spacer()
            Image(systemName: icon)
                .font(.system(size: 36))
                .foregroundStyle(tint)
        }
        .padding(20)
        .background(CashTheme.cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    MoneyView()
        .environmentObject(AppState())
}
