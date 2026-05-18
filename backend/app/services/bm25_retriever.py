"""
BM25 Retriever Service

Implements keyword-based retrieval using BM25 algorithm.

What is BM25?
- Best Match 25 - a ranking function for keyword search
- Based on term frequency and document frequency
- Complements semantic search by catching exact keyword matches
- Works well for technical terms, names, dates, numbers

Why Hybrid Search (Semantic + BM25)?
- Semantic: Understands meaning and context
- BM25: Catches exact terms and rare keywords
- Together: Best of both worlds
- Example: "Section 5.2" - BM25 catches exact match, semantic finds related content

How BM25 Works:
1. Tokenizes documents and queries
2. Calculates term frequency (TF)
3. Calculates inverse document frequency (IDF)
4. Scores documents based on query terms
5. Returns top-K documents

BM25 Parameters:
- k1 (1.5): Term frequency saturation (higher = more weight on term frequency)
- b (0.75): Length normalization (higher = more penalty for long documents)
"""

from typing import List, Tuple
from rank_bm25 import BM25Okapi
from langchain_core.documents import Document
from loguru import logger
import numpy as np


class BM25Retriever:
    """
    BM25 Keyword-based Retriever
    
    Provides sparse retrieval to complement dense semantic search.
    """
    
    def __init__(self):
        """Initialize BM25 retriever"""
        self.bm25 = None
        self.documents = []
        self.tokenized_corpus = []
        logger.info("BM25 Retriever initialized")
    
    def index_documents(self, documents: List[Document]):
        """
        Index documents for BM25 search
        
        Args:
            documents: List of LangChain Document objects
        """
        try:
            logger.info(f"Indexing {len(documents)} documents for BM25")
            
            self.documents = documents
            
            # Tokenize documents (simple whitespace tokenization)
            # For production, consider using nltk or spacy for better tokenization
            self.tokenized_corpus = [
                doc.page_content.lower().split() 
                for doc in documents
            ]
            
            # Create BM25 index
            self.bm25 = BM25Okapi(self.tokenized_corpus)
            
            logger.info("BM25 indexing completed")
        
        except Exception as e:
            logger.error(f"Error indexing documents for BM25: {str(e)}")
            raise
    
    def retrieve(
        self,
        query: str,
        top_k: int = 10
    ) -> List[Tuple[Document, float]]:
        """
        Retrieve documents using BM25
        
        Args:
            query: Search query
            top_k: Number of documents to retrieve
            
        Returns:
            List[Tuple[Document, float]]: Documents with BM25 scores
        """
        try:
            if not self.bm25:
                logger.warning("BM25 not indexed. Call index_documents first.")
                return []
            
            logger.info(f"BM25 retrieval for query: {query[:100]}...")
            
            # Tokenize query
            tokenized_query = query.lower().split()
            
            # Get BM25 scores for all documents
            scores = self.bm25.get_scores(tokenized_query)
            
            # Get top-K indices
            top_indices = np.argsort(scores)[::-1][:top_k]
            
            # Return documents with scores
            results = [
                (self.documents[idx], float(scores[idx]))
                for idx in top_indices
                if scores[idx] > 0  # Only return documents with non-zero scores
            ]
            
            logger.info(f"BM25 retrieved {len(results)} documents")
            
            # Log top scores for debugging
            for i, (doc, score) in enumerate(results[:3], 1):
                logger.debug(f"BM25 Result {i} - Score: {score:.4f}")
            
            return results
        
        except Exception as e:
            logger.error(f"Error during BM25 retrieval: {str(e)}")
            raise
    
    def get_top_k_documents(
        self,
        query: str,
        top_k: int = 10
    ) -> List[Document]:
        """
        Retrieve top-K documents without scores
        
        Args:
            query: Search query
            top_k: Number of documents to retrieve
            
        Returns:
            List[Document]: Top-K documents
        """
        results = self.retrieve(query, top_k)
        return [doc for doc, score in results]


# Global instance
bm25_retriever = BM25Retriever()
