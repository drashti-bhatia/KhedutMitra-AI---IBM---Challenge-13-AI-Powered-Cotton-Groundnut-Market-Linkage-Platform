@echo off
title KisaanConnect - Install Dependencies
color 0A
echo ============================================================
echo   KisaanConnect - AI-Powered Cotton ^& Groundnut Platform
echo   Challenge 13 - IBM Hackathon
echo   Installing all dependencies...
echo ============================================================
echo.

:: Check Python
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo Python found! OK
echo.

:: Check Node.js
echo [2/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
node --version
npm --version
echo Node.js found! OK
echo.

:: Install Python backend dependencies
echo [3/4] Installing Python backend dependencies...
echo This may take 2-3 minutes on first run...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo WARNING: Some packages may have failed. Trying with --user flag...
    pip install --user -r requirements.txt
)
echo Backend dependencies installed! OK
cd ..
echo.

:: Install React frontend dependencies
echo [4/4] Installing React frontend dependencies...
echo This may take 3-5 minutes on first run...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)
echo Frontend dependencies installed! OK
cd ..
echo.

echo ============================================================
echo   Installation COMPLETE!
echo   Run START_APP.bat to launch KisaanConnect
echo ============================================================
echo.
pause
