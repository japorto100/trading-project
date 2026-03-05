try {
    $null = [scriptblock]::Create((Get-Content "$PSScriptRoot\scripts\dev-stack.ps1" -Raw))
    Write-Host "SYNTAX OK" -ForegroundColor Green
} catch {
    Write-Host "SYNTAX ERROR: $_" -ForegroundColor Red
}
