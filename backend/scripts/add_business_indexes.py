"""
Add database indexes to business_listings collection for performance
"""

import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.connection import db

async def add_indexes():
    print("📊 Adding indexes to business_listings collection...")
    
    business_listings = db.business_listings
    
    # Create indexes for common query fields
    indexes_to_create = [
        ("category", 1),
        ("city", 1),
        ("state", 1),
        ("verified", 1),
        [("business_name", "text"), ("description", "text")],  # Text search index
    ]
    
    for idx in indexes_to_create:
        try:
            if isinstance(idx, list):
                # Text index
                result = await business_listings.create_index(idx)
                print(f"✅ Created text index: {result}")
            else:
                # Single field index
                result = await business_listings.create_index([idx])
                print(f"✅ Created index on '{idx[0]}': {result}")
        except Exception as e:
            print(f"⚠️  Index creation note: {e}")
    
    # List all indexes
    print("\n📋 Current indexes:")
    indexes = await business_listings.list_indexes().to_list(length=None)
    for idx in indexes:
        print(f"   - {idx['name']}: {idx.get('key', {})}")
    
    print("\n✅ Index optimization complete!")

if __name__ == "__main__":
    asyncio.run(add_indexes())
