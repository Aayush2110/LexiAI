"""
Test MongoDB and ChromaDB Setup
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import chromadb
from loguru import logger

async def test_mongodb():
    """Test MongoDB connection"""
    try:
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        await client.admin.command('ping')
        logger.info("✓ MongoDB connection successful")
        
        # List databases
        dbs = await client.list_database_names()
        logger.info(f"✓ Available databases: {dbs}")
        
        client.close()
        return True
    except Exception as e:
        logger.error(f"✗ MongoDB connection failed: {e}")
        return False

def test_chromadb():
    """Test ChromaDB setup"""
    try:
        client = chromadb.PersistentClient(path="./data/chromadb")
        
        # Create test collection
        collection = client.get_or_create_collection("test_collection")
        
        # Add test data
        collection.add(
            documents=["This is a test document"],
            ids=["test1"]
        )
        
        # Query
        results = collection.query(
            query_texts=["test"],
            n_results=1
        )
        
        logger.info("✓ ChromaDB setup successful")
        logger.info(f"✓ Test query results: {results}")
        
        # Cleanup
        client.delete_collection("test_collection")
        
        return True
    except Exception as e:
        logger.error(f"✗ ChromaDB setup failed: {e}")
        return False

async def main():
    """Run all tests"""
    logger.info("=" * 50)
    logger.info("Testing Database Setup")
    logger.info("=" * 50)
    
    mongo_ok = await test_mongodb()
    chroma_ok = test_chromadb()
    
    logger.info("=" * 50)
    if mongo_ok and chroma_ok:
        logger.info("✓ All tests passed!")
    else:
        logger.error("✗ Some tests failed")
    logger.info("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
