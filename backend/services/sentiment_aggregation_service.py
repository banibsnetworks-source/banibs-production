"""
Sentiment Aggregation Service - Phase 6.5
Service for aggregating sentiment data daily/weekly/monthly
"""

from datetime import datetime, timezone, timedelta, date
from typing import Optional, List, Dict, Any
import logging

from db.connection import get_db
from db.sentiment_analytics import create_or_update_aggregate

logger = logging.getLogger(__name__)


async def aggregate_sentiment_for_date(target_date: date) -> Dict[str, int]:
    """
    Aggregate sentiment data for a specific date
    
    Args:
        target_date: Date to aggregate
        
    Returns:
        Dict with counts of aggregates created by dimension
    """
    db = await get_db()
    date_str = target_date.strftime("%Y-%m-%d")
    
    # Start and end of day
    start_dt = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    end_dt = datetime.combine(target_date, datetime.max.time()).replace(tzinfo=timezone.utc)
    
    counts = {
        "overall": 0,
        "source": 0,
        "category": 0,
        "region": 0
    }
    
    logger.info(f"Aggregating sentiment for {date_str}")
    
    # Aggregate news
    counts_news = await _aggregate_content_type(
        db, start_dt, end_dt, date_str, "news", "news_items"
    )
    for key in counts:
        counts[key] += counts_news.get(key, 0)
    
    # Aggregate resources
    counts_resources = await _aggregate_content_type(
        db, start_dt, end_dt, date_str, "resource", "banibs_resources"
    )
    for key in counts:
        counts[key] += counts_resources.get(key, 0)
    
    # Aggregate all (combined)
    counts_all = await _aggregate_content_type_combined(
        db, start_dt, end_dt, date_str
    )
    for key in counts:
        counts[key] += counts_all.get(key, 0)
    
    logger.info(f"Aggregation complete for {date_str}: {counts}")
    
    return counts


async def _aggregate_content_type(
    db,
    start_dt: datetime,
    end_dt: datetime,
    date_str: str,
    content_type: str,
    collection_name: str
) -> Dict[str, int]:
    """
    Aggregate sentiment for a specific content type
    
    Returns:
        Dict with counts by dimension
    """
    collection = db[collection_name]
    counts = {}
    
    # Base query: items with sentiment from this date
    base_query = {
        "sentiment_label": {"$exists": True, "$ne": None},
        "sentiment_score": {"$exists": True, "$ne": None}
    }
    
    # Add date filter based on collection
    if collection_name == "news_items":
        base_query["published_at"] = {"$gte": start_dt, "$lte": end_dt}
    else:  # resources
        base_query["created_at"] = {"$gte": start_dt, "$lte": end_dt}
    
    # 1. Aggregate Overall
    counts["overall"] = await _create_overall_aggregate(
        collection, base_query, date_str, content_type
    )
    
    # 2. Aggregate by Source (news only)
    if collection_name == "news_items":
        counts["source"] = await _create_source_aggregates(
            collection, base_query, date_str, content_type
        )
    
    # 3. Aggregate by Category
    counts["category"] = await _create_category_aggregates(
        collection, base_query, date_str, content_type
    )
    
    # 4. Aggregate by Region (news only)
    if collection_name == "news_items":
        counts["region"] = await _create_region_aggregates(
            collection, base_query, date_str, content_type
        )
    
    return counts


async def _aggregate_content_type_combined(
    db,
    start_dt: datetime,
    end_dt: datetime,
    date_str: str
) -> Dict[str, int]:
    """Aggregate both news and resources combined (content_type='all')"""
    counts = {"overall": 0, "source": 0, "category": 0, "region": 0}
    
    # Get items from both collections
    news_collection = db["news_items"]
    resources_collection = db["banibs_resources"]
    
    # Fetch all items with sentiment
    news_items = await news_collection.find({
        "published_at": {"$gte": start_dt, "$lte": end_dt},
        "sentiment_label": {"$exists": True, "$ne": None},
        "sentiment_score": {"$exists": True, "$ne": None}
    }).to_list(length=None)
    
    resources_items = await resources_collection.find({
        "created_at": {"$gte": start_dt, "$lte": end_dt},
        "sentiment_label": {"$exists": True, "$ne": None},
        "sentiment_score": {"$exists": True, "$ne": None}
    }).to_list(length=None)
    
    all_items = news_items + resources_items
    
    if not all_items:
        return counts
    
    # Calculate overall metrics
    metrics = _calculate_metrics(all_items)
    await create_or_update_aggregate(
        date_str, "overall", None, "all", metrics
    )
    counts["overall"] = 1
    
    # Aggregate by category (combined)
    category_groups = {}
    for item in all_items:
        category = item.get("category", "Uncategorized")
        if category not in category_groups:
            category_groups[category] = []
        category_groups[category].append(item)
    
    for category, items in category_groups.items():
        metrics = _calculate_metrics(items)
        await create_or_update_aggregate(
            date_str, "category", category, "all", metrics
        )
        counts["category"] += 1
    
    return counts


async def _create_overall_aggregate(
    collection, base_query, date_str, content_type
) -> int:
    """Create overall aggregate for date and content type"""
    items = await collection.find(base_query).to_list(length=None)
    
    if not items:
        return 0
    
    metrics = _calculate_metrics(items)
    await create_or_update_aggregate(
        date_str, "overall", None, content_type, metrics
    )
    
    return 1


async def _create_source_aggregates(
    collection, base_query, date_str, content_type
) -> int:
    """Create source aggregates"""
    # Group by source
    pipeline = [
        {"$match": base_query},
        {
            "$group": {
                "_id": "$source",
                "items": {"$push": "$$ROOT"}
            }
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    count = 0
    
    async for group in cursor:
        source = group["_id"]
        if not source:
            continue
        
        items = group["items"]
        metrics = _calculate_metrics(items)
        
        await create_or_update_aggregate(
            date_str, "source", source, content_type, metrics
        )
        count += 1
    
    return count


async def _create_category_aggregates(
    collection, base_query, date_str, content_type
) -> int:
    """Create category aggregates"""
    # Group by category
    pipeline = [
        {"$match": base_query},
        {
            "$group": {
                "_id": "$category",
                "items": {"$push": "$$ROOT"}
            }
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    count = 0
    
    async for group in cursor:
        category = group["_id"] or "Uncategorized"
        items = group["items"]
        metrics = _calculate_metrics(items)
        
        await create_or_update_aggregate(
            date_str, "category", category, content_type, metrics
        )
        count += 1
    
    return count


async def _create_region_aggregates(
    collection, base_query, date_str, content_type
) -> int:
    """Create region aggregates (news only)"""
    # Group by region
    pipeline = [
        {"$match": base_query},
        {
            "$group": {
                "_id": "$region",
                "items": {"$push": "$$ROOT"}
            }
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    count = 0
    
    async for group in cursor:
        region = group["_id"]
        if not region:
            continue
        
        items = group["items"]
        metrics = _calculate_metrics(items)
        
        await create_or_update_aggregate(
            date_str, "region", region, content_type, metrics
        )
        count += 1
    
    return count


def _calculate_metrics(items: List[Dict]) -> Dict[str, Any]:
    """
    Calculate sentiment metrics from a list of items
    
    Returns:
        Dict with total_items, counts, avg/min/max sentiment
    """
    total = len(items)
    positive = sum(1 for item in items if item.get("sentiment_label", "").lower() == "positive")
    neutral = sum(1 for item in items if item.get("sentiment_label", "").lower() == "neutral")
    negative = sum(1 for item in items if item.get("sentiment_label", "").lower() in ["negative", "critical"])
    
    scores = [item["sentiment_score"] for item in items if item.get("sentiment_score") is not None]
    
    if scores:
        avg_score = sum(scores) / len(scores)
        min_score = min(scores)
        max_score = max(scores)
    else:
        avg_score = 0.0
        min_score = 0.0
        max_score = 0.0
    
    return {
        "total_items": total,
        "positive_count": positive,
        "neutral_count": neutral,
        "negative_count": negative,
        "avg_sentiment": round(avg_score, 3),
        "min_sentiment": round(min_score, 3),
        "max_sentiment": round(max_score, 3)
    }


async def trigger_re_aggregation(content_id: str, content_type: str):
    """
    Trigger re-aggregation when sentiment is recalculated
    
    Args:
        content_id: ID of content that was recalculated
        content_type: "news" or "resource"
    """
    db = await get_db()
    
    # Find the item to get its date
    if content_type == "news":
        collection = db["news_items"]
        item = await collection.find_one({"id": content_id})
        if item:
            item_date = item.get("published_at")
    else:  # resource
        collection = db["banibs_resources"]
        item = await collection.find_one({"id": content_id})
        if item:
            item_date = item.get("created_at")
    
    if not item or not item_date:
        return
    
    # Get date (handle both datetime and date objects)
    if isinstance(item_date, datetime):
        target_date = item_date.date()
    elif isinstance(item_date, date):
        target_date = item_date
    else:
        return
    
    # Re-aggregate for that date
    logger.info(f"Re-aggregating sentiment for {target_date} due to {content_type}/{content_id} recalculation")
    await aggregate_sentiment_for_date(target_date)
