"""
Upload Route

Handles file upload and document processing with user-based isolation.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from typing import List, Optional
from loguru import logger
from datetime import datetime
from app.models.request_models import UploadResponse
from app.utils.file_utils import save_upload_file, generate_session_id
from app.services.rag_pipeline import rag_pipeline
from app.services.database import get_documents_collection, get_sessions_collection, get_chats_collection
from app.middleware.auth_middleware import get_current_user

router = APIRouter()


@router.post("/upload", response_model=UploadResponse, tags=["Documents"])
async def upload_documents(
    files: List[UploadFile] = File(..., description="PDF, DOCX, or TXT files"),
    session_id: Optional[str] = Form(None, description="Optional session ID to associate documents with"),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload and process documents for authenticated user
    
    Process:
    1. Verify user owns the session (if provided)
    2. Use provided session ID or generate unique session ID
    3. Validate and save uploaded files
    4. Process through RAG pipeline:
       - Extract text
       - Chunk documents
       - Generate embeddings
       - Create vector store
    5. Return session ID for future queries
    
    Args:
        files: List of uploaded files
        session_id: Optional session ID to use (must be owned by user)
        current_user: Authenticated user from JWT
        
    Returns:
        UploadResponse: Session ID and processing statistics
        
    Raises:
        HTTPException: If upload or processing fails, or access denied
    """
    
    try:
        user_id = str(current_user["_id"])
        logger.info(f"Received upload request with {len(files)} files from user: {user_id}")
        
        # Validate files
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Use provided session ID or generate new one
        if session_id:
            logger.info(f"Using provided session ID: {session_id}")
            
            # Verify user owns this session
            chats_collection = get_chats_collection()
            chat = await chats_collection.find_one({"session_id": session_id})
            
            if not chat:
                raise HTTPException(status_code=404, detail="Chat session not found")
            
            if chat.get("user_id") != user_id:
                raise HTTPException(status_code=403, detail="Access denied: You don't own this chat session")
        else:
            session_id = generate_session_id()
            logger.info(f"Generated new session ID: {session_id}")
            
            # Create chat session for this upload
            chats_collection = get_chats_collection()
            await chats_collection.insert_one({
                "session_id": session_id,
                "user_id": user_id,
                "title": "New Chat",
                "messages": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        
        # Save uploaded files
        file_paths = []
        for file in files:
            logger.info(f"Processing file: {file.filename}")
            file_path = await save_upload_file(file, session_id)
            file_paths.append(file_path)
        
        logger.info(f"Saved {len(file_paths)} files")
        
        # Process documents through RAG pipeline
        result = rag_pipeline.process_documents(file_paths, session_id)
        
        # Save document metadata to MongoDB with user_id
        documents_collection = get_documents_collection()
        for file, file_path in zip(files, file_paths):
            await documents_collection.insert_one({
                "session_id": session_id,
                "user_id": user_id,
                "filename": file.filename,
                "file_path": file_path,
                "file_size": file.size,
                "file_type": file.content_type,
                "uploaded_at": datetime.utcnow()
            })
        
        # Create/update session record
        sessions_collection = get_sessions_collection()
        await sessions_collection.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "user_id": user_id,
                    "updated_at": datetime.utcnow(),
                    "files_count": len(files),
                    "chunks_count": result['chunks_created']
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        logger.info(f"Upload completed for user: {user_id}, session: {session_id}")
        
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
