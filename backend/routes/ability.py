"""
BANIBS Ability Network - API Routes
Phase 11.5
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timezone

from models.ability import (
    AbilityResourcesResponse,
    AbilityResource,
    AbilityProvidersResponse,
    AbilityProvider
)
from db.ability import AbilityDB
from db.connection import get_db_client
from middleware.auth_guard import get_current_user as get_current_user_dependency

router = APIRouter(prefix="/api/ability", tags=["Ability Network"])


# ==================== RESOURCE ENDPOINTS (Phase 11.5.1) ====================

@router.get("/resources", response_model=AbilityResourcesResponse)
async def get_ability_resources(
    category: Optional[str] = Query(None, description="Resource category"),
    disability_type: Optional[str] = Query(None, description="Disability type filter"),
    age_group: Optional[str] = Query(None, description="Age group filter"),
    format: Optional[str] = Query(None, description="Resource format"),
    region: Optional[str] = Query(None, description="Geographic region"),
    cost_range: Optional[str] = Query(None, description="Cost range"),
    verified_only: bool = Query(False, description="Only verified resources"),
    limit: int = Query(50, le=100, description="Max results")
):
    """Get ability resources with filtering - Phase 11.5.1"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    resources = await ability_db.get_resources(
        category=category,
        disability_type=disability_type,
        age_group=age_group,
        format=format,
        region=region,
        cost_range=cost_range,
        verified_only=verified_only,
        limit=limit
    )
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/resources/featured")
async def get_featured_resources(
    limit: int = Query(6, le=12, description="Max results")
):
    """Get featured ability resources"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    resources = await ability_db.get_featured_resources(limit=limit)
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/resources/{slug}", response_model=AbilityResource)
async def get_ability_resource(slug: str):
    """Get a specific ability resource by slug"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    resource = await ability_db.get_resource_by_slug(slug)
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Increment view count
    await ability_db.increment_resource_views(resource["id"])
    
    return resource


@router.post("/resources/{resource_id}/helpful")
async def mark_resource_helpful(resource_id: str):
    """Mark a resource as helpful"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    await ability_db.increment_helpful_count(resource_id)
    
    return {"success": True, "message": "Thank you for your feedback"}


@router.post("/resources/submit")
async def submit_ability_resource(
    resource_data: dict,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Submit an ability resource for review - Phase 11.5.4"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    # Create slug from title
    slug = resource_data["title"].lower().replace(" ", "-").replace("'", "")
    
    # Create resource record with pending review status
    resource = {
        "id": f"ability-{uuid4().hex[:8]}",
        "title": resource_data["title"],
        "slug": slug,
        "category": resource_data["category"],
        "disability_types": resource_data.get("disability_types", []),
        "age_groups": resource_data.get("age_groups", []),
        "format": resource_data["format"],
        "description": resource_data["description"],
        "detailed_content": resource_data.get("detailed_content"),
        "provider_name": resource_data["provider_name"],
        "provider_organization": resource_data.get("provider_organization"),
        "contact_website": resource_data.get("contact_website"),
        "contact_email": resource_data.get("contact_email"),
        "contact_phone": resource_data.get("contact_phone"),
        "region": resource_data.get("region"),
        "cost_range": resource_data.get("cost_range", "free"),
        "languages_available": resource_data.get("languages_available", ["English"]),
        "accessibility_features": resource_data.get("accessibility_features", []),
        "tags": resource_data.get("tags", []),
        "is_verified": False,
        "is_featured": False,
        "is_government_program": resource_data.get("is_government_program", False),
        "is_user_submitted": True,
        "submitted_by_user_id": current_user["id"],
        "submitted_by_name": current_user.get("name", current_user.get("email", "Unknown")),
        "is_approved": False,  # Pending review
        "view_count": 0,
        "helpful_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await ability_db.resources.insert_one(resource)
    
    return {
        "success": True,
        "message": "Resource submitted successfully and is pending review",
        "resource_id": resource["id"]
    }


# ==================== PROVIDER ENDPOINTS (Phase 11.5.2) ====================

@router.get("/providers", response_model=AbilityProvidersResponse)
async def get_ability_providers(
    provider_type: Optional[str] = Query(None, description="Provider type"),
    disability_type: Optional[str] = Query(None, description="Disability type served"),
    region: Optional[str] = Query(None, description="Geographic region"),
    telehealth: Optional[bool] = Query(None, description="Telehealth availability"),
    verified_only: bool = Query(False, description="Only verified providers"),
    limit: int = Query(50, le=100, description="Max results")
):
    """Get ability providers with filtering - Phase 11.5.2"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    providers = await ability_db.get_providers(
        provider_type=provider_type,
        disability_type=disability_type,
        region=region,
        telehealth=telehealth,
        verified_only=verified_only,
        limit=limit
    )
    
    return {
        "providers": providers,
        "total": len(providers)
    }


@router.get("/providers/{provider_id}", response_model=AbilityProvider)
async def get_ability_provider(provider_id: str):
    """Get a specific ability provider by ID"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    provider = await ability_db.get_provider_by_id(provider_id)
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    return provider


@router.post("/providers/submit")
async def submit_ability_provider(
    provider_data: dict,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Submit an ability provider for review - Phase 11.5.4"""
    db = get_db_client()
    ability_db = AbilityDB(db)
    
    # Create slug from name
    slug = provider_data["name"].lower().replace(" ", "-").replace("'", "")
    
    # Create provider record with pending review status
    provider = {
        "id": f"provider-{uuid4().hex[:8]}",
        "name": provider_data["name"],
        "provider_type": provider_data["provider_type"],
        "specializations": provider_data.get("specializations", []),
        "disability_types_served": provider_data.get("disability_types_served", []),
        "age_groups_served": provider_data.get("age_groups_served", []),
        "credentials": provider_data.get("credentials", []),
        "bio": provider_data["bio"],
        "organization": provider_data.get("organization"),
        "region": provider_data["region"],
        "city": provider_data.get("city"),
        "state": provider_data.get("state"),
        "telehealth_available": provider_data.get("telehealth_available", False),
        "in_person_available": provider_data.get("in_person_available", True),
        "languages": provider_data.get("languages", ["English"]),
        "accepts_insurance": provider_data.get("accepts_insurance", False),
        "insurance_accepted": provider_data.get("insurance_accepted", []),
        "cost_range": provider_data.get("cost_range", "$"),
        "contact_website": provider_data.get("contact_website"),
        "contact_email": provider_data.get("contact_email"),
        "contact_phone": provider_data.get("contact_phone"),
        "availability": provider_data.get("availability"),
        "is_verified": False,
        "is_black_owned": provider_data.get("is_black_owned", False),
        "is_user_submitted": True,
        "submitted_by_user_id": current_user["id"],
        "submitted_by_name": current_user.get("name", current_user.get("email", "Unknown")),
        "is_approved": False,  # Pending review
        "rating": None,
        "total_reviews": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await ability_db.providers.insert_one(provider)
    
    return {
        "success": True,
        "message": "Provider submitted successfully and is pending review",
        "provider_id": provider["id"]
    }
