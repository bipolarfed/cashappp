import SwiftUI

struct TransactionRow: View {
    let transaction: Transaction

    private var formattedAmount: String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "USD"
        let str = f.string(from: transaction.amount as NSDecimalNumber) ?? "$0"
        return transaction.isIncoming ? "+\(str)" : "-\(str)"
    }

    private var formattedDate: String {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .abbreviated
        return f.localizedString(for: transaction.date, relativeTo: .now)
    }

    var body: some View {
        HStack(spacing: 14) {
            Circle()
                .fill(transaction.isIncoming ? CashTheme.green.opacity(0.2) : Color.white.opacity(0.1))
                .frame(width: 44, height: 44)
                .overlay {
                    Image(systemName: transaction.isIncoming ? "arrow.down.left" : "arrow.up.right")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(transaction.isIncoming ? CashTheme.green : .white)
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(transaction.name)
                    .font(.body.weight(.semibold))
                Text(transaction.note)
                    .font(.caption)
                    .foregroundStyle(CashTheme.subtleText)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                Text(formattedAmount)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(transaction.isIncoming ? CashTheme.green : .white)
                Text(formattedDate)
                    .font(.caption2)
                    .foregroundStyle(CashTheme.subtleText)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }
}

#Preview {
    TransactionRow(transaction: Transaction.sampleData[0])
        .preferredColorScheme(.dark)
        .background(CashTheme.darkBg)
}
