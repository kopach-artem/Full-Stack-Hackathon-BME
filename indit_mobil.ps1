param(
  [ValidateSet("expo", "android", "ios", "web")]
  [string]$Mod = "web"
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
. "$PSScriptRoot\inditasi_segedlet.ps1"

$pnpm = Get-PnpmCommand

Write-Step "Mobil környezet előkészítése"
Ensure-BaseSetup $pnpm
Ensure-BackendForMobile $pnpm

switch ($Mod) {
  "android" {
    Write-Step "Android emulátoros mobil kliens indítása új PowerShell ablakban"
    $command = "Set-Location '$PSScriptRoot'; & '$pnpm' mobile:android"
    Start-BackgroundPowerShell $command
  }
  "ios" {
    Write-Step "iOS szimulátoros mobil kliens indítása új PowerShell ablakban"
    $command = "Set-Location '$PSScriptRoot'; & '$pnpm' mobile:ios"
    Start-BackgroundPowerShell $command
  }
  "web" {
    try {
      $null = Invoke-WebRequest "http://localhost:8081" -UseBasicParsing -TimeoutSec 2
      Write-Step "Mobil web már fut, megnyitás Chrome-ban"
      Open-UrlInChrome "http://localhost:8081"
      return
    } catch {
      # Expo web még nem fut, indítás szükséges.
    }

    Write-Step "Mobil web kliens indítása Expo alatt új PowerShell ablakban"
    $command = "Set-Location '$PSScriptRoot'; & '$pnpm' --filter mobile start -- --web --clear"
    Start-BackgroundPowerShell $command

    Write-Step "Mobil web elérhetőségének ellenőrzése"
    Wait-ForUrl "http://localhost:8081" -MaxAttempts 45

    Write-Step "Mobil web megnyitása Chrome-ban"
    Open-UrlInChrome "http://localhost:8081"
  }
  default {
    Write-Step "Expo mobil kliens indítása új PowerShell ablakban"
    $command = "Set-Location '$PSScriptRoot'; & '$pnpm' mobile"
    Start-BackgroundPowerShell $command
  }
}
