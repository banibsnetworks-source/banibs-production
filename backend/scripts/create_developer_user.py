"""
Create developer user for BANIBS OS testing
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from uuid import uuid4
import bcrypt

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def create_developer_user():
    """Create developer user for testing"""
    
    # Get MongoDB URL from environment
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017/banibs")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_default_database()
    
    print("🔧 Creating developer user...")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": "developer@banibs.com"})
    if existing_user:
        print("✅ Developer user already exists")
        client.close()
        return existing_user["id"]
    
    # Hash password
    password = "DevPass123!"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create developer user
    user_id = str(uuid4())
    developer_user = {
        "id": user_id,
        "email": "developer@banibs.com",
        "password": hashed_password,
        "first_name": "BANIBS",
        "last_name": "Developer",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "roles": ["developer", "user"],
        "accepted_terms": True
    }
    
    await db.users.insert_one(developer_user)
    print(f"✅ Created developer user: {developer_user['email']} (ID: {user_id})")
    
    client.close()
    return user_id

if __name__ == "__main__":
    asyncio.run(create_developer_user())