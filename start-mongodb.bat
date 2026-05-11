@echo off
echo ========================================
echo Starting MongoDB with Docker
echo ========================================
echo.

echo Checking if MongoDB container exists...
docker ps -a | findstr mongodb >nul
if %errorlevel% equ 0 (
    echo MongoDB container found. Starting...
    docker start mongodb
) else (
    echo Creating new MongoDB container...
    docker run -d -p 27017:27017 --name mongodb mongo:latest
)

if %errorlevel% equ 0 (
    echo.
    echo ✓ MongoDB started successfully!
    echo ✓ Connection: mongodb://localhost:27017
    echo.
) else (
    echo.
    echo ✗ Failed to start MongoDB
    echo.
    echo Make sure Docker is installed and running:
    echo https://www.docker.com/products/docker-desktop
    echo.
)

pause
