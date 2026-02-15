param(
    [switch]$SkipYfinance,
    [switch]$SkipSoftSignals,
    [switch]$InstallMl,
    [switch]$NoNext
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\\..")
$pythonBackendRoot = Join-Path $repoRoot "python-backend"
$venvPython = Join-Path $pythonBackendRoot ".venv\\Scripts\\python.exe"
$services = @()
$uvCmd = $null

if (Get-Command uv -ErrorAction SilentlyContinue) {
    $uvCmd = "uv"
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $uvCmd = "python -m uv"
}
else {
    throw "Neither uv nor python is available in PATH."
}

function Invoke-Uv {
    param([string]$Arguments)
    Invoke-Expression "$uvCmd $Arguments"
}

function Start-ServiceProcess {
    param(
        [string]$WorkingDir,
        [string]$Name,
        [string]$App,
        [int]$Port
    )
    $pythonExe = $venvPython
    $args = "-m uvicorn $App --host 127.0.0.1 --port $Port"
    Write-Host "[$Name] Starting on port $Port"
    $proc = Start-Process -FilePath $pythonExe -ArgumentList $args -WorkingDirectory $WorkingDir -PassThru -WindowStyle Hidden
    return $proc
}

try {
    if (-not (Test-Path $venvPython)) {
        Write-Host "[python-backend] Creating shared .venv..."
        Push-Location $pythonBackendRoot
        Invoke-Uv "venv .venv"
        Pop-Location
    }

    Push-Location $pythonBackendRoot
    if ($InstallMl) {
        Invoke-Uv "sync --python `"$venvPython`" --extra ml" | Out-Null
    }
    else {
        Invoke-Uv "sync --python `"$venvPython`"" | Out-Null
    }
    Pop-Location

    if (-not $SkipYfinance) {
        $yDir = Join-Path $pythonBackendRoot "services/finance-bridge"
        $services += Start-ServiceProcess -WorkingDir $yDir -Name "finance-bridge" -App "app:app" -Port 8081
    }

    if (-not $SkipSoftSignals) {
        $gDir = Join-Path $pythonBackendRoot "services/geopolitical-soft-signals"
        $services += Start-ServiceProcess -WorkingDir $gDir -Name "geopolitical-soft-signals" -App "app:app" -Port 8091
    }

    if (-not $NoNext) {
        Write-Host "[nextjs] Starting bun dev"
        Push-Location $repoRoot
        bun run dev
        Pop-Location
    }
}
finally {
    foreach ($proc in $services) {
        if ($null -ne $proc -and -not $proc.HasExited) {
            Write-Host "Stopping process $($proc.Id)"
            Stop-Process -Id $proc.Id -Force
        }
    }
}
