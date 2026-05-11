$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
. "$PSScriptRoot\inditasi_segedlet.ps1"

$pnpm = Get-PnpmCommand

Write-Step "Webes környezet előkészítése"
Ensure-BaseSetup $pnpm

Write-Step "Frontend és backend indítása"
Invoke-Pnpm $pnpm @("dev")
