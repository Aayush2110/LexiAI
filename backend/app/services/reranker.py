"""
Reranker Service

Reranks retrieved documents using a cross-encoder model.

What is Reranking?
- Second-stage ranking after initial retrieval
- Uses more sophisticated models than first-stage retrieval
- Scores query-document pairs directly
- More accurate but slower (only used on top-K results)

Why Reranking?
- Initial retrieval (semantic + BM25) casts a wide net
- Reranker refines the results with better accuracy
- Improves precision of top results
- Typical improvement: 10-20% in answer quality

Cross-Encoder vs Bi-Encoder:
- Bi-Encoder: Encodes query and document separately (fast, used for retrieval)
- Cross-Encoder: Encodes query+document together (slow but accurate, used for reranking)

Model: ms-marco-MiniLM-L-6-v2
- Trained on Microsoft MARCO dataset
- Optimized for passage ranking
- Fast inference (~50ms per pair)
- Good balance of speed and accuracy

Reranking Pipeline:
1. Retrieve top-N documents (e.g., N=20) using hybrid search
2. Score each query-document pair with cross-encoder
3. Rerank based on cross-encoder scores
4. Return top-K (e.g., K=4) to LLM
"""

from typing import List, Tuple
from sentence_transformers import CrossEncoder
from langchain_core.documents import Document
from loguru import logger


class RerankerService:
    """
    Reranker Service
    
    Uses cross-encoder to rerank retrieved documents.
    """
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        """
        Initialize reranker service
        
        Args:
            model_name: HuggingFace cross-encoder model name
        """
        self.model_name = model_name
        
        logger.info(f"Loading reranker model: {self.model_name}")
        
        try:
            # Load cross-encoder model
            self.model = CrossEncoder(self.model_name, max_length=512)
            logger.info("Reranker model loaded successfully")
        
        except Exception as e:
            logger.error(f"Error loading reranker model: {str(e)}")
            raise
    
    def rerank(
        self,
        query: str,
        documents: List[Document],
        top_k: int = None
    ) -> List[Tuple[Document, float]]:
        """
        Rerank documents using cross-encoder
        
        Args:
            query: Search query
            documents: List of documents to rerank
            top_k: Number of top documents to return (None = return all)
            
        Returns:
            List[Tuple[Document, float]]: Reranked documents with scores
        """
        try:
            if not documents:
                logger.warning("No documents to rerank")
                return []
            
            logger.info(f"Reranking {len(documents)} documents")
            
            # Prepare query-document pairs
            pairs = [[query, doc.page_content] for doc in documents]
            
            # Get cross-encoder scores
            scores = self.model.predict(pairs)
            
            # Combine documents with scores
            doc_score_pairs = list(zip(documents, scores))
            
            # Sort by score (descending)
            doc_score_pairs.sort(key=lambda x: x[1], reverse=True)
            
            # Return top-K if specified
            if top_k:
                doc_score_pairs = doc_score_pairs[:top_k]
            
            logger.info(f"Reranking completed - returning {len(doc_score_pairs)} documents")
            
            # Log top scores for debugging
            for i, (doc, score) in enumerate(doc_score_pairs[:3], 1):
                logger.debug(f"Reranked Result {i} - Score: {score:.4f}")
            
            return doc_score_pairs
        
        except Exception as e:
            logger.error(f"Error during reranking: {str(e)}")
            raise
    
    def rerank_documents_only(
        self,
        query: str,
        documents: List[Document],
        top_k: int = None
    ) -> List[Document]:
        """
        Rerank and return documents without scores
        
        Args:
            query: Search query
            documents: List of documents to rerank
            top_k: Number of top documents to return
            
        Returns:
            List[Document]: Reranked documents
        """
        reranked = self.rerank(query, documents, top_k)
        return [doc for doc, score in reranked]


# Global instance
reranker_service = RerankerService()
