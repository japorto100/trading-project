# Start full stack: Go Gateway + GCT + Python (Rust-powered) services + Next.js
# Usage: from repo root: bun run dev:full:gct:python
# Optional: -SkipGo, -SkipGCT, -SkipPython, -NoNext, -InstallMl

param(
    [switch]$SkipGo,
    [switch]$SkipGCT,
    [switch]$SkipPython,
    [switch]$InstallMl,
    [switch]$NoNext
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$goBackendDir = Join-Path $repoRoot "go-backend"
$pythonBackendRoot = Join-Path $repoRoot "python-backend"
$venvPython = Join-Path $pythonBackendRoot ".venv\Scripts\python.exe"
$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
$rustTargetDir = Join-Path $pythonBackendRoot "rust_core\target-local"
$processes = @()
$uvCmd = $null

# Ensure Rust toolchain binaries and cache path are stable for PyO3 builds in dev flow.
if (Test-Path $cargoBin) {
    if (-not (($env:Path -split ';') -contains $cargoBin)) {
        $env:Path = "$cargoBin;$env:Path"
    }
}
$env:CARGO_TARGET_DIR = $rustTargetDir

if (Get-Command uv -ErrorAction SilentlyContinue) { $uvCmd = "uv" }
elseif (Get-Command python -ErrorAction SilentlyContinue) { $uvCmd = "python -m uv" }
else { $uvCmd = $null }

function Import-EnvFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match '^\s*([^#=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value -replace '^["'']|["'']$', ''
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "[env] Loaded $Path"
}

function Start-ServiceProcess {
    param([string]$WorkingDir, [string]$Name, [string]$App, [int]$Port)
    $uvicornArgs = "-m uvicorn $App --host 127.0.0.1 --port $Port"
    Write-Host "[$Name] Starting on port $Port"
    $proc = Start-Process -FilePath $venvPython -ArgumentList $uvicornArgs -WorkingDirectory $WorkingDir -PassThru -WindowStyle Hidden
    return $proc
}

function Wait-ForPort {
    param([int]$Port, [string]$Name, [int]$TimeoutSecs = 30)
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSecs) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("127.0.0.1", $Port)
            $tcp.Close()
            Write-Host "[$Name] Ready on :$Port" -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    Write-Host "[$Name] Timeout after ${TimeoutSecs}s waiting for :$Port" -ForegroundColor Yellow
    return $false
}

try {
    # 0) Load Environment
    Write-Host "--- Loading Environment ---" -ForegroundColor Cyan
    Import-EnvFile -Path (Join-Path $repoRoot ".env.development")
    Import-EnvFile -Path (Join-Path $goBackendDir ".env.development")

    # Verify critical cross-service vars
    Write-Host "Go Gateway:   $($env:GO_GATEWAY_BASE_URL)"
    Write-Host "Indicator:    $($env:INDICATOR_SERVICE_URL)"
    Write-Host "Soft Signals: $($env:GEOPOLITICAL_SOFT_SIGNAL_URL)"
    Write-Host "Finance:      $($env:FINANCE_BRIDGE_URL)"

    # 1) GoCryptoTrader (GCT) — must start first; Go Gateway connects via gRPC :9052
    if (-not $SkipGCT) {
        $gctDir = Join-Path $goBackendDir "vendor-forks\gocryptotrader"
        $gctExe = Join-Path $gctDir "gocryptotrader.exe"
        if (-not (Test-Path $gctExe)) {
            Write-Host "[GCT] Building engine..." -ForegroundColor Yellow
            Push-Location $gctDir
            & go build -o $gctExe .
            Pop-Location
        }
        $gctDataDir = Join-Path $env:TEMP "gct-data"
        if (-not (Test-Path $gctDataDir)) { New-Item -ItemType Directory -Path $gctDataDir -Force | Out-Null }

        $configPath = Join-Path $gctDataDir "config.min.json"
        $configTemplate = Join-Path $gctDir "config_example.json"
        $config = Get-Content $configTemplate -Raw | ConvertFrom-Json
        $config.dataDirectory = $gctDataDir
        # Read credentials from env with sensible defaults
        $config.remoteControl.username = if ($env:GCT_ADMIN_USER) { $env:GCT_ADMIN_USER } else { "admin" }
        $config.remoteControl.password = if ($env:GCT_ADMIN_PASS) { $env:GCT_ADMIN_PASS } else { "Password" }
        $config.remoteControl.gRPC.enabled = $true
        $config.remoteControl.gRPC.listenAddress = "127.0.0.1:9052"
        $config.remoteControl.gRPC.grpcProxyEnabled = $true
        $config.remoteControl.gRPC.grpcProxyListenAddress = "127.0.0.1:9053"
        $gctExchange = if ($env:GCT_EXCHANGE) { $env:GCT_EXCHANGE } else { "Kraken" }
        foreach ($ex in $config.exchanges) { $ex.enabled = ($ex.name -eq $gctExchange) }
        $config | ConvertTo-Json -Depth 100 | Set-Content -Path $configPath -NoNewline

        Write-Host "[gct] Starting ($gctExchange)..."
        $processes += Start-Process -FilePath $gctExe -ArgumentList @("-config", $configPath, "-datadir", $gctDataDir, "-ntpclient=false", "-grpcproxy") -WorkingDirectory $gctDir -PassThru -WindowStyle Hidden
        Wait-ForPort -Port 9052 -Name "gct" -TimeoutSecs 30 | Out-Null
    }

    # 2) Go Gateway + Python — start in parallel after GCT is ready
    if (-not $SkipGo) {
        Write-Host "[go-gateway] Starting on port 9060"
        $processes += Start-Process -FilePath "go" -ArgumentList @("run", "./cmd/gateway") -WorkingDirectory $goBackendDir -PassThru -WindowStyle Hidden
    }

    # 3) Python + Rust Services — start in parallel with Go Gateway
    if (-not $SkipPython) {
        if (-not (Test-Path $venvPython)) {
            Write-Host "[python] Creating shared .venv..."
            Push-Location $pythonBackendRoot
            & $uvCmd venv .venv
            Pop-Location
        }

        Write-Host "[python] Syncing dependencies..."
        Push-Location $pythonBackendRoot
        if ($InstallMl) { & $uvCmd sync --python `"$venvPython`" --extra ml }
        else { & $uvCmd sync --python `"$venvPython`" --inexact }

        # Build Rust core if present
        if (Test-Path "rust_core") {
            Write-Host "[rust] Building & installing core bindings..." -ForegroundColor Cyan
            Push-Location $pythonBackendRoot
            & $uvCmd pip install -e ./rust_core
            Pop-Location
        }
        Pop-Location

        # Map ports according to go-gateway .env.development — all start in parallel
        $processes += Start-ServiceProcess -WorkingDir (Join-Path $pythonBackendRoot "services\indicator-service") -Name "indicator" -App "app:app" -Port 8090
        $processes += Start-ServiceProcess -WorkingDir (Join-Path $pythonBackendRoot "services\geopolitical-soft-signals") -Name "soft-signals" -App "app:app" -Port 8091
        $processes += Start-ServiceProcess -WorkingDir (Join-Path $pythonBackendRoot "services\finance-bridge") -Name "finance-bridge" -App "app:app" -Port 8092
    }

    # Wait for all background services to be ready
    if (-not $SkipGo) {
        Wait-ForPort -Port 9060 -Name "go-gateway" -TimeoutSecs 30 | Out-Null
    }
    if (-not $SkipPython) {
        Wait-ForPort -Port 8090 -Name "indicator"      -TimeoutSecs 30 | Out-Null
        Wait-ForPort -Port 8091 -Name "soft-signals"   -TimeoutSecs 30 | Out-Null
        Wait-ForPort -Port 8092 -Name "finance-bridge" -TimeoutSecs 30 | Out-Null
    }

    Write-Host "`n--- Stack Ready ---" -ForegroundColor Green
    Write-Host "Next.js UI:   http://localhost:3000"
    Write-Host "Go Gateway:   http://127.0.0.1:9060"
    Write-Host "Python API:   8090, 8091, 8092"
    if (-not $SkipGCT) { Write-Host "GCT gRPC:     127.0.0.1:9052" }

    if (-not $NoNext) {
        Write-Host "[nextjs] Starting frontend..."
        Push-Location $repoRoot
        bun run dev
        Pop-Location
    }
}
finally {
    foreach ($proc in $processes) {
        if ($null -ne $proc -and -not $proc.HasExited) {
            Write-Host "Stopping process $($proc.Id) ($($proc.ProcessName))"
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
