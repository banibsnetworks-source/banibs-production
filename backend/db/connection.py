from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv
import certifi

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - supports both local and MongoDB Atlas
mongo_url = os.environ['MONGO_URL']

# Configure MongoDB client - use SSL only for remote connections (Atlas)
is_localhost = 'localhost' in mongo_url or '127.0.0.1' in mongo_url

if is_localhost:
    # Local MongoDB - no SSL needed
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000
    )
else:
    # Remote MongoDB (Atlas) - use TLS/SSL with certifi
    client = AsyncIOMotorClient(
        mongo_url,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,
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
