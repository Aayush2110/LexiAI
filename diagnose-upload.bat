@echo off
echo ========================================
echo   Upload Diagnostic Tool
echo ========================================
echo.

echo [1] Checking Backend...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8000
    curl -s http://localhost:8000/health
    echo.
) else (
    echo ❌ Backend is NOT running!
    echo Please start: cd backend ^&^& python -m uvicorn app.main:app --reload
    echo.
    pause
    exit /b 1
)

echo.
echo [2] Checking Frontend .env...
if exist "src\.env" (
    echo ✅ src\.env exists
    type src\.env
) else (
    echo ❌ src\.env NOT found!
    echo Creating it now...
    echo VITE_API_URL=http://localhost:8000 > src\.env
    echo ✅ Created src\.env
)

echo.
echo [3] Testing Upload Endpoint...
echo Creating test file...
echo This is a test document for upload testing. > test_upload.txt

echo.
echo Testing direct upload to backend:
curl -X POST http://localhost:8000/upload -F "files=@test_upload.txt" -v

echo.
echo.
echo ========================================
echo   Diagnostic Complete
echo ========================================
echo.
echo If the curl upload worked, the issue is in the frontend.
echo.
echo Next Steps:
echo 1. Make sure you RESTARTED the frontend after creating .env
echo 2. Check browser console (F12) for errors
echo 3. Check Network tab for the actual request
echo 4. Look for CORS errors
echo.
echo Frontend should be on: http://localhost:5173
echo Backend should be on: http://localhost:8000
echo.

pause
