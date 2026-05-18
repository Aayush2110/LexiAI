"""
Chat Route

Handles chat queries against uploaded documents with user-based isolation.
"""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
from datetime import datetime
import uuid
import re
from app.models.request_models import ChatRequest, CreateChatRequest, UpdateChatTitleRequest
from app.models.response_models import ChatResponse, ChatListResponse, ChatListItem, CreateChatResponse
from app.services.rag_pipeline import rag_pipeline
from app.services.database import get_chats_collection
from app.models.db_models import ChatMessageModel
from app.middleware.auth_middleware import get_current_user

router = APIRouter()


def generate_title_from_message(message: str, max_length: int = 30) -> str:
    """
    Generate a concise title from the first user message
    
    Args:
        message: User's first message
        max_length: Maximum title length
        
    Returns:
        Generated title
    """
    # Remove common question words
    title = re.sub(r'^(what|how|why|when|where|who|can you|please|could you|explain|tell me about)\s+', '', message.lower(), flags=re.IGNORECASE)
    
    # Remove question marks and extra spaces
    title = title.replace('?', '').strip()
    
    # Capitalize first letter
    title = title[0].upper() + title[1:] if title else "New Chat"
    
    # Truncate to max length
    if len(title) > max_length:
        title = title[:max_length].rsplit(' ', 1)[0] + '...'
    
    return title if title else "New Chat"


@router.post("/chats", response_model=CreateChatResponse, tags=["Chat"])
async def create_chat(
    request: CreateChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new chat session for authenticated user
    
    Args:
        request: CreateChatRequest (user_id is ignored, uses authenticated user)
        current_user: Authenticated user from JWT
        
    Returns:
        CreateChatResponse: New chat with session_id and default title
    """
    try:
        session_id = str(uuid.uuid4())
        user_id = str(current_user["_id"])
        now = datetime.utcnow()
        
        chats_collection = get_chats_collection()
        await chats_collection.insert_one({
            "session_id": session_id,
            "user_id": user_id,
            "title": "New Chat",
            "messages": [],
            "created_at": now,
            "updated_at": now
        })
        
        logger.info(f"Created new chat: {session_id} for user: {user_id}")
        return CreateChatResponse(
            session_id=session_id,
            title="New Chat",
            created_at=now
        )
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")


@router.get("/chats", response_model=ChatListResponse, tags=["Chat"])
async def list_chats(current_user: dict = Depends(get_current_user)):
    """
    Get all chats for authenticated user
    
    Args:
        current_user: Authenticated user from JWT
        
    Returns:
        ChatListResponse: List of user's chats with metadata
    """
    try:
        user_id = str(current_user["_id"])
        chats_collection = get_chats_collection()
        cursor = chats_collection.find({"user_id": user_id}).sort("updated_at", -1)
        
        chats = []
        async for doc in cursor:
            chats.append(ChatListItem(
                session_id=doc["session_id"],
                title=doc.get("title", "New Chat"),
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
                message_count=len(doc.get("messages", []))
            ))
        
        logger.info(f"Found {len(chats)} chats for user: {user_id}")
        return ChatListResponse(chats=chats, total=len(chats))
    except Exception as e:
        logger.error(f"Error listing chats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list chats: {str(e)}")


@router.patch("/chats/{session_id}/title", tags=["Chat"])
async def update_chat_title(
    session_id: str,
    request: UpdateChatTitleRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update chat title (only if user owns the chat)
    
    Args:
        session_id: Chat session ID
        request: New title
        current_user: Authenticated user from JWT
    """
    try:
        user_id = str(current_user["_id"])
        chats_collection = get_chats_collection()
        
        # Verify ownership
        chat = await chats_collection.find_one({"session_id": session_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if chat.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied: You don't own this chat")
        
        # Update title
        result = await chats_collection.update_one(
            {"session_id": session_id, "user_id": user_id},
            {"$set": {"title": request.title, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        logger.info(f"Updated chat title: {session_id} -> {request.title} for user: {user_id}")
        return {"message": "Title updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating chat title: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update title: {str(e)}")


@router.get("/chats/{session_id}", tags=["Chat"])
async def get_chat(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific chat with all messages (only if user owns it)
    
    Args:
        session_id: Chat session ID
        current_user: Authenticated user from JWT
        
    Returns:
        Chat document with messages
    """
    try:
        user_id = str(current_user["_id"])
        chats_collection = get_chats_collection()
        chat = await chats_collection.find_one({"session_id": session_id})
        
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Verify ownership
        if chat.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied: You don't own this chat")
        
        return {
            "session_id": chat["session_id"],
            "title": chat.get("title", "New Chat"),
            "messages": chat.get("messages", []),
            "created_at": chat["created_at"],
            "updated_at": chat["updated_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get chat: {str(e)}")


@router.delete("/chats/{session_id}", tags=["Chat"])
async def delete_chat(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a chat session (only if user owns it)
    
    Args:
        session_id: Chat session ID to delete
        current_user: Authenticated user from JWT
    """
    try:
        user_id = str(current_user["_id"])
        chats_collection = get_chats_collection()
        
        # Verify ownership before deleting
        chat = await chats_collection.find_one({"session_id": session_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if chat.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied: You don't own this chat")
        
        result = await chats_collection.delete_one({"session_id": session_id, "user_id": user_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        logger.info(f"Deleted chat: {session_id} for user: {user_id}")
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete chat: {str(e)}")


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with uploaded documents (user-isolated)
    
    Process:
    1. Verify user owns the chat session
    2. Load vector store for session
    3. Retrieve relevant document chunks
    4. Generate answer using LLM
    5. Save messages to user's chat
    6. Return answer with source citations
    
    Args:
        request: ChatRequest with session_id and question
        current_user: Authenticated user from JWT
        
    Returns:
        ChatResponse: Answer and sources
        
    Raises:
        HTTPException: If session not found, access denied, or query fails
    """
    
    try:
        user_id = str(current_user["_id"])
        logger.info(f"Received chat request for session: {request.session_id} from user: {user_id}")
        logger.info(f"Question: {request.question}")
        
        # Verify chat ownership
        chats_collection = get_chats_collection()
        chat = await chats_collection.find_one({"session_id": request.session_id})
        
        if not chat:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        if chat.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied: You don't own this chat")
        
        # Query RAG pipeline
        result = rag_pipeline.query(
            question=request.question,
            session_id=request.session_id
        )
        
        # Auto-generate title from first user message
        update_data = {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": request.question, "timestamp": datetime.utcnow()},
                        {"role": "assistant", "content": result['answer'], "timestamp": datetime.utcnow()}
                    ]
                }
            },
            "$set": {"updated_at": datetime.utcnow()}
        }
        
        # If first message, generate title
        if len(chat.get("messages", [])) == 0:
            title = generate_title_from_message(request.question)
            update_data["$set"]["title"] = title
            logger.info(f"Auto-generated title: {title}")
        
        # Save chat to MongoDB (with user_id verification)
        await chats_collection.update_one(
            {"session_id": request.session_id, "user_id": user_id},
            update_data
        )
        
        return ChatResponse(
            answer=result['answer'],
            sources=result['sources'],
            session_id=result['session_id']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
