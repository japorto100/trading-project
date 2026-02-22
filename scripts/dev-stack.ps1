# Start full stack: Go Gateway + Python services + Next.js
# Optional: -WithGCT starts GoCryptoTrader first (Crypto quotes + real backtest).
# Loads go-backend/.env so the gateway has FINNHUB_API_KEY, GEOPOLITICAL_GAMETHEORY_URL, etc.
# Usage: from repo root: bun run dev:full   or   powershell -File ./scripts/dev-stack.ps1
#        with GCT: bun run dev:full -- -WithGCT   or   .\scripts\dev-stack.ps1 -WithGCT

param(
    [switch]$SkipGo,
    [switch]$WithGCT,
    [switch]$SkipYfinance,
    [switch]$SkipSoftSignals,
    [switch]$SkipIndicatorService,
    [switch]$InstallMl,
    [switch]$NoNext
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$goBackendDir = Join-Path $repoRoot "go-backend"
$pythonBackendRoot = Join-Path $repoRoot "python-backend"
$venvPython = Join-Path $pythonBackendRoot ".venv\Scripts\python.exe"
$goEnvPath = Join-Path $goBackendDir ".env"
$processes = @()
$uvCmd = $null

if (Get-Command uv -ErrorAction SilentlyContinue) { $uvCmd = "uv" }
elseif (Get-Command python -ErrorAction SilentlyContinue) { $uvCmd = "python -m uv" }
else { $uvCmd = $null }

function Import-GoEnv {
    if (-not (Test-Path $goEnvPath)) { return }
    Get-Content $goEnvPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match '^\s*([^#=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "[env] Loaded go-backend\.env into process"
}

function Start-ServiceProcess {
    param([string]$WorkingDir, [string]$Name, [string]$App, [int]$Port)
    $uvicornArgs = "-m uvicorn $App --host 127.0.0.1 --port $Port"
    Write-Host "[$Name] Starting on port $Port"
    $proc = Start-Process -FilePath $venvPython -ArgumentList $uvicornArgs -WorkingDirectory $WorkingDir -PassThru -WindowStyle Hidden
    return $proc
}

try {
    Import-GoEnv
    $gctProcess = $null
    if ($WithGCT) {
        $gctDir = Join-Path $goBackendDir "vendor-forks\gocryptotrader"
        $gctExe = Join-Path $gctDir "gocryptotrader.exe"
        if (-not (Test-Path $gctExe)) {
            Write-Host "[GCT] Binary not found - building automatically..." -ForegroundColor Yellow
            Push-Location $gctDir
            try {
                & go build -o $gctExe .
                if ($LASTEXITCODE -ne 0) { throw "GCT build failed with exit code $LASTEXITCODE" }
                Write-Host "[GCT] Build successful: $gctExe" -ForegroundColor Green
            } finally {
                Pop-Location
            }
        }
        $gctDataDir = Join-Path $env:TEMP "gct-data"
        New-Item -ItemType Directory -Path $gctDataDir -Force | Out-Null
        $configPath = Join-Path $gctDataDir "config.min.json"
        $configTemplate = Join-Path $gctDir "config_example.json"
        $config = Get-Content $configTemplate -Raw | ConvertFrom-Json
        $config.dataDirectory = $gctDataDir
        $config.ntpclient.enabled = 0
        $gctUser = if ($env:GCT_USERNAME) { $env:GCT_USERNAME } else { "admin" }
        $gctPass = if ($env:GCT_PASSWORD) { $env:GCT_PASSWORD } else { "Password" }
        $config.remoteControl.username = $gctUser
        $config.remoteControl.password = $gctPass
        $config.remoteControl.gRPC.enabled = $true
        $config.remoteControl.gRPC.listenAddress = "127.0.0.1:9052"
        $config.remoteControl.gRPC.grpcProxyEnabled = $true
        $config.remoteControl.gRPC.grpcProxyListenAddress = "127.0.0.1:9053"
        $config.remoteControl.gRPC.grpcAllowBotShutdown = $false
        $config.remoteControl.gRPC.timeInNanoSeconds = $false
        $gctExchange = if ($env:GCT_EXCHANGE) { $env:GCT_EXCHANGE } else { "Kraken" }
        foreach ($ex in $config.exchanges) {
            $ex.enabled = ($ex.name -eq $gctExchange)
        }
        $config | ConvertTo-Json -Depth 100 | Set-Content -Path $configPath -NoNewline
        $env:GCT_GRPC_ADDRESS = "127.0.0.1:9052"
        $env:GCT_JSONRPC_ADDRESS = "https://127.0.0.1:9053"
        $env:GCT_USERNAME = $gctUser
        $env:GCT_PASSWORD = $gctPass
        $env:GCT_JSONRPC_INSECURE_TLS = "true"
        Write-Host "[gct] Starting ($gctExchange, public data - no API key needed)..."
        $gctProcess = Start-Process -FilePath $gctExe -ArgumentList @("-config", $configPath, "-datadir", $gctDataDir, "-ntpclient=false", "-grpcproxy", "-exchanges", $gctExchange) -WorkingDirectory $gctDir -PassThru
        $processes += $gctProcess
        Start-Sleep -Seconds 10
    }
    # 1) Go Gateway (optional)
    if (-not $SkipGo) {
        Write-Host "[go-gateway] Starting on port 9060"
        $gatewayProc = Start-Process -FilePath "go" -ArgumentList @("run", "./cmd/gateway") -WorkingDirectory $goBackendDir -PassThru
        $processes += $gatewayProc
        Start-Sleep -Seconds 3
    }

    # 2) Python venv + services
    if (-not (Test-Path $venvPython)) {
        Write-Host "[python-backend] Creating shared .venv..."
        Push-Location $pythonBackendRoot
        if ($uvCmd) { Invoke-Expression "$uvCmd venv .venv" }
        else { throw "uv or python required for Python services" }
        Pop-Location
    }
    Push-Location $pythonBackendRoot
    if ($uvCmd) {
        if ($InstallMl) { Invoke-Expression "$uvCmd sync --python `"$venvPython`" --extra ml" | Out-Null }
        else { Invoke-Expression "$uvCmd sync --python `"$venvPython`" --inexact" | Out-Null }
    }
    Pop-Location

    if (-not $SkipYfinance) {
        $processes += Start-ServiceProcess -WorkingDir (Join-Path $pythonBackendRoot "services\finance-bridge") -Name "finance-bridge" -App "app:app" -Port 8081
    }
    if (-not $SkipSoftSignals) {
        $processes += Start-ServiceProcess -WorkingDir (Join-Path $pythonBackendRoot "services\geopolitical-soft-signals") -Name "geopolitical-soft-signals" -App "app:app" -Port 8091
    }
    if (-not $SkipIndicatorService) {
        $processes += Start-ServiceProcess -WorkingDir (Join-Path $pythonBackendRoot "services\indicator-service") -Name "indicator-service" -App "app:app" -Port 8092
    }
    Start-Sleep -Seconds 2

    Write-Host ""
    Write-Host "Stack: Go=9060, finance-bridge=8081, soft-signals=8091, indicator=8092, Next=3000"
    Write-Host "Health: http://127.0.0.1:9060/health"
    if (-not $NoNext) {
        Write-Host "[nextjs] Starting bun dev (Ctrl+C stops all)"
        Push-Location $repoRoot
        bun run dev
        Pop-Location
    }
}
finally {
    foreach ($proc in $processes) {
        if ($null -ne $proc -and -not $proc.HasExited) {
            Write-Host "Stopping process $($proc.Id)"
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
