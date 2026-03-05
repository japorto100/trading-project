$envFile = "D:\tradingview-clones\tradeview-fusion\go-backend\.env.development"
Set-Location "D:\tradingview-clones\tradeview-fusion\go-backend"
Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -and -not $line.StartsWith("#") -and $line -match '^\s*([^#=]+)=(.*)$') {
    $k = $matches[1].Trim()
    $v = $matches[2].Trim()
    $v = $v -replace '^[\"'']|[\"'']$',''
    [Environment]::SetEnvironmentVariable($k, $v, 'Process')
  }
}
$env:GATEWAY_PORT='9061'
$env:AUTH_STACK_BYPASS='false'
$env:NEXT_PUBLIC_AUTH_STACK_BYPASS='false'
$env:AUTH_RBAC_ENFORCE='true'
go run ./cmd/gateway
