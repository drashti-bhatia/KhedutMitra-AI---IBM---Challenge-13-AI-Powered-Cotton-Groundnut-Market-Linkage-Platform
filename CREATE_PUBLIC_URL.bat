@echo off
title KisaanConnect - Create Public URL (ngrok)
color 0B
echo ============================================================
echo   KisaanConnect - Public URL Generator
echo   Uses ngrok to create a public HTTPS tunnel
echo ============================================================
echo.

:: Check if ngrok is installed
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ngrok not found. Installing via npm...
    npm install -g ngrok
    if %errorlevel% neq 0 (
        echo.
        echo Please download ngrok manually from: https://ngrok.com/download
        echo 1. Download ngrok.exe
        echo 2. Place it in this folder or add to PATH
        echo 3. Run: ngrok authtoken YOUR_TOKEN (sign up free at ngrok.com)
        echo 4. Then run this script again
        pause
        exit /b 1
    )
)

echo.
echo Starting ngrok tunnel to localhost:3000 (Frontend)...
echo.
echo NOTE: The public URL will appear below.
echo Share it with anyone to access KisaanConnect remotely.
echo.
echo Press Ctrl+C to stop the tunnel.
echo.

ngrok http 3000

pause
