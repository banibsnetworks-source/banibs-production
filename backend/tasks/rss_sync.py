"""
BANIBS RSS Aggregation Pipeline

This file is authoritative for how external news is ingested.

Rules:
- Sources come from config/rss_sources.py only.
- DO NOT rename fields in NewsItem without updating the homepage.
- DO NOT remove fingerprint-based dedupe.
- /api/news/rss-sync is a protected admin endpoint and MUST remain stable.
- Scheduler calls the same logic every 6 hours to keep BANIBS fresh.
"""

from fastapi import APIRouter, Depends
from typing import List, Dict
import sys
sys.path.append('/app/backend')

from config.rss_sources import RSS_SOURCES
from utils.rss_parser import fetch_and_store_feed

router = APIRouter(prefix="/api/news", tags=["rss-sync"])


@router.post("/rss-sync")
async def sync_rss_feeds():
    """
    Fetch and store latest items from all registered RSS feeds
    
    This endpoint:
    - Fetches latest articles from all configured RSS sources
    - Stores new items in the database (skips duplicates via fingerprint)
    - Returns summary of items fetched per source
    
    Can be called manually or scheduled via APScheduler.
    Should be protected with admin auth in production.
    """
    results = []
    total_new_items = 0
    
    for source in RSS_SOURCES:
        try:
            count = await fetch_and_store_feed(
                url=source["url"],
                category=source["category"],
                source_name=source["name"],
                limit=5  # Fetch 5 most recent items per source
            )
            results.append({
                "source": source["name"],
                "category": source["category"],
                "items_added": count,
                "status": "success"
            })
            total_new_items += count
        except Exception as e:
            results.append({
                "source": source["name"],
                "category": source["category"],
                "error": str(e),
                "status": "failed"
            })
    
    return {
        "success": True,
        "total_sources": len(RSS_SOURCES),
        "total_new_items": total_new_items,
        "results": results,
        "message": f"RSS sync complete. Added {total_new_items} new items."
    }


async def run_sync_job():
    """
    Background job function called by APScheduler
    Executes the same logic as the /rss-sync endpoint
    """
    print("[BANIBS RSS Sync] Starting scheduled sync...")
    try:
        result = await sync_rss_feeds()
        print(f"[BANIBS RSS Sync] Completed: {result['message']}")
        return result
    except Exception as e:
        print(f"[BANIBS RSS Sync] Error: {str(e)}")
        raise
