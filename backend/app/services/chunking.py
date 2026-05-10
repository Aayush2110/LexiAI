"""
Text Chunking Service

Splits large documents into smaller chunks for better retrieval.

Why Chunking?
1. LLMs have token limits - can't process entire documents
2. Smaller chunks = more precise retrieval
3. Better semantic matching with user queries
4. Reduces noise in context

Why Overlap?
- Maintains context across chunk boundaries
- Prevents information loss at split points
- Example: If a sentence is split, overlap ensures it appears complete in one chunk

Chunk Size Selection:
- Too small: Loss of context, fragmented information
- Too large: Less precise retrieval, more noise
- Sweet spot: 500-1500 characters for most documents
- Legal documents: 1000-1500 (longer sentences and clauses)
"""

from typing import List, Dict
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from loguru import logger
from app.core.config import settings


class ChunkingService:
    """
    Text Chunking Service
    
    Uses LangChain's RecursiveCharacterTextSplitter for intelligent splitting.
    """
    
    def __init__(
        self,
        chunk_size: int = None,
        chunk_overlap: int = None
    ):
        """
        Initialize chunking service
        
        Args:
            chunk_size: Size of each chunk (default from config)
            chunk_overlap: Overlap between chunks (default from config)
        """
        
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
        
        # RecursiveCharacterTextSplitter tries to split on:
        # 1. Double newlines (paragraphs)
        # 2. Single newlines
        # 3. Spaces
        # 4. Characters (last resort)
        # This preserves semantic structure better than simple character splitting
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        logger.info(f"Chunking service initialized - Size: {self.chunk_size}, Overlap: {self.chunk_overlap}")
    
    def chunk_documents(self, documents: List[Document]) -> List[Document]:
        """
        Split documents into chunks
        
        Args:
            documents: List of LangChain Document objects
            
        Returns:
            List[Document]: LangChain Document objects with chunks
        """
        
        all_chunks = []
        
        for doc in documents:
            try:
                # Split into chunks
                chunks = self.text_splitter.split_documents([doc])
                
                # Add chunk index to metadata
                for i, chunk in enumerate(chunks):
                    chunk.metadata['chunk_index'] = i
                    chunk.metadata['total_chunks'] = len(chunks)
                
                all_chunks.extend(chunks)
                
                logger.info(f"Created {len(chunks)} chunks from {doc.metadata.get('source', 'unknown')}")
            
            except Exception as e:
                logger.error(f"Error chunking document: {str(e)}")
                continue
        
        logger.info(f"Total chunks created: {len(all_chunks)}")
        return all_chunks
    
    def get_chunk_stats(self, chunks: List[Document]) -> Dict[str, any]:
        """
        Get statistics about chunks
        
        Args:
            chunks: List of Document chunks
            
        Returns:
            Dict: Statistics about chunks
        """
        
        if not chunks:
            return {
                'total_chunks': 0,
                'avg_chunk_size': 0,
                'min_chunk_size': 0,
                'max_chunk_size': 0
            }
        
        chunk_sizes = [len(chunk.page_content) for chunk in chunks]
        
        return {
            'total_chunks': len(chunks),
            'avg_chunk_size': sum(chunk_sizes) // len(chunk_sizes),
            'min_chunk_size': min(chunk_sizes),
            'max_chunk_size': max(chunk_sizes)
        }


# Global instance
chunking_service = ChunkingService()
