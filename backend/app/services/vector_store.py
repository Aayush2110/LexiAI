"""
Vector Store Service

Manages ChromaDB vector database for storing and retrieving embeddings.
"""

import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Optional
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from loguru import logger
from app.core.config import settings
from app.services.embeddings import embedding_service


class VectorStoreService:
    """
    Vector Store Service
    
    Manages ChromaDB vector stores for each session.
    """
    
    def __init__(self):
        """Initialize vector store service"""
        self.persist_dir = settings.chromadb_dir
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        logger.info(f"ChromaDB initialized at: {self.persist_dir}")
    
    def create_vectorstore(
        self,
        documents: List[Document],
        session_id: str
    ) -> Chroma:
        """
        Create ChromaDB vector store from documents
        
        Args:
            documents: List of LangChain Document objects
            session_id: Session identifier
            
        Returns:
            Chroma: Vector store instance
        """
        
        try:
            logger.info(f"Creating vector store for session: {session_id}")
            logger.info(f"Processing {len(documents)} documents")
            
            vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=embedding_service.embeddings,
                collection_name=session_id,
                client=self.client,
                persist_directory=self.persist_dir
            )
            
            logger.info(f"Vector store created for session: {session_id}")
            return vectorstore
        
        except Exception as e:
            logger.error(f"Error creating vector store: {str(e)}")
            raise
    
    def load_vectorstore(self, session_id: str) -> Optional[Chroma]:
        """
        Load ChromaDB vector store
        
        Args:
            session_id: Session identifier
            
        Returns:
            Chroma: Loaded vector store or None if not found
        """
        
        try:
            collections = [c.name for c in self.client.list_collections()]
            
            if session_id not in collections:
                logger.warning(f"Vector store not found for session: {session_id}")
                return None
            
            vectorstore = Chroma(
                collection_name=session_id,
                embedding_function=embedding_service.embeddings,
                client=self.client,
                persist_directory=self.persist_dir
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
            self.client.delete_collection(name=session_id)
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
        
        collections = [c.name for c in self.client.list_collections()]
        return session_id in collections


# Global instance
vector_store_service = VectorStoreService()
