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

  $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
  if (-not $npmCommand) {
    throw "Sem a pnpm, sem az npm nem található. Telepítsd a Node.js-t npm támogatással."
  }

  Write-Step "Globális pnpm telepítése npm segítségével"
  & $npmCommand.Source install -g pnpm
  if ($LASTEXITCODE -ne 0) {
    throw "A pnpm automatikus telepítése nem sikerült."
  }

  if (Test-Path $pnpmFromNpm) {
    return $pnpmFromNpm
  }

  throw "A pnpm telepítése után sem található a várt elérési úton: $pnpmFromNpm"
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

function Wait-ForUrl {
  param(
    [string]$Url,
    [int]$MaxAttempts = 30,
    [int]$DelaySeconds = 2
  )

  for ($i = 0; $i -lt $MaxAttempts; $i++) {
    try {
      $null = Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 2
      return
    } catch {
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  throw "A várt URL nem vált elérhetővé időben: $Url"
}

function Get-ChromeExecutable {
  $candidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
  ) | Where-Object { $_ -and (Test-Path $_) }

  if ($candidates.Count -gt 0) {
    return $candidates[0]
  }

  $chromeCommand = Get-Command chrome.exe -ErrorAction SilentlyContinue
  if ($chromeCommand) {
    return $chromeCommand.Source
  }

  return $null
}

function Open-UrlInChrome {
  param([string]$Url)

  $chrome = Get-ChromeExecutable
  if ($chrome) {
    Start-Process -FilePath $chrome -ArgumentList $Url | Out-Null
    return
  }

  Start-Process $Url | Out-Null
}

function Start-BackgroundPowerShell {
  param([string]$Command)

  Start-Process powershell -ArgumentList @(
    "-NoLogo",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-NoExit",
    "-Command",
    $Command
  ) | Out-Null
}
