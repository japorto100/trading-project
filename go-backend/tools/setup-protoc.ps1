# Download protoc to project-local tools/protoc/
# Run once before first proto generation. No global install needed.

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ToolsDir = Join-Path $ScriptDir "protoc"
$BinDir = Join-Path $ToolsDir "bin"
$ProtocExe = Join-Path $BinDir "protoc.exe"

$Version = "34.0"
$ZipUrl = "https://github.com/protocolbuffers/protobuf/releases/download/v$Version/protoc-$Version-win64.zip"
$ZipPath = Join-Path $env:TEMP "protoc-$Version-win64.zip"

if (Test-Path $ProtocExe) {
    Write-Host "protoc already present at $ProtocExe"
    exit 0
}

Write-Host "Downloading protoc v$Version to $ToolsDir..."
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

try {
    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing
    Expand-Archive -Path $ZipPath -DestinationPath $ToolsDir -Force
    # Zip contains bin/protoc.exe and include/ - we extract to ToolsDir so bin/ ends up at ToolsDir/bin/
    $ExtractedBin = Join-Path $ToolsDir "bin"
    if (-not (Test-Path $ProtocExe)) {
        # Some releases have different structure
        $AltPath = Join-Path $ToolsDir "protoc.exe"
        if (Test-Path $AltPath) {
            Move-Item $AltPath $ProtocExe -Force
        }
    }
    Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
} catch {
    Write-Error "Failed to download protoc: $_"
    exit 1
}

if (-not (Test-Path $ProtocExe)) {
    Write-Error "protoc.exe not found after extract. Check $ToolsDir"
    exit 1
}

Write-Host "protoc installed at $ProtocExe"
