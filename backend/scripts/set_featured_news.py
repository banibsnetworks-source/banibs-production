#!/usr/bin/env python3
"""
Set Featured News Item
Marks one high-quality news item as featured for the homepage
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def set_featured_news():
    """Mark a high-quality news item as featured"""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.environ.get('DB_NAME', 'test_database')]
    collection = db.news_items
    
    # Check if there's already a featured news item
    existing_featured = await collection.find_one({"isFeatured": True}, {"_id": 0, "id": 1, "title": 1})
    if existing_featured:
        print(f"ℹ️  Featured news already set:")
        print(f"   ID: {existing_featured['id']}")
        print(f"   Title: {existing_featured['title']}")
        client.close()
        return
    
    # Find a high-quality news item to feature
    # Criteria: Has image, has source URL, relatively recent
    candidate = await collection.find_one(
        {
            "imageUrl": {"$exists": True, "$ne": None, "$ne": ""},
            "sourceUrl": {"$exists": True, "$ne": None, "$ne": ""},
            "title": {"$exists": True, "$ne": None, "$ne": ""}
        },
        {"_id": 0, "id": 1, "title": 1, "imageUrl": 1, "sourceUrl": 1, "category": 1}
    )
    
    if not candidate:
        print("⚠️  No suitable news items found to feature")
        client.close()
        return
    
    # Set this item as featured
    result = await collection.update_one(
        {"id": candidate["id"]},
        {"$set": {"isFeatured": True}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Successfully set featured news item:")
        print(f"   ID: {candidate['id']}")
        print(f"   Title: {candidate['title']}")
        print(f"   Category: {candidate.get('category', 'N/A')}")
        print(f"   Image: {candidate.get('imageUrl', 'N/A')[:80]}...")
        print(f"   Source: {candidate.get('sourceUrl', 'N/A')[:80]}...")
    else:
        print("❌ Failed to update news item")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(set_featured_news())
