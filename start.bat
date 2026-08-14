@echo off
color 0A
title RakshakNet Launcher

echo ===================================================
echo        Starting RakshakNet Command Center...
echo ===================================================
echo.

echo [1/3] Starting FastAPI Backend Database Server...
start "RakshakNet Backend" cmd /k "uvicorn main:app --reload --port 8000"

echo [2/3] Starting React Frontend Dashboard...
start "RakshakNet Frontend" cmd /k "npm run dev"

echo [3/3] Starting LoRa Hardware Serial Bridge (COM14)...
start "RakshakNet LoRa Bridge" cmd /k "python serial_bridge\bridge.py --port COM14 --baud 115200"

echo.
echo All services have been launched in separate windows!
echo You can access your dashboard at: http://localhost:5173
echo.
pause
