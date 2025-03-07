# Ensure we're in the root directory
$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

Write-Host "Starting development environment..." -ForegroundColor Cyan

# Run cleanup first
Write-Host "Running cleanup..." -ForegroundColor Yellow
./scripts/cleanup-all.ps1

# Install pnpm if not installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    pnpm setup
}

# Create store directory if it doesn't exist
$pnpmStore = "$env:LOCALAPPDATA\pnpm\store\v3"
if (!(Test-Path $pnpmStore)) {
    Write-Host "Creating pnpm store directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $pnpmStore -Force | Out-Null
}

# Install and build all packages
Write-Host "Installing dependencies and building packages..." -ForegroundColor Yellow
pnpm install
pnpm run build

# Start Hardhat node in background
Write-Host "Starting Hardhat node..." -ForegroundColor Green
$hardhatJob = Start-Job -ScriptBlock {
    Set-Location "$using:rootDir\blockchain"
    pnpm run node
}

# Wait for Hardhat node to start
Write-Host "Waiting for Hardhat node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Deploy contracts
Write-Host "Deploying contracts..." -ForegroundColor Green
Push-Location blockchain
pnpm run deploy
Pop-Location

# Start frontend in a new window
Write-Host "Starting frontend..." -ForegroundColor Green
Push-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev"
Pop-Location

# Keep the script running and show Hardhat output
Write-Host "Development environment is ready!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all processes" -ForegroundColor Yellow

try {
    # Show Hardhat node output
    Receive-Job -Job $hardhatJob -Wait
} finally {
    # Cleanup on script exit
    Stop-Job -Job $hardhatJob
    Remove-Job -Job $hardhatJob
    ./scripts/cleanup-all.ps1
} 