# Change to the frontend directory
Set-Location -Path $PSScriptRoot/..

# Run cleanup first
./scripts/cleanup.ps1

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev 