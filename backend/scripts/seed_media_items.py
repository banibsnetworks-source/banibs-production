#!/usr/bin/env python3
"""
Seed BANIBS TV Media Items
Creates sample featured media for the BANIBS TV section on the homepage
"""
import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.featured_media import FeaturedMediaDB

async def seed_media():
    """Seed sample BANIBS TV media items"""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.environ.get('DB_NAME', 'test_database')]
    collection = db.featured_media
    
    # Check if media items already exist
    existing_count = await collection.count_documents({})
    if existing_count > 0:
        print(f"ℹ️  Found {existing_count} existing media items. Skipping seed.")
        client.close()
        return
    
    # Sample BANIBS TV media items
    media_items = [
        {
            "title": "Building Wealth Through Black-Owned Businesses",
            "description": "Join us for an in-depth conversation with three successful Black entrepreneurs who share their journeys, challenges, and strategies for building sustainable wealth in their communities.",
            "videoUrl": "/video/wealth-building-2025",
            "thumbnailUrl": "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&q=80",
            "tag": "Business • Entrepreneurship",
            "isFeatured": True,
            "external": False,
            "publishedAt": datetime.now(timezone.utc),
            "sourceName": "BANIBS TV"
        },
        {
            "title": "Indigenous Youth Leading Climate Action",
            "description": "Hear from young Indigenous leaders who are combining traditional knowledge with modern science to protect the environment and drive climate solutions.",
            "videoUrl": "/video/climate-leaders-2025",
            "thumbnailUrl": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
            "tag": "Youth • Environment",
            "isFeatured": False,
            "external": False,
            "publishedAt": datetime.now(timezone.utc),
            "sourceName": "BANIBS TV"
        },
        {
            "title": "Grant Writing Workshop: Securing Funding for Your Vision",
            "description": "Expert grant writers break down the process of securing funding for community projects, nonprofits, and small businesses. Real examples and templates included.",
            "videoUrl": "/video/grant-workshop-2025",
            "thumbnailUrl": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
            "tag": "Opportunities • Education",
            "isFeatured": False,
            "external": False,
            "publishedAt": datetime.now(timezone.utc),
            "sourceName": "BANIBS TV"
        }
    ]
    
    # Convert to FeaturedMediaDB models
    media_models = [FeaturedMediaDB(**item) for item in media_items]
    
    # Insert into database
    media_dicts = [model.dict() for model in media_models]
    result = await collection.insert_many(media_dicts)
    
    print(f"✅ Successfully seeded {len(result.inserted_ids)} BANIBS TV media items")
    print(f"   - 1 item marked as featured (will appear on homepage)")
    print(f"   - {len(result.inserted_ids) - 1} additional items in library")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_media())
