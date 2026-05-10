# API Flow Documentation

## 🔄 Complete Request/Response Flows

### 1. Upload Flow

#### Request

```http
POST /upload HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="files"; filename="contract.pdf"
Content-Type: application/pdf

[Binary PDF data]
------WebKitFormBoundary
Content-Disposition: form-data; name="files"; filename="terms.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

[Binary DOCX data]
------WebKitFormBoundary--
```

#### Processing Steps

```
1. FastAPI receives request
   ├─ Validates Content-Type
   ├─ Parses multipart data
   └─ Creates UploadFile objects

2. Upload route handler
   ├─ Validates files exist
   ├─ Generates session_id (UUID)
   └─ Calls save_upload_file() for each file

3. File validation
   ├─ Check extension (pdf, docx, txt)
   ├─ Check size (< MAX_FILE_SIZE_MB)
   └─ Create session directory

4. Save files
   ├─ data/uploads/{session_id}/contract.pdf
   └─ data/uploads/{session_id}/terms.docx

5. RAG Pipeline - Document Processing
   ├─ Document Loader
   │   ├─ Load contract.pdf → Extract text
   │   └─ Load terms.docx → Extract text
   │
   ├─ Chunking Service
   │   ├─ Split contract text → 15 chunks
   │   └─ Split terms text → 8 chunks
   │
   ├─ Embedding Service
   │   ├─ Generate embeddings for 23 chunks
   │   └─ Each chunk → 384-dim vector
   │
   └─ Vector Store Service
       ├─ Create FAISS index
       ├─ Add all embeddings
       └─ Save to data/vectorstores/{session_id}/

6. Return response
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "session_id": "abc-123-def-456",
  "message": "Files uploaded and processed successfully",
  "files_processed": 2,
  "chunks_created": 23
}
```

#### Error Responses

**Invalid file type:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "detail": "File type not allowed. Allowed types: pdf,docx,txt"
}
```

**Processing error:**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "detail": "Upload failed: Error extracting text from PDF"
}
```

### 2. Chat Flow

#### Request

```http
POST /chat HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "session_id": "abc-123-def-456",
  "question": "What are the payment terms in the contract?"
}
```

#### Processing Steps

```
1. FastAPI receives request
   ├─ Validates JSON format
   ├─ Validates against ChatRequest model
   └─ Extracts session_id and question

2. Chat route handler
   └─ Calls rag_pipeline.query()

3. RAG Pipeline - Query Processing
   ├─ Load Vector Store
   │   ├─ Check if session exists
   │   ├─ Load from data/vectorstores/{session_id}/
   │   └─ Initialize FAISS index
   │
   ├─ Embedding Service
   │   ├─ Convert question to embedding
   │   └─ Generate 384-dim query vector
   │
   ├─ Retriever Service
   │   ├─ FAISS similarity search
   │   ├─ Compare query vector with all stored vectors
   │   ├─ Calculate cosine similarity scores
   │   └─ Return top 4 most similar chunks
   │
   ├─ Context Formation
   │   ├─ Format chunk 1 with metadata
   │   ├─ Format chunk 2 with metadata
   │   ├─ Format chunk 3 with metadata
   │   ├─ Format chunk 4 with metadata
   │   └─ Combine into context string
   │
   └─ LLM Service
       ├─ Create system prompt
       ├─ Create user prompt (context + question)
       ├─ Call OpenAI/Gemini API
       ├─ Receive generated answer
       └─ Format sources

4. Return response
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "answer": "According to Section 5.2 of the contract, payment terms are Net 30 days from the invoice date. Invoices will be sent monthly on the 1st of each month. Accepted payment methods include wire transfer and check.",
  "sources": [
    "[Source 1] Page 5: Section 5.2 - Payment Terms: All payments shall be made within thirty (30) days of invoice date...",
    "[Source 2] Page 6: Invoicing Schedule: Invoices will be issued on the first day of each calendar month...",
    "[Source 3] Page 5: Payment Methods: Client may pay via wire transfer or check made payable to...",
    "[Source 4] Page 7: Late Payment: Any payment not received within the specified period..."
  ],
  "session_id": "abc-123-def-456"
}
```

#### Error Responses

**Session not found:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "answer": "No documents found for this session. Please upload documents first.",
  "sources": [],
  "session_id": "abc-123-def-456"
}
```

**No relevant information:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "answer": "Answer not available in uploaded documents.",
  "sources": [],
  "session_id": "abc-123-def-456"
}
```

**Processing error:**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "detail": "Chat failed: Error generating embeddings"
}
```

### 3. Health Check Flow

#### Request

```http
GET /health HTTP/1.1
Host: localhost:8000
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "version": "1.0.0",
  "message": "LegalRAG AI Chatbot is running"
}
```

## 📊 Detailed Component Interactions

### Upload Flow - Sequence Diagram

```
User          API           FileUtils      RAGPipeline    DocLoader    Chunking    Embedding    VectorStore
 |             |                |              |              |            |            |            |
 |--Upload---->|                |              |              |            |            |            |
 |             |--Validate----->|              |              |            |            |            |
 |             |<--OK-----------|              |              |            |            |            |
 |             |--Generate ID-->|              |              |            |            |            |
 |             |<--session_id---|              |              |            |            |            |
 |             |--Save Files--->|              |              |            |            |            |
 |             |<--Paths--------|              |              |            |            |            |
 |             |--Process Docs---------------->|              |            |            |            |
 |             |                |              |--Load------->|            |            |            |
 |             |                |              |<--Docs-------|            |            |            |
 |             |                |              |--Chunk------------------->|            |            |
 |             |                |              |<--Chunks------------------|            |            |
 |             |                |              |--Embed---------------------------->|            |
 |             |                |              |<--Vectors---------------------------|            |
 |             |                |              |--Create Store--------------------------------->|
 |             |                |              |<--Success-----------------------------------|
 |             |<--Result----------------------|              |            |            |            |
 |<--Response--|                |              |              |            |            |            |
```

### Chat Flow - Sequence Diagram

```
User          API         RAGPipeline    VectorStore    Retriever    LLMService    OpenAI/Gemini
 |             |              |              |              |            |              |
 |--Question-->|              |              |              |            |              |
 |             |--Query------>|              |              |            |              |
 |             |              |--Load------->|              |            |              |
 |             |              |<--Index------|              |            |              |
 |             |              |--Retrieve---------------->|            |              |
 |             |              |<--Chunks------------------|            |              |
 |             |              |--Format Context           |            |              |
 |             |              |--Generate Answer---------------------->|              |
 |             |              |                           |            |--API Call--->|
 |             |              |                           |            |<--Response---|
 |             |              |<--Answer-----------------------|              |
 |             |<--Result-----|              |              |            |              |
 |<--Response--|              |              |              |            |              |
```

## 🔍 Data Transformations

### Upload Flow Data Transformation

```
1. Input: Binary file data
   ↓
2. UploadFile object
   {
     filename: "contract.pdf",
     content_type: "application/pdf",
     file: <file object>
   }
   ↓
3. Saved file path
   "data/uploads/abc-123/contract.pdf"
   ↓
4. Extracted text
   "This agreement is made between..."
   ↓
5. Document object
   {
     text: "This agreement is made...",
     metadata: {
       source: "contract.pdf",
       page: 1,
       format: "pdf"
     }
   }
   ↓
6. Chunks
   [
     {
       text: "This agreement is made between...",
       metadata: {source: "contract.pdf", page: 1, chunk_index: 0}
     },
     {
       text: "...terms. Section 2: Payment...",
       metadata: {source: "contract.pdf", page: 1, chunk_index: 1}
     }
   ]
   ↓
7. Embeddings
   [
     [0.23, -0.45, 0.67, ..., 0.12],  # 384 dimensions
     [0.25, -0.43, 0.69, ..., 0.14]
   ]
   ↓
8. FAISS Index
   Stored in: data/vectorstores/abc-123/
   Files: index.faiss, index.pkl
```

### Chat Flow Data Transformation

```
1. Input: Question string
   "What are the payment terms?"
   ↓
2. Query embedding
   [0.12, -0.34, 0.56, ..., 0.23]  # 384 dimensions
   ↓
3. Similarity scores
   [
     (chunk_15, 0.89),
     (chunk_16, 0.85),
     (chunk_8, 0.78),
     (chunk_22, 0.72)
   ]
   ↓
4. Retrieved chunks
   [
     {text: "Payment terms: Net 30...", metadata: {...}},
     {text: "Invoice schedule...", metadata: {...}},
     {text: "Payment methods...", metadata: {...}},
     {text: "Late payment...", metadata: {...}}
   ]
   ↓
5. Formatted context
   "[Document 1 - Source: contract.pdf, Page: 5]
    Payment terms: Net 30...
    
    [Document 2 - Source: contract.pdf, Page: 6]
    Invoice schedule..."
   ↓
6. LLM prompt
   {
     system: "You are a legal assistant...",
     user: "Context: [...]\nQuestion: What are the payment terms?"
   }
   ↓
7. LLM response
   "According to Section 5.2, payment terms are Net 30..."
   ↓
8. Final response
   {
     answer: "According to Section 5.2...",
     sources: ["[Source 1] Page 5: ...", ...],
     session_id: "abc-123"
   }
```

## ⏱️ Performance Metrics

### Upload Flow Timing

```
Component                Time        % of Total
─────────────────────────────────────────────────
File Upload              0.5s        5%
Document Loading         2.0s        20%
Text Chunking            0.3s        3%
Embedding Generation     6.0s        60%
FAISS Index Creation     1.0s        10%
Disk I/O                 0.2s        2%
─────────────────────────────────────────────────
Total                    10.0s       100%
```

**Optimization opportunities:**
- Use GPU for embeddings (6s → 0.6s)
- Batch processing for multiple files
- Async processing with job queue

### Chat Flow Timing

```
Component                Time        % of Total
─────────────────────────────────────────────────
Load Vector Store        0.1s        3%
Query Embedding          0.05s       2%
FAISS Search             0.05s       2%
Context Formatting       0.01s       <1%
LLM API Call             2.5s        83%
Response Formatting      0.01s       <1%
─────────────────────────────────────────────────
Total                    3.0s        100%
```

**Optimization opportunities:**
- Cache common queries
- Use streaming responses
- Parallel LLM calls for multiple questions

## 🔒 Security Flow

### API Key Validation

```
Application Startup
    ↓
Load .env file
    ↓
Parse environment variables
    ↓
Validate API keys
    ├─ Check LLM_PROVIDER
    ├─ If "openai": Validate OPENAI_API_KEY
    └─ If "gemini": Validate GOOGLE_API_KEY
    ↓
Initialize LLM service
    ↓
Ready to accept requests
```

### File Upload Security

```
Receive file
    ↓
Validate extension
    ├─ Allowed: pdf, docx, txt
    └─ Rejected: exe, sh, py, etc.
    ↓
Validate size
    ├─ < MAX_FILE_SIZE_MB
    └─ Reject if too large
    ↓
Sanitize filename
    ├─ Remove path traversal (.., /)
    └─ Remove special characters
    ↓
Create session directory
    ├─ Isolated per session
    └─ No cross-session access
    ↓
Save file
```

## 📈 Error Handling Flow

### Upload Error Handling

```
Try:
    Validate files
    ↓
    Save files
    ↓
    Process documents
    ↓
    Return success
Except ValidationError:
    ↓
    Log error details
    ↓
    Return 400 Bad Request
Except ProcessingError:
    ↓
    Log error details
    ↓
    Cleanup partial files
    ↓
    Return 500 Internal Server Error
```

### Chat Error Handling

```
Try:
    Load vector store
    ↓
    If not found:
        Return "No documents found"
    ↓
    Retrieve chunks
    ↓
    If no chunks:
        Return "Answer not available"
    ↓
    Generate answer
    ↓
    Return success
Except LLMError:
    ↓
    Log error details
    ↓
    Return 500 with sanitized message
```

## 🧪 Testing Flows

### cURL Examples

**Upload:**
```bash
curl -X POST http://localhost:8000/upload \
  -F "files=@contract.pdf" \
  -F "files=@terms.docx"
```

**Chat:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "abc-123",
    "question": "What are the payment terms?"
  }'
```

### Python Examples

**Upload:**
```python
import requests

files = [
    ('files', open('contract.pdf', 'rb')),
    ('files', open('terms.docx', 'rb'))
]

response = requests.post('http://localhost:8000/upload', files=files)
print(response.json())
```

**Chat:**
```python
import requests

data = {
    "session_id": "abc-123",
    "question": "What are the payment terms?"
}

response = requests.post('http://localhost:8000/chat', json=data)
print(response.json())
```

---

**Next**: Read [Vector Database](vector_database.md) for FAISS details.
