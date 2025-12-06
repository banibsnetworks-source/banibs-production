from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv
import certifi

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with TLS/SSL support for MongoDB Atlas
mongo_url = os.environ['MONGO_URL']

# Configure MongoDB client with TLS and certificate authority
client = AsyncIOMotorClient(
    mongo_url,
    tlsCAFile=certifi.where(),  # Use certifi bundle for SSL verification
    serverSelectionTimeoutMS=5000,  # 5 second timeout
    connectTimeoutMS=5000,
    socketTimeoutMS=5000
)

db = client[os.environ['DB_NAME']]

async def get_db():
    """Dependency to get database instance"""
    return db

def get_db_client():
    """Get database client directly (non-async)"""
    return db
