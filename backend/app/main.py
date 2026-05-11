"""
Main FastAPI Application

Entry point for the LegalRAG AI Chatbot backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.security import validate_api_keys
from app.api.routes import health, upload, chat, auth

# Initialize logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready RAG pipeline for legal document Q&A",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(auth.router)


from app.services.database import MongoDB


@app.on_event("startup")
async def startup_event():
    """
    Startup event handler
    
    Runs when the application starts.
    Validates configuration and initializes services.
    """
    
    logger.info("=" * 50)
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("=" * 50)
    
    try:
        # Connect to MongoDB
        await MongoDB.connect()
        
        # Validate API keys
        validate_api_keys()
        
        # Log configuration
        logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")
        logger.info(f"Embedding Model: {settings.EMBEDDING_MODEL}")
        logger.info(f"Chunk Size: {settings.CHUNK_SIZE}")
        logger.info(f"Chunk Overlap: {settings.CHUNK_OVERLAP}")
        logger.info(f"Top K Retrieval: {settings.TOP_K_RETRIEVAL}")
        logger.info(f"CORS Origins: {settings.cors_origins_list}")
        
        logger.info("Application started successfully")
        logger.info(f"API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler
    
    Runs when the application stops.
    Cleanup resources if needed.
    """
    
    logger.info("Shutting down application...")
    await MongoDB.close()


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint
    
    Returns basic API information.
    """
    
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
