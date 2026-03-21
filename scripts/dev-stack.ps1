# Start full stack: Go Gateway + GCT + Python (Rust-powered) services + Next.js + SeaweedFS + NATS + local Redis shim + Observability
# Usage: from repo root: bun run dev:full:gct:python
# All services run by default. Pass -Skip* flags to disable individual services.
# Optional: -SkipGo, -SkipGCT, -SkipPython, -SkipNext, -SkipSeaweedfs, -SkipNats, -SkipRedis (alias: -SkipValkey), -SkipObservability, -InstallMl

param(
    [switch]$SkipGo,
    [switch]$SkipGCT,
    [switch]$SkipPython,
    [switch]$SkipNext,
    [switch]$SkipSeaweedfs,
    [switch]$SkipNats,
    [Alias("SkipValkey")]
    [switch]$SkipRedis,
    [switch]$SkipObservability,    # Skip OpenObserve OTel tracing (normally on :5080/5081)
    # Mock-LLM is OFF by default — only for agent verify without real API keys.
    # Enable with -MockLlm. Sets AGENT_PROVIDER=openai-compatible + OPENAI_BASE_URL=http://127.0.0.1:11500/v1.
    # tools/mock-llm/server.py — OpenAI-compatible streaming stub at :11500.
    [switch]$MockLlm,
    [switch]$InstallMl,
    [int]$WaitSeconds = 0,
    [bool]$Watch = $true,
    [int]$RestartDelaySeconds = 2
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$goBackendDir = Join-Path $repoRoot "go-backend"
$pythonBackendRoot = Join-Path $repoRoot "python-backend"
$venvPython = Join-Path $pythonBackendRoot ".venv\Scripts\python.exe"
# uv Workspace: python-agent + python-compute are workspace members of python-backend.
# All services share python-backend/.venv — no standalone venvs needed.
# ml_ai/ + services/_shared/ are installed as editable root into the workspace venv.
$agentRoot = Join-Path $pythonBackendRoot "python-agent"
$agentVenvPython = $venvPython  # workspace venv — same as compute and root
$computeRoot = Join-Path $pythonBackendRoot "python-compute"
$preferredCargoHome = if (-not [string]::IsNullOrWhiteSpace($env:CARGO_HOME)) { $env:CARGO_HOME } else { "D:\DevCache\cargo\.cargo" }
$preferredRustupHome = if (-not [string]::IsNullOrWhiteSpace($env:RUSTUP_HOME)) { $env:RUSTUP_HOME } else { "D:\DevCache\rustup" }
$cargoBin = Join-Path $preferredCargoHome "bin"
$rustTargetDir = Join-Path $pythonBackendRoot "rust_core\target-local"
$processes = @()
$managedServices = @{}
$logsRoot = Join-Path $repoRoot "logs\dev-stack"
$uvCmd = $null
$seaweedDir = Join-Path $repoRoot "tools\seaweedfs"
$seaweedExe = Join-Path $seaweedDir "weed.exe"
$seaweedDataDir = Join-Path $seaweedDir "data"
$seaweedS3Config = Join-Path $seaweedDir "s3.json"
$redisDir = Join-Path $repoRoot "tools\redis"
$redisExe = Join-Path $redisDir "redis-server.exe"
$redisConfig = Join-Path $redisDir "redis.conf"
$redisPythonConfig = Join-Path $redisDir "redis-python.conf"
$redisDownloadScript = Join-Path $redisDir "download.ps1"
$redisDataDir = Join-Path $redisDir "data"
$redisPythonDataDir = Join-Path $redisDir "data-python"

function Ensure-SeaweedFSAvailable {
    if (Test-Path $seaweedExe) {
        return $seaweedExe
    }

    Write-Host "[seaweedfs] Downloading SeaweedFS 4.15 for Windows amd64..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $seaweedDir -Force | Out-Null
    $archivePath = Join-Path $seaweedDir "windows_amd64.zip"
    $releaseUrl = "https://github.com/seaweedfs/seaweedfs/releases/download/4.15/windows_amd64.zip"
    Invoke-WebRequest -Uri $releaseUrl -OutFile $archivePath -UseBasicParsing
    Expand-Archive -Path $archivePath -DestinationPath $seaweedDir -Force

    $extracted = Get-ChildItem $seaweedDir -Recurse -Filter "weed.exe" | Select-Object -First 1
    if (-not $extracted) {
        throw "[seaweedfs] weed.exe not found after archive extraction."
    }
    if ($extracted.FullName -ne $seaweedExe) {
        Move-Item $extracted.FullName $seaweedExe -Force
    }
    return $seaweedExe
}

function Ensure-RedisAvailable {
    if (Test-Path $redisExe) {
        return $redisExe
    }

    if (Test-Path $redisDownloadScript) {
        try {
            Write-Host "[redis] Attempting download/install..." -ForegroundColor Cyan
            & powershell -ExecutionPolicy Bypass -File $redisDownloadScript
        } catch {
            Write-Host "[redis] Download/install helper failed: $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }

    if (Test-Path $redisExe) {
        return $redisExe
    }

    Write-Host "[redis] No native Windows compatibility binary available at $redisExe. Continuing without local Redis shim." -ForegroundColor DarkYellow
    return $null
}

function Ensure-AirAvailable {
    # Returns the full path to air.exe, or $null if unavailable.
    if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
        return $null
    }

    # Always add GOBIN (or GOPATH/bin fallback) to PATH so air.exe is findable
    try {
        $goBinPath = (& go env GOBIN).Trim()
        if ([string]::IsNullOrWhiteSpace($goBinPath)) {
            $goPath = (& go env GOPATH).Trim()
            if (-not [string]::IsNullOrWhiteSpace($goPath)) {
                $goBinPath = Join-Path $goPath "bin"
            }
        }
        if (-not [string]::IsNullOrWhiteSpace($goBinPath) -and (Test-Path $goBinPath)) {
            if (-not (($env:Path -split ';') -contains $goBinPath)) {
                $env:Path = "$goBinPath;$env:Path"
            }
        }
    } catch { }

    # Check if air is already available
    $airCmd = Get-Command air -ErrorAction SilentlyContinue
    if ($airCmd) { return $airCmd.Source }

    # Try one-time install
    Write-Host "[go-gateway] 'air' not found. Attempting one-time install for hot reload..." -ForegroundColor Yellow
    try {
        & go install github.com/air-verse/air@latest
    } catch {
        Write-Host "[go-gateway] Could not install air: $($_.Exception.Message)" -ForegroundColor DarkYellow
        return $null
    }

    $airCmd = Get-Command air -ErrorAction SilentlyContinue
    return if ($airCmd) { $airCmd.Source } else { $null }
}

# Ensure Rust toolchain binaries and cache path are stable for PyO3 builds in dev flow.
if (-not (Test-Path $preferredCargoHome)) {
    New-Item -ItemType Directory -Path $preferredCargoHome -Force | Out-Null
}
if (-not (Test-Path $preferredRustupHome)) {
    New-Item -ItemType Directory -Path $preferredRustupHome -Force | Out-Null
}
if ([string]::IsNullOrWhiteSpace($env:CARGO_HOME)) {
    $env:CARGO_HOME = $preferredCargoHome
}
if ([string]::IsNullOrWhiteSpace($env:RUSTUP_HOME)) {
    $env:RUSTUP_HOME = $preferredRustupHome
}
if (Test-Path $cargoBin) {
    if (-not (($env:Path -split ';') -contains $cargoBin)) {
        $env:Path = "$cargoBin;$env:Path"
    }
}
$env:CARGO_TARGET_DIR = $rustTargetDir
# Suppress uv hardlink warning (cache + target on different filesystems in dev)
$env:UV_LINK_MODE = "copy"
# Keep uv cache on local writable drive to avoid AppData ACL issues on Windows.
if ([string]::IsNullOrWhiteSpace($env:UV_CACHE_DIR)) {
    $fallbackUvCache = "D:\DevCache\uv\cache"
    if (-not (Test-Path $fallbackUvCache)) {
        New-Item -ItemType Directory -Path $fallbackUvCache -Force | Out-Null
    }
    $env:UV_CACHE_DIR = $fallbackUvCache
}

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

function Ensure-LogsDirectory {
    if (-not (Test-Path $logsRoot)) {
        New-Item -ItemType Directory -Path $logsRoot -Force | Out-Null
    }
}

function Stop-ListenerOnPort {
    param([int]$Port, [string]$Name)
    try {
        $portPids = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $portPids) {
            if ($null -ne $procId) {
                Write-Host "[$Name] Freeing port $Port (PID $procId)..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        Write-Host "[$Name] Could not inspect/free port ${Port}: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}

function Start-LoggedProcess {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory
    )
    Ensure-LogsDirectory
    $stdoutPath = Join-Path $logsRoot "$Name.stdout.log"
    $stderrPath = Join-Path $logsRoot "$Name.stderr.log"
    Write-Host "[$Name] Logs: $stdoutPath | $stderrPath"
    $spArgs = @{
        FilePath             = $FilePath
        WorkingDirectory     = $WorkingDirectory
        PassThru             = $true
        WindowStyle          = "Hidden"
        RedirectStandardOutput = $stdoutPath
        RedirectStandardError  = $stderrPath
    }
    # PS5 throws on empty ArgumentList — only add when non-empty
    if ($ArgumentList -and $ArgumentList.Count -gt 0) {
        $spArgs.ArgumentList = $ArgumentList
    }
    return Start-Process @spArgs
}

function Register-ManagedService {
    param(
        [string]$Name,
        [int]$Port,
        [scriptblock]$StartAction
    )
    $script:managedServices[$Name] = [ordered]@{
        Name         = $Name
        Port         = $Port
        StartAction  = $StartAction
        Process      = $null
        RestartCount = 0
    }
}

function Start-ManagedService {
    param([string]$Name)
    $svc = $script:managedServices[$Name]
    if ($null -eq $svc) {
        throw "Managed service not registered: $Name"
    }
    Stop-ListenerOnPort -Port $svc.Port -Name $svc.Name
    $proc = & $svc.StartAction
    $svc.Process = $proc
    $script:managedServices[$Name] = $svc
    $script:processes += $proc
    return $proc
}

function Start-ServiceProcess {
    param([string]$WorkingDir, [string]$Name, [string]$App, [int]$Port, [string]$PythonExe = "")
    # SERVER=granian uses Granian (Rust/Tokio ASGI) instead of uvicorn.
    # Eval: python_runtime_eval_delta.md GRN.V1-V4. Default: uvicorn.
    $resolvedPython = if ($PythonExe -and (Test-Path $PythonExe)) { $PythonExe } else { $venvPython }
    $serverChoice = if ($env:SERVER) { $env:SERVER.ToLower() } else { "uvicorn" }
    if ($serverChoice -eq "granian") {
        $args = @("-m", "granian", "--interface", "asgi", "--host", "127.0.0.1", "--port", "$Port", "--reload", $App)
        Write-Host "[$Name] Starting on port $Port (granian/Tokio + reload)"
    } else {
        $args = @("-m", "uvicorn", $App, "--host", "127.0.0.1", "--port", "$Port", "--reload")
        Write-Host "[$Name] Starting on port $Port (uvicorn + auto-reload)"
    }
    $proc = Start-LoggedProcess -Name $Name -FilePath $resolvedPython -ArgumentList $args -WorkingDirectory $WorkingDir
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

function Ensure-PortReady {
    param(
        [int]$Port,
        [string]$Name,
        [int]$TimeoutSecs = 30
    )
    $ready = Wait-ForPort -Port $Port -Name $Name -TimeoutSecs $TimeoutSecs
    if (-not $ready) {
        throw "[$Name] failed to start on :$Port within ${TimeoutSecs}s. Aborting dev-stack startup."
    }
}

function Watch-ManagedServices {
    param(
        [int]$WaitSecondsParam = 0
    )
    $startTs = Get-Date
    while ($true) {
        foreach ($entry in @($script:managedServices.GetEnumerator())) {
            $svc = $entry.Value
            if ($null -eq $svc.Process) {
                continue
            }
            if ($svc.Process.HasExited) {
                $svc.RestartCount++
                Write-Host "[$($svc.Name)] Process exited (code $($svc.Process.ExitCode)). Restart attempt #$($svc.RestartCount)..." -ForegroundColor Yellow
                Start-Sleep -Seconds $RestartDelaySeconds
                $restarted = Start-ManagedService -Name $svc.Name
                Ensure-PortReady -Port $svc.Port -Name $svc.Name -TimeoutSecs 30
                $svc.Process = $restarted
                $script:managedServices[$svc.Name] = $svc
            }
        }

        if ($WaitSecondsParam -gt 0) {
            $elapsed = (Get-Date) - $startTs
            if ($elapsed.TotalSeconds -ge $WaitSecondsParam) {
                break
            }
        }
        Start-Sleep -Seconds 2
    }
}

try {
    # 0) Load Environment
    Write-Host "--- Loading Environment ---" -ForegroundColor Cyan
    Import-EnvFile -Path (Join-Path $repoRoot ".env.development")
    Import-EnvFile -Path (Join-Path $goBackendDir ".env.development")
    Import-EnvFile -Path (Join-Path $pythonBackendRoot ".env.development")
    Import-EnvFile -Path (Join-Path $agentRoot ".env.development")  # python-agent env (LLM keys, OTEL)

    # 0b) OpenObserve (Default ON, skip via -SkipObservability flag)
    if (-not $SkipObservability) {
        $ooDir = Join-Path $repoRoot "tools\openobserve"
        $ooExe = Join-Path $ooDir "openobserve.exe"
        if (-not (Test-Path $ooExe)) {
            Write-Host "[openobserve] Downloading OpenObserve for Windows x86_64..." -ForegroundColor Cyan
            New-Item -ItemType Directory -Path $ooDir -Force | Out-Null
            $ooVersion = "v0.14.7"
            $ooUrl = "https://github.com/openobserve/openobserve/releases/download/$ooVersion/openobserve-$ooVersion-windows-amd64.zip"
            $ooZip = Join-Path $ooDir "openobserve.zip"
            Invoke-WebRequest -Uri $ooUrl -OutFile $ooZip -UseBasicParsing
            Expand-Archive -Path $ooZip -DestinationPath $ooDir -Force
            Remove-Item $ooZip
            # Rename extracted exe if needed
            $extracted = Get-ChildItem $ooDir -Filter "*.exe" | Select-Object -First 1
            if ($extracted -and $extracted.Name -ne "openobserve.exe") {
                Rename-Item $extracted.FullName "openobserve.exe"
            }
        }
        $ooDataDir = Join-Path $repoRoot "tools\openobserve\data"
        if (-not (Test-Path $ooDataDir)) { New-Item -ItemType Directory -Path $ooDataDir -Force | Out-Null }

        Stop-ListenerOnPort -Port 5080 -Name "openobserve"
        Stop-ListenerOnPort -Port 5081 -Name "openobserve-grpc"

        $ooEnv = [System.Collections.Generic.Dictionary[string,string]]::new()
        $ooEnv["ZO_ROOT_USER_EMAIL"] = if ($env:OPENOBSERVE_USER) { $env:OPENOBSERVE_USER } else { "root@example.com" }
        $ooEnv["ZO_ROOT_USER_PASSWORD"] = if ($env:OPENOBSERVE_PASSWORD) { $env:OPENOBSERVE_PASSWORD } else { "Complexpass#123" }
        $ooEnv["ZO_DATA_DIR"] = $ooDataDir
        $ooEnv["ZO_GRPC_PORT"] = "5081"
        # Disable disk-level file cache: no object storage in local dev, eliminates
        # the "File disk cache is corrupt" GC spam and crash on empty data dir (PS5 compat).
        $ooEnv["ZO_DISK_CACHE_ENABLED"] = "false"
        # Apply env vars to current process so child inherits them
        foreach ($kv in $ooEnv.GetEnumerator()) {
            [Environment]::SetEnvironmentVariable($kv.Key, $kv.Value, "Process")
        }

        Write-Host "[openobserve] Starting on :5080 (UI) / :5081 (gRPC)..." -ForegroundColor Cyan
        $ooProc = Start-LoggedProcess -Name "openobserve" -FilePath $ooExe -ArgumentList @() -WorkingDirectory $ooDir
        $processes += $ooProc
        $ready = Wait-ForPort -Port 5080 -Name "openobserve" -TimeoutSecs 60
        if ($ready) {
            Write-Host "[openobserve] UI: http://localhost:5080  ($($ooEnv['ZO_ROOT_USER_EMAIL']) / $($ooEnv['ZO_ROOT_USER_PASSWORD']))" -ForegroundColor Green
        }
    }

    # 0c) Redis — two instances (Default ON, skip via -SkipRedis / -SkipValkey)
    #   :6379 — Go Gateway cache (market data, geo, hot-path)
    #   :6380 — Python Backend cache (agent working memory, KG/vector TTL)
    if (-not $SkipRedis) {
        $resolvedRedisExe = Ensure-RedisAvailable
        if ($null -ne $resolvedRedisExe) {
            if (-not (Test-Path $redisDir)) { New-Item -ItemType Directory -Path $redisDir -Force | Out-Null }
            if (-not (Test-Path $redisDataDir)) { New-Item -ItemType Directory -Path $redisDataDir -Force | Out-Null }
            if (-not (Test-Path $redisPythonDataDir)) { New-Item -ItemType Directory -Path $redisPythonDataDir -Force | Out-Null }
            if (-not (Test-Path $redisConfig)) { throw "[redis] Missing config at $redisConfig" }
            if (-not (Test-Path $redisPythonConfig)) { throw "[redis-python] Missing config at $redisPythonConfig" }

            Stop-ListenerOnPort -Port 6379 -Name "redis"
            Stop-ListenerOnPort -Port 6380 -Name "redis-python"

            # Go Gateway reads MEMORY_REDIS_URL → :6379
            [Environment]::SetEnvironmentVariable("MEMORY_CACHE_PROVIDER", "redis", "Process")
            [Environment]::SetEnvironmentVariable("CACHE_PROVIDER", "redis", "Process")
            [Environment]::SetEnvironmentVariable("MEMORY_REDIS_ENABLED", "true", "Process")
            [Environment]::SetEnvironmentVariable("MEMORY_REDIS_URL", "redis://127.0.0.1:6379/0", "Process")
            [Environment]::SetEnvironmentVariable("MEMORY_VALKEY_URL", "redis://127.0.0.1:6379/0", "Process")
            [Environment]::SetEnvironmentVariable("NEXT_RUNTIME_CACHE_PROVIDER", "redis", "Process")
            [Environment]::SetEnvironmentVariable("NEXT_VALKEY_URL", "redis://127.0.0.1:6379/0", "Process")
            # Python Backend reads PYTHON_REDIS_URL → :6380 (cache_adapter.py priority override)
            [Environment]::SetEnvironmentVariable("PYTHON_REDIS_URL", "redis://127.0.0.1:6380/0", "Process")

            Register-ManagedService -Name "redis" -Port 6379 -StartAction {
                Write-Host "[redis] Starting Go-Gateway cache on :6379..." -ForegroundColor Cyan
                Start-LoggedProcess -Name "redis" -FilePath $resolvedRedisExe -ArgumentList @($redisConfig) -WorkingDirectory $redisDir
            }
            Register-ManagedService -Name "redis-python" -Port 6380 -StartAction {
                Write-Host "[redis-python] Starting Python-Backend cache on :6380..." -ForegroundColor Cyan
                Start-LoggedProcess -Name "redis-python" -FilePath $resolvedRedisExe -ArgumentList @($redisPythonConfig) -WorkingDirectory $redisDir
            }
            Start-ManagedService -Name "redis" | Out-Null
            Start-ManagedService -Name "redis-python" | Out-Null
            Ensure-PortReady -Port 6379 -Name "redis" -TimeoutSecs 20
            Ensure-PortReady -Port 6380 -Name "redis-python" -TimeoutSecs 20
        }
    }

    # 0d) NATS JetStream (Default ON, skip via -SkipNats flag)
    # Alternative: docker compose -f docker-compose.nats.yml up -d
    if (-not $SkipNats) {
        $natsDir = Join-Path $repoRoot "tools\nats"
        $natsExe = Join-Path $natsDir "nats-server.exe"
        if (-not (Test-Path $natsExe)) {
            Write-Host "[nats] Downloading nats-server for Windows x86_64..." -ForegroundColor Cyan
            New-Item -ItemType Directory -Path $natsDir -Force | Out-Null
            $natsVersion = "v2.10.24"
            $natsUrl = "https://github.com/nats-io/nats-server/releases/download/$natsVersion/nats-server-$natsVersion-windows-amd64.zip"
            $natsZip = Join-Path $natsDir "nats-server.zip"
            Invoke-WebRequest -Uri $natsUrl -OutFile $natsZip -UseBasicParsing
            Expand-Archive -Path $natsZip -DestinationPath $natsDir -Force
            Remove-Item $natsZip
            # Binary is inside a subdirectory — move it up
            $extracted = Get-ChildItem $natsDir -Recurse -Filter "nats-server.exe" | Select-Object -First 1
            if ($extracted -and $extracted.FullName -ne $natsExe) {
                Move-Item $extracted.FullName $natsExe -Force
                Remove-Item (Split-Path $extracted.FullName -Parent) -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        Stop-ListenerOnPort -Port 4222 -Name "nats"
        Write-Host "[nats] Starting JetStream on :4222 (monitoring: :8222)..." -ForegroundColor Cyan
        $natsProc = Start-LoggedProcess -Name "nats" -FilePath $natsExe `
            -ArgumentList @("-js", "-m=8222") `
            -WorkingDirectory $natsDir
        $processes += $natsProc
        $ready = Wait-ForPort -Port 4222 -Name "nats" -TimeoutSecs 15
        if ($ready) {
            Write-Host "[nats] Ready on :4222 | Monitoring: http://localhost:8222" -ForegroundColor Green
            Write-Host "[nats] Enable publisher: set NATS_ENABLED=true in go-backend/.env.development" -ForegroundColor DarkGray
        }
    }

    # 0e) SeaweedFS object storage (Default ON, skip via -SkipSeaweedfs flag)
    # Alternative: docker compose -f docker-compose.seaweedfs.yml up -d
    if (-not $SkipSeaweedfs) {
        $resolvedSeaweedExe = Ensure-SeaweedFSAvailable
        if (-not (Test-Path $seaweedDataDir)) { New-Item -ItemType Directory -Path $seaweedDataDir -Force | Out-Null }
        if (-not (Test-Path $seaweedS3Config)) {
            throw "[seaweedfs] Missing S3 config at $seaweedS3Config"
        }

        Register-ManagedService -Name "seaweedfs" -Port 8333 -StartAction {
            Write-Host "[seaweedfs] Starting on :8333 (master :9333, volume :8080, filer :8888)..." -ForegroundColor Cyan
            Start-LoggedProcess -Name "seaweedfs" -FilePath $resolvedSeaweedExe -ArgumentList @(
                "server",
                "-dir=$seaweedDataDir",
                "-s3",
                "-s3.config=$seaweedS3Config",
                "-ip=127.0.0.1",
                "-master.port=9333",
                "-volume.port=18080",
                "-filer.port=8888",
                "-s3.port=8333"
            ) -WorkingDirectory $seaweedDir
        }
        Start-ManagedService -Name "seaweedfs" | Out-Null
        Ensure-PortReady -Port 8333 -Name "seaweedfs" -TimeoutSecs 45
    }

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
        # Read credentials from env with backward-compatible aliases
        $gctUser = if ($env:GCT_ADMIN_USER) {
            $env:GCT_ADMIN_USER
        } elseif ($env:GCT_USERNAME) {
            $env:GCT_USERNAME
        } else {
            "admin"
        }
        $gctPass = if ($env:GCT_ADMIN_PASS) {
            $env:GCT_ADMIN_PASS
        } elseif ($env:GCT_PASSWORD) {
            $env:GCT_PASSWORD
        } else {
            "Password"
        }
        $config.remoteControl.username = $gctUser
        $config.remoteControl.password = $gctPass
        $config.remoteControl.gRPC.enabled = $true
        $config.remoteControl.gRPC.listenAddress = "127.0.0.1:9052"
        $config.remoteControl.gRPC.grpcProxyEnabled = $true
        $config.remoteControl.gRPC.grpcProxyListenAddress = "127.0.0.1:9053"
        $gctExchange = if ($env:GCT_EXCHANGE) { $env:GCT_EXCHANGE } else { "Kraken" }
        foreach ($ex in $config.exchanges) { $ex.enabled = ($ex.name -eq $gctExchange) }
        $config | ConvertTo-Json -Depth 100 | Set-Content -Path $configPath -NoNewline

        Register-ManagedService -Name "gct" -Port 9052 -StartAction {
            Write-Host "[gct] Starting ($gctExchange)..."
            Start-LoggedProcess -Name "gct" -FilePath $gctExe -ArgumentList @("-config", $configPath, "-datadir", $gctDataDir, "-ntpclient=false", "-grpcproxy") -WorkingDirectory $gctDir
        }
        Start-ManagedService -Name "gct" | Out-Null
        Ensure-PortReady -Port 9052 -Name "gct" -TimeoutSecs 30
    }

    # 2) Register Go Gateway (will start after registration phase)
    if (-not $SkipGo) {
        # Pre-build to warm cache — Air still rebuilds on file changes, but first launch is instant.
        Write-Host "[go-gateway] Pre-building binary..." -ForegroundColor Cyan
        try {
            Push-Location $goBackendDir
            $preBuildOut = & go build -o ".\tmp\main.exe" ".\cmd\gateway" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[go-gateway] Pre-build warning (non-fatal): $preBuildOut" -ForegroundColor Yellow
            } else {
                Write-Host "[go-gateway] Pre-build OK" -ForegroundColor Green
            }
        } catch {
            Write-Host "[go-gateway] Pre-build skipped: $($_.Exception.Message)" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }

        $airPath = Ensure-AirAvailable
        if (-not $airPath) {
            Write-Host "[go-gateway] Hot reload disabled (air unavailable). Falling back to go run." -ForegroundColor DarkYellow
        } else {
            Write-Host "[go-gateway] air found: $airPath" -ForegroundColor DarkGreen
        }
        Register-ManagedService -Name "go-gateway" -Port 9060 -StartAction {
            if ($airPath) {
                Write-Host "[go-gateway] Starting on port 9060 (air hot-reload: $airPath)"
                Start-LoggedProcess -Name "go-gateway" -FilePath $airPath -ArgumentList @("-c", ".air.toml") -WorkingDirectory $goBackendDir
            } else {
                Write-Host "[go-gateway] Starting on port 9060 (go run)"
                Start-LoggedProcess -Name "go-gateway" -FilePath "go" -ArgumentList @("run", "./cmd/gateway") -WorkingDirectory $goBackendDir
            }
        }
    }

    # 3) Prepare + register Python/Rust services
    if (-not $SkipPython) {
        # 3a) python-backend shared venv (compute services + Rust extension)
        if (-not (Test-Path $venvPython)) {
            Write-Host "[python] Creating shared .venv in python-backend..."
            Push-Location $pythonBackendRoot
            & $uvCmd venv .venv
            Pop-Location
        }

        Write-Host "[python] Syncing python-backend dependencies..."
        Push-Location $pythonBackendRoot
        if ($InstallMl) { & $uvCmd sync --python `"$venvPython`" --extra ml }
        else { & $uvCmd sync --python `"$venvPython`" --inexact }

        # Build Rust core if present - skip when sources unchanged (cache by mtime)
        if (Test-Path "rust_core") {
            $rustSrcDir = Join-Path $pythonBackendRoot "rust_core"
            $sitePackages = Join-Path $pythonBackendRoot ".venv\Lib\site-packages"
            $newestSrc = Get-ChildItem $rustSrcDir -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*target*" -and $_.Extension -in @(".rs",".toml",".lock") } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            $installedPyd = Get-ChildItem $sitePackages -Filter "tradeviewfusion_rust_core*.pyd" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            $needsBuild = (-not $installedPyd) -or (-not $newestSrc) -or ($installedPyd.LastWriteTime -lt $newestSrc.LastWriteTime)
            if ($needsBuild) {
                Write-Host "[rust] Building & installing core bindings..." -ForegroundColor Cyan
                & (Join-Path $pythonBackendRoot "scripts\rebuild-rust-core.ps1") -Release -StopRepoPythonProcesses
            } else {
                Write-Host "[rust] Sources unchanged - skipping rebuild ($($installedPyd.Name))" -ForegroundColor Green
            }
        }
        Pop-Location

        # 3b) Workspace sync picks up python-agent + python-compute deps automatically.
        # (uv workspace: python-backend/ is root, members share python-backend/.venv)

        # Map ports per API_CONTRACTS/SYSTEM_STATE:
        # Compute plane (python-compute/): indicator 8092, soft-signals 8091
        # finance-bridge REMOVED (20.03.2026) — Go Gateway handles all market data fetch natively
        Register-ManagedService -Name "indicator" -Port 8092 -StartAction {
            Start-ServiceProcess -WorkingDir (Join-Path $computeRoot "indicator_engine") -Name "indicator" -App "app:app" -Port 8092
        }
        Register-ManagedService -Name "soft-signals" -Port 8091 -StartAction {
            Start-ServiceProcess -WorkingDir (Join-Path $computeRoot "geopolitical-soft-signals") -Name "soft-signals" -App "app:app" -Port 8091
        }
        # Agent plane (python-agent/): memory-service 8093, agent-service 8094
        # Both use the standalone python-agent/.venv
        Register-ManagedService -Name "memory-service" -Port 8093 -StartAction {
            Start-ServiceProcess -WorkingDir (Join-Path $agentRoot "memory") -Name "memory-service" -App "app:app" -Port 8093 -PythonExe $agentVenvPython
        }
        Register-ManagedService -Name "agent-service" -Port 8094 -StartAction {
            Start-ServiceProcess -WorkingDir (Join-Path $agentRoot "agent") -Name "agent-service" -App "app:app" -Port 8094 -PythonExe $agentVenvPython
        }
    }

    # 3c) Mock LLM (opt-in via -MockLlm flag — for agent verify without real API keys)
    # tools/mock-llm/server.py is OpenAI-compatible, listens on :11500.
    # python-agent reads AGENT_PROVIDER=openai-compatible + OPENAI_BASE_URL from env.
    if ($MockLlm) {
        $mockLlmDir = Join-Path $repoRoot "tools\mock-llm"
        $mockPython = if (Test-Path $agentVenvPython) { $agentVenvPython } else { $venvPython }
        [Environment]::SetEnvironmentVariable("AGENT_PROVIDER", "openai-compatible", "Process")
        [Environment]::SetEnvironmentVariable("OPENAI_BASE_URL", "http://127.0.0.1:11500/v1", "Process")
        [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "mock-key-not-checked", "Process")
        Register-ManagedService -Name "mock-llm" -Port 11500 -StartAction {
            Write-Host "[mock-llm] Starting OpenAI-compatible stub on :11500 (agent verify mode)..." -ForegroundColor Magenta
            Start-LoggedProcess -Name "mock-llm" -FilePath $mockPython `
                -ArgumentList @("-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", "11500") `
                -WorkingDirectory $mockLlmDir
        }
    }

    # 4) Register Next.js frontend as managed process unless disabled
    if (-not $SkipNext) {
        Register-ManagedService -Name "nextjs" -Port 3000 -StartAction {
            Write-Host "[nextjs] Starting frontend on port 3000..."
            Start-LoggedProcess -Name "nextjs" -FilePath "bun" -ArgumentList @("run", "dev") -WorkingDirectory $repoRoot
        }
    }

    # 5) Start all registered services in stable order
    if (-not $SkipGo) { Start-ManagedService -Name "go-gateway" | Out-Null }
    if (-not $SkipPython) {
        Start-ManagedService -Name "indicator" | Out-Null
        Start-ManagedService -Name "soft-signals" | Out-Null
        Start-ManagedService -Name "memory-service" | Out-Null
        Start-ManagedService -Name "agent-service" | Out-Null
    }
    if ($MockLlm) { Start-ManagedService -Name "mock-llm" | Out-Null }
    if (-not $SkipNext) { Start-ManagedService -Name "nextjs" | Out-Null }

    # 6) Wait for all background services to be ready
    if (-not $SkipNext) {
        Ensure-PortReady -Port 3000 -Name "nextjs" -TimeoutSecs 120
    }
    if (-not $SkipSeaweedfs) {
        Ensure-PortReady -Port 8333 -Name "seaweedfs" -TimeoutSecs 45
    }
    if (-not $SkipRedis -and $null -ne $managedServices["redis"]) {
        Ensure-PortReady -Port 6379 -Name "redis" -TimeoutSecs 20
    }
    if (-not $SkipGo) {
        Ensure-PortReady -Port 9060 -Name "go-gateway" -TimeoutSecs 180
    }
    if (-not $SkipPython) {
        Ensure-PortReady -Port 8092 -Name "indicator" -TimeoutSecs 90
        Ensure-PortReady -Port 8091 -Name "soft-signals" -TimeoutSecs 90
        Ensure-PortReady -Port 8093 -Name "memory-service" -TimeoutSecs 90
        Ensure-PortReady -Port 8094 -Name "agent-service" -TimeoutSecs 90
    }
    if ($MockLlm) {
        Ensure-PortReady -Port 11500 -Name "mock-llm" -TimeoutSecs 30
    }

    Write-Host "`n--- Stack Ready ---" -ForegroundColor Green
    Write-Host "Next.js UI:   http://localhost:3000"
    Write-Host "Go Gateway:   http://127.0.0.1:9060"
    if (-not $SkipRedis -and $null -ne $managedServices["redis"]) {
        Write-Host "Redis Go:     redis://127.0.0.1:6379/0  (Go Gateway cache)"
        Write-Host "Redis Python: redis://127.0.0.1:6380/0  (Python agent/memory cache)"
    }
    if (-not $SkipSeaweedfs) {
        Write-Host "SeaweedFS S3:  http://127.0.0.1:8333"
        Write-Host "SeaweedFS UI:  http://127.0.0.1:9333  | Filer: http://127.0.0.1:8888"
    }
    Write-Host "Python API:   8091 (soft-signals), 8092 (indicator), 8093 (memory), 8094 (agent)"
    if (-not $SkipGCT) { Write-Host "GCT gRPC:     127.0.0.1:9052" }
    if (-not $SkipObservability) { Write-Host "OpenObserve:  http://localhost:5080  (Traces/Logs/Metrics)" -ForegroundColor Cyan }
    if ($MockLlm) { Write-Host "Mock LLM:     http://127.0.0.1:11500  (agent verify — AGENT_PROVIDER=openai-compatible)" -ForegroundColor Magenta }

    if ($Watch) {
        if ($WaitSeconds -gt 0) {
            Write-Host "`n[dev-stack] Watch mode active for $WaitSeconds seconds..." -ForegroundColor Cyan
            Watch-ManagedServices -WaitSecondsParam $WaitSeconds
        } else {
            Write-Host "`n[dev-stack] Watch mode active. Press Ctrl+C to stop all services..." -ForegroundColor Cyan
            Watch-ManagedServices -WaitSecondsParam 0
        }
    } else {
        if ($WaitSeconds -gt 0) {
            Write-Host "`n[dev-stack] Watch disabled. Keeping alive for $WaitSeconds seconds..." -ForegroundColor Cyan
            Start-Sleep -Seconds $WaitSeconds
        } else {
            Write-Host "`n[dev-stack] Watch disabled. Press Enter to stop all services..." -ForegroundColor Cyan
            Read-Host
        }
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
