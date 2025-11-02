"""
Messaging Database Operations
Phase 6.2.2 - Messaging System
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import os
import uuid
import html

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
conversations_collection = db.banibs_conversations
messages_collection = db.banibs_messages


# ============================================
# Conversation Operations
# ============================================

async def create_conversation(
    participant_ids: List[str],
    participant_details: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Create a new conversation between two users
    
    Args:
        participant_ids: List of 2 user UUIDs
        participant_details: List of participant info (id, name, avatar_url)
    
    Returns:
        Created conversation document
    """
    # Sort participant IDs for consistent lookup
    sorted_participants = sorted(participant_ids)
    
    # Check if conversation already exists between these users
    existing = await conversations_collection.find_one({
        "participants": sorted_participants
    })
    
    if existing:
        return existing
    
    conversation = {
        "id": str(uuid.uuid4()),
        "participants": sorted_participants,
        "participant_details": participant_details,
        "last_message": None,
        "last_message_at": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await conversations_collection.insert_one(conversation)
    return conversation


async def get_user_conversations(
    user_id: str,
    limit: int = 50,
    skip: int = 0
) -> List[Dict[str, Any]]:
    """
    Get all conversations for a user
    
    Args:
        user_id: UUID of the user
        limit: Maximum conversations to return
        skip: Number to skip for pagination
    
    Returns:
        List of conversations sorted by last_message_at descending
    """
    conversations = await conversations_collection.find(
        {"participants": user_id},
        {"_id": 0}
    ).sort("last_message_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    # Calculate unread count for each conversation
    for conv in conversations:
        unread_count = await messages_collection.count_documents({
            "conversation_id": conv["id"],
            "sender_id": {"$ne": user_id},  # Not from current user
            "read": False
        })
        conv["unread_count"] = unread_count
    
    return conversations


async def get_conversation_by_id(
    conversation_id: str,
    user_id: str
) -> Optional[Dict[str, Any]]:
    """
    Get a single conversation by ID (with auth check)
    
    Args:
        conversation_id: UUID of the conversation
        user_id: UUID of the user (for authorization)
    
    Returns:
        Conversation document or None
    """
    conversation = await conversations_collection.find_one(
        {"id": conversation_id, "participants": user_id},
        {"_id": 0}
    )
    
    if conversation:
        # Calculate unread count
        unread_count = await messages_collection.count_documents({
            "conversation_id": conversation_id,
            "sender_id": {"$ne": user_id},
            "read": False
        })
        conversation["unread_count"] = unread_count
    
    return conversation


async def update_conversation_last_message(
    conversation_id: str,
    message_content: str
):
    """
    Update conversation's last message info
    
    Args:
        conversation_id: UUID of the conversation
        message_content: Content of the last message
    """
    await conversations_collection.update_one(
        {"id": conversation_id},
        {
            "$set": {
                "last_message": message_content[:100],  # Truncate to 100 chars
                "last_message_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )


# ============================================
# Message Operations
# ============================================

async def create_message(
    conversation_id: str,
    sender_id: str,
    sender_name: str,
    content: str
) -> Dict[str, Any]:
    """
    Create a new message in a conversation
    
    Args:
        conversation_id: UUID of the conversation
        sender_id: UUID of the sender
        sender_name: Name of the sender
        content: Message content (will be sanitized)
    
    Returns:
        Created message document
    """
    # Sanitize content to prevent XSS
    sanitized_content = html.escape(content.strip())
    
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "content": sanitized_content,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await messages_collection.insert_one(message)
    
    # Update conversation's last message
    await update_conversation_last_message(conversation_id, sanitized_content)
    
    return message


async def get_conversation_messages(
    conversation_id: str,
    user_id: str,
    limit: int = 100,
    skip: int = 0
) -> List[Dict[str, Any]]:
    """
    Get messages for a conversation
    
    Args:
        conversation_id: UUID of the conversation
        user_id: UUID of the user (for authorization)
        limit: Maximum messages to return
        skip: Number to skip for pagination
    
    Returns:
        List of messages sorted by created_at ascending
    """
    # Verify user is participant
    conversation = await get_conversation_by_id(conversation_id, user_id)
    if not conversation:
        return []
    
    messages = await messages_collection.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).skip(skip).limit(limit).to_list(length=None)
    
    return messages


async def mark_conversation_as_read(
    conversation_id: str,
    user_id: str
) -> int:
    """
    Mark all messages in a conversation as read for the current user
    
    Args:
        conversation_id: UUID of the conversation
        user_id: UUID of the user
    
    Returns:
        Number of messages marked as read
    """
    result = await messages_collection.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": user_id},  # Not from current user
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    return result.modified_count


async def get_total_unread_count(user_id: str) -> int:
    """
    Get total unread message count across all conversations
    
    Args:
        user_id: UUID of the user
    
    Returns:
        Total unread message count
    """
    # Get all user's conversations
    conversations = await get_user_conversations(user_id, limit=1000)
    conversation_ids = [conv["id"] for conv in conversations]
    
    # Count unread messages
    count = await messages_collection.count_documents({
        "conversation_id": {"$in": conversation_ids},
        "sender_id": {"$ne": user_id},
        "read": False
    })
    
    return count


async def find_or_create_conversation(
    user1_id: str,
    user1_name: str,
    user1_avatar: Optional[str],
    user2_id: str,
    user2_name: str,
    user2_avatar: Optional[str]
) -> Dict[str, Any]:
    """
    Find existing conversation or create new one
    
    Args:
        user1_id, user1_name, user1_avatar: Current user info
        user2_id, user2_name, user2_avatar: Other user info
    
    Returns:
        Conversation document
    """
    sorted_ids = sorted([user1_id, user2_id])
    
    # Try to find existing
    existing = await conversations_collection.find_one(
        {"participants": sorted_ids},
        {"_id": 0}
    )
    
    if existing:
        return existing
    
    # Create new conversation
    participant_details = [
        {"id": user1_id, "name": user1_name, "avatar_url": user1_avatar},
        {"id": user2_id, "name": user2_name, "avatar_url": user2_avatar}
    ]
    
    return await create_conversation(sorted_ids, participant_details)
