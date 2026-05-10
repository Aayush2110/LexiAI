@echo off
echo ========================================
echo Restarting Backend with Fixes Applied
echo ========================================
echo.

cd /d "%~dp0"

echo Stopping any running Python processes...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting backend server...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
