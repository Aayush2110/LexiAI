"""
File Utilities Module

Helper functions for file operations like validation, saving, and cleanup.
"""

import os
import uuid
from typing import List
from fastapi import UploadFile, HTTPException
from loguru import logger
from app.core.config import settings


def validate_file_extension(filename: str) -> bool:
    """
    Validate if file extension is allowed
    
    Args:
        filename: Name of the uploaded file
        
    Returns:
        bool: True if extension is allowed
    """
    extension = filename.split('.')[-1].lower()
    return extension in settings.allowed_extensions_list


def validate_file_size(file: UploadFile) -> bool:
    """
    Validate file size (basic check)
    
    Args:
        file: Uploaded file object
        
    Returns:
        bool: True if size is acceptable
    """
    # Note: For production, implement proper size checking
    # This is a basic implementation
    return True


async def save_upload_file(file: UploadFile, session_id: str) -> str:
    """
    Save uploaded file to disk
    
    Args:
        file: FastAPI UploadFile object
        session_id: Session identifier for organizing files
        
    Returns:
        str: Full path to saved file
        
    Raises:
        HTTPException: If file validation fails
    """
    
    # Validate file extension
    if not validate_file_extension(file.filename):
        logger.error(f"Invalid file extension: {file.filename}")
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Create session-specific directory
    session_dir = os.path.join(settings.uploads_dir, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(session_dir, file.filename)
    
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"File saved: {file_path}")
        return file_path
    
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")


def generate_session_id() -> str:
    """
    Generate unique session ID
    
    Returns:
        str: UUID-based session identifier
    """
    return str(uuid.uuid4())


def get_session_files(session_id: str) -> List[str]:
    """
    Get all uploaded files for a session
    
    Args:
        session_id: Session identifier
        
    Returns:
        List[str]: List of file paths
    """
    session_dir = os.path.join(settings.uploads_dir, session_id)
    
    if not os.path.exists(session_dir):
        return []
    
    files = []
    for filename in os.listdir(session_dir):
        file_path = os.path.join(session_dir, filename)
        if os.path.isfile(file_path):
            files.append(file_path)
    
    return files


def cleanup_session_files(session_id: str):
    """
    Clean up uploaded files for a session
    
    Args:
        session_id: Session identifier
    """
    session_dir = os.path.join(settings.uploads_dir, session_id)
    
    if os.path.exists(session_dir):
        import shutil
        shutil.rmtree(session_dir)
        logger.info(f"Cleaned up session files: {session_id}")
