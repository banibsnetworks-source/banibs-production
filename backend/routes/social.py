"""
Social API Routes - Phase 8.3 + Multi-Reaction System v2.0 + Circle Trust Gating
BANIBS Social Portal feed and engagement endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from pydantic import BaseModel

from models.social_post import (
    SocialPostCreate,
    SocialPost,
    SocialFeedResponse,
    SocialCommentCreate,
    SocialComment,
    SocialCommentsResponse,
    SocialLikeResponse
)
from middleware.auth_guard import require_role
from middleware.circle_trust import require_circle_tier
from db import social_posts as db_social
from db.connection import get_db

# Circle tier for gated actions (configurable - default OPEN allows all authenticated users)
# To restrict: set SOCIAL_MIN_TIER=PEOPLES in .env
import os
SOCIAL_GATING_TIER = os.environ.get("SOCIAL_MIN_TIER", "OPEN")

router = APIRouter(prefix="/api/social", tags=["social"])


# ==========================================
# FEED
# ==========================================

@router.get("/feed", response_model=SocialFeedResponse)
async def get_social_feed(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user=Depends(require_role("user", "member"))
):
    """
    Get social feed for authenticated members
    Returns paginated list of posts with author info and like status
    """
    feed_data = await db_social.get_feed(
        page=page,
        page_size=page_size,
        viewer_id=current_user["id"]
    )
    
    return feed_data


# ==========================================
# POSTS
# ==========================================

@router.post("/posts", response_model=SocialPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: SocialPostCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a new social post (Phase 8.1: with media, link, and quote support)
    Requires authentication
    """
    # Convert Pydantic models to dicts for DB
    media_list = [m.dict() for m in post_data.media] if post_data.media else []
    link_meta_dict = post_data.link_meta.dict() if post_data.link_meta else None
    
    post = await db_social.create_post(
        author_id=current_user["id"],
        text=post_data.text,
        media=media_list,
        link_url=post_data.link_url,
        link_meta=link_meta_dict,
        quoted_post_id=post_data.quoted_post_id
    )
    
    # Return enriched post
    enriched_post = await db_social.get_post_by_id(
        post["id"],
        viewer_id=current_user["id"]
    )
    
    if not enriched_post:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created post"
        )
    
    return enriched_post


@router.get("/posts/{post_id}", response_model=SocialPost)
async def get_post(
    post_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get a single post by ID
    """
    post = await db_social.get_post_by_id(post_id, viewer_id=current_user["id"])
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return post


# ==========================================
# REACTIONS (MULTI-REACTION SYSTEM v2.0)
# ==========================================

class ReactionRequest(BaseModel):
    """Request body for reaction"""
    type: str = "love"  # love, high_five, peace, like, cool


@router.post("/posts/{post_id}/like", response_model=SocialLikeResponse)
async def toggle_like_post(
    post_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Toggle like on a post (like if not liked, unlike if already liked)
    """
    # Check if post exists
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    result = await db_social.toggle_like(post_id, current_user["id"], "love")
    return result


@router.post("/posts/{post_id}/react")
async def toggle_reaction_post(
    post_id: str,
    reaction: ReactionRequest,
    current_user=Depends(require_role("user", "member"))
):
    """
    Toggle reaction on a post with specified type (BANIBS Multi-Reaction System v2.0)
    
    Reaction types:
    - love: ❤️ (default)
    - high_five: ✋
    - peace: ✌️
    - like: 👍
    - cool: 😎
    """
    # Check if post exists
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    result = await db_social.toggle_like(post_id, current_user["id"], reaction.type)
    return result


@router.delete("/posts/{post_id}/react")
async def remove_reaction_post(
    post_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Remove user's reaction from a post
    """
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get user's current reaction to determine type
    db = await get_db()
    existing = await db.social_reactions.find_one({
        "post_id": post_id,
        "user_id": current_user["id"]
    })
    
    if existing:
        result = await db_social.toggle_like(post_id, current_user["id"], existing.get("type", "love"))
        return result
    
    return {"liked": False, "like_count": post.get("like_count", 0)}


@router.get("/posts/{post_id}/reactors")
async def get_post_reactors(
    post_id: str,
    reaction_type: Optional[str] = None,
    limit: int = 50,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get list of users who reacted to a post
    """
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    reactors = await db_social.get_post_reactors(post_id, reaction_type, limit)
    return {"reactors": reactors, "count": len(reactors)}


@router.post("/posts/{post_id}/highfive")
async def toggle_highfive_post(
    post_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Toggle High Five on a post (BANIBS branded like system)
    Alias for /react endpoint with high_five type
    """
    # Check if post exists
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    result = await db_social.toggle_like(post_id, current_user["id"], "high_five")
    
    # Map response to High Five format for frontend compatibility
    return {
        "highfived": result["liked"],
        "highfive_count": result["like_count"],
        "viewer_reaction_type": result.get("viewer_reaction_type")
    }


# ==========================================
# COMMENTS
# ==========================================

@router.post("/posts/{post_id}/comments", response_model=SocialComment, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: str,
    comment_data: SocialCommentCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a comment on a post with optional media
    """
    # Check if post exists
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Convert media models to dicts
    media_list = [m.dict() for m in comment_data.media] if comment_data.media else []
    
    comment = await db_social.create_comment(
        post_id=post_id,
        author_id=current_user["id"],
        text=comment_data.text,
        media=media_list
    )
    
    # Enrich with author info
    from db.connection import get_db
    db = await get_db()
    author = await db.banibs_users.find_one(
        {"id": current_user["id"]},
        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
    )
    
    return {
        **comment,
        "author": {
            "id": author["id"],
            "display_name": author.get("name", "Unknown User"),
            "avatar_url": author.get("avatar_url")
        }
    }


@router.get("/posts/{post_id}/comments", response_model=SocialCommentsResponse)
async def get_comments(
    post_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user=Depends(require_role("user", "member"))
):
    """
    Get comments for a post
    """
    comments_data = await db_social.get_comments(
        post_id=post_id,
        page=page,
        page_size=page_size
    )
    
    return comments_data


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Delete own post (soft delete) - Phase 3 Add-On
    Only author or moderator/admin can delete.
    """
    user_role = current_user.get("role", "user")
    success = await db_social.delete_post(
        post_id=post_id,
        user_id=current_user["id"],
        user_role=user_role
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Post not found or you don't have permission to delete it"
        )
    
    return None


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Delete own comment (soft delete) - Phase 3 Add-On Enhanced
    Only author or moderator/admin can delete.
    """
    user_role = current_user.get("role", "user")
    success = await db_social.delete_comment(
        comment_id=comment_id,
        user_id=current_user["id"],
        user_role=user_role
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Comment not found or you don't have permission to delete it"
        )
    
    return None



# ==========================================
# USER POSTS - Phase 9.1
# ==========================================

@router.get("/users/{user_id}/posts", response_model=SocialFeedResponse)
async def get_user_posts(
    user_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user=Depends(require_role("user", "member"))
):
    """
    Get all posts by a specific user (paginated)
    Phase 9.1 - My Posts Tab
    
    Returns posts authored by the specified user, respecting visibility rules.
    Used for profile "Posts" tab and "My Posts" view.
    """
    posts_data = await db_social.get_user_posts(
        user_id=user_id,
        page=page,
        page_size=page_size,
        viewer_id=current_user["id"]
    )
    
    return posts_data
