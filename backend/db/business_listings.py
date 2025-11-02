"""
Business Directory v2 - Database Operations

MongoDB operations for business_listings collection.
Includes computed directions_link logic.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from db.connection import get_db_client
from models.business_listing import BusinessListingPublic


async def create_business_listing(
    owner_id: str,
    business_name: str,
    contact_email: Optional[str] = None,
    contact_phone: Optional[str] = None,
    address_line1: Optional[str] = None,
    address_line2: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    postal_code: Optional[str] = None,
    country: str = "United States",
    job_title: Optional[str] = None,
    geo_latitude: Optional[float] = None,
    geo_longitude: Optional[float] = None,
    directions_url: Optional[str] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    website: Optional[str] = None,
    logo_url: Optional[str] = None
) -> str:
    """
    Create new business listing
    
    Returns:
        listing_id (UUID)
    """
    db = get_db_client()
    now = datetime.now(timezone.utc).isoformat()
    
    listing_id = str(uuid.uuid4())
    
    listing_doc = {
        "id": listing_id,
        "business_name": business_name,
        "contact_email": contact_email,
        "contact_phone": contact_phone,
        "address_line1": address_line1,
        "address_line2": address_line2,
        "city": city,
        "state": state,
        "postal_code": postal_code,
        "country": country,
        "job_title": job_title,
        "geo_latitude": geo_latitude,
        "geo_longitude": geo_longitude,
        "directions_url": directions_url,
        "description": description,
        "category": category,
        "website": website,
        "logo_url": logo_url,
        "verified": False,
        "featured": False,
        "status": "active",
        "owner_id": owner_id,
        "created_at": now,
        "updated_at": now
    }
    
    await db.business_listings.insert_one(listing_doc)
    return listing_id


async def get_business_listing_by_id(listing_id: str) -> Optional[dict]:
    """
    Get business listing by ID
    """
    db = get_db_client()
    return await db.business_listings.find_one({"id": listing_id})


async def get_all_business_listings(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    verified_only: bool = False
) -> List[dict]:
    """
    Get all business listings with optional filters
    """
    db = get_db_client()
    
    # Build query
    query = {"status": "active"}
    
    if category:
        query["category"] = category
    if city:
        query["city"] = city
    if state:
        query["state"] = state
    if verified_only:
        query["verified"] = True
    
    cursor = db.business_listings.find(query)
    cursor.skip(skip).limit(limit).sort("created_at", -1)
    
    return await cursor.to_list(length=limit)


async def update_business_listing(listing_id: str, update_data: dict) -> bool:
    """
    Update business listing
    
    Returns:
        True if updated, False if not found
    """
    db = get_db_client()
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.business_listings.update_one(
        {"id": listing_id},
        {"$set": update_data}
    )
    
    return result.modified_count > 0


async def delete_business_listing(listing_id: str) -> bool:
    """
    Delete (soft delete) business listing
    
    Returns:
        True if deleted, False if not found
    """
    db = get_db_client()
    
    result = await db.business_listings.update_one(
        {"id": listing_id},
        {"$set": {"status": "deleted", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return result.modified_count > 0


async def get_listings_by_owner(owner_id: str) -> List[dict]:
    """
    Get all listings owned by a user
    """
    db = get_db_client()
    
    cursor = db.business_listings.find({"owner_id": owner_id})
    cursor.sort("created_at", -1)
    
    return await cursor.to_list(length=None)


def compute_directions_link(listing: dict) -> Optional[str]:
    """
    Business Directory v2 - Compute directions_link field
    
    Logic:
    1. If directions_url exists → use it
    2. Else if geo_latitude and geo_longitude exist → build Google Maps link
    3. Else → return None
    
    Args:
        listing: Business listing document
    
    Returns:
        Directions link or None
    """
    # Priority 1: Custom directions URL
    if listing.get("directions_url"):
        return listing["directions_url"]
    
    # Priority 2: Generate from coordinates
    lat = listing.get("geo_latitude")
    lng = listing.get("geo_longitude")
    
    if lat is not None and lng is not None:
        return f"https://www.google.com/maps/search/?api=1&query={lat},{lng}"
    
    # No directions available
    return None


def sanitize_listing_response(listing: dict) -> dict:
    """
    Convert database listing to public API response
    Adds computed directions_link field
    """
    # Compute directions link
    directions_link = compute_directions_link(listing)
    
    return {
        "id": listing["id"],
        "business_name": listing["business_name"],
        "contact_email": listing.get("contact_email"),
        "contact_phone": listing.get("contact_phone"),
        "address_line1": listing.get("address_line1"),
        "address_line2": listing.get("address_line2"),
        "city": listing.get("city"),
        "state": listing.get("state"),
        "postal_code": listing.get("postal_code"),
        "country": listing.get("country", "United States"),
        "job_title": listing.get("job_title"),
        "geo_latitude": listing.get("geo_latitude"),
        "geo_longitude": listing.get("geo_longitude"),
        "directions_url": listing.get("directions_url"),
        "directions_link": directions_link,  # Computed field
        "description": listing.get("description"),
        "category": listing.get("category"),
        "website": listing.get("website"),
        "logo_url": listing.get("logo_url"),
        "verified": listing.get("verified", False),
        "featured": listing.get("featured", False),
        "created_at": listing["created_at"]
    }
