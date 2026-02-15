"""
Local Exchange API Routes
BANIBS Social World Marketplace MVP

Local pickup listings (Facebook Marketplace style)
- No payments
- No shipping
- Approximate location only
- Message seller via ChatSphere (integrated)
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import os

router = APIRouter(prefix="/api/local-exchange", tags=["Local Exchange"])

# MongoDB connection
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "banibs_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
listings_collection = db["local_listings"]
users_collection = db["users"]
blocked_users_collection = db["blocked_users"]

# Categories for local exchange
LISTING_CATEGORIES = [
    {"id": "furniture", "name": "Furniture", "icon": "sofa"},
    {"id": "electronics", "name": "Electronics", "icon": "smartphone"},
    {"id": "clothing", "name": "Clothing & Accessories", "icon": "shirt"},
    {"id": "vehicles", "name": "Vehicles", "icon": "car"},
    {"id": "home", "name": "Home & Garden", "icon": "home"},
    {"id": "sports", "name": "Sports & Outdoors", "icon": "dumbbell"},
    {"id": "toys", "name": "Toys & Games", "icon": "gamepad-2"},
    {"id": "books", "name": "Books & Media", "icon": "book"},
    {"id": "baby", "name": "Baby & Kids", "icon": "baby"},
    {"id": "free", "name": "Free Items", "icon": "gift"},
    {"id": "services", "name": "Local Services", "icon": "wrench"},
    {"id": "other", "name": "Other", "icon": "package"},
]

CONDITIONS = [
    {"id": "new", "name": "New"},
    {"id": "like_new", "name": "Like New"},
    {"id": "good", "name": "Good"},
    {"id": "fair", "name": "Fair"},
    {"id": "for_parts", "name": "For Parts"},
]

# Auth dependency
from routes.auth import get_current_user
from middleware.auth_guard import get_current_user_optional

# Pydantic Models
class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str
    price: float = Field(ge=0)  # 0 = free
    is_free: bool = False
    condition: str
    photos: List[str] = Field(default_factory=list, max_length=10)
    location_city: str = Field(..., min_length=2, max_length=100)
    location_zip: str = Field(..., min_length=5, max_length=10)
    location_state: Optional[str] = None
    visibility_radius: int = Field(default=25, ge=5, le=100)  # miles

class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    is_free: Optional[bool] = None
    condition: Optional[str] = None
    photos: Optional[List[str]] = None
    location_city: Optional[str] = None
    location_zip: Optional[str] = None
    location_state: Optional[str] = None
    visibility_radius: Optional[int] = Field(None, ge=5, le=100)
    status: Optional[str] = None  # active, sold, removed

class ListingResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    price: float
    is_free: bool
    condition: str
    photos: List[str]
    location_city: str
    location_state: Optional[str]
    # Note: zip code is NOT exposed in listing response for privacy
    visibility_radius: int
    seller_id: str
    seller_name: str
    seller_avatar: Optional[str]
    status: str
    created_at: str
    updated_at: str
    view_count: int

class ReportCreate(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)
    category: str  # spam, inappropriate, scam, prohibited, other


# Helper to serialize listing
def serialize_listing(listing: dict, include_zip: bool = False) -> dict:
    result = {
        "id": str(listing["_id"]),
        "title": listing["title"],
        "description": listing["description"],
        "category": listing["category"],
        "price": listing["price"],
        "is_free": listing.get("is_free", listing["price"] == 0),
        "condition": listing["condition"],
        "photos": listing.get("photos", []),
        "location_city": listing["location_city"],
        "location_state": listing.get("location_state"),
        "visibility_radius": listing.get("visibility_radius", 25),
        "seller_id": listing["seller_id"],
        "seller_name": listing.get("seller_name", "BANIBS User"),
        "seller_avatar": listing.get("seller_avatar"),
        "seller_phone_verified": listing.get("seller_phone_verified", False),
        "status": listing.get("status", "active"),
        "created_at": listing["created_at"].isoformat() if isinstance(listing["created_at"], datetime) else listing["created_at"],
        "updated_at": listing.get("updated_at", listing["created_at"]),
        "view_count": listing.get("view_count", 0),
    }
    if isinstance(result["updated_at"], datetime):
        result["updated_at"] = result["updated_at"].isoformat()
    if include_zip:
        result["location_zip"] = listing.get("location_zip")
    return result


# Routes

@router.get("/categories")
async def get_categories():
    """Get all listing categories"""
    return {"categories": LISTING_CATEGORIES, "conditions": CONDITIONS}


@router.post("/listings", status_code=status.HTTP_201_CREATED)
async def create_listing(listing: ListingCreate, current_user: dict = Depends(get_current_user)):
    """Create a new local listing"""
    
    # Validate category
    valid_categories = [c["id"] for c in LISTING_CATEGORIES]
    if listing.category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {valid_categories}")
    
    # Validate condition
    valid_conditions = [c["id"] for c in CONDITIONS]
    if listing.condition not in valid_conditions:
        raise HTTPException(status_code=400, detail=f"Invalid condition. Must be one of: {valid_conditions}")
    
    now = datetime.now(timezone.utc)
    
    listing_doc = {
        "title": listing.title,
        "description": listing.description,
        "category": listing.category,
        "price": 0 if listing.is_free else listing.price,
        "is_free": listing.is_free or listing.price == 0,
        "condition": listing.condition,
        "photos": listing.photos[:10],  # Max 10 photos
        "location_city": listing.location_city,
        "location_zip": listing.location_zip,
        "location_state": listing.location_state,
        "visibility_radius": listing.visibility_radius,
        "seller_id": current_user["id"],
        "seller_name": current_user.get("name", "BANIBS User"),
        "seller_avatar": current_user.get("profile", {}).get("avatar_url") or current_user.get("avatar_url"),
        "seller_phone_verified": current_user.get("is_phone_verified", False),
        "status": "active",
        "created_at": now,
        "updated_at": now,
        "view_count": 0,
        "reports": [],
        "hidden_by": [],  # Users who hid this listing
    }
    
    result = await listings_collection.insert_one(listing_doc)
    listing_doc["_id"] = result.inserted_id
    
    return serialize_listing(listing_doc, include_zip=True)


@router.get("/listings")
async def get_listings(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    is_free: Optional[bool] = None,
    city: Optional[str] = None,
    sort: str = Query("newest", enum=["newest", "oldest", "price_low", "price_high"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Browse local listings with filters"""
    
    query = {"status": "active"}
    
    # Category filter
    if category:
        query["category"] = category
    
    # Search filter
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Price filters
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    # Free items filter
    if is_free is not None:
        query["is_free"] = is_free
    
    # Condition filter
    if condition:
        query["condition"] = condition
    
    # City filter
    if city:
        query["location_city"] = {"$regex": city, "$options": "i"}
    
    # Hide listings the user has hidden
    if current_user:
        query["hidden_by"] = {"$ne": current_user["id"]}
    
    # Sort
    sort_map = {
        "newest": [("created_at", -1)],
        "oldest": [("created_at", 1)],
        "price_low": [("price", 1)],
        "price_high": [("price", -1)],
    }
    sort_order = sort_map.get(sort, [("created_at", -1)])
    
    # Execute query
    cursor = listings_collection.find(query).sort(sort_order).skip(skip).limit(limit)
    listings = await cursor.to_list(length=limit)
    
    # Get total count
    total = await listings_collection.count_documents(query)
    
    return {
        "listings": [serialize_listing(l) for l in listings],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }


@router.get("/listings/mine")
async def get_my_listings(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's listings"""
    
    query = {"seller_id": current_user["id"]}
    if status:
        query["status"] = status
    
    cursor = listings_collection.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    listings = await cursor.to_list(length=limit)
    total = await listings_collection.count_documents(query)
    
    return {
        "listings": [serialize_listing(l, include_zip=True) for l in listings],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/listings/{listing_id}")
async def get_listing(listing_id: str, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """Get a single listing by ID"""
    
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await listings_collection.find_one({"_id": oid})
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check if hidden by current user
    if current_user and current_user["id"] in listing.get("hidden_by", []):
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Increment view count (only if not own listing)
    if not current_user or current_user["id"] != listing["seller_id"]:
        await listings_collection.update_one(
            {"_id": oid},
            {"$inc": {"view_count": 1}}
        )
        listing["view_count"] = listing.get("view_count", 0) + 1
    
    # Include zip only for the seller
    include_zip = current_user and current_user["id"] == listing["seller_id"]
    
    return serialize_listing(listing, include_zip=include_zip)


@router.patch("/listings/{listing_id}")
async def update_listing(
    listing_id: str, 
    update: ListingUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update a listing (seller only)"""
    
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await listings_collection.find_one({"_id": oid})
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["seller_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")
    
    # Build update document
    update_doc = {"updated_at": datetime.now(timezone.utc)}
    update_data = update.dict(exclude_unset=True)
    
    # Validate category if provided
    if "category" in update_data:
        valid_categories = [c["id"] for c in LISTING_CATEGORIES]
        if update_data["category"] not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category")
    
    # Validate condition if provided
    if "condition" in update_data:
        valid_conditions = [c["id"] for c in CONDITIONS]
        if update_data["condition"] not in valid_conditions:
            raise HTTPException(status_code=400, detail="Invalid condition")
    
    # Validate status if provided
    if "status" in update_data:
        if update_data["status"] not in ["active", "sold", "removed"]:
            raise HTTPException(status_code=400, detail="Invalid status")
    
    update_doc.update(update_data)
    
    # Handle is_free and price relationship
    if "is_free" in update_doc and update_doc["is_free"]:
        update_doc["price"] = 0
    elif "price" in update_doc and update_doc["price"] == 0:
        update_doc["is_free"] = True
    
    await listings_collection.update_one({"_id": oid}, {"$set": update_doc})
    
    updated_listing = await listings_collection.find_one({"_id": oid})
    return serialize_listing(updated_listing, include_zip=True)


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a listing (seller only)"""
    
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await listings_collection.find_one({"_id": oid})
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["seller_id"] != current_user["id"]:
        # Allow admins to delete any listing
        if current_user.get("role") not in ["admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="You can only delete your own listings")
    
    await listings_collection.delete_one({"_id": oid})
    return None


@router.post("/listings/{listing_id}/report")
async def report_listing(
    listing_id: str,
    report: ReportCreate,
    current_user: dict = Depends(get_current_user)
):
    """Report a listing"""
    
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await listings_collection.find_one({"_id": oid})
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing["seller_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot report your own listing")
    
    report_doc = {
        "user_id": current_user["id"],
        "reason": report.reason,
        "category": report.category,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await listings_collection.update_one(
        {"_id": oid},
        {"$push": {"reports": report_doc}}
    )
    
    return {"message": "Report submitted. Thank you for helping keep BANIBS safe."}


@router.post("/listings/{listing_id}/hide")
async def hide_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    """Hide a listing from your feed"""
    
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    listing = await listings_collection.find_one({"_id": oid})
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    await listings_collection.update_one(
        {"_id": oid},
        {"$addToSet": {"hidden_by": current_user["id"]}}
    )
    
    return {"message": "Listing hidden from your feed"}


@router.post("/listings/{listing_id}/unhide")
async def unhide_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    """Unhide a listing"""
    
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    await listings_collection.update_one(
        {"_id": oid},
        {"$pull": {"hidden_by": current_user["id"]}}
    )
    
    return {"message": "Listing unhidden"}



# ============================================================================
# ChatSphere Integration - Message Seller
# ============================================================================

class InitiateConversationResponse(BaseModel):
    conversation_id: str
    is_new: bool
    listing_context: dict


async def check_user_blocked(user_id: str, target_user_id: str) -> bool:
    """Check if either user has blocked the other"""
    # Check both directions
    block = await blocked_users_collection.find_one({
        "$or": [
            {"blocker_id": user_id, "blocked_id": target_user_id},
            {"blocker_id": target_user_id, "blocked_id": user_id}
        ]
    })
    return block is not None


@router.post("/listings/{listing_id}/initiate-chat")
async def initiate_listing_conversation(
    listing_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate or retrieve a ChatSphere conversation for a listing.
    
    - If conversation exists between buyer and seller for this listing: return it
    - If no conversation exists: create new one with listing context
    - Respects block/hide states
    
    Returns:
        - conversation_id: ID of existing or newly created conversation
        - is_new: Whether this is a new conversation
        - listing_context: Context block to display in chat
    """
    from models.messaging_conversation import Conversation
    from services.messaging_service import create_conversation, transform_conversation_for_api
    
    # Validate listing ID
    try:
        oid = ObjectId(listing_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid listing ID")
    
    # Fetch the listing
    listing = await listings_collection.find_one({"_id": oid})
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check if listing is active
    if listing.get("status") != "active":
        raise HTTPException(status_code=400, detail="This listing is no longer available")
    
    buyer_id = current_user["id"]
    seller_id = listing["seller_id"]
    
    # Cannot message yourself
    if buyer_id == seller_id:
        raise HTTPException(status_code=400, detail="You cannot message yourself")
    
    # Check block states (safety requirement)
    is_blocked = await check_user_blocked(buyer_id, seller_id)
    if is_blocked:
        raise HTTPException(
            status_code=403, 
            detail="Unable to start conversation. One of you has blocked the other."
        )
    
    # Build listing context
    listing_context = {
        "type": "listing_context",
        "listing_id": listing_id,
        "title": listing["title"],
        "price": listing["price"],
        "is_free": listing.get("is_free", listing["price"] == 0),
        "thumbnail": listing.get("photos", [None])[0],
        "link": f"/socialworld/local/{listing_id}",
        "category": listing.get("category"),
        "condition": listing.get("condition"),
        "seller_name": listing.get("seller_name", "Seller"),
        "location_city": listing.get("location_city", ""),
    }
    
    # Check for existing conversation for this listing between buyer and seller
    existing_conv = await Conversation.find_one({
        "participant_ids": {"$all": [buyer_id, seller_id]},
        "metadata.listing_id": listing_id
    })
    
    if existing_conv:
        # Return existing conversation
        return {
            "conversation_id": str(existing_conv.id),
            "is_new": False,
            "listing_context": listing_context
        }
    
    # Create new conversation with listing context in metadata
    now = datetime.now(timezone.utc)
    new_conv = Conversation(
        type="dm",
        participant_ids=[buyer_id, seller_id],
        title=None,  # Will be auto-generated from other participant's name
        metadata={
            "listing_id": listing_id,
            "listing_title": listing["title"],
            "listing_thumbnail": listing.get("photos", [None])[0],
            "listing_link": f"/socialworld/local/{listing_id}",
            "listing_price": listing["price"],
            "listing_is_free": listing.get("is_free", listing["price"] == 0),
            "initiated_by": buyer_id,
            "initiated_at": now.isoformat()
        },
        last_message_preview=f"📦 Inquiry about: {listing['title'][:50]}",
        last_message_at=now,
        created_at=now,
        updated_at=now,
    )
    await new_conv.insert()
    
    # Create the initial system message with listing context
    from models.messaging_message import Message
    
    system_message = Message(
        conversation_id=str(new_conv.id),
        sender_id="system",
        type="listing_context",
        text=f"Conversation started about: {listing['title']}",
        metadata={
            "listing_id": listing_id,
            "listing_title": listing["title"],
            "listing_price": listing["price"],
            "listing_is_free": listing.get("is_free", listing["price"] == 0),
            "listing_thumbnail": listing.get("photos", [None])[0],
            "listing_link": f"/socialworld/local/{listing_id}",
            "listing_category": listing.get("category"),
            "listing_condition": listing.get("condition"),
            "listing_seller_name": listing.get("seller_name", "Seller"),
            "listing_location": listing.get("location_city", "")
        },
        created_at=now,
        read_by=[buyer_id, seller_id],  # Both see this
    )
    await system_message.insert()
    
    return {
        "conversation_id": str(new_conv.id),
        "is_new": True,
        "listing_context": listing_context
    }
