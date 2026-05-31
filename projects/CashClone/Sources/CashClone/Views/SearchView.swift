import SwiftUI

struct SearchView: View {
    @State private var query = ""

    private let suggestions = [
        ("person.crop.circle", "Find friends", "Search by name or $cashtag"),
        ("qrcode", "Scan to pay", "Pay someone nearby"),
        ("building.columns", "Businesses", "Discover local spots"),
        ("gift", "Offers", "Cash Boost rewards"),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(CashTheme.subtleText)
                        TextField("Search", text: $query)
                    }
                    .padding()
                    .background(CashTheme.cardBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal, 20)

                    VStack(spacing: 0) {
                        ForEach(suggestions, id: \.1) { item in
                            HStack(spacing: 14) {
                                Image(systemName: item.0)
                                    .font(.title3)
                                    .frame(width: 36)
                                    .foregroundStyle(CashTheme.green)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(item.1)
                                        .font(.body.weight(.semibold))
                                    Text(item.2)
                                        .font(.caption)
                                        .foregroundStyle(CashTheme.subtleText)
                                }
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundStyle(CashTheme.subtleText)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 16)
                            Divider().background(Color.white.opacity(0.08))
                        }
                    }
                }
                .padding(.top, 8)
            }
            .background(CashTheme.darkBg)
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.large)
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    SearchView()
}
