$ErrorActionPreference = "Stop"

param(
	[string]$Exchange = "Binance",
	[string]$SpotPair = "BTC-USDT",
	[string]$DataDir = "D:\\Temp\\gct-data",
	[string]$GctUsername = "admin",
	[string]$GctPassword = "Password"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$goBackendDir = Resolve-Path (Join-Path $scriptDir "..")
$gctDir = Join-Path $goBackendDir "vendor-forks\\gocryptotrader"
$gctExe = Join-Path $gctDir "gocryptotrader.exe"

if (-not (Test-Path $gctExe)) {
	throw "Missing gocryptotrader.exe at $gctExe. Build it with: go build . (inside vendor-forks\\gocryptotrader)"
}

New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
$configTemplate = Join-Path $gctDir "config_example.json"
$configPath = Join-Path $DataDir "config.min.json"

$config = Get-Content $configTemplate -Raw | ConvertFrom-Json
$config.dataDirectory = $DataDir
$config.ntpclient.enabled = 0
$config.remoteControl.username = $GctUsername
$config.remoteControl.password = $GctPassword
$config.remoteControl.gRPC.enabled = $true
$config.remoteControl.gRPC.listenAddress = "127.0.0.1:9052"
$config.remoteControl.gRPC.grpcProxyEnabled = $true
$config.remoteControl.gRPC.grpcProxyListenAddress = "127.0.0.1:9053"
$config.remoteControl.gRPC.grpcAllowBotShutdown = $false
$config.remoteControl.gRPC.timeInNanoSeconds = $false

foreach ($exchangeConfig in $config.exchanges) {
	$isTarget = $exchangeConfig.name -eq $Exchange
	$exchangeConfig.enabled = $isTarget

	if ($isTarget -and
		$null -ne $exchangeConfig.currencyPairs -and
		$null -ne $exchangeConfig.currencyPairs.pairs -and
		$null -ne $exchangeConfig.currencyPairs.pairs.spot) {
		$exchangeConfig.currencyPairs.pairs.spot.enabled = $SpotPair
	}
}

$config | ConvertTo-Json -Depth 100 | Set-Content -Path $configPath -NoNewline

$oldHttpProxy = $env:HTTP_PROXY
$oldHttpsProxy = $env:HTTPS_PROXY
$oldAllProxy = $env:ALL_PROXY

$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""

$env:GCT_GRPC_ADDRESS = "127.0.0.1:9052"
$env:GCT_JSONRPC_ADDRESS = "https://127.0.0.1:9053"
$env:GCT_USERNAME = $GctUsername
$env:GCT_PASSWORD = $GctPassword
$env:GCT_JSONRPC_INSECURE_TLS = "true"
$env:GCT_HTTP_TIMEOUT_MS = "4000"
$env:GCT_HTTP_RETRIES = "1"
$env:GCT_PREFER_GRPC = "true"

$gctArgs = @(
	"-config", $configPath,
	"-datadir", $DataDir,
	"-ntpclient=false",
	"-grpcproxy",
	"-exchanges", $Exchange
)

$gctProcess = $null
$gatewayProcess = $null

try {
	Write-Host "Starting GCT minimal profile ($Exchange / $SpotPair)..."
	$gctProcess = Start-Process -FilePath $gctExe -ArgumentList $gctArgs -WorkingDirectory $gctDir -PassThru
	Start-Sleep -Seconds 10

	Write-Host "Starting gateway..."
	$gatewayProcess = Start-Process -FilePath "go" -ArgumentList @("run", "./cmd/gateway") -WorkingDirectory $goBackendDir -PassThru
	Start-Sleep -Seconds 2

	Write-Host "GCT PID: $($gctProcess.Id)"
	Write-Host "Gateway PID: $($gatewayProcess.Id)"
	Write-Host "Health: http://127.0.0.1:9060/health"
	Write-Host "Quote:  http://127.0.0.1:9060/api/v1/quote?symbol=BTC/USDT&exchange=binance&assetType=spot"
	Write-Host "Press Ctrl+C to stop both processes."

	Wait-Process -Id $gatewayProcess.Id
}
finally {
	if ($null -ne $gatewayProcess) {
		Stop-Process -Id $gatewayProcess.Id -Force -ErrorAction SilentlyContinue
	}
	if ($null -ne $gctProcess) {
		Stop-Process -Id $gctProcess.Id -Force -ErrorAction SilentlyContinue
	}

	$env:HTTP_PROXY = $oldHttpProxy
	$env:HTTPS_PROXY = $oldHttpsProxy
	$env:ALL_PROXY = $oldAllProxy
}
