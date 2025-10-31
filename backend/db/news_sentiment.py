"""
Phase 6.3 - News Sentiment Database Operations

All operations use UUID-based IDs (no ObjectId).
Retention policy: 90 days (older records should be pruned).
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from db.connection import get_db
from models.news_sentiment import NewsSentimentDB, NewsSentimentPublic


async def create_sentiment_record(
    story_id: str,
    region: str,
    sentiment_score: float,
    sentiment_label: str,
    headline: str,
    summary: Optional[str] = None
) -> str:
    """
    Create a new sentiment record.
    Returns the new record ID.
    """
    db = get_db()
    now = datetime.now(timezone.utc)
    
    record = {
        "id": str(uuid.uuid4()),
        "storyId": story_id,
        "region": region,
        "sentimentScore": sentiment_score,
        "sentimentLabel": sentiment_label,
        "headline": headline,
        "summary": summary,
        "analyzedAt": now.isoformat(),
        "createdAt": now.isoformat()
    }
    
    await db.news_sentiment.insert_one(record)
    return record["id"]


async def get_sentiment_by_story_and_region(story_id: str, region: str) -> Optional[dict]:
    """
    Get existing sentiment record for a story + region combination.
    Returns None if not found.
    """
    db = get_db()
    return await db.news_sentiment.find_one({"storyId": story_id, "region": region})


async def get_recent_sentiment_by_region(region: str, limit: int = 100) -> List[dict]:
    """
    Get recent sentiment records for a region, sorted by analyzedAt DESC.
    """
    db = get_db()
    cursor = db.news_sentiment.find({"region": region})
    cursor.sort("analyzedAt", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def get_regional_sentiment_aggregate(region: str) -> dict:
    """
    Aggregate sentiment statistics for a region.
    Returns: {
        "region": str,
        "avgSentiment": float,
        "totalRecords": int,
        "positive": int,
        "neutral": int,
        "negative": int,
        "lastAnalyzed": str (ISO) or None
    }
    """
    db = get_db()
    records = await db.news_sentiment.find({"region": region}).to_list(length=None)
    
    if not records:
        return {
            "region": region,
            "avgSentiment": 0.0,
            "totalRecords": 0,
            "positive": 0,
            "neutral": 0,
            "negative": 0,
            "lastAnalyzed": None
        }
    
    total = len(records)
    avg_sentiment = sum(r["sentimentScore"] for r in records) / total
    positive_count = sum(1 for r in records if r["sentimentLabel"] == "positive")
    neutral_count = sum(1 for r in records if r["sentimentLabel"] == "neutral")
    negative_count = sum(1 for r in records if r["sentimentLabel"] == "negative")
    
    # Find most recent analyzedAt
    latest = max(records, key=lambda r: r["analyzedAt"])
    
    return {
        "region": region,
        "avgSentiment": round(avg_sentiment, 3),
        "totalRecords": total,
        "positive": positive_count,
        "neutral": neutral_count,
        "negative": negative_count,
        "lastAnalyzed": latest["analyzedAt"]
    }


async def get_all_regional_aggregates() -> List[dict]:
    """
    Get sentiment aggregates for all regions.
    """
    regions = ["Global", "Africa", "Americas", "Europe", "Asia", "Middle East"]
    aggregates = []
    
    for region in regions:
        agg = await get_regional_sentiment_aggregate(region)
        aggregates.append(agg)
    
    return aggregates


async def get_unsentimented_stories(limit: int = 50) -> List[dict]:
    """
    Find news stories that don't have sentiment analysis yet.
    Returns up to `limit` stories per region that need analysis.
    """
    db = get_db()
    
    # Get all news items
    news_items = await db.news_items.find({}).to_list(length=None)
    
    # Get all existing sentiment records
    sentiment_records = await db.news_sentiment.find({}).to_list(length=None)
    
    # Create a set of (storyId, region) tuples that already have sentiment
    analyzed = set((r["storyId"], r["region"]) for r in sentiment_records)
    
    # Find stories that need analysis
    regions = ["Global", "Africa", "Americas", "Europe", "Asia", "Middle East"]
    unsentimented = []
    
    for story in news_items:
        story_region = story.get("region", "Global")
        # Check if this story needs analysis for its region
        if (story["id"], story_region) not in analyzed:
            unsentimented.append({
                "id": story["id"],
                "title": story["title"],
                "summary": story.get("summary", ""),
                "region": story_region
            })
            if len(unsentimented) >= limit:
                break
    
    return unsentimented


async def cleanup_old_sentiment_records(days: int = 90) -> int:
    """
    Delete sentiment records older than `days`.
    Returns count of deleted records.
    """
    db = get_db()
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    cutoff_iso = cutoff_date.isoformat()
    
    result = await db.news_sentiment.delete_many({"createdAt": {"$lt": cutoff_iso}})
    return result.deleted_count
