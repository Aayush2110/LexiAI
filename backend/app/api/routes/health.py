"""
Health Check Route

Provides health status endpoint for monitoring.
"""

from fastapi import APIRouter
from app.models.response_models import HealthResponse
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    
    
    Returns service status and version information.
    Useful for:
    - Load balancer health checks
    - Monitoring systems
    - Deployment verification
    """
    
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        message=f"{settings.APP_NAME} is running"
    )
