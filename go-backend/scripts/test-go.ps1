param(
	[string]$GccBin = "C:\msys64\ucrt64\bin",
	[switch]$SkipRace
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$goBackendDir = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $goBackendDir

$gccPath = Join-Path $GccBin "gcc.exe"
if (Test-Path $gccPath) {
	$env:PATH = "$GccBin;$env:PATH"
}

Write-Host "Running: go test ./..."
go test ./...

Write-Host "Running: go vet ./..."
go vet ./...

if (-not $SkipRace) {
	if (-not (Get-Command gcc -ErrorAction SilentlyContinue)) {
		throw "gcc not found in PATH. Install MSYS2 UCRT64 and make sure C:\msys64\ucrt64\bin is available."
	}

	$env:CGO_ENABLED = "1"
	Write-Host "Running: go test -race ./..."
	go test -race ./...
}

Write-Host "Go quality gates completed."
