"""
Sentiment Analytics Backfill Script - Phase 6.5
Backfill historical sentiment aggregates from existing news and resources
"""

import asyncio
from datetime import date, timedelta, datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.sentiment_aggregation_service import aggregate_sentiment_for_date
from db.connection import get_db


async def get_date_range_with_sentiment():
    """
    Get the date range of items with sentiment data
    
    Returns:
        tuple: (earliest_date, latest_date)
    """
    db = await get_db()
    
    # Get earliest and latest news with sentiment
    news_collection = db["news_items"]
    earliest_news = await news_collection.find_one(
        {"sentiment_label": {"$exists": True, "$ne": None}},
        sort=[("published_at", 1)]
    )
    latest_news = await news_collection.find_one(
        {"sentiment_label": {"$exists": True, "$ne": None}},
        sort=[("published_at", -1)]
    )
    
    # Get earliest and latest resources with sentiment
    resources_collection = db["banibs_resources"]
    earliest_resource = await resources_collection.find_one(
        {"sentiment_label": {"$exists": True, "$ne": None}},
        sort=[("created_at", 1)]
    )
    latest_resource = await resources_collection.find_one(
        {"sentiment_label": {"$exists": True, "$ne": None}},
        sort=[("created_at", -1)]
    )
    
    # Determine overall range
    dates = []
    
    if earliest_news and earliest_news.get("published_at"):
        pub_date = earliest_news["published_at"]
        if isinstance(pub_date, datetime):
            dates.append(pub_date.date())
        elif isinstance(pub_date, date):
            dates.append(pub_date)
    
    if latest_news and latest_news.get("published_at"):
        pub_date = latest_news["published_at"]
        if isinstance(pub_date, datetime):
            dates.append(pub_date.date())
        elif isinstance(pub_date, date):
            dates.append(pub_date)
    
    if earliest_resource and earliest_resource.get("created_at"):
        created = earliest_resource["created_at"]
        if isinstance(created, datetime):
            dates.append(created.date())
        elif isinstance(created, date):
            dates.append(created)
    
    if latest_resource and latest_resource.get("created_at"):
        created = latest_resource["created_at"]
        if isinstance(created, datetime):
            dates.append(created.date())
        elif isinstance(created, date):
            dates.append(created)
    
    if not dates:
        return None, None
    
    return min(dates), max(dates)


async def backfill_sentiment_aggregates(
    start_date: date = None,
    end_date: date = None,
    batch_size: int = 7
):
    """
    Backfill sentiment aggregates for historical data
    
    Args:
        start_date: Start date (default: earliest item with sentiment)
        end_date: End date (default: yesterday)
        batch_size: Number of days to process in each batch
    """
    print("=" * 60)
    print("BANIBS Sentiment Analytics Backfill Script")
    print("=" * 60)
    
    # Determine date range
    if not start_date or not end_date:
        print("\nDetermining date range from existing data...")
        earliest, latest = await get_date_range_with_sentiment()
        
        if not earliest or not latest:
            print("❌ No items with sentiment data found. Nothing to backfill.")
            return
        
        start_date = start_date or earliest
        end_date = end_date or (date.today() - timedelta(days=1))  # Yesterday
        
        print(f"  Earliest item with sentiment: {earliest}")
        print(f"  Latest item with sentiment: {latest}")
    
    print(f"\n📅 Backfill Date Range:")
    print(f"  Start: {start_date}")
    print(f"  End: {end_date}")
    
    # Calculate total days
    total_days = (end_date - start_date).days + 1
    print(f"  Total days: {total_days}")
    
    if total_days <= 0:
        print("❌ Invalid date range. End date must be after start date.")
        return
    
    # Confirm
    print(f"\n⚠️  This will process {total_days} days of sentiment data.")
    response = input("Continue? (yes/no): ")
    if response.lower() not in ["yes", "y"]:
        print("Backfill cancelled.")
        return
    
    # Process in batches
    print(f"\n🔄 Processing {total_days} days in batches of {batch_size}...")
    current_date = start_date
    batch_num = 1
    processed = 0
    errors = 0
    
    while current_date <= end_date:
        # Process batch
        batch_end = min(current_date + timedelta(days=batch_size - 1), end_date)
        batch_days = (batch_end - current_date).days + 1
        
        print(f"\n📦 Batch {batch_num}: {current_date} to {batch_end} ({batch_days} days)")
        
        # Process each day in batch
        batch_date = current_date
        while batch_date <= batch_end:
            try:
                print(f"  Processing {batch_date}...", end=" ", flush=True)
                counts = await aggregate_sentiment_for_date(batch_date)
                print(f"✅ Done ({counts['overall']} overall, {counts['source']} sources, "
                      f"{counts['category']} categories, {counts['region']} regions)")
                processed += 1
            except Exception as e:
                print(f"❌ Error: {e}")
                errors += 1
            
            batch_date += timedelta(days=1)
        
        # Move to next batch
        current_date = batch_end + timedelta(days=1)
        batch_num += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("Backfill Complete!")
    print("=" * 60)
    print(f"✅ Successfully processed: {processed} days")
    if errors > 0:
        print(f"❌ Errors: {errors} days")
    print(f"📊 Total days attempted: {total_days}")
    print("\nSentiment aggregates are now available for analytics queries.")


async def main():
    """Main entry point"""
    import sys
    
    # Parse command line args
    start = None
    end = None
    
    if len(sys.argv) > 1:
        try:
            start = date.fromisoformat(sys.argv[1])
        except ValueError:
            print(f"Invalid start date: {sys.argv[1]}")
            print("Usage: python backfill_sentiment_analytics.py [start_date] [end_date]")
            print("Date format: YYYY-MM-DD")
            return
    
    if len(sys.argv) > 2:
        try:
            end = date.fromisoformat(sys.argv[2])
        except ValueError:
            print(f"Invalid end date: {sys.argv[2]}")
            return
    
    await backfill_sentiment_aggregates(start, end)


if __name__ == "__main__":
    asyncio.run(main())
