<#
.SYNOPSIS
    GCP Cloud Health & Costing Dashboard Launcher Forwarder

.DESCRIPTION
    Delegates to backend\dashboard\dashboard.ps1
#>

param (
    [switch]$Stop
)

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $backendDir "dashboard\dashboard.ps1"

if ($Stop) {
    & $scriptPath -Stop
} else {
    & $scriptPath
}
