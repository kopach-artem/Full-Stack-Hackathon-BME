$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step {
  param([string]$Message)

  Write-Host ""
  Write-Host "===> $Message" -ForegroundColor Cyan
}

function Get-PnpmCommand {
  $pnpmFromNpm = Join-Path $env:APPDATA "npm\pnpm.cmd"

  if (Test-Path $pnpmFromNpm) {
    return $pnpmFromNpm
  }

  $pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
  if ($pnpmCommand) {
    return $pnpmCommand.Source
  }

  throw "pnpm nem található. Telepítsd a pnpm-et, vagy Windows alatt futtasd: npm install -g pnpm"
}

function Invoke-Pnpm {
  param(
    [string]$Pnpm,
    [string[]]$Arguments
  )

  & $Pnpm @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "A pnpm parancs hibával lépett ki: $($Arguments -join ' ')"
  }
}

function Ensure-BackendEnv {
  if (-not (Test-Path "backend/.env")) {
    Write-Host "backend/.env nem található, másolás az .env.example alapján..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
  }
}

function Ensure-Dependencies {
  param([string]$Pnpm)

  if (-not (Test-Path "node_modules")) {
    Write-Step "Függőségek telepítése"
    Invoke-Pnpm $Pnpm @("install")
    return
  }

  Write-Host "A node_modules már létezik, a telepítés kihagyva." -ForegroundColor DarkGray
}

function Ensure-DockerAvailable {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "A docker parancs nem található. Telepítsd és indítsd el a Docker Desktop alkalmazást."
  }
}

function Get-PostgresContainerName {
  return "bme-hackathon-postgres"
}

function Wait-ForPostgres {
  $containerName = Get-PostgresContainerName

  for ($i = 0; $i -lt 30; $i++) {
    $status = docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerName 2>$null
    if ($status -match "healthy|running") {
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "A PostgreSQL konténer nem állt készen időben."
}

function Ensure-PostgresRunning {
  Ensure-DockerAvailable

  $containerName = Get-PostgresContainerName
  $existingContainer = docker ps -a --filter "name=^${containerName}$" --format "{{.Names}}" | Select-Object -First 1

  if ($existingContainer -eq $containerName) {
    $runningContainer = docker ps --filter "name=^${containerName}$" --format "{{.Names}}" | Select-Object -First 1

    if ($runningContainer -ne $containerName) {
      Write-Step "Meglévő PostgreSQL konténer indítása"
      docker start $containerName | Out-Null
    } else {
      Write-Host "A PostgreSQL konténer már fut." -ForegroundColor DarkGray
    }
  } else {
    Write-Step "PostgreSQL indítása Docker Compose segítségével"
    docker compose up -d
  }

  Wait-ForPostgres
}

function Ensure-DatabaseReady {
  param([string]$Pnpm)

  Write-Step "Prisma migráció futtatása"
  Invoke-Pnpm $Pnpm @("db:migrate")

  Write-Step "Seed adatok betöltése"
  Invoke-Pnpm $Pnpm @("db:seed")
}

function Test-BackendHealth {
  try {
    $null = Invoke-WebRequest "http://localhost:4000/api/health" -UseBasicParsing -TimeoutSec 2
    return $true
  } catch {
    return $false
  }
}

function Ensure-BackendForMobile {
  param([string]$Pnpm)

  if (Test-BackendHealth) {
    Write-Host "A backend API már elérhető a 4000-es porton." -ForegroundColor DarkGray
    return
  }

  Write-Step "Backend fejlesztői szerver indítása a mobil klienshez"
  $command = "Set-Location '$PSScriptRoot'; & '$Pnpm' --filter backend dev"
  Start-Process powershell -ArgumentList @("-NoLogo", "-NoProfile", "-Command", $command) -WindowStyle Hidden

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    if (Test-BackendHealth) {
      return
    }
  }

  throw "A backend nem indult el időben a mobil klienshez."
}

function Ensure-BaseSetup {
  param([string]$Pnpm)

  Ensure-BackendEnv
  Ensure-Dependencies $Pnpm
  Ensure-PostgresRunning
  Ensure-DatabaseReady $Pnpm
}
