"""
Daily Sentiment Aggregation Task - Phase 6.5
Scheduled task to aggregate sentiment data daily
"""

from datetime import date, timedelta
import asyncio
import logging

from services.sentiment_aggregation_service import aggregate_sentiment_for_date
from utils.features import is_feature_enabled

logger = logging.getLogger(__name__)


def run_daily_sentiment_aggregation():
    """
    Run daily sentiment aggregation
    
    This function is called by the scheduler at 00:30 UTC daily.
    Aggregates sentiment data from the previous day.
    """
    # Check feature flag
    if not is_feature_enabled("analytics.aggregation_job_enabled"):
        logger.info("Sentiment aggregation job is disabled via feature flag")
        return
    
    # Get yesterday's date
    yesterday = date.today() - timedelta(days=1)
    
    logger.info(f"Starting daily sentiment aggregation for {yesterday}")
    
    try:
        # Run aggregation
        asyncio.run(_run_aggregation(yesterday))
        logger.info(f"Daily sentiment aggregation completed successfully for {yesterday}")
    except Exception as e:
        logger.error(f"Daily sentiment aggregation failed for {yesterday}: {e}", exc_info=True)


async def _run_aggregation(target_date: date):
    """Async wrapper for aggregation"""
    counts = await aggregate_sentiment_for_date(target_date)
    logger.info(f"Aggregation results for {target_date}: {counts}")
