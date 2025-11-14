# backend/realtime/messaging_manager.py
from typing import Dict, Set
from fastapi import WebSocket
import asyncio
import json
from datetime import datetime, timedelta

HEARTBEAT_TIMEOUT = 40  # seconds


class ConnectionInfo:
    def __init__(self, websocket: WebSocket, user_id: str):
        self.websocket = websocket
        self.user_id = user_id
        self.conversation_ids: Set[str] = set()
        self.last_heartbeat: datetime = datetime.utcnow()


class MessagingConnectionManager:
    def __init__(self):
        self.user_connections: Dict[str, Set[ConnectionInfo]] = {}
        self.conversation_connections: Dict[str, Set[ConnectionInfo]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        conn = ConnectionInfo(websocket, user_id)
        async with self._lock:
            self.user_connections.setdefault(user_id, set()).add(conn)
        return conn

    async def disconnect(self, conn: ConnectionInfo):
        async with self._lock:
            # remove from user map
            if conn.user_id in self.user_connections:
                self.user_connections[conn.user_id].discard(conn)
                if not self.user_connections[conn.user_id]:
                    del self.user_connections[conn.user_id]
            # remove from conversations
            for cid in list(conn.conversation_ids):
                if cid in self.conversation_connections:
                    self.conversation_connections[cid].discard(conn)
                    if not self.conversation_connections[cid]:
                        del self.conversation_connections[cid]

        try:
            await conn.websocket.close()
        except Exception:
            pass

    async def join_conversation(self, conn: ConnectionInfo, conversation_id: str):
        async with self._lock:
            conn.conversation_ids.add(conversation_id)
            self.conversation_connections.setdefault(conversation_id, set()).add(conn)

    async def broadcast_to_conversation(self, conversation_id: str, message: dict):
        # message should be JSON-serializable
        text = json.dumps(message, default=str)
        async with self._lock:
            conns = list(self.conversation_connections.get(conversation_id, []))
        for conn in conns:
            try:
                await conn.websocket.send_text(text)
            except Exception:
                # drop dead connections quietly
                await self.disconnect(conn)

    async def broadcast_presence(self, user_id: str, online: bool):
        # Notify all participants who share conversations with this user
        event = {
            "type": "presence",
            "payload": {"user_id": user_id, "online": online},
        }
        text = json.dumps(event)
        async with self._lock:
            conns = list(self.user_connections.get(user_id, []))
            # for now, just send to that user's own connections (multi-device)
            for conn in conns:
                try:
                    await conn.websocket.send_text(text)
                except Exception:
                    await self.disconnect(conn)

    async def update_heartbeat(self, conn: ConnectionInfo):
        conn.last_heartbeat = datetime.utcnow()

    async def cleanup_stale(self):
        """Optional: run periodically to drop stale heartbeats."""
        now = datetime.utcnow()
        async with self._lock:
            for user_id, conns in list(self.user_connections.items()):
                for conn in list(conns):
                    if now - conn.last_heartbeat > timedelta(seconds=HEARTBEAT_TIMEOUT):
                        await self.disconnect(conn)


manager = MessagingConnectionManager()
