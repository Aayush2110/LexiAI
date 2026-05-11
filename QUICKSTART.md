# 🚀 Quick Start Guide - MongoDB + ChromaDB

## ✅ What's Implemented

Your chat companion now uses:
- **MongoDB** → Users, chats, documents, sessions
- **ChromaDB** → Document embeddings, semantic search
- **FastAPI** → Backend API
- **React + Tailwind** → Frontend
- **Gemini** → LLM for answers

## 🎯 Quick Start (3 Steps)

### Step 1: Start MongoDB
```bash
# Option A: Using Docker (Recommended)
start-mongodb.bat

# Option B: Install MongoDB locally
# Download from: https://www.mongodb.com/try/download/community
```

### Step 2: Setup & Start Backend
```bash
setup-new.bat
```

This will:
1. Install all Python dependencies
2. Test MongoDB and ChromaDB connections
3. Start FastAPI backend at http://localhost:8000

### Step 3: Start Frontend
```bash
npm run dev
```

Frontend will start at http://localhost:5173

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:8000/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"username\":\"test\",\"password\":\"test123\"}"
```

### 3. Login
```bash
curl -X POST http://localhost:8000/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

### 4. Upload Document
```bash
curl -X POST http://localhost:8000/upload ^
  -F "files=@document.pdf"
```

Response will include `session_id`

### 5. Chat
```bash
curl -X POST http://localhost:8000/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"session_id\":\"YOUR_SESSION_ID\",\"question\":\"What is this document about?\"}"
```

## 📊 What's Stored Where

### MongoDB Collections:
- **users** → Email, username, hashed password
- **chats** → All chat messages and history
- **documents** → File metadata (name, size, type, path)
- **sessions** → Session info (files count, chunks count)

### ChromaDB:
- **Embeddings** → Vector representations of document chunks
- **Metadata** → Source, page numbers, chunk info
- **Indexes** → For fast semantic search

## 🔍 View Your Data

### MongoDB:
```bash
# Connect to MongoDB
mongosh

# Switch to database
use chat_companion

# View collections
show collections

# View users
db.users.find()

# View chats
db.chats.find()

# View documents
db.documents.find()
```

### ChromaDB:
Data stored in: `backend/data/chromadb/`

## 📁 Project Structure

```
chat-companion-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── auth.py          # NEW: Login/Register
│   │   │   ├── chat.py          # UPDATED: Saves to MongoDB
│   │   │   └── upload.py        # UPDATED: Saves metadata
│   │   ├── models/
│   │   │   └── db_models.py     # NEW: MongoDB models
│   │   ├── services/
│   │   │   ├── database.py      # NEW: MongoDB service
│   │   │   └── vector_store.py  # UPDATED: ChromaDB
│   │   └── main.py              # UPDATED: MongoDB init
│   ├── data/
│   │   ├── chromadb/            # ChromaDB storage
│   │   └── uploads/             # Uploaded files
│   ├── requirements.txt         # UPDATED: New deps
│   └── .env                     # UPDATED: New config
├── src/                         # React frontend
├── start-mongodb.bat            # NEW: Start MongoDB
└── setup-new.bat                # NEW: Setup script
```

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED
```
**Solution:** Start MongoDB
```bash
start-mongodb.bat
```

### ChromaDB Permission Error
```
Error: Permission denied
```
**Solution:** Delete and recreate
```bash
rmdir /s backend\data\chromadb
```

### Import Errors
```
Error: No module named 'motor'
```
**Solution:** Reinstall dependencies
```bash
cd backend
pip install -r requirements.txt
```

## 🎉 Features Working

✅ User registration and login  
✅ Document upload with metadata tracking  
✅ Chat with RAG (Retrieval Augmented Generation)  
✅ Chat history persistence  
✅ Session management  
✅ Semantic search with ChromaDB  
✅ Gemini LLM integration  

## 📚 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Environment Variables

All in `backend/.env`:
```env
# LLM
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your_key

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=chat_companion

# ChromaDB
CHROMA_PERSIST_DIR=./data/chromadb

# Server
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

## 🚀 Production Ready

For production deployment:
1. Use MongoDB Atlas (cloud)
2. Set `DEBUG=False`
3. Use proper CORS origins
4. Add JWT authentication
5. Set up SSL/TLS
6. Use gunicorn for backend
7. Build frontend: `npm run build`

## 📞 Need Help?

Check these files:
- `SETUP_COMPLETE.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - All changes made
- `backend/test_databases.py` - Test script

## ✨ That's It!

Your chat companion is now running with:
- ✅ Persistent storage (MongoDB)
- ✅ Vector search (ChromaDB)
- ✅ User authentication
- ✅ Chat history
- ✅ Document tracking

Enjoy! 🎊
