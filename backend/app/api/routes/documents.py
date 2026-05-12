"""
Documents Route

Handles document retrieval for sessions.
"""

from fastapi import APIRouter, HTTPException
from loguru import logger
from app.services.database import get_documents_collection

router = APIRouter()


@router.get("/documents/{session_id}", tags=["Documents"])
async def get_documents(session_id: str):
    """
    Get all documents for a session
    
    Args:
        session_id: Session ID to get documents for
        
    Returns:
        List of documents with metadata
    """
    try:
        documents_collection = get_documents_collection()
        cursor = documents_collection.find({"session_id": session_id})
        
        documents = []
        async for doc in cursor:
            documents.append({
                "filename": doc.get("filename"),
                "file_size": doc.get("file_size"),
                "file_type": doc.get("file_type"),
                "uploaded_at": doc.get("uploaded_at").isoformat() if doc.get("uploaded_at") else None
            })
        
        logger.info(f"Found {len(documents)} documents for session {session_id}")
        return {"documents": documents, "total": len(documents)}
    
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")
