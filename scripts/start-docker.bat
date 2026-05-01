@echo off
REM Stellar Games - Docker Quick Start Script
REM This script will start all services using Docker

echo ========================================
echo    STELLAR GAMES - Docker Quick Start
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop first, then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] docker-compose is not available!
    echo.
    echo Please install Docker Desktop with docker-compose.
    echo.
    pause
    exit /b 1
)

echo [OK] docker-compose is available
echo.

echo Starting Stellar Games services...
echo.
echo This will:
echo   1. Build Docker images (first time only)
echo   2. Start Frontend (React + Vite) on port 5173
echo   3. Start Backend (Node.js + DDD) on port 5001
echo.

REM Start services
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start services!
    echo.
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Services Started Successfully!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:5001
echo Health:    http://localhost:5001/health
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:5173

echo.
echo Press any key to view logs...
pause >nul

REM Show logs
docker-compose logs -f
