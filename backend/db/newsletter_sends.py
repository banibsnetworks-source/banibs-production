from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Dict, Any, List
import os
import uuid
from datetime import datetime, timezone

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
newsletter_sends_collection = db.newsletter_sends

async def create_newsletter_send(send_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new newsletter send log
    
    Args:
        send_data: Dictionary with send data (total_subscribers, total_opportunities, sent_by, etc.)
    
    Returns:
        Created send log with generated id
    """
    # Generate UUID
    send_data['id'] = str(uuid.uuid4())
    send_data['sent_at'] = datetime.now(timezone.utc).isoformat()
    send_data['status'] = send_data.get('status', 'completed')
    
    await newsletter_sends_collection.insert_one(send_data)
    return send_data

async def get_newsletter_send_by_id(send_id: str) -> Optional[Dict[str, Any]]:
    """
    Get newsletter send log by ID
    
    Args:
        send_id: Send log UUID
    
    Returns:
        Send log dict or None if not found
    """
    send = await newsletter_sends_collection.find_one({"id": send_id}, {"_id": 0})
    return send

async def get_all_newsletter_sends(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Get all newsletter send logs
    
    Args:
        limit: Maximum number of logs to return
    
    Returns:
        List of send logs
    """
    sends = await newsletter_sends_collection.find(
        {}, 
        {"_id": 0}
    ).sort("sent_at", -1).limit(limit).to_list(length=limit)
    
    return sends

async def get_last_newsletter_send() -> Optional[Dict[str, Any]]:
    """
    Get the most recent newsletter send
    
    Returns:
        Last send log or None
    """
    sends = await newsletter_sends_collection.find(
        {}, 
        {"_id": 0}
    ).sort("sent_at", -1).limit(1).to_list(length=1)
    
    return sends[0] if sends else None
