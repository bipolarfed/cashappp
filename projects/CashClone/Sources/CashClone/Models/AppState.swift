import Foundation
import SwiftUI

enum CashTab: String, CaseIterable {
    case home, activity, money, search

    var icon: String {
        switch self {
        case .home: return "dollarsign"
        case .activity: return "clock"
        case .money: return "banknote"
        case .search: return "magnifyingglass"
        }
    }

    var label: String {
        switch self {
        case .home: return "Home"
        case .activity: return "Activity"
        case .money: return "Money"
        case .search: return "Search"
        }
    }
}

struct Transaction: Identifiable, Equatable {
    let id: UUID
    let name: String
    let note: String
    let amount: Decimal
    let isIncoming: Bool
    let date: Date

    init(id: UUID = UUID(), name: String, note: String, amount: Decimal, isIncoming: Bool, date: Date = .now) {
        self.id = id
        self.name = name
        self.note = note
        self.amount = amount
        self.isIncoming = isIncoming
        self.date = date
    }
}

@MainActor
final class AppState: ObservableObject {
    @Published var balance: Decimal = 1_247.83
    @Published var cashtag: String = "$yourname"
    @Published var transactions: [Transaction] = Transaction.sampleData
    @Published var showProfile = false
    @Published var pendingPayment: PaymentDraft?

    struct PaymentDraft: Identifiable {
        let id = UUID()
        let amount: Decimal
        let isRequest: Bool
    }

    var formattedBalance: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: balance as NSDecimalNumber) ?? "$0.00"
    }

    func submitPayment(amount: Decimal, recipient: String, note: String, isRequest: Bool) {
        let tx = Transaction(
            name: recipient.isEmpty ? (isRequest ? "Payment Request" : "Payment") : recipient,
            note: note.isEmpty ? (isRequest ? "You requested" : "You paid") : note,
            amount: amount,
            isIncoming: isRequest
        )
        transactions.insert(tx, at: 0)
        if !isRequest {
            balance -= amount
        }
        pendingPayment = nil
    }
}

extension Transaction {
    static let sampleData: [Transaction] = [
        Transaction(name: "Coffee Shop", note: "Morning latte", amount: 5.75, isIncoming: false, date: .now.addingTimeInterval(-3600)),
        Transaction(name: "Alex M.", note: "Dinner split", amount: 32.00, isIncoming: true, date: .now.addingTimeInterval(-86400)),
        Transaction(name: "Direct Deposit", note: "Payroll", amount: 850.00, isIncoming: true, date: .now.addingTimeInterval(-172800)),
        Transaction(name: "Spotify", note: "Subscription", amount: 10.99, isIncoming: false, date: .now.addingTimeInterval(-259200)),
        Transaction(name: "Jordan K.", note: "Concert tickets", amount: 45.00, isIncoming: false, date: .now.addingTimeInterval(-432000)),
    ]
}
