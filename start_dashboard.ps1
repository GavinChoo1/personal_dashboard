# =============================================================================
# One-Click Dashboard Launcher (PowerShell)
# Starts FastAPI Backend, React Frontend, and opens http://localhost:5173
# =============================================================================

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Launching Personal Dashboard (Backend & UI)         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend in a separate window
Write-Host "`n[1/3] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendCmd = "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = 'Backend - FastAPI [Port 8000]'; Write-Host 'Starting FastAPI Backend...' -ForegroundColor Cyan; .\backend\.venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# 2. Start React + Vite Frontend in a separate window
Write-Host "[2/3] Starting React + Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendCmd = "Set-Location '$projectRoot\frontend'; `$host.UI.RawUI.WindowTitle = 'Frontend - Vite [Port 5173]'; Write-Host 'Starting Vite Dev Server...' -ForegroundColor Cyan; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

# 3. Wait briefly for servers to spin up, then open browser
Write-Host "[3/3] Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`nOpening dashboard in default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "`nDashboard launched successfully!" -ForegroundColor Green
Write-Host "Press any key to close this launcher window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
