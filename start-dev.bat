@echo off
echo ========================================
echo   LexiAI Development Server
echo ========================================
echo.

echo Starting Backend...
cd backend
start "LexiAI Backend" cmd /k "venv\Scripts\python -m app.main"
cd ..

timeout /t 3 /nobreak >nul

echo Starting Frontend...
cd frontend
start "LexiAI Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Docs: http://localhost:8000/docs
echo ========================================
