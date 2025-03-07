# Function to kill process by port
function Kill-ProcessByPort {
    param(
        [int]$Port
    )
    try {
        $processId = (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue).OwningProcess
        if ($processId) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $processId -Force
                Write-Host "Killed process $($process.ProcessName) using port $Port" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "No process found on port $Port" -ForegroundColor Gray
    }
}

Write-Host "Starting cleanup process..." -ForegroundColor Cyan

# Kill processes on development ports (Next.js and Hardhat)
@(3000..3004) + @(8545) | ForEach-Object {
    Kill-ProcessByPort $_
}

# Kill any remaining Node.js processes
Get-Process | Where-Object { $_.ProcessName -eq "node" -or $_.ProcessName -eq "npm" } | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force
        Write-Host "Killed process $($_.ProcessName) with ID $($_.Id)" -ForegroundColor Yellow
    } catch {
        Write-Host "Failed to kill process $($_.ProcessName) with ID $($_.Id)" -ForegroundColor Red
    }
}

# Clean frontend
Write-Host "Cleaning frontend..." -ForegroundColor Cyan
if (Test-Path "frontend") {
    Push-Location frontend
    Remove-Item -Path ".next", "node_modules", ".turbo" -Recurse -Force -ErrorAction SilentlyContinue
    Pop-Location
}

# Clean blockchain
Write-Host "Cleaning blockchain..." -ForegroundColor Cyan
if (Test-Path "blockchain") {
    Push-Location blockchain
    Remove-Item -Path "node_modules", "cache", "artifacts" -Recurse -Force -ErrorAction SilentlyContinue
    Pop-Location
}

# Clean root directory
Write-Host "Cleaning root directory..." -ForegroundColor Cyan
Remove-Item -Path "node_modules", ".pnpm-store" -Recurse -Force -ErrorAction SilentlyContinue

# Clean package manager cache
Write-Host "Cleaning package manager cache..." -ForegroundColor Cyan
pnpm store prune

Write-Host "Cleanup completed successfully!" -ForegroundColor Green 