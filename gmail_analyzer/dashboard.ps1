<#
.SYNOPSIS
    Gmail Personal Analyzer Dashboard Launcher

.DESCRIPTION
    Starts the dedicated Gmail Intelligence & Analyzer backend
    (FastAPI on port 8001), launches the React + Vite frontend (port 5174),
    opens http://localhost:5174/?console=gmail, and monitors services with graceful shutdown.

.EXAMPLE
    .\gmail_analyzer\dashboard.ps1        # Launches Gmail analyzer dashboard & opens browser
    .\gmail_analyzer\dashboard.ps1 -Stop  # Stops running dashboard services
#>

param (
    [switch]$Stop
)

$gmailDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $gmailDir
Set-Location $projectRoot

function Stop-GmailDashboardServices {
    Write-Host "`nStopping Gmail analyzer services on ports 8001 and 5174..." -ForegroundColor Yellow
    foreach ($port in @(8001, 5174)) {
        try {
            $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($conns) {
                $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
                foreach ($pidToKill in $pids) {
                    if ($pidToKill -gt 0) {
                        Write-Host "  Stopping PID $pidToKill (Port $port)..." -ForegroundColor Gray
                        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                    }
                }
            }
        } catch {
            # Ignore network lookup errors
        }
    }
    Write-Host "Gmail analyzer services stopped." -ForegroundColor Green
}

if ($Stop) {
    Stop-GmailDashboardServices
    exit 0
}

# Clean start
Stop-GmailDashboardServices

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Launching Gmail Personal Analyzer Dashboard         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Dedicated Gmail FastAPI Backend on Port 8001
Write-Host "`n[1/3] Starting Gmail Analyzer Backend on http://localhost:8001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = 'Gmail Analyzer Backend [Port 8001]'; .\backend\.venv\Scripts\python -m uvicorn gmail_analyzer.main:app --reload --port 8001"

# 2. Start Dedicated Gmail React + Vite Frontend on Port 5174
Write-Host "[2/3] Starting Gmail Frontend on http://localhost:5174..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\gmail_analyzer\frontend'; `$host.UI.RawUI.WindowTitle = 'Gmail Dashboard UI [Port 5174]'; npm run dev -- --port 5174"

# 3. Wait and open browser to http://localhost:5174
Write-Host "[3/3] Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$targetUrl = "http://localhost:5174"
Write-Host "Opening $targetUrl in default browser..." -ForegroundColor Cyan
Start-Process $targetUrl

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   Gmail Personal Analyzer is running successfully!       " -ForegroundColor Green
Write-Host "   - Backend API:    http://localhost:8001/api/health" -ForegroundColor White
Write-Host "   - Dashboard UI:   $targetUrl" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`n[Interactive Mode] Press 'Q' to stop all services and exit." -ForegroundColor Yellow

while ($true) {
    if ([System.Console]::KeyAvailable) {
        $key = [System.Console]::ReadKey($true)
        if ($key.Key -eq [System.ConsoleKey]::Q) {
            Stop-GmailDashboardServices
            break
        }
    }
    Start-Sleep -Milliseconds 250
}
