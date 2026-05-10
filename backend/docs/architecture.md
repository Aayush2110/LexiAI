# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│                  (Separate Repository)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer (Routes)                      │  │
│  │  • /upload  • /chat  • /health                       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │           RAG Pipeline Orchestrator                  │  │
│  │  Coordinates all RAG components                      │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              Service Layer                           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │Document  │ │Chunking  │ │Embedding │            │  │
│  │  │Loader    │ │Service   │ │Service   │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │Vector    │ │Retriever │ │LLM       │            │  │
│  │  │Store     │ │Service   │ │Service   │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   File       │  │   FAISS     │  │  OpenAI/   │
│   Storage    │  │   Vector    │  │  Gemini    │
│   (Local)    │  │   Store     │  │  API       │
└──────────────┘  └─────────────┘  └────────────┘
```

## 📦 Component Architecture

### 1. API Layer

**Purpose**: Handle HTTP requests and responses

**Components**:
- `health.py`: Health check endpoint
- `upload.py`: File upload and processing
- `chat.py`: Chat query handling

**Responsibilities**:
- Request validation (Pydantic models)
- Error handling
- Response formatting
- CORS management

### 2. Service Layer

**Purpose**: Business logic and RAG operations

#### Document Loader Service
```python
Input: File paths
Process: Parse PDF/DOCX/TXT
Output: Structured documents with metadata
```

**Key Features**:
- Multi-format support
- Page-level granularity
- Metadata preservation
- Error handling per file

#### Chunking Service
```python
Input: Documents
Process: Split using RecursiveCharacterTextSplitter
Output: Chunks with overlap
```

**Key Features**:
- Configurable chunk size
- Semantic boundary preservation
- Overlap for context
- Chunk statistics

#### Embedding Service
```python
Input: Text chunks
Process: Generate vectors using Sentence Transformers
Output: 384-dimensional embeddings
```

**Key Features**:
- Local model (no API calls)
- Batch processing
- Normalized vectors
- Caching support

#### Vector Store Service
```python
Input: Chunks + Embeddings
Process: Create/save/load FAISS index
Output: Searchable vector store
```

**Key Features**:
- Session-based storage
- Disk persistence
- Fast similarity search
- Index management

#### Retriever Service
```python
Input: Query + Vector store
Process: Similarity search
Output: Top-K relevant chunks
```

**Key Features**:
- Configurable K
- Score-based filtering
- Context formatting
- Metadata inclusion

#### LLM Service
```python
Input: Question + Context
Process: Generate answer via LLM API
Output: Natural language response
```

**Key Features**:
- Multi-provider support (OpenAI/Gemini)
- Prompt engineering
- Temperature control
- Error handling

#### RAG Pipeline
```python
Input: Files or Query
Process: Orchestrate all services
Output: Processed data or Answer
```

**Key Features**:
- End-to-end coordination
- Session management
- Error propagation
- Statistics tracking

### 3. Core Layer

**Purpose**: Application configuration and utilities

**Components**:
- `config.py`: Environment-based settings
- `logging.py`: Structured logging
- `security.py`: API key validation

### 4. Models Layer

**Purpose**: Data validation and serialization

**Components**:
- `request_models.py`: API request schemas
- `response_models.py`: API response schemas

### 5. Utils Layer

**Purpose**: Helper functions

**Components**:
- `file_utils.py`: File operations
- `helpers.py`: Text processing

## 🔄 Data Flow

### Upload Flow

```
1. User uploads files via /upload
   ↓
2. FastAPI receives multipart/form-data
   ↓
3. File validation (extension, size)
   ↓
4. Generate unique session_id
   ↓
5. Save files to data/uploads/{session_id}/
   ↓
6. Document Loader: Extract text
   ↓
7. Chunking Service: Split into chunks
   ↓
8. Embedding Service: Generate vectors
   ↓
9. Vector Store: Create FAISS index
   ↓
10. Save index to data/vectorstores/{session_id}/
    ↓
11. Return session_id to user
```

### Query Flow

```
1. User sends question via /chat
   ↓
2. FastAPI receives JSON with session_id + question
   ↓
3. Load FAISS index for session_id
   ↓
4. Embedding Service: Convert question to vector
   ↓
5. Retriever: Similarity search in FAISS
   ↓
6. Get top-K most similar chunks
   ↓
7. Format chunks into context string
   ↓
8. Create prompt: System + Context + Question
   ↓
9. LLM Service: Generate answer
   ↓
10. Format response with sources
    ↓
11. Return to user
```

## 🗄️ Data Storage

### File Storage Structure

```
data/
├── uploads/
│   ├── session-abc-123/
│   │   ├── contract.pdf
│   │   └── agreement.docx
│   └── session-def-456/
│       └── terms.txt
└── vectorstores/
    ├── session-abc-123/
    │   ├── index.faiss      # FAISS index
    │   └── index.pkl        # Metadata + documents
    └── session-def-456/
        ├── index.faiss
        └── index.pkl
```

### Session Management

**Session ID**: UUID4 format (e.g., `abc-123-def-456`)

**Lifecycle**:
1. Created on upload
2. Used for all queries
3. Persists until manual deletion
4. Isolated per user/session

**Benefits**:
- Multi-user support
- Session isolation
- Easy cleanup
- Scalable design

## 🔌 External Dependencies

### 1. LangChain

**Purpose**: RAG framework

**Usage**:
- Document loaders
- Text splitters
- Vector stores
- LLM wrappers

**Why**:
- Production-ready
- Well-maintained
- Extensive integrations
- Active community

### 2. FAISS

**Purpose**: Vector similarity search

**Usage**:
- Store embeddings
- Fast nearest neighbor search
- Index persistence

**Why**:
- Optimized by Facebook AI
- Handles millions of vectors
- Local (no external DB)
- Production-proven

### 3. Sentence Transformers

**Purpose**: Text embeddings

**Usage**:
- Convert text to vectors
- Semantic similarity

**Why**:
- State-of-the-art models
- Fast inference
- No API calls
- Easy to use

### 4. OpenAI / Gemini

**Purpose**: LLM for answer generation

**Usage**:
- Generate natural language answers
- Follow instructions

**Why**:
- High-quality responses
- Reliable API
- Good instruction following
- Production-ready

## 🔐 Security Architecture

### API Key Management

```
.env file (not committed)
    ↓
Environment variables
    ↓
Pydantic Settings (validated)
    ↓
Service initialization
```

### File Upload Security

1. **Extension validation**: Only PDF, DOCX, TXT
2. **Size limits**: Configurable max size
3. **Session isolation**: Files stored per session
4. **Path sanitization**: Prevent directory traversal

### Error Handling

```
Try-Catch at every layer
    ↓
Log error details (internal)
    ↓
Return sanitized error (user)
    ↓
HTTP status codes
```

## 📊 Scalability Considerations

### Current Architecture (Single Server)

**Capacity**:
- ~100 concurrent users
- ~1000 documents per session
- ~10MB per document

**Bottlenecks**:
- CPU for embeddings
- Disk I/O for FAISS
- LLM API rate limits

### Scaling Strategies

#### Horizontal Scaling

```
Load Balancer
    ↓
┌─────────┬─────────┬─────────┐
│ Server 1│ Server 2│ Server 3│
└─────────┴─────────┴─────────┘
    ↓
Shared Storage (S3/NFS)
```

**Changes needed**:
- Shared file storage (S3)
- Shared vector store (PostgreSQL + pgvector)
- Session management (Redis)

#### Vertical Scaling

**Improvements**:
- GPU for embeddings (10x faster)
- More RAM for larger FAISS indices
- SSD for faster I/O

#### Caching

```
Query → Check Cache → Return cached result
         ↓ (miss)
    Generate answer → Cache result → Return
```

**Cache Strategy**:
- Cache embeddings for common queries
- Cache LLM responses (with TTL)
- Use Redis for distributed cache

#### Async Processing

```
Upload → Queue job → Return immediately
            ↓
    Background worker processes
            ↓
    Notify when complete
```

**Benefits**:
- Better user experience
- Handle large files
- Prevent timeouts

## 🧪 Testing Architecture

### Unit Tests

```
tests/
├── test_document_loader.py
├── test_chunking.py
├── test_embeddings.py
├── test_vector_store.py
├── test_retriever.py
└── test_llm_service.py
```

### Integration Tests

```
tests/
├── test_upload_flow.py
├── test_query_flow.py
└── test_end_to_end.py
```

### Test Strategy

1. **Mock external APIs** (OpenAI/Gemini)
2. **Use test fixtures** (sample documents)
3. **Test error cases** (invalid files, missing sessions)
4. **Performance tests** (large documents, many queries)

## 🚀 Deployment Architecture

### Development

```
Local Machine
    ↓
Python venv
    ↓
uvicorn --reload
```

### Production

```
Docker Container
    ↓
Gunicorn (4 workers)
    ↓
Uvicorn workers
    ↓
Nginx (reverse proxy)
```

### Cloud Deployment Options

#### Option 1: AWS

```
EC2 Instance
    ↓
Docker + Docker Compose
    ↓
S3 for file storage
    ↓
RDS for metadata
```

#### Option 2: Google Cloud

```
Cloud Run (serverless)
    ↓
Cloud Storage for files
    ↓
Cloud SQL for metadata
```

#### Option 3: Azure

```
App Service
    ↓
Blob Storage for files
    ↓
Azure SQL for metadata
```

## 📈 Monitoring Architecture

### Logging

```
Application Logs (Loguru)
    ↓
File rotation (daily)
    ↓
Log aggregation (ELK/CloudWatch)
    ↓
Alerts on errors
```

### Metrics

```
Prometheus metrics
    ↓
Grafana dashboards
    ↓
Alerts on thresholds
```

**Key Metrics**:
- Request rate
- Response time
- Error rate
- LLM API latency
- Embedding generation time
- FAISS search time

### Health Checks

```
/health endpoint
    ↓
Load balancer checks
    ↓
Auto-restart on failure
```

## 🔄 Future Enhancements

### 1. Multi-tenancy

- User authentication (JWT)
- User-specific sessions
- Usage quotas
- Billing integration

### 2. Advanced RAG

- Hybrid search (semantic + keyword)
- Re-ranking models
- Query expansion
- Metadata filtering

### 3. Conversation Memory

- Store chat history
- Context-aware follow-ups
- Session persistence

### 4. Streaming Responses

- Server-Sent Events (SSE)
- Real-time answer generation
- Better UX

### 5. Analytics

- Query analytics
- Document usage stats
- User behavior tracking
- A/B testing

## 📚 Design Patterns Used

### 1. Service Layer Pattern

- Separation of concerns
- Reusable business logic
- Easy testing

### 2. Dependency Injection

- Loose coupling
- Easy mocking
- Flexible configuration

### 3. Factory Pattern

- LLM service creation
- Vector store initialization

### 4. Singleton Pattern

- Global service instances
- Shared configuration

### 5. Pipeline Pattern

- RAG pipeline orchestration
- Sequential processing
- Error propagation

## 🎯 Design Principles

1. **Modularity**: Each service has single responsibility
2. **Scalability**: Designed for horizontal scaling
3. **Maintainability**: Clear code structure and documentation
4. **Testability**: Easy to unit test and mock
5. **Security**: API keys, validation, error handling
6. **Performance**: Optimized for speed and efficiency

---

**Next**: Read [API Flow](api_flow.md) for detailed request/response flows.
