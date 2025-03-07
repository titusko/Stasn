# Function to kill process by port
function Kill-ProcessByPort {
    param(
        [int]$Port
    )
    $processId = (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue).OwningProcess
    if ($processId) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $processId -Force
            Write-Host "Killed process $($process.ProcessName) using port $Port" -ForegroundColor Yellow
        }
    }
}

Write-Host "Starting cleanup process..." -ForegroundColor Cyan

# Kill processes on development ports
3000..3004 | ForEach-Object {
    Kill-ProcessByPort $_
}

# Kill any remaining Node.js processes
Get-Process | Where-Object { $_.ProcessName -eq "node" } | ForEach-Object {
    Stop-Process -Id $_.Id -Force
    Write-Host "Killed Node.js process with ID $($_.Id)" -ForegroundColor Yellow
}

# Remove development server artifacts
Write-Host "Removing development artifacts..." -ForegroundColor Cyan
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Remove deprecated @next/font package
Write-Host "Removing deprecated packages..." -ForegroundColor Cyan
npm uninstall @next/font --save

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "Cleanup completed successfully!" -ForegroundColor Green 