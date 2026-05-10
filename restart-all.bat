@echo off
echo ========================================
echo   Restarting Chat Companion AI
echo ========================================
echo.

echo This script will help you restart both backend and frontend properly.
echo.

echo Step 1: Make sure you've stopped both services (Ctrl+C in their terminals)
pause

echo.
echo Step 2: Checking .env files...
if not exist ".env" (
    echo Creating root .env...
    echo VITE_API_URL=http://localhost:8000 > .env
    echo ✅ Created .env
) else (
    echo ✅ Root .env exists
)

if not exist "src\.env" (
    echo Creating src\.env...
    echo VITE_API_URL=http://localhost:8000 > src\.env
    echo ✅ Created src\.env
) else (
    echo ✅ src\.env exists
)

echo.
echo Step 3: Starting Backend...
echo.
echo Opening new terminal for backend...
start cmd /k "cd backend && echo Starting Backend... && python -m uvicorn app.main:app --reload"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 4: Testing backend...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running!
) else (
    echo ⚠️  Backend might still be starting... check the backend terminal
)

echo.
echo Step 5: Starting Frontend...
echo.
echo Opening new terminal for frontend...
start cmd /k "echo Starting Frontend... && bun run dev"

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
echo 4. Watch the Console for logs
echo.
echo If upload fails, check:
echo - Backend terminal for errors
echo - Browser Console (F12) for errors
echo - Run: diagnose-upload.bat
echo.

pause
