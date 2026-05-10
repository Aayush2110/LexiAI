"""
Logging Configuration Module

This module sets up structured logging using Loguru.
Logs are essential for debugging, monitoring, and auditing in production.

Why Loguru?
- Simple and intuitive API
- Automatic formatting and colorization
- Exception catching with context
- File rotation support
- Better than standard logging module
"""

from loguru import logger
import sys
from app.core.config import settings


def setup_logging():
    """
    Configure application logging
    
    Sets up:
    - Console logging with colors
    - File logging with rotation
    - Different log levels based on DEBUG mode
    """
    
    # Remove default logger
    logger.remove()
    
    # Console logging with colors
    log_level = "DEBUG" if settings.DEBUG else "INFO"
    
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level=log_level
    )
    
    # File logging with rotation (10 MB per file, keep 5 files)
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="10 MB",
        retention="7 days",
        compression="zip",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function} - {message}",
        level=log_level
    )
    
    logger.info(f"Logging initialized - Level: {log_level}")


# Initialize logging when module is imported
setup_logging()
