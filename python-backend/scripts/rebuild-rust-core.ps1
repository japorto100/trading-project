param(
    [switch]$Release,
    [switch]$SmokeTest,
    [switch]$StopRepoPythonProcesses,
    [int]$RetryCount = 3
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\\..")
$pythonBackendRoot = Join-Path $repoRoot "python-backend"
$rustCoreRoot = Join-Path $pythonBackendRoot "rust_core"
$venvPython = Join-Path $pythonBackendRoot ".venv\\Scripts\\python.exe"
$wheelhouse = Join-Path $rustCoreRoot "target-local\\wheels"
# Avoid hardlink fallback warnings on Windows when cache and venv are on different filesystems.
$env:UV_LINK_MODE = "copy"

if (-not (Test-Path $venvPython)) {
    throw "Python virtual environment missing: $venvPython"
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    throw "uv is not available in PATH."
}

function Stop-RepoPython {
    $candidates = Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='pythonw.exe'" -ErrorAction SilentlyContinue
    foreach ($proc in $candidates) {
        $cmd = [string]$proc.CommandLine
        $exe = [string]$proc.ExecutablePath
        if ($cmd -like "*$repoRoot*" -or $exe -eq $venvPython) {
            Write-Host "[rust-core] Stopping Python process $($proc.ProcessId)"
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
        }
    }
}

for ($attempt = 1; $attempt -le [Math]::Max(1, $RetryCount); $attempt++) {
    try {
        Write-Host "[rust-core] Build attempt $attempt / $RetryCount"
        if (-not (Test-Path $wheelhouse)) {
            New-Item -ItemType Directory -Path $wheelhouse | Out-Null
        }

        Push-Location $pythonBackendRoot
        if ($Release) {
            & uv run maturin build -m "$rustCoreRoot\\Cargo.toml" --release --out "$wheelhouse"
        } else {
            & uv run maturin build -m "$rustCoreRoot\\Cargo.toml" --out "$wheelhouse"
        }

        $wheel = Get-ChildItem $wheelhouse -Filter "tradeviewfusion_rust_core-*.whl" |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if ($null -eq $wheel) {
            throw "No wheel produced in $wheelhouse"
        }

        & uv pip install --python "$venvPython" --force-reinstall "$($wheel.FullName)"
        Pop-Location

        if ($SmokeTest) {
            & $venvPython -c "import tradeviewfusion_rust_core as m; required=('composite_sma50_slope_norm','calculate_heartbeat','calculate_indicators_batch','redb_cache_set','redb_cache_get'); missing=[name for name in required if not hasattr(m,name)]; print('rust_core_missing', missing); raise SystemExit(1 if missing else 0)"
        }

        Write-Host "[rust-core] Rebuild successful."
        exit 0
    }
    catch {
        if (Get-Location) {
            try { Pop-Location } catch {}
        }
        $msg = $_.Exception.Message
        Write-Warning "[rust-core] Attempt $attempt failed: $msg"

        $isFinalAttempt = ($attempt -ge [Math]::Max(1, $RetryCount))
        if ($StopRepoPythonProcesses -and -not $isFinalAttempt) {
            Stop-RepoPython
            Start-Sleep -Seconds 2
        }
        elseif (-not $isFinalAttempt) {
            Start-Sleep -Seconds 2
        }
        else {
            throw
        }
    }
}
