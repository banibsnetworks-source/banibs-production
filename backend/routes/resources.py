"""
Resources API Routes
Phase 6.2.3 - Resources & Events
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from models.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourcePublic,
    ResourceListResponse
)
from db.resources import (
    create_resource,
    get_resources,
    get_resource_by_id,
    update_resource,
    delete_resource
)
from middleware.auth_guard import get_current_user, require_role
import math

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("", response_model=ResourceListResponse)
async def list_resources(
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    skip: int = Query(0, ge=0)
):
    """
    List resources (public endpoint)
    
    Query params:
    - category: Filter by category
    - type: Filter by resource type
    - tags: Comma-separated tags (e.g., "grant,funding")
    - featured: Featured resources only (true/false)
    - search: Search in title/description
    - limit: Items per page (1-50, default 20)
    - skip: Pagination offset
    """
    # Parse tags if provided
    tag_list = tags.split(",") if tags else None
    
    # Get resources
    resources, total = await get_resources(
        category=category,
        resource_type=type,
        tags=tag_list,
        featured=featured,
        search=search,
        limit=limit,
        skip=skip
    )
    
    # Calculate pagination
    page = (skip // limit) + 1
    pages = math.ceil(total / limit) if total > 0 else 1
    
    return ResourceListResponse(
        resources=[ResourcePublic(**r) for r in resources],
        total=total,
        page=page,
        pages=pages
    )


@router.get("/{resource_id}", response_model=ResourcePublic)
async def get_resource(resource_id: str):
    """
    Get resource details (public endpoint)
    
    Side effect: Increments view_count by 1
    """
    resource = await get_resource_by_id(resource_id)
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return ResourcePublic(**resource)


@router.post("", response_model=ResourcePublic, status_code=201)
async def create_resource_endpoint(
    resource_data: ResourceCreate,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Create new resource (admin/moderator only)
    
    Requires JWT with role: super_admin or moderator
    Phase 6.3: Automatically analyzes sentiment on creation
    """
    # Phase 6.3: Analyze sentiment on creation
    from services.sentiment_service import analyze_text_sentiment
    text_for_sentiment = f"{resource_data.title} {resource_data.description}"
    sentiment = analyze_text_sentiment(text_for_sentiment)
    
    created = await create_resource(
        title=resource_data.title,
        description=resource_data.description,
        category=resource_data.category,
        resource_type=resource_data.type,
        author_id=current_user["id"],
        author_name=current_user["name"],
        content=resource_data.content,
        external_url=str(resource_data.external_url) if resource_data.external_url else None,
        thumbnail_url=str(resource_data.thumbnail_url) if resource_data.thumbnail_url else None,
        video_url=str(resource_data.video_url) if resource_data.video_url else None,
        tags=resource_data.tags,
        featured=resource_data.featured
    )
    
    # Add sentiment to created resource
    created["sentiment_score"] = sentiment["score"]
    created["sentiment_label"] = sentiment["label"]
    created["sentiment_at"] = sentiment["analyzed_at"]
    
    # Update DB with sentiment
    from db.connection import get_db
    db = await get_db()
    await db["banibs_resources"].update_one(
        {"id": created["id"]},
        {"$set": {
            "sentiment_score": sentiment["score"],
            "sentiment_label": sentiment["label"],
            "sentiment_at": sentiment["analyzed_at"]
        }}
    )
    
    return ResourcePublic(**created)


@router.patch("/{resource_id}", response_model=ResourcePublic)
async def update_resource_endpoint(
    resource_id: str,
    resource_data: ResourceUpdate,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Update resource (admin/moderator only)
    
    Requires JWT with role: super_admin or moderator
    Phase 6.3: Re-analyzes sentiment if title/description changed
    """
    # Build update dict (only include provided fields)
    update_dict = resource_data.dict(exclude_unset=True)
    
    # Convert HttpUrl to string for URLs
    if "external_url" in update_dict and update_dict["external_url"]:
        update_dict["external_url"] = str(update_dict["external_url"])
    if "thumbnail_url" in update_dict and update_dict["thumbnail_url"]:
        update_dict["thumbnail_url"] = str(update_dict["thumbnail_url"])
    if "video_url" in update_dict and update_dict["video_url"]:
        update_dict["video_url"] = str(update_dict["video_url"])
    
    # Phase 6.3: Re-analyze sentiment if title or description changed
    if "title" in update_dict or "description" in update_dict:
        from services.sentiment_service import analyze_text_sentiment
        from db.connection import get_db
        
        # Get current resource for missing fields
        db = await get_db()
        current_resource = await db["banibs_resources"].find_one({"id": resource_id})
        
        if current_resource:
            title = update_dict.get("title", current_resource.get("title", ""))
            description = update_dict.get("description", current_resource.get("description", ""))
            text_for_sentiment = f"{title} {description}"
            
            sentiment = analyze_text_sentiment(text_for_sentiment)
            update_dict["sentiment_score"] = sentiment["score"]
            update_dict["sentiment_label"] = sentiment["label"]
            update_dict["sentiment_at"] = sentiment["analyzed_at"]
    
    updated = await update_resource(resource_id, update_dict)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return ResourcePublic(**updated)


@router.delete("/{resource_id}")
async def delete_resource_endpoint(
    resource_id: str,
    current_user: dict = Depends(require_role("super_admin"))
):
    """
    Delete resource (admin only)
    
    Requires JWT with role: super_admin
    """
    deleted = await delete_resource(resource_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"deleted": True}
