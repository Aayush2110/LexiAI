@echo off
echo Testing Backend Upload Endpoint...
echo.

REM Test health endpoint
echo 1. Testing Health Endpoint:
curl -X GET http://localhost:8000/health
echo.
echo.

REM Test root endpoint
echo 2. Testing Root Endpoint:
curl -X GET http://localhost:8000/
echo.
echo.

echo 3. To test upload, create a test.txt file and run:
echo curl -X POST http://localhost:8000/upload -F "files=@test.txt"
echo.

pause
