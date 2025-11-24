"""
BANIBS Circles - API Routes
Phase 11.5.3 - Support Groups
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timezone

from models.circles import (
    CirclesResponse,
    Circle,
    CircleMembersResponse,
    CirclePostsResponse
)
from db.circles import CirclesDB
from db.connection import get_db_client
from middleware.auth_guard import get_current_user as get_current_user_dependency

router = APIRouter(prefix="/api/circles", tags=["Circles - Support Groups"])


# ==================== CIRCLE ENDPOINTS ====================

@router.get("", response_model=CirclesResponse)
async def get_circles(
    pillar: Optional[str] = Query(None, description="Filter by pillar (ability, health, community)"),
    disability_type: Optional[str] = Query(None, description="Filter by disability type"),
    audience: Optional[str] = Query(None, description="Filter by audience (self, caregiver, both)"),
    featured_only: bool = Query(False, description="Only featured circles"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100, description="Max results")
):
    """Get support circles with filtering - Phase 11.5.3"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    # Parse tags
    tag_list = tags.split(',') if tags else None
    
    circles = await circles_db.get_circles(
        pillar=pillar,
        disability_type=disability_type,
        audience=audience,
        featured_only=featured_only,
        tags=tag_list,
        limit=limit
    )
    
    return {
        "circles": circles,
        "total": len(circles)
    }


@router.get("/suggested", response_model=CirclesResponse)
async def get_suggested_circles(
    disability_type: Optional[str] = Query(None, description="User's disability type"),
    audience: Optional[str] = Query(None, description="User's role (self/caregiver)"),
    limit: int = Query(5, le=10, description="Max results")
):
    """Get suggested circles based on user preferences"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    circles = await circles_db.get_suggested_circles(
        disability_type=disability_type,
        audience=audience,
        limit=limit
    )
    
    return {
        "circles": circles,
        "total": len(circles)
    }


@router.get("/{circle_id}", response_model=Circle)
async def get_circle(circle_id: str):
    """Get a specific circle by ID"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    circle = await circles_db.get_circle_by_id(circle_id)
    
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    return circle


@router.post("/{circle_id}/join")
async def join_circle(
    circle_id: str,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Request to join or join a circle"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    # Check if circle exists
    circle = await circles_db.get_circle_by_id(circle_id)
    
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if already a member
    existing_member = await circles_db.get_member(circle_id, current_user["id"])
    
    if existing_member:
        if existing_member["status"] == "active":
            raise HTTPException(status_code=400, detail="Already a member")
        elif existing_member["status"] == "pending":
            return {"success": True, "message": "Join request already pending", "status": "pending"}
    
    # Create membership
    status = "pending" if circle["privacy_level"] == "request_to_join" else "active"
    
    member = {
        "id": f"member-{uuid4().hex[:8]}",
        "circle_id": circle_id,
        "user_id": current_user["id"],
        "user_name": current_user.get("name", current_user.get("email", "User")),
        "role": "member",
        "status": status,
        "joined_at": datetime.now(timezone.utc)
    }
    
    await circles_db.circle_members.insert_one(member)
    
    # Increment member count if active
    if status == "active":
        await circles_db.increment_member_count(circle_id)
    
    return {
        "success": True,
        "message": "Joined successfully" if status == "active" else "Join request sent",
        "status": status
    }


@router.get("/{circle_id}/members", response_model=CircleMembersResponse)
async def get_circle_members(
    circle_id: str,
    limit: int = Query(50, le=100)
):
    """Get members of a circle (admin/moderator only in production)"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    members = await circles_db.get_circle_members(circle_id, limit=limit)
    
    return {
        "members": members,
        "total": len(members)
    }


@router.get("/{circle_id}/posts", response_model=CirclePostsResponse)
async def get_circle_posts(
    circle_id: str,
    limit: int = Query(20, le=50)
):
    """Get posts in a circle"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    posts = await circles_db.get_circle_posts(circle_id, limit=limit)
    
    return {
        "posts": posts,
        "total": len(posts)
    }
