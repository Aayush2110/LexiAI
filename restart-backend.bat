@echo off
echo ========================================
echo   Restarting Backend with Fix
echo ========================================
echo.

echo The Gemini fix has been applied to the code.
echo You need to restart the backend for it to take effect.
echo.

echo Current backend process needs to be stopped first.
echo.
echo Please:
echo 1. Go to the backend terminal
echo 2. Press Ctrl+C to stop it
echo 3. Then run: python -m uvicorn app.main:app --reload
echo.
echo OR
echo.
echo Press any key to start a NEW backend terminal...
pause

echo.
echo Starting backend in new terminal...
start cmd /k "cd /d %~dp0backend && echo Starting Backend with Gemini Fix... && python -m uvicorn app.main:app --reload"

echo.
echo ========================================
echo   Backend Starting!
echo ========================================
echo.
echo Wait 10 seconds for backend to fully start, then:
echo 1. Go back to your browser
echo 2. Ask your question again
echo 3. You should get an answer!
echo.

pause
