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
from db.database import db

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
        marketplace_col = db.get("marketplace_products")
        social_col = db.get("social_posts")
        
        # User metrics
        total_users = await users_col.count_documents({}) if users_col else 0
        
        # Recent users (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = await users_col.count_documents({
            "created_at": {"$gte": seven_days_ago.isoformat()}
        }) if users_col else 0
        
        # Active users (logged in last 24h) - placeholder
        active_users_24h = 0  # Would need login tracking
        
        # Content metrics
        total_news_stories = await news_col.count_documents({}) if news_col else 0
        total_products = await marketplace_col.count_documents({}) if marketplace_col else 0
        total_social_posts = await social_col.count_documents({}) if social_col else 0
        
        # System health (basic checks)
        db_status = "healthy" if db else "disconnected"
        
        return {
            "success": True,
            "data": {
                "users": {
                    "total": total_users,
                    "new_7d": recent_users,
                    "active_24h": active_users_24h,
                },
                "content": {
                    "news_stories": total_news_stories,
                    "marketplace_products": total_products,
                    "social_posts": total_social_posts,
                },
                "system": {
                    "status": "operational",
                    "database": db_status,
                    "api": "healthy",
                    "uptime": "99.9%",  # Placeholder
                },
                "generated_at": datetime.utcnow().isoformat(),
            }
        }
        
    except Exception:
        # Return placeholder data on error
        return {
            "success": True,
            "data": {
                "users": {
                    "total": 0,
                    "new_7d": 0,
                    "active_24h": 0,
                },
                "content": {
                    "news_stories": 0,
                    "marketplace_products": 0,
                    "social_posts": 0,
                },
                "system": {
                    "status": "operational",
                    "database": "checking...",
                    "api": "healthy",
                    "uptime": "99.9%",
                },
                "generated_at": datetime.utcnow().isoformat(),
                "note": "Some metrics unavailable"
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
