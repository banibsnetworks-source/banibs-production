# BANIBS Connect - Phase 3.1 Messaging Service Layer
# WebSocket-ready: All business logic centralized for easy socket integration in Phase 3.2

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from ..models.messaging import (
    ConversationType,
    MessageType,
    ConversationCreate,
    MessageCreate,
)


class MessagingService:
    """
    Centralized messaging service layer.
    
    In Phase 3.2, when adding Socket.IO:
    - HTTP routes will call these methods
    - WebSocket handlers will also call these methods
    - Methods can emit socket events without refactoring
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.conversations_collection = db.conversations
        self.messages_collection = db.messages
    
    # --- Conversation Methods ---
    
    async def create_conversation(
        self,
        conversation_data: ConversationCreate,
        creator_id: str
    ) -> Dict[str, Any]:
        """
        Create a new conversation.
        
        Args:
            conversation_data: Conversation creation data
            creator_id: ID of the user creating the conversation
            
        Returns:
            Created conversation document
        """
        now = datetime.now(timezone.utc)
        
        # Ensure creator is in participants
        participant_ids = list(set([creator_id] + conversation_data.participant_ids))
        
        conversation_doc = {
            "type": conversation_data.type.value,
            "participant_ids": participant_ids,
            "title": conversation_data.title,
            "business_id": conversation_data.business_id,
            "last_message_preview": None,
            "last_message_at": None,
            "created_at": now,
            "updated_at": now
        }
        
        result = await self.conversations_collection.insert_one(conversation_doc)
        conversation_doc["_id"] = str(result.inserted_id)
        
        return self._serialize_conversation(conversation_doc)
    
    async def get_user_conversations(
        self,
        user_id: str,
        conversation_type: Optional[ConversationType] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all conversations for a user.
        
        Args:
            user_id: User ID to filter by
            conversation_type: Optional filter by conversation type
            
        Returns:
            List of conversations
        """
        query = {"participant_ids": user_id}
        
        if conversation_type:
            query["type"] = conversation_type.value
        
        cursor = self.conversations_collection.find(
            query,
            {"_id": 1, "type": 1, "participant_ids": 1, "title": 1, "business_id": 1,
             "last_message_preview": 1, "last_message_at": 1, "created_at": 1, "updated_at": 1}
        ).sort("last_message_at", -1)
        
        conversations = await cursor.to_list(length=100)
        
        return [self._serialize_conversation(conv) for conv in conversations]
    
    async def get_conversation(
        self,
        conversation_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a single conversation.
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for permission check)
            
        Returns:
            Conversation document or None
        """
        try:
            conversation = await self.conversations_collection.find_one(
                {
                    "_id": ObjectId(conversation_id),
                    "participant_ids": user_id
                },
                {"_id": 1, "type": 1, "participant_ids": 1, "title": 1, "business_id": 1,
                 "last_message_preview": 1, "last_message_at": 1, "created_at": 1, "updated_at": 1}
            )
            
            if conversation:
                return self._serialize_conversation(conversation)
            return None
        except:
            return None
    
    # --- Message Methods ---
    
    async def send_message(
        self,
        conversation_id: str,
        sender_id: str,
        message_data: MessageCreate
    ) -> Optional[Dict[str, Any]]:
        """
        Send a message to a conversation.
        
        This is the CORE method that will be called by:
        - HTTP POST handler (Phase 3.1)
        - WebSocket event handler (Phase 3.2)
        
        Args:
            conversation_id: Conversation ID
            sender_id: Sender user ID
            message_data: Message content
            
        Returns:
            Created message document or None if conversation not found
        """
        # Verify sender is participant
        try:
            conversation = await self.conversations_collection.find_one(
                {
                    "_id": ObjectId(conversation_id),
                    "participant_ids": sender_id
                }
            )
            
            if not conversation:
                return None
            
            # Create message
            now = datetime.now(timezone.utc)
            message_doc = {
                "conversation_id": conversation_id,
                "sender_id": sender_id,
                "type": message_data.type.value,
                "text": message_data.text,
                "media_url": message_data.media_url,
                "metadata": message_data.metadata,
                "created_at": now,
                "read_by": [sender_id]  # Sender has "read" their own message
            }
            
            result = await self.messages_collection.insert_one(message_doc)
            message_doc["_id"] = str(result.inserted_id)
            
            # Update conversation's last message
            preview = message_data.text[:100] if message_data.text else "(media)"
            await self.conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {
                    "$set": {
                        "last_message_preview": preview,
                        "last_message_at": now,
                        "updated_at": now
                    }
                }
            )
            
            # TODO Phase 3.2: Emit socket event here
            # socket_manager.emit('message_received', message_doc, room=conversation_id)
            
            return self._serialize_message(message_doc)
        except:
            return None
    
    async def get_messages(
        self,
        conversation_id: str,
        user_id: str,
        page: int = 1,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get messages for a conversation (paginated).
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID (for permission check)
            page: Page number (1-indexed)
            limit: Messages per page
            
        Returns:
            List of messages
        """
        # Verify user is participant
        try:
            conversation = await self.conversations_collection.find_one(
                {
                    "_id": ObjectId(conversation_id),
                    "participant_ids": user_id
                }
            )
            
            if not conversation:
                return []
            
            skip = (page - 1) * limit
            
            cursor = self.messages_collection.find(
                {"conversation_id": conversation_id},
                {"_id": 1, "conversation_id": 1, "sender_id": 1, "type": 1,
                 "text": 1, "media_url": 1, "metadata": 1, "created_at": 1, "read_by": 1}
            ).sort("created_at", 1).skip(skip).limit(limit)
            
            messages = await cursor.to_list(length=limit)
            
            return [self._serialize_message(msg) for msg in messages]
        except:
            return []
    
    async def mark_messages_read(
        self,
        conversation_id: str,
        user_id: str,
        message_ids: Optional[List[str]] = None
    ) -> int:
        """
        Mark messages as read by a user.
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID
            message_ids: Specific message IDs, or None for all unread
            
        Returns:
            Number of messages updated
        """
        try:
            # Verify user is participant
            conversation = await self.conversations_collection.find_one(
                {
                    "_id": ObjectId(conversation_id),
                    "participant_ids": user_id
                }
            )
            
            if not conversation:
                return 0
            
            query = {
                "conversation_id": conversation_id,
                "read_by": {"$ne": user_id}
            }
            
            if message_ids:
                query["_id"] = {"$in": [ObjectId(mid) for mid in message_ids]}
            
            result = await self.messages_collection.update_many(
                query,
                {"$addToSet": {"read_by": user_id}}
            )
            
            # TODO Phase 3.2: Emit socket event for read receipts
            # socket_manager.emit('messages_read', {...}, room=conversation_id)
            
            return result.modified_count
        except:
            return 0
    
    # --- Helper Methods ---
    
    def _serialize_conversation(self, conv: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize conversation for API response."""
        return {
            "id": str(conv["_id"]),
            "type": conv["type"],
            "participant_ids": conv["participant_ids"],
            "title": conv.get("title"),
            "business_id": conv.get("business_id"),
            "last_message_preview": conv.get("last_message_preview"),
            "last_message_at": conv["last_message_at"].isoformat() if conv.get("last_message_at") else None,
            "created_at": conv["created_at"].isoformat(),
            "updated_at": conv["updated_at"].isoformat()
        }
    
    def _serialize_message(self, msg: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize message for API response."""
        return {
            "id": str(msg["_id"]),
            "conversation_id": msg["conversation_id"],
            "sender_id": msg["sender_id"],
            "type": msg["type"],
            "text": msg.get("text"),
            "media_url": msg.get("media_url"),
            "metadata": msg.get("metadata"),
            "created_at": msg["created_at"].isoformat(),
            "read_by": msg.get("read_by", [])
        }
