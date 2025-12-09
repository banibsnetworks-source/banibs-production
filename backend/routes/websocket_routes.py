"""
WebSocket Routes for Peoples Room System
Real-time communication for knocks, visitors, and room events

Phase 4: WebSocket Integration
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import Optional
import logging
import json

from services.websocket_manager import manager
from middleware.auth_guard import get_current_user_from_token

logger = logging.getLogger(__name__)

router = APIRouter()


async def authenticate_websocket(token: str):
    """
    Authenticate WebSocket connection using JWT token.
    
    Returns user data if valid, raises exception if invalid.
    """
    try:
        # Use the same auth logic as HTTP requests
        user = await get_current_user_from_token(token)
        return user
    except Exception as e:
        logger.error(f"WebSocket auth failed: {e}")
        raise


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time Peoples Room updates.
    
    Connection URL: ws://domain/api/ws?token=<jwt_token>
    
    Client sends:
    - {"action": "subscribe_room", "room_owner_id": "<owner_id>"}
    - {"action": "unsubscribe_room", "room_owner_id": "<owner_id>"}
    - {"action": "ping"}
    
    Server sends:
    - Room events (KNOCK_CREATED, VISITOR_ENTERED, etc.)
    - {"type": "pong"}
    - {"type": "error", "message": "..."}
    """
    
    # Authenticate
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return
    
    try:
        user = await authenticate_websocket(token)
        user_id = user["id"]
    except Exception as e:
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Accept connection
    await manager.connect(websocket, user_id)
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "message": "WebSocket connection established"
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                action = message.get("action")
                
                if action == "subscribe_room":
                    room_owner_id = message.get("room_owner_id")
                    if room_owner_id:
                        manager.subscribe_to_room(user_id, room_owner_id)
                        await websocket.send_json({
                            "type": "subscribed",
                            "room_owner_id": room_owner_id
                        })
                    else:
                        await websocket.send_json({
                            "type": "error",
                            "message": "Missing room_owner_id"
                        })
                
                elif action == "unsubscribe_room":
                    room_owner_id = message.get("room_owner_id")
                    if room_owner_id:
                        manager.unsubscribe_from_room(user_id, room_owner_id)
                        await websocket.send_json({
                            "type": "unsubscribed",
                            "room_owner_id": room_owner_id
                        })
                
                elif action == "ping":
                    await websocket.send_json({"type": "pong"})
                
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Unknown action: {action}"
                    })
            
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected normally: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
    finally:
        manager.disconnect(user_id)


@router.get("/ws/stats")
async def get_websocket_stats(current_user = Depends(get_current_user_from_token)):
    """
    Get WebSocket connection statistics (admin/debug endpoint).
    """
    stats = manager.get_connection_stats()
    return {
        "stats": stats,
        "requesting_user": current_user["id"]
    }
