"""
Chat Route

Handles chat queries against uploaded documents.
"""

from fastapi import APIRouter, HTTPException
from loguru import logger
from app.models.request_models import ChatRequest
from app.models.response_models import ChatResponse
from app.services.rag_pipeline import rag_pipeline

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Chat with uploaded documents
    
    Process:
    1. Validate session exists
    2. Load vector store for session
    3. Retrieve relevant document chunks
    4. Generate answer using LLM
    5. Return answer with source citations
    
    Args:
        request: ChatRequest with session_id and question
        
    Returns:
        ChatResponse: Answer and sources
        
    Raises:
        HTTPException: If session not found or query fails
    """
    
    try:
        logger.info(f"Received chat request for session: {request.session_id}")
        logger.info(f"Question: {request.question}")
        
        # Query RAG pipeline
        result = rag_pipeline.query(
            question=request.question,
            session_id=request.session_id
        )
        
        return ChatResponse(
            answer=result['answer'],
            sources=result['sources'],
            session_id=result['session_id']
        )
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
