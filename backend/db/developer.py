"""
BANIBS OS / Developer Platform - Database Operations
Phase 15.0
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict
from datetime import datetime
from uuid import uuid4
import secrets
import string


def generate_api_key() -> str:
    """Generate a secure API key"""
    prefix = "banibs_live_"
    key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    return prefix + key


def generate_client_id() -> str:
    """Generate a secure client ID"""
    prefix = "banibs_client_"
    key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(24))
    return prefix + key


def generate_client_secret() -> str:
    """Generate a secure client secret"""
    prefix = "banibs_secret_"
    key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(48))
    return prefix + key


def generate_webhook_secret() -> str:
    """Generate a secure webhook secret"""
    prefix = "whsec_"
    key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    return prefix + key


class DeveloperDB:
    """Database operations for BANIBS OS / Developer Platform"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.profiles = db.developer_profiles
        self.api_keys = db.developer_api_keys
        self.apps = db.developer_apps
        self.webhooks = db.webhook_endpoints
        self.api_logs = db.api_logs
    
    # ==================== DEVELOPER PROFILE ====================
    
    async def get_developer_profile(self, user_id: str) -> Optional[Dict]:
        """Get developer profile for a user"""
        profile = await self.profiles.find_one({"user_id": user_id}, {"_id": 0})
        return profile
    
    async def create_developer_profile(self, user_id: str, profile_data: Dict) -> Dict:
        """Create a new developer profile"""
        profile = {
            "id": str(uuid4()),
            "user_id": user_id,
            **profile_data,
            "api_key": None,  # Will be generated separately via API key creation
            "created_at": datetime.utcnow()
        }
        await self.profiles.insert_one(profile)
        return {k: v for k, v in profile.items() if k != "_id"}
    
    async def update_developer_profile(self, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update developer profile"""
        result = await self.profiles.find_one_and_update(
            {"user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    # ==================== API KEYS ====================
    
    async def get_api_keys_for_user(self, user_id: str) -> List[Dict]:
        """Get all API keys for a user"""
        keys = await self.api_keys.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return keys
    
    async def create_api_key(self, user_id: str, label: str) -> Dict:
        """Create a new API key"""
        api_key = {
            "id": str(uuid4()),
            "user_id": user_id,
            "label": label,
            "api_key": generate_api_key(),
            "created_at": datetime.utcnow(),
            "last_used": None,
            "status": "active"
        }
        await self.api_keys.insert_one(api_key)
        return {k: v for k, v in api_key.items() if k != "_id"}
    
    async def update_api_key(self, key_id: str, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update an API key"""
        result = await self.api_keys.find_one_and_update(
            {"id": key_id, "user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def delete_api_key(self, key_id: str, user_id: str) -> bool:
        """Delete an API key"""
        result = await self.api_keys.delete_one({"id": key_id, "user_id": user_id})
        return result.deleted_count > 0
    
    # ==================== APPS ====================
    
    async def get_apps_for_user(self, user_id: str) -> List[Dict]:
        """Get all apps for a user"""
        apps = await self.apps.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return apps
    
    async def get_app_by_id(self, app_id: str, user_id: str) -> Optional[Dict]:
        """Get a specific app"""
        app = await self.apps.find_one(
            {"id": app_id, "user_id": user_id},
            {"_id": 0}
        )
        return app
    
    async def create_app(self, user_id: str, app_data: Dict) -> Dict:
        """Create a new app"""
        app = {
            "id": str(uuid4()),
            "user_id": user_id,
            **app_data,
            "client_id": generate_client_id(),
            "client_secret": generate_client_secret(),
            "status": "draft",
            "created_at": datetime.utcnow()
        }
        await self.apps.insert_one(app)
        return {k: v for k, v in app.items() if k != "_id"}
    
    async def update_app(self, app_id: str, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update an app"""
        result = await self.apps.find_one_and_update(
            {"id": app_id, "user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def regenerate_client_secret(self, app_id: str, user_id: str) -> Optional[str]:
        """Regenerate client secret for an app"""
        new_secret = generate_client_secret()
        result = await self.apps.find_one_and_update(
            {"id": app_id, "user_id": user_id},
            {"$set": {"client_secret": new_secret}},
            return_document=True
        )
        if result:
            return new_secret
        return None
    
    async def delete_app(self, app_id: str, user_id: str) -> bool:
        """Delete an app"""
        result = await self.apps.delete_one({"id": app_id, "user_id": user_id})
        return result.deleted_count > 0
    
    # ==================== WEBHOOKS ====================
    
    async def get_webhooks_for_user(self, user_id: str) -> List[Dict]:
        """Get all webhook endpoints for a user"""
        webhooks = await self.webhooks.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return webhooks
    
    async def create_webhook(self, user_id: str, webhook_data: Dict) -> Dict:
        """Create a new webhook endpoint"""
        webhook = {
            "id": str(uuid4()),
            "user_id": user_id,
            **webhook_data,
            "secret": generate_webhook_secret(),
            "created_at": datetime.utcnow(),
            "last_success": None
        }
        await self.webhooks.insert_one(webhook)
        return {k: v for k, v in webhook.items() if k != "_id"}
    
    async def update_webhook(self, webhook_id: str, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update a webhook endpoint"""
        result = await self.webhooks.find_one_and_update(
            {"id": webhook_id, "user_id": user_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def delete_webhook(self, webhook_id: str, user_id: str) -> bool:
        """Delete a webhook endpoint"""
        result = await self.webhooks.delete_one({"id": webhook_id, "user_id": user_id})
        return result.deleted_count > 0
    
    # ==================== API LOGS ====================
    
    async def create_api_log(self, user_id: str, method: str, endpoint: str, status_code: int) -> Dict:
        """Create an API log entry"""
        log = {
            "id": str(uuid4()),
            "user_id": user_id,
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "timestamp": datetime.utcnow()
        }
        await self.api_logs.insert_one(log)
        return {k: v for k, v in log.items() if k != "_id"}
    
    async def get_api_logs_for_user(self, user_id: str, limit: int = 100) -> List[Dict]:
        """Get recent API logs for a user"""
        logs = await self.api_logs.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        return logs
    
    # ==================== SYSTEM STATUS ====================
    
    async def get_system_status(self) -> List[Dict]:
        """Get current system status for all services"""
        # This is a simplified version - in production, this would query actual health checks
        services = [
            {"name": "Authentication Service", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "API Gateway", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Database", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Media Service", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Business Mode", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Social Mode", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "BANIBS Wallet", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Helping Hands", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Prayer Rooms", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Beauty & Wellness", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Sneakers & Fashion", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "Diaspora Connect", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"},
            {"name": "BANIBS Academy", "status": "operational", "last_updated": datetime.utcnow(), "message": "All systems operational"}
        ]
        return services
