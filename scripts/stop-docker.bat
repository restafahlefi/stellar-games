@echo off
REM Stellar Games - Docker Stop Script
REM This script will stop all running services

echo ========================================
echo    STELLAR GAMES - Stop Services
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo.
    echo Services may already be stopped.
    echo.
    pause
    exit /b 1
)

echo Stopping Stellar Games services...
echo.

REM Stop services
docker-compose down

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to stop services!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Services Stopped Successfully!
echo ========================================
echo.
echo All containers have been stopped and removed.
echo.
echo To start again, run: start-docker.bat
echo.
pause
