$tcp9052 = New-Object System.Net.Sockets.TcpClient
try {
    $tcp9052.Connect("127.0.0.1", 9052)
    Write-Host "  :9052 gRPC        -> TCP OK" -ForegroundColor Green
    $tcp9052.Close()
} catch {
    Write-Host "  :9052 gRPC        -> FAIL: $_" -ForegroundColor Red
}

$tcp9053 = New-Object System.Net.Sockets.TcpClient
try {
    $tcp9053.Connect("127.0.0.1", 9053)
    Write-Host "  :9053 gRPC-Proxy  -> TCP OK" -ForegroundColor Green
    $tcp9053.Close()
} catch {
    Write-Host "  :9053 gRPC-Proxy  -> FAIL: $_" -ForegroundColor Red
}

$proc = Get-Process -Name "gocryptotrader" -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "  Process: gocryptotrader PID=$($proc.Id) CPU=$([math]::Round($proc.CPU,1))s MEM=$([math]::Round($proc.WorkingSet/1MB,1))MB" -ForegroundColor Green
} else {
    Write-Host "  Process: gocryptotrader NOT FOUND" -ForegroundColor Red
}
