"""
Database Indices - Performance Optimization
Creates necessary indices for fast queries
"""

import logging
from db.connection import get_db

logger = logging.getLogger(__name__)


async def ensure_business_indices():
    """
    Ensure all necessary indices exist for BusinessProfiles collection
    Phase 8.2 - Performance optimization for geo search
    """
    db = await get_db()
    collection = db.business_profiles
    
    try:
        # 1. Geo index for location-based queries
        await collection.create_index([("latitude", 1), ("longitude", 1)])
        logger.info("✓ Created geo index on (latitude, longitude)")
        
        # 2. Category/industry for filtering
        await collection.create_index([("industry", 1)])
        logger.info("✓ Created index on industry")
        
        # 3. Status for active business filtering
        await collection.create_index([("status", 1)])
        logger.info("✓ Created index on status")
        
        # 4. Handle for URL lookups
        await collection.create_index([("handle", 1)], unique=True)
        logger.info("✓ Created unique index on handle")
        
        # 5. Owner for admin queries
        await collection.create_index([("owner_user_id", 1)])
        logger.info("✓ Created index on owner_user_id")
        
        # 6. City/State for location searches without coords
        await collection.create_index([("city", 1), ("state", 1)])
        logger.info("✓ Created index on (city, state)")
        
        # 7. Postal code for zip-based searches
        await collection.create_index([("postal_code", 1)])
        logger.info("✓ Created index on postal_code")
        
        # 8. Verification status for filtering
        await collection.create_index([("verified_status", 1)])
        logger.info("✓ Created index on verified_status")
        
        logger.info("✅ All business profile indices ensured")
        
    except Exception as e:
        logger.error(f"Error creating indices: {e}")


async def ensure_social_feed_indices():
    """
    Ensure indices for social feed performance
    """
    db = await get_db()
    posts_collection = db.posts
    
    try:
        # Posts by user (for profile feeds)
        await posts_collection.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("✓ Created index on (user_id, created_at)")
        
        # Global feed (recent posts)
        await posts_collection.create_index([("created_at", -1)])
        logger.info("✓ Created index on created_at")
        
        # Post visibility
        await posts_collection.create_index([("visibility", 1)])
        logger.info("✓ Created index on visibility")
        
        logger.info("✅ All social feed indices ensured")
        
    except Exception as e:
        logger.error(f"Error creating social feed indices: {e}")


async def ensure_peoples_room_indices():
    """
    Ensure indices for Peoples Room collections (MEGADROP V1)
    """
    from db.indices.peoples_room_indices import ensure_peoples_room_indices as create_indices
    await create_indices(await get_db())


async def ensure_all_indices():
    """
    Run all index creation functions
    Call this on app startup
    """
    await ensure_business_indices()
    await ensure_social_feed_indices()
    await ensure_peoples_room_indices()
