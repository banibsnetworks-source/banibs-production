"""
BANIBS Relationship Database Operations - Phase 8.1
Handles Peoples / Cool / Alright / Others relationship tiers
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import uuid

from db.connection import get_db


# Circle Trust Order - 7 Tiers (MEGADROP V1)
# Ordered from closest (highest trust) to most distant (no trust)
TIER_PEOPLES = "PEOPLES"              # Tier 1: Closest, highest trust
TIER_COOL = "COOL"                    # Tier 2: Trusted friends
TIER_CHILL = "CHILL"                  # Tier 3: Acquaintances
TIER_ALRIGHT = "ALRIGHT"              # Tier 4: Casual connections
TIER_OTHERS = "OTHERS"                # Tier 5: Default/strangers
TIER_OTHERS_SAFE_MODE = "OTHERS_SAFE_MODE"  # Tier 6: Limited interaction
TIER_BLOCKED = "BLOCKED"              # Tier 7: No interaction

VALID_TIERS = [
    TIER_PEOPLES,
    TIER_COOL,
    TIER_CHILL,
    TIER_ALRIGHT,
    TIER_OTHERS,
    TIER_OTHERS_SAFE_MODE,
    TIER_BLOCKED
]

# Trust tier weights (for Circle Engine scoring)
TIER_WEIGHTS = {
    TIER_PEOPLES: 100,
    TIER_COOL: 75,
    TIER_CHILL: 50,
    TIER_ALRIGHT: 25,
    TIER_OTHERS: 5,
    TIER_OTHERS_SAFE_MODE: 0,
    TIER_BLOCKED: -100  # Negative weight breaks connections
}

# Relationship Status (separate from tier)
# Note: BLOCKED is now a tier, not a status
STATUS_ACTIVE = "ACTIVE"
STATUS_PENDING = "PENDING"

VALID_STATUSES = [STATUS_ACTIVE, STATUS_PENDING]


async def create_or_update_relationship(
    owner_user_id: str,
    target_user_id: str,
    tier: str,
    status: str = STATUS_ACTIVE
):
    """
    Create or update a relationship between two users.
    
    Args:
        owner_user_id: The user making the classification
        target_user_id: The user being classified
        tier: One of OTHERS, ALRIGHT, COOL, PEOPLES
        status: One of ACTIVE, PENDING, BLOCKED
    
    Returns:
        The relationship document
    """
    if tier not in VALID_TIERS:
        raise ValueError(f"Invalid tier: {tier}. Must be one of {VALID_TIERS}")
    
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {status}. Must be one of {VALID_STATUSES}")
    
    db = await get_db()
    
    # Check if relationship already exists
    existing = await db.relationships.find_one({
        "owner_user_id": owner_user_id,
        "target_user_id": target_user_id
    })
    
    now = datetime.now(timezone.utc)
    
    if existing:
        # Update existing relationship
        await db.relationships.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "tier": tier,
                    "status": status,
                    "updated_at": now
                }
            }
        )
        # Return updated document
        return await db.relationships.find_one({"_id": existing["_id"]}, {"_id": 0})
    else:
        # Create new relationship
        relationship = {
            "id": str(uuid.uuid4()),
            "owner_user_id": owner_user_id,
            "target_user_id": target_user_id,
            "tier": tier,
            "status": status,
            "created_at": now,
            "updated_at": now
        }
        
        await db.relationships.insert_one(relationship)
        return relationship


async def get_relationship(owner_user_id: str, target_user_id: str) -> Optional[dict]:
    """
    Get the relationship between owner and target user.
    Returns None if no relationship exists (implying OTHERS tier).
    """
    db = await get_db()
    relationship = await db.relationships.find_one(
        {
            "owner_user_id": owner_user_id,
            "target_user_id": target_user_id
        },
        {"_id": 0}
    )
    return relationship


async def get_all_relationships(
    owner_user_id: str,
    tier: Optional[str] = None,
    status: Optional[str] = None
) -> List[dict]:
    """
    Get all relationships for a user, optionally filtered by tier or status.
    """
    db = await get_db()
    
    query = {"owner_user_id": owner_user_id}
    
    if tier:
        if tier not in VALID_TIERS:
            raise ValueError(f"Invalid tier: {tier}")
        query["tier"] = tier
    
    if status:
        if status not in VALID_STATUSES:
            raise ValueError(f"Invalid status: {status}")
        query["status"] = status
    
    relationships = await db.relationships.find(query, {"_id": 0}).to_list(1000)
    return relationships


async def block_user(owner_user_id: str, target_user_id: str):
    """
    Block a user. Creates or updates relationship with BLOCKED tier.
    """
    return await create_or_update_relationship(
        owner_user_id=owner_user_id,
        target_user_id=target_user_id,
        tier=TIER_BLOCKED,
        status=STATUS_ACTIVE
    )


async def unblock_user(owner_user_id: str, target_user_id: str):
    """
    Unblock a user. Sets status back to ACTIVE.
    """
    db = await get_db()
    
    relationship = await get_relationship(owner_user_id, target_user_id)
    if not relationship:
        raise ValueError("No relationship found to unblock")
    
    await db.relationships.update_one(
        {
            "owner_user_id": owner_user_id,
            "target_user_id": target_user_id
        },
        {
            "$set": {
                "status": STATUS_ACTIVE,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return await get_relationship(owner_user_id, target_user_id)


async def delete_relationship(owner_user_id: str, target_user_id: str):
    """
    Delete a relationship (reset to OTHERS / no relationship).
    """
    db = await get_db()
    
    result = await db.relationships.delete_one({
        "owner_user_id": owner_user_id,
        "target_user_id": target_user_id
    })
    
    return result.deleted_count > 0


async def get_relationship_counts(owner_user_id: str) -> dict:
    """
    Get counts of relationships by tier for a user.
    
    Returns:
        {
            "peoples": 5,
            "cool": 12,
            "alright": 8,
            "blocked": 2
        }
    """
    db = await get_db()
    
    pipeline = [
        {
            "$match": {
                "owner_user_id": owner_user_id,
                "status": STATUS_ACTIVE
            }
        },
        {
            "$group": {
                "_id": "$tier",
                "count": {"$sum": 1}
            }
        }
    ]
    
    results = await db.relationships.aggregate(pipeline).to_list(10)
    
    counts = {
        "peoples": 0,
        "cool": 0,
        "alright": 0,
        "others": 0
    }
    
    for result in results:
        tier = result["_id"].lower()
        counts[tier] = result["count"]
    
    # Get blocked count separately
    blocked_count = await db.relationships.count_documents({
        "owner_user_id": owner_user_id,
        "status": STATUS_BLOCKED
    })
    counts["blocked"] = blocked_count
    
    return counts


async def search_relationships(
    owner_user_id: str,
    search_query: str,
    tier: Optional[str] = None
) -> List[dict]:
    """
    Search relationships by target user's name/handle.
    Joins with unified_users collection to get user details.
    """
    db = await get_db()
    
    # First get relationships
    rel_query = {"owner_user_id": owner_user_id}
    if tier:
        rel_query["tier"] = tier
    
    relationships = await db.relationships.find(rel_query, {"_id": 0}).to_list(1000)
    
    if not relationships:
        return []
    
    # Get target user IDs
    target_ids = [rel["target_user_id"] for rel in relationships]
    
    # Search users
    users = await db.unified_users.find(
        {
            "id": {"$in": target_ids},
            "$or": [
                {"display_name": {"$regex": search_query, "$options": "i"}},
                {"handle": {"$regex": search_query, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).to_list(100)
    
    # Combine relationship data with user data
    user_map = {user["id"]: user for user in users}
    
    results = []
    for rel in relationships:
        user = user_map.get(rel["target_user_id"])
        if user:
            results.append({
                **rel,
                "user": user
            })
    
    return results
