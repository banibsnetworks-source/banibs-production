from fastapi import APIRouter, Depends, Request, HTTPException
from db.connection import get_db
from db.reactions import (
    hash_ip,
    toggle_reaction,
    get_reaction_count,
    create_comment,
    get_visible_comments,
    hide_comment,
    get_comment_count
)
from models.reactions import ReactionCount, CommentCreate, CommentPublic
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/opportunities", tags=["reactions-comments"])

# Phase 4.1 - Reactions Endpoints

@router.post("/{opportunity_id}/react")
async def react_to_opportunity(
    opportunity_id: str,
    request: Request,
    db=Depends(get_db)
):
    """
    Toggle a like on an opportunity
    Uses IP hash for anonymous tracking
    Returns new like count
    """
    # Get client IP from request
    client_ip = request.client.host
    
    # Hash the IP for privacy
    ip_hash = hash_ip(client_ip)
    
    # Toggle the reaction
    action, new_count = await toggle_reaction(db, opportunity_id, ip_hash, "like")
    
    return {
        "action": action,
        "like_count": new_count
    }

@router.get("/{opportunity_id}/reactions", response_model=ReactionCount)
async def get_opportunity_reactions(
    opportunity_id: str,
    db=Depends(get_db)
):
    """
    Get reaction counts for an opportunity
    Public endpoint
    """
    like_count = await get_reaction_count(db, opportunity_id, "like")
    
    return ReactionCount(
        opportunity_id=opportunity_id,
        like_count=like_count
    )

# Phase 4.1 - Comments Endpoints

@router.post("/{opportunity_id}/comments")
async def post_comment(
    opportunity_id: str,
    comment_data: CommentCreate,
    db=Depends(get_db)
):
    """
    Post a public comment on an opportunity
    Requires display_name and body
    """
    if not comment_data.body or not comment_data.body.strip():
        raise HTTPException(status_code=400, detail="Comment body cannot be empty")
    
    # Create the comment
    comment = await create_comment(
        db,
        opportunity_id,
        comment_data.display_name,
        comment_data.body
    )
    
    return {
        "id": str(comment["_id"]),
        "opportunity_id": comment["opportunity_id"],
        "display_name": comment["display_name"],
        "body": comment["body"],
        "timestamp": comment["timestamp"],
        "message": "Comment posted successfully"
    }

@router.get("/{opportunity_id}/comments", response_model=list[CommentPublic])
async def get_opportunity_comments(
    opportunity_id: str,
    db=Depends(get_db)
):
    """
    Get all visible comments for an opportunity
    Public endpoint
    """
    comments = await get_visible_comments(db, opportunity_id)
    
    return [
        CommentPublic(
            id=str(comment["_id"]),
            opportunity_id=comment["opportunity_id"],
            display_name=comment["display_name"],
            body=comment["body"],
            timestamp=comment["timestamp"]
        )
        for comment in comments
    ]

# Phase 4.1 - Admin Comment Moderation

@router.patch("/admin/comments/{comment_id}/hide")
async def hide_comment_admin(
    comment_id: str,
    db=Depends(get_db),
    user: dict = Depends(can_moderate)  # Phase 4.5 - moderator or super_admin
):
    """
    Hide a comment (moderator or super_admin)
    Phase 4.5 - RBAC: Both moderators and super_admins can hide comments
    Does not delete, just sets status to hidden
    """
    success = await hide_comment(db, comment_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return {
        "success": True,
        "comment_id": comment_id,
        "message": "Comment hidden successfully"
    }
