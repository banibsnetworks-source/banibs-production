"""
Migration Script: Create BusinessMember records for existing BusinessProfiles
Phase B1 - Business Pages & Follow System

This script ensures all existing business profiles have an owner BusinessMember record
"""

import asyncio
import sys
import os

# Add parent directory to path to import from backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.connection import get_db
from db.business_members import BusinessMembersDB
from utils.handle_generator import generate_handle, make_handle_unique


async def migrate_business_members():
    """Create BusinessMember records for existing business profiles"""
    print("Starting BusinessMember migration...")
    
    db = await get_db()
    members_db = BusinessMembersDB(db)
    
    # Get all business profiles
    profiles = await db.business_profiles.find({}, {"_id": 0}).to_list(length=10000)
    
    print(f"Found {len(profiles)} business profiles")
    
    created_count = 0
    skipped_count = 0
    handle_updates = 0
    errors = []
    
    # Get all existing handles for uniqueness checking
    existing_handles = set()
    for profile in profiles:
        if profile.get("handle"):
            existing_handles.add(profile["handle"])
    
    for profile in profiles:
        business_id = profile["id"]
        owner_user_id = profile.get("owner_user_id")
        
        # Skip if no owner_user_id
        if not owner_user_id:
            print(f"⚠️  Skipping business {business_id} - no owner_user_id")
            skipped_count += 1
            errors.append(f"Business {business_id} ({profile.get('name', 'Unknown')}) has no owner_user_id")
            continue
        
        # Check if BusinessMember already exists
        existing_member = await members_db.get_member(business_id, owner_user_id)
        
        if existing_member:
            print(f"✓ Business {profile.get('name')} already has owner member")
            continue
        
        # Create BusinessMember with owner role
        try:
            await members_db.create_member(
                business_id=business_id,
                user_id=owner_user_id,
                role="owner",
                status="active"
            )
            print(f"✅ Created owner member for: {profile.get('name')}")
            created_count += 1
        except Exception as e:
            print(f"❌ Error creating member for {profile.get('name')}: {e}")
            errors.append(f"Business {business_id}: {str(e)}")
        
        # Check and add handle if missing
        if not profile.get("handle"):
            try:
                # Generate handle from business name
                base_handle = generate_handle(profile["name"])
                handle = make_handle_unique(base_handle, list(existing_handles))
                existing_handles.add(handle)
                
                # Update business profile with handle
                await db.business_profiles.update_one(
                    {"id": business_id},
                    {"$set": {"handle": handle, "is_active": True}}
                )
                print(f"  ↳ Added handle '{handle}' to {profile.get('name')}")
                handle_updates += 1
            except Exception as e:
                print(f"  ⚠️  Could not add handle for {profile.get('name')}: {e}")
                errors.append(f"Handle generation for {business_id}: {str(e)}")
    
    print("\n" + "="*60)
    print("Migration Complete!")
    print("="*60)
    print(f"✅ Created {created_count} new BusinessMember records")
    print(f"📝 Added handles to {handle_updates} businesses")
    print(f"⚠️  Skipped {skipped_count} businesses (missing owner_user_id)")
    
    if errors:
        print(f"\n❌ {len(errors)} errors occurred:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("\n🎉 No errors!")
    
    return {
        "created": created_count,
        "skipped": skipped_count,
        "handle_updates": handle_updates,
        "errors": errors
    }


if __name__ == "__main__":
    print("="*60)
    print("BusinessMember Migration Script - Phase B1")
    print("="*60)
    print()
    
    result = asyncio.run(migrate_business_members())
    
    print(f"\nTotal created: {result['created']}")
    print(f"Total skipped: {result['skipped']}")
    print(f"Handle updates: {result['handle_updates']}")
    
    if result['errors']:
        sys.exit(1)  # Exit with error code if there were any errors
    else:
        sys.exit(0)  # Success
