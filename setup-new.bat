@echo off
echo ========================================
echo MongoDB + ChromaDB Setup
echo ========================================
echo.

echo Step 1: Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Testing database connections...
python test_databases.py
if %errorlevel% neq 0 (
    echo WARNING: Database tests failed
    echo Make sure MongoDB is running!
    echo.
    echo To start MongoDB with Docker:
    echo docker run -d -p 27017:27017 --name mongodb mongo:latest
    echo.
    pause
)
echo.

echo Step 3: Starting FastAPI backend...
echo Backend will start at http://localhost:8000
echo API docs at http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
