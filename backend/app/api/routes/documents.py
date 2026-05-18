"""
Documents Route

Handles document retrieval for sessions with user-based isolation.
"""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
from app.services.database import get_documents_collection, get_chats_collection
from app.middleware.auth_middleware import get_current_user

router = APIRouter()


@router.get("/documents/{session_id}", tags=["Documents"])
async def get_documents(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all documents for a session (only if user owns it)
    
    Args:
        session_id: Session ID to get documents for
        current_user: Authenticated user from JWT
        
    Returns:
        List of documents with metadata
    """
    try:
        user_id = str(current_user["_id"])
        
        # Verify user owns this session
        chats_collection = get_chats_collection()
        chat = await chats_collection.find_one({"session_id": session_id})
        
        if not chat:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        if chat.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied: You don't own this chat session")
        
        # Get documents for this session
        documents_collection = get_documents_collection()
        cursor = documents_collection.find({"session_id": session_id, "user_id": user_id})
        
        documents = []
        async for doc in cursor:
            documents.append({
                "filename": doc.get("filename"),
                "file_size": doc.get("file_size"),
                "file_type": doc.get("file_type"),
                "uploaded_at": doc.get("uploaded_at").isoformat() if doc.get("uploaded_at") else None
            })
        
        logger.info(f"Found {len(documents)} documents for session {session_id}, user: {user_id}")
        return {"documents": documents, "total": len(documents)}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")
