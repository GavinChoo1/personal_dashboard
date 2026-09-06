# =============================================================================
# Stop Dashboard Services (PowerShell)
# Gracefully terminates processes running on ports 8000 (FastAPI) and 5173 (Vite)
# =============================================================================

Write-Host "Stopping Dashboard services on ports 8000 and 5173..." -ForegroundColor Yellow

$ports = @(8000, 5173)
foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($p in $pids) {
                if ($p -gt 0) {
                    Write-Host "Stopping process PID $p on port $port..." -ForegroundColor Cyan
                    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {
        # ignore lookup errors
    }
}

Write-Host "All Dashboard services stopped." -ForegroundColor Green
Start-Sleep -Seconds 1
