param(
  [ValidateSet("expo", "android", "ios", "web")]
  [string]$Mod = "expo"
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
    Write-Step "Android emulátoros mobil kliens indítása"
    Invoke-Pnpm $pnpm @("mobile:android")
  }
  "ios" {
    Write-Step "iOS szimulátoros mobil kliens indítása"
    Invoke-Pnpm $pnpm @("mobile:ios")
  }
  "web" {
    Write-Step "Mobil web kliens indítása Expo alatt"
    Invoke-Pnpm $pnpm @("--filter", "mobile", "start", "--", "--web", "--clear")
  }
  default {
    Write-Step "Expo mobil kliens indítása"
    Invoke-Pnpm $pnpm @("mobile")
  }
}
