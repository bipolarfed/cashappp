//
//  NumpadViewModel.swift
//  Adapted from CashApp Numpad SwiftUI by @txmasbo
//  https://github.com/txmasb/cashapp-numpad-swiftui
//

import Foundation
import SwiftUI

class NumpadViewModel: ObservableObject {

    @Published var inputArray: [String] = []
    @Published var currency = "$"
    @Published var isValid = false
    @Published var shake = false

    var input: String {
        inputArray.joined()
    }

    var displayArray: [String] {
        inputArray.isEmpty ? ["0"] : inputArray
    }

    var arrayScale: CGFloat {
        max(0.8, 1 - CGFloat(inputArray.count) * 0.04)
    }

    var amountDecimal: Decimal {
        let cents = inputArray.isEmpty ? 0 : Int(input) ?? 0
        return Decimal(cents) / 100
    }

    var formattedAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: amountDecimal as NSDecimalNumber) ?? "$0"
    }

    var hasAmount: Bool {
        amountDecimal > 0
    }

    func handleKeyPress(_ keyType: KeyType) {
        switch keyType {
        case .number(let number):
            if inputArray.count >= 7 || (number == 0 && inputArray.isEmpty) {
                triggerErrorFeedback()
                return
            }
            inputArray.append(String(number))

        case .delete:
            guard !inputArray.isEmpty else {
                triggerErrorFeedback()
                return
            }
            inputArray.removeLast()

        case .dot:
            triggerErrorFeedback()
        }
    }

    func reset() {
        inputArray = []
    }

    private func triggerErrorFeedback() {
        shake.toggle()
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }
}
