# RAG (Retrieval Augmented Generation) Explained

## 🎯 What is RAG?

RAG stands for **Retrieval Augmented Generation**. It's a technique that combines:

1. **Retrieval**: Finding relevant information from a knowledge base
2. **Augmentation**: Adding that information as context to a prompt
3. **Generation**: Using an LLM to generate an answer based on the context

## 🤔 Why Do We Need RAG?

### The Problem with LLMs Alone

Large Language Models (LLMs) like GPT-4 or Gemini have limitations:

1. **Knowledge Cutoff**: Trained on data up to a certain date
2. **No Access to Private Data**: Can't access your company documents
3. **Hallucinations**: May generate plausible but incorrect information
4. **No Source Attribution**: Can't cite where information came from

### How RAG Solves These Problems

```
Without RAG:
User: "What's in our Q4 contract?"
LLM: "I don't have access to your specific contract..." ❌

With RAG:
User: "What's in our Q4 contract?"
System: [Retrieves relevant sections from uploaded contract]
LLM: "According to Section 3.2 of your contract..." ✅
```

## 🔄 RAG Pipeline Flow

### Step-by-Step Process

```
1. INDEXING PHASE (One-time per document)
   ↓
   User Uploads Document (PDF/DOCX/TXT)
   ↓
   Document Parsing (Extract text)
   ↓
   Text Chunking (Split into smaller pieces)
   ↓
   Embedding Generation (Convert to vectors)
   ↓
   Vector Storage (Save in FAISS)

2. QUERY PHASE (Every user question)
   ↓
   User Asks Question
   ↓
   Question Embedding (Convert question to vector)
   ↓
   Similarity Search (Find relevant chunks)
   ↓
   Context Formation (Format retrieved chunks)
   ↓
   Prompt Creation (Context + Question)
   ↓
   LLM Generation (Generate answer)
   ↓
   Response with Sources
```

## 📚 Detailed Component Breakdown

### 1. Document Parsing

**What it does**: Extracts text from various file formats

**Why it's needed**: 
- PDFs store text in complex formats
- DOCX files are XML-based
- Need consistent text output

**Our implementation**:
- PyMuPDF (fitz) for PDFs - faster and more accurate
- python-docx for Word documents
- Built-in Python for TXT files

### 2. Text Chunking

**What it does**: Splits large documents into smaller pieces

**Why it's needed**:
- LLMs have token limits (e.g., 4K, 8K, 16K tokens)
- Smaller chunks = more precise retrieval
- Better semantic matching

**Example**:
```
Original Document (10,000 words)
         ↓
Chunk 1 (1000 chars): "Section 1: Introduction..."
Chunk 2 (1000 chars): "...terms. Section 2: Payment..."
Chunk 3 (1000 chars): "...schedule. Section 3: Termination..."
```

**Chunk Overlap**:
```
Chunk 1: [0-1000] "...end of sentence"
Chunk 2: [800-1800] "end of sentence. New paragraph..."
         ↑
    200 char overlap prevents context loss
```

**Why overlap matters**:
- Prevents information loss at boundaries
- Maintains context across chunks
- Ensures complete sentences/paragraphs

### 3. Embeddings

**What they are**: Numerical representations of text (vectors)

**Example**:
```
Text: "The contract expires on December 31st"
Embedding: [0.23, -0.45, 0.67, ..., 0.12] (384 dimensions)

Text: "The agreement ends on Dec 31"
Embedding: [0.25, -0.43, 0.69, ..., 0.14] (similar values!)
```

**Why they work**:
- Similar meanings → Similar vectors
- Enables mathematical similarity comparison
- Captures semantic meaning, not just keywords

**Our model**: `all-MiniLM-L6-v2`
- 384 dimensions
- Fast inference (~50ms per text)
- Good balance of speed and accuracy
- Trained on 1 billion sentence pairs

### 4. Vector Storage (FAISS)

**What it does**: Stores embeddings for fast similarity search

**How it works**:
```
Store Phase:
Chunk 1 → Embedding 1 → FAISS Index [ID: 1]
Chunk 2 → Embedding 2 → FAISS Index [ID: 2]
Chunk 3 → Embedding 3 → FAISS Index [ID: 3]

Search Phase:
Question → Query Embedding → FAISS Search → Top K IDs → Return Chunks
```

**Why FAISS**:
- Optimized by Facebook AI Research
- Handles millions of vectors
- Fast nearest neighbor search
- Runs locally (no external database)

**Similarity Metrics**:
- **Cosine Similarity**: Measures angle between vectors (0-1)
- **L2 Distance**: Euclidean distance
- **Dot Product**: Direct multiplication

### 5. Retrieval

**What it does**: Finds most relevant chunks for a question

**Process**:
```
Question: "What are the payment terms?"
         ↓
Query Embedding: [0.12, -0.34, 0.56, ...]
         ↓
FAISS Search: Compare with all stored embeddings
         ↓
Top 4 Results:
1. Chunk 15 (Score: 0.89) - "Payment terms: Net 30..."
2. Chunk 16 (Score: 0.85) - "Invoice schedule..."
3. Chunk 8 (Score: 0.78) - "Payment methods accepted..."
4. Chunk 22 (Score: 0.72) - "Late payment penalties..."
```

**Top-K Selection**:
- K=1: Only best match (risky, might miss context)
- K=3-5: Balanced (recommended)
- K=10+: More context but more noise

### 6. Context Formation

**What it does**: Formats retrieved chunks for LLM

**Example**:
```
[Document 1 - Source: contract.pdf, Page: 5]
Payment terms: Net 30 days from invoice date...

[Document 2 - Source: contract.pdf, Page: 6]
Invoice schedule: Monthly invoicing on the 1st...

[Document 3 - Source: contract.pdf, Page: 3]
Payment methods: Wire transfer or check...
```

### 7. Prompt Engineering

**What it does**: Creates effective prompts for LLM

**Structure**:
```
System Prompt:
"You are a legal document assistant. Answer ONLY from provided context.
If answer not in context, say 'Answer not available in uploaded documents.'"

User Prompt:
"Context: [Retrieved chunks]
Question: What are the payment terms?
Answer based ONLY on the context above."
```

**Why it matters**:
- Prevents hallucinations
- Ensures grounded responses
- Maintains professional tone
- Handles missing information gracefully

### 8. LLM Generation

**What it does**: Generates final answer

**Process**:
```
Input: System Prompt + Context + Question
         ↓
LLM Processing (GPT-3.5/GPT-4/Gemini)
         ↓
Output: "According to Section 5.2, payment terms are Net 30..."
```

**Temperature Setting**:
- 0.0: Deterministic, focused (best for factual Q&A)
- 0.1-0.3: Slightly varied but consistent (recommended for legal)
- 0.7-1.0: Creative, varied (not recommended for factual)

## 🆚 RAG vs Alternatives

### RAG vs Fine-tuning

| Aspect | RAG | Fine-tuning |
|--------|-----|-------------|
| **Cost** | Low (API calls only) | High (GPU training) |
| **Speed** | Fast (instant updates) | Slow (hours/days) |
| **Flexibility** | High (add docs anytime) | Low (need retraining) |
| **Accuracy** | High for factual Q&A | High for style/tone |
| **Use Case** | Dynamic knowledge | Specialized behavior |

### RAG vs Semantic Search

| Aspect | RAG | Semantic Search |
|--------|-----|-----------------|
| **Output** | Natural language answer | Relevant documents |
| **User Experience** | Conversational | Manual reading |
| **Accuracy** | LLM-generated | Exact retrieval |
| **Use Case** | Q&A chatbots | Document discovery |

## 🎯 RAG Best Practices

### 1. Chunking Strategy

**Good**:
```python
chunk_size = 1000  # ~200 words
chunk_overlap = 200  # 20% overlap
```

**Why**:
- 1000 chars ≈ 200 words ≈ 2-3 paragraphs
- Enough context for understanding
- Not too large (noise) or small (fragmentation)

### 2. Retrieval Configuration

**Good**:
```python
top_k = 4  # Retrieve 4 most relevant chunks
```

**Why**:
- Balances context and noise
- Fits within most LLM context windows
- Provides diverse perspectives

### 3. Prompt Engineering

**Good**:
```
"Answer ONLY from provided context.
If answer not found, say 'Answer not available in uploaded documents.'"
```

**Why**:
- Prevents hallucinations
- Sets clear boundaries
- Maintains trust

### 4. Embedding Model Selection

**For Legal Documents**:
- `all-MiniLM-L6-v2`: Fast, good general purpose
- `all-mpnet-base-v2`: More accurate, slower
- Domain-specific models for specialized legal terms

## 🚀 Advanced RAG Techniques

### 1. Hybrid Search

Combine semantic search with keyword search:
```
Semantic: "What are payment terms?" → Finds conceptually similar
Keyword: "payment terms" → Finds exact matches
Combined: Best of both worlds
```

### 2. Re-ranking

Retrieve more chunks (K=20), then re-rank top results:
```
Initial Retrieval: 20 chunks
Re-ranking Model: Score relevance more accurately
Final Selection: Top 4 chunks
```

### 3. Query Expansion

Expand user query for better retrieval:
```
Original: "payment terms"
Expanded: "payment terms, invoice schedule, billing cycle, payment methods"
```

### 4. Metadata Filtering

Filter by document metadata:
```
Question: "What's in the 2023 contract?"
Filter: metadata['year'] == 2023
Result: Only search 2023 documents
```

## 📊 RAG Performance Metrics

### Retrieval Metrics

1. **Precision**: % of retrieved chunks that are relevant
2. **Recall**: % of relevant chunks that were retrieved
3. **MRR (Mean Reciprocal Rank)**: Position of first relevant result

### Generation Metrics

1. **Faithfulness**: Answer grounded in context
2. **Relevance**: Answer addresses the question
3. **Coherence**: Answer is well-structured

## 🔧 Troubleshooting RAG

### Problem: Irrelevant Answers

**Causes**:
- Poor retrieval (wrong chunks)
- Weak prompt engineering
- Low-quality embeddings

**Solutions**:
- Increase chunk overlap
- Improve prompt clarity
- Use better embedding model
- Increase top_k

### Problem: "Answer not available" Too Often

**Causes**:
- Chunks too small
- Top_k too low
- Poor document parsing

**Solutions**:
- Increase chunk size
- Increase top_k
- Verify document extraction quality

### Problem: Slow Performance

**Causes**:
- Large documents
- Slow embedding generation
- Slow LLM

**Solutions**:
- Use GPU for embeddings
- Batch processing
- Use faster LLM (gpt-3.5 vs gpt-4)
- Cache common queries

## 🎓 Learning Resources

1. **LangChain Documentation**: https://python.langchain.com/
2. **FAISS Documentation**: https://faiss.ai/
3. **Sentence Transformers**: https://www.sbert.net/
4. **OpenAI Cookbook**: https://cookbook.openai.com/

## 🏁 Conclusion

RAG is a powerful technique that:
- ✅ Grounds LLM responses in factual data
- ✅ Enables Q&A on private documents
- ✅ Prevents hallucinations
- ✅ Provides source attribution
- ✅ Scales to large document collections

It's the foundation of modern AI-powered document Q&A systems.

---

**Next**: Read [Architecture](architecture.md) for system design details.
