@echo off
echo Restarting Frontend...
cd frontend
taskkill /F /IM node.exe 2>nul
echo Starting frontend dev server...
start cmd /k "npm run dev"
echo Frontend restarted!
cd ..
