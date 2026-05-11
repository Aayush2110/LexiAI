# Complete Setup Guide

## Tech Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI
- **Database**: MongoDB (users, chats, documents, sessions)
- **Vector Database**: ChromaDB (embeddings, semantic search)
- **LLM**: Google Gemini

## Prerequisites
1. Python 3.8+
2. Node.js 16+
3. MongoDB (local or cloud)

## Backend Setup

### 1. Install MongoDB
**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update:
```env
# LLM Configuration
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your_gemini_api_key

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=chat_companion

# ChromaDB
CHROMA_PERSIST_DIR=./data/chromadb

# Server
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` in root:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Start Frontend
```bash
npm run dev
```

## Database Structure

### MongoDB Collections

#### 1. users
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "username": "username",
  "hashed_password": "bcrypt_hash",
  "created_at": "datetime"
}
```

#### 2. chats
```json
{
  "_id": "ObjectId",
  "session_id": "uuid",
  "messages": [
    {
      "role": "user|assistant",
      "content": "message text",
      "timestamp": "datetime"
    }
  ],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### 3. documents
```json
{
  "_id": "ObjectId",
  "session_id": "uuid",
  "filename": "document.pdf",
  "file_path": "/path/to/file",
  "file_size": 12345,
  "file_type": "application/pdf",
  "uploaded_at": "datetime"
}
```

#### 4. sessions
```json
{
  "_id": "ObjectId",
  "session_id": "uuid",
  "created_at": "datetime",
  "files_count": 3,
  "chunks_count": 150
}
```

### ChromaDB Collections
- Collection per session (named by session_id)
- Stores document embeddings and metadata
- Automatic persistence to disk

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user

### Documents
- `POST /upload` - Upload documents (creates session)

### Chat
- `POST /chat` - Query documents

### Health
- `GET /health` - Health check

## Testing

### 1. Test MongoDB Connection
```bash
mongosh
> show dbs
```

### 2. Test Backend
```bash
curl http://localhost:8000/health
```

### 3. Test Upload
```bash
curl -X POST http://localhost:8000/upload \
  -F "files=@document.pdf"
```

### 4. Test Chat
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "your-session-id", "question": "What is this about?"}'
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh`
- Check MONGODB_URL in .env

### ChromaDB Error
- Delete `./data/chromadb` and restart
- Check write permissions

### Import Errors
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version`

## Production Deployment

### Backend
1. Set `DEBUG=False` in .env
2. Use production MongoDB (MongoDB Atlas)
3. Set proper CORS_ORIGINS
4. Use gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Update VITE_API_URL to production backend

### Database
1. Use MongoDB Atlas (cloud)
2. Set up backups
3. Configure indexes for performance

## Architecture

```
Frontend (React + Tailwind)
    ↓
FastAPI Backend
    ↓
├── MongoDB (structured data)
│   ├── Users
│   ├── Chats
│   ├── Documents metadata
│   └── Sessions
│
└── ChromaDB (vector data)
    ├── Document embeddings
    ├── Semantic vectors
    └── Retrieval indexes
```

## Next Steps
1. Add JWT authentication
2. Implement user sessions
3. Add file type validation
4. Implement rate limiting
5. Add monitoring/logging
