"""
BANIBS Infinite Circle Engine API Routes - Phase 9.1
Endpoints for graph queries and circle computations
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

from schemas.circle_engine import (
    CircleEdge,
    PeoplesOfPeoplesResponse,
    CircleDepthResponse,
    SharedCircleResponse,
    CircleReachScore,
    RefreshResponse
)
from db import circle_engine as ce_db
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/circle", tags=["circle-engine"])


@router.get("/{user_id}/edges", response_model=List[CircleEdge])
async def get_user_circle_edges(
    user_id: str,
    tier: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all circle edges for a user, optionally filtered by tier.
    
    Privacy: Only viewable by the user themselves (for now).
    """
    # Privacy check: only allow users to view their own edges
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own circle edges"
        )
    
    try:
        edges = await ce_db.get_circle_edges(user_id, tier)
        return edges
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch circle edges: {str(e)}"
        )


@router.get("/{user_id}/peoples", response_model=PeoplesOfPeoplesResponse)
async def get_peoples_of_peoples(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Peoples-of-Peoples (depth 2 traversal from PEOPLES tier).
    
    Shows second-degree connections through PEOPLES relationships.
    """
    # Privacy check
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own Peoples-of-Peoples"
        )
    
    try:
        result = await ce_db.get_circle_of_peoples(user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute Peoples-of-Peoples: {str(e)}"
        )


@router.get("/{user_id}/shared/{other_id}", response_model=SharedCircleResponse)
async def get_shared_circle(
    user_id: str,
    other_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get shared circle between two users.
    
    Shows mutual connections and overlap score.
    """
    # Privacy check: only if you're one of the two users
    if user_id != current_user["id"] and other_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view shared circles involving yourself"
        )
    
    try:
        result = await ce_db.get_shared_circle(user_id, other_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute shared circle: {str(e)}"
        )


@router.get("/{user_id}/depth/{level}", response_model=CircleDepthResponse)
async def get_circle_depth(
    user_id: str,
    level: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Multi-depth circle traversal.
    
    Args:
        level: Depth level (1, 2, or 3)
    """
    # Privacy check
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own circle depth"
        )
    
    if level < 1 or level > 3:
        raise HTTPException(
            status_code=400,
            detail="Depth level must be between 1 and 3"
        )
    
    try:
        result = await ce_db.get_circle_depth(user_id, depth=level)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute circle depth: {str(e)}"
        )


@router.get("/{user_id}/score", response_model=CircleReachScore)
async def get_user_reach_score(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's circle reach score.
    
    Calculates weighted score based on connections and depth.
    """
    # Privacy check
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own reach score"
        )
    
    try:
        result = await ce_db.get_circle_reach_score(user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute reach score: {str(e)}"
        )


@router.post("/refresh/{user_id}", response_model=RefreshResponse)
async def refresh_user_circle(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Refresh circle edges for a specific user.
    
    Rebuilds the user's circle graph from relationship data.
    """
    # Privacy check
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only refresh your own circle"
        )
    
    try:
        edges_count = await ce_db.refresh_circle_edges_for_user(user_id)
        return RefreshResponse(
            success=True,
            message=f"Circle refreshed successfully",
            edges_created=edges_count
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh circle: {str(e)}"
        )


@router.post("/refresh-all", response_model=RefreshResponse)
async def refresh_all_circles(
    current_user: dict = Depends(get_current_user)
):
    """
    Refresh circle edges for ALL users.
    
    WARNING: This is a heavy operation. Admin use only.
    """
    # TODO: Add admin-only check here
    # For now, any authenticated user can trigger (not ideal for production)
    
    try:
        stats = await ce_db.refresh_all_circle_edges()
        return RefreshResponse(
            success=True,
            message="All circles refreshed successfully",
            stats=stats
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh all circles: {str(e)}"
        )
