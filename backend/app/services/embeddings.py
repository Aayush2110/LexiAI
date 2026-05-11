"""
Embeddings Service

Converts text into vector embeddings for semantic search.

What are Embeddings?
- Numerical representations of text (vectors)
- Capture semantic meaning
- Similar texts have similar vectors
- Enable similarity search

Why Sentence Transformers?
- Optimized for semantic similarity
- Fast inference
- No API calls needed (runs locally)
- Good balance of speed and accuracy

Model: all-MiniLM-L6-v2
- 384 dimensions
- Fast and lightweight
- Good for general purpose
- Trained on 1B+ sentence pairs

Alternatives:
- all-mpnet-base-v2: More accurate but slower
- all-MiniLM-L12-v2: Balanced option
- For production: Consider domain-specific models
"""

from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from loguru import logger
from app.core.config import settings


class EmbeddingService:
    """
    Embedding Service
    
    Generates vector embeddings using Sentence Transformers.
    """
    
    def __init__(self, model_name: str = None):
        """
        Initialize embedding service
        
        Args:
            model_name: HuggingFace model name (default from config)
        """
        
        self.model_name = model_name or settings.EMBEDDING_MODEL
        
        logger.info(f"Loading embedding model: {self.model_name}")
        
        # Initialize HuggingFace embeddings
        # This downloads the model on first run (cached afterwards)
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.model_name,
            model_kwargs={'device': 'cpu'},  # Use 'cuda' for GPU
            encode_kwargs={'normalize_embeddings': True}  # Normalize for cosine similarity
        )
        
        logger.info("Embedding model loaded successfully")
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple documents
        
        Args:
            texts: List of text strings
            
        Returns:
            List[List[float]]: List of embedding vectors
        """
        
        try:
            logger.info(f"Generating embeddings for {len(texts)} documents")
            embeddings = self.embeddings.embed_documents(texts)
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings
        
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise
    
    def embed_query(self, text: str) -> List[float]:
        """
        Generate embedding for a single query
        
        Args:
            text: Query text
            
        Returns:
            List[float]: Embedding vector
        """
        
        try:
            embedding = self.embeddings.embed_query(text)
            return embedding
        
        except Exception as e:
            logger.error(f"Error generating query embedding: {str(e)}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings
        
        Returns:
            int: Embedding dimension
        """
        
        # Generate a test embedding to get dimension
        test_embedding = self.embed_query("test")
        return len(test_embedding)


# Global instance
embedding_service = EmbeddingService()
