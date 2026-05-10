"""
Upload Route

Handles file upload and document processing.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from loguru import logger
from app.models.request_models import UploadResponse
from app.utils.file_utils import save_upload_file, generate_session_id
from app.services.rag_pipeline import rag_pipeline

router = APIRouter()


@router.post("/upload", response_model=UploadResponse, tags=["Documents"])
async def upload_documents(
    files: List[UploadFile] = File(..., description="PDF, DOCX, or TXT files")
):
    """
    Upload and process documents
    
    Process:
    1. Generate unique session ID
    2. Validate and save uploaded files
    3. Process through RAG pipeline:
       - Extract text
       - Chunk documents
       - Generate embeddings
       - Create vector store
    4. Return session ID for future queries
    
    Args:
        files: List of uploaded files
        
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
        
        # Generate session ID
        session_id = generate_session_id()
        logger.info(f"Generated session ID: {session_id}")
        
        # Save uploaded files
        file_paths = []
        for file in files:
            logger.info(f"Processing file: {file.filename}")
            file_path = await save_upload_file(file, session_id)
            file_paths.append(file_path)
        
        logger.info(f"Saved {len(file_paths)} files")
        
        # Process documents through RAG pipeline
        result = rag_pipeline.process_documents(file_paths, session_id)
        
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
