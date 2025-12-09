"""
Relationship Helper Service
Provides utilities for resolving trust tiers and managing relationships
Phase B: Circle Trust Order Enforcement
"""

from typing import Optional, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db
from db.relationships import TIER_OTHERS, TIER_BLOCKED, VALID_TIERS, TIER_WEIGHTS
from services.trust_logger import get_trust_logger

logger = logging.getLogger(__name__)


async def get_relationship_tier(
    viewer_id: str,
    target_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> str:
    """
    Get the trust tier that viewer_id has assigned to target_id.
    
    Args:
        viewer_id: The user viewing/acting
        target_id: The user being viewed/acted upon
        db: Database connection (optional, will fetch if not provided)
    
    Returns:
        Trust tier string (PEOPLES, COOL, CHILL, ALRIGHT, OTHERS, OTHERS_SAFE_MODE, BLOCKED)
        Defaults to OTHERS if no relationship exists
    """
    if viewer_id == target_id:
        # Self-relationship is always PEOPLES
        return "PEOPLES"
    
    if db is None:
        db = await get_db()
    
    relationship = await db.relationships.find_one(
        {
            "owner_user_id": viewer_id,
            "target_user_id": target_id
        },
        {"_id": 0, "tier": 1}
    )
    
    if relationship and "tier" in relationship:
        return relationship["tier"]
    
    # Default to OTHERS if no relationship exists
    return TIER_OTHERS


async def get_mutual_tiers(
    user_a_id: str,
    user_b_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Tuple[str, str]:
    """
    Get both directions of trust tier between two users.
    
    Args:
        user_a_id: First user
        user_b_id: Second user
        db: Database connection (optional)
    
    Returns:
        Tuple of (a_to_b_tier, b_to_a_tier)
    """
    if db is None:
        db = await get_db()
    
    a_to_b = await get_relationship_tier(user_a_id, user_b_id, db)
    b_to_a = await get_relationship_tier(user_b_id, user_a_id, db)
    
    return (a_to_b, b_to_a)


async def check_mutual_tier(
    user_a_id: str,
    user_b_id: str,
    tier: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if both users have each other at the specified tier.
    
    Args:
        user_a_id: First user
        user_b_id: Second user
        tier: The tier to check (e.g., "PEOPLES")
        db: Database connection (optional)
    
    Returns:
        True if both users have each other at the specified tier
    """
    a_to_b, b_to_a = await get_mutual_tiers(user_a_id, user_b_id, db)
    return a_to_b == tier and b_to_a == tier


async def check_mutual_peoples(
    user_a_id: str,
    user_b_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if both users have each other in PEOPLES tier.
    
    This is a special case (Founder Rule A) - mutual PEOPLES overrides all restrictions.
    
    Args:
        user_a_id: First user
        user_b_id: Second user
        db: Database connection (optional)
    
    Returns:
        True if mutual PEOPLES relationship exists
    """
    return await check_mutual_tier(user_a_id, user_b_id, "PEOPLES", db)


def calculate_tier_distance(tier_a: str, tier_b: str) -> int:
    """
    Calculate the "distance" between two tiers based on their weights.
    
    Used for detecting anomalous tier jumps (Founder Rule B).
    
    Args:
        tier_a: Starting tier
        tier_b: Ending tier
    
    Returns:
        Absolute difference in tier positions (0-6)
    """
    tier_order = [
        "PEOPLES",      # 0
        "COOL",         # 1
        "CHILL",        # 2
        "ALRIGHT",      # 3
        "OTHERS",       # 4
        "OTHERS_SAFE_MODE",  # 5
        "BLOCKED"       # 6
    ]
    
    try:
        pos_a = tier_order.index(tier_a)
        pos_b = tier_order.index(tier_b)
        return abs(pos_a - pos_b)
    except ValueError:
        # Invalid tier
        return 0


async def log_tier_change(
    user_id: str,
    target_id: str,
    old_tier: Optional[str],
    new_tier: str,
    db: Optional[AsyncIOMotorDatabase] = None
):
    """
    Log a tier change and detect anomalies (Founder Rule B).
    
    If the tier jump is >2 levels, log as an anomaly for future ADCS integration.
    
    Args:
        user_id: User making the tier change
        target_id: User whose tier is being changed
        old_tier: Previous tier (None if first assignment)
        new_tier: New tier
        db: Database connection (optional)
    """
    trust_logger = get_trust_logger()
    
    # If no previous tier, default to OTHERS
    if old_tier is None:
        old_tier = TIER_OTHERS
    
    # Calculate tier distance
    distance = calculate_tier_distance(old_tier, new_tier)
    
    # Founder Rule B: Log anomalies for tier jumps >2 levels
    if distance > 2:
        logger.warning(
            f"[TIER ANOMALY] User {user_id} changed {target_id} from {old_tier} to {new_tier} "
            f"(distance: {distance} levels) - Logged for ADCS review"
        )
        
        trust_logger.log_permission_check(
            check_type="tier_change",
            viewer_tier=new_tier,
            target_tier=old_tier,
            action="tier_change_anomaly",
            decision="log_only",
            details={
                "user_id": user_id,
                "target_id": target_id,
                "old_tier": old_tier,
                "new_tier": new_tier,
                "distance": distance,
                "reason": f"Tier jump >{2} levels - flagged for ADCS"
            }
        )
    else:
        # Normal tier change - info log
        logger.info(
            f"[TIER CHANGE] User {user_id} changed {target_id} from {old_tier} to {new_tier}"
        )


async def is_user_blocked(
    viewer_id: str,
    target_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if viewer has blocked target OR if target has blocked viewer.
    
    Bidirectional blocking - either direction blocks interaction.
    
    Args:
        viewer_id: The user checking
        target_id: The user being checked
        db: Database connection (optional)
    
    Returns:
        True if either user has blocked the other
    """
    viewer_tier = await get_relationship_tier(viewer_id, target_id, db)
    target_tier = await get_relationship_tier(target_id, viewer_id, db)
    
    return viewer_tier == TIER_BLOCKED or target_tier == TIER_BLOCKED


async def get_dm_thread_exists(
    user_a_id: str,
    user_b_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if a DM conversation already exists between two users.
    
    Used for tier-change behavior: existing threads remain visible even if tier changes.
    
    Args:
        user_a_id: First user
        user_b_id: Second user
        db: Database connection (optional)
    
    Returns:
        True if a DM conversation exists between these users
    """
    if db is None:
        db = await get_db()
    
    # Find DM conversation with both users as participants
    conversation = await db.messaging_conversations.find_one(
        {
            "type": "dm",
            "participant_ids": {
                "$all": [user_a_id, user_b_id]
            }
        },
        {"_id": 0, "id": 1}
    )
    
    return conversation is not None
