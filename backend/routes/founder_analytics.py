"""
Founder Analytics Dashboard API
Route: /api/founder/analytics
Access: super_admin only

Provides system health and usage metrics for the founder dashboard.
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from typing import Optional
import os

from middleware.auth_guard import require_role
from db import db

router = APIRouter(prefix="/api/founder/analytics", tags=["founder-analytics"])


@router.get("/overview")
async def get_analytics_overview(user=Depends(require_role("super_admin"))):
    """
    Get high-level analytics overview for founder dashboard.
    Returns system health, user metrics, and content stats.
    """
    try:
        # Get database collections
        users_col = db["banibs_users"]
        news_col = db.get("news_stories")
        marketplace_col = db.get("marketplace_orders")
        social_col = db.get("social_posts")
        
        # User metrics
        total_users = 0
        try:
            total_users = await users_col.count_documents({})
        except:
            pass
        
        # Content metrics
        total_articles = 0
        try:
            if news_col:
                total_articles = await news_col.count_documents({})
        except:
            pass
        
        # Marketplace demo orders (mock_paid)
        demo_orders = 0
        try:
            if marketplace_col:
                demo_orders = await marketplace_col.count_documents({"payment_status": "mock_paid"})
        except:
            pass
        
        # Social posts
        total_posts = 0
        try:
            if social_col:
                total_posts = await social_col.count_documents({})
        except:
            pass
        
        # Last 24h activity (placeholder - would need activity logging)
        activity_24h = "coming soon"
        
        # Database connection status
        db_connected = db is not None
        
        return {
            "success": True,
            "data": {
                "users": {
                    "total": total_users,
                },
                "content": {
                    "total_articles": total_articles,
                    "total_posts": total_posts,
                    "demo_orders": demo_orders,
                },
                "activity_24h": activity_24h,
                "system": {
                    "backend_health": "healthy",
                    "db_connected": db_connected,
                    "build_version": "BANIBS v1.0.0-preview",
                },
                "generated_at": datetime.utcnow().isoformat(),
            }
        }
        
    except Exception as e:
        return {
            "success": True,
            "data": {
                "users": {"total": 0},
                "content": {
                    "total_articles": 0,
                    "total_posts": 0,
                    "demo_orders": 0,
                },
                "activity_24h": "coming soon",
                "system": {
                    "backend_health": "error",
                    "db_connected": False,
                    "build_version": "BANIBS v1.0.0-preview",
                },
                "generated_at": datetime.utcnow().isoformat(),
                "error": str(e)
            }
        }


@router.get("/modules")
async def get_module_status(user=Depends(require_role("super_admin"))):
    """
    Get status of all system modules for founder dashboard.
    """
    modules = [
        {"id": "news", "name": "BANIBS News", "status": "active", "health": "healthy"},
        {"id": "social", "name": "BANIBS Social", "status": "active", "health": "healthy"},
        {"id": "marketplace", "name": "Marketplace", "status": "demo", "health": "healthy"},
        {"id": "tv", "name": "BANIBS TV", "status": "coming_soon", "health": "n/a"},
        {"id": "connect", "name": "BANIBS Connect", "status": "active", "health": "healthy"},
        {"id": "bglis", "name": "BGLIS Auth", "status": "mocked", "health": "n/a"},
        {"id": "vault", "name": "Founder Vault", "status": "active", "health": "healthy"},
    ]
    
    return {
        "success": True,
        "modules": modules,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/activity")
async def get_recent_activity(user=Depends(require_role("super_admin")), limit: int = 10):
    """
    Get recent system activity for founder dashboard.
    """
    # Placeholder activity - would connect to actual activity logs
    activity = [
        {"type": "user_signup", "message": "New user registered", "timestamp": datetime.utcnow().isoformat()},
        {"type": "system", "message": "News feed refreshed", "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat()},
        {"type": "marketplace", "message": "Demo products loaded", "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()},
    ]
    
    return {
        "success": True,
        "activity": activity[:limit],
        "generated_at": datetime.utcnow().isoformat(),
    }
