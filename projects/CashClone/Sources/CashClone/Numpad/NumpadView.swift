//
//  NumpadView.swift
//  Adapted from CashApp Numpad SwiftUI by @txmasbo
//  https://github.com/txmasb/cashapp-numpad-swiftui
//

import SwiftUI

struct NumpadView: View {

    @StateObject private var viewModel = NumpadViewModel()
    @EnvironmentObject var appState: AppState
    var onPay: (Decimal) -> Void
    var onRequest: (Decimal) -> Void
    var onProfileTap: () -> Void
    var onActivityTap: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            NumpadHeader(onProfileTap: onProfileTap, onActivityTap: onActivityTap)
            Spacer()
            amountDisplay
            Spacer()
            CurrencySelector()
            CustomNumpad(viewModel: viewModel)
            BottomActions(
                viewModel: viewModel,
                onPay: { onPay(viewModel.amountDecimal) },
                onRequest: { onRequest(viewModel.amountDecimal) }
            )
        }
        .foregroundStyle(.white)
        .background(CashTheme.green)
    }

    private var amountDisplay: some View {
        HStack(spacing: 0) {
            Text(viewModel.currency)
                .font(.system(size: 96, weight: .semibold))
            ForEach(Array(viewModel.displayArray.enumerated()), id: \.offset) { index, num in
                if viewModel.displayArray.count >= 4 && index == viewModel.displayArray.count - 3 {
                    Text(",")
                        .font(.system(size: 80, weight: .semibold))
                        .transition(.blurReplace.combined(with: .scale))
                        .id(index)
                }
                Text(num)
                    .font(.system(size: 96, weight: .semibold))
                    .zIndex(Double(viewModel.displayArray.count - 1 - index))
                    .transition(
                        .blurReplace.combined(with: .scale).combined(with:
                            .offset(x: viewModel.inputArray.count > 1 ? -32 : 0, y: 12))
                    )
                    .id(num)
            }
        }
        .scaleEffect(viewModel.arrayScale)
        .modifier(ShakeEffect(animatableData: viewModel.shake ? 0 : 1))
        .animation(.easeInOut, value: viewModel.shake)
        .frame(maxWidth: .infinity)
    }
}

struct CustomNumpad: View {

    @ObservedObject var viewModel: NumpadViewModel
    let columns: [GridItem] = Array(repeating: GridItem(.flexible()), count: 3)

    var body: some View {
        VStack {
            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(1..<10) { number in
                    KeyPad(viewModel: viewModel, keyType: .number(number))
                }
                KeyPad(viewModel: viewModel, keyType: .dot)
                KeyPad(viewModel: viewModel, keyType: .number(0))
                KeyPad(viewModel: viewModel, keyType: .delete)
            }
            .padding(.vertical)
        }
    }
}

public struct ShakeEffect: GeometryEffect {
    private let amount: CGFloat = 10
    private let shakesPerUnit: CGFloat = 5
    public var animatableData: CGFloat

    public init(animatableData: CGFloat) {
        self.animatableData = animatableData
    }

    public func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(
            CGAffineTransform(
                translationX: amount * sin(animatableData * .pi * shakesPerUnit),
                y: 0
            )
        )
    }
}

struct BottomButtonLabel: View {
    var title: String
    var enabled: Bool = true

    var body: some View {
        Text(title)
            .font(.system(size: 20, weight: .bold, design: .rounded))
            .frame(height: 52)
            .frame(maxWidth: .infinity)
            .background(.white.opacity(enabled ? 0.25 : 0.12))
            .clipShape(.capsule)
            .opacity(enabled ? 1 : 0.5)
    }
}

struct CurrencySelector: View {
    var body: some View {
        HStack(spacing: 6) {
            Text("USD")
                .fontWeight(.bold)
                .fontDesign(.rounded)
            Image(systemName: "chevron.down")
                .fontWeight(.bold)
                .font(.system(size: 16))
        }
        .padding(.vertical, 10)
        .padding(.leading, 20)
        .padding(.trailing, 12)
        .background(.white.opacity(0.25))
        .clipShape(.capsule)
    }
}

struct NumpadHeader: View {
    var onProfileTap: () -> Void
    var onActivityTap: (() -> Void)?

    var body: some View {
        HStack {
            Button {
                onActivityTap?()
            } label: {
                Image(systemName: "clock")
                    .font(.system(size: 24, weight: .bold))
            }
            Spacer()
            Button(action: onProfileTap) {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 30))
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 28)
    }
}

struct BottomActions: View {

    @ObservedObject var viewModel: NumpadViewModel
    var onPay: () -> Void
    var onRequest: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button {
                guard viewModel.hasAmount else { return }
                onRequest()
            } label: {
                BottomButtonLabel(title: "Request", enabled: viewModel.hasAmount)
            }
            .disabled(!viewModel.hasAmount)

            Button {
                guard viewModel.hasAmount else { return }
                onPay()
            } label: {
                BottomButtonLabel(title: "Pay", enabled: viewModel.hasAmount)
            }
            .disabled(!viewModel.hasAmount)
        }
        .padding(.horizontal, 28)
        .padding(.bottom, 8)
    }
}

#Preview {
    NumpadView(onPay: { _ in }, onRequest: { _ in }, onProfileTap: {}, onActivityTap: {})
        .environmentObject(AppState())
}
