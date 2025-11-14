# backend/routes/messaging_ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from realtime.messaging_manager import manager, ConnectionInfo
from middleware.auth_guard import get_current_user_from_token
from services.messaging_service import (
    send_message,
    mark_messages_read,
    get_conversation_for_user,
)

router = APIRouter()


@router.websocket("/ws/messaging")
async def messaging_ws(websocket: WebSocket, token: str):
    """
    Client connects with ws://.../ws/messaging?token=JWT
    
    Events from client:
    - join: Join a conversation room
    - presence.heartbeat: Keep connection alive
    - typing.start/stop: Typing indicators
    - message.send: Send a message
    - message.read: Mark messages as read
    
    Events to client:
    - message.created: New message in conversation
    - typing: Someone is typing
    - presence: User online/offline
    - read_receipt: Messages marked as read
    """
    user = await get_current_user_from_token(token)
    if not user:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    user_id = user["id"]
    conn: ConnectionInfo = await manager.connect(websocket, user_id)

    try:
        # upon connect, mark presence online
        await manager.broadcast_presence(user_id, True)

        while True:
            raw = await websocket.receive_text()
            message = json.loads(raw)
            msg_type = message.get("type")
            payload = message.get("payload", {})

            if msg_type == "join":
                # join conversation room
                cid = payload["conversation_id"]
                conv = await get_conversation_for_user(cid, user_id)
                if conv:
                    await manager.join_conversation(conn, cid)

            elif msg_type == "presence.heartbeat":
                await manager.update_heartbeat(conn)

            elif msg_type == "typing.start":
                cid = payload["conversation_id"]
                event = {
                    "type": "typing",
                    "payload": {
                        "conversation_id": cid,
                        "user_id": user_id,
                        "is_typing": True,
                    },
                }
                await manager.broadcast_to_conversation(cid, event)

            elif msg_type == "typing.stop":
                cid = payload["conversation_id"]
                event = {
                    "type": "typing",
                    "payload": {
                        "conversation_id": cid,
                        "user_id": user_id,
                        "is_typing": False,
                    },
                }
                await manager.broadcast_to_conversation(cid, event)

            elif msg_type == "message.send":
                cid = payload["conversation_id"]
                text = payload.get("text")
                media_url = payload.get("media_url")
                meta = payload.get("metadata") or {}

                msg = await send_message(
                    conversation_id=cid,
                    sender_id=user_id,
                    text=text,
                    media_url=media_url,
                    metadata=meta,
                )
                if not msg:
                    continue

                # Convert Beanie document to dict for JSON serialization
                msg_dict = {
                    "id": str(msg.id),
                    "conversation_id": cid,
                    "sender_id": user_id,
                    "type": msg.type,
                    "text": msg.text,
                    "media_url": msg.media_url,
                    "metadata": msg.metadata,
                    "created_at": msg.created_at.isoformat(),
                    "read_by": msg.read_by,
                }

                event = {
                    "type": "message.created",
                    "payload": {
                        "conversation_id": cid,
                        "message": msg_dict,
                    },
                }
                await manager.broadcast_to_conversation(cid, event)

            elif msg_type == "message.read":
                cid = payload["conversation_id"]
                await mark_messages_read(cid, user_id)
                event = {
                    "type": "read_receipt",
                    "payload": {
                        "conversation_id": cid,
                        "user_id": user_id,
                    },
                }
                await manager.broadcast_to_conversation(cid, event)

    except WebSocketDisconnect:
        pass
    finally:
        await manager.broadcast_presence(user_id, False)
        await manager.disconnect(conn)
