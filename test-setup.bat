@echo off
echo ========================================
echo   Chat Companion AI - Quick Test
echo ========================================
echo.

REM Check if backend is running
echo [1/4] Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is NOT running!
    echo.
    echo Please start the backend first:
    echo   cd backend
    echo   python -m uvicorn app.main:app --reload
    echo.
    pause
    exit /b 1
)
echo ✅ Backend is running on port 8000
echo.

REM Check frontend env
echo [2/4] Checking frontend configuration...
if exist "src\.env" (
    findstr "VITE_API_URL" src\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Frontend .env configured
    ) else (
        echo ⚠️  VITE_API_URL not found in src\.env
    )
) else (
    echo ❌ src\.env not found!
    echo Creating it now...
    echo VITE_API_URL=http://localhost:8000 > src\.env
    echo ✅ Created src\.env
)
echo.

REM Test backend endpoints
echo [3/4] Testing backend endpoints...
echo.
echo Testing /health:
curl -s http://localhost:8000/health
echo.
echo.
echo Testing / (root):
curl -s http://localhost:8000/
echo.
echo.

REM Instructions
echo [4/4] Next Steps:
echo.
echo ✅ Backend is ready!
echo.
echo To start frontend:
echo   bun run dev
echo.
echo Then open: http://localhost:5173/chat
echo.
echo Upload Location:
echo   - Desktop: Right sidebar (top section)
echo   - Mobile: Click "Upload" button in top bar
echo.
echo Supported Files: PDF, DOCX, TXT (up to 10 MB)
echo.

pause
