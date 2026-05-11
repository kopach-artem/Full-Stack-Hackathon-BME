$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
. "$PSScriptRoot\inditasi_segedlet.ps1"

$pnpm = Get-PnpmCommand

Write-Step "Webes környezet előkészítése"
Ensure-BaseSetup $pnpm

if (Test-BackendHealth) {
  try {
    $null = Invoke-WebRequest "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
    Write-Host "A webes alkalmazás már fut, megnyitás Chrome-ban..." -ForegroundColor DarkGray
    Open-UrlInChrome "http://localhost:5173"
    return
  } catch {
    # A frontend még nem érhető el, indítás szükséges.
  }
}

Write-Step "Frontend és backend indítása új PowerShell ablakban"
$command = "Set-Location '$PSScriptRoot'; & '$pnpm' dev"
Start-BackgroundPowerShell $command

Write-Step "Webes alkalmazás elérhetőségének ellenőrzése"
Wait-ForUrl "http://localhost:5173"

Write-Step "Webes felület megnyitása Chrome-ban"
Open-UrlInChrome "http://localhost:5173"
