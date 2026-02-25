"""
User Pinning + Pin Boards API
BANIBS Platform-Wide Pinning System

Features:
- Users can pin any supported content (Frames, Listings, News, HDOS analyses, etc.)
- Users organize pins into Boards (private by default)
- Pins are user-owned, portable, non-extractive
- No rankings, no gamification, no urgency loops
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from bson import ObjectId
import os

router = APIRouter(prefix="/api/pins", tags=["Pins"])

# MongoDB connection
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "banibs_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
pin_boards_collection = db["pin_boards"]
pins_collection = db["pins"]

# Auth
from middleware.auth_guard import get_current_user

# =============================================================================
# MODELS
# =============================================================================

class ContentSnapshot(BaseModel):
    """Minimal, non-authoritative cache for fast rendering"""
    title: str
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    route: str  # Deep link within app
    source: Optional[str] = None  # Publisher/site for news


class BoardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class BoardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class PinCreate(BaseModel):
    board_id: Optional[str] = None  # If missing, use default "Saved" board
    content_type: Literal["frame", "news", "listing", "hdos_analysis", "note", "article", "video", "product", "social_post"]
    content_id: str
    content_snapshot: ContentSnapshot
    tags: Optional[List[str]] = []


class PinMove(BaseModel):
    pin_id: str
    to_board_id: str


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def serialize_board(board: dict) -> dict:
    """Convert MongoDB board document to API response"""
    return {
        "id": str(board["_id"]),
        "name": board["name"],
        "description": board.get("description", ""),
        "is_default": board.get("is_default", False),
        "visibility": board.get("visibility", "private"),
        "pin_count": board.get("pin_count", 0),
        "created_at": board["created_at"].isoformat() if board.get("created_at") else None,
        "updated_at": board["updated_at"].isoformat() if board.get("updated_at") else None
    }


def serialize_pin(pin: dict) -> dict:
    """Convert MongoDB pin document to API response"""
    return {
        "id": str(pin["_id"]),
        "board_id": str(pin["board_id"]),
        "content_type": pin["content_type"],
        "content_id": pin["content_id"],
        "content_snapshot": pin.get("content_snapshot", {}),
        "tags": pin.get("tags", []),
        "pinned_at": pin["pinned_at"].isoformat() if pin.get("pinned_at") else None,
        "updated_at": pin["updated_at"].isoformat() if pin.get("updated_at") else None
    }


async def ensure_default_board(user_id: str) -> dict:
    """Ensure user has a default 'Saved' board, create if missing"""
    default_board = await pin_boards_collection.find_one({
        "user_id": user_id,
        "is_default": True
    })
    
    if not default_board:
        now = datetime.now(timezone.utc)
        default_board = {
            "user_id": user_id,
            "name": "Saved",
            "description": "Default board for saved items",
            "is_default": True,
            "visibility": "private",
            "pin_count": 0,
            "created_at": now,
            "updated_at": now
        }
        result = await pin_boards_collection.insert_one(default_board)
        default_board["_id"] = result.inserted_id
    
    return default_board


async def update_board_pin_count(board_id: ObjectId, delta: int):
    """Update the pin count for a board"""
    await pin_boards_collection.update_one(
        {"_id": board_id},
        {"$inc": {"pin_count": delta}}
    )


# =============================================================================
# BOARD ENDPOINTS
# =============================================================================

@router.get("/boards")
async def get_boards(
    current_user: dict = Depends(get_current_user)
):
    """
    GET /api/pins/boards
    List all boards for the current user
    Auto-creates default 'Saved' board if none exist
    """
    user_id = current_user["id"]
    
    # Ensure default board exists
    await ensure_default_board(user_id)
    
    # Get all boards
    cursor = pin_boards_collection.find(
        {"user_id": user_id}
    ).sort("created_at", 1)
    
    boards = []
    async for board in cursor:
        boards.append(serialize_board(board))
    
    return {
        "boards": boards,
        "total": len(boards)
    }


@router.post("/boards")
async def create_board(
    board_data: BoardCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    POST /api/pins/boards
    Create a new board
    """
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)
    
    # Check if board with same name exists
    existing = await pin_boards_collection.find_one({
        "user_id": user_id,
        "name": board_data.name
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Board with this name already exists")
    
    board = {
        "user_id": user_id,
        "name": board_data.name,
        "description": board_data.description or "",
        "is_default": False,
        "visibility": "private",  # v1: private only
        "pin_count": 0,
        "created_at": now,
        "updated_at": now
    }
    
    result = await pin_boards_collection.insert_one(board)
    board["_id"] = result.inserted_id
    
    return serialize_board(board)


@router.get("/boards/{board_id}")
async def get_board(
    board_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    GET /api/pins/boards/{board_id}
    Get a specific board
    """
    user_id = current_user["id"]
    
    try:
        oid = ObjectId(board_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid board ID")
    
    board = await pin_boards_collection.find_one({
        "_id": oid,
        "user_id": user_id
    })
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    return serialize_board(board)


@router.patch("/boards/{board_id}")
async def update_board(
    board_id: str,
    board_data: BoardUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    PATCH /api/pins/boards/{board_id}
    Update a board's name or description
    """
    user_id = current_user["id"]
    
    try:
        oid = ObjectId(board_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid board ID")
    
    board = await pin_boards_collection.find_one({
        "_id": oid,
        "user_id": user_id
    })
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Build update dict
    update_data = {"updated_at": datetime.now(timezone.utc)}
    
    if board_data.name is not None:
        # Check for duplicate name
        existing = await pin_boards_collection.find_one({
            "user_id": user_id,
            "name": board_data.name,
            "_id": {"$ne": oid}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Board with this name already exists")
        update_data["name"] = board_data.name
    
    if board_data.description is not None:
        update_data["description"] = board_data.description
    
    await pin_boards_collection.update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    # Return updated board
    updated = await pin_boards_collection.find_one({"_id": oid})
    return serialize_board(updated)


@router.delete("/boards/{board_id}")
async def delete_board(
    board_id: str,
    move_pins_to_default: bool = Query(True, description="Move pins to default board instead of deleting"),
    current_user: dict = Depends(get_current_user)
):
    """
    DELETE /api/pins/boards/{board_id}
    Delete a board
    - Cannot delete default 'Saved' board
    - Options: move pins to default board OR cascade delete
    """
    user_id = current_user["id"]
    
    try:
        oid = ObjectId(board_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid board ID")
    
    board = await pin_boards_collection.find_one({
        "_id": oid,
        "user_id": user_id
    })
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if board.get("is_default"):
        raise HTTPException(status_code=400, detail="Cannot delete the default 'Saved' board")
    
    # Handle pins
    if move_pins_to_default:
        # Move all pins to default board
        default_board = await ensure_default_board(user_id)
        pins_count = await pins_collection.count_documents({
            "user_id": user_id,
            "board_id": oid
        })
        
        await pins_collection.update_many(
            {"user_id": user_id, "board_id": oid},
            {"$set": {"board_id": default_board["_id"], "updated_at": datetime.now(timezone.utc)}}
        )
        
        # Update pin counts
        await update_board_pin_count(default_board["_id"], pins_count)
    else:
        # Cascade delete pins
        await pins_collection.delete_many({
            "user_id": user_id,
            "board_id": oid
        })
    
    # Delete the board
    await pin_boards_collection.delete_one({"_id": oid})
    
    return {"message": "Board deleted", "pins_moved": move_pins_to_default}


# =============================================================================
# PIN ENDPOINTS
# =============================================================================

@router.post("")
async def create_pin(
    pin_data: PinCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    POST /api/pins
    Pin content to a board
    - If board_id missing, uses default 'Saved' board
    - Idempotent: returns existing pin if already pinned to same board
    """
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)
    
    # Resolve board
    if pin_data.board_id:
        try:
            board_oid = ObjectId(pin_data.board_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid board ID")
        
        board = await pin_boards_collection.find_one({
            "_id": board_oid,
            "user_id": user_id
        })
        if not board:
            raise HTTPException(status_code=404, detail="Board not found")
    else:
        board = await ensure_default_board(user_id)
        board_oid = board["_id"]
    
    # Check for duplicate (idempotent)
    existing_pin = await pins_collection.find_one({
        "user_id": user_id,
        "board_id": board_oid,
        "content_type": pin_data.content_type,
        "content_id": pin_data.content_id
    })
    
    if existing_pin:
        # Return existing pin (idempotent)
        return {
            "pin": serialize_pin(existing_pin),
            "created": False,
            "message": "Item already pinned to this board"
        }
    
    # Create new pin
    pin = {
        "user_id": user_id,
        "board_id": board_oid,
        "content_type": pin_data.content_type,
        "content_id": pin_data.content_id,
        "content_snapshot": pin_data.content_snapshot.model_dump(),
        "tags": pin_data.tags or [],
        "pinned_at": now,
        "updated_at": now
    }
    
    result = await pins_collection.insert_one(pin)
    pin["_id"] = result.inserted_id
    
    # Update board pin count
    await update_board_pin_count(board_oid, 1)
    
    return {
        "pin": serialize_pin(pin),
        "created": True,
        "message": "Item pinned successfully"
    }


@router.get("")
async def get_pins(
    board_id: Optional[str] = None,
    content_type: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(50, le=100),
    cursor: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    GET /api/pins
    List pins with optional filters
    - board_id: filter by board (default: all boards)
    - content_type: filter by type
    - q: search title in snapshot
    - cursor pagination by pinned_at/_id
    """
    user_id = current_user["id"]
    
    # Build query
    query = {"user_id": user_id}
    
    if board_id:
        try:
            query["board_id"] = ObjectId(board_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid board ID")
    
    if content_type:
        query["content_type"] = content_type
    
    if q:
        query["content_snapshot.title"] = {"$regex": q, "$options": "i"}
    
    # Cursor pagination
    if cursor:
        try:
            cursor_oid = ObjectId(cursor)
            cursor_doc = await pins_collection.find_one({"_id": cursor_oid})
            if cursor_doc:
                query["$or"] = [
                    {"pinned_at": {"$lt": cursor_doc["pinned_at"]}},
                    {"pinned_at": cursor_doc["pinned_at"], "_id": {"$lt": cursor_oid}}
                ]
        except:
            pass
    
    # Execute query
    cursor_db = pins_collection.find(query).sort([
        ("pinned_at", -1),
        ("_id", -1)
    ]).limit(limit + 1)
    
    pins = []
    async for pin in cursor_db:
        pins.append(serialize_pin(pin))
    
    # Check for more
    has_more = len(pins) > limit
    if has_more:
        pins = pins[:limit]
    
    next_cursor = pins[-1]["id"] if pins and has_more else None
    
    return {
        "pins": pins,
        "has_more": has_more,
        "next_cursor": next_cursor,
        "total": await pins_collection.count_documents({"user_id": user_id}) if not cursor else None
    }


@router.get("/{pin_id}")
async def get_pin(
    pin_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    GET /api/pins/{pin_id}
    Get a specific pin
    """
    user_id = current_user["id"]
    
    try:
        oid = ObjectId(pin_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid pin ID")
    
    pin = await pins_collection.find_one({
        "_id": oid,
        "user_id": user_id
    })
    
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    return serialize_pin(pin)


@router.delete("/{pin_id}")
async def delete_pin(
    pin_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    DELETE /api/pins/{pin_id}
    Delete a pin
    """
    user_id = current_user["id"]
    
    try:
        oid = ObjectId(pin_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid pin ID")
    
    pin = await pins_collection.find_one({
        "_id": oid,
        "user_id": user_id
    })
    
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    # Delete pin
    await pins_collection.delete_one({"_id": oid})
    
    # Update board pin count
    await update_board_pin_count(pin["board_id"], -1)
    
    return {"message": "Pin deleted"}


@router.post("/move")
async def move_pin(
    move_data: PinMove,
    current_user: dict = Depends(get_current_user)
):
    """
    POST /api/pins/move
    Move a pin to a different board
    """
    user_id = current_user["id"]
    
    try:
        pin_oid = ObjectId(move_data.pin_id)
        to_board_oid = ObjectId(move_data.to_board_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Verify pin ownership
    pin = await pins_collection.find_one({
        "_id": pin_oid,
        "user_id": user_id
    })
    
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    # Verify target board ownership
    to_board = await pin_boards_collection.find_one({
        "_id": to_board_oid,
        "user_id": user_id
    })
    
    if not to_board:
        raise HTTPException(status_code=404, detail="Target board not found")
    
    # Check if already in target board
    if pin["board_id"] == to_board_oid:
        return {"message": "Pin is already in this board", "moved": False}
    
    # Check for duplicate in target board
    existing = await pins_collection.find_one({
        "user_id": user_id,
        "board_id": to_board_oid,
        "content_type": pin["content_type"],
        "content_id": pin["content_id"]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Item already pinned to target board")
    
    # Move pin
    old_board_id = pin["board_id"]
    await pins_collection.update_one(
        {"_id": pin_oid},
        {"$set": {
            "board_id": to_board_oid,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Update pin counts
    await update_board_pin_count(old_board_id, -1)
    await update_board_pin_count(to_board_oid, 1)
    
    return {"message": "Pin moved successfully", "moved": True}


@router.get("/check/{content_type}/{content_id}")
async def check_pin_status(
    content_type: str,
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    GET /api/pins/check/{content_type}/{content_id}
    Check if content is pinned and to which boards
    """
    user_id = current_user["id"]
    
    cursor = pins_collection.find({
        "user_id": user_id,
        "content_type": content_type,
        "content_id": content_id
    })
    
    pins = []
    async for pin in cursor:
        pins.append({
            "pin_id": str(pin["_id"]),
            "board_id": str(pin["board_id"])
        })
    
    return {
        "is_pinned": len(pins) > 0,
        "pin_count": len(pins),
        "pins": pins
    }
