<#
.SYNOPSIS
    GCP Cloud Health & Costing Dashboard Launcher

.DESCRIPTION
    Starts the dedicated Google Cloud Platform (GCP) Health & Costing backend
    (FastAPI on port 8000), launches the React + Vite frontend (port 5173),
    opens http://localhost:5173/?console=gcp, and monitors services with graceful shutdown.

.EXAMPLE
    .\backend\dashboard\dashboard.ps1        # Launches GCP costing dashboard & opens browser
    .\backend\dashboard\dashboard.ps1 -Stop  # Stops running dashboard services
#>

param (
    [switch]$Stop
)

$dashboardDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $dashboardDir
$projectRoot = Split-Path -Parent $backendDir
Set-Location $projectRoot

function Stop-GCPDashboardServices {
    Write-Host "`nStopping GCP dashboard services on ports 8000 and 5173..." -ForegroundColor Yellow
    foreach ($port in @(8000, 5173)) {
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
    Write-Host "GCP Dashboard services stopped." -ForegroundColor Green
}

if ($Stop) {
    Stop-GCPDashboardServices
    exit 0
}

# Clean start
Stop-GCPDashboardServices

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Launching Google Cloud Platform Health & Cost Console  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Project ID: personal-dashboard-507703 | Billing: Active" -ForegroundColor Gray

# 1. Start Dedicated GCP FastAPI Backend
Write-Host "`n[1/3] Starting GCP Health & Cost Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = 'GCP Costing Backend [Port 8000]'; .\backend\.venv\Scripts\python -m uvicorn backend.dashboard.main:app --reload --port 8000"

# 2. Start Dedicated GCP React + Vite Frontend (Port 5173)
Write-Host "[2/3] Starting GCP Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend\dashboard\frontend'; `$host.UI.RawUI.WindowTitle = 'GCP Costing UI [Port 5173]'; npm run dev -- --port 5173"

# 3. Wait and open browser
Write-Host "[3/3] Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$targetUrl = "http://localhost:5173"
Write-Host "Opening $targetUrl in default browser..." -ForegroundColor Cyan
Start-Process $targetUrl

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   GCP Health & Cost Console is running successfully!     " -ForegroundColor Green
Write-Host "   - Backend API:    http://localhost:8000/api/gcp/overview" -ForegroundColor White
Write-Host "   - Dashboard UI:   $targetUrl" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`n[Interactive Mode] Press 'Q' to stop all services and exit." -ForegroundColor Yellow

while ($true) {
    if ([System.Console]::KeyAvailable) {
        $key = [System.Console]::ReadKey($true)
        if ($key.Key -eq [System.ConsoleKey]::Q) {
            Stop-GCPDashboardServices
            break
        }
    }
    Start-Sleep -Milliseconds 250
}
