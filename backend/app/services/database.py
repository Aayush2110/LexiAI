"""
MongoDB Database Service
"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from loguru import logger
from app.core.config import settings
from typing import Optional

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection failed: {e}")
            raise
    
    @classmethod
    async def close(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        return cls.client[settings.MONGODB_DB_NAME]

# Collections
def get_users_collection():
    return MongoDB.get_db()["users"]

def get_chats_collection():
    return MongoDB.get_db()["chats"]

def get_documents_collection():
    return MongoDB.get_db()["documents"]

def get_sessions_collection():
    return MongoDB.get_db()["sessions"]
