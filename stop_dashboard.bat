@echo off
title Stopping Personal Dashboard...
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0stop_dashboard.ps1"
