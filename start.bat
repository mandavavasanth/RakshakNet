@echo off
color 0A
title RakshakNet Launcher

set PYTHON=C:\Users\25pa1\AppData\Local\Python\pythoncore-3.14-64\python.exe

echo ===================================================
echo        Starting RakshakNet Command Center...
echo ===================================================
echo.

echo [0/3] Installing Python dependencies...
"%PYTHON%" -m pip install -r requirements.txt --quiet
echo.

echo [1/3] Starting FastAPI Backend Database Server...
start "RakshakNet Backend" cmd /k "cd /d %~dp0 && "%PYTHON%" -m uvicorn main:app --reload --port 8000"

echo [2/3] Starting React Frontend Dashboard...
call npm install --silent
start "RakshakNet Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo [3/3] Starting LoRa Hardware Serial Bridge (COM14)...
start "RakshakNet LoRa Bridge" cmd /k "cd /d %~dp0 && "%PYTHON%" serial_bridge\bridge.py --port COM14 --baud 9600"

echo.
echo All services have been launched in separate windows!
echo You can access your dashboard at: http://localhost:5173
echo.
pause
