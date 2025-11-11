"""
Update social test user roles for Phase 8.3 testing
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

async def update_social_test_user():
    """Update social test user with member role"""
    
    test_email = "social_test_user@example.com"
    
    print("=" * 60)
    print("BANIBS Social Test User Update")
    print("=" * 60)
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Find and update user
        result = await db.banibs_users.update_one(
            {"email": test_email},
            {
                "$set": {
                    "roles": ["user", "member"],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✅ Updated user roles for {test_email}")
            
            # Verify update
            user = await db.banibs_users.find_one({"email": test_email})
            print(f"   New roles: {user.get('roles', [])}")
        else:
            print(f"⚠️ No user found or no changes made for {test_email}")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(update_social_test_user())