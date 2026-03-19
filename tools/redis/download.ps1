param(
    [string]$DownloadUrl = "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip",
    [string]$DestinationDir = ""
)

$ErrorActionPreference = "Stop"
$toolDir = if ([string]::IsNullOrWhiteSpace($DestinationDir)) {
    Split-Path -Parent $PSCommandPath
} else {
    $DestinationDir
}

$redisExe = Join-Path $toolDir "redis-server.exe"
if (Test-Path $redisExe) {
    Write-Host "[redis] Existing binary found at $redisExe"
    exit 0
}

New-Item -ItemType Directory -Path $toolDir -Force | Out-Null
$archiveName = [System.IO.Path]::GetFileName(([System.Uri]$DownloadUrl).AbsolutePath)
$archivePath = Join-Path $toolDir $archiveName

Write-Host "[redis] Downloading Windows compatibility build from $DownloadUrl ..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile $archivePath -UseBasicParsing

Expand-Archive -Path $archivePath -DestinationPath $toolDir -Force
Remove-Item $archivePath -Force -ErrorAction SilentlyContinue

$server = Get-ChildItem $toolDir -Recurse -Filter "redis-server.exe" | Select-Object -First 1
if (-not $server) {
    throw "[redis] redis-server.exe not found after extraction."
}
if ($server.FullName -ne $redisExe) {
    Move-Item $server.FullName $redisExe -Force
}

$cli = Get-ChildItem $toolDir -Recurse -Filter "redis-cli.exe" | Select-Object -First 1
if ($cli -and $cli.FullName -ne (Join-Path $toolDir "redis-cli.exe")) {
    Move-Item $cli.FullName (Join-Path $toolDir "redis-cli.exe") -Force
}

Write-Host "[redis] Installed to $toolDir"
