# Phase 6 Memory Live-Verify
# Run after: ./scripts/dev-stack.ps1 -SkipGCT -NoNext
# Prerequisites: Go Gateway :9060, Memory Service :8093

$ErrorActionPreference = "Stop"
$MEMORY_URL = "http://127.0.0.1:8093"
$GO_URL = "http://127.0.0.1:9060"

function Test-Endpoint {
    param([string]$Url, [string]$Name)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        Write-Host "[OK] $Name : $($r.StatusCode)" -ForegroundColor Green
        return $r
    } catch {
        Write-Host "[FAIL] $Name : $_" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n=== Phase 6 Memory Live-Verify ===" -ForegroundColor Cyan

# 6.2 Memory Service Health
$h = Test-Endpoint "$MEMORY_URL/health" "6.2 Memory Service Health"
if ($h) {
    $body = $h.Content | ConvertFrom-Json
    if (-not $body.ok) { Write-Host "  WARN: health.ok=false" -ForegroundColor Yellow }
}

# 6.3 Go Memory Health
Test-Endpoint "$GO_URL/api/v1/memory/health" "6.3 Go Memory Health" | Out-Null

# 6.4 KG Seed
$seedBody = '{}'
try {
    $r = Invoke-RestMethod -Uri "$GO_URL/api/v1/memory/kg/seed" -Method Post -Body $seedBody -ContentType "application/json"
    Write-Host "[OK] 6.4 KG Seed" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 6.4 KG Seed : $_" -ForegroundColor Red
}

# 6.5 KG Nodes
$nodes = Test-Endpoint "$GO_URL/api/v1/memory/kg/nodes?nodeType=Stratagem&limit=36" "6.5 KG Nodes"
if ($nodes) {
    $n = ($nodes.Content | ConvertFrom-Json)
    $count = if ($n.count) { $n.count } elseif ($n.nodes) { $n.nodes.Count } else { "?" }
    Write-Host "  count=$count (expected 36)" -ForegroundColor Gray
}

# 6.6 Cache-Hit (second request should be faster - manual check)
Write-Host "[INFO] 6.6 Cache-Hit: Run kg/nodes twice, second should be faster" -ForegroundColor Gray

# 6.7 Seed invalidates sync - run seed then sync
Write-Host "[INFO] 6.7 Seed invalidates sync: POST seed then GET kg/sync" -ForegroundColor Gray

# 6.8 Vector Search
try {
    $searchBody = '{"query":"test","limit":5}'
    $r = Invoke-RestMethod -Uri "$GO_URL/api/v1/memory/search" -Method Post -Body $searchBody -ContentType "application/json"
    Write-Host "[OK] 6.8 Vector Search" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 6.8 Vector Search : $_" -ForegroundColor Red
}

# 6.9 Episodic
Write-Host "[INFO] 6.9 Episodic: POST episode + GET episodes (requires auth context)" -ForegroundColor Gray

Write-Host "`n=== Done ===" -ForegroundColor Cyan
