@echo off
title Launching Personal Dashboard...
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0start_dashboard.ps1"
