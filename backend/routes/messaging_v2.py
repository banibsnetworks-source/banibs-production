"""
BANIBS Messaging Engine - Phase 8.4
API Routes

FastAPI endpoints for 1-to-1 messaging with trust tier context.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase
from middleware.auth_guard import get_current_user
from db import get_db

from schemas.message import (
    MessageCreate, MessagePublic, ConversationPreview,
    MarkReadRequest, ConversationThread
)
from db.messaging_v2 import (
    send_message, get_conversation_thread,
    mark_conversation_read, get_conversation_previews,
    init_messages_collection
)


router = APIRouter(prefix="/api/messages", tags=["Messaging"])


# ==========================================
# INITIALIZATION
# ==========================================

@router.post("/initialize", include_in_schema=False)
async def initialize_messaging_system(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Initialize messaging system (collections + indexes)
    One-time setup
    """
    try:
        await init_messages_collection(db)
        return {
            "success": True,
            "message": "Messaging system initialized"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# SEND MESSAGE
# ==========================================

@router.post("/send", response_model=MessagePublic, status_code=201)
async def send_message_endpoint(
    message_data: MessageCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message to another user
    
    - Automatically determines trust tier from Relationship Engine
    - Creates conversation if it doesn't exist
    - Returns sent message with metadata
    """
    sender_id = current_user.get("id")
    
    if not sender_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Can't message yourself
    if message_data.receiverId == sender_id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    try:
        message = await send_message(db, sender_id, message_data)
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")


# ==========================================
# GET CONVERSATION THREAD
# ==========================================

@router.get("/thread/{other_user_id}", response_model=List[MessagePublic])
async def get_thread_endpoint(
    other_user_id: str,
    limit: int = Query(100, ge=1, le=200, description="Max messages to return"),
    before: Optional[datetime] = Query(None, description="Get messages before this timestamp"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get message thread with another user
    
    - Returns messages in chronological order (oldest first)
    - Supports pagination with 'before' parameter
    - Limited to 200 messages per request
    """
    user_id = current_user.get("id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        messages = await get_conversation_thread(db, user_id, other_user_id, limit, before)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get thread: {str(e)}")


# ==========================================
# MARK CONVERSATION AS READ
# ==========================================

@router.patch("/mark-read/{other_user_id}", response_model=dict)
async def mark_read_endpoint(
    other_user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all messages in a conversation as read
    
    - Marks all unread messages from other_user as read
    - Returns count of messages marked
    """
    user_id = current_user.get("id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        count = await mark_conversation_read(db, user_id, other_user_id)
        return {
            "success": True,
            "marked_read": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark as read: {str(e)}")


# ==========================================
# GET CONVERSATION PREVIEWS (INBOX)
# ==========================================

@router.get("/previews", response_model=List[ConversationPreview])
async def get_previews_endpoint(
    limit: int = Query(50, ge=1, le=100, description="Max conversations to return"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get conversation previews for inbox/messages list
    
    - Returns latest message from each conversation
    - Includes unread count per conversation
    - Sorted by most recent activity
    - Includes trust tier context
    """
    user_id = current_user.get("id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        previews = await get_conversation_previews(db, user_id, limit)
        return previews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get previews: {str(e)}")


# ==========================================
# GET UNREAD COUNT
# ==========================================

@router.get("/unread-count", response_model=dict)
async def get_unread_count_endpoint(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get total unread message count for current user
    
    - Quick endpoint for notification badge
    """
    user_id = current_user.get("id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        collection = db["messages_v2"]
        unread_count = await collection.count_documents({
            "receiverId": user_id,
            "readStatus": "unread"
        })
        
        return {
            "unread_count": unread_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get unread count: {str(e)}")
