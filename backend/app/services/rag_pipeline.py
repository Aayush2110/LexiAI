"""
RAG Pipeline Service

Orchestrates the complete RAG (Retrieval Augmented Generation) pipeline.

RAG Pipeline Flow:
1. Document Upload → Load documents
2. Text Extraction → Parse PDFs/DOCX/TXT
3. Chunking → Split into manageable pieces
4. Embedding → Convert to vectors
5. Vector Store → Save to FAISS
6. User Query → Receive question
7. Retrieval → Find relevant chunks
8. Context Formation → Format retrieved chunks
9. LLM Generation → Generate answer
10. Response → Return to user

Why RAG?
- LLMs have knowledge cutoff dates
- Can't access private/custom documents
- May hallucinate without grounding
- RAG provides factual grounding from your documents

RAG vs Fine-tuning:
- Fine-tuning: Expensive, slow, requires retraining
- RAG: Fast, flexible, works with any documents
- RAG: Better for frequently changing information
- Fine-tuning: Better for style/tone adaptation

RAG Benefits:
1. Accuracy: Answers from actual documents
2. Transparency: Can show sources
3. Flexibility: Add/remove documents anytime
4. Cost-effective: No model retraining needed
5. Privacy: Documents stay local
"""

from typing import List, Dict, Tuple
from loguru import logger
from app.core.config import settings
from app.services.document_loader import document_loader
from app.services.chunking import chunking_service
from app.services.vector_store import vector_store_service
from app.services.retriever import retriever_service
from app.services.llm_service import llm_service
from app.services.session_metadata import session_metadata
from app.utils.helpers import format_sources


class RAGPipeline:
    """
    RAG Pipeline Orchestrator
    
    Coordinates all RAG components for end-to-end processing.
    """
    
    def __init__(self):
        """Initialize RAG pipeline"""
        logger.info("RAG Pipeline initialized")
    
    def process_documents(
        self,
        file_paths: List[str],
        session_id: str
    ) -> Dict[str, any]:
        """
        Process uploaded documents through RAG pipeline
        
        Steps:
        1. Load documents from files
        2. Chunk documents into smaller pieces
        3. Create embeddings and vector store
        4. Save for later retrieval
        
        Args:
            file_paths: List of uploaded file paths
            session_id: Session identifier
            
        Returns:
            Dict: Processing results with statistics
        """
        
        try:
            logger.info(f"Starting document processing for session: {session_id}")
            logger.info(f"Files to process: {len(file_paths)}")
            
            # Step 1: Load documents
            logger.info("Step 1: Loading documents...")
            documents = document_loader.load_documents(file_paths)
            
            if not documents:
                raise ValueError("No documents loaded. Check file formats and content.")
            
            logger.info(f"Loaded {len(documents)} document sections")
            
            # Step 2: Chunk documents
            logger.info("Step 2: Chunking documents...")
            chunks = chunking_service.chunk_documents(documents)
            
            if not chunks:
                raise ValueError("No chunks created. Documents may be empty.")
            
            chunk_stats = chunking_service.get_chunk_stats(chunks)
            logger.info(f"Created {len(chunks)} chunks")
            logger.info(f"Chunk stats: {chunk_stats}")
            
            # Step 3: Create vector store
            logger.info("Step 3: Creating vector store...")
            vectorstore = vector_store_service.create_vectorstore(chunks, session_id)
            
            # Step 4: Index for BM25 (if hybrid search enabled)
            if settings.USE_HYBRID_SEARCH:
                logger.info("Step 4: Indexing for BM25...")
                from app.services.hybrid_retriever import hybrid_retriever
                hybrid_retriever.index_documents_for_bm25(chunks)
                logger.info("BM25 indexing completed")
            
            # Calculate total pages from documents
            total_pages = sum(doc.metadata.get('total_pages', 1) for doc in documents)
            
            # Store session metadata
            metadata = {
                'total_pages': total_pages,
                'total_chunks': len(chunks),
                'files_processed': len(file_paths),
                'documents_loaded': len(documents)
            }
            session_metadata.save_metadata(session_id, metadata)
            
            logger.info("Document processing completed successfully")
            
            return {
                'success': True,
                'session_id': session_id,
                'files_processed': len(file_paths),
                'documents_loaded': len(documents),
                'chunks_created': len(chunks),
                'chunk_stats': chunk_stats
            }
        
        except Exception as e:
            logger.error(f"Error processing documents: {str(e)}")
            raise
    
    def query(
        self,
        question: str,
        session_id: str
    ) -> Dict[str, any]:
        """
        Query the RAG system
        
        Steps:
        1. Load vector store for session
        2. Retrieve relevant chunks
        3. Format context
        4. Generate answer using LLM
        5. Return answer with sources
        
        Args:
            question: User's question
            session_id: Session identifier
            
        Returns:
            Dict: Answer and sources
        """
        
        try:
            logger.info(f"Processing query for session: {session_id}")
            logger.info(f"Question: {question}")
            
            # Step 1: Load vector store
            logger.info("Step 1: Loading vector store...")
            vectorstore = vector_store_service.load_vectorstore(session_id)
            
            if not vectorstore:
                return {
                    'answer': "No documents found for this session. Please upload documents first.",
                    'sources': [],
                    'session_id': session_id,
                    'total_pages': 0,
                    'total_chunks': 0
                }
            
            # Get total chunks count from vectorstore
            total_chunks = vectorstore._collection.count() if hasattr(vectorstore, '_collection') else 0
            
            # Step 2: Retrieve relevant documents
            logger.info("Step 2: Retrieving relevant documents...")
            retrieved_docs = retriever_service.retrieve(vectorstore, question)
            
            if not retrieved_docs:
                return {
                    'answer': "Answer not available in uploaded documents.",
                    'sources': [],
                    'session_id': session_id,
                    'total_pages': 0,
                    'total_chunks': total_chunks
                }
            
            logger.info(f"Retrieved {len(retrieved_docs)} relevant documents")
            
            # Get total pages from metadata
            total_pages = 0
            if retrieved_docs:
                # Get unique pages from all documents
                pages_set = set()
                for doc in retrieved_docs:
                    if 'page' in doc.metadata:
                        pages_set.add(doc.metadata['page'])
                    if 'total_pages' in doc.metadata:
                        total_pages = max(total_pages, doc.metadata['total_pages'])
            
            # Step 3: Format context
            logger.info("Step 3: Formatting context...")
            context = retriever_service.format_context(retrieved_docs)
            
            # Step 4: Generate answer
            logger.info("Step 4: Generating answer...")
            answer = llm_service.generate_answer(question, context)
            
            # Step 5: Format sources
            sources = format_sources(retrieved_docs)
            
            logger.info("Query processed successfully")
            
            return {
                'answer': answer,
                'sources': sources,
                'session_id': session_id,
                'total_pages': total_pages,
                'total_chunks': total_chunks
            }
        
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            raise
    
    def get_session_info(self, session_id: str) -> Dict[str, any]:
        """
        Get information about a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            Dict: Session information
        """
        
        vectorstore_exists = vector_store_service.vectorstore_exists(session_id)
        
        return {
            'session_id': session_id,
            'vectorstore_exists': vectorstore_exists,
            'status': 'active' if vectorstore_exists else 'inactive'
        }
    
    def delete_session(self, session_id: str):
        """
        Delete all data for a session
        
        Args:
            session_id: Session identifier
        """
        
        try:
            logger.info(f"Deleting session: {session_id}")
            
            # Delete vector store
            vector_store_service.delete_vectorstore(session_id)
            
            # Delete uploaded files
            from app.utils.file_utils import cleanup_session_files
            cleanup_session_files(session_id)
            
            logger.info(f"Session deleted: {session_id}")
        
        except Exception as e:
            logger.error(f"Error deleting session: {str(e)}")
            raise


# Global instance
rag_pipeline = RAGPipeline()
