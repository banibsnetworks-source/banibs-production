"""
Business Search Routes - Phase 8.2
Geo-enabled business directory search
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from models.business_profile import BusinessProfilePublic
from models.search_analytics import BusinessSearchEvent
from db.connection import get_db
from services.geocoding import calculate_distance_km, km_to_miles, geocode_address
from uuid import uuid4

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/business", tags=["business-search"])


@router.get("/search", response_model=List[BusinessProfilePublic])
async def search_businesses(
    q: Optional[str] = Query(None, description="Search query (name, keywords)"),
    category: Optional[str] = Query(None, description="Business category/industry"),
    zip: Optional[str] = Query(None, alias="zip", description="Zip/postal code"),
    city: Optional[str] = Query(None, description="City name"),
    state: Optional[str] = Query(None, description="State/province"),
    lat: Optional[float] = Query(None, ge=-90, le=90, description="User latitude"),
    lng: Optional[float] = Query(None, ge=-180, le=180, description="User longitude"),
    radius_km: float = Query(25, ge=0, le=500, description="Search radius in km"),
    sort: str = Query("distance", regex="^(distance|name|relevance)$", description="Sort order"),
    limit: int = Query(50, ge=1, le=100, description="Max results")
):
    """
    Search for businesses with optional geo-filtering
    
    Phase 8.2 - Geo-Enabled Search:
    - If lat/lng provided: distance-based search
    - If zip/city+state provided: geocode center point, then distance search
    - Otherwise: basic text/category search
    """
    db = await get_db()
    
    # Build base query
    query_filter = {"status": "active"}
    
    # Text search
    if q:
        query_filter["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}},
            {"bio": {"$regex": q, "$options": "i"}}
        ]
    
    # Category filter
    if category:
        query_filter["industry"] = category
    
    # If no location provided but zip/city+state given, geocode to get center point
    if not (lat and lng):
        if zip:
            # Geocode zip code
            coords = await geocode_address(
                address_line1="",
                city="",
                state="",
                postal_code=zip,
                country="US"
            )
            if coords:
                lat, lng = coords
                logger.info(f"Geocoded zip {zip} to: {lat}, {lng}")
        elif city and state:
            # Geocode city+state
            coords = await geocode_address(
                address_line1="",
                city=city,
                state=state,
                postal_code="",
                country="US"
            )
            if coords:
                lat, lng = coords
                logger.info(f"Geocoded {city}, {state} to: {lat}, {lng}")
    
    # Fetch businesses
    businesses = await db.business_profiles.find(query_filter, {"_id": 0}).to_list(limit * 2)
    
    results = []
    for biz in businesses:
        # Convert to response model
        biz_data = BusinessProfilePublic(**biz)
        
        # Calculate distance if location is available
        if lat and lng and biz.get("latitude") and biz.get("longitude"):
            distance_km = calculate_distance_km(
                lat, lng,
                biz["latitude"], biz["longitude"]
            )
            
            # Filter by radius
            if distance_km <= radius_km:
                biz_data.distance_km = round(distance_km, 2)
                biz_data.distance_miles = round(km_to_miles(distance_km), 2)
                results.append(biz_data)
        else:
            # No distance filtering, just add the business
            results.append(biz_data)
    
    # Sort results
    if sort == "distance" and lat and lng:
        # Sort by distance (closest first)
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else float('inf'))
    elif sort == "name":
        results.sort(key=lambda x: x.name.lower())
    # relevance sorting could be added later with more sophisticated ranking
    
    # Limit results
    final_results = results[:limit]
    
    # Phase 8.2 - Log search analytics (async, non-blocking)
    try:
        location_type = "none"
        if lat and lng:
            location_type = "coords"
        elif zip:
            location_type = "zip"
        elif city and state:
            location_type = "city_state"
        
        search_event = BusinessSearchEvent(
            id=str(uuid4()),
            query_text=q,
            category=category,
            location_type=location_type,
            search_city=city,
            search_state=state,
            search_zip=zip,
            radius_km=radius_km if (lat and lng) or zip or (city and state) else None,
            sort_method=sort,
            results_count=len(final_results),
            user_location_opt_in=bool(lat and lng and not zip and not city)
        )
        
        # Store in analytics collection (fire and forget)
        await db.business_search_analytics.insert_one(search_event.dict())
    except Exception as e:
        logger.warning(f"Failed to log search analytics: {e}")
    
    return final_results
