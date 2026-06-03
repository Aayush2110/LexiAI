# LexiAI - AI Legal Assistant

RAG-powered legal document analysis with cited answers.

## Project Structure

```
chat-companion-ai/
├── frontend/          # React + Vite frontend application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   └── ...           # Frontend config files
├── backend/          # FastAPI backend application
│   ├── app/          # Python source code
│   ├── data/         # Uploaded documents and vector stores
│   └── ...           # Backend config files
└── README.md         # This file
```

## Getting Started

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start MongoDB:
```bash
# Run MongoDB locally or use MongoDB Atlas
```

5. Run the backend:
```bash
python -m app.main
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Update VITE_API_URL if needed
```

4. Run the frontend:
```bash
npm run dev
# or
bun dev
```

Frontend will run on `http://localhost:5173`

## Features

- 📄 Upload PDF, DOCX, TXT documents
- 💬 Ask questions in plain English
- 📌 Get cited answers with source references
- 🔐 User authentication (Email/Password + Google OAuth)
- 💾 Multi-user chat isolation
- 🎯 RAG pipeline with hybrid search
- 📊 Context compression and reranking

## Tech Stack

### Frontend
- React + TypeScript
- TanStack Router
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI
- MongoDB
- ChromaDB
- Google Gemini LLM
- Sentence Transformers

## License

MIT
