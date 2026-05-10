# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Step 1: Setup Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 2: Configure API Key

```bash
# Copy example environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env file and add your Gemini API key
# Get free API key from: https://aistudio.google.com/app/apikey

# For Gemini (RECOMMENDED - Free tier):
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your-key-here

# OR for OpenAI:
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Run the Application

```bash
python app/main.py
```

Or with uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Test the API

Open your browser and go to:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Step 5: Upload a Document

Using the Swagger UI at http://localhost:8000/docs:

1. Click on **POST /upload**
2. Click **Try it out**
3. Upload a PDF, DOCX, or TXT file
4. Click **Execute**
5. Copy the `session_id` from the response

### Step 6: Ask a Question

Using the Swagger UI:

1. Click on **POST /chat**
2. Click **Try it out**
3. Enter your `session_id` and a question
4. Click **Execute**
5. See the answer with sources!

## 🎉 That's it!

You now have a fully functional RAG chatbot running locally!

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- Read [docs/rag_explained.md](docs/rag_explained.md) to understand how RAG works
- Read [docs/architecture.md](docs/architecture.md) for system design
- Read [docs/deployment.md](docs/deployment.md) for production deployment

## 🆘 Troubleshooting

**Problem**: `ModuleNotFoundError`
**Solution**: Make sure virtual environment is activated and dependencies are installed

**Problem**: `API key not configured`
**Solution**: Check your .env file has the correct API key

**Problem**: `Port 8000 already in use`
**Solution**: Change port: `uvicorn app.main:app --port 8001`

## 💡 Tips

- Use **gemini-pro** (default) for fast, free responses
- Switch to **gpt-4** for better quality if needed (paid)
- Adjust `CHUNK_SIZE` in .env for different document types
- Increase `TOP_K_RETRIEVAL` for more context

## 🔗 Useful Links

- Google AI Studio (Gemini): https://aistudio.google.com/app/apikey
- OpenAI API Keys: https://platform.openai.com/api-keys
- FastAPI Docs: https://fastapi.tiangolo.com/
- LangChain Docs: https://python.langchain.com/

---

Happy coding! 🎊
