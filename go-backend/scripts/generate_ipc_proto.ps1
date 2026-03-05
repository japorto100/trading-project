# Generate Go gRPC stubs for ipc.proto
# Uses project-local protoc from tools/protoc/ (run tools/setup-protoc.ps1 first)
# Requires: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
#           go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ProtoDir = Join-Path (Join-Path (Join-Path $RepoRoot "internal") "proto") "ipc"
$ProtoFile = Join-Path $ProtoDir "ipc.proto"
$ProtocExe = Join-Path (Join-Path (Join-Path (Join-Path $RepoRoot "tools") "protoc") "bin") "protoc.exe"

if (-not (Test-Path $ProtoFile)) {
    Write-Error "Proto file not found: $ProtoFile"
    exit 1
}

if (-not (Test-Path $ProtocExe)) {
    Write-Host "protoc not found. Run: go-backend/tools/setup-protoc.ps1"
    $SetupScript = Join-Path (Join-Path $RepoRoot "tools") "setup-protoc.ps1"
    if (Test-Path $SetupScript) {
        & $SetupScript
    }
    if (-not (Test-Path $ProtocExe)) {
        Write-Error "protoc still missing. Run: go-backend/tools/setup-protoc.ps1"
        exit 1
    }
}

# Ensure protoc-gen-go and protoc-gen-go-grpc are in PATH
$env:PATH = "$env:GOPATH\bin;$env:GOBIN;$env:PATH"

Push-Location $ProtoDir
try {
    & $ProtocExe --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative ipc.proto
    if ($LASTEXITCODE -ne 0) {
        Write-Error "protoc failed."
        exit 1
    }
    Write-Host "Generated ipc.pb.go and ipc_grpc.pb.go"
} finally {
    Pop-Location
}
