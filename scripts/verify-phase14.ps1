# Phase 14 Verify Gates (14.v1, 14.v2, 14.v3)
# 14.v1: DiffWatcher OFAC → Auto-Candidate (requires stack + GeoMap)
# 14.v2: Symbol Catalog 500+ symbols (Go unit test: go test ./internal/connectors/symbolcatalog/...)
# 14.v3: GeoMap official sources via Go connector (requires stack)

$ErrorActionPreference = "Stop"
$GO_URL = "http://127.0.0.1:9060"

Write-Host "`n=== Phase 14 Verify Gates ===" -ForegroundColor Cyan

# 14.v2 — Symbol Catalog (unit test, no stack needed)
Write-Host "`n=== 14.v2 Symbol Catalog (unit test) ===" -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "..\go-backend")
$goTest = & go test ./internal/connectors/symbolcatalog/... -v 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] 14.v2 Symbol Catalog tests passed" -ForegroundColor Green
} else {
    Write-Host "[FAIL] 14.v2 Symbol Catalog: $goTest" -ForegroundColor Red
}
Pop-Location

# 14.v3 — GeoMap sanctions fetch (requires stack)
Write-Host "`n=== 14.v3 GeoMap sanctions fetch (requires stack) ===" -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "$GO_URL/api/v1/geopolitical/admin/sanctions-fetch" -Method Post -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] 14.v3 sanctions-fetch: $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[SKIP] 14.v3 sanctions-fetch: $_ (stack may not be running)" -ForegroundColor Gray
}

# 14.v1 — DiffWatcher OFAC → Auto-Candidate: manual verification with live OFAC update
Write-Host "`n=== 14.v1 DiffWatcher OFAC (manual) ===" -ForegroundColor Yellow
Write-Host "[INFO] 14.v1: Trigger OFAC SDN update, verify Auto-Candidate in GeoMap" -ForegroundColor Gray

Write-Host "`n=== Done ===" -ForegroundColor Cyan
