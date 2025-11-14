# backend/services/messaging_service.py
from datetime import datetime
from typing import List, Optional, Dict, Any

from models.messaging_conversation import Conversation
from models.messaging_message import Message


def transform_conversation_for_api(conv: Conversation) -> Dict[str, Any]:
    """Transform a Conversation document for API response (frontend compatibility)"""
    data = conv.dict()
    
    # Replace _id with id
    if "_id" in data:
        data["id"] = str(data["_id"])
        del data["_id"]
    
    # Generate title for DMs if not set
    if conv.type == "dm" and not data.get("title"):
        data["title"] = "Direct Message"
    
    return data


def transform_message_for_api(msg: Message) -> Dict[str, Any]:
    """Transform a Message document for API response (frontend compatibility)"""
    data = msg.dict()
    
    # Replace _id with id
    if "_id" in data:
        data["id"] = str(data["_id"])
        del data["_id"]
    
    return data


async def _get_conversation_raw(conversation_id: str, user_id: str) -> Optional[Conversation]:
    """Internal helper to get raw Conversation object (for updates)"""
    conv = await Conversation.get(conversation_id)
    if not conv:
        return None
    if user_id not in conv.participant_ids:
        return None
    return conv


async def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
    """Get all conversations where user is a participant."""
    conversations = await Conversation.find(
        Conversation.participant_ids == user_id
    ).sort(-Conversation.last_message_at).to_list()
    
    # Transform for frontend compatibility
    return [transform_conversation_for_api(conv) for conv in conversations]


async def get_conversation_for_user(
    conversation_id: str,
    user_id: str,
) -> Optional[Dict[str, Any]]:
    """Get a conversation if user is a participant."""
    conv = await _get_conversation_raw(conversation_id, user_id)
    if not conv:
        return None
    return transform_conversation_for_api(conv)


async def get_messages_for_conversation(
    conversation_id: str,
    user_id: str,
    skip: int = 0,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Get messages for a conversation (user must be participant)."""
    # Ensure user is in this conversation
    conv = await get_conversation_for_user(conversation_id, user_id)
    if not conv:
        return []

    messages = await Message.find(
        Message.conversation_id == conversation_id
    ).sort(+Message.created_at).skip(skip).limit(limit).to_list()
    
    # Transform for frontend compatibility
    return [transform_message_for_api(msg) for msg in messages]


async def create_conversation(
    type_: str,
    participant_ids: List[str],
    title: Optional[str] = None,
    business_id: Optional[str] = None,
) -> Conversation:
    """Create a new conversation."""
    now = datetime.utcnow()
    conv = Conversation(
        type=type_,
        participant_ids=participant_ids,
        title=title,
        business_id=business_id,
        last_message_preview=None,
        last_message_at=now,
        created_at=now,
        updated_at=now,
    )
    await conv.insert()
    return conv


async def send_message(
    conversation_id: str,
    sender_id: str,
    type_: str = "text",
    text: Optional[str] = None,
    media_url: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> Optional[Dict[str, Any]]:
    """
    Send a message to a conversation.
    
    This is the CORE method for Phase 3.1-3.2:
    - HTTP POST handler calls this
    - WebSocket event handler will also call this (Phase 3.2)
    """
    conv = await _get_conversation_raw(conversation_id, sender_id)
    if not conv:
        return None

    now = datetime.utcnow()
    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        type=type_,
        text=text,
        media_url=media_url,
        metadata=metadata or {},
        created_at=now,
        read_by=[sender_id],  # sender has read their own message
    )
    await msg.insert()

    # Update conversation's last message
    conv.last_message_preview = text[:100] if text else "[media]"
    conv.last_message_at = now
    conv.updated_at = now
    await conv.save()

    # 🔜 Phase 3.2: emit WebSocket event here
    # socket_manager.emit('message_received', msg, room=conversation_id)
    
    return transform_message_for_api(msg)


async def mark_messages_read(
    conversation_id: str,
    user_id: str,
) -> int:
    """Mark all unread messages in a conversation as read by user."""
    conv = await get_conversation_for_user(conversation_id, user_id)
    if not conv:
        return 0

    count = 0
    msgs = Message.find(
        Message.conversation_id == conversation_id,
        Message.read_by != user_id  # Only get messages not yet read by this user
    )
    
    async for msg in msgs:
        if user_id not in msg.read_by:
            msg.read_by.append(user_id)
            await msg.save()
            count += 1

    # 🔜 Phase 3.2: emit socket event for read receipts
    # socket_manager.emit('messages_read', {...}, room=conversation_id)
    
    return count


# ---------- Phase 3 Add-Ons: Search & Delete ----------

async def search_user_messages(
    user_id: str,
    query: str,
    conversation_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Message]:
    """
    Search messages by text content.
    Only returns messages from conversations user participates in.
    Respects deleted_for and deleted_at.
    """
    # Build query filters
    filters = {
        "text": {"$regex": query, "$options": "i"},  # Case-insensitive search
        "deleted_at": None,  # Exclude globally deleted
        "deleted_for": {"$ne": user_id}  # Exclude deleted-for-me
    }
    
    if conversation_id:
        # Verify user is participant
        conv = await get_conversation_for_user(conversation_id, user_id)
        if not conv:
            return []
        filters["conversation_id"] = conversation_id
    else:
        # Get all user's conversations
        user_convs = await get_user_conversations(user_id)
        conv_ids = [str(c.id) for c in user_convs]
        filters["conversation_id"] = {"$in": conv_ids}
    
    # Search messages
    messages = await Message.find(filters).sort(-Message.created_at).skip(offset).limit(limit).to_list()
    
    return messages


async def delete_message_for_user(
    message_id: str,
    user_id: str
) -> bool:
    """
    Delete a message for a specific user only.
    Adds user_id to deleted_for array.
    """
    try:
        msg = await Message.get(message_id)
        if not msg:
            return False
        
        # Add to deleted_for if not already there
        if user_id not in msg.deleted_for:
            msg.deleted_for.append(user_id)
            await msg.save()
        
        return True
    except:
        return False


async def delete_message_for_everyone(
    message_id: str,
    user_id: str,
    user_role: str = "user"
) -> Optional[Message]:
    """
    Delete a message for everyone.
    Only sender or moderator/admin can do this.
    """
    try:
        msg = await Message.get(message_id)
        if not msg:
            return None
        
        # Check permissions
        is_sender = msg.sender_id == user_id
        is_moderator = user_role in ["moderator", "admin"]
        
        if not (is_sender or is_moderator):
            return None
        
        # Mark as deleted for everyone
        msg.deleted_at = datetime.utcnow()
        msg.text = "[This message was deleted]"
        await msg.save()
        
        # 🔜 Phase 3.2: emit socket event
        # socket_manager.emit('message_deleted', {...}, room=msg.conversation_id)
        
        return msg
    except:
        return None
