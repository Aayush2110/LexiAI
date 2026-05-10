@echo off
echo ========================================
echo LegalRAG AI Chatbot - Setup Script
echo ========================================
echo.

REM Check Python installation
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)
echo Python found!
echo.

REM Create virtual environment
echo [2/4] Creating virtual environment...
if exist "venv\" (
    echo Virtual environment already exists, skipping...
) else (
    python -m venv venv
    echo Virtual environment created!
)
echo.

REM Activate virtual environment
echo [3/4] Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo [4/4] Installing dependencies...
echo This may take a few minutes...
pip install --upgrade pip
pip install -r requirements.txt
echo.

REM Create .env file
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ========================================
    echo [ACTION REQUIRED]
    echo ========================================
    echo Please edit .env file and add your API key:
    echo.
    echo For Gemini (RECOMMENDED - Free tier available):
    echo   1. Get API key from: https://aistudio.google.com/app/apikey
    echo   2. Set LLM_PROVIDER=gemini
    echo   3. Set GOOGLE_API_KEY=your-key-here
    echo.
    echo For OpenAI:
    echo   1. Get API key from: https://platform.openai.com/api-keys
    echo   2. Set LLM_PROVIDER=openai
    echo   3. Set OPENAI_API_KEY=your-key-here
    echo.
    echo After editing .env, run start.bat to launch the application
    echo ========================================
) else (
    echo .env file already exists
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your API key
echo 2. Run start.bat to launch the application
echo 3. Open http://localhost:8000/docs in your browser
echo.

pause
