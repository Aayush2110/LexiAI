@echo off
echo ========================================
echo Backend Setup with Python 3.11
echo ========================================
echo.

cd backend

echo Step 1: Creating virtual environment with Python 3.11...
py -3.11 -m venv venv
if errorlevel 1 (
    echo ERROR: Python 3.11 not found!
    echo Please install Python 3.11 from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate

echo.
echo Step 3: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 4: Installing dependencies...
pip install -r requirements.txt

echo.
echo Step 5: Checking installation...
python -c "import fastapi; import motor; import passlib; import jose; print('✅ All auth packages installed successfully!')"

echo.
echo Step 6: Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ⚠️  Please edit backend\.env and add your JWT_SECRET_KEY
    echo.
    echo Generate a secret key with:
    echo python -c "import secrets; print(secrets.token_urlsafe(32))"
) else (
    echo ✅ .env file already exists
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env and add JWT_SECRET_KEY
echo 2. Start MongoDB: start-mongodb.bat
echo 3. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& python -m app.main
echo.
pause
