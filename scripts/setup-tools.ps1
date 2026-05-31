# Download and set up external tools for Skibidi IPA Builder
# Run: npm run setup

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Tools = Join-Path $Root "tools"

Write-Host ""
Write-Host "  Skibidi IPA Builder - Tool Setup" -ForegroundColor Cyan
Write-Host ""

function Download-AndExtract($Url, $DestDir, $Label) {
    Write-Host "  Downloading $Label..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
    $zip = Join-Path $env:TEMP "skibidi-$([guid]::NewGuid()).zip"
    try {
        Invoke-WebRequest -Uri $Url -OutFile $zip -UseBasicParsing
        Expand-Archive -Path $zip -DestinationPath $DestDir -Force
        Write-Host "  OK: $Label" -ForegroundColor Green
    } catch {
        Write-Host "  FAILED: $Label - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  Manual download: $Url" -ForegroundColor DarkGray
    } finally {
        Remove-Item $zip -ErrorAction SilentlyContinue
    }
}

# Sideloader CLI (open-source Sideloadly alternative)
# https://github.com/Dadoum/Sideloader/releases
$SideloaderUrl = "https://github.com/Dadoum/Sideloader/releases/download/1.0-pre3/sideloader-cli-windows-x86_64.zip"
Download-AndExtract $SideloaderUrl (Join-Path $Tools "sideloader") "Sideloader CLI"

# libimobiledevice for Windows (device detection & install)
# From Sideloader maintainer's bundled libs discussion
$LibimobileUrl = "https://github.com/libimobiledevice-win32/imobiledevice-net/releases/download/v1.3.17/libimobiledevice.1.2.1-r1122-win-x64.zip"
Download-AndExtract $LibimobileUrl (Join-Path $Tools "libimobiledevice") "libimobiledevice"

Write-Host ""
Write-Host "  zsign:" -ForegroundColor Yellow
Write-Host "  zsign must be built from source or downloaded separately."
Write-Host "  Clone https://github.com/zhlynn/zsign and build with VS2022,"
Write-Host "  then copy zsign.exe to tools/zsign/zsign.exe"
Write-Host ""
Write-Host "  Also install iTunes (or Apple Mobile Device Support) for the USB driver."
Write-Host ""
Write-Host "  Setup complete. Run: npm start" -ForegroundColor Green
Write-Host ""
