$pythonBackendRoot = "D:\tradingview-clones\tradeview-fusion\python-backend"
$uvCmd = "uv"

if ($true) {
    $rustSrcDir = Join-Path $pythonBackendRoot "rust_core"
    $sitePackages = Join-Path $pythonBackendRoot ".venv\Lib\site-packages"
    $newestSrc = Get-ChildItem $rustSrcDir -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*target*" -and $_.Extension -in @(".rs",".toml",".lock") } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $installedPyd = Get-ChildItem $sitePackages -Filter "tradeviewfusion_rust_core*.pyd" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    $needsBuild = (-not $installedPyd) -or (-not $newestSrc) -or ($installedPyd.LastWriteTime -lt $newestSrc.LastWriteTime)
    if ($needsBuild) {
        Write-Host "[rust] Build needed"
    } else {
        Write-Host "[rust] Skip — no changes"
    }
}
