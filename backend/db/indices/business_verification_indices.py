"""
Database Indices for Business Verification System
Performance optimization for verification queries
"""

import logging
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def create_business_verification_indices(db: AsyncIOMotorDatabase):
    """
    Create indices for business_verifications collection
    """
    collection = db.business_verifications
    
    # Business ID - Unique, primary lookup
    await collection.create_index("business_id", unique=True)
    logger.info("✅ Created unique index on business_id")
    
    # Verification Status - For admin queue filtering
    await collection.create_index("verification_status")
    logger.info("✅ Created index on verification_status")
    
    # Expiration Date - For cron job renewal checks
    await collection.create_index("expires_at")
    logger.info("✅ Created index on expires_at")
    
    # Owner User ID - For owner dashboard queries
    await collection.create_index("owner_user_id")
    logger.info("✅ Created index on owner_user_id")
    
    # Created At - For sorting by submission date
    await collection.create_index("created_at")
    logger.info("✅ Created index on created_at")
    
    # Compound index for admin queries (status + created_at)
    await collection.create_index([
        ("verification_status", 1),
        ("created_at", -1)
    ])
    logger.info("✅ Created compound index on (verification_status, created_at)")
    
    logger.info("✅ All business verification indices created successfully")
