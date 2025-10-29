from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict

from db.news_analytics import track_news_click, get_trending_stories, get_engagement_summary
from models.news_analytics import NewsClickRequest, TrendingResponse, TrendingStoryResponse
from middleware.auth_guard import require_role

# -------------------------------------------------
# PHASE 6.2 REGIONAL ENGAGEMENT ANALYTICS CONTRACT
#
# Rules:
# 1. Click tracking MUST NOT block user navigation - fail silently
# 2. Rate limiting by IP to prevent obvious abuse
# 3. NO user-level tracking - only story + region aggregates
# 4. Region names must match Phase 6.1 exactly
# 5. Preserve BANIBS branded fallback behavior
# -------------------------------------------------

router = APIRouter(prefix="/api/metrics", tags=["analytics"])

# Simple in-memory rate limiting (could be Redis in production)
click_rate_limiter = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_CLICKS = 30  # max clicks per IP per minute

def check_rate_limit(ip: str) -> bool:
    """Simple rate limiting by IP address"""
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW)
    
    # Remove old entries
    click_rate_limiter[ip] = [
        timestamp for timestamp in click_rate_limiter[ip] 
        if timestamp > cutoff
    ]
    
    # Check if under limit
    if len(click_rate_limiter[ip]) >= RATE_LIMIT_MAX_CLICKS:
        return False
    
    # Add current click
    click_rate_limiter[ip].append(now)
    return True

@router.post("/news-click")
async def record_news_click(click_data: NewsClickRequest, request: Request):
    """
    Record a user click on a news story by region.
    
    This is called when users click story cards to track engagement.
    Rate limited by IP to prevent abuse.
    MUST NOT block user navigation - returns success even if tracking fails.
    """
    try:
        # Get client IP
        client_ip = request.client.host
        
        # Check rate limit
        if not check_rate_limit(client_ip):
            # Still return success - we don't want to block the user
            return {"success": True, "message": "Rate limited, but navigation allowed"}
        
        # Track the click
        success = await track_news_click(click_data.storyId, click_data.region)
        
        return {
            "success": success,
            "message": "Click recorded" if success else "Click tracking failed, but navigation allowed"
        }
        
    except Exception as e:
        # Always return success - never block user navigation
        return {"success": True, "message": "Tracking failed silently"}

# Trending endpoint moved to news routes since it returns news data
# This is just the metrics collection endpoint