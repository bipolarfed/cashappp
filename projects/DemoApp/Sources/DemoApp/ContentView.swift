import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "iphone")
                .font(.system(size: 64))
                .foregroundStyle(.blue)
            Text("Hello from DemoApp!")
                .font(.title2.bold())
            Text("Built with Skibidi IPA Builder")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
