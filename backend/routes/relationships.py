"""
BANIBS Relationship API Routes - Phase 8.1
Handles Peoples / Cool / Alright / Others relationship management
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from schemas.relationship import (
    RelationshipCreate,
    RelationshipRead,
    RelationshipWithUser,
    RelationshipCounts,
    BlockRequest,
    UnblockRequest
)
from db import relationships as rel_db
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/relationships", tags=["relationships"])


@router.get("/", response_model=List[RelationshipRead])
async def list_relationships(
    tier: Optional[str] = Query(None, description="Filter by tier: PEOPLES, COOL, ALRIGHT, OTHERS"),
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, PENDING, BLOCKED"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all relationships for the current user.
    Optionally filter by tier or status.
    """
    try:
        relationships = await rel_db.get_all_relationships(
            owner_user_id=current_user["id"],
            tier=tier,
            status=status
        )
        return relationships
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch relationships: {str(e)}")


@router.get("/counts", response_model=RelationshipCounts)
async def get_relationship_counts(
    current_user: dict = Depends(get_current_user)
):
    """
    Get counts of relationships by tier for the current user.
    """
    try:
        counts = await rel_db.get_relationship_counts(owner_user_id=current_user["id"])
        return counts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch counts: {str(e)}")


@router.get("/search", response_model=List[RelationshipWithUser])
async def search_relationships(
    query: str = Query(..., min_length=1, description="Search query for user name/handle"),
    tier: Optional[str] = Query(None, description="Filter by tier"),
    current_user: dict = Depends(get_current_user)
):
    """
    Search relationships by user name or handle.
    Returns relationships with user details attached.
    """
    try:
        results = await rel_db.search_relationships(
            owner_user_id=current_user["id"],
            search_query=query,
            tier=tier
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/{target_user_id}", response_model=RelationshipRead)
async def get_relationship(
    target_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get relationship with a specific user.
    Returns 404 if no relationship exists (implicit OTHERS).
    """
    try:
        relationship = await rel_db.get_relationship(
            owner_user_id=current_user["id"],
            target_user_id=target_user_id
        )
        
        if not relationship:
            raise HTTPException(
                status_code=404,
                detail="No relationship found. User is implicitly in OTHERS tier."
            )
        
        return relationship
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch relationship: {str(e)}")


@router.post("/", response_model=RelationshipRead)
async def create_or_update_relationship(
    payload: RelationshipCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create or update a relationship.
    Sets the target user to the specified tier.
    """
    # Prevent self-relationships
    if payload.target_user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot create relationship with yourself")
    
    try:
        relationship = await rel_db.create_or_update_relationship(
            owner_user_id=current_user["id"],
            target_user_id=payload.target_user_id,
            tier=payload.tier
        )
        return relationship
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create/update relationship: {str(e)}")


@router.post("/block", response_model=RelationshipRead)
async def block_user(
    payload: BlockRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Block a user.
    Sets status to BLOCKED and tier to OTHERS.
    """
    if payload.target_user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    
    try:
        relationship = await rel_db.block_user(
            owner_user_id=current_user["id"],
            target_user_id=payload.target_user_id
        )
        return relationship
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to block user: {str(e)}")


@router.post("/unblock", response_model=RelationshipRead)
async def unblock_user(
    payload: UnblockRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Unblock a user.
    Sets status back to ACTIVE.
    """
    try:
        relationship = await rel_db.unblock_user(
            owner_user_id=current_user["id"],
            target_user_id=payload.target_user_id
        )
        return relationship
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unblock user: {str(e)}")


@router.delete("/{target_user_id}")
async def delete_relationship(
    target_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a relationship (reset to implicit OTHERS).
    """
    try:
        deleted = await rel_db.delete_relationship(
            owner_user_id=current_user["id"],
            target_user_id=target_user_id
        )
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Relationship not found")
        
        return {"ok": True, "message": "Relationship deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete relationship: {str(e)}")
