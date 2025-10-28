from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Dict, Any
import os
import uuid
from datetime import datetime, timezone

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
sponsor_orders_collection = db.sponsor_orders

async def create_sponsor_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new sponsor order
    
    Args:
        order_data: Dictionary with order data (opportunity_id, contributor_id, amount, etc.)
    
    Returns:
        Created order with generated id
    """
    # Generate UUID for the order
    order_data['id'] = str(uuid.uuid4())
    order_data['created_at'] = datetime.now(timezone.utc).isoformat()
    order_data['status'] = order_data.get('status', 'pending')
    
    await sponsor_orders_collection.insert_one(order_data)
    return order_data

async def get_sponsor_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    """
    Get sponsor order by ID
    
    Args:
        order_id: Order UUID
    
    Returns:
        Order dict or None if not found
    """
    order = await sponsor_orders_collection.find_one({"id": order_id}, {"_id": 0})
    return order

async def get_sponsor_order_by_session_id(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Get sponsor order by Stripe session ID
    
    Args:
        session_id: Stripe Checkout Session ID
    
    Returns:
        Order dict or None if not found
    """
    order = await sponsor_orders_collection.find_one(
        {"stripe_session_id": session_id}, 
        {"_id": 0}
    )
    return order

async def update_sponsor_order(order_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update sponsor order
    
    Args:
        order_id: Order UUID
        update_data: Fields to update
    
    Returns:
        True if updated, False if not found
    """
    result = await sponsor_orders_collection.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def get_all_sponsor_orders(
    contributor_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
) -> list:
    """
    Get all sponsor orders with optional filters
    
    Args:
        contributor_id: Filter by contributor
        status: Filter by status (pending, paid, failed, refunded)
        limit: Maximum number of orders to return
    
    Returns:
        List of orders
    """
    query = {}
    if contributor_id:
        query['contributor_id'] = contributor_id
    if status:
        query['status'] = status
    
    orders = await sponsor_orders_collection.find(
        query, 
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return orders

async def get_total_revenue() -> float:
    """
    Get total revenue from paid sponsor orders
    
    Returns:
        Total revenue in USD
    """
    pipeline = [
        {"$match": {"status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    
    result = await sponsor_orders_collection.aggregate(pipeline).to_list(length=1)
    
    if result and len(result) > 0:
        return result[0].get('total', 0.0)
    return 0.0
