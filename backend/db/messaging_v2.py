"""
BANIBS Messaging Engine - Phase 8.4
Database Layer

MongoDB operations for 1-to-1 messaging with trust tier integration.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from schemas.message import MessageCreate, MessagePublic, ConversationPreview, TrustTier


MESSAGES_COLLECTION = "messages_v2"


async def init_messages_collection(db: AsyncIOMotorDatabase):
    """Initialize messages collection with indexes"""
    collection = db[MESSAGES_COLLECTION]
    
    # Conversation lookup (most common query)
    await collection.create_index(
        [("conversationKey", ASCENDING), ("timestamp", DESCENDING)],
        name="conversation_timeline"
    )
    
    # Unread messages lookup
    await collection.create_index(
        [("receiverId", ASCENDING), ("readStatus", ASCENDING), ("timestamp", DESCENDING)],
        name="unread_messages"
    )
    
    # User's all conversations
    await collection.create_index(
        [("senderId", ASCENDING), ("timestamp", DESCENDING)],
        name="sender_messages"
    )
    
    await collection.create_index(
        [("receiverId", ASCENDING), ("timestamp", DESCENDING)],
        name="receiver_messages"
    )
    
    # Timestamp for cleanup/archival
    await collection.create_index(
        [("createdAt", DESCENDING)],
        name="created_at"
    )
    
    return collection


def build_conversation_key(user_a: str, user_b: str) -> str:
    """Build deterministic conversation key from two user IDs"""
    return ":".join(sorted([user_a, user_b]))


async def get_trust_tier_for_users(db: AsyncIOMotorDatabase, user_a: str, user_b: str) -> TrustTier:
    """
    Get trust tier between two users from Relationship Engine
    
    Args:
        db: Database connection
        user_a: First user ID
        user_b: Second user ID
    
    Returns:
        Trust tier (defaults to "Others" if no relationship exists)
    """
    relationships_collection = db["relationships"]
    
    # Check if user_a has user_b in their relationships
    relationship = await relationships_collection.find_one({
        "owner_user_id": user_a,
        "target_user_id": user_b,
        "status": "active"
    })
    
    if relationship:
        tier = relationship.get("tier", "Others")
        # Normalize tier names
        if tier in ["Peoples", "Cool", "Alright", "Others"]:
            return tier
    
    return "Others"


async def send_message(
    db: AsyncIOMotorDatabase,
    sender_id: str,
    message_data: MessageCreate
) -> MessagePublic:
    """
    Send a message
    
    Args:
        db: Database connection
        sender_id: Sender user ID
        message_data: Message content and recipient
    
    Returns:
        Created message
    """
    collection = db[MESSAGES_COLLECTION]
    
    # Get trust tier between sender and receiver
    trust_tier = await get_trust_tier_for_users(db, sender_id, message_data.receiverId)
    
    # Build conversation key
    conversation_key = build_conversation_key(sender_id, message_data.receiverId)
    
    # Create message document
    now = datetime.utcnow()
    message_id = str(uuid4())
    
    message_doc = {
        "_id": message_id,
        "senderId": sender_id,
        "receiverId": message_data.receiverId,
        "messageText": message_data.messageText,
        "conversationKey": conversation_key,
        "trustTierContext": trust_tier,
        "encryptionFlag": False,  # Placeholder for future encryption
        "timestamp": now,
        "createdAt": now,
        "readStatus": "unread"
    }
    
    await collection.insert_one(message_doc)
    
    return MessagePublic(
        id=message_id,
        senderId=sender_id,
        receiverId=message_data.receiverId,
        messageText=message_data.messageText,
        trustTierContext=trust_tier,
        encryptionFlag=False,
        timestamp=now,
        readStatus="unread"
    )


async def get_conversation_thread(
    db: AsyncIOMotorDatabase,
    user_id: str,
    other_user_id: str,
    limit: int = 100,
    before: Optional[datetime] = None
) -> List[MessagePublic]:
    """
    Get messages in a conversation thread
    
    Args:
        db: Database connection
        user_id: Current user ID
        other_user_id: Other user in conversation
        limit: Max messages to return
        before: Only messages before this timestamp (for pagination)
    
    Returns:
        List of messages (newest first, then reversed for chronological display)
    """
    collection = db[MESSAGES_COLLECTION]
    conversation_key = build_conversation_key(user_id, other_user_id)
    
    query = {"conversationKey": conversation_key}
    if before:
        query["timestamp"] = {"$lt": before}
    
    # Get newest messages first
    cursor = collection.find(query).sort("timestamp", DESCENDING).limit(limit)
    messages_docs = await cursor.to_list(length=limit)
    
    # Reverse for chronological order (oldest first)
    messages_docs.reverse()
    
    # Convert to MessagePublic
    messages = []
    for doc in messages_docs:
        messages.append(MessagePublic(
            id=str(doc.get("_id")),
            senderId=doc["senderId"],
            receiverId=doc["receiverId"],
            messageText=doc["messageText"],
            trustTierContext=doc["trustTierContext"],
            encryptionFlag=doc.get("encryptionFlag", False),
            timestamp=doc["timestamp"],
            readStatus=doc.get("readStatus", "unread")
        ))
    
    return messages


async def mark_conversation_read(
    db: AsyncIOMotorDatabase,
    user_id: str,
    other_user_id: str
) -> int:
    """
    Mark all messages in a conversation as read
    
    Args:
        db: Database connection
        user_id: Current user (receiver)
        other_user_id: Other user in conversation
    
    Returns:
        Number of messages marked as read
    """
    collection = db[MESSAGES_COLLECTION]
    conversation_key = build_conversation_key(user_id, other_user_id)
    
    result = await collection.update_many(
        {
            "conversationKey": conversation_key,
            "receiverId": user_id,
            "readStatus": "unread"
        },
        {"$set": {"readStatus": "read"}}
    )
    
    return result.modified_count


async def get_conversation_previews(
    db: AsyncIOMotorDatabase,
    user_id: str,
    limit: int = 50
) -> List[ConversationPreview]:
    """
    Get conversation previews for inbox/conversations list
    
    Args:
        db: Database connection
        user_id: Current user ID
        limit: Max conversations to return
    
    Returns:
        List of conversation previews sorted by most recent
    """
    collection = db[MESSAGES_COLLECTION]
    
    # Aggregation pipeline to get latest message per conversation
    pipeline = [
        # Match messages involving this user
        {
            "$match": {
                "$or": [
                    {"senderId": user_id},
                    {"receiverId": user_id}
                ]
            }
        },
        # Sort by timestamp (newest first)
        {"$sort": {"timestamp": -1}},
        # Group by conversation, keeping first (latest) message
        {
            "$group": {
                "_id": "$conversationKey",
                "lastMessage": {"$first": "$$ROOT"}
            }
        },
        # Limit results
        {"$limit": limit},
        # Sort by last message timestamp
        {"$sort": {"lastMessage.timestamp": -1}}
    ]
    
    results = await collection.aggregate(pipeline).to_list(length=limit)
    
    # Build previews
    previews = []
    users_collection = db["users"]
    
    for result in results:
        last_msg = result["lastMessage"]
        conversation_key = result["_id"]
        
        # Determine other user ID
        if last_msg["senderId"] == user_id:
            other_user_id = last_msg["receiverId"]
        else:
            other_user_id = last_msg["senderId"]
        
        # Get unread count
        unread_count = await collection.count_documents({
            "conversationKey": conversation_key,
            "receiverId": user_id,
            "readStatus": "unread"
        })
        
        # Get other user info (optional, for display)
        other_user = await users_collection.find_one(
            {"id": other_user_id},
            {"_id": 0, "id": 1, "name": 1, "displayName": 1, "avatar_url": 1, "profile_picture_url": 1}
        )
        
        other_user_name = None
        other_user_avatar = None
        if other_user:
            other_user_name = other_user.get("displayName") or other_user.get("name")
            other_user_avatar = other_user.get("profile_picture_url") or other_user.get("avatar_url")
        
        previews.append(ConversationPreview(
            conversationKey=conversation_key,
            otherUserId=other_user_id,
            otherUserName=other_user_name,
            otherUserAvatar=other_user_avatar,
            lastMessageText=last_msg["messageText"],
            lastSenderId=last_msg["senderId"],
            lastTimestamp=last_msg["timestamp"],
            unreadCount=unread_count,
            trustTierContext=last_msg["trustTierContext"]
        ))
    
    return previews
