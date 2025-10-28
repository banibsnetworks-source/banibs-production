from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Dict, Any, List
import os
import uuid
from datetime import datetime, timezone

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
banned_sources_collection = db.banned_sources

async def is_ip_banned(ip_hash: str) -> bool:
    """
    Check if an IP hash is banned
    
    Args:
        ip_hash: SHA-256 hash of IP address
    
    Returns:
        True if banned, False otherwise
    """
    banned = await banned_sources_collection.find_one({"ip_hash": ip_hash})
    return banned is not None

async def ban_ip_hash(ip_hash: str, reason: str) -> Dict[str, Any]:
    """
    Ban an IP hash
    
    Args:
        ip_hash: SHA-256 hash of IP address
        reason: Reason for ban
    
    Returns:
        Created ban record
    """
    # Check if already banned
    existing = await banned_sources_collection.find_one({"ip_hash": ip_hash})
    if existing:
        return existing
    
    ban_data = {
        'id': str(uuid.uuid4()),
        'ip_hash': ip_hash,
        'reason': reason,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await banned_sources_collection.insert_one(ban_data)
    return ban_data

async def get_all_banned_sources() -> List[Dict[str, Any]]:
    """
    Get all banned sources
    
    Returns:
        List of banned source records
    """
    banned = await banned_sources_collection.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=1000)
    
    return banned

async def unban_ip_hash(ip_hash: str) -> bool:
    """
    Unban an IP hash
    
    Args:
        ip_hash: SHA-256 hash of IP address
    
    Returns:
        True if unbanned, False if not found
    """
    result = await banned_sources_collection.delete_one({"ip_hash": ip_hash})
    return result.deleted_count > 0
