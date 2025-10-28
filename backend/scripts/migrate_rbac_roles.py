"""
Phase 4.5 - RBAC Migration Script
Migrates existing admin users to super_admin role
All new users default to moderator role
"""
import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "banibs")

async def migrate_admin_roles():
    """
    Migrate existing admins to super_admin role
    """
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Starting RBAC role migration...")
    
    # Find all users with role "admin" (old schema)
    old_admins = await db.users.find({"role": "admin"}).to_list(length=None)
    
    if old_admins:
        print(f"Found {len(old_admins)} users with old 'admin' role")
        
        # Update to super_admin
        result = await db.users.update_many(
            {"role": "admin"},
            {
                "$set": {
                    "role": "super_admin",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        print(f"✅ Migrated {result.modified_count} users to 'super_admin' role")
    else:
        print("No users found with old 'admin' role")
    
    # Check for users with old "editor" role
    old_editors = await db.users.find({"role": "editor"}).to_list(length=None)
    
    if old_editors:
        print(f"Found {len(old_editors)} users with old 'editor' role")
        
        # Update to moderator
        result = await db.users.update_many(
            {"role": "editor"},
            {
                "$set": {
                    "role": "moderator",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        print(f"✅ Migrated {result.modified_count} users to 'moderator' role")
    else:
        print("No users found with old 'editor' role")
    
    # Show final role distribution
    super_admins = await db.users.count_documents({"role": "super_admin"})
    moderators = await db.users.count_documents({"role": "moderator"})
    
    print("\nFinal role distribution:")
    print(f"  Super Admins: {super_admins}")
    print(f"  Moderators: {moderators}")
    
    client.close()
    print("\n✅ Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate_admin_roles())
