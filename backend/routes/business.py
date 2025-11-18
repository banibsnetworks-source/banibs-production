"""
Business Profile Routes - Phase 8.2
Business accounts and identity management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from models.business_profile import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfilePublic,
    BusinessProfileOwner
)
from middleware.auth_guard import require_role
from db import business_profiles as db_business
from db.business_members import BusinessMembersDB
from db.follows import FollowsDB
from db.connection import get_db
from utils.handle_generator import generate_handle, validate_handle, make_handle_unique
from services.geocoding import geocode_address, km_to_miles
from typing import List


router = APIRouter(prefix="/api/business", tags=["business"])


@router.post("", response_model=BusinessProfileOwner, status_code=status.HTTP_201_CREATED)
async def create_business(
    profile_data: BusinessProfileCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a business profile
    
    Dual-Layout System: Users can have multiple business profiles
    Each profile requires a unique handle
    
    Handle generation:
    - If handle provided, validate and check uniqueness
    - If not provided, auto-generate from business name
    
    Requires authentication
    """
    db = await get_db()
    
    # Generate or validate handle
    if profile_data.handle:
        # User provided a handle - validate it
        is_valid, error_msg = validate_handle(profile_data.handle)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Check if handle is available
        handle_available = await db_business.is_handle_available(profile_data.handle)
        if not handle_available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Handle '{profile_data.handle}' is already taken"
            )
        
        handle = profile_data.handle
    else:
        # Auto-generate handle from business name
        base_handle = generate_handle(profile_data.name)
        existing_handles = await db_business.get_all_handles()
        handle = make_handle_unique(base_handle, existing_handles)
    
    # Convert services to dicts
    services_list = [s.dict() for s in profile_data.services] if profile_data.services else []
    
    # Create business profile
    profile = await db_business.create_business_profile(
        owner_user_id=current_user["id"],
        name=profile_data.name,
        handle=handle,
        tagline=profile_data.tagline,
        bio=profile_data.bio,
        industry=profile_data.industry,
        website=profile_data.website,
        email=profile_data.email,
        phone=profile_data.phone,
        location=profile_data.location,
        services=services_list,
        # Phase 10.0 - Black-owned business confirmation & location
        is_black_owned_confirmed=profile_data.is_black_owned_confirmed,
        city=profile_data.city,
        state=profile_data.state
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Handle is already taken"
        )
    
    # Create BusinessMember record with owner role
    members_db = BusinessMembersDB(db)
    await members_db.create_member(
        business_id=profile["id"],
        user_id=current_user["id"],
        role="owner",
        status="active"
    )
    
    return profile


@router.get("/me", response_model=BusinessProfileOwner)
async def get_my_business(
    current_user=Depends(require_role("user", "member"))
):
    """
    Get current user's first business profile (legacy endpoint)
    For backward compatibility
    """
    profile = await db_business.get_business_profile_by_owner(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    return profile


@router.get("/me/all", response_model=list[BusinessProfileOwner])
async def get_my_all_businesses(
    current_user=Depends(require_role("user", "member"))
):
    """
    Get ALL business profiles for current user
    Used by Mode Switcher in Dual-Layout System
    """
    profiles = await db_business.get_all_business_profiles_by_owner(current_user["id"])
    return profiles


async def get_current_user_optional():
    """Optional authentication - returns None if not authenticated"""
    try:
        from middleware.auth_guard import get_current_user
        user = await get_current_user()
        return user
    except:
        return None


# Phase 8.2 - Geo Search Endpoint (MUST come before /{handle_or_id} route)
@router.get("/search", response_model=List[BusinessProfilePublic])
async def search_businesses(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Category filter"),
    zip: Optional[str] = Query(None, alias="zip", description="Zip code"),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: float = Query(25, ge=0, le=500),
    sort: str = Query("distance", regex="^(distance|name|relevance)$"),
    limit: int = Query(50, ge=1, le=100)
):
    """Geo-enabled business search"""
    from services.geocoding import calculate_distance_km, km_to_miles, geocode_address
    from models.search_analytics import BusinessSearchEvent
    from uuid import uuid4
    
    db = await get_db()
    query_filter = {"status": "active"}
    
    if q:
        query_filter["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}}
        ]
    if category:
        query_filter["industry"] = category
    
    # Geocode location if needed
    search_lat, search_lng = lat, lng
    if not (search_lat and search_lng):
        if zip:
            coords = await geocode_address("", "", "", zip, "US")
            if coords:
                search_lat, search_lng = coords
        elif city and state:
            coords = await geocode_address("", city, state, "", "US")
            if coords:
                search_lat, search_lng = coords
    
    businesses = await db.business_profiles.find(query_filter, {"_id": 0}).to_list(limit * 2)
    
    results = []
    for biz in businesses:
        biz_data = BusinessProfilePublic(**biz)
        if search_lat and search_lng and biz.get("latitude") and biz.get("longitude"):
            distance_km = calculate_distance_km(search_lat, search_lng, biz["latitude"], biz["longitude"])
            if distance_km <= radius_km:
                biz_data.distance_km = round(distance_km, 2)
                biz_data.distance_miles = round(km_to_miles(distance_km), 2)
                results.append(biz_data)
        else:
            results.append(biz_data)
    
    if sort == "distance" and search_lat and search_lng:
        results.sort(key=lambda x: x.distance_km if x.distance_km else float('inf'))
    elif sort == "name":
        results.sort(key=lambda x: x.name.lower())
    
    # Log analytics
    try:
        location_type = "coords" if (lat and lng) else ("zip" if zip else ("city_state" if (city and state) else "none"))
        await db.business_search_analytics.insert_one(
            BusinessSearchEvent(
                id=str(uuid4()), query_text=q, category=category, location_type=location_type,
                search_city=city, search_state=state, search_zip=zip,
                radius_km=radius_km if (search_lat and search_lng) else None,
                sort_method=sort, results_count=len(results[:limit])
            ).dict()
        )
    except: pass
    
    return results[:limit]


@router.get("/{handle_or_id}", response_model=BusinessProfilePublic)
async def get_business(
    handle_or_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get public business profile by handle or ID
    
    Includes:
    - Follower count
    - Whether current user follows this business (if authenticated)
    """
    # Try to get by handle first, then by ID
    profile = await db_business.get_business_profile_by_handle(handle_or_id)
    if not profile:
        profile = await db_business.get_business_profile_by_id(handle_or_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    # Get follow data
    db = await get_db()
    follows_db = FollowsDB(db)
    
    # Get follower count
    follower_count = await follows_db.get_follower_count(
        target_type="business",
        target_id=profile["id"]
    )
    profile["follower_count"] = follower_count
    
    # Check if current user follows this business
    if current_user:
        is_following = await follows_db.is_following(
            follower_type="user",
            follower_id=current_user["id"],
            target_type="business",
            target_id=profile["id"]
        )
        profile["is_following"] = is_following
    else:
        profile["is_following"] = False
    
    return profile


@router.patch("/{business_id}", response_model=BusinessProfileOwner)
async def update_business(
    business_id: str,
    profile_data: BusinessProfileUpdate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Update business profile (owner only)
    Phase 8.2: Includes automatic geocoding when structured address is provided
    """
    # Convert services to dicts if provided
    updates = profile_data.dict(exclude_unset=True)
    if "services" in updates and updates["services"] is not None:
        updates["services"] = [s if isinstance(s, dict) else s.dict() for s in updates["services"]]
    
    # Phase 8.2: Auto-geocode if structured address fields are provided
    if all(k in updates for k in ['address_line1', 'city', 'state', 'postal_code']):
        try:
            coords = await geocode_address(
                address_line1=updates['address_line1'],
                city=updates['city'],
                state=updates['state'],
                postal_code=updates['postal_code'],
                country=updates.get('country', 'US'),
                address_line2=updates.get('address_line2')
            )
            
            if coords:
                updates['latitude'] = coords[0]
                updates['longitude'] = coords[1]
                # Also update legacy address field for backwards compatibility
                address_parts = [updates['address_line1']]
                if updates.get('address_line2'):
                    address_parts.append(updates['address_line2'])
                address_parts.extend([updates['city'], updates['state'], updates['postal_code']])
                updates['address'] = ", ".join(filter(None, address_parts))
            else:
                # Geocoding failed but don't block the update
                updates['latitude'] = None
                updates['longitude'] = None
        except Exception as e:
            # Log the error but don't block the save
            import logging
            logging.error(f"Geocoding error for business {business_id}: {e}")
    
    profile = await db_business.update_business_profile(
        business_id=business_id,
        owner_user_id=current_user["id"],
        **updates
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found or you are not the owner"
        )
    
    return profile


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(
    business_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Delete business profile (owner only)
    """
    deleted = await db_business.delete_business_profile(
        business_id=business_id,
        owner_user_id=current_user["id"]
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found or you are not the owner"
        )
    
    return None


@router.get("", response_model=dict)
async def list_businesses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query")
):
    """
    List business profiles with pagination and search
    """
    return await db_business.list_business_profiles(
        page=page,
        page_size=page_size,
        search=search
    )
