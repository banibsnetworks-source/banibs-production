"""
BANIBS Infinite Circle Engine - Phase 9.1
Database operations for the trust graph and multi-hop circle detection
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import List, Dict, Optional
import logging

from db.connection import get_db
from db.relationships import (
    get_all_relationships,
    TIER_PEOPLES,
    TIER_COOL,
    TIER_ALRIGHT,
    TIER_OTHERS,
    STATUS_ACTIVE
)

logger = logging.getLogger(__name__)

# Circle Trust Order - 7-Tier Weights (MEGADROP V1)
# Import CHILL and OTHERS_SAFE_MODE from relationships
from db.relationships import TIER_CHILL, TIER_OTHERS_SAFE_MODE, TIER_BLOCKED

# Graph weights for tier scoring
WEIGHT_PEOPLES = 100
WEIGHT_COOL = 75
WEIGHT_CHILL = 50
WEIGHT_ALRIGHT = 25
WEIGHT_OTHERS = 5
WEIGHT_OTHERS_SAFE_MODE = 0
WEIGHT_BLOCKED = -100  # Negative weight breaks connections

TIER_WEIGHTS = {
    TIER_PEOPLES: WEIGHT_PEOPLES,
    TIER_COOL: WEIGHT_COOL,
    TIER_CHILL: WEIGHT_CHILL,
    TIER_ALRIGHT: WEIGHT_ALRIGHT,
    TIER_OTHERS: WEIGHT_OTHERS,
    TIER_OTHERS_SAFE_MODE: WEIGHT_OTHERS_SAFE_MODE,
    TIER_BLOCKED: WEIGHT_BLOCKED
}


async def refresh_circle_edges_for_user(user_id: str) -> int:
    """
    Refresh circle_edges collection for a specific user.
    Reads from relationships collection and builds weighted edges.
    
    Returns:
        Number of edges created/updated
    """
    db = await get_db()
    
    # Get all active relationships for this user
    relationships = await get_all_relationships(
        owner_user_id=user_id,
        status=STATUS_ACTIVE
    )
    
    # Delete existing edges for this user
    await db.circle_edges.delete_many({"ownerUserId": user_id})
    
    # Build new edges
    edges = []
    for rel in relationships:
        tier = rel.get("tier", TIER_OTHERS)
        weight = TIER_WEIGHTS.get(tier, WEIGHT_OTHERS)
        
        edge = {
            "ownerUserId": user_id,
            "targetUserId": rel["target_user_id"],
            "tier": tier,
            "weight": weight,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        edges.append(edge)
    
    # Insert edges
    if edges:
        await db.circle_edges.insert_many(edges)
    
    # Update graph meta
    await update_circle_graph_meta(user_id)
    
    return len(edges)


async def refresh_all_circle_edges() -> Dict[str, int]:
    """
    Refresh circle_edges for ALL users in the system.
    WARNING: This is a heavy operation. Use sparingly.
    
    Returns:
        Statistics about the refresh operation
    """
    db = await get_db()
    
    # Get all unique user IDs from relationships
    pipeline = [
        {"$group": {"_id": "$owner_user_id"}},
        {"$project": {"user_id": "$_id"}}
    ]
    
    users = await db.relationships.aggregate(pipeline).to_list(10000)
    
    total_users = len(users)
    total_edges = 0
    errors = 0
    
    for user_doc in users:
        user_id = user_doc["_id"]
        try:
            edges_count = await refresh_circle_edges_for_user(user_id)
            total_edges += edges_count
        except Exception as e:
            logger.error(f"Error refreshing edges for user {user_id}: {e}")
            errors += 1
    
    return {
        "total_users": total_users,
        "total_edges": total_edges,
        "errors": errors
    }


async def get_circle_edges(user_id: str, tier: Optional[str] = None) -> List[Dict]:
    """
    Get all circle edges for a user, optionally filtered by tier.
    
    Args:
        user_id: The user whose edges to retrieve
        tier: Optional tier filter (PEOPLES, COOL, ALRIGHT, OTHERS)
    
    Returns:
        List of edge documents
    """
    db = await get_db()
    
    query = {"ownerUserId": user_id}
    if tier:
        query["tier"] = tier
    
    edges = await db.circle_edges.find(query, {"_id": 0}).to_list(1000)
    return edges


async def get_circle_of_peoples(user_id: str) -> Dict:
    """
    Get Peoples-of-Peoples (depth 2 traversal from PEOPLES tier only).
    
    This finds:
    1. All direct PEOPLES connections
    2. All PEOPLES connections of those connections
    3. Excludes the original user and direct connections
    
    Returns:
        {
            "direct_peoples": [...],
            "peoples_of_peoples": [
                {
                    "user_id": "...",
                    "mutual_count": 2,
                    "mutual_peoples": ["...", "..."]
                }
            ]
        }
    """
    db = await get_db()
    
    # Get direct PEOPLES
    direct_peoples_edges = await db.circle_edges.find(
        {
            "ownerUserId": user_id,
            "tier": TIER_PEOPLES
        },
        {"_id": 0}
    ).to_list(1000)
    
    direct_peoples_ids = [edge["targetUserId"] for edge in direct_peoples_edges]
    
    # Get PEOPLES-of-PEOPLES (second hop)
    peoples_of_peoples_map = {}
    
    for peoples_id in direct_peoples_ids:
        # Get this person's PEOPLES
        their_peoples = await db.circle_edges.find(
            {
                "ownerUserId": peoples_id,
                "tier": TIER_PEOPLES
            },
            {"_id": 0}
        ).to_list(1000)
        
        for edge in their_peoples:
            target_id = edge["targetUserId"]
            
            # Exclude self and direct connections
            if target_id == user_id or target_id in direct_peoples_ids:
                continue
            
            # Track mutual connections
            if target_id not in peoples_of_peoples_map:
                peoples_of_peoples_map[target_id] = {
                    "user_id": target_id,
                    "mutual_count": 0,
                    "mutual_peoples": []
                }
            
            peoples_of_peoples_map[target_id]["mutual_count"] += 1
            peoples_of_peoples_map[target_id]["mutual_peoples"].append(peoples_id)
    
    # Convert to list and sort by mutual_count
    peoples_of_peoples = sorted(
        peoples_of_peoples_map.values(),
        key=lambda x: x["mutual_count"],
        reverse=True
    )
    
    return {
        "direct_peoples": direct_peoples_edges,
        "peoples_of_peoples": peoples_of_peoples
    }


async def get_circle_depth(user_id: str, depth: int = 2) -> Dict:
    """
    Multi-depth circle traversal.
    
    Args:
        user_id: Starting user
        depth: How many hops to traverse (1, 2, or 3)
    
    Returns:
        {
            "depth_1": [...],  # Direct connections
            "depth_2": [...],  # Second-hop connections
            "depth_3": [...]   # Third-hop connections (if depth=3)
        }
    """
    db = await get_db()
    
    if depth < 1 or depth > 3:
        raise ValueError("Depth must be between 1 and 3")
    
    result = {}
    visited = {user_id}
    
    # Depth 1: Direct connections
    depth_1_edges = await db.circle_edges.find(
        {"ownerUserId": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    result["depth_1"] = depth_1_edges
    depth_1_ids = [e["targetUserId"] for e in depth_1_edges]
    visited.update(depth_1_ids)
    
    if depth >= 2:
        # Depth 2: Connections of connections
        depth_2_edges = []
        for user_id_d1 in depth_1_ids:
            edges = await db.circle_edges.find(
                {"ownerUserId": user_id_d1},
                {"_id": 0}
            ).to_list(1000)
            
            for edge in edges:
                if edge["targetUserId"] not in visited:
                    depth_2_edges.append(edge)
                    visited.add(edge["targetUserId"])
        
        result["depth_2"] = depth_2_edges
        depth_2_ids = [e["targetUserId"] for e in depth_2_edges]
    
    if depth >= 3:
        # Depth 3: Third-hop connections
        depth_3_edges = []
        for user_id_d2 in depth_2_ids:
            edges = await db.circle_edges.find(
                {"ownerUserId": user_id_d2},
                {"_id": 0}
            ).to_list(1000)
            
            for edge in edges:
                if edge["targetUserId"] not in visited:
                    depth_3_edges.append(edge)
                    visited.add(edge["targetUserId"])
        
        result["depth_3"] = depth_3_edges
    
    return result


async def get_shared_circle(user_id: str, other_id: str) -> Dict:
    """
    Get shared circle between two users.
    
    Returns:
        {
            "shared_peoples": [...],
            "shared_cool": [...],
            "shared_alright": [...],
            "overlap_score": 0.75
        }
    """
    db = await get_db()
    
    # Get both users' edges
    user_edges = await db.circle_edges.find(
        {"ownerUserId": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    other_edges = await db.circle_edges.find(
        {"ownerUserId": other_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Build sets by tier
    user_peoples = {e["targetUserId"] for e in user_edges if e["tier"] == TIER_PEOPLES}
    user_cool = {e["targetUserId"] for e in user_edges if e["tier"] == TIER_COOL}
    user_alright = {e["targetUserId"] for e in user_edges if e["tier"] == TIER_ALRIGHT}
    
    other_peoples = {e["targetUserId"] for e in other_edges if e["tier"] == TIER_PEOPLES}
    other_cool = {e["targetUserId"] for e in other_edges if e["tier"] == TIER_COOL}
    other_alright = {e["targetUserId"] for e in other_edges if e["tier"] == TIER_ALRIGHT}
    
    # Calculate intersections
    shared_peoples = list(user_peoples & other_peoples)
    shared_cool = list(user_cool & other_cool)
    shared_alright = list(user_alright & other_alright)
    
    # Calculate overlap score
    total_user = len(user_peoples) + len(user_cool) + len(user_alright)
    total_other = len(other_peoples) + len(other_cool) + len(other_alright)
    total_shared = len(shared_peoples) + len(shared_cool) + len(shared_alright)
    
    overlap_score = 0.0
    if total_user > 0 and total_other > 0:
        overlap_score = total_shared / ((total_user + total_other) / 2)
    
    return {
        "shared_peoples": shared_peoples,
        "shared_cool": shared_cool,
        "shared_alright": shared_alright,
        "overlap_score": round(overlap_score, 3)
    }


async def get_circle_reach_score(user_id: str) -> Dict:
    """
    Calculate a user's circle reach score based on:
    - Direct connections weighted by tier
    - Peoples-of-Peoples count
    - Group memberships
    
    Returns:
        {
            "total_score": 450,
            "direct_score": 300,
            "depth_2_score": 150,
            "breakdown": {...}
        }
    """
    db = await get_db()
    
    # Get direct edges and calculate score
    edges = await db.circle_edges.find(
        {"ownerUserId": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    direct_score = sum(e["weight"] for e in edges)
    
    # Get Peoples-of-Peoples
    pop_data = await get_circle_of_peoples(user_id)
    depth_2_count = len(pop_data["peoples_of_peoples"])
    depth_2_score = depth_2_count * 10  # Each PoP connection worth 10 points
    
    # Breakdown by tier
    tier_counts = {}
    for edge in edges:
        tier = edge["tier"]
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
    
    total_score = direct_score + depth_2_score
    
    return {
        "total_score": total_score,
        "direct_score": direct_score,
        "depth_2_score": depth_2_score,
        "breakdown": {
            "tier_counts": tier_counts,
            "peoples_of_peoples_count": depth_2_count
        }
    }


async def update_circle_graph_meta(user_id: str):
    """
    Update or create circle_graph_meta entry for a user.
    Stores aggregate stats for fast lookup.
    """
    db = await get_db()
    
    # Get edges and count by tier
    edges = await db.circle_edges.find(
        {"ownerUserId": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    peoples_count = sum(1 for e in edges if e["tier"] == TIER_PEOPLES)
    cool_count = sum(1 for e in edges if e["tier"] == TIER_COOL)
    alright_count = sum(1 for e in edges if e["tier"] == TIER_ALRIGHT)
    others_count = sum(1 for e in edges if e["tier"] == TIER_OTHERS)
    
    # Upsert meta document
    await db.circle_graph_meta.update_one(
        {"userId": user_id},
        {
            "$set": {
                "userId": user_id,
                "peoplesCount": peoples_count,
                "coolCount": cool_count,
                "alrightCount": alright_count,
                "othersCount": others_count,
                "updatedAt": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
