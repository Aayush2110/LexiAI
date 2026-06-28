"""
Request Models

Pydantic models for validating incoming API requests.
These ensure type safety and automatic validation.

Why Pydantic Models?
- Automatic request validation
- Type checking
- Clear API documentation in Swagger
- Data serialization/deserialization
"""

from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """
    Chat Request Model
    
    Validates incoming chat requests from frontend.
    """
    
    session_id: str = Field(
        ...,
        description="Unique session identifier for maintaining conversation context",
        min_length=1,
        max_length=100
    )
    
    question: str = Field(
        ...,
        description="User's question about the uploaded documents",
        min_length=1,
        max_length=1000
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc123",
                "question": "What is the termination clause in this agreement?"
            }
        }


class CreateChatRequest(BaseModel):
    """Request model for creating a new chat"""
    user_id: str = Field(default="default_user", description="User identifier")


class UpdateChatTitleRequest(BaseModel):
    """Request model for updating chat title"""
    title: str = Field(..., min_length=1, max_length=100, description="New chat title")


class UploadResponse(BaseModel):
    """Response model for file upload"""
    
    session_id: str = Field(..., description="Generated session ID for this upload")
    message: str = Field(..., description="Status message")
    files_processed: int = Field(..., description="Number of files successfully processed")
    chunks_created: int = Field(..., description="Total number of text chunks created")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc123",
                "message": "Files uploaded and processed successfully",
                "files_processed": 2,
                "chunks_created": 45
            }
        }
