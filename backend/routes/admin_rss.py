"""
Admin RSS Management Endpoint
Simple functional view for RSS source management
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import sys
sys.path.append('/app/backend')

from config.rss_sources import RSS_SOURCES, get_stats, get_categories

router = APIRouter(prefix="/api/admin/rss", tags=["admin-rss"])


@router.get("/sources")
async def list_rss_sources():
    """
    List all RSS sources with their status
    
    Returns:
        List of RSS sources with metadata
    """
    sources_with_status = []
    
    for source in RSS_SOURCES:
        sources_with_status.append({
            "id": source["id"],
            "source_name": source["source_name"],
            "category": source["category"],
            "rss_url": source["rss_url"],
            "active": source.get("active", True),
            "priority": source.get("priority", 2),
            "featured_source": source.get("featured_source", False),
            "language": source.get("language", "en"),
        })
    
    return {
        "sources": sources_with_status,
        "stats": get_stats()
    }


@router.get("/stats")
async def get_rss_stats():
    """
    Get RSS feed statistics
    
    Returns:
        Statistics about RSS sources
    """
    return get_stats()


@router.get("/categories")
async def get_rss_categories():
    """
    Get list of all RSS categories
    
    Returns:
        List of categories with source counts
    """
    categories = get_categories()
    category_stats = {}
    
    for category in categories:
        sources = [s for s in RSS_SOURCES if s["category"] == category]
        active_count = len([s for s in sources if s.get("active", True)])
        
        category_stats[category] = {
            "total_sources": len(sources),
            "active_sources": active_count,
            "inactive_sources": len(sources) - active_count
        }
    
    return {
        "categories": category_stats,
        "total_categories": len(categories)
    }


@router.get("/health")
async def get_feed_health():
    """
    Get health status of RSS feeds
    
    Returns:
        Health report including recent sync results
    """
    # This would be enhanced to show actual sync results from database
    # For now, return basic stats
    return {
        "message": "Feed health endpoint - to be enhanced with sync history",
        "stats": get_stats(),
        "note": "Run POST /api/news/rss-sync to trigger a sync and see detailed results"
    }
