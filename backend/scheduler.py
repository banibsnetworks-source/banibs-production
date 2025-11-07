"""
BANIBS Automated RSS Sync Scheduler

Uses APScheduler to automatically sync RSS feeds every 6 hours.
Full pipeline: RSS sync → Image mirror/optimize → Health report
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import asyncio
import sys
sys.path.append('/app/backend')

from config.rss_sources import RSS_SOURCES
from utils.rss_parser import fetch_and_store_feed
from utils.cdn_mirror import mirror_all_images
from scripts.rss_health_report import generate_health_report, write_report_to_log
from tasks.sentiment_sweep import run_sentiment_sweep

# Global scheduler instance
scheduler = None

# BANIBS Branded Fallback Images by Category  
FALLBACK_IMAGES = {
    "Business": "https://cdn.banibs.com/fallback/business.jpg",
    "Technology": "https://cdn.banibs.com/fallback/tech.jpg", 
    "Education": "https://cdn.banibs.com/fallback/education.jpg",
    "Community": "https://cdn.banibs.com/fallback/community.jpg",
    "Opportunities": "https://cdn.banibs.com/fallback/opportunities.jpg",
}


async def run_all_feeds_job():
    """
    This is the full BANIBS news refresh pipeline.

    Steps:
    1. Pull latest RSS stories from all configured feeds.
    2. Mirror & optimize all story images into cdn.banibs.com/news.
    3. Generate and log a health report (coverage/CDN/size).
    """
    print(f"[BANIBS RSS Sync] Starting full pipeline at {datetime.utcnow().isoformat()}Z")
    
    try:
        # Step 1: Ingest fresh stories from all RSS sources
        total_new_items = 0
        for source in RSS_SOURCES:
            try:
                # Get fallback image for this category
                fallback_image = FALLBACK_IMAGES.get(source["category"])
                
                count = await fetch_and_store_feed(
                    url=source["url"],
                    category=source["category"],
                    source_name=source["name"],
                    limit=5,
                    fallback_image=fallback_image
                )
                total_new_items += count
                print(f"[RSS] {source['name']}: {count} new items")
            except Exception as e:
                print(f"[RSS] {source['name']}: Error - {str(e)}")
        
        print(f"[BANIBS RSS Sync] Ingested {total_new_items} new stories")

        # Step 2: Mirror & optimize thumbnails to CDN
        mirror_result = await mirror_all_images()
        print(f"[BANIBS RSS Sync] CDN mirror completed: {mirror_result}")

    except Exception as e:
        print(f"[BANIBS RSS Sync] Pipeline error: {e}")

    # Step 3: Generate and log health snapshot
    try:
        report = await generate_health_report()
        write_report_to_log(report)
        print("[BANIBS RSS Sync] Health report written to log")
    except Exception as e:
        print(f"[BANIBS RSS Sync] Health report error: {e}")
    
    print(f"[BANIBS RSS Sync] Full pipeline completed at {datetime.utcnow().isoformat()}Z")


def init_scheduler():
    """
    Initialize APScheduler and register jobs:
    1. RSS sync job - runs every 6 hours (RSS + CDN mirror + health report)
    2. Sentiment sweep job - runs every 3 hours (AI sentiment analysis + cleanup)
    
    Called from FastAPI startup event in server.py.
    """
    global scheduler
    
    if scheduler is not None:
        print("[BANIBS Scheduler] Already initialized, skipping...")
        return
    
    scheduler = AsyncIOScheduler()
    
    # Job 1: Full RSS pipeline (every 6 hours)
    scheduler.add_job(
        run_all_feeds_job,
        trigger="interval",
        hours=6,
        id="rss_sync_job",
        name="BANIBS Full RSS Pipeline",
        replace_existing=True,
        next_run_time=datetime.now()  # Run immediately on startup
    )
    
    # Job 2: Sentiment sweep (every 3 hours)
    scheduler.add_job(
        run_sentiment_sweep,
        trigger="interval",
        hours=3,
        id="sentiment_sweep_job",
        name="BANIBS Sentiment Sweep",
        replace_existing=True,
        next_run_time=datetime.now()  # Run immediately on startup
    )
    
    # Job 3: Daily sentiment aggregation (Phase 6.5 - at 00:30 UTC)
    from tasks.sentiment_aggregation import run_daily_sentiment_aggregation
    scheduler.add_job(
        run_daily_sentiment_aggregation,
        trigger="cron",
        hour=0,
        minute=30,
        id="sentiment_aggregation_job",
        name="BANIBS Daily Sentiment Aggregation",
        replace_existing=True
    )
    
    scheduler.start()
    print("[BANIBS Scheduler] Started.")
    print("  - RSS pipeline: every 6 hours")
    print("  - Sentiment sweep: every 3 hours")
    print("  - Sentiment aggregation: daily at 00:30 UTC")


def shutdown_scheduler():
    """
    Gracefully shutdown the scheduler
    Called from FastAPI shutdown event if needed.
    """
    global scheduler
    if scheduler is not None:
        scheduler.shutdown()
        print("[BANIBS Scheduler] Shutdown complete.")
