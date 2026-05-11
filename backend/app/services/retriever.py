"""
Retriever Service

Handles similarity search and context retrieval from vector store.

What is Retrieval?
- Finding relevant information from stored documents
- Based on semantic similarity
- Returns top-K most relevant chunks

How Similarity Search Works:
1. User asks a question
2. Question is converted to embedding
3. Compare with all stored embeddings
4. Find K nearest neighbors (most similar)
5. Return corresponding text chunks

Similarity Metrics:
- Cosine Similarity: Measures angle between vectors (0-1)
- L2 Distance: Euclidean distance between vectors
- Dot Product: Direct vector multiplication

Top-K Selection:
- K=1: Only most relevant chunk (might miss context)
- K=3-5: Good balance (recommended)
- K=10+: More context but more noise
- Legal docs: K=4-5 (longer, detailed answers needed)

Retrieval Strategies:
1. Similarity Search: Basic, fast
2. MMR (Maximal Marginal Relevance): Diverse results
3. Similarity Score Threshold: Only above certain score
"""

from typing import List, Tuple
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from loguru import logger
from app.core.config import settings


class RetrieverService:
    """
    Retriever Service
    
    Performs similarity search on vector stores.
    """
    
    def __init__(self, top_k: int = None):
        """
        Initialize retriever service
        
        Args:
            top_k: Number of documents to retrieve (default from config)
        """
        
        self.top_k = top_k or settings.TOP_K_RETRIEVAL
        logger.info(f"Retriever service initialized - Top K: {self.top_k}")
    
    def retrieve(
        self,
        vectorstore: Chroma,
        query: str,
        top_k: int = None
    ) -> List[Document]:
        """
        Retrieve relevant documents for a query
        
        Args:
            vectorstore: FAISS vector store
            query: User's question
            top_k: Number of documents to retrieve (optional override)
            
        Returns:
            List[Document]: Most relevant documents
        """
        
        k = top_k or self.top_k
        
        try:
            logger.info(f"Retrieving top {k} documents for query: {query[:100]}...")
            
            # Similarity search
            # This:
            # 1. Converts query to embedding
            # 2. Compares with all stored embeddings
            # 3. Returns K most similar documents
            documents = vectorstore.similarity_search(
                query=query,
                k=k
            )
            
            logger.info(f"Retrieved {len(documents)} documents")
            return documents
        
        except Exception as e:
            logger.error(f"Error during retrieval: {str(e)}")
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
