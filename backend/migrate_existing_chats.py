"""
Migration Script: Add user_id to Existing Chats

This script migrates existing chats, documents, and sessions
to include user_id field for multi-user isolation.

Usage:
    python migrate_existing_chats.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "lexi_ai")

# Default user ID for existing data (you can change this)
DEFAULT_USER_ID = "default_user"


async def migrate_chats():
    """Add user_id to chats without it"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    chats_collection = db.chats
    
    # Find chats without user_id
    cursor = chats_collection.find({"user_id": {"$exists": False}})
    count = 0
    
    async for chat in cursor:
        await chats_collection.update_one(
            {"_id": chat["_id"]},
            {"$set": {"user_id": DEFAULT_USER_ID}}
        )
        count += 1
        print(f"Updated chat: {chat.get('session_id', 'unknown')}")
    
    print(f"\n✅ Migrated {count} chats")
    client.close()


async def migrate_documents():
    """Add user_id to documents without it"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    documents_collection = db.documents
    
    # Find documents without user_id
    cursor = documents_collection.find({"user_id": {"$exists": False}})
    count = 0
    
    async for doc in cursor:
        await documents_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"user_id": DEFAULT_USER_ID}}
        )
        count += 1
        print(f"Updated document: {doc.get('filename', 'unknown')}")
    
    print(f"\n✅ Migrated {count} documents")
    client.close()


async def migrate_sessions():
    """Add user_id to sessions without it"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    sessions_collection = db.sessions
    
    # Find sessions without user_id
    cursor = sessions_collection.find({"user_id": {"$exists": False}})
    count = 0
    
    async for session in cursor:
        await sessions_collection.update_one(
            {"_id": session["_id"]},
            {"$set": {"user_id": DEFAULT_USER_ID}}
        )
        count += 1
        print(f"Updated session: {session.get('session_id', 'unknown')}")
    
    print(f"\n✅ Migrated {count} sessions")
    client.close()


async def create_indexes():
    """Create database indexes for performance"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("\n📊 Creating database indexes...")
    
    # Chats indexes
    await db.chats.create_index([("user_id", 1), ("updated_at", -1)])
    await db.chats.create_index([("session_id", 1)])
    print("✅ Created chats indexes")
    
    # Documents indexes
    await db.documents.create_index([("session_id", 1), ("user_id", 1)])
    await db.documents.create_index([("user_id", 1)])
    print("✅ Created documents indexes")
    
    # Sessions indexes
    await db.sessions.create_index([("session_id", 1)])
    await db.sessions.create_index([("user_id", 1)])
    print("✅ Created sessions indexes")
    
    client.close()


async def verify_migration():
    """Verify all documents have user_id"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("\n🔍 Verifying migration...")
    
    # Check chats
    chats_without_user = await db.chats.count_documents({"user_id": {"$exists": False}})
    total_chats = await db.chats.count_documents({})
    print(f"Chats: {total_chats} total, {chats_without_user} without user_id")
    
    # Check documents
    docs_without_user = await db.documents.count_documents({"user_id": {"$exists": False}})
    total_docs = await db.documents.count_documents({})
    print(f"Documents: {total_docs} total, {docs_without_user} without user_id")
    
    # Check sessions
    sessions_without_user = await db.sessions.count_documents({"user_id": {"$exists": False}})
    total_sessions = await db.sessions.count_documents({})
    print(f"Sessions: {total_sessions} total, {sessions_without_user} without user_id")
    
    if chats_without_user == 0 and docs_without_user == 0 and sessions_without_user == 0:
        print("\n✅ Migration successful! All documents have user_id")
    else:
        print("\n⚠️  Some documents still missing user_id")
    
    client.close()


async def main():
    """Run all migration steps"""
    print("=" * 60)
    print("LexiAI Multi-User Migration Script")
    print("=" * 60)
    print(f"\nDatabase: {DATABASE_NAME}")
    print(f"MongoDB URL: {MONGODB_URL}")
    print(f"Default User ID: {DEFAULT_USER_ID}")
    print("\n" + "=" * 60)
    
    # Ask for confirmation
    response = input("\nProceed with migration? (yes/no): ")
    if response.lower() not in ["yes", "y"]:
        print("Migration cancelled.")
        return
    
    print("\n🚀 Starting migration...\n")
    
    # Run migrations
    await migrate_chats()
    await migrate_documents()
    await migrate_sessions()
    
    # Create indexes
    await create_indexes()
    
    # Verify
    await verify_migration()
    
    print("\n" + "=" * 60)
    print("Migration complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Restart your backend server")
    print("2. Test with multiple user accounts")
    print("3. Verify users can only see their own chats")
    print("\n")


if __name__ == "__main__":
    asyncio.run(main())
