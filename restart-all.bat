@echo off
echo ========================================
echo   Restarting Chat Companion AI
echo ========================================
echo.

echo This script will restart both backend and frontend.
echo.

echo Step 1: Stopping existing services...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting Backend...
cd backend
start cmd /k "echo Starting Backend... && venv\Scripts\python -m app.main"
cd ..

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Testing backend...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running!
) else (
    echo ⚠️  Backend might still be starting... check the backend terminal
)

echo.
echo Step 4: Starting Frontend...
cd frontend
start cmd /k "echo Starting Frontend... && npm run dev"
cd ..

echo.
echo ========================================
echo   Services Starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Wait 10-15 seconds for both to fully start, then:
echo 1. Open http://localhost:5173/chat
echo 2. Press F12 to open DevTools
echo 3. Try uploading a file
echo.
pause
