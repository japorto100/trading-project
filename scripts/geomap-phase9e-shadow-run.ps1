param(
	[string]$GatewayBaseUrl = "http://127.0.0.1:9060",
	[string]$NextBaseUrl = "http://127.0.0.1:3000",
	[string]$Actor = "phase9e-shadow-runner",
	[string]$Role = "analyst",
	[int]$HardRuns = 5,
	[int]$SoftRuns = 5,
	[int]$DelaySeconds = 2,
	[switch]$VerifyNextAliases
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section([string]$Text) {
	Write-Host ""
	Write-Host "=== $Text ===" -ForegroundColor Cyan
}

function New-GeoHeaders {
	param([string]$RequestId)
	$headers = @{
		"X-Request-ID" = $RequestId
		"x-user-role" = $Role
		"x-auth-user" = $Actor
		"x-geo-actor" = $Actor
		"Accept" = "application/json"
	}
	return $headers
}

function Invoke-GeoJson {
	param(
		[string]$Method,
		[string]$Url,
		[hashtable]$Headers,
		[object]$Body = $null
	)

	$jsonBody = $null
	if ($null -ne $Body) {
		$jsonBody = ($Body | ConvertTo-Json -Depth 8)
	}

	$params = @{
		Method = $Method
		Uri = $Url
		Headers = $Headers
		ContentType = "application/json"
	}
	if ($null -ne $jsonBody) {
		$params["Body"] = $jsonBody
	}

	return Invoke-RestMethod @params
}

function Invoke-GeoWeb {
	param(
		[string]$Method,
		[string]$Url,
		[hashtable]$Headers,
		[object]$Body = $null
	)

	$jsonBody = $null
	if ($null -ne $Body) {
		$jsonBody = ($Body | ConvertTo-Json -Depth 8)
	}

	$params = @{
		Method = $Method
		Uri = $Url
		Headers = $Headers
		ContentType = "application/json"
	}
	if ($null -ne $jsonBody) {
		$params["Body"] = $jsonBody
	}

	return Invoke-WebRequest @params
}

function Invoke-Loop {
	param(
		[string]$Kind,
		[int]$Count,
		[string]$Endpoint,
		[object]$Body = $null
	)

	$results = @()
	for ($i = 1; $i -le $Count; $i++) {
		$requestId = [guid]::NewGuid().ToString()
		$headers = New-GeoHeaders -RequestId $requestId
		Write-Host ("[{0}] run {1}/{2} -> {3}" -f $Kind, $i, $Count, $Endpoint)
		try {
			$response = Invoke-GeoJson -Method "POST" -Url $Endpoint -Headers $headers -Body $Body
			$runId = $null
			$mode = $null
			$createdCount = $null
			if ($response -and $response.PSObject -and $response.PSObject.Properties["runId"]) {
				$runId = $response.runId
			}
			if ($response -and $response.PSObject -and $response.PSObject.Properties["mode"]) {
				$mode = $response.mode
			}
			if ($response -and $response.PSObject -and $response.PSObject.Properties["createdCount"]) {
				$createdCount = $response.createdCount
			}
			$results += [pscustomobject]@{
				Kind = $Kind
				Ok = $true
				RequestId = $requestId
				CreatedCount = $createdCount
				RunId = $runId
				Mode = $mode
			}
		} catch {
			$results += [pscustomobject]@{
				Kind = $Kind
				Ok = $false
				RequestId = $requestId
				Error = $_.Exception.Message
			}
		}
		if ($i -lt $Count -and $DelaySeconds -gt 0) {
			Start-Sleep -Seconds $DelaySeconds
		}
	}
	return $results
}

Write-Section "Phase 9e Shadow-Run Preconditions"
Write-Host "GatewayBaseUrl: $GatewayBaseUrl"
Write-Host "NextBaseUrl:    $NextBaseUrl"
Write-Host "Actor/Role:     $Actor / $Role"
Write-Host "HardRuns/SoftRuns/Delay: $HardRuns / $SoftRuns / ${DelaySeconds}s"
Write-Host ""
Write-Host "Expected gateway env (before run):" -ForegroundColor Yellow
Write-Host "  GEOPOLITICAL_INGEST_SHADOW_COMPARE=1"
Write-Host "  GEOPOLITICAL_INGEST_HARD_MODE=next-proxy"
Write-Host "  GEOPOLITICAL_INGEST_SOFT_MODE=next-proxy"
Write-Host "  GEOPOLITICAL_ADMIN_SEED_MODE=next-proxy+go-sync"

$seedHeaders = New-GeoHeaders -RequestId ([guid]::NewGuid().ToString())
$readHeaders = New-GeoHeaders -RequestId ([guid]::NewGuid().ToString())

Write-Section "Baseline: migration/status (before seed)"
$statusBefore = Invoke-GeoJson -Method "GET" -Url "$GatewayBaseUrl/api/v1/geopolitical/migration/status" -Headers $readHeaders
$statusBefore | ConvertTo-Json -Depth 8

Write-Section "Seed (admin)"
$seedBody = @{
	targets = @{
		events = 50
		candidates = 200
		contradictions = 10
	}
}
$seedResponse = Invoke-GeoJson -Method "POST" -Url "$GatewayBaseUrl/api/v1/geopolitical/admin/seed" -Headers $seedHeaders -Body $seedBody
$seedResponse | ConvertTo-Json -Depth 8

Write-Section "Baseline: migration/status (after seed)"
$statusAfterSeed = Invoke-GeoJson -Method "GET" -Url "$GatewayBaseUrl/api/v1/geopolitical/migration/status" -Headers (New-GeoHeaders -RequestId ([guid]::NewGuid().ToString()))
$statusAfterSeed | ConvertTo-Json -Depth 8

Write-Section "Shadow-Run: hard ingest"
$hardResults = Invoke-Loop -Kind "hard" -Count $HardRuns -Endpoint "$GatewayBaseUrl/api/v1/geopolitical/ingest/hard"
$hardResults | Format-Table -AutoSize

Write-Section "Shadow-Run: soft ingest"
$softResults = Invoke-Loop -Kind "soft" -Count $SoftRuns -Endpoint "$GatewayBaseUrl/api/v1/geopolitical/ingest/soft"
$softResults | Format-Table -AutoSize

Write-Section "Ingest Runs (latest 50)"
$runs = Invoke-GeoJson -Method "GET" -Url "$GatewayBaseUrl/api/v1/geopolitical/ingest/runs?limit=50" -Headers (New-GeoHeaders -RequestId ([guid]::NewGuid().ToString()))
$runs | ConvertTo-Json -Depth 10

Write-Section "Migration Status (post-runs)"
$statusAfterRuns = Invoke-GeoJson -Method "GET" -Url "$GatewayBaseUrl/api/v1/geopolitical/migration/status" -Headers (New-GeoHeaders -RequestId ([guid]::NewGuid().ToString()))
$statusAfterRuns | ConvertTo-Json -Depth 10

Write-Section "Summary (local)"
$allResults = @($hardResults + $softResults)
$failed = @($allResults | Where-Object { -not $_.Ok })
$succeeded = @($allResults | Where-Object { $_.Ok })
Write-Host ("Succeeded runs: {0}" -f $succeeded.Count)
Write-Host ("Failed runs:    {0}" -f $failed.Count)
if ($failed.Count -gt 0) {
	Write-Host "Failures:" -ForegroundColor Yellow
	$failed | Format-Table -AutoSize
}

Write-Section "Cutover Commands (manual, after reviewing runs)"
Write-Host "Set these on the Go Gateway process and restart it:" -ForegroundColor Yellow
Write-Host "  GEOPOLITICAL_INGEST_HARD_MODE=go-owned-gateway-v1"
Write-Host "  GEOPOLITICAL_INGEST_SOFT_MODE=go-owned-gateway-v1"
Write-Host "  GEOPOLITICAL_ADMIN_SEED_MODE=go-owned-gateway-v1   # optional, after seed verification"

if ($VerifyNextAliases) {
	Write-Section "Next Alias Verification (thin proxy headers)"
	$checks = @(
		@{ Name = "Candidates GET"; Method = "GET"; Url = "$NextBaseUrl/api/geopolitical/candidates?state=open&limit=20" },
		@{ Name = "Timeline GET"; Method = "GET"; Url = "$NextBaseUrl/api/geopolitical/timeline?limit=20" },
		@{ Name = "Contradictions GET"; Method = "GET"; Url = "$NextBaseUrl/api/geopolitical/contradictions?state=open" }
	)
	foreach ($check in $checks) {
		try {
			$response = Invoke-GeoWeb -Method $check.Method -Url $check.Url -Headers (New-GeoHeaders -RequestId ([guid]::NewGuid().ToString()))
			$thinProxyHeader = $response.Headers["X-GeoMap-Next-Route"]
			Write-Host ("{0}: HTTP {1}, X-GeoMap-Next-Route={2}" -f $check.Name, $response.StatusCode, $thinProxyHeader)
		} catch {
			Write-Host ("{0}: FAILED -> {1}" -f $check.Name, $_.Exception.Message) -ForegroundColor Yellow
		}
	}
}

Write-Section "Done"
Write-Host "Review /api/v1/geopolitical/ingest/runs and /api/v1/geopolitical/migration/status outputs above before cutover."
