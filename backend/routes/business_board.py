"""
Business Board Routes - Phase 8.3
Business-to-business and business-to-community feed
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from models.business_board import (
    BusinessBoardPostCreate,
    BusinessBoardPost,
    BusinessBoardFeedResponse
)
from middleware.auth_guard import require_role
from db import business_board_posts as db_board
from db import business_profiles as db_business


router = APIRouter(prefix="/api/business/board", tags=["business-board"])


@router.post("", response_model=BusinessBoardPost, status_code=status.HTTP_201_CREATED)
async def create_board_post(
    post_data: BusinessBoardPostCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a business board post (business owner only)
    User must have a business profile to post
    """
    # Verify user has a business profile
    business = await db_business.get_business_profile_by_owner(current_user["id"])
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must have a business profile to post to the Business Board"
        )
    
    # Create post
    post = await db_board.create_board_post(
        business_id=business["id"],
        category=post_data.category,
        text=post_data.text,
        media=post_data.media,
        link_url=post_data.link_url,
        link_meta=post_data.link_meta
    )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create board post"
        )
    
    # Return enriched post
    enriched_post = await db_board.get_board_post_by_id(post["id"])
    
    return enriched_post


@router.get("", response_model=BusinessBoardFeedResponse)
async def get_board_feed(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Get business board feed
    Public endpoint - no authentication required
    """
    feed_data = await db_board.get_board_feed(
        page=page,
        page_size=page_size,
        category=category
    )
    
    return feed_data


@router.get("/{post_id}", response_model=BusinessBoardPost)
async def get_board_post(post_id: str):
    """
    Get a single board post by ID
    """
    post = await db_board.get_board_post_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board post not found"
        )
    
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board_post(
    post_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Delete a board post (business owner only)
    """
    # Get user's business profile
    business = await db_business.get_business_profile_by_owner(current_user["id"])
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must have a business profile"
        )
    
    deleted = await db_board.delete_board_post(
        post_id=post_id,
        business_id=business["id"]
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board post not found or you are not the owner"
        )
    
    return None
