#!/bin/bash

echo "========================================"
echo "LegalRAG AI Chatbot - Setup Script"
echo "========================================"
echo ""

# Check Python installation
echo "[1/4] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi
echo "Python found: $(python3 --version)"
echo ""

# Create virtual environment
echo "[2/4] Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists, skipping..."
else
    python3 -m venv venv
    echo "Virtual environment created!"
fi
echo ""

# Activate virtual environment
echo "[3/4] Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "[4/4] Installing dependencies..."
echo "This may take a few minutes..."
pip install --upgrade pip
pip install -r requirements.txt
echo ""

# Create .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "========================================"
    echo "[ACTION REQUIRED]"
    echo "========================================"
    echo "Please edit .env file and add your API key:"
    echo ""
    echo "For Gemini (RECOMMENDED - Free tier available):"
    echo "  1. Get API key from: https://aistudio.google.com/app/apikey"
    echo "  2. Set LLM_PROVIDER=gemini"
    echo "  3. Set GOOGLE_API_KEY=your-key-here"
    echo ""
    echo "For OpenAI:"
    echo "  1. Get API key from: https://platform.openai.com/api-keys"
    echo "  2. Set LLM_PROVIDER=openai"
    echo "  3. Set OPENAI_API_KEY=your-key-here"
    echo ""
    echo "After editing .env, run ./start.sh to launch the application"
    echo "========================================"
else
    echo ".env file already exists"
fi
echo ""

# Make start.sh executable
chmod +x start.sh

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API key"
echo "2. Run ./start.sh to launch the application"
echo "3. Open http://localhost:8000/docs in your browser"
echo ""
