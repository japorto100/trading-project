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

# ── Cache dirs (override via env if C: is low on space) ──────────────────────
# UV_CACHE_DIR, CARGO_HOME, CARGO_TARGET_DIR can be set externally.
# If UV_CACHE_DIR is set we respect it; otherwise uv uses its own default.

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
        # Remove stale uv package cache entry — prevents uv from reinstalling
        # an old cached wheel instead of the freshly built one (Windows .pyd locking quirk).
        # ErrorActionPreference = SilentlyContinue: uv exits 1 when nothing to clean — not a real error.
        $prevEA = $ErrorActionPreference; $ErrorActionPreference = "SilentlyContinue"
        & uv cache clean tradeviewfusion-rust-core 2>&1 | Out-Null
        $ErrorActionPreference = $prevEA; $LASTEXITCODE = 0

        # Remove stale wheels so uv always installs the freshly built version
        Get-ChildItem $wheelhouse -Filter "tradeviewfusion_rust_core-*.whl" -ErrorAction SilentlyContinue | Remove-Item -Force

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
            # Verify public API + batch dispatch (MACD/ADX/Stochastic/WMA/HMA)
            $smokeFile = [System.IO.Path]::GetTempFileName() + ".py"
            Set-Content -Path $smokeFile -Encoding UTF8 -Value @'
import sys, tradeviewfusion_rust_core as m
required = (
    "composite_sma50_slope_norm","calculate_heartbeat","calculate_indicators_batch",
    "redb_cache_set","redb_cache_get",
    "extract_entities_from_text","dedup_context_fragments","score_tools_for_query",
)
missing = [n for n in required if not hasattr(m, n)]
if missing: sys.exit(f"rust_core_missing: {missing}")
closes = [100.0 + i*0.5 for i in range(60)]
result = m.calculate_indicators_batch(list(range(60)),closes,[c+0.5 for c in closes],[c-0.5 for c in closes],closes,[1000.0]*60,["macd_12_26_9","adx_14","stoch_14_3","wma_10","hma_9"])
expected = ["macd_line_12_26_9","macd_signal_12_26_9","macd_hist_12_26_9","adx_14","di_plus_14","di_minus_14","stoch_k_14_3","stoch_d_14_3","wma_10","hma_9"]
missing2 = [k for k in expected if k not in result]
if missing2: sys.exit(f"rust_core_batch_missing: {missing2}")
print("rust_core smoke OK -- all indicators verified")
'@
            & $venvPython $smokeFile
            Remove-Item $smokeFile -ErrorAction SilentlyContinue
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
