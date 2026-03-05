# Kill all stack services by port, then clean up known process names.
# Ports: Go :9060, OO :5080/:5081, Python services :8081/:8091-8094, Next :3000, GCT :9052
$stackPorts = @(3000, 5080, 5081, 8081, 8091, 8092, 8093, 8094, 9052, 9060)

foreach ($port in $stackPorts) {
    $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) {
        if ($p -and (Get-Process -Id $p -ErrorAction SilentlyContinue)) {
            Write-Host "Killing port $port (PID $p)"
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

# Kill Python sub-processes (uvicorn workers spawned by uv run) not caught by port scan
Get-Process -Name "python","python3" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Killing Python PID $($_.Id)"
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Kill air / go gateway binary
Get-Process -Name "air","main" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Killing $($_.Name) PID $($_.Id)"
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 500
Write-Host "All stack ports cleared"
