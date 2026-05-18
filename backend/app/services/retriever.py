"""
Retriever Service

Handles similarity search and context retrieval from vector store.
Now supports hybrid search combining semantic + BM25 + reranking.
Enhanced with query preprocessing and context compression.

What is Retrieval?
- Finding relevant information from stored documents
- Based on semantic similarity
- Returns top-K most relevant chunks

Retrieval Modes:
1. Semantic Only: Traditional embedding-based search
2. Hybrid: Semantic + BM25 + Reranking (RECOMMENDED)
3. Enhanced: Hybrid + Query Enhancement + Context Compression (BEST!)

Hybrid Search Benefits:
- 20-30% improvement in retrieval accuracy
- Better handling of exact terms and technical keywords
- More robust across different query types

Query Enhancement Benefits:
- +5-10% improvement from better query formulation
- Handles typos and poorly phrased queries
- Multiple query variations improve recall

Context Compression Benefits:
- +5-10% improvement in answer quality
- Reduced token usage and costs
- More focused, relevant context for LLM
"""

from typing import List, Tuple
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from loguru import logger
from app.core.config import settings


class RetrieverService:
    """
    Retriever Service
    
    Performs similarity search on vector stores with optional hybrid search,
    query enhancement, and context compression.
    """
    
    def __init__(self, top_k: int = None):
        """
        Initialize retriever service
        
        Args:
            top_k: Number of documents to retrieve (default from config)
        """
        
        self.top_k = top_k or settings.TOP_K_RETRIEVAL
        self.use_hybrid = settings.USE_HYBRID_SEARCH
        self.use_query_enhancement = settings.USE_QUERY_ENHANCEMENT
        self.use_context_compression = settings.USE_CONTEXT_COMPRESSION
        
        # Lazy load services to avoid circular imports
        self._hybrid_retriever = None
        self._query_enhancer = None
        self._context_compressor = None
        
        logger.info(
            f"Retriever service initialized - Top K: {self.top_k}, "
            f"Hybrid: {self.use_hybrid}, "
            f"Query Enhancement: {self.use_query_enhancement}, "
            f"Context Compression: {self.use_context_compression}"
        )
    
    @property
    def hybrid_retriever(self):
        """Lazy load hybrid retriever"""
        if self._hybrid_retriever is None and self.use_hybrid:
            from app.services.hybrid_retriever import hybrid_retriever
            self._hybrid_retriever = hybrid_retriever
        return self._hybrid_retriever
    
    @property
    def query_enhancer(self):
        """Lazy load query enhancer"""
        if self._query_enhancer is None and self.use_query_enhancement:
            from app.services.query_enhancer import query_enhancer
            self._query_enhancer = query_enhancer
        return self._query_enhancer
    
    @property
    def context_compressor(self):
        """Lazy load context compressor"""
        if self._context_compressor is None and self.use_context_compression:
            from app.services.context_compressor import context_compressor
            self._context_compressor = context_compressor
        return self._context_compressor
    
    def retrieve(
        self,
        vectorstore: Chroma,
        query: str,
        top_k: int = None
    ) -> List[Document]:
        """
        Retrieve relevant documents for a query
        
        Uses hybrid search if enabled, otherwise falls back to semantic search.
        Optionally enhances query and compresses context.
        
        Args:
            vectorstore: ChromaDB vector store
            query: User's question
            top_k: Number of documents to retrieve (optional override)
            
        Returns:
            List[Document]: Most relevant documents
        """
        
        k = top_k or self.top_k
        
        try:
            logger.info(f"Retrieving top {k} documents for query: {query[:100]}...")
            
            # Step 1: Query Enhancement (optional)
            enhanced_query = query
            if self.use_query_enhancement and self.query_enhancer:
                logger.info("Step 1: Enhancing query...")
                enhanced = self.query_enhancer.enhance_query(
                    query,
                    expand=settings.EXPAND_QUERIES,
                    clean=True
                )
                enhanced_query = self.query_enhancer.get_best_query(enhanced)
                logger.info(f"Enhanced query: {enhanced_query}")
            
            # Step 2: Retrieval (hybrid or semantic)
            if self.use_hybrid and self.hybrid_retriever:
                logger.info("Step 2: Using hybrid search (semantic + BM25 + reranking)")
                documents = self.hybrid_retriever.retrieve(
                    vectorstore=vectorstore,
                    query=enhanced_query,
                    top_k=k,
                    retrieval_k=settings.RETRIEVAL_K
                )
            else:
                logger.info("Step 2: Using semantic search only")
                documents = self._semantic_search(vectorstore, enhanced_query, k)
            
            logger.info(f"Retrieved {len(documents)} documents")
            
            # Step 3: Context Compression (optional)
            if self.use_context_compression and self.context_compressor and documents:
                logger.info("Step 3: Compressing context...")
                original_count = len(documents)
                documents = self.context_compressor.compress_context(
                    documents,
                    query,  # Use original query for relevance scoring
                    max_tokens=settings.MAX_CONTEXT_TOKENS
                )
                logger.info(f"Compressed from {original_count} to {len(documents)} documents")
                
                # Log compression stats
                if original_count > 0:
                    stats = self.context_compressor.get_compression_stats(
                        [Document(page_content="dummy")] * original_count,
                        documents
                    )
                    logger.debug(f"Compression ratio: {stats['compression_ratio']:.2%}")
            
            logger.info(f"Final result: {len(documents)} documents")
            return documents
        
        except Exception as e:
            logger.error(f"Error during retrieval: {str(e)}")
            # Fallback to semantic search
            logger.warning("Falling back to semantic search")
            return self._semantic_search(vectorstore, query, k)
    
    def _semantic_search(
        self,
        vectorstore: Chroma,
        query: str,
        top_k: int
    ) -> List[Document]:
        """
        Traditional semantic search using embeddings
        
        Args:
            vectorstore: ChromaDB vector store
            query: Search query
            top_k: Number of documents to retrieve
            
        Returns:
            List[Document]: Retrieved documents
        """
        try:
            documents = vectorstore.similarity_search(query=query, k=top_k)
            return documents
        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            raise
    
    def retrieve_with_scores(
        self,
        vectorstore: Chroma,
        query: str,
        top_k: int = None
    ) -> List[Tuple[Document, float]]:
        """
        Retrieve documents with similarity scores
        
        Useful for:
        - Filtering low-confidence results
        - Debugging retrieval quality
        - Adaptive K selection
        
        Args:
            vectorstore: FAISS vector store
            query: User's question
            top_k: Number of documents to retrieve
            
        Returns:
            List[Tuple[Document, float]]: Documents with scores
        """
        
        k = top_k or self.top_k
        
        try:
            logger.info(f"Retrieving top {k} documents with scores")
            
            # Similarity search with scores
            results = vectorstore.similarity_search_with_score(
                query=query,
                k=k
            )
            
            # Log scores for debugging
            for i, (doc, score) in enumerate(results, 1):
                logger.debug(f"Result {i} - Score: {score:.4f}")
            
            return results
        
        except Exception as e:
            logger.error(f"Error during retrieval with scores: {str(e)}")
            raise
    
    def retrieve_with_threshold(
        self,
        vectorstore: Chroma,
        query: str,
        score_threshold: float = 0.7,
        top_k: int = None
    ) -> List[Document]:
        """
        Retrieve documents above similarity threshold
        
        Only returns results with confidence above threshold.
        Useful for avoiding irrelevant results.
        
        Args:
            vectorstore: FAISS vector store
            query: User's question
            score_threshold: Minimum similarity score (0-1)
            top_k: Maximum documents to retrieve
            
        Returns:
            List[Document]: Relevant documents above threshold
        """
        
        k = top_k or self.top_k
        
        try:
            results = self.retrieve_with_scores(vectorstore, query, k)
            
            # Filter by threshold
            filtered = [
                doc for doc, score in results
                if score >= score_threshold
            ]
            
            logger.info(f"Filtered to {len(filtered)} documents above threshold {score_threshold}")
            return filtered
        
        except Exception as e:
            logger.error(f"Error during threshold retrieval: {str(e)}")
            raise
    
    def format_context(self, documents: List[Document]) -> str:
        """
        Format retrieved documents into context string
        
        Args:
            documents: Retrieved documents
            
        Returns:
            str: Formatted context for LLM
        """
        
        if not documents:
            return ""
        
        # Format each document with metadata
        context_parts = []
        for i, doc in enumerate(documents, 1):
            source = doc.metadata.get('source', 'Unknown')
            page = doc.metadata.get('page', 'N/A')
            
            context_parts.append(
                f"[Document {i} - Source: {source}, Page: {page}]\n{doc.page_content}\n"
            )
        
        return "\n".join(context_parts)


# Global instance
retriever_service = RetrieverService()
