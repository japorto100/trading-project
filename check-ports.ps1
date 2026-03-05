$ports = @(3000, 9060, 9052, 9053, 8090, 8091, 8092)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        $names = $pids | ForEach-Object { (Get-Process -Id $_ -ErrorAction SilentlyContinue).Name }
        Write-Host "  :$port  BELEGT  PIDs=$($pids -join ',')  ($($names -join ','))"
    } else {
        Write-Host "  :$port  frei"
    }
}
