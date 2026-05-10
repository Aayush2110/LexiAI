"""
Security Module

Handles security-related functionality like API key validation.
In production, you might add authentication, rate limiting, etc.
"""

from app.core.config import settings
from loguru import logger


def validate_api_keys():
    """
    Validate that required API keys are configured
    
    Raises:
        ValueError: If required API keys are missing
    """
    
    if settings.LLM_PROVIDER == "openai":
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "your_openai_api_key_here":
            logger.error("OpenAI API key not configured")
            raise ValueError("OPENAI_API_KEY must be set in .env file")
        logger.info("OpenAI API key validated")
    
    elif settings.LLM_PROVIDER == "gemini":
        if not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY == "your_google_api_key_here":
            logger.error("Google API key not configured")
            raise ValueError("GOOGLE_API_KEY must be set in .env file")
        logger.info("Google Gemini API key validated")
    
    else:
        raise ValueError(f"Invalid LLM_PROVIDER: {settings.LLM_PROVIDER}. Must be 'openai' or 'gemini'")
