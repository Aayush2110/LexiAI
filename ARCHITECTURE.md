# 🏗️ System Architecture

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    React + Tailwind CSS                         │
│                   (http://localhost:5173)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                       FASTAPI BACKEND                           │
│                   (http://localhost:8000)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    API ROUTES                           │  │
│  │  • /register  • /login  • /upload  • /chat  • /health  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────┼──────────────────────────────┐  │
│  │              RAG PIPELINE SERVICE                        │  │
│  │  • Document Loading  • Chunking  • Embeddings           │  │
│  │  • Vector Storage    • Retrieval  • LLM Generation      │  │
│  └──────────────────────────┼──────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
    ┌────────────────────┐    ┌────────────────────┐
    │     MONGODB        │    │     CHROMADB       │
    │  (Structured Data) │    │   (Vector Data)    │
    └────────────────────┘    └────────────────────┘
                 │                         │
                 ▼                         ▼
    ┌────────────────────┐    ┌────────────────────┐
    │   Collections:     │    │   Collections:     │
    │   • users          │    │   • [session_id]   │
    │   • chats          │    │   • embeddings     │
    │   • documents      │    │   • metadata       │
    │   • sessions       │    │   • indexes        │
    └────────────────────┘    └────────────────────┘
```

## Data Flow Diagrams

### 1. User Registration Flow

```
User Input (email, username, password)
    │
    ▼
FastAPI /register endpoint
    │
    ▼
Hash password with bcrypt
    │
    ▼
MongoDB users collection
    │
    ▼
Return success message
```

### 2. Document Upload Flow

```
User uploads PDF/DOCX/TXT
    │
    ▼
FastAPI /upload endpoint
    │
    ├─────────────────────────────────┐
    │                                 │
    ▼                                 ▼
Save file to disk              Generate session_id
(backend/data/uploads/)              │
    │                                 │
    ▼                                 │
Document Loader Service               │
(Extract text from file)              │
    │                                 │
    ▼                                 │
Chunking Service                      │
(Split into chunks)                   │
    │                                 │
    ▼                                 │
Embedding Service                     │
(Generate vectors)                    │
    │                                 │
    ▼                                 │
ChromaDB                              │
(Store embeddings)                    │
    │                                 │
    └─────────────┬───────────────────┘
                  │
                  ▼
            MongoDB
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
documents collection    sessions collection
(file metadata)         (session info)
    │
    ▼
Return session_id to user
```

### 3. Chat Query Flow

```
User question + session_id
    │
    ▼
FastAPI /chat endpoint
    │
    ▼
Load ChromaDB collection
(using session_id)
    │
    ▼
Embedding Service
(Convert question to vector)
    │
    ▼
ChromaDB Similarity Search
(Find top-K relevant chunks)
    │
    ▼
Retriever Service
(Format context from chunks)
    │
    ▼
LLM Service (Gemini)
(Generate answer with context)
    │
    ├─────────────────────┐
    │                     │
    ▼                     ▼
MongoDB chats       Return answer
collection          + sources
(save history)      to user
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │   Database     │  │  Vector Store  │  │  Embeddings  │ │
│  │   Service      │  │    Service     │  │   Service    │ │
│  │                │  │                │  │              │ │
│  │  • MongoDB     │  │  • ChromaDB    │  │  • HuggingF. │ │
│  │  • Collections │  │  • Create      │  │  • Generate  │ │
│  │  • CRUD ops    │  │  • Load        │  │  • Vectors   │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │   Document     │  │   Chunking     │  │  Retriever   │ │
│  │   Loader       │  │    Service     │  │   Service    │ │
│  │                │  │                │  │              │ │
│  │  • PDF         │  │  • Split text  │  │  • Search    │ │
│  │  • DOCX        │  │  • Overlap     │  │  • Format    │ │
│  │  • TXT         │  │  • Metadata    │  │  • Context   │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │   LLM          │  │   RAG          │                    │
│  │   Service      │  │   Pipeline     │                    │
│  │                │  │                │                    │
│  │  • Gemini      │  │  • Orchestrate │                    │
│  │  • Generate    │  │  • Coordinate  │                    │
│  │  • Answer      │  │  • Process     │                    │
│  └────────────────┘  └────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

## Database Schema

### MongoDB Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         MONGODB                             │
│                    chat_companion DB                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  users                                                      │
│  ├── _id: ObjectId                                         │
│  ├── email: String (unique)                                │
│  ├── username: String                                      │
│  ├── hashed_password: String (bcrypt)                      │
│  └── created_at: DateTime                                  │
│                                                             │
│  chats                                                      │
│  ├── _id: ObjectId                                         │
│  ├── session_id: String                                    │
│  ├── messages: Array                                       │
│  │   ├── role: String (user|assistant)                    │
│  │   ├── content: String                                  │
│  │   └── timestamp: DateTime                              │
│  ├── created_at: DateTime                                  │
│  └── updated_at: DateTime                                  │
│                                                             │
│  documents                                                  │
│  ├── _id: ObjectId                                         │
│  ├── session_id: String                                    │
│  ├── filename: String                                      │
│  ├── file_path: String                                     │
│  ├── file_size: Integer                                    │
│  ├── file_type: String                                     │
│  └── uploaded_at: DateTime                                 │
│                                                             │
│  sessions                                                   │
│  ├── _id: ObjectId                                         │
│  ├── session_id: String (unique)                          │
│  ├── created_at: DateTime                                  │
│  ├── files_count: Integer                                  │
│  └── chunks_count: Integer                                 │
└─────────────────────────────────────────────────────────────┘
```

### ChromaDB Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        CHROMADB                             │
│                  ./data/chromadb/                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Collection: [session_id]                                   │
│  ├── id: String (chunk_id)                                 │
│  ├── embedding: Vector[384] (float array)                  │
│  ├── document: String (chunk text)                         │
│  └── metadata:                                             │
│      ├── source: String (filename)                         │
│      ├── page: Integer                                     │
│      ├── chunk_index: Integer                              │
│      └── total_pages: Integer                              │
│                                                             │
│  Indexes:                                                   │
│  └── HNSW (Hierarchical Navigable Small World)            │
│      └── For fast similarity search                        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

```
┌─────────────────────────────────────────────────────────────┐
│                      TECH STACK                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend                                                   │
│  ├── React 19.2.0                                          │
│  ├── Tailwind CSS 4.2.1                                    │
│  ├── TanStack Router 1.168.0                               │
│  ├── Axios 1.16.0                                          │
│  └── Vite 7.3.1                                            │
│                                                             │
│  Backend                                                    │
│  ├── FastAPI 0.109.0                                       │
│  ├── Uvicorn 0.27.0                                        │
│  ├── Python 3.8+                                           │
│  └── Pydantic 2.5.3                                        │
│                                                             │
│  Databases                                                  │
│  ├── MongoDB (via Motor 3.3.2)                            │
│  ├── ChromaDB 0.4.22                                       │
│  └── PyMongo 4.6.1                                         │
│                                                             │
│  AI/ML                                                      │
│  ├── Google Gemini (LLM)                                   │
│  ├── LangChain 0.1.4                                       │
│  ├── Sentence Transformers 2.3.1                           │
│  └── HuggingFace Embeddings                                │
│                                                             │
│  Document Processing                                        │
│  ├── PyPDF2 3.0.1                                          │
│  ├── PyMuPDF 1.23.21                                       │
│  └── python-docx 1.1.0                                     │
│                                                             │
│  Security                                                   │
│  ├── Passlib 1.7.4 (bcrypt)                               │
│  └── CORS Middleware                                       │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Vercel/Netlify)                                 │
│  └── Static build from npm run build                       │
│                                                             │
│  Backend (AWS/GCP/Azure)                                    │
│  ├── Gunicorn + Uvicorn workers                           │
│  ├── Nginx reverse proxy                                   │
│  └── SSL/TLS certificates                                  │
│                                                             │
│  MongoDB (MongoDB Atlas)                                    │
│  ├── Cloud-hosted                                          │
│  ├── Automatic backups                                     │
│  └── Replica sets                                          │
│                                                             │
│  ChromaDB                                                   │
│  ├── Persistent volume                                     │
│  └── Regular backups                                       │
│                                                             │
│  File Storage                                               │
│  └── S3/Cloud Storage for uploads                         │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Network                                           │
│  ├── CORS configuration                                     │
│  ├── HTTPS/TLS                                             │
│  └── Rate limiting                                         │
│                                                             │
│  Layer 2: Authentication                                    │
│  ├── Bcrypt password hashing                               │
│  ├── JWT tokens (future)                                   │
│  └── Session management                                    │
│                                                             │
│  Layer 3: Authorization                                     │
│  ├── User-specific sessions                                │
│  ├── Document access control                               │
│  └── API endpoint protection                               │
│                                                             │
│  Layer 4: Data                                              │
│  ├── MongoDB authentication                                │
│  ├── Encrypted connections                                 │
│  └── Input validation                                      │
│                                                             │
│  Layer 5: Application                                       │
│  ├── File type validation                                  │
│  ├── File size limits                                      │
│  ├── Error handling                                        │
│  └── Logging & monitoring                                  │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                  PERFORMANCE FEATURES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Caching                                                    │
│  ├── Embedding model cached after first load               │
│  ├── ChromaDB persistent storage                           │
│  └── MongoDB connection pooling                            │
│                                                             │
│  Async Operations                                           │
│  ├── Motor (async MongoDB driver)                          │
│  ├── FastAPI async endpoints                               │
│  └── Concurrent request handling                           │
│                                                             │
│  Vector Search                                              │
│  ├── HNSW indexing in ChromaDB                             │
│  ├── Optimized similarity search                           │
│  └── Configurable top-K retrieval                          │
│                                                             │
│  Document Processing                                        │
│  ├── Chunking with overlap                                 │
│  ├── Batch embedding generation                            │
│  └── Efficient text extraction                             │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides:
- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Maintainability
- ✅ Extensibility
