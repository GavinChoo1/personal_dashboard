<#
.SYNOPSIS
    Unified Dashboard Dispatcher for Personal Dashboard

.DESCRIPTION
    Launches either the GCP Cloud Health & Costing Dashboard (Port 8000),
    the Gmail Personal Analyzer Dashboard (Port 8001), or Both simultaneously.

.EXAMPLE
    .\dashboard.ps1           # Launches GCP Health & Costing Dashboard (Port 8000, default)
    .\dashboard.ps1 -GCP      # Explicitly launches GCP Health & Costing Dashboard (Port 8000)
    .\dashboard.ps1 -Gmail    # Launches Gmail Personal Analyzer Dashboard (Port 8001)
    .\dashboard.ps1 -Both     # Launches Both backends (8000 + 8001) with unified frontend
    .\dashboard.ps1 -Stop     # Stops all running dashboard services (Ports 8000, 8001, 5173, 5174)
#>

param (
    [switch]$GCP,
    [switch]$Gmail,
    [switch]$Both,
    [switch]$Stop
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

function Stop-AllDashboardPorts {
    Write-Host "`nStopping all dashboard services on ports 8000, 8001, 5173, 5174..." -ForegroundColor Yellow
    foreach ($port in @(8000, 8001, 5173, 5174)) {
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
    Write-Host "All dashboard services stopped." -ForegroundColor Green
}

if ($Stop) {
    Stop-AllDashboardPorts
    exit 0
}

if ($Both) {
    Stop-AllDashboardPorts
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "    Launching BOTH GCP Costing & Gmail Analyzer Backends   " -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan

    # 1. Start GCP Backend on Port 8000
    Write-Host "`n[1/3] Starting GCP Health & Costing Backend on Port 8000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = 'GCP Costing Backend [Port 8000]'; .\backend\.venv\Scripts\python -m uvicorn backend.dashboard.main:app --reload --port 8000"

    # 2. Start Gmail Analyzer Backend on Port 8001
    Write-Host "[2/3] Starting Gmail Analyzer Backend on Port 8001..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = 'Gmail Analyzer Backend [Port 8001]'; .\backend\.venv\Scripts\python -m uvicorn gmail_analyzer.main:app --reload --port 8001"

    # 3. Start GCP Frontend on Port 5173
    Write-Host "[3/4] Starting GCP Costing Frontend on Port 5173..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend\dashboard\frontend'; `$host.UI.RawUI.WindowTitle = 'GCP Costing UI [Port 5173]'; npm run dev -- --port 5173"

    # 4. Start Gmail Frontend on Port 5174
    Write-Host "[4/4] Starting Gmail Analyzer Frontend on Port 5174..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\gmail_analyzer\frontend'; `$host.UI.RawUI.WindowTitle = 'Gmail Dashboard UI [Port 5174]'; npm run dev -- --port 5174"

    Start-Sleep -Seconds 3
    Start-Process "http://localhost:5173"
    Start-Process "http://localhost:5174"

    Write-Host "`nBoth dashboards are running!" -ForegroundColor Green
    Write-Host "  - GCP Health & Cost:    http://localhost:5173 (Backend: 8000)" -ForegroundColor White
    Write-Host "  - Gmail Intelligence:   http://localhost:5174 (Backend: 8001)" -ForegroundColor White
    Write-Host "`nPress 'Q' to stop all services and exit." -ForegroundColor Yellow

    while ($true) {
        if ([System.Console]::KeyAvailable) {
            $key = [System.Console]::ReadKey($true)
            if ($key.Key -eq [System.ConsoleKey]::Q) {
                Stop-AllDashboardPorts
                break
            }
        }
        Start-Sleep -Milliseconds 250
    }
    exit 0
}

if ($Gmail) {
    Write-Host "Routing to Gmail Personal Analyzer Dashboard (Port 8001)..." -ForegroundColor Cyan
    & "$projectRoot\gmail_analyzer\dashboard.ps1"
} else {
    Write-Host "Routing to GCP Cloud Health & Costing Dashboard (Port 8000)..." -ForegroundColor Cyan
    & "$projectRoot\backend\dashboard\dashboard.ps1"
}
