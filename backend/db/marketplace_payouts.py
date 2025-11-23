"""
BANIBS Global Marketplace - Payout Database Layer
Phase 16.2 - Seller Payout Engine
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from uuid import uuid4


class MarketplacePayoutDB:
    """Database operations for marketplace payouts"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.sellers = db.marketplace_sellers
        self.payouts = db.marketplace_payout_requests
        self.orders = db.marketplace_orders
        self.order_events = db.order_events
    
    # ==================== SELLER OPERATIONS ====================
    
    async def get_seller_by_user_id(self, user_id: str) -> Optional[Dict]:
        """Get seller profile by user ID"""
        seller = await self.sellers.find_one({"user_id": user_id}, {"_id": 0})
        return seller
    
    async def get_seller_by_id(self, seller_id: str) -> Optional[Dict]:
        """Get seller profile by seller ID"""
        seller = await self.sellers.find_one({"id": seller_id}, {"_id": 0})
        return seller
    
    async def update_seller_balance(
        self,
        seller_id: str,
        pending_delta: float = 0.0,
        available_delta: float = 0.0,
        lifetime_delta: float = 0.0
    ) -> Optional[Dict]:
        """Update seller balance fields"""
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        
        if pending_delta != 0.0:
            update_data["pending_payout_balance"] = {"$inc": pending_delta}
        if available_delta != 0.0:
            update_data["available_payout_balance"] = {"$inc": available_delta}
        if lifetime_delta != 0.0:
            update_data["lifetime_payouts"] = {"$inc": lifetime_delta}
        
        # Build the $inc and $set separately
        inc_data = {}
        set_data = {"updated_at": datetime.utcnow().isoformat()}
        
        if pending_delta != 0.0:
            inc_data["pending_payout_balance"] = pending_delta
        if available_delta != 0.0:
            inc_data["available_payout_balance"] = available_delta
        if lifetime_delta != 0.0:
            inc_data["lifetime_payouts"] = lifetime_delta
        
        update_ops = {"$set": set_data}
        if inc_data:
            update_ops["$inc"] = inc_data
        
        result = await self.sellers.find_one_and_update(
            {"id": seller_id},
            update_ops,
            return_document=True
        )
        
        if result:
            result.pop("_id", None)
        return result
    
    # ==================== PAYOUT REQUEST OPERATIONS ====================
    
    async def create_payout_request(
        self,
        seller_id: str,
        user_id: str,
        amount: float,
        method: str,
        method_details: Optional[dict] = None
    ) -> Dict:
        """Create a new payout request"""
        # Generate reference code
        timestamp = datetime.utcnow()
        ref_code = f"PAY-{timestamp.strftime('%Y%m%d')}-{str(uuid4())[:6].upper()}"
        
        payout_data = {
            "id": f"payout-{str(uuid4())[:8]}",
            "seller_id": seller_id,
            "user_id": user_id,
            "amount_requested": amount,
            "amount_approved": None,
            "status": "pending",
            "method": method,
            "method_details": method_details,
            "created_at": timestamp.isoformat(),
            "updated_at": timestamp.isoformat(),
            "processed_at": None,
            "admin_note": None,
            "reference_code": ref_code
        }
        
        await self.payouts.insert_one(payout_data)
        payout_data.pop("_id", None)
        
        return payout_data
    
    async def get_payout_by_id(self, payout_id: str) -> Optional[Dict]:
        """Get payout request by ID"""
        payout = await self.payouts.find_one({"id": payout_id}, {"_id": 0})
        return payout
    
    async def list_payout_requests_for_seller(
        self,
        seller_id: str,
        limit: int = 100
    ) -> List[Dict]:
        """List all payout requests for a seller"""
        payouts = await self.payouts.find(
            {"seller_id": seller_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return payouts
    
    async def list_payout_requests_for_admin(
        self,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """List payout requests for admin (with optional status filter)"""
        query = {}
        if status:
            query["status"] = status
        
        payouts = await self.payouts.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return payouts
    
    async def update_payout_status(
        self,
        payout_id: str,
        new_status: str,
        amount_approved: Optional[float] = None,
        admin_note: Optional[str] = None
    ) -> Optional[Dict]:
        """Update payout request status"""
        update_data = {
            "status": new_status,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if amount_approved is not None:
            update_data["amount_approved"] = amount_approved
        
        if admin_note is not None:
            update_data["admin_note"] = admin_note
        
        if new_status in ["completed", "approved"]:
            update_data["processed_at"] = datetime.utcnow().isoformat()
        
        result = await self.payouts.find_one_and_update(
            {"id": payout_id},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result.pop("_id", None)
        return result
    
    async def get_last_payout_date(self, seller_id: str) -> Optional[datetime]:
        """Get the date of the last completed payout for a seller"""
        payout = await self.payouts.find_one(
            {"seller_id": seller_id, "status": "completed"},
            {"_id": 0, "processed_at": 1},
            sort=[("processed_at", -1)]
        )
        
        if payout and payout.get("processed_at"):
            return datetime.fromisoformat(payout["processed_at"])
        return None
    
    # ==================== T+2 CLEARING OPERATIONS ====================
    
    async def get_orders_pending_clearing(self) -> List[Dict]:
        """Get all paid orders that are ready for T+2 clearing (2+ days old)"""
        cutoff_date = datetime.utcnow() - timedelta(days=2)
        
        orders = await self.orders.find(
            {
                "payment_status": "paid",
                "clearing_status": "pending",
                "created_at": {"$lte": cutoff_date.isoformat()}
            },
            {"_id": 0}
        ).to_list(1000)
        
        return orders
    
    async def mark_order_as_cleared(self, order_id: str) -> Optional[Dict]:
        """Mark an order as cleared"""
        result = await self.orders.find_one_and_update(
            {"id": order_id},
            {
                "$set": {
                    "clearing_status": "cleared",
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            return_document=True
        )
        
        if result:
            result.pop("_id", None)
        return result
    
    # ==================== EVENT LOGGING ====================
    
    async def create_payout_event(
        self,
        order_id: str,
        event_type: str,
        actor: str = "system",
        metadata: Optional[dict] = None
    ) -> Dict:
        """Create a payout-related event in the order events collection"""
        event_data = {
            "id": f"event-{str(uuid4())[:8]}",
            "order_id": order_id,
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "actor": actor,
            "metadata": metadata or {}
        }
        
        await self.order_events.insert_one(event_data)
        event_data.pop("_id", None)
        
        return event_data
