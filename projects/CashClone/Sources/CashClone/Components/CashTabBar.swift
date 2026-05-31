import SwiftUI

struct CashTabBar: View {
    @Binding var selectedTab: CashTab

    var body: some View {
        HStack {
            ForEach(CashTab.allCases.filter { $0 != .home }, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = tab
                    }
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 22, weight: selectedTab == tab ? .bold : .regular))
                        Text(tab.label)
                            .font(.caption2)
                    }
                    .foregroundStyle(selectedTab == tab ? .white : CashTheme.subtleText)
                    .frame(maxWidth: .infinity)
                }
            }

            Button {
                selectedTab = .home
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: "dollarsign")
                        .font(.system(size: 22, weight: .bold))
                    Text("Pay")
                        .font(.caption2)
                }
                .foregroundStyle(CashTheme.green)
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.top, 10)
        .padding(.bottom, 24)
        .background(CashTheme.darkBg)
    }
}

#Preview {
    CashTabBar(selectedTab: .constant(.activity))
        .preferredColorScheme(.dark)
}
