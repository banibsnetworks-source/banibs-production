"""
Business Knowledge Flags Routes - Phase 8.3
Business → Business Community knowledge sharing
Private network for business owners only

ANONYMITY IMPLEMENTATION:
- Posts can be anonymous (name hidden from other business owners)
- NOT anonymous to BANIBS admins (author_business_id always stored)
- Author identity only revealed to admins for moderation purposes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Literal
from datetime import datetime, timedelta
from uuid import uuid4

from models.business_knowledge import BusinessKnowledgeFlag
from middleware.auth_guard import require_role
from db.connection import get_db

router = APIRouter(prefix="/api/business/knowledge", tags=["business-knowledge"])


# Rate limiting configuration
RATE_LIMIT_WINDOW = timedelta(hours=24)  # 24 hour window
MAX_FLAGS_PER_DAY = 5  # Max 5 flags per business per day


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_knowledge_flag(
    flag_type: Literal["pitfall", "plus"] = Query(..., alias="type"),
    title: str = Query(..., min_length=1, max_length=200),
    description: str = Query(..., min_length=80, max_length=2000),
    anonymous: bool = Query(False),
    tags: Optional[List[str]] = Query(default=[]),
    media_url: Optional[str] = Query(None),
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a new Business Knowledge Flag (Pitfall or Plus Flag)
    
    GUARDRAILS:
    - Minimum 80 characters for description (quality control)
    - Rate limiting: Max 5 flags per business per 24 hours
    - Anonymous option: Hide business name from other owners (NOT from admins)
    
    ANONYMITY:
    - If anonymous=True: business name hidden from other business owners
    - Author identity ALWAYS stored for admin moderation
    - BANIBS can always see who posted what
    """
    db = await get_db()
    user_id = current_user["id"]
    
    # Check if user owns a business
    business = await db.business_profiles.find_one(
        {"owner_user_id": user_id},
        {"_id": 0}
    )
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business owners can create knowledge flags"
        )
    
    business_id = business["id"]
    
    # GUARDRAIL: Minimum content length check
    if len(description.strip()) < 80:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be at least 80 characters for quality standards"
        )
    
    # GUARDRAIL: Rate limiting check
    cutoff_time = datetime.utcnow() - RATE_LIMIT_WINDOW
    recent_flags_count = await db.business_knowledge_flags.count_documents({
        "business_id": business_id,
        "created_at": {"$gte": cutoff_time}
    })
    
    if recent_flags_count >= MAX_FLAGS_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {MAX_FLAGS_PER_DAY} flags per 24 hours"
        )
    
    # Create knowledge flag
    flag_id = str(uuid4())
    
    flag = BusinessKnowledgeFlag(
        id=flag_id,
        business_id=business_id,
        author_business_id=business_id,  # Always stored for admin tracking
        author_user_id=user_id,  # Always stored for admin tracking
        author_business_name=business.get("name", "Anonymous Business"),
        type=flag_type,
        title=title,
        description=description,
        tags=tags or [],
        media_url=media_url,
        anonymous=anonymous,  # Controls visibility to other business owners
        helpful_votes=0,
        not_accurate_votes=0,
        visibility="business-only",
        status="active",
        confidence_score=0.0,
        created_at=datetime.utcnow()
    )
    
    await db.business_knowledge_flags.insert_one(flag.dict())
    
    return {
        "message": "Knowledge flag created",
        "flag_id": flag_id,
        "type": flag_type,
        "anonymous": anonymous
    }


@router.get("", response_model=List[dict])
async def get_knowledge_flags(
    flag_type: Optional[Literal["pitfall", "plus"]] = Query(None, alias="type"),
    limit: int = Query(50, le=100),
    skip: int = Query(0, ge=0),
    current_user=Depends(require_role("user", "member"))
):
    """
    Get Business Knowledge Flags
    
    ANONYMITY HANDLING:
    - If flag.anonymous=True: business_name replaced with "Anonymous Business Owner"
    - Author identity visible ONLY to BANIBS admins (not exposed in API)
    - Other business owners cannot see who posted anonymous flags
    """
    db = await get_db()
    user_id = current_user["id"]
    
    # Check if user owns a business
    business = await db.business_profiles.find_one(
        {"owner_user_id": user_id},
        {"_id": 0}
    )
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business owners can view knowledge flags"
        )
    
    # Build query filter
    query_filter = {"status": "active"}
    if flag_type:
        query_filter["type"] = flag_type
    
    # Fetch flags
    flags = await db.business_knowledge_flags.find(
        query_filter,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # ANONYMITY PROCESSING: Hide author identity for anonymous posts
    result = []
    for flag in flags:
        # Check if current user is the author
        is_author = flag.get("business_id") == business["id"]
        
        # Build response object
        flag_response = {
            "id": flag["id"],
            "business_id": flag["business_id"] if not flag.get("anonymous") or is_author else None,
            "business_name": flag.get("author_business_name") if not flag.get("anonymous") else "Anonymous Business Owner",
            "type": flag["type"],
            "title": flag["title"],
            "description": flag["description"],
            "tags": flag.get("tags", []),
            "media_url": flag.get("media_url"),
            "anonymous": flag.get("anonymous", False),
            "helpful_votes": flag.get("helpful_votes", 0),
            "not_accurate_votes": flag.get("not_accurate_votes", 0),
            "created_at": flag["created_at"],
            "is_author": is_author  # So user can see their own posts
        }
        
        result.append(flag_response)
    
    return result


@router.post("/{flag_id}/vote")
async def vote_on_flag(
    flag_id: str,
    vote_type: Literal["helpful", "not_accurate"] = Query(...),
    current_user=Depends(require_role("user", "member"))
):
    """
    Vote on a Business Knowledge Flag
    
    VOTING SYSTEM:
    - helpful: Upvote (this warning/tip was useful)
    - not_accurate: Downvote (this information is questionable)
    - Users can change their vote
    - Cannot vote on own flags
    """
    db = await get_db()
    user_id = current_user["id"]
    
    # Check if user owns a business
    business = await db.business_profiles.find_one(
        {"owner_user_id": user_id},
        {"_id": 0}
    )
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business owners can vote on knowledge flags"
        )
    
    business_id = business["id"]
    
    # Check if flag exists
    flag = await db.business_knowledge_flags.find_one(
        {"id": flag_id, "status": "active"},
        {"_id": 0}
    )
    
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge flag not found"
        )
    
    # Cannot vote on own flags
    if flag["business_id"] == business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot vote on your own knowledge flags"
        )
    
    # Check existing vote
    existing_vote = await db.business_knowledge_votes.find_one({
        "flag_id": flag_id,
        "business_id": business_id
    })
    
    if existing_vote:
        old_vote_type = existing_vote["vote_type"]
        
        # If voting the same type, remove vote (toggle off)
        if old_vote_type == vote_type:
            await db.business_knowledge_votes.delete_one({"_id": existing_vote["_id"]})
            
            # Decrement vote count
            if vote_type == "helpful":
                await db.business_knowledge_flags.update_one(
                    {"id": flag_id},
                    {"$inc": {"helpful_votes": -1}}
                )
            else:
                await db.business_knowledge_flags.update_one(
                    {"id": flag_id},
                    {"$inc": {"not_accurate_votes": -1}}
                )
            
            return {"message": "Vote removed", "action": "removed"}
        
        # Change vote
        else:
            await db.business_knowledge_votes.update_one(
                {"_id": existing_vote["_id"]},
                {"$set": {"vote_type": vote_type, "updated_at": datetime.utcnow()}}
            )
            
            # Adjust vote counts
            if vote_type == "helpful":
                await db.business_knowledge_flags.update_one(
                    {"id": flag_id},
                    {
                        "$inc": {
                            "helpful_votes": 1,
                            "not_accurate_votes": -1
                        }
                    }
                )
            else:
                await db.business_knowledge_flags.update_one(
                    {"id": flag_id},
                    {
                        "$inc": {
                            "helpful_votes": -1,
                            "not_accurate_votes": 1
                        }
                    }
                )
            
            return {"message": "Vote changed", "action": "changed", "new_vote": vote_type}
    
    # New vote
    else:
        vote_doc = {
            "flag_id": flag_id,
            "business_id": business_id,
            "user_id": user_id,
            "vote_type": vote_type,
            "created_at": datetime.utcnow()
        }
        
        await db.business_knowledge_votes.insert_one(vote_doc)
        
        # Increment vote count
        if vote_type == "helpful":
            await db.business_knowledge_flags.update_one(
                {"id": flag_id},
                {"$inc": {"helpful_votes": 1}}
            )
        else:
            await db.business_knowledge_flags.update_one(
                {"id": flag_id},
                {"$inc": {"not_accurate_votes": 1}}
            )
        
        return {"message": "Vote recorded", "action": "added", "vote_type": vote_type}
