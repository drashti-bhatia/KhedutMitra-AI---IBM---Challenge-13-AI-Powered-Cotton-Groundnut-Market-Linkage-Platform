@echo off
title KisaanConnect - Stop All Servers
color 0C
echo Stopping KisaanConnect servers...
taskkill /FI "WINDOWTITLE eq KisaanConnect-Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq KisaanConnect-Frontend*" /F >nul 2>&1
:: Kill by port as fallback
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
echo All servers stopped.
timeout /t 2 /nobreak > nul
