"""
BANIBS OS / Developer Platform - API Routes
Phase 15.0
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Optional
from datetime import datetime

from models.developer import (
    DeveloperProfile,
    DeveloperProfileCreate,
    DeveloperProfileUpdate,
    DeveloperAPIKey,
    DeveloperAPIKeyCreate,
    DeveloperAPIKeyUpdate,
    DeveloperAPIKeysResponse,
    DeveloperApp,
    DeveloperAppCreate,
    DeveloperAppUpdate,
    DeveloperAppsResponse,
    WebhookEndpoint,
    WebhookEndpointCreate,
    WebhookEndpointUpdate,
    WebhookEndpointsResponse,
    APILogsResponse,
    SystemStatusResponse,
    ServiceStatus
)
from db.developer import DeveloperDB
from middleware.auth_guard import get_current_user
from db.connection import get_db_client

router = APIRouter(prefix="/developer", tags=["BANIBS OS"])


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_developer_dashboard(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """
    Get developer dashboard metrics
    
    Returns comprehensive metrics including:
    - API key count
    - App count
    - Webhook count
    - Recent API activity
    - System status
    """
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    # Get counts
    api_keys = await dev_db.get_api_keys_for_user(user_id)
    apps = await dev_db.get_apps_for_user(user_id)
    webhooks = await dev_db.get_webhooks_for_user(user_id)
    
    # Get recent API logs
    recent_logs = await dev_db.get_api_logs_for_user(user_id, limit=10)
    
    # Calculate stats
    active_api_keys = len([k for k in api_keys if k["status"] == "active"])
    active_apps = len([a for a in apps if a["status"] == "active"])
    
    # Calculate total API calls (from logs)
    total_api_calls = len(await dev_db.get_api_logs_for_user(user_id, limit=1000))
    
    # Calculate success rate
    if recent_logs:
        successful_calls = len([log for log in recent_logs if 200 <= log["status_code"] < 300])
        success_rate = (successful_calls / len(recent_logs)) * 100 if recent_logs else 0
    else:
        success_rate = 0
    
    return {
        "user_id": user_id,
        "stats": {
            "api_keys": {
                "total": len(api_keys),
                "active": active_api_keys
            },
            "apps": {
                "total": len(apps),
                "active": active_apps
            },
            "webhooks": {
                "total": len(webhooks)
            },
            "api_calls": {
                "total": total_api_calls,
                "success_rate": round(success_rate, 2)
            }
        },
        "recent_activity": recent_logs[:5],
        "quick_start": {
            "has_api_key": len(api_keys) > 0,
            "has_app": len(apps) > 0,
            "has_webhook": len(webhooks) > 0
        }
    }


# ==================== API KEYS ====================

@router.get("/api-keys", response_model=DeveloperAPIKeysResponse)
async def get_api_keys(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Get all API keys for the authenticated developer"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    api_keys = await dev_db.get_api_keys_for_user(user_id)
    
    return {
        "api_keys": api_keys,
        "total": len(api_keys)
    }


@router.post("/api-keys", response_model=DeveloperAPIKey)
async def create_api_key(
    key_data: DeveloperAPIKeyCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Create a new API key for the authenticated developer"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    # Check limit (max 10 API keys per user)
    existing_keys = await dev_db.get_api_keys_for_user(user_id)
    if len(existing_keys) >= 10:
        raise HTTPException(status_code=400, detail="Maximum API key limit (10) reached")
    
    new_key = await dev_db.create_api_key(user_id, key_data.label)
    
    return new_key


@router.put("/api-keys/{key_id}", response_model=DeveloperAPIKey)
async def update_api_key(
    key_id: str,
    updates: DeveloperAPIKeyUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Update an API key (label or status only)"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    
    updated_key = await dev_db.update_api_key(key_id, user_id, update_data)
    
    if not updated_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return updated_key


@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Delete an API key"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    deleted = await dev_db.delete_api_key(key_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key deleted successfully"}


# ==================== APPS ====================

@router.get("/apps", response_model=DeveloperAppsResponse)
async def get_apps(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Get all apps for the authenticated developer"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    apps = await dev_db.get_apps_for_user(user_id)
    
    return {
        "apps": apps,
        "total": len(apps)
    }


@router.get("/apps/{app_id}", response_model=DeveloperApp)
async def get_app_by_id(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Get a specific app by ID"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    app = await dev_db.get_app_by_id(app_id, user_id)
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    return app


@router.post("/apps", response_model=DeveloperApp)
async def create_app(
    app_data: DeveloperAppCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Create a new app for the authenticated developer"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    # Check limit (max 20 apps per user)
    existing_apps = await dev_db.get_apps_for_user(user_id)
    if len(existing_apps) >= 20:
        raise HTTPException(status_code=400, detail="Maximum app limit (20) reached")
    
    new_app = await dev_db.create_app(
        user_id,
        {
            "name": app_data.name,
            "description": app_data.description,
            "redirect_url": app_data.redirect_url
        }
    )
    
    return new_app


@router.put("/apps/{app_id}", response_model=DeveloperApp)
async def update_app(
    app_id: str,
    updates: DeveloperAppUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Update an app"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    
    updated_app = await dev_db.update_app(app_id, user_id, update_data)
    
    if not updated_app:
        raise HTTPException(status_code=404, detail="App not found")
    
    return updated_app


@router.post("/apps/{app_id}/regenerate-secret")
async def regenerate_app_secret(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Regenerate the client secret for an app"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    new_secret = await dev_db.regenerate_client_secret(app_id, user_id)
    
    if not new_secret:
        raise HTTPException(status_code=404, detail="App not found")
    
    return {
        "message": "Client secret regenerated successfully",
        "client_secret": new_secret
    }


@router.delete("/apps/{app_id}")
async def delete_app(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Delete an app"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    deleted = await dev_db.delete_app(app_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="App not found")
    
    return {"message": "App deleted successfully"}


# ==================== WEBHOOKS ====================

@router.get("/webhooks", response_model=WebhookEndpointsResponse)
async def get_webhooks(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Get all webhook endpoints for the authenticated developer"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    webhooks = await dev_db.get_webhooks_for_user(user_id)
    
    return {
        "webhooks": webhooks,
        "total": len(webhooks)
    }


@router.post("/webhooks", response_model=WebhookEndpoint)
async def create_webhook(
    webhook_data: WebhookEndpointCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Create a new webhook endpoint for the authenticated developer"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    # Check limit (max 10 webhooks per user)
    existing_webhooks = await dev_db.get_webhooks_for_user(user_id)
    if len(existing_webhooks) >= 10:
        raise HTTPException(status_code=400, detail="Maximum webhook limit (10) reached")
    
    new_webhook = await dev_db.create_webhook(
        user_id,
        {
            "url": webhook_data.url,
            "events": webhook_data.events
        }
    )
    
    return new_webhook


@router.put("/webhooks/{webhook_id}", response_model=WebhookEndpoint)
async def update_webhook(
    webhook_id: str,
    updates: WebhookEndpointUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Update a webhook endpoint"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    
    updated_webhook = await dev_db.update_webhook(webhook_id, user_id, update_data)
    
    if not updated_webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    return updated_webhook


@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Delete a webhook endpoint"""
    dev_db = DeveloperDB(db)
    user_id = current_user["id"]
    
    deleted = await dev_db.delete_webhook(webhook_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    return {"message": "Webhook deleted successfully"}


# ==================== DOCUMENTATION ====================

@router.get("/docs")
async def get_developer_docs(
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive API documentation
    
    Returns structured documentation for all BANIBS API endpoints
    """
    
    docs = {
        "overview": {
            "title": "BANIBS API Documentation",
            "version": "1.0.0",
            "description": "The BANIBS API provides programmatic access to the entire BANIBS ecosystem, empowering developers to build apps, integrations, and experiences for the Black community.",
            "base_url": "/api",
            "authentication": "Bearer token (JWT) in Authorization header"
        },
        "endpoints": [
            {
                "category": "Authentication",
                "description": "User authentication and session management",
                "endpoints": [
                    {"method": "POST", "path": "/auth/register", "description": "Register a new user"},
                    {"method": "POST", "path": "/auth/login", "description": "Login and obtain JWT token"},
                    {"method": "GET", "path": "/auth/me", "description": "Get current user profile"},
                    {"method": "PUT", "path": "/auth/profile", "description": "Update user profile"}
                ]
            },
            {
                "category": "Business Mode",
                "description": "Business directory and profiles",
                "endpoints": [
                    {"method": "GET", "path": "/businesses", "description": "List all Black-owned businesses"},
                    {"method": "POST", "path": "/businesses", "description": "Create a business profile"},
                    {"method": "GET", "path": "/businesses/{id}", "description": "Get business details"},
                    {"method": "PUT", "path": "/businesses/{id}", "description": "Update business profile"}
                ]
            },
            {
                "category": "Social Mode",
                "description": "Social networking features",
                "endpoints": [
                    {"method": "GET", "path": "/feed", "description": "Get social feed"},
                    {"method": "POST", "path": "/posts", "description": "Create a post"},
                    {"method": "POST", "path": "/posts/{id}/like", "description": "Like a post"},
                    {"method": "POST", "path": "/posts/{id}/comment", "description": "Comment on a post"}
                ]
            },
            {
                "category": "Helping Hands",
                "description": "Crowdfunding and community campaigns",
                "endpoints": [
                    {"method": "GET", "path": "/helpinghands/campaigns", "description": "List all campaigns"},
                    {"method": "POST", "path": "/helpinghands/campaigns", "description": "Create a campaign"},
                    {"method": "POST", "path": "/helpinghands/campaigns/{id}/contribute", "description": "Contribute to a campaign"}
                ]
            },
            {
                "category": "Prayer Rooms",
                "description": "Spiritual connection and prayer communities",
                "endpoints": [
                    {"method": "GET", "path": "/prayer-rooms", "description": "List prayer rooms"},
                    {"method": "POST", "path": "/prayer-rooms", "description": "Create a prayer room"},
                    {"method": "POST", "path": "/prayer-rooms/{id}/join", "description": "Join a prayer room"}
                ]
            },
            {
                "category": "Beauty & Wellness",
                "description": "Beauty, wellness, and self-care",
                "endpoints": [
                    {"method": "GET", "path": "/beauty-wellness/services", "description": "Browse services"},
                    {"method": "GET", "path": "/beauty-wellness/tips", "description": "Get beauty tips and tutorials"}
                ]
            },
            {
                "category": "Sneakers & Fashion",
                "description": "Fashion ownership and authentication",
                "endpoints": [
                    {"method": "GET", "path": "/sneakers-fashion/items", "description": "List fashion items"},
                    {"method": "POST", "path": "/sneakers-fashion/verify", "description": "Verify item authenticity"}
                ]
            },
            {
                "category": "Diaspora Connect",
                "description": "Global Black diaspora connection",
                "endpoints": [
                    {"method": "GET", "path": "/diaspora/regions", "description": "List diaspora regions"},
                    {"method": "GET", "path": "/diaspora/stories", "description": "Get community stories"},
                    {"method": "GET", "path": "/diaspora/businesses", "description": "Search diaspora businesses"}
                ]
            },
            {
                "category": "BANIBS Academy",
                "description": "Educational content and mentorship",
                "endpoints": [
                    {"method": "GET", "path": "/academy/courses", "description": "List available courses"},
                    {"method": "GET", "path": "/academy/mentors", "description": "Find mentors"},
                    {"method": "GET", "path": "/academy/opportunities", "description": "Browse scholarships and opportunities"}
                ]
            },
            {
                "category": "BANIBS Wallet",
                "description": "Financial tracking and budgeting (auth required)",
                "endpoints": [
                    {"method": "GET", "path": "/wallet/accounts", "description": "Get wallet accounts"},
                    {"method": "GET", "path": "/wallet/transactions", "description": "List transactions"},
                    {"method": "GET", "path": "/wallet/goals", "description": "Get savings goals"},
                    {"method": "GET", "path": "/wallet/envelopes", "description": "Get budget envelopes"}
                ]
            }
        ],
        "webhooks": {
            "description": "Real-time event notifications via webhooks",
            "events": [
                "user.created",
                "user.updated",
                "business.created",
                "business.updated",
                "campaign.created",
                "campaign.funded",
                "transaction.created",
                "post.created",
                "post.liked"
            ],
            "payload_format": {
                "event": "string",
                "timestamp": "ISO 8601 datetime",
                "data": "object (event-specific data)"
            }
        },
        "sdks": [
            {
                "language": "JavaScript",
                "package": "@banibs/js-sdk",
                "install": "npm install @banibs/js-sdk",
                "download_url": "https://cdn.banibs.com/sdks/js/latest.zip"
            },
            {
                "language": "Python",
                "package": "banibs-sdk",
                "install": "pip install banibs-sdk",
                "download_url": "https://cdn.banibs.com/sdks/python/latest.zip"
            },
            {
                "language": "Ruby",
                "package": "banibs-ruby",
                "install": "gem install banibs",
                "download_url": "https://cdn.banibs.com/sdks/ruby/latest.zip"
            }
        ],
        "rate_limits": {
            "default": "1000 requests per hour",
            "authenticated": "5000 requests per hour",
            "headers": {
                "X-RateLimit-Limit": "Maximum requests per hour",
                "X-RateLimit-Remaining": "Remaining requests",
                "X-RateLimit-Reset": "Unix timestamp when limit resets"
            }
        },
        "examples": {
            "authentication": {
                "description": "How to authenticate with the BANIBS API",
                "code": """
# 1. Login to get token
curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "dev@example.com", "password": "your_password"}'

# 2. Use token in subsequent requests
curl -X GET /api/businesses \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
"""
            },
            "create_business": {
                "description": "Create a new business profile",
                "code": """
curl -X POST /api/businesses \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Black-Owned Business",
    "category": "Technology",
    "description": "Building the future",
    "contact_email": "hello@mybusiness.com"
  }'
"""
            }
        }
    }
    
    return docs


# ==================== SYSTEM STATUS ====================

@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Get current system status for all BANIBS services"""
    dev_db = DeveloperDB(db)
    
    services = await dev_db.get_system_status()
    
    # Determine overall status
    statuses = [s["status"] for s in services]
    if any(s == "outage" for s in statuses):
        overall_status = ServiceStatus.OUTAGE
    elif any(s == "degraded" for s in statuses):
        overall_status = ServiceStatus.DEGRADED
    else:
        overall_status = ServiceStatus.OPERATIONAL
    
    return {
        "services": services,
        "overall_status": overall_status,
        "last_updated": datetime.utcnow()
    }
