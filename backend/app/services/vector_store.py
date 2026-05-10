"""
Vector Store Service

Manages FAISS vector database for storing and retrieving embeddings.

What is FAISS?
- Facebook AI Similarity Search
- Efficient similarity search library
- Handles millions of vectors
- Fast nearest neighbor search
- Runs locally (no external database needed)

Why FAISS?
1. Speed: Optimized for fast similarity search
2. Scalability: Handles large datasets
3. Local: No external dependencies
4. Free: Open source
5. Production-ready: Used by major companies

How FAISS Works:
1. Store embeddings with IDs
2. Build index for fast search
3. Query with vector
4. Returns K nearest neighbors
5. Uses cosine similarity or L2 distance

Alternatives:
- Pinecone: Cloud-based, easier but costs money
- Weaviate: More features but complex setup
- Chroma: Simpler but less performant
- FAISS: Best for local, fast, production use
"""

import os
from typing import List, Optional
from langchain.vectorstores import FAISS
from langchain.schema import Document
from loguru import logger
from app.core.config import settings
from app.services.embeddings import embedding_service


class VectorStoreService:
    """
    Vector Store Service
    
    Manages FAISS vector stores for each session.
    """
    
    def __init__(self):
        """Initialize vector store service"""
        self.vectorstores_dir = settings.vectorstores_dir
        logger.info(f"Vector store directory: {self.vectorstores_dir}")
    
    def create_vectorstore(
        self,
        documents: List[Document],
        session_id: str
    ) -> FAISS:
        """
        Create FAISS vector store from documents
        
        Process:
        1. Extract text from documents
        2. Generate embeddings using embedding service
        3. Create FAISS index
        4. Save to disk for persistence
        
        Args:
            documents: List of LangChain Document objects
            session_id: Session identifier
            
        Returns:
            FAISS: Vector store instance
        """
        
        try:
            logger.info(f"Creating vector store for session: {session_id}")
            logger.info(f"Processing {len(documents)} documents")
            
            # Create FAISS vector store from documents
            # This automatically:
            # 1. Extracts text from documents
            # 2. Generates embeddings
            # 3. Builds FAISS index
            vectorstore = FAISS.from_documents(
                documents=documents,
                embedding=embedding_service.embeddings
            )
            
            # Save to disk
            self.save_vectorstore(vectorstore, session_id)
            
            logger.info(f"Vector store created successfully for session: {session_id}")
            return vectorstore
        
        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}")
            raise
    
    def save_vectorstore(self, vectorstore: FAISS, session_id: str):
        """
        Save FAISS vector store to disk
        
        Saves two files:
        - index.faiss: The FAISS index
        - index.pkl: Metadata and documents
        
        Args:
            vectorstore: FAISS vector store
            session_id: Session identifier
        """
        
        try:
            save_path = os.path.join(self.vectorstores_dir, session_id)
            os.makedirs(save_path, exist_ok=True)
            
            vectorstore.save_local(save_path)
            logger.info(f"Vector store saved to: {save_path}")
        
        except Exception as e:
            logger.error(f"Error saving vector store: {str(e)}")
            raise
    
    def load_vectorstore(self, session_id: str) -> Optional[FAISS]:
        """
        Load FAISS vector store from disk
        
        Args:
            session_id: Session identifier
            
        Returns:
            FAISS: Loaded vector store or None if not found
        """
        
        try:
            load_path = os.path.join(self.vectorstores_dir, session_id)
            
            if not os.path.exists(load_path):
                logger.warning(f"Vector store not found for session: {session_id}")
                return None
            
            # Load vector store with embeddings
            # Try new API first (with allow_dangerous_deserialization)
            # Fall back to old API if parameter not supported
            try:
                vectorstore = FAISS.load_local(
                    load_path,
                    embedding_service.embeddings,
                    allow_dangerous_deserialization=True
                )
            except TypeError:
                # Older version doesn't have allow_dangerous_deserialization parameter
                logger.info("Using older FAISS API (no allow_dangerous_deserialization)")
                vectorstore = FAISS.load_local(
                    load_path,
                    embedding_service.embeddings
                )
            
            logger.info(f"Vector store loaded for session: {session_id}")
            return vectorstore
        
        except Exception as e:
            logger.error(f"Error loading vector store: {str(e)}")
            return None
    
    def delete_vectorstore(self, session_id: str):
        """
        Delete vector store for a session
        
        Args:
            session_id: Session identifier
        """
        
        try:
            delete_path = os.path.join(self.vectorstores_dir, session_id)
            
            if os.path.exists(delete_path):
                import shutil
                shutil.rmtree(delete_path)
                logger.info(f"Vector store deleted for session: {session_id}")
        
        except Exception as e:
            logger.error(f"Error deleting vector store: {str(e)}")
    
    def vectorstore_exists(self, session_id: str) -> bool:
        """
        Check if vector store exists for session
        
        Args:
            session_id: Session identifier
            
        Returns:
            bool: True if exists
        """
        
        path = os.path.join(self.vectorstores_dir, session_id)
        return os.path.exists(path)


# Global instance
vector_store_service = VectorStoreService()
