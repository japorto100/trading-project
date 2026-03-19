param(
    [string]$DownloadUrl = "",
    [string]$DestinationPath = ""
)

$ErrorActionPreference = "Stop"
$toolDir = Split-Path -Parent $PSCommandPath
$defaultExe = Join-Path $toolDir "valkey-server.exe"
$target = if ([string]::IsNullOrWhiteSpace($DestinationPath)) { $defaultExe } else { $DestinationPath }

if (Test-Path $target) {
    Write-Host "[valkey] Existing binary found at $target"
    exit 0
}

if ([string]::IsNullOrWhiteSpace($DownloadUrl) -and -not [string]::IsNullOrWhiteSpace($env:VALKEY_WINDOWS_DOWNLOAD_URL)) {
    $DownloadUrl = $env:VALKEY_WINDOWS_DOWNLOAD_URL
}

if ([string]::IsNullOrWhiteSpace($DownloadUrl)) {
    throw "[valkey] No official Windows binary URL is configured. Place valkey-server.exe into tools/valkey/ manually or set VALKEY_WINDOWS_DOWNLOAD_URL before running this script."
}

$downloadUri = [System.Uri]$DownloadUrl
$sourceName = [System.IO.Path]::GetFileName($downloadUri.AbsolutePath)
if ([string]::IsNullOrWhiteSpace($sourceName)) {
    $sourceName = "valkey-server.exe"
}
$archivePath = Join-Path $toolDir $sourceName
Write-Host "[valkey] Downloading from $DownloadUrl ..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile $archivePath -UseBasicParsing

$extension = [System.IO.Path]::GetExtension($archivePath).ToLowerInvariant()
switch ($extension) {
    ".zip" {
        Expand-Archive -Path $archivePath -DestinationPath $toolDir -Force
        Remove-Item $archivePath -Force -ErrorAction SilentlyContinue
    }
    ".exe" {
        if ($archivePath -ne $target) {
            Move-Item $archivePath $target -Force
        }
        Write-Host "[valkey] Downloaded binary to $target"
        exit 0
    }
    default {
        Move-Item $archivePath $target -Force
        Write-Host "[valkey] Downloaded binary to $target"
        exit 0
    }
}

$extracted = Get-ChildItem $toolDir -Recurse -Filter "valkey-server.exe" | Select-Object -First 1
if (-not $extracted) {
    throw "[valkey] valkey-server.exe not found after download/extraction."
}
if ($extracted.FullName -ne $target) {
    Move-Item $extracted.FullName $target -Force
}
Write-Host "[valkey] Installed to $target"
