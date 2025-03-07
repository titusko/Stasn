# Cleanup script for Monniverse Lagoon project
Write-Host "Starting cleanup process..." -ForegroundColor Cyan

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

# Function to safely remove files/directories
function Remove-SafeItem {
    param (
        [string]$Path,
        [string]$Description,
        [bool]$Required = $false
    )
    
    try {
        if (Test-Path $Path) {
            Write-Host "Removing $Description`: $Path" -ForegroundColor Yellow
            Remove-Item -Path $Path -Recurse -Force
            Write-Host "[SUCCESS] Removed successfully" -ForegroundColor Green
        } else {
            if ($Required) {
                Write-Host "[WARNING] Required item not found: $Path" -ForegroundColor Red
            } else {
                Write-Host "[INFO] Item not found: $Path" -ForegroundColor Gray
            }
        }
    } catch {
        Handle-Error -ErrorMessage "Failed to remove $Path. Error: $_" -Fatal $false
    }
}

# Function to check if a file is in use
function Test-FileInUse {
    param (
        [string]$Path
    )
    
    if (Test-Path $Path) {
        try {
            $fileStream = [System.IO.File]::Open($Path, 'Open', 'Read', 'None')
            $fileStream.Close()
            $fileStream.Dispose()
            return $false
        } catch {
            return $true
        }
    }
    return $false
}

# Create backup before cleanup
Write-Host "`nCreating backup before cleanup..." -ForegroundColor Cyan
$backupDir = "cleanup_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
try {
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
    Copy-Item -Path "frontend", "blockchain", "*.ps1", "*.sh" -Destination $backupDir -Recurse -Force -ErrorAction Stop
    Write-Host "[SUCCESS] Backup created at $backupDir" -ForegroundColor Green
} catch {
    Handle-Error -ErrorMessage "Failed to create backup. Error: $_" -Fatal $true
}

# 1. Remove duplicate configuration files
Write-Host "`nRemoving duplicate configuration files..." -ForegroundColor Cyan
Remove-SafeItem -Path "hardhat.config.ts" -Description "Duplicate Hardhat config"

# 2. Remove unnecessary scripts
Write-Host "`nRemoving unnecessary scripts..." -ForegroundColor Cyan
Remove-SafeItem -Path "deploy.sh" -Description "Unnecessary deployment script"

# 3. Remove redundant environment files
Write-Host "`nRemoving redundant environment files..." -ForegroundColor Cyan
Remove-SafeItem -Path "frontend/.env.example" -Description "Empty environment example file"

# 4. Remove duplicate component directories
Write-Host "`nRemoving duplicate component directories..." -ForegroundColor Cyan
# Check if files have been moved first
if (Test-Path "frontend/src/components") {
    $srcComponentsCount = (Get-ChildItem -Path "frontend/src/components" -Recurse -File).Count
    if (Test-Path "frontend/components") {
        $oldComponentsCount = (Get-ChildItem -Path "frontend/components" -Recurse -File).Count
        if ($srcComponentsCount -ge $oldComponentsCount) {
            Remove-SafeItem -Path "frontend/components" -Description "Duplicate components directory"
        } else {
            Write-Host "[WARNING] Not all components appear to have been moved. Skipping removal." -ForegroundColor Yellow
        }
    }
}

# 5. Remove unused type definitions
Write-Host "`nRemoving unused type definitions..." -ForegroundColor Cyan
# Check if files have been moved first
if (Test-Path "frontend/src/types") {
    $srcTypesCount = (Get-ChildItem -Path "frontend/src/types" -Recurse -File).Count
    if (Test-Path "frontend/types") {
        $oldTypesCount = (Get-ChildItem -Path "frontend/types" -Recurse -File).Count
        if ($srcTypesCount -ge $oldTypesCount) {
            Remove-SafeItem -Path "frontend/types" -Description "Unused types directory"
        } else {
            Write-Host "[WARNING] Not all types appear to have been moved. Skipping removal." -ForegroundColor Yellow
        }
    }
}

# 6. Remove unused contract definitions
Write-Host "`nRemoving unused contract definitions..." -ForegroundColor Cyan
Remove-SafeItem -Path "frontend/contracts" -Description "Unused contracts directory"

# 7. Remove root package.json (since we have separate ones in frontend and blockchain)
Write-Host "`nRemoving root package.json..." -ForegroundColor Cyan
# Check if it's safe to remove
if ((Test-Path "frontend/package.json") -and (Test-Path "blockchain/package.json")) {
    Remove-SafeItem -Path "package.json" -Description "Root package.json"
} else {
    Write-Host "[WARNING] Missing package.json in frontend or blockchain. Keeping root package.json." -ForegroundColor Yellow
}

# 8. Remove any other unnecessary files
Write-Host "`nRemoving other unnecessary files..." -ForegroundColor Cyan
Remove-SafeItem -Path ".replit" -Description "Replit configuration"

# 9. Clean up node_modules in root if present
if (Test-Path "node_modules") {
    Write-Host "`nRemoving root node_modules..." -ForegroundColor Cyan
    if (Test-FileInUse "node_modules") {
        Write-Host "[WARNING] node_modules appears to be in use. Skipping removal." -ForegroundColor Yellow
    } else {
        Remove-SafeItem -Path "node_modules" -Description "Root node_modules directory"
    }
}

# 10. Clean up temporary files
Write-Host "`nRemoving temporary files..." -ForegroundColor Cyan
Remove-SafeItem -Path "*.log" -Description "Log files"
Remove-SafeItem -Path "*.tmp" -Description "Temporary files"

Write-Host "`nCleanup complete!" -ForegroundColor Cyan
Write-Host "Project structure has been optimized." -ForegroundColor Cyan
Write-Host "A backup of the pre-cleanup state was created at $backupDir" -ForegroundColor Cyan 