# Vector Database (FAISS) Deep Dive

## 🎯 What is a Vector Database?

A vector database stores and retrieves high-dimensional vectors efficiently. Unlike traditional databases that store structured data (rows/columns), vector databases are optimized for similarity search.

### Traditional Database vs Vector Database

**Traditional Database (SQL):**
```sql
SELECT * FROM documents WHERE title = 'Contract'
```
- Exact match search
- Keyword-based
- Fast for structured queries

**Vector Database (FAISS):**
```python
query_vector = [0.12, -0.34, 0.56, ...]
similar_vectors = faiss.search(query_vector, k=5)
```
- Similarity search
- Semantic understanding
- Fast for unstructured data

## 🔍 What is FAISS?

**FAISS** = Facebook AI Similarity Search

Developed by Facebook AI Research (now Meta AI) for efficient similarity search and clustering of dense vectors.

### Key Features

1. **Speed**: Optimized C++ implementation
2. **Scalability**: Handles billions of vectors
3. **Flexibility**: Multiple index types
4. **Local**: No external database needed
5. **Free**: Open source (MIT license)

### Why FAISS for RAG?

| Requirement | FAISS Solution |
|-------------|----------------|
| Fast search | Optimized algorithms (IVF, HNSW) |
| Large datasets | Handles millions of vectors |
| Low latency | In-memory search |
| No cloud costs | Runs locally |
| Easy integration | Python bindings |

## 📊 How FAISS Works

### 1. Vector Representation

Every text chunk is converted to a vector (embedding):

```
Text: "Payment terms are Net 30 days"
         ↓ (Sentence Transformer)
Vector: [0.23, -0.45, 0.67, 0.12, ..., 0.89]
        └─────────── 384 dimensions ──────────┘
```

### 2. Index Creation

FAISS builds an index for fast search:

```python
import faiss

# Create index
dimension = 384
index = faiss.IndexFlatL2(dimension)

# Add vectors
vectors = [[0.23, -0.45, ...], [0.25, -0.43, ...]]
index.add(vectors)

# Search
query = [0.12, -0.34, ...]
distances, indices = index.search(query, k=5)
```

### 3. Similarity Search

FAISS finds nearest neighbors:

```
Query Vector: [0.12, -0.34, 0.56, ...]
                    ↓
         Compare with all stored vectors
                    ↓
    Calculate distances/similarities
                    ↓
         Return K nearest neighbors
                    ↓
Results: [(vector_15, distance_0.23),
          (vector_8, distance_0.31),
          (vector_22, distance_0.45)]
```

## 🧮 Distance Metrics

### 1. L2 Distance (Euclidean)

**Formula**: `√(Σ(a[i] - b[i])²)`

**Interpretation**:
- Smaller = More similar
- 0 = Identical
- Measures straight-line distance

**Example**:
```
Vector A: [1, 2, 3]
Vector B: [1, 2, 5]
L2 Distance: √((1-1)² + (2-2)² + (3-5)²) = √4 = 2
```

### 2. Cosine Similarity

**Formula**: `(A · B) / (||A|| × ||B||)`

**Interpretation**:
- 1 = Identical direction
- 0 = Orthogonal
- -1 = Opposite direction

**Example**:
```
Vector A: [1, 2, 3]
Vector B: [2, 4, 6]
Cosine Similarity: 1.0 (same direction, different magnitude)
```

### 3. Inner Product (Dot Product)

**Formula**: `Σ(a[i] × b[i])`

**Interpretation**:
- Higher = More similar
- Considers both direction and magnitude

**Our Choice**: L2 Distance with normalized vectors (equivalent to cosine similarity)

## 🏗️ FAISS Index Types

### 1. IndexFlatL2 (Exact Search)

**What it is**: Brute-force search, compares query with every vector

**Pros**:
- 100% accurate
- Simple to use
- Good for small datasets

**Cons**:
- Slow for large datasets (O(n) complexity)
- Not scalable

**Use case**: < 100K vectors

```python
index = faiss.IndexFlatL2(dimension)
```

### 2. IndexIVFFlat (Inverted File Index)

**What it is**: Divides vectors into clusters, searches only relevant clusters

**Pros**:
- Much faster than flat
- Good accuracy
- Scalable to millions

**Cons**:
- Requires training
- Slightly less accurate

**Use case**: 100K - 10M vectors

```python
quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, nlist=100)
index.train(training_vectors)
```

### 3. IndexHNSW (Hierarchical Navigable Small World)

**What it is**: Graph-based index for fast approximate search

**Pros**:
- Very fast
- Good accuracy
- No training needed

**Cons**:
- Higher memory usage
- More complex

**Use case**: Need fastest search

```python
index = faiss.IndexHNSWFlat(dimension, M=32)
```

### Our Implementation

We use **IndexFlatL2** because:
- Simple and reliable
- Perfect accuracy
- Sufficient for typical use cases (< 100K chunks)
- Easy to understand for learning

For production with large datasets, consider IndexIVFFlat or IndexHNSW.

## 💾 FAISS Storage

### Files Created

When saving a FAISS index:

```
data/vectorstores/session-abc-123/
├── index.faiss    # FAISS index (binary)
└── index.pkl      # Metadata + documents (pickle)
```

### index.faiss

**Contents**:
- Vector data
- Index structure
- Search parameters

**Format**: Binary (FAISS-specific)

**Size**: ~4 bytes per dimension per vector
- 1000 vectors × 384 dimensions × 4 bytes = ~1.5 MB

### index.pkl

**Contents**:
- Original text chunks
- Metadata (source, page, etc.)
- Document IDs

**Format**: Python pickle

**Size**: Depends on text length
- 1000 chunks × 1000 chars = ~1 MB

## 🔄 FAISS Operations in Our System

### 1. Create Index (Upload Flow)

```python
from langchain.vectorstores import FAISS
from app.services.embeddings import embedding_service

# Documents with text and metadata
documents = [
    Document(page_content="...", metadata={...}),
    Document(page_content="...", metadata={...})
]

# Create FAISS index
vectorstore = FAISS.from_documents(
    documents=documents,
    embedding=embedding_service.embeddings
)

# Save to disk
vectorstore.save_local("data/vectorstores/session-123")
```

**What happens internally**:
1. Extract text from documents
2. Generate embeddings for each document
3. Create FAISS index
4. Add embeddings to index
5. Store documents and metadata
6. Save to disk

### 2. Load Index (Chat Flow)

```python
# Load from disk
vectorstore = FAISS.load_local(
    "data/vectorstores/session-123",
    embedding_service.embeddings,
    allow_dangerous_deserialization=True
)
```

**What happens internally**:
1. Load index.faiss (FAISS index)
2. Load index.pkl (documents + metadata)
3. Initialize embedding service
4. Ready for search

### 3. Search (Chat Flow)

```python
# Similarity search
results = vectorstore.similarity_search(
    query="What are the payment terms?",
    k=4
)

# Returns: List of Document objects
# [
#   Document(page_content="...", metadata={...}),
#   Document(page_content="...", metadata={...}),
#   ...
# ]
```

**What happens internally**:
1. Convert query to embedding
2. FAISS searches for nearest neighbors
3. Retrieve document IDs
4. Fetch corresponding documents
5. Return with metadata

### 4. Search with Scores

```python
# Get similarity scores
results = vectorstore.similarity_search_with_score(
    query="What are the payment terms?",
    k=4
)

# Returns: List of (Document, score) tuples
# [
#   (Document(...), 0.23),  # Lower score = more similar
#   (Document(...), 0.31),
#   ...
# ]
```

## 📈 Performance Characteristics

### Search Speed

| Vectors | IndexFlatL2 | IndexIVFFlat | IndexHNSW |
|---------|-------------|--------------|-----------|
| 1K      | < 1ms       | < 1ms        | < 1ms     |
| 10K     | ~5ms        | ~2ms         | ~1ms      |
| 100K    | ~50ms       | ~5ms         | ~2ms      |
| 1M      | ~500ms      | ~10ms        | ~3ms      |
| 10M     | ~5s         | ~20ms        | ~5ms      |

### Memory Usage

| Vectors | Dimensions | IndexFlatL2 | IndexIVFFlat | IndexHNSW |
|---------|------------|-------------|--------------|-----------|
| 1K      | 384        | ~1.5 MB     | ~1.5 MB      | ~3 MB     |
| 10K     | 384        | ~15 MB      | ~15 MB       | ~30 MB    |
| 100K    | 384        | ~150 MB     | ~150 MB      | ~300 MB   |
| 1M      | 384        | ~1.5 GB     | ~1.5 GB      | ~3 GB     |

### Disk Usage

Similar to memory usage, plus metadata:
- FAISS index: ~4 bytes per dimension per vector
- Metadata: ~1 KB per document (average)

**Example** (1000 documents):
- index.faiss: ~1.5 MB
- index.pkl: ~1 MB
- Total: ~2.5 MB

## 🔧 Optimization Techniques

### 1. Dimension Reduction

Reduce embedding dimensions for faster search:

```python
# Original: 384 dimensions
# Reduced: 128 dimensions (using PCA)

import faiss
pca_matrix = faiss.PCAMatrix(384, 128)
index = faiss.IndexPreTransform(pca_matrix, faiss.IndexFlatL2(128))
```

**Trade-off**: Faster search, slightly lower accuracy

### 2. Quantization

Compress vectors to use less memory:

```python
# Product Quantization
index = faiss.IndexIVFPQ(quantizer, dimension, nlist, M, nbits)
```

**Trade-off**: 4-8x less memory, slightly lower accuracy

### 3. GPU Acceleration

Use GPU for faster search:

```python
# Move index to GPU
gpu_index = faiss.index_cpu_to_gpu(
    faiss.StandardGpuResources(),
    0,  # GPU ID
    index
)
```

**Benefit**: 10-100x faster search

### 4. Batch Search

Search multiple queries at once:

```python
# Single query: 5ms
# 10 queries separately: 50ms
# 10 queries batched: 10ms

queries = [[...], [...], ...]  # Multiple query vectors
distances, indices = index.search(queries, k=5)
```

## 🎯 Best Practices

### 1. Index Selection

```
< 10K vectors     → IndexFlatL2 (exact)
10K - 1M vectors  → IndexIVFFlat (approximate)
> 1M vectors      → IndexHNSW (fast approximate)
Need GPU          → GPU indices
```

### 2. Normalization

Always normalize vectors for cosine similarity:

```python
# Normalize embeddings
import numpy as np
vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
```

### 3. Index Training

For IVF indices, train on representative data:

```python
# Use 10-100x nlist vectors for training
training_vectors = sample_vectors[:10000]
index.train(training_vectors)
```

### 4. Persistence

Always save indices to disk:

```python
# Save
faiss.write_index(index, "index.faiss")

# Load
index = faiss.read_index("index.faiss")
```

## 🆚 FAISS vs Alternatives

### FAISS vs Pinecone

| Feature | FAISS | Pinecone |
|---------|-------|----------|
| **Hosting** | Local | Cloud |
| **Cost** | Free | Paid ($70+/month) |
| **Setup** | Simple | Very simple |
| **Scalability** | Manual | Automatic |
| **Speed** | Very fast | Fast |
| **Best for** | Self-hosted, cost-sensitive | Managed, enterprise |

### FAISS vs Weaviate

| Feature | FAISS | Weaviate |
|---------|-------|----------|
| **Type** | Library | Database |
| **Features** | Search only | Full CRUD + search |
| **Complexity** | Simple | Complex |
| **Scalability** | Manual | Built-in |
| **Best for** | Simple RAG | Complex applications |

### FAISS vs Chroma

| Feature | FAISS | Chroma |
|---------|-------|--------|
| **Maturity** | Very mature | Newer |
| **Performance** | Faster | Good |
| **Features** | Search only | More features |
| **Learning curve** | Steeper | Easier |
| **Best for** | Performance-critical | Quick prototypes |

## 🔍 Debugging FAISS

### Check Index Size

```python
print(f"Total vectors: {index.ntotal}")
```

### Inspect Search Results

```python
distances, indices = index.search(query, k=5)
print(f"Distances: {distances}")
print(f"Indices: {indices}")
```

### Verify Embeddings

```python
# Check embedding dimensions
print(f"Dimension: {index.d}")

# Check if normalized
norms = np.linalg.norm(vectors, axis=1)
print(f"Norms: {norms}")  # Should be ~1.0 if normalized
```

## 📚 Additional Resources

1. **FAISS Documentation**: https://faiss.ai/
2. **FAISS GitHub**: https://github.com/facebookresearch/faiss
3. **FAISS Wiki**: https://github.com/facebookresearch/faiss/wiki
4. **LangChain FAISS**: https://python.langchain.com/docs/integrations/vectorstores/faiss

## 🎓 Key Takeaways

1. **FAISS is fast**: Optimized for similarity search
2. **Multiple index types**: Choose based on dataset size
3. **Local and free**: No cloud costs
4. **Production-ready**: Used by major companies
5. **Easy integration**: Works well with LangChain
6. **Scalable**: Handles millions of vectors

---

**Next**: Read [Deployment](deployment.md) for production deployment guide.
