"""
Initialize BANIBS OS / Developer Platform data
Phase 15.0 - Seed sample developer data
"""

import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from uuid import uuid4

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.developer import generate_api_key, generate_client_id, generate_client_secret, generate_webhook_secret


async def init_developer_data():
    """Initialize sample developer data"""
    
    # Get MongoDB URL from environment
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017/banibs")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_default_database()
    
    print("🔧 Initializing BANIBS OS / Developer Platform data...")
    
    # Sample user ID (you should have a real user ID from your auth system)
    # For seeding purposes, we'll create a demo developer user
    demo_user_id = "demo-developer-user-001"
    
    # ==================== SAMPLE API KEY ====================
    
    sample_api_key = {
        "id": str(uuid4()),
        "user_id": demo_user_id,
        "label": "Production API Key",
        "api_key": generate_api_key(),
        "created_at": datetime.utcnow(),
        "last_used": datetime.utcnow(),
        "status": "active"
    }
    
    await db.developer_api_keys.delete_many({"user_id": demo_user_id})
    await db.developer_api_keys.insert_one(sample_api_key)
    print(f"✅ Created sample API key: {sample_api_key['label']}")
    
    # ==================== SAMPLE APPS ====================
    
    sample_apps = [
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "name": "Black Business Analytics Dashboard",
            "description": "A comprehensive analytics platform for tracking and growing Black-owned businesses. Features include revenue tracking, customer insights, and market analysis.",
            "redirect_url": "https://blackbiz-analytics.com/callback",
            "client_id": generate_client_id(),
            "client_secret": generate_client_secret(),
            "status": "active",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "name": "Community Connector Mobile App",
            "description": "Mobile application connecting the Black diaspora worldwide. Features location-based networking, event discovery, and cultural exchange.",
            "redirect_url": "https://community-connector.app/oauth/callback",
            "client_id": generate_client_id(),
            "client_secret": generate_client_secret(),
            "status": "draft",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.developer_apps.delete_many({"user_id": demo_user_id})
    await db.developer_apps.insert_many(sample_apps)
    print(f"✅ Created {len(sample_apps)} sample apps")
    
    # ==================== SAMPLE WEBHOOKS ====================
    
    sample_webhooks = [
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "url": "https://blackbiz-analytics.com/webhooks/banibs",
            "events": ["business.created", "business.updated", "transaction.created"],
            "secret": generate_webhook_secret(),
            "created_at": datetime.utcnow(),
            "last_success": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "url": "https://community-connector.app/webhooks/events",
            "events": ["user.created", "user.updated", "post.created"],
            "secret": generate_webhook_secret(),
            "created_at": datetime.utcnow(),
            "last_success": None
        }
    ]
    
    await db.webhook_endpoints.delete_many({"user_id": demo_user_id})
    await db.webhook_endpoints.insert_many(sample_webhooks)
    print(f"✅ Created {len(sample_webhooks)} sample webhooks")
    
    # ==================== SAMPLE API LOGS ====================
    
    sample_logs = [
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "method": "GET",
            "endpoint": "/api/businesses",
            "status_code": 200,
            "timestamp": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "method": "POST",
            "endpoint": "/api/businesses",
            "status_code": 201,
            "timestamp": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "method": "GET",
            "endpoint": "/api/feed",
            "status_code": 200,
            "timestamp": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "method": "POST",
            "endpoint": "/api/helpinghands/campaigns",
            "status_code": 201,
            "timestamp": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": demo_user_id,
            "method": "GET",
            "endpoint": "/api/wallet/accounts",
            "status_code": 200,
            "timestamp": datetime.utcnow()
        }
    ]
    
    await db.api_logs.delete_many({"user_id": demo_user_id})
    await db.api_logs.insert_many(sample_logs)
    print(f"✅ Created {len(sample_logs)} sample API logs")
    
    print("\n🎉 BANIBS OS / Developer Platform data initialization complete!")
    print(f"📝 Demo User ID: {demo_user_id}")
    print(f"🔑 Sample API Key: {sample_api_key['api_key']}")
    print(f"📱 Sample Apps: {len(sample_apps)}")
    print(f"🔗 Sample Webhooks: {len(sample_webhooks)}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(init_developer_data())
