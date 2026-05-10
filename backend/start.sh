#!/bin/bash

echo "========================================"
echo "LegalRAG AI Chatbot - Backend Startup"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "[ERROR] Virtual environment not found!"
    echo "Please run setup.sh first"
    exit 1
fi

# Activate virtual environment
echo "[1/3] Activating virtual environment..."
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[WARNING] .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo ""
    echo "[ACTION REQUIRED] Please edit .env file and add your API key"
    echo "Then run this script again."
    exit 1
fi

# Start the application
echo "[2/3] Starting FastAPI application..."
echo ""
echo "========================================"
echo "Server will start at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "========================================"
echo ""
echo "[3/3] Running application..."
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
