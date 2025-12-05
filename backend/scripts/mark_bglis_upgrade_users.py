"""
BGLIS v1.0 - Migration Script

Mark existing users who need BGLIS upgrade (phone + username + recovery phrase)

Usage:
    python scripts/mark_bglis_upgrade_users.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment
load_dotenv()


async def mark_users_needing_upgrade():
    """
    Mark existing users who need BGLIS upgrade
    
    Users need upgrade if they're missing:
    - phone_number
    - username
    - recovery_phrase
    """
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client.banibs_db
    
    print("🔍 BGLIS v1.0 Migration - Checking users...")
    print("="*60)
    
    # Find all users
    users = await db.banibs_users.find({}).to_list(length=None)
    total_users = len(users)
    
    print(f"Found {total_users} total users")
    print()
    
    # Analyze users
    needs_upgrade = []
    already_compliant = []
    
    for user in users:
        user_id = user.get("id")
        email = user.get("email", "N/A")
        
        has_phone = user.get("phone_number") is not None
        is_phone_verified = user.get("is_phone_verified", False)
        has_username = user.get("username") is not None
        has_recovery = user.get("has_recovery_phrase", False)
        
        is_compliant = has_phone and is_phone_verified and has_username and has_recovery
        
        if is_compliant:
            already_compliant.append(user_id)
        else:
            needs_upgrade.append({
                "id": user_id,
                "email": email,
                "missing": {
                    "phone": not has_phone,
                    "phone_verified": not is_phone_verified,
                    "username": not has_username,
                    "recovery_phrase": not has_recovery
                }
            })
    
    print(f"✅ Already BGLIS-compliant: {len(already_compliant)} users")
    print(f"⚠️  Need upgrade: {len(needs_upgrade)} users")
    print()
    
    if needs_upgrade:
        print("Users needing upgrade:")
        print("-" * 60)
        for user_info in needs_upgrade[:10]:  # Show first 10
            missing = [k for k, v in user_info["missing"].items() if v]
            print(f"  {user_info['email']}: Missing {', '.join(missing)}")
        
        if len(needs_upgrade) > 10:
            print(f"  ... and {len(needs_upgrade) - 10} more")
        print()
        
        # Ask for confirmation
        response = input("Mark these users as needing BGLIS upgrade? (yes/no): ")
        
        if response.lower() == "yes":
            # Update users
            user_ids = [u["id"] for u in needs_upgrade]
            
            result = await db.banibs_users.update_many(
                {"id": {"$in": user_ids}},
                {"$set": {"needs_bglis_upgrade": True}}
            )
            
            print(f"\n✅ Updated {result.modified_count} users")
            print(f"   Set needs_bglis_upgrade = true")
            print()
            print("Users will be prompted to upgrade on next login.")
        else:
            print("\n❌ Migration cancelled")
    else:
        print("✅ All users are already BGLIS-compliant!")
    
    print()
    print("="*60)
    print("Migration check complete")
    
    # Close connection
    client.close()


if __name__ == "__main__":
    asyncio.run(mark_users_needing_upgrade())
