"""
WebSocket Connection Manager for Peoples Room System
Handles real-time connections, room channels, and event broadcasting

Phase 4: WebSocket Integration
"""

from typing import Dict, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
import logging
import json
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def serialize_for_websocket(obj: Any) -> Any:
    """
    Recursively serialize objects for WebSocket JSON transmission.
    Converts datetime objects to ISO strings.
    """
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: serialize_for_websocket(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_websocket(item) for item in obj]
    else:
        return obj


class ConnectionManager:
    """
    Manages WebSocket connections and room-based broadcasting.
    
    Structure:
    - connections: {user_id: WebSocket}
    - room_channels: {room_owner_id: Set[user_id]}
    """
    
    def __init__(self):
        # Active WebSocket connections
        self.connections: Dict[str, WebSocket] = {}
        
        # Room channel subscriptions (owner_id -> set of subscriber user_ids)
        self.room_channels: Dict[str, Set[str]] = {}
        
        # User to room mapping (for cleanup)
        self.user_rooms: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """
        Accept and register a new WebSocket connection.
        """
        await websocket.accept()
        self.connections[user_id] = websocket
        self.user_rooms[user_id] = set()
        
        logger.info(f"🔌 WebSocket connected: user={user_id}, total_connections={len(self.connections)}")
    
    def disconnect(self, user_id: str):
        """
        Remove a WebSocket connection and clean up subscriptions.
        """
        if user_id in self.connections:
            del self.connections[user_id]
        
        # Unsubscribe from all rooms
        if user_id in self.user_rooms:
            for room_id in self.user_rooms[user_id]:
                if room_id in self.room_channels:
                    self.room_channels[room_id].discard(user_id)
                    if not self.room_channels[room_id]:
                        del self.room_channels[room_id]
            del self.user_rooms[user_id]
        
        logger.info(f"🔌 WebSocket disconnected: user={user_id}, remaining_connections={len(self.connections)}")
    
    def subscribe_to_room(self, user_id: str, room_owner_id: str):
        """
        Subscribe a user to a room channel for real-time updates.
        """
        if room_owner_id not in self.room_channels:
            self.room_channels[room_owner_id] = set()
        
        self.room_channels[room_owner_id].add(user_id)
        
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        self.user_rooms[user_id].add(room_owner_id)
        
        logger.info(f"📢 User {user_id} subscribed to room {room_owner_id}")
    
    def unsubscribe_from_room(self, user_id: str, room_owner_id: str):
        """
        Unsubscribe a user from a room channel.
        """
        if room_owner_id in self.room_channels:
            self.room_channels[room_owner_id].discard(user_id)
            if not self.room_channels[room_owner_id]:
                del self.room_channels[room_owner_id]
        
        if user_id in self.user_rooms:
            self.user_rooms[user_id].discard(room_owner_id)
        
        logger.info(f"📢 User {user_id} unsubscribed from room {room_owner_id}")
    
    async def send_personal_message(self, user_id: str, message: dict):
        """
        Send a message to a specific user.
        """
        if user_id in self.connections:
            try:
                await self.connections[user_id].send_json(message)
                logger.debug(f"📨 Sent personal message to {user_id}: {message.get('type')}")
            except Exception as e:
                logger.error(f"Failed to send message to {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast_to_room(self, room_owner_id: str, message: dict, exclude_user: Optional[str] = None):
        """
        Broadcast a message to all subscribers of a room channel.
        
        Args:
            room_owner_id: Owner of the room
            message: Message to broadcast
            exclude_user: Optional user_id to exclude from broadcast
        """
        if room_owner_id not in self.room_channels:
            logger.debug(f"No subscribers for room {room_owner_id}")
            return
        
        subscribers = self.room_channels[room_owner_id].copy()
        if exclude_user:
            subscribers.discard(exclude_user)
        
        disconnected = []
        for user_id in subscribers:
            if user_id in self.connections:
                try:
                    await self.connections[user_id].send_json(message)
                except Exception as e:
                    logger.error(f"Failed to broadcast to {user_id}: {e}")
                    disconnected.append(user_id)
        
        # Clean up failed connections
        for user_id in disconnected:
            self.disconnect(user_id)
        
        logger.info(
            f"📢 Broadcast to room {room_owner_id}: {message.get('type')} "
            f"(sent to {len(subscribers) - len(disconnected)}/{len(subscribers)} subscribers)"
        )
    
    async def broadcast_to_user(self, user_id: str, event_type: str, data: dict):
        """
        Send an event to a specific user.
        """
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.send_personal_message(user_id, message)
    
    async def broadcast_room_event(
        self, 
        room_owner_id: str, 
        event_type: str, 
        data: dict,
        exclude_user: Optional[str] = None
    ):
        """
        Broadcast a room event to all subscribers.
        
        Event types:
        - ROOM_KNOCK_CREATED
        - ROOM_KNOCK_APPROVED
        - ROOM_KNOCK_DENIED
        - ROOM_VISITOR_ENTERED
        - ROOM_VISITOR_LEFT
        - ROOM_SESSION_STARTED
        - ROOM_SESSION_ENDED
        - ROOM_DOOR_LOCKED
        - ROOM_DOOR_UNLOCKED
        - ROOM_SETTINGS_UPDATED
        """
        message = {
            "type": event_type,
            "room_owner_id": room_owner_id,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_to_room(room_owner_id, message, exclude_user)
    
    def get_connection_stats(self) -> dict:
        """
        Get current connection statistics.
        """
        return {
            "total_connections": len(self.connections),
            "total_room_channels": len(self.room_channels),
            "room_subscriber_counts": {
                room_id: len(subscribers) 
                for room_id, subscribers in self.room_channels.items()
            }
        }


# Global connection manager instance
manager = ConnectionManager()
