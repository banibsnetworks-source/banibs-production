"""
Messaging API Routes
Phase 6.2.2 - Messaging System
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from models.message import (
    ConversationPublic,
    ConversationCreate,
    MessagePublic,
    MessageCreate,
    UnreadMessageCount,
    ConversationWithMessages
)
from db.messages import (
    get_user_conversations,
    get_conversation_by_id,
    find_or_create_conversation,
    create_message,
    get_conversation_messages,
    mark_conversation_as_read,
    get_total_unread_count
)
from db.unified_users import get_user_by_id
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/conversations", response_model=List[ConversationPublic])
async def get_conversations(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's conversations (inbox)
    
    Query params:
    - limit: Max conversations to return (1-100, default 50)
    - skip: Number to skip for pagination (default 0)
    
    Returns:
        List of conversations sorted by last_message_at descending
    """
    user_id = current_user["id"]
    conversations = await get_user_conversations(
        user_id=user_id,
        limit=limit,
        skip=skip
    )
    
    return [ConversationPublic(**conv) for conv in conversations]


@router.get("/unread-count", response_model=UnreadMessageCount)
async def get_unread_messages_count(
    current_user: dict = Depends(get_current_user)
):
    """
    Get total unread message count for current user
    
    Used by frontend to show badge count in top nav
    
    Returns:
        { "unread_count": 3 }
    """
    user_id = current_user["id"]
    count = await get_total_unread_count(user_id)
    
    return UnreadMessageCount(unread_count=count)


@router.post("/conversations", response_model=ConversationPublic)
async def start_or_find_conversation(
    other_user_id: str = Query(..., description="UUID of the user to message"),
    current_user: dict = Depends(get_current_user)
):
    """
    Start a new conversation or find existing one with another user
    
    Query params:
    - other_user_id: UUID of the user to start conversation with
    
    Returns:
        Conversation (existing or newly created)
    """
    user_id = current_user["id"]
    
    # Prevent self-messaging
    if user_id == other_user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot start conversation with yourself"
        )
    
    # Get other user's details
    other_user = await get_user_by_id(other_user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find or create conversation
    conversation = await find_or_create_conversation(
        user1_id=user_id,
        user1_name=current_user["name"],
        user1_avatar=current_user.get("avatar_url"),
        user2_id=other_user_id,
        user2_name=other_user["name"],
        user2_avatar=other_user.get("avatar_url")
    )
    
    return ConversationPublic(**conversation)


@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation_with_messages(
    conversation_id: str,
    limit: int = Query(100, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a conversation with its messages
    
    Path params:
    - conversation_id: UUID of the conversation
    
    Query params:
    - limit: Max messages to return (1-200, default 100)
    - skip: Number to skip for pagination (default 0)
    
    Returns:
        Conversation with messages
    """
    user_id = current_user["id"]
    
    # Get conversation (with participant auth check)
    conversation = await get_conversation_by_id(conversation_id, user_id)
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or unauthorized"
        )
    
    # Get messages
    messages = await get_conversation_messages(
        conversation_id=conversation_id,
        user_id=user_id,
        limit=limit,
        skip=skip
    )
    
    return ConversationWithMessages(
        conversation=ConversationPublic(**conversation),
        messages=[MessagePublic(**msg) for msg in messages]
    )


@router.post("/conversations/{conversation_id}/send", response_model=MessagePublic)
async def send_message(
    conversation_id: str,
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message in a conversation
    
    Path params:
    - conversation_id: UUID of the conversation
    
    Body:
    {
      "content": "Hello, how are you?"
    }
    
    Returns:
        Created message
    """
    user_id = current_user["id"]
    
    # Verify user is participant
    conversation = await get_conversation_by_id(conversation_id, user_id)
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or unauthorized"
        )
    
    # Create message (content will be sanitized in DB layer)
    message = await create_message(
        conversation_id=conversation_id,
        sender_id=user_id,
        sender_name=current_user["name"],
        content=message_data.content
    )
    
    return MessagePublic(**message)


@router.patch("/conversations/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all messages in a conversation as read
    
    Path params:
    - conversation_id: UUID of the conversation
    
    Returns:
        { "marked_read": 5 }
    """
    user_id = current_user["id"]
    
    # Verify user is participant
    conversation = await get_conversation_by_id(conversation_id, user_id)
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or unauthorized"
        )
    
    count = await mark_conversation_as_read(conversation_id, user_id)
    
    return {"marked_read": count}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a conversation (soft delete - just removes from user's view)
    
    Note: In v1, this is a stub. Full implementation would add a 
    'hidden_for' array to track which users have hidden the conversation.
    
    Path params:
    - conversation_id: UUID of the conversation
    
    Returns:
        { "deleted": true }
    """
    user_id = current_user["id"]
    
    # Verify user is participant
    conversation = await get_conversation_by_id(conversation_id, user_id)
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or unauthorized"
        )
    
    # TODO: Implement soft delete (add to 'hidden_for' array)
    # For now, just return success
    
    return {"deleted": True, "note": "Soft delete not yet implemented in v1"}
