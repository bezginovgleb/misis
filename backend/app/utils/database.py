import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

# Database connection
db = Database()

# Database configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "exam_platform")

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(MONGODB_URL)
        db.database = db.client[DATABASE_NAME]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes for better performance
        await create_indexes()
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def get_database():
    """Get database instance"""
    return db.database

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Tasks collection indexes
        await db.database.tasks.create_index("category")
        await db.database.tasks.create_index("difficulty")
        await db.database.tasks.create_index("created_at")
        await db.database.tasks.create_index([("title", "text"), ("description", "text")])
        
        # Users collection indexes
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("username", unique=True)
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

# Helper functions for common database operations
async def get_tasks_collection():
    """Get tasks collection"""
    return db.database.tasks

async def get_users_collection():
    """Get users collection"""
    return db.database.users

async def get_progress_collection():
    """Get user progress collection"""
    return db.database.user_progress