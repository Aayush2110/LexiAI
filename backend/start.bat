@echo off
echo ========================================
echo LegalRAG AI Chatbot - Backend Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo [ERROR] Virtual environment not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
echo [1/3] Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Copying .env.example to .env...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please edit .env file and add your API key
    echo Then run this script again.
    pause
    exit /b 1
)

REM Start the application
echo [2/3] Starting FastAPI application...
echo.
echo ========================================
echo Server will start at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo ========================================
echo.
echo [3/3] Running application...
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
