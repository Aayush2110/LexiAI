"""
Upload Route

Handles file upload and document processing.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional
from loguru import logger
from datetime import datetime
from app.models.request_models import UploadResponse
from app.utils.file_utils import save_upload_file, generate_session_id
from app.services.rag_pipeline import rag_pipeline
from app.services.database import get_documents_collection, get_sessions_collection

router = APIRouter()


@router.post("/upload", response_model=UploadResponse, tags=["Documents"])
async def upload_documents(
    files: List[UploadFile] = File(..., description="PDF, DOCX, or TXT files"),
    session_id: Optional[str] = Form(None, description="Optional session ID to associate documents with")
):
    """
    Upload and process documents
    
    Process:
    1. Use provided session ID or generate unique session ID
    2. Validate and save uploaded files
    3. Process through RAG pipeline:
       - Extract text
       - Chunk documents
       - Generate embeddings
       - Create vector store
    4. Return session ID for future queries
    
    Args:
        files: List of uploaded files
        session_id: Optional session ID to use (if not provided, generates new one)
        
    Returns:
        UploadResponse: Session ID and processing statistics
        
    Raises:
        HTTPException: If upload or processing fails
    """
    
    try:
        logger.info(f"Received upload request with {len(files)} files")
        
        # Validate files
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Use provided session ID or generate new one
        if session_id:
            logger.info(f"Using provided session ID: {session_id}")
        else:
            session_id = generate_session_id()
            logger.info(f"Generated new session ID: {session_id}")
        
        # Save uploaded files
        file_paths = []
        for file in files:
            logger.info(f"Processing file: {file.filename}")
            file_path = await save_upload_file(file, session_id)
            file_paths.append(file_path)
        
        logger.info(f"Saved {len(file_paths)} files")
        
        # Process documents through RAG pipeline
        result = rag_pipeline.process_documents(file_paths, session_id)
        
        # Save document metadata to MongoDB
        documents_collection = get_documents_collection()
        for file, file_path in zip(files, file_paths):
            await documents_collection.insert_one({
                "session_id": session_id,
                "filename": file.filename,
                "file_path": file_path,
                "file_size": file.size,
                "file_type": file.content_type,
                "uploaded_at": datetime.utcnow()
            })
        
        # Create session record
        sessions_collection = get_sessions_collection()
        await sessions_collection.insert_one({
            "session_id": session_id,
            "created_at": datetime.utcnow(),
            "files_count": len(files),
            "chunks_count": result['chunks_created']
        })
        
        return UploadResponse(
            session_id=session_id,
            message="Files uploaded and processed successfully",
            files_processed=result['files_processed'],
            chunks_created=result['chunks_created']
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        logger.error(f"Error in upload endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
