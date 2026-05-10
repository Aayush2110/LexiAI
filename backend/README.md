# LegalRAG AI Chatbot - Backend

A production-ready RAG (Retrieval Augmented Generation) pipeline for legal document Q&A built with FastAPI, LangChain, and FAISS.

## 🎯 Overview

This backend enables users to upload legal documents (PDF, DOCX, TXT) and ask questions about them. The system uses RAG to provide accurate answers grounded in the uploaded documents, preventing hallucinations and ensuring factual responses.

## 🏗️ Architecture

```
User Upload → Document Parsing → Text Chunking → Embeddings → FAISS Storage
                                                                      ↓
User Query ← LLM Response ← Context Formation ← Similarity Search ←──┘
```

## 🚀 Features

- ✅ Multi-format document support (PDF, DOCX, TXT)
- ✅ Intelligent text chunking with overlap
- ✅ Local vector storage with FAISS
- ✅ Semantic similarity search
- ✅ OpenAI and Gemini LLM support
- ✅ Session-based document management
- ✅ Source citation in responses
- ✅ Comprehensive error handling
- ✅ Structured logging
- ✅ CORS support for React frontend
- ✅ Auto-generated API documentation

## 📋 Prerequisites

- Python 3.8+
- Google Gemini API key (free tier available) OR OpenAI API key
- 2GB+ RAM (for embedding model)

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example env file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env and add your API key
```

Required configuration in `.env`:
```env
LLM_PROVIDER=gemini  # or "openai"
GOOGLE_API_KEY=your_key_here  # Get from: https://aistudio.google.com/app/apikey
# OR for OpenAI:
# OPENAI_API_KEY=your_key_here
```

## 🎮 Running the Application

### Development Mode

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Python directly

```bash
python app/main.py
```

## 📚 API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "message": "LegalRAG AI Chatbot is running"
}
```

### 2. Upload Documents
```http
POST /upload
Content-Type: multipart/form-data
```

**Request:**
- `files`: List of files (PDF, DOCX, TXT)

**Response:**
```json
{
  "session_id": "abc-123-def-456",
  "message": "Files uploaded and processed successfully",
  "files_processed": 2,
  "chunks_created": 45
}
```

### 3. Chat Query
```http
POST /chat
Content-Type: application/json
```

**Request:**
```json
{
  "session_id": "abc-123-def-456",
  "question": "What is the termination clause?"
}
```

**Response:**
```json
{
  "answer": "The termination clause states...",
  "sources": [
    "[Source 1] Page 5: Section 8.1 - Termination...",
    "[Source 2] Page 6: Either party may terminate..."
  ],
  "session_id": "abc-123-def-456"
}
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── upload.py      # File upload endpoint
│   │   │   ├── chat.py        # Chat endpoint
│   │   │   └── health.py      # Health check
│   │   └── dependencies.py    # Shared dependencies
│   │
│   ├── core/
│   │   ├── config.py          # Configuration management
│   │   ├── logging.py         # Logging setup
│   │   └── security.py        # Security utilities
│   │
│   ├── services/
│   │   ├── document_loader.py # Document parsing
│   │   ├── chunking.py        # Text chunking
│   │   ├── embeddings.py      # Embedding generation
│   │   ├── vector_store.py    # FAISS management
│   │   ├── retriever.py       # Similarity search
│   │   ├── llm_service.py     # LLM interaction
│   │   └── rag_pipeline.py    # Pipeline orchestration
│   │
│   ├── models/
│   │   ├── request_models.py  # API request models
│   │   └── response_models.py # API response models
│   │
│   ├── utils/
│   │   ├── file_utils.py      # File operations
│   │   └── helpers.py         # Helper functions
│   │
│   └── main.py                # FastAPI application
│
├── data/
│   ├── uploads/               # Uploaded files
│   └── vectorstores/          # FAISS indices
│
├── docs/                      # Documentation
├── requirements.txt           # Dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🧪 Testing with cURL

### Upload Documents
```bash
curl -X POST "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@contract.pdf" \
  -F "files=@agreement.docx"
```

### Chat Query
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "question": "What are the payment terms?"
  }'
```

## ⚙️ Configuration

Key settings in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | LLM provider (openai/gemini) | openai |
| `CHUNK_SIZE` | Characters per chunk | 1000 |
| `CHUNK_OVERLAP` | Overlap between chunks | 200 |
| `TOP_K_RETRIEVAL` | Number of chunks to retrieve | 4 |
| `LLM_TEMPERATURE` | Response randomness (0-1) | 0.1 |
| `EMBEDDING_MODEL` | Sentence transformer model | all-MiniLM-L6-v2 |

## 🔍 How It Works

### 1. Document Processing
- User uploads documents
- System extracts text (PyMuPDF for PDF, python-docx for DOCX)
- Text is cleaned and validated

### 2. Chunking
- Documents split into ~1000 character chunks
- 200 character overlap maintains context
- Preserves semantic boundaries (paragraphs, sentences)

### 3. Embedding Generation
- Each chunk converted to 384-dimensional vector
- Uses sentence-transformers (all-MiniLM-L6-v2)
- Captures semantic meaning

### 4. Vector Storage
- Embeddings stored in FAISS index
- Fast similarity search (millions of vectors)
- Persisted to disk per session

### 5. Query Processing
- User question converted to embedding
- FAISS finds top-K similar chunks
- Context formatted with metadata

### 6. Answer Generation
- Context + question sent to LLM
- Prompt engineered to prevent hallucinations
- Returns answer with source citations

## 🎓 Key Concepts

### What is RAG?
Retrieval Augmented Generation combines:
- **Retrieval**: Finding relevant information from documents
- **Augmentation**: Adding that information as context
- **Generation**: LLM generates answer based on context

### Why RAG over Fine-tuning?
- ✅ No expensive retraining needed
- ✅ Works with any documents instantly
- ✅ Easy to update (just upload new docs)
- ✅ More accurate for factual Q&A
- ✅ Can cite sources

### Why FAISS?
- Fast similarity search (optimized by Facebook AI)
- Handles millions of vectors efficiently
- Runs locally (no external database)
- Production-proven

### Why Chunking?
- LLMs have token limits
- Smaller chunks = more precise retrieval
- Overlap prevents context loss
- Better semantic matching

## 🚨 Troubleshooting

### Import Errors
```bash
pip install --upgrade -r requirements.txt
```

### API Key Errors
- Check `.env` file exists
- Verify API key is correct
- Ensure no extra spaces in key

### Memory Issues
- Reduce `CHUNK_SIZE` in `.env`
- Use smaller embedding model
- Process fewer files at once

### Slow Performance
- Use GPU for embeddings (change 'cpu' to 'cuda')
- Reduce `TOP_K_RETRIEVAL`
- Use faster LLM (gpt-3.5-turbo vs gpt-4)

## 📖 Additional Documentation

- [RAG Explained](docs/rag_explained.md) - Deep dive into RAG
- [Architecture](docs/architecture.md) - System design
- [API Flow](docs/api_flow.md) - Request/response flow
- [Vector Database](docs/vector_database.md) - FAISS details
- [Deployment](docs/deployment.md) - Production deployment

## 🔐 Security Notes

- API keys stored in `.env` (never commit)
- File upload validation
- Session isolation
- Input sanitization
- Error message sanitization

## 🚀 Production Considerations

1. **Scaling**: Use multiple workers with Gunicorn
2. **Caching**: Cache embeddings for common queries
3. **Monitoring**: Add Prometheus metrics
4. **Rate Limiting**: Prevent abuse
5. **Authentication**: Add JWT tokens
6. **Database**: Move to PostgreSQL + pgvector for multi-user
7. **Storage**: Use S3 for uploaded files
8. **GPU**: Use GPU for faster embeddings

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using FastAPI, LangChain, and FAISS
