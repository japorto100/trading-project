$natsDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$natsExe = Join-Path $natsDir "nats-server.exe"
if (-not (Test-Path $natsExe)) {
    $version = "v2.10.24"
    $url = "https://github.com/nats-io/nats-server/releases/download/$version/nats-server-$version-windows-amd64.zip"
    $zip = Join-Path $natsDir "nats-server.zip"
    Write-Host "[nats] Downloading $version..."
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $natsDir -Force
    Remove-Item $zip
    $extracted = Get-ChildItem $natsDir -Recurse -Filter "nats-server.exe" | Select-Object -First 1
    if ($extracted -and $extracted.FullName -ne $natsExe) {
        Move-Item $extracted.FullName $natsExe -Force
        Remove-Item (Split-Path $extracted.FullName -Parent) -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[nats] Installed: $natsExe"
} else {
    Write-Host "[nats] Already installed."
}
& $natsExe --version
