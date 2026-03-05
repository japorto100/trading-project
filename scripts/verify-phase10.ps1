# Phase 10 Verify Gates (10.v1, 10.v2, 10.v3)
# Requires: dev-stack running (Go :9060, Agent :8094, Memory :8093)
#
# 10.v1: "Analyse EURUSD" -> Extractor + Synthesizer (WebSocket/Agent E2E)
# 10.v2: Context Assembly (Frontend-State + Episodes + KG-Nodes)
# 10.v3: WebMCP Mutation -> Confirm-Modal -> Chart update
#
# These require browser/Playwright or manual verification.
# This script checks agent-service health as prerequisite.

$ErrorActionPreference = "Stop"
$AGENT_URL = "http://127.0.0.1:8094"
$GO_URL = "http://127.0.0.1:9060"

Write-Host "`n=== Phase 10 Verify Gates (prerequisites) ===" -ForegroundColor Cyan

try {
    $r = Invoke-WebRequest -Uri "$AGENT_URL/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "[OK] Agent service :8094 reachable" -ForegroundColor Green
} catch {
    Write-Host "[SKIP] Agent service not running: $_" -ForegroundColor Yellow
    Write-Host "  Run: ./scripts/dev-stack.ps1 -SkipGCT -NoNext" -ForegroundColor Gray
    exit 0
}

try {
    $r = Invoke-WebRequest -Uri "$GO_URL/api/v1/agent/context" -Method Post -Body '{}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] Agent context endpoint: $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Agent context: $_" -ForegroundColor Gray
}

Write-Host "`n10.v1-v3: Manual/Playwright verification required" -ForegroundColor Yellow
Write-Host "  - 10.v1: 'Analyse EURUSD' via Agent UI" -ForegroundColor Gray
Write-Host "  - 10.v2: Context Assembly in agent response" -ForegroundColor Gray
Write-Host "  - 10.v3: WebMCP tool mutation -> Confirm -> Chart update" -ForegroundColor Gray
