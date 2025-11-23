"""
BANIBS Wallet - Database Operations
Phase 14.0
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from uuid import uuid4


class WalletDB:
    """Database operations for BANIBS Wallet"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.accounts = db.wallet_accounts
        self.transactions = db.wallet_transactions
        self.goals = db.wallet_goals
        self.envelopes = db.wallet_envelopes
        self.family_profiles = db.wallet_family_profiles
        self.insights = db.wallet_insights
    
    # ==================== ACCOUNTS ====================
    
    async def get_accounts_for_user(self, user_id: str) -> List[Dict]:
        """Get all accounts for a user"""
        accounts = await self.accounts.find(
            {"user_id": user_id, "is_archived": False},
            {"_id": 0}
        ).sort("is_primary", -1).to_list(100)
        return accounts
    
    async def get_account_by_id(self, account_id: str, user_id: str) -> Optional[Dict]:
        """Get a specific account"""
        account = await self.accounts.find_one(
            {"id": account_id, "user_id": user_id},
            {"_id": 0}
        )
        return account
    
    async def create_wallet_account(self, user_id: str, account_data: Dict) -> Dict:
        """Create a new wallet account"""
        # If this is set as primary, unset other primary accounts
        if account_data.get("is_primary"):
            await self.accounts.update_many(
                {"user_id": user_id},
                {"$set": {"is_primary": False}}
            )
        
        account = {
            "id": str(uuid4()),
            "user_id": user_id,
            **account_data,
            "current_balance": account_data.get("starting_balance", 0.0),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_archived": False
        }
        await self.accounts.insert_one(account)
        return {k: v for k, v in account.items() if k != "_id"}
    
    async def update_account(self, account_id: str, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update an account"""
        # If setting as primary, unset others
        if updates.get("is_primary"):
            await self.accounts.update_many(
                {"user_id": user_id},
                {"$set": {"is_primary": False}}
            )
        
        updates["updated_at"] = datetime.utcnow()
        result = await self.accounts.find_one_and_update(
            {"id": account_id, "user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def update_account_balance(self, account_id: str, amount_change: float):
        """Update account balance by delta"""
        await self.accounts.update_one(
            {"id": account_id},
            {
                "$inc": {"current_balance": amount_change},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    # ==================== TRANSACTIONS ====================
    
    async def get_transactions_for_user(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[str] = None,
        transaction_type: Optional[str] = None,
        account_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get filtered transactions for a user"""
        query = {"user_id": user_id}
        
        if start_date or end_date:
            query["date"] = {}
            if start_date:
                query["date"]["$gte"] = start_date
            if end_date:
                query["date"]["$lte"] = end_date
        
        if category:
            query["category"] = category
        if transaction_type:
            query["type"] = transaction_type
        if account_id:
            query["account_id"] = account_id
        
        transactions = await self.transactions.find(query, {"_id": 0})\
            .sort("date", -1)\
            .limit(limit)\
            .to_list(limit)
        return transactions
    
    async def create_transaction(self, user_id: str, transaction_data: Dict) -> Dict:
        """Create a new transaction and update account balance"""
        transaction = {
            "id": str(uuid4()),
            "user_id": user_id,
            **transaction_data,
            "date": transaction_data.get("date") or datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        # Insert transaction
        await self.transactions.insert_one(transaction)
        
        # Update account balance
        await self.update_account_balance(
            transaction_data["account_id"],
            transaction_data["amount"]
        )
        
        # Update envelope spend if applicable (for expenses)
        if transaction_data["type"] == "expense" and transaction_data.get("category"):
            await self.update_envelope_spend(
                user_id,
                transaction_data["category"],
                abs(transaction_data["amount"])
            )
        
        return {k: v for k, v in transaction.items() if k != "_id"}
    
    # ==================== GOALS ====================
    
    async def get_goals_for_user(self, user_id: str) -> List[Dict]:
        """Get all goals for a user"""
        goals = await self.goals.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return goals
    
    async def get_goal_by_id(self, goal_id: str, user_id: str) -> Optional[Dict]:
        """Get a specific goal"""
        goal = await self.goals.find_one(
            {"id": goal_id, "user_id": user_id},
            {"_id": 0}
        )
        return goal
    
    async def create_goal(self, user_id: str, goal_data: Dict) -> Dict:
        """Create a new goal"""
        goal = {
            "id": str(uuid4()),
            "user_id": user_id,
            **goal_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "active"
        }
        await self.goals.insert_one(goal)
        return {k: v for k, v in goal.items() if k != "_id"}
    
    async def update_goal(self, goal_id: str, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update a goal"""
        updates["updated_at"] = datetime.utcnow()
        
        # Auto-complete if current >= target
        if "current_amount" in updates or "target_amount" in updates:
            goal = await self.get_goal_by_id(goal_id, user_id)
            if goal:
                current = updates.get("current_amount", goal["current_amount"])
                target = updates.get("target_amount", goal["target_amount"])
                if current >= target and goal["status"] == "active":
                    updates["status"] = "completed"
        
        result = await self.goals.find_one_and_update(
            {"id": goal_id, "user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    # ==================== ENVELOPES ====================
    
    async def get_envelopes_for_user(self, user_id: str) -> List[Dict]:
        """Get all envelopes for a user"""
        envelopes = await self.envelopes.find(
            {"user_id": user_id, "active": True},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return envelopes
    
    async def create_envelope(self, user_id: str, envelope_data: Dict) -> Dict:
        """Create a new envelope"""
        envelope = {
            "id": str(uuid4()),
            "user_id": user_id,
            **envelope_data,
            "current_spend": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "active": True
        }
        await self.envelopes.insert_one(envelope)
        return {k: v for k, v in envelope.items() if k != "_id"}
    
    async def update_envelope(self, envelope_id: str, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update an envelope"""
        updates["updated_at"] = datetime.utcnow()
        result = await self.envelopes.find_one_and_update(
            {"id": envelope_id, "user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def update_envelope_spend(self, user_id: str, category: str, amount: float):
        """Update envelope current spend"""
        await self.envelopes.update_one(
            {"user_id": user_id, "category": category, "active": True},
            {
                "$inc": {"current_spend": amount},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    # ==================== FAMILY PROFILE ====================
    
    async def get_family_profile_for_user(self, user_id: str) -> Optional[Dict]:
        """Get family profile where user is owner or member"""
        profile = await self.family_profiles.find_one(
            {
                "$or": [
                    {"owner_user_id": user_id},
                    {"member_user_ids": user_id}
                ]
            },
            {"_id": 0}
        )
        return profile
    
    async def create_family_profile(self, owner_user_id: str, profile_data: Dict) -> Dict:
        """Create a new family profile"""
        profile = {
            "id": str(uuid4()),
            "owner_user_id": owner_user_id,
            "member_user_ids": [owner_user_id],
            **profile_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "permissions": {}
        }
        await self.family_profiles.insert_one(profile)
        return {k: v for k, v in profile.items() if k != "_id"}
    
    # ==================== INSIGHTS ====================
    
    async def generate_insight_snapshot(
        self,
        user_id: str,
        period: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Generate insight snapshot for a period"""
        # Get all transactions in period
        transactions = await self.get_transactions_for_user(
            user_id,
            start_date=start_date,
            end_date=end_date,
            limit=10000
        )
        
        # Calculate totals
        total_spent = 0.0
        spent_black_owned = 0.0
        spent_non_black = 0.0
        spent_unknown = 0.0
        
        category_totals = {}
        merchant_totals = {}
        
        for txn in transactions:
            if txn["type"] == "expense":
                amount = abs(txn["amount"])
                total_spent += amount
                
                # Track by ownership
                if txn.get("is_black_owned") is True:
                    spent_black_owned += amount
                elif txn.get("is_black_owned") is False:
                    spent_non_black += amount
                else:
                    spent_unknown += amount
                
                # Track by category
                category = txn.get("category", "uncategorized")
                category_totals[category] = category_totals.get(category, 0) + amount
                
                # Track by merchant
                merchant = txn.get("merchant_name")
                if merchant:
                    merchant_totals[merchant] = merchant_totals.get(merchant, 0) + amount
        
        # Sort and get top 5
        top_categories = sorted(
            [{"name": k, "amount": v} for k, v in category_totals.items()],
            key=lambda x: x["amount"],
            reverse=True
        )[:5]
        
        top_merchants = sorted(
            [{"name": k, "amount": v} for k, v in merchant_totals.items()],
            key=lambda x: x["amount"],
            reverse=True
        )[:5]
        
        # Create snapshot
        snapshot = {
            "id": str(uuid4()),
            "user_id": user_id,
            "period": period,
            "start_date": start_date,
            "end_date": end_date,
            "total_spent": round(total_spent, 2),
            "spent_black_owned": round(spent_black_owned, 2),
            "spent_non_black": round(spent_non_black, 2),
            "spent_unknown": round(spent_unknown, 2),
            "top_categories": top_categories,
            "top_merchants": top_merchants,
            "generated_at": datetime.utcnow()
        }
        
        # Store snapshot
        await self.insights.insert_one(snapshot)
        
        return {k: v for k, v in snapshot.items() if k != "_id"}
    
    async def get_latest_insight(self, user_id: str, period: str) -> Optional[Dict]:
        """Get the latest cached insight for a period"""
        # Check if we have a recent snapshot (less than 1 hour old)
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        insight = await self.insights.find_one(
            {
                "user_id": user_id,
                "period": period,
                "generated_at": {"$gte": one_hour_ago}
            },
            {"_id": 0}
        )
        return insight
