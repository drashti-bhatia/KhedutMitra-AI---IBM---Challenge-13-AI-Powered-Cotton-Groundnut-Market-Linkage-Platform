@echo off
title KisaanConnect - Start Application
color 0A
echo ============================================================
echo   KisaanConnect - AI-Powered Cotton ^& Groundnut Platform
echo   Challenge 13 | IBM Granite LLM | watsonx.ai
echo ============================================================
echo.

:: Start Backend Server
echo [1/2] Starting Python FastAPI Backend on http://localhost:8000 ...
start "KisaanConnect-Backend" cmd /k "cd /d %~dp0backend && echo Starting FastAPI Backend... && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait for backend to initialize
echo Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak > nul

:: Start Frontend
echo [2/2] Starting React Frontend on http://localhost:3000 ...
start "KisaanConnect-Frontend" cmd /k "cd /d %~dp0frontend && echo Starting React Frontend... && set PORT=3000 && npm start"

:: Wait for frontend to start
echo Waiting for frontend to build (15 seconds)...
timeout /t 15 /nobreak > nul

:: Open browser
echo Opening KisaanConnect in browser...
start http://localhost:3000

echo.
echo ============================================================
echo   KisaanConnect is running!
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo   Close this window or the terminal windows to stop.
echo ============================================================
echo.
pause
