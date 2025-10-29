"""
BANIBS Automated RSS Sync Scheduler

Uses APScheduler to automatically sync RSS feeds every 6 hours.
Ensures the homepage "Latest Stories" section stays fresh.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import asyncio

# Lazy import to avoid circular dependencies
scheduler = None


def init_scheduler():
    """
    Initialize APScheduler and register the RSS sync job
    
    Runs every 6 hours to pull fresh news from all configured sources.
    Called from FastAPI startup event in server.py.
    """
    global scheduler
    
    if scheduler is not None:
        print("[BANIBS Scheduler] Already initialized, skipping...")
        return
    
    scheduler = AsyncIOScheduler()
    
    # Import the sync job function
    from tasks.rss_sync import run_sync_job
    
    # Schedule job to run every 6 hours
    scheduler.add_job(
        run_sync_job,
        trigger="interval",
        hours=6,
        id="rss_sync_job",
        name="BANIBS RSS Feed Sync",
        replace_existing=True,
        next_run_time=datetime.now()  # Run immediately on startup
    )
    
    scheduler.start()
    print("[BANIBS Scheduler] Started. RSS sync will run every 6 hours.")


def shutdown_scheduler():
    """
    Gracefully shutdown the scheduler
    Called from FastAPI shutdown event if needed.
    """
    global scheduler
    if scheduler is not None:
        scheduler.shutdown()
        print("[BANIBS Scheduler] Shutdown complete.")
