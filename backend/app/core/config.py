"""
Core Configuration Module

This module manages all application settings using Pydantic Settings.
It loads environment variables from .env file and provides type-safe configuration.

Why Pydantic Settings?
- Type validation for configuration values
- Automatic .env file loading
- Default values support
- Easy to test and mock
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """
    Application Settings Class
    
    All configuration parameters are defined here with type hints.
    Values are automatically loaded from environment variables or .env file.
    """
    
    # LLM Provider Configuration
    LLM_PROVIDER: str = "gemini"  # "openai" or "gemini"
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    
    # Application Settings
    APP_NAME: str = "LegalRAG AI Chatbot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Settings - Frontend URLs that can access this API
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # File Upload Settings
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = "pdf,docx,txt"
    
    # RAG Configuration
    CHUNK_SIZE: int = 1000  # Size of each text chunk in characters
    CHUNK_OVERLAP: int = 200  # Overlap between chunks to maintain context
    TOP_K_RETRIEVAL: int = 4  # Number of relevant chunks to retrieve
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # LLM Settings
    LLM_TEMPERATURE: float = 0.1  # Lower = more deterministic responses
    LLM_MAX_TOKENS: int = 500  # Maximum response length
    
    # Computed Properties
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        """Convert comma-separated extensions to list"""
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes for file size validation"""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    # Directory Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    @property
    def uploads_dir(self) -> str:
        """Directory for uploaded files"""
        path = os.path.join(self.BASE_DIR, "data", "uploads")
        os.makedirs(path, exist_ok=True)
        return path
    
    @property
    def vectorstores_dir(self) -> str:
        """Directory for FAISS vector stores"""
        path = os.path.join(self.BASE_DIR, "data", "vectorstores")
        os.makedirs(path, exist_ok=True)
        return path
    
    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        case_sensitive = True


# Global settings instance
# This is imported throughout the application
settings = Settings()
