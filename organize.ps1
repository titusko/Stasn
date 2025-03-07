# Project organization script for Monniverse Lagoon
Write-Host "Starting project organization..." -ForegroundColor Cyan

# Error handling function
function Handle-Error {
    param (
        [string]$ErrorMessage,
        [bool]$Fatal = $false
    )
    
    Write-Host "ERROR: $ErrorMessage" -ForegroundColor Red
    if ($Fatal) {
        Write-Host "Fatal error encountered. Exiting script." -ForegroundColor Red
        exit 1
    }
}

# Function to ensure directory exists
function Ensure-Directory {
    param (
        [string]$Path,
        [string]$Description
    )
    
    try {
        if (-not (Test-Path $Path)) {
            Write-Host "Creating $Description`: $Path" -ForegroundColor Yellow
            New-Item -Path $Path -ItemType Directory -Force | Out-Null
            Write-Host "[SUCCESS] Created successfully" -ForegroundColor Green
        } else {
            Write-Host "[SUCCESS] $Description already exists: $Path" -ForegroundColor Green
        }
    } catch {
        Handle-Error -ErrorMessage "Failed to create directory $Path. Error: $_" -Fatal $false
    }
}

# Function to copy files if they exist
function Copy-SafeItem {
    param (
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )
    
    try {
        if (Test-Path $Source) {
            Write-Host "Copying $Description from $Source to $Destination" -ForegroundColor Yellow
            Copy-Item -Path $Source -Destination $Destination -Recurse -Force
            Write-Host "[SUCCESS] Copied successfully" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Source not found: $Source" -ForegroundColor Red
        }
    } catch {
        Handle-Error -ErrorMessage "Failed to copy from $Source to $Destination. Error: $_" -Fatal $false
    }
}

# Function to verify npm packages are installed
function Verify-Dependencies {
    param (
        [string]$Directory,
        [string]$Description
    )
    
    try {
        if (Test-Path "$Directory/node_modules") {
            Write-Host "[SUCCESS] Dependencies already installed in $Description" -ForegroundColor Green
        } else {
            Write-Host "Installing dependencies in $Description..." -ForegroundColor Yellow
            $currentLocation = Get-Location
            Set-Location -Path $Directory
            npm install
            if ($LASTEXITCODE -ne 0) {
                Handle-Error -ErrorMessage "npm install failed in $Directory" -Fatal $false
            } else {
                Write-Host "[SUCCESS] Dependencies installed in $Description" -ForegroundColor Green
            }
            Set-Location -Path $currentLocation
        }
    } catch {
        Handle-Error -ErrorMessage "Failed to verify dependencies in $Directory. Error: $_" -Fatal $false
    }
}

# 1. Ensure proper directory structure
Write-Host "`nCreating directory structure..." -ForegroundColor Cyan
Ensure-Directory -Path "frontend/src/components" -Description "Components directory"
Ensure-Directory -Path "frontend/src/contexts" -Description "Contexts directory"
Ensure-Directory -Path "frontend/src/hooks" -Description "Hooks directory"
Ensure-Directory -Path "frontend/src/types" -Description "Types directory"
Ensure-Directory -Path "frontend/src/utils" -Description "Utils directory"
Ensure-Directory -Path "frontend/src/services" -Description "Services directory"
Ensure-Directory -Path "blockchain/contracts" -Description "Contracts directory"
Ensure-Directory -Path "blockchain/scripts" -Description "Deployment scripts directory"
Ensure-Directory -Path "blockchain/test" -Description "Contract tests directory"

# 2. Move files from old locations to new ones if needed
Write-Host "`nReorganizing files..." -ForegroundColor Cyan
if (Test-Path "frontend/components") {
    try {
        Get-ChildItem -Path "frontend/components" -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Replace((Get-Item "frontend/components").FullName + "\", "")
            $destination = Join-Path "frontend/src/components" $relativePath
            
            if ($_.PSIsContainer) {
                Ensure-Directory -Path $destination -Description "Component subdirectory"
            } else {
                $destinationDir = Split-Path $destination -Parent
                if (-not (Test-Path $destinationDir)) {
                    New-Item -Path $destinationDir -ItemType Directory -Force | Out-Null
                }
                Copy-Item -Path $_.FullName -Destination $destination -Force
                Write-Host "Moved component file: $relativePath" -ForegroundColor Green
            }
        }
    } catch {
        Handle-Error -ErrorMessage "Failed to move component files. Error: $_" -Fatal $false
    }
}

if (Test-Path "frontend/types") {
    try {
        Get-ChildItem -Path "frontend/types" -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Replace((Get-Item "frontend/types").FullName + "\", "")
            $destination = Join-Path "frontend/src/types" $relativePath
            
            if ($_.PSIsContainer) {
                Ensure-Directory -Path $destination -Description "Types subdirectory"
            } else {
                $destinationDir = Split-Path $destination -Parent
                if (-not (Test-Path $destinationDir)) {
                    New-Item -Path $destinationDir -ItemType Directory -Force | Out-Null
                }
                Copy-Item -Path $_.FullName -Destination $destination -Force
                Write-Host "Moved type file: $relativePath" -ForegroundColor Green
            }
        }
    } catch {
        Handle-Error -ErrorMessage "Failed to move type files. Error: $_" -Fatal $false
    }
}

# 3. Verify dependencies are installed
Write-Host "`nVerifying dependencies..." -ForegroundColor Cyan
Verify-Dependencies -Directory "frontend" -Description "Frontend"
Verify-Dependencies -Directory "blockchain" -Description "Blockchain"

# 4. Create a consolidated start script with error handling
Write-Host "`nCreating start script..." -ForegroundColor Cyan
$startScriptContent = @"
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Error handling function
handle_error() {
  echo -e "${RED}ERROR: \$1${NC}"
  if [ "\$2" = "fatal" ]; then
    echo -e "${RED}Fatal error. Exiting...${NC}"
    # Kill any background processes before exiting
    if [ ! -z "\$HARDHAT_PID" ]; then
      echo "Cleaning up Hardhat process..."
      kill \$HARDHAT_PID 2>/dev/null
    fi
    exit 1
  fi
}

echo -e "${BLUE}Starting Monniverse Lagoon Platform...${NC}"

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { handle_error "npm is required but not installed." "fatal"; }
command -v node >/dev/null 2>&1 || { handle_error "node is required but not installed." "fatal"; }

# Step 1: Start Hardhat node
echo -e "\n${GREEN}Step 1: Starting Hardhat node...${NC}"
cd blockchain || handle_error "Cannot find blockchain directory" "fatal"
npm run node > ../hardhat.log 2>&1 &
HARDHAT_PID=\$!

# Check if Hardhat started successfully
sleep 3
if ! ps -p \$HARDHAT_PID > /dev/null; then
  handle_error "Hardhat node failed to start. Check hardhat.log for details." "fatal"
fi

echo -e "${YELLOW}Hardhat node started with PID: \$HARDHAT_PID${NC}"
echo "Waiting for Hardhat node to initialize..."
sleep 5

# Step 2: Deploy contracts if needed
echo -e "\n${GREEN}Step 2: Checking if contracts need deployment...${NC}"
if [ ! -f ../frontend/.env.local ] || ! grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" ../frontend/.env.local; then
  echo "Deploying contracts..."
  npm run deploy || handle_error "Contract deployment failed" "fatal"
  
  # Verify deployment was successful
  if [ ! -f ../frontend/.env.local ] || ! grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" ../frontend/.env.local; then
    handle_error "Contract address not found in .env.local after deployment" "fatal"
  fi
else
  echo "Contracts already deployed. Using existing address."
fi

# Step 3: Start frontend
echo -e "\n${GREEN}Step 3: Starting frontend...${NC}"
cd ../frontend || handle_error "Cannot find frontend directory" "fatal"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install || handle_error "Failed to install frontend dependencies" "fatal"
fi

# Start the frontend
npm run dev

# Cleanup when frontend is stopped
echo -e "\n${YELLOW}Cleaning up...${NC}"
if [ ! -z "\$HARDHAT_PID" ]; then
  echo "Stopping Hardhat node (PID: \$HARDHAT_PID)..."
  kill \$HARDHAT_PID 2>/dev/null
  echo "Cleanup complete."
fi
"@

try {
    Set-Content -Path "start.sh" -Value $startScriptContent
    Write-Host "[SUCCESS] Created consolidated start script with error handling" -ForegroundColor Green
} catch {
    Handle-Error -ErrorMessage "Failed to create start script. Error: $_" -Fatal $false
}

# 5. Create a backup of the project
Write-Host "`nCreating project backup..." -ForegroundColor Cyan
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
try {
    Ensure-Directory -Path $backupDir -Description "Backup directory"
    Copy-Item -Path "frontend", "blockchain", "*.ps1", "*.sh" -Destination $backupDir -Recurse -Force -ErrorAction Stop
    Write-Host "[SUCCESS] Project backup created at $backupDir" -ForegroundColor Green
} catch {
    Handle-Error -ErrorMessage "Failed to create backup. Error: $_" -Fatal $false
}

Write-Host "`nProject organization complete!" -ForegroundColor Cyan
Write-Host "Run './cleanup.ps1' to remove unnecessary files" -ForegroundColor Cyan
Write-Host "Run './start.sh' to start the application" -ForegroundColor Cyan 