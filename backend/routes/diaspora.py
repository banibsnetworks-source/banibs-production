"""
BANIBS Diaspora Connect Portal - API Routes
Phase 12.0
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from db.connection import get_db_client
from db.diaspora import DiasporaDB
from models.diaspora import (
    DiasporaRegionsResponse,
    DiasporaStoriesResponse,
    DiasporaStory,
    DiasporaStoryCreate,
    DiasporaBusinessesResponse,
    DiasporaEducationResponse,
    DiasporaSnapshot,
    DiasporaSnapshotCreate
)
from middleware.auth_guard import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/diaspora", tags=["diaspora"])


# ==================== REGIONS ====================

@router.get("/regions", response_model=DiasporaRegionsResponse)
async def get_regions():
    """Get all diaspora regions (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    regions = await diaspora_db.get_regions()
    return {"regions": regions, "total": len(regions)}


@router.get("/regions/{region_id}")
async def get_region(region_id: str):
    """Get a specific region by ID (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    region = await diaspora_db.get_region_by_id(region_id)
    
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    return region


# ==================== STORIES ====================

@router.get("/stories", response_model=DiasporaStoriesResponse)
async def get_stories(
    origin_region_id: Optional[str] = Query(None),
    current_region_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Get diaspora stories with optional filters (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    stories = await diaspora_db.get_stories(
        origin_region_id=origin_region_id,
        current_region_id=current_region_id,
        limit=limit
    )
    return {"stories": stories, "total": len(stories)}


@router.post("/stories", response_model=DiasporaStory)
async def create_story(
    story_data: DiasporaStoryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new diaspora story (requires authentication)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    
    # Prepare author info (only if not anonymous)
    author_name = None
    author_avatar = None
    if not story_data.anonymous:
        author_name = current_user.get("name") or current_user.get("email")
        author_avatar = current_user.get("profile_image")
    
    story = await diaspora_db.create_story(
        user_id=current_user["id"],
        title=story_data.title,
        content=story_data.content,
        origin_region_id=story_data.origin_region_id,
        current_region_id=story_data.current_region_id,
        anonymous=story_data.anonymous,
        author_name=author_name,
        author_avatar=author_avatar
    )
    
    return story


@router.delete("/stories/{story_id}")
async def delete_story(
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a diaspora story (only by owner or admin)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    
    # Check if story exists and belongs to user
    story = await diaspora_db.get_story_by_id(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    # Allow deletion if user is owner or admin
    is_owner = story["user_id"] == current_user["id"]
    is_admin = current_user.get("role") == "admin"
    
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to delete this story")
    
    deleted = await diaspora_db.delete_story(story_id, story["user_id"])
    
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete story")
    
    return {"message": "Story deleted successfully"}


# ==================== BUSINESSES ====================

@router.get("/businesses", response_model=DiasporaBusinessesResponse)
async def get_businesses(
    region_id: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200)
):
    """Get diaspora businesses with optional filters (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    businesses = await diaspora_db.get_businesses(
        region_id=region_id,
        business_type=type,
        country=country,
        limit=limit
    )
    return {"businesses": businesses, "total": len(businesses)}


@router.get("/businesses/{business_id}")
async def get_business(business_id: str):
    """Get a specific business by ID (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    business = await diaspora_db.get_business_by_id(business_id)
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business


# ==================== EDUCATION ====================

@router.get("/education", response_model=DiasporaEducationResponse)
async def get_education_articles(
    limit: int = Query(50, ge=1, le=100)
):
    """Get education articles (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    articles = await diaspora_db.get_education_articles(limit=limit)
    return {"articles": articles, "total": len(articles)}


@router.get("/education/{article_id}")
async def get_education_article(article_id: str):
    """Get a specific education article by ID (public access)"""
    db = get_db_client()
    diaspora_db = DiasporaDB(db)
    article = await diaspora_db.get_education_article_by_id(article_id)
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return article


# ==================== SNAPSHOT ====================

@router.post("/snapshot", response_model=DiasporaSnapshot)
async def create_snapshot(
    snapshot_data: DiasporaSnapshotCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Create or update a user's diaspora snapshot (requires authentication)"""
    diaspora_db = DiasporaDB(db)
    
    snapshot = await diaspora_db.create_or_update_snapshot(
        user_id=current_user["id"],
        current_region_id=snapshot_data.current_region_id,
        origin_region_id=snapshot_data.origin_region_id,
        aspiration_region_id=snapshot_data.aspiration_region_id
    )
    
    # Enrich with region names
    enriched_snapshot = await diaspora_db.get_snapshot_by_user_id(current_user["id"])
    
    return enriched_snapshot


@router.get("/snapshot/{user_id}", response_model=DiasporaSnapshot)
async def get_snapshot(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get a user's diaspora snapshot (requires authentication, owner only)"""
    # Only allow users to view their own snapshot
    if user_id != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this snapshot")
    
    diaspora_db = DiasporaDB(db)
    snapshot = await diaspora_db.get_snapshot_by_user_id(user_id)
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    
    return snapshot
