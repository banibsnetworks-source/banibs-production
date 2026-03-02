"""
Circle Visibility V1 - Background Tasks
Handles ephemeral circle expiration and cleanup.
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# Task interval in seconds (default: 5 minutes)
CLEANUP_INTERVAL = int(os.environ.get("CIRCLE_CLEANUP_INTERVAL", "300"))


async def expire_circles_task():
    """
    Background task to mark expired circles as inactive.
    Runs periodically to handle TTL-based circle expiration.
    
    Does NOT delete data - only sets is_active=false for compliance safety.
    """
    from db.connection import get_db
    
    while True:
        try:
            db = await get_db()
            now = datetime.now(timezone.utc)
            
            # Find and update expired circles
            result = await db.circles.update_many(
                {
                    "is_active": True,
                    "expires_at": {"$lt": now, "$ne": None}
                },
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": now
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"[CircleExpiry] Marked {result.modified_count} circles as inactive")
            
        except Exception as e:
            print(f"[CircleExpiry] Error: {e}")
        
        # Sleep until next check
        await asyncio.sleep(CLEANUP_INTERVAL)


def start_background_tasks():
    """Start all circle visibility background tasks"""
    from db import circle_visibility as cv
    
    if not cv.is_enabled():
        print("[CircleVisibility] Feature disabled, skipping background tasks")
        return
    
    asyncio.create_task(expire_circles_task())
    print(f"[CircleVisibility] Background tasks started (interval: {CLEANUP_INTERVAL}s)")
