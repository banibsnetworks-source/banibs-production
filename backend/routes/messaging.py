# backend/routes/messaging.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from models.messaging_conversation import Conversation
from models.messaging_message import Message
from services.messaging_service import (
    get_user_conversations,
    get_conversation_for_user,
    get_messages_for_conversation,
    create_conversation,
    send_message,
    mark_messages_read,
)
from middleware.auth_guard import get_current_user


router = APIRouter(prefix="/api/messaging", tags=["messaging"])


# ---------- Pydantic Request Schemas ----------

class ConversationCreateRequest(BaseModel):
    type: str  # "dm" | "group" | "business"
    participant_ids: List[str]
    title: Optional[str] = None
    business_id: Optional[str] = None


class MessageCreateRequest(BaseModel):
    type: Optional[str] = "text"
    text: Optional[str] = None
    media_url: Optional[str] = None
    metadata: Optional[dict] = None


class MarkReadRequest(BaseModel):
    # For now, mark all messages in conversation as read
    pass


# ---------- Routes ----------

@router.get("/conversations")
async def list_conversations(
    current_user=Depends(get_current_user),
):
    """
    Get all conversations for the current user.
    
    Returns conversations sorted by last_message_at (most recent first).
    """
    user_id = current_user["id"]
    conversations = await get_user_conversations(user_id)
    return conversations


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    """
    Get a single conversation by ID.
    
    Returns 404 if conversation doesn't exist or user is not a participant.
    """
    user_id = current_user["id"]
    conv = await get_conversation_for_user(conversation_id, user_id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied"
        )
    return conv


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: str,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(50, ge=1, le=200, description="Messages per page"),
    current_user=Depends(get_current_user),
):
    """
    Get messages for a conversation (paginated).
    
    Messages are returned in chronological order (oldest first).
    """
    user_id = current_user["id"]
    skip = (page - 1) * limit
    
    msgs = await get_messages_for_conversation(
        conversation_id,
        user_id,
        skip=skip,
        limit=limit,
    )
    return msgs



@router.get("/users/search")
async def search_users_for_messaging(
    q: Optional[str] = Query(None, description="Search query for user name or email"),
    limit: int = Query(20, le=100),
    current_user=Depends(get_current_user),
):
    """
    Search for users to start a conversation with.
    Returns users excluding the current user.
    """
    from db.connection import get_db_client
    
    db = get_db_client()
    current_user_id = current_user["id"]
    
    # Build query
    query = {"id": {"$ne": current_user_id}}  # Exclude current user
    
    if q:
        # Search by name or email (case-insensitive)
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    
    # Fetch users
    users = await db.banibs_users.find(
        query,
        {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1}
    ).limit(limit).to_list(limit)
    
    return users


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
async def create_conversation_route(
    payload: ConversationCreateRequest,
    current_user=Depends(get_current_user),
):
    """
    Create a new conversation.
    
    The current user is automatically added to participant_ids.
    """
    user_id = current_user["id"]
    
    # Validation: Title required for group and business
    if payload.type in ["group", "business"] and not payload.title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Title is required for {payload.type} conversations"
        )
    
    # Validation: Business ID required for business conversations
    if payload.type == "business" and not payload.business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="business_id is required for business conversations"
        )
    
    # Ensure current user is included in participants
    participant_ids = set(payload.participant_ids)
    participant_ids.add(user_id)

    conv = await create_conversation(
        type_=payload.type,
        participant_ids=list(participant_ids),
        creator_user_id=user_id,
        title=payload.title,
        business_id=payload.business_id,
    )
    return conv


@router.post(
    "/conversations/{conversation_id}/messages",
    status_code=status.HTTP_201_CREATED,
)
async def create_message_route(
    conversation_id: str,
    payload: MessageCreateRequest,
    current_user=Depends(get_current_user),
):
    """
    Send a message to a conversation.
    
    Supports BANIBS emoji placeholders in text (e.g., [emoji:banibs_full_banibs_009]).
    """
    user_id = current_user["id"]
    
    # Validation: Text or media_url required
    if not payload.text and not payload.media_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either text or media_url is required"
        )
    
    msg = await send_message(
        conversation_id=conversation_id,
        sender_id=user_id,
        type_=payload.type or "text",
        text=payload.text,
        media_url=payload.media_url,
        metadata=payload.metadata,
    )
    
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied"
        )
    
    return msg


@router.post("/conversations/{conversation_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read_route(
    conversation_id: str,
    _payload: MarkReadRequest = MarkReadRequest(),
    current_user=Depends(get_current_user),
):
    """
    Mark all messages in a conversation as read by the current user.
    """
    user_id = current_user["id"]
    await mark_messages_read(conversation_id, user_id)
    return None


# ---------- Phase 3 Add-Ons: Search & Delete ----------

@router.get("/messages/search")
async def search_messages(
    q: str = Query(..., min_length=1, description="Search query"),
    conversation_id: Optional[str] = Query(None, description="Optional: limit to specific conversation"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user=Depends(get_current_user),
):
    """
    Search messages by text content.
    
    - Only returns messages from conversations user participates in
    - Respects delete-for-me and delete-for-everyone
    - Optional conversation filter
    """
    from services.messaging_service import search_user_messages
    
    user_id = current_user["id"]
    messages = await search_user_messages(
        user_id=user_id,
        query=q,
        conversation_id=conversation_id,
        limit=limit,
        offset=offset
    )
    return messages


@router.post("/messages/{message_id}/delete-for-me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message_for_me(
    message_id: str,
    current_user=Depends(get_current_user),
):
    """
    Delete a message for the current user only.
    Message remains visible to other participants.
    """
    from services.messaging_service import delete_message_for_user
    
    user_id = current_user["id"]
    success = await delete_message_for_user(message_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found or access denied"
        )
    
    return None


@router.post("/messages/{message_id}/delete-for-everyone")
async def delete_message_for_everyone_route(
    message_id: str,
    current_user=Depends(get_current_user),
):
    """
    Delete a message for everyone (sender only, or moderator/admin).
    Message is replaced with "This message was deleted" for all participants.
    """
    from services.messaging_service import delete_message_for_everyone
    
    user_id = current_user["id"]
    user_role = current_user.get("role", "user")
    
    message = await delete_message_for_everyone(
        message_id=message_id,
        user_id=user_id,
        user_role=user_role
    )
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages (or you're not a moderator)"
        )
    
    return message
