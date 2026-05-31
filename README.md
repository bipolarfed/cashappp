# Skibidi IPA Builder

Build, sign, and install iOS IPAs from Windows — with a mini IDE for editing Swift source and a web UI for the rest.

> **Note:** [Sideloadly](https://sideloadly.io) is **not open source**. This project uses the open-source [**Sideloader**](https://github.com/Dadoum/Sideloader) (same Apple ID signing approach) and [**zsign**](https://github.com/zhlynn/zsign) (the signing engine Sideloader uses internally).

## Features

- **Mini IDE** — file tree + Monaco editor for Swift, YAML, JSON in your project folder
- **Build IPAs** — GitHub Actions workflow for remote macOS builds, or local `.app` → `.ipa` packaging
- **Sign & install** — Apple ID sideload (free dev account), certificate signing (p12 + profile), or ad-hoc export
- **Device connection** — detect iPhone over USB via libimobiledevice

## Requirements

- **Node.js 18+**
- **iTunes** or Apple Mobile Device Support (USB driver for iPhone)
- **Visual C++ Redistributable** (usually already installed)
- iPhone with **Developer Mode** enabled (iOS 16+)

## Quick start

```powershell
cd skibidi
npm install
npm run setup    # downloads Sideloader + libimobiledevice
npm start        # opens http://localhost:3847
```

Connect your iPhone via USB, trust the computer, then use the web UI.

## Building Swift on Windows

Apple requires macOS/Xcode to compile Swift iOS apps. Two options:

1. **GitHub Actions (recommended)** — click "Generate GitHub Workflow" in the app, push your project to GitHub, run the workflow, download the IPA artifact.
2. **Local package** — if you have a pre-built `.app` (from Theos, CrossCode, etc.), use "Local Package" to zip it into an IPA.

## Signing modes

| Mode | Tool | Use case |
|------|------|----------|
| Apple ID Sideload | Sideloader | Free Apple dev account, 7-day apps, installs directly |
| Certificate | zsign | Your own p12 + mobileprovision |
| Ad-hoc | zsign | Export tweaked IPA without cert (no install) |

## Tool sources

| Tool | Source | Purpose |
|------|--------|---------|
| Sideloader | [Dadoum/Sideloader](https://github.com/Dadoum/Sideloader) | Apple ID auth + sign + install |
| zsign | [zhlynn/zsign](https://github.com/zhlynn/zsign) | Fast cross-platform IPA signing |
| libimobiledevice | [libimobiledevice-win32](https://github.com/libimobiledevice-win32/imobiledevice-net) | USB device communication |
| isideload | [nab138/isideload](https://github.com/nab138/isideload) | Reference Rust signing lib (used by CrossCode) |

## Project structure

```
skibidi/
├── server/           Backend API
├── public/           Web UI (HTML + Monaco editor)
├── projects/         Your Swift projects live here
├── tools/            Sideloader, zsign, libimobiledevice binaries
├── dist/             Built/signed IPAs
└── scripts/          Setup helpers
```

## Security

Apple ID credentials are passed directly to Sideloader, which sends them only to Apple's servers. Use an **app-specific password**, not your main Apple ID password. Consider a burner Apple ID for sideloading.

## License

MIT — third-party tools have their own licenses (Sideloader, zsign: MIT).
