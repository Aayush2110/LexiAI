@echo off
echo Starting LexiAI Backend...
echo.

REM Activate virtual environment and run
call venv\Scripts\activate.bat
python -m app.main

pause
