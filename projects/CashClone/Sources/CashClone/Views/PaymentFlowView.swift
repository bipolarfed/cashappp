import SwiftUI

struct PaymentFlowView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss

    let amount: Decimal
    let isRequest: Bool

    @State private var recipient = ""
    @State private var note = ""
    @State private var sent = false

    private var formattedAmount: String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "USD"
        return f.string(from: amount as NSDecimalNumber) ?? "$0"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                CashTheme.darkBg.ignoresSafeArea()

                if sent {
                    successView
                } else {
                    formView
                }
            }
            .navigationTitle(isRequest ? "Request" : "Pay")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }

    private var formView: some View {
        VStack(spacing: 24) {
            Text(formattedAmount)
                .font(.system(size: 56, weight: .bold, design: .rounded))
                .foregroundStyle(CashTheme.green)
                .padding(.top, 32)

            VStack(spacing: 16) {
                CashTextField(icon: "at", placeholder: "Cashtag, phone, or email", text: $recipient)
                CashTextField(icon: "text.alignleft", placeholder: "For (optional)", text: $note)
            }
            .padding(.horizontal, 24)

            Spacer()

            Button {
                withAnimation(.spring()) {
                    appState.submitPayment(
                        amount: amount,
                        recipient: recipient,
                        note: note,
                        isRequest: isRequest
                    )
                    sent = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    dismiss()
                }
            } label: {
                Text(isRequest ? "Request \(formattedAmount)" : "Pay \(formattedAmount)")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(recipient.isEmpty ? Color.gray : CashTheme.green)
                    .foregroundStyle(.white)
                    .clipShape(.capsule)
            }
            .disabled(recipient.isEmpty)
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }

    private var successView: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(CashTheme.green)
            Text(isRequest ? "Request Sent!" : "Payment Sent!")
                .font(.title2.bold())
            Text(formattedAmount)
                .font(.title.bold())
                .foregroundStyle(CashTheme.subtleText)
        }
    }
}

struct CashTextField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(CashTheme.subtleText)
                .frame(width: 24)
            TextField(placeholder, text: $text)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
        .padding()
        .background(CashTheme.cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    PaymentFlowView(amount: 25, isRequest: false)
        .environmentObject(AppState())
        .preferredColorScheme(.dark)
}
