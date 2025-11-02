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
from datetime import datetime
import sys
sys.path.append('/app/backend')

from config.rss_sources import RSS_SOURCES
from utils.rss_parser import fetch_and_store_feed

# BANIBS Branded Fallback Image (used for all news items without images)
FALLBACK_IMAGE = "/static/img/fallbacks/news_default.jpg"

router = APIRouter(prefix="/api/news", tags=["rss-sync"])


@router.post("/rss-sync")
async def sync_rss_feeds():
    """
    Manually trigger the full BANIBS news pipeline:
    1. Pull latest RSS content from all sources
    2. Mirror/optimize images to CDN
    3. Generate + log health report

    This endpoint does the same workflow as the automated scheduler.
    NOTE: In production this route MUST be admin/JWT-protected.
    """
    # Import here to avoid circular imports
    from utils.cdn_mirror import mirror_all_images
    from scripts.rss_health_report import generate_health_report, write_report_to_log
    
    results = []
    total_new_items = 0
    
    # Step 1: RSS ingestion
    for source in RSS_SOURCES:
        try:
            # Get fallback image for this category
            fallback_image = FALLBACK_IMAGES.get(source["category"])
            
            count = await fetch_and_store_feed(
                url=source["url"],
                category=source["category"],
                source_name=source["name"],
                limit=5,  # Fetch 5 most recent items per source
                fallback_image=fallback_image,
                region=source.get("region")  # Pass region from RSS source config
            )
            results.append({
                "source": source["name"],
                "category": source["category"],
                "region": source.get("region", "Unknown"),
                "items_added": count,
                "status": "success"
            })
            total_new_items += count
        except Exception as e:
            results.append({
                "source": source["name"],
                "category": source["category"],
                "region": source.get("region", "Unknown"),
                "error": str(e),
                "status": "failed"
            })
    
    # Step 2: Mirror/optimize images
    try:
        mirror_result = await mirror_all_images()
    except Exception as e:
        mirror_result = {"error": str(e), "total_processed": 0}
    
    # Step 3: Generate and log health report
    try:
        health_report = await generate_health_report()
        write_report_to_log(health_report)
    except Exception as e:
        health_report = f"Health report error: {str(e)}"
    
    return {
        "success": True,
        "ranAt": datetime.utcnow().isoformat() + "Z",
        "total_sources": len(RSS_SOURCES),
        "total_new_items": total_new_items,
        "ingestResults": results,
        "mirrorResult": mirror_result,
        "healthReport": health_report,
        "message": f"Full pipeline complete. Added {total_new_items} new items."
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
