"""
Create social test user for Phase 8.3 testing

This script creates a test user for social portal testing.
"""

import asyncio
import os
import sys
import bcrypt
import uuid
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

async def create_social_test_user():
    """Create social test user"""
    
    # Test user credentials
    test_email = "social_test_user@example.com"
    test_password = "TestPass123!"
    test_name = "Social Test User"
    
    print("=" * 60)
    print("BANIBS Social Test User Creation")
    print("=" * 60)
    print(f"\nTest User Email: {test_email}")
    print(f"Test User Name: {test_name}")
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Check if user already exists
        existing_user = await db.banibs_users.find_one({"email": test_email})
        
        if existing_user:
            print(f"\n✅ Test user already exists: {test_email}")
            print(f"   Name: {existing_user.get('name')}")
            print(f"   ID: {existing_user.get('id')}")
            print(f"   Roles: {existing_user.get('roles', [])}")
            return existing_user
        
        # Hash password
        print("\n🔐 Hashing password...")
        password_bytes = test_password.encode('utf-8')
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Generate UUID for user
        user_id = str(uuid.uuid4())
        
        # Create user document
        user_doc = {
            "id": user_id,
            "email": test_email,
            "name": test_name,
            "password_hash": password_hash,
            "roles": ["user", "member"],  # Required for social portal access
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "profile": {
                "bio": "Test user for BANIBS Social Portal testing",
                "location": "Test City, TC"
            }
        }
        
        # Insert into database
        print("📝 Creating test user...")
        result = await db.banibs_users.insert_one(user_doc)
        
        print(f"\n✅ SUCCESS! Test user created:")
        print(f"   Email: {test_email}")
        print(f"   Password: {test_password}")
        print(f"   Name: {test_name}")
        print(f"   ID: {user_id}")
        print(f"   Roles: {user_doc['roles']}")
        
        print("\n" + "=" * 60)
        print("Social Test User Login Credentials:")
        print("=" * 60)
        print(f"Email:    {test_email}")
        print(f"Password: {test_password}")
        print("=" * 60)
        
        print("\n✅ Test user creation complete!")
        
        return user_doc
        
    except Exception as e:
        print(f"\n❌ ERROR: Failed to create test user")
        print(f"   {str(e)}")
        raise
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_social_test_user())