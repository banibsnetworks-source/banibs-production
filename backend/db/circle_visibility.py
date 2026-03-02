"""
Circle Visibility V1 - Access Control Engine
Controls WHO can see posts based on circle membership and relationship tiers.
NOT a ranking/boost system - purely access control.
"""

import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Set
from db.connection import get_db


# Tier hierarchy for comparison (higher = more restrictive)
TIER_LEVELS = {
    "OTHERS": 0,
    "ALRIGHT": 1,
    "COOL": 2,
    "PEOPLES": 3
}


def is_enabled():
    """Check if Circle Visibility V1 feature is enabled"""
    return os.environ.get("CIRCLE_VISIBILITY_V1", "false").lower() == "true"


def tier_meets_minimum(viewer_tier: str, required_tier: str) -> bool:
    """
    Check if viewer's tier meets the minimum required tier.
    Higher tier = more access. PEOPLES > COOL > ALRIGHT > OTHERS
    """
    viewer_level = TIER_LEVELS.get(viewer_tier.upper(), 0)
    required_level = TIER_LEVELS.get(required_tier.upper(), 0)
    return viewer_level >= required_level


async def get_viewer_tier_for_author(author_id: str, viewer_id: str) -> str:
    """
    Get the relationship tier from author's perspective to viewer.
    This is ASYMMETRIC: we check how the AUTHOR classified the VIEWER.
    Returns 'OTHERS' if no relationship exists.
    """
    if author_id == viewer_id:
        return "PEOPLES"  # Author always has full access to own posts
    
    db = await get_db()
    
    # Check relationship: author -> viewer
    relationship = await db.relationships.find_one(
        {"owner_user_id": author_id, "target_user_id": viewer_id, "status": "ACTIVE"},
        {"_id": 0, "tier": 1}
    )
    
    if relationship and relationship.get("tier"):
        return relationship["tier"].upper()
    
    return "OTHERS"


async def get_user_circle_ids(user_id: str) -> Set[str]:
    """
    Get all circle IDs where user is an active member.
    """
    db = await get_db()
    
    memberships = await db.circle_members.find(
        {"user_id": user_id, "status": "active"},
        {"_id": 0, "circle_id": 1}
    ).to_list(1000)
    
    return {m["circle_id"] for m in memberships if m.get("circle_id")}


async def is_circle_active(circle_id: str) -> bool:
    """Check if circle exists and is active (not expired)"""
    db = await get_db()
    
    circle = await db.circles.find_one(
        {"id": circle_id},
        {"_id": 0, "is_active": 1, "expires_at": 1}
    )
    
    if not circle:
        return False
    
    if not circle.get("is_active", True):
        return False
    
    # Check expiration
    if circle.get("expires_at"):
        if circle["expires_at"] < datetime.now(timezone.utc):
            return False
    
    return True


async def is_user_circle_member(user_id: str, circle_id: str) -> bool:
    """Check if user is an active member of a circle"""
    db = await get_db()
    
    membership = await db.circle_members.find_one(
        {"user_id": user_id, "circle_id": circle_id, "status": "active"},
        {"_id": 0, "id": 1}
    )
    
    return membership is not None


async def get_circle_name(circle_id: str) -> Optional[str]:
    """Get circle name for display"""
    db = await get_db()
    
    circle = await db.circles.find_one(
        {"id": circle_id},
        {"_id": 0, "name": 1}
    )
    
    return circle.get("name") if circle else None


async def can_view_post(post: dict, viewer_id: str) -> bool:
    """
    Determine if viewer can see a specific post.
    
    Rules:
    1. Author can always view own posts
    2. If post expired, exclude
    3. For GLOBAL posts: everyone can view (subject to tier)
    4. For CIRCLE posts: must be circle member
    5. Tier gate: viewer's tier (from author's POV) must meet min_tier_to_view
    """
    author_id = post.get("author_id")
    
    # Rule 1: Author always has access
    if author_id == viewer_id:
        return True
    
    # Rule 2: Check expiration
    expires_at = post.get("expires_at")
    if expires_at and expires_at < datetime.now(timezone.utc):
        return False
    
    target_type = post.get("target_type", "GLOBAL")
    target_circle_id = post.get("target_circle_id")
    
    # Rule 3 & 4: Circle membership check
    if target_type == "CIRCLE" and target_circle_id:
        # Circle must be active
        if not await is_circle_active(target_circle_id):
            return False
        
        # Viewer must be member
        if not await is_user_circle_member(viewer_id, target_circle_id):
            return False
    
    # Rule 5: Tier gate check
    min_tier = post.get("min_tier_to_view", "OTHERS")
    viewer_tier = await get_viewer_tier_for_author(author_id, viewer_id)
    
    if not tier_meets_minimum(viewer_tier, min_tier):
        return False
    
    return True


async def batch_get_viewer_tiers(author_ids: List[str], viewer_id: str) -> Dict[str, str]:
    """
    Batch fetch relationship tiers for multiple authors.
    Returns map of author_id -> tier (defaults to OTHERS).
    """
    if not author_ids:
        return {}
    
    db = await get_db()
    
    # Initialize all as OTHERS
    tier_map = {aid: "OTHERS" for aid in author_ids}
    
    # Self always has PEOPLES access
    if viewer_id in tier_map:
        tier_map[viewer_id] = "PEOPLES"
    
    # Batch query relationships
    relationships = await db.relationships.find(
        {
            "owner_user_id": {"$in": author_ids},
            "target_user_id": viewer_id,
            "status": "ACTIVE"
        },
        {"_id": 0, "owner_user_id": 1, "tier": 1}
    ).to_list(len(author_ids))
    
    for rel in relationships:
        owner = rel.get("owner_user_id")
        tier = rel.get("tier", "OTHERS")
        if owner:
            tier_map[owner] = tier.upper()
    
    return tier_map


async def filter_posts_for_viewer(posts: List[dict], viewer_id: str) -> List[dict]:
    """
    Filter a list of posts based on visibility rules.
    Optimized with batch tier lookups.
    """
    if not posts:
        return []
    
    now = datetime.now(timezone.utc)
    
    # Get viewer's circle memberships
    viewer_circles = await get_user_circle_ids(viewer_id)
    
    # Collect unique author IDs for batch tier lookup
    author_ids = list({p.get("author_id") for p in posts if p.get("author_id")})
    tier_map = await batch_get_viewer_tiers(author_ids, viewer_id)
    
    visible_posts = []
    
    for post in posts:
        author_id = post.get("author_id")
        
        # Author always sees own posts
        if author_id == viewer_id:
            visible_posts.append(post)
            continue
        
        # Check expiration
        expires_at = post.get("expires_at")
        if expires_at and expires_at < now:
            continue
        
        target_type = post.get("target_type", "GLOBAL")
        target_circle_id = post.get("target_circle_id")
        
        # Circle membership check
        if target_type == "CIRCLE" and target_circle_id:
            if target_circle_id not in viewer_circles:
                continue
        
        # Tier gate check
        min_tier = post.get("min_tier_to_view", "OTHERS")
        viewer_tier = tier_map.get(author_id, "OTHERS")
        
        if not tier_meets_minimum(viewer_tier, min_tier):
            continue
        
        visible_posts.append(post)
    
    return visible_posts


async def ensure_indexes():
    """Create required indexes for circle visibility queries"""
    db = await get_db()
    
    # Index for circle-targeted posts
    await db.social_posts.create_index(
        [("target_type", 1), ("target_circle_id", 1), ("created_at", -1)],
        background=True
    )
    
    # Sparse index for expiration TTL
    await db.social_posts.create_index(
        [("expires_at", 1)],
        sparse=True,
        background=True
    )
    
    # Index for circles expiration
    await db.circles.create_index(
        [("expires_at", 1)],
        sparse=True,
        background=True
    )
    
    print("Circle Visibility V1 indexes created")
