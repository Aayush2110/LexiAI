"""
API Dependencies

Shared dependencies and utilities for API routes.
"""

from fastapi import HTTPException
from loguru import logger


async def verify_session(session_id: str):
    """
    Verify that a session exists
    
    Args:
        session_id: Session identifier
        
    Raises:
        HTTPException: If session not found
    """
    
    from app.services.vector_store import vector_store_service
    
    if not vector_store_service.vectorstore_exists(session_id):
        logger.warning(f"Session not found: {session_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Session not found: {session_id}. Please upload documents first."
        )
