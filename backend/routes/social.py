"""
Social API Routes - Phase 8.3
BANIBS Social Portal feed and engagement endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

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
from db import social_posts as db_social


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
    Create a new social post
    Requires authentication
    """
    post = await db_social.create_post(
        author_id=current_user["id"],
        text=post_data.text,
        media_url=post_data.media_url
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
# LIKES
# ==========================================

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
    
    result = await db_social.toggle_like(post_id, current_user["id"])
    return result


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
    Create a comment on a post
    """
    # Check if post exists
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comment = await db_social.create_comment(
        post_id=post_id,
        author_id=current_user["id"],
        text=comment_data.text
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


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Delete own comment (soft delete)
    """
    success = await db_social.delete_comment(comment_id, current_user["id"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
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
