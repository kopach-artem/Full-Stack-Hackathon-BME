$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Get-PnpmCommand {
  $pnpmFromNpm = Join-Path $env:APPDATA "npm\pnpm.cmd"

  if (Test-Path $pnpmFromNpm) {
    return $pnpmFromNpm
  }

  return "pnpm"
}

$pnpm = Get-PnpmCommand

Write-Host ""
Write-Host "===> Automata tesztek előkészítése" -ForegroundColor Cyan

if (-not (Test-Path "backend/.env")) {
  Write-Host "backend/.env nem található, másolás az .env.example alapján..." -ForegroundColor Yellow
  Copy-Item "backend/.env.example" "backend/.env"
}

Write-Host "PostgreSQL indítása Docker Compose segítségével..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Függőségek ellenőrzése / telepítése..." -ForegroundColor Cyan
& $pnpm install

Write-Host "Prisma migráció futtatása..." -ForegroundColor Cyan
& $pnpm db:migrate

Write-Host "Seed adatok betöltése..." -ForegroundColor Cyan
& $pnpm db:seed

Write-Host "Playwright E2E tesztek futtatása..." -ForegroundColor Cyan
& $pnpm test:e2e

Write-Host ""
Write-Host "Az automata tesztek lefutottak." -ForegroundColor Green
