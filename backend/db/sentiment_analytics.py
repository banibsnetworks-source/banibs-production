"""
Sentiment Analytics Database Operations - Phase 6.5
Database helpers for sentiment aggregation and analytics queries
"""

from datetime import datetime, timezone, timedelta, date
from typing import Optional, List, Dict, Any, Literal
import uuid

from db.connection import get_db


async def create_or_update_aggregate(
    date_str: str,
    dimension: str,
    dimension_value: Optional[str],
    content_type: str,
    metrics: Dict[str, Any]
) -> str:
    """
    Create or update a sentiment aggregate
    
    Args:
        date_str: Date for aggregate (YYYY-MM-DD)
        dimension: "overall", "source", "category", "region"
        dimension_value: Value for dimension (None for overall)
        content_type: "news", "resource", "all"
        metrics: Dict with counts and sentiment values
        
    Returns:
        ID of created/updated aggregate
    """
    db = await get_db()
    collection = db["sentiment_analytics_daily"]
    
    # Find existing aggregate
    query = {
        "date": date_str,
        "dimension": dimension,
        "content_type": content_type
    }
    if dimension_value:
        query["dimension_value"] = dimension_value
    else:
        query["dimension_value"] = None
    
    existing = await collection.find_one(query)
    
    now = datetime.now(timezone.utc)
    
    if existing:
        # Update existing
        await collection.update_one(
            {"id": existing["id"]},
            {"$set": {
                **metrics,
                "updated_at": now
            }}
        )
        return existing["id"]
    else:
        # Create new
        aggregate_id = str(uuid.uuid4())
        doc = {
            "id": aggregate_id,
            "date": date_str,
            "dimension": dimension,
            "dimension_value": dimension_value,
            "content_type": content_type,
            **metrics,
            "created_at": now,
            "updated_at": now
        }
        await collection.insert_one(doc)
        return aggregate_id


async def get_aggregates(
    start_date: str,
    end_date: str,
    dimension: str = "overall",
    dimension_value: Optional[str] = None,
    content_type: str = "all",
    granularity: str = "daily"
) -> List[Dict[str, Any]]:
    """
    Get sentiment aggregates for a date range
    
    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        dimension: Filter by dimension
        dimension_value: Filter by dimension value
        content_type: Filter by content type
        granularity: "daily", "weekly", "monthly"
        
    Returns:
        List of aggregates
    """
    db = await get_db()
    
    # Select collection based on granularity
    if granularity == "weekly":
        collection = db["sentiment_analytics_weekly"]
    elif granularity == "monthly":
        collection = db["sentiment_analytics_monthly"]
    else:
        collection = db["sentiment_analytics_daily"]
    
    # Build query
    query = {
        "date": {"$gte": start_date, "$lte": end_date},
        "dimension": dimension,
        "content_type": content_type
    }
    
    if dimension_value:
        query["dimension_value"] = dimension_value
    else:
        query["dimension_value"] = None
    
    # Execute query
    cursor = collection.find(query).sort("date", 1)
    items = []
    
    async for item in cursor:
        item.pop("_id", None)
        items.append(item)
    
    return items


async def get_aggregates_by_dimension_values(
    start_date: str,
    end_date: str,
    dimension: str,
    content_type: str = "all",
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Get aggregated sentiment grouped by dimension values (e.g., all sources)
    
    Args:
        start_date: Start date
        end_date: End date
        dimension: "source", "category", "region"
        content_type: Filter by content type
        limit: Limit number of results
        
    Returns:
        List of aggregated metrics by dimension value
    """
    db = await get_db()
    collection = db["sentiment_analytics_daily"]
    
    pipeline = [
        {
            "$match": {
                "date": {"$gte": start_date, "$lte": end_date},
                "dimension": dimension,
                "content_type": content_type,
                "dimension_value": {"$ne": None}  # Exclude overall
            }
        },
        {
            "$group": {
                "_id": "$dimension_value",
                "total_items": {"$sum": "$total_items"},
                "positive_count": {"$sum": "$positive_count"},
                "neutral_count": {"$sum": "$neutral_count"},
                "negative_count": {"$sum": "$negative_count"},
                "avg_sentiment": {"$avg": "$avg_sentiment"}
            }
        },
        {
            "$project": {
                "_id": 0,
                "dimension_value": "$_id",
                "total_items": 1,
                "positive_count": 1,
                "neutral_count": 1,
                "negative_count": 1,
                "avg_sentiment": 1
            }
        },
        {
            "$sort": {"total_items": -1}
        }
    ]
    
    if limit:
        pipeline.append({"$limit": limit})
    
    cursor = collection.aggregate(pipeline)
    items = []
    
    async for item in cursor:
        items.append(item)
    
    return items


async def get_summary_stats(
    start_date: str,
    end_date: str,
    content_type: str = "all"
) -> Dict[str, Any]:
    """
    Get summary statistics for a period
    
    Args:
        start_date: Start date
        end_date: End date
        content_type: Filter by content type
        
    Returns:
        Dict with summary stats
    """
    db = await get_db()
    collection = db["sentiment_analytics_daily"]
    
    # Get overall aggregates for period
    pipeline = [
        {
            "$match": {
                "date": {"$gte": start_date, "$lte": end_date},
                "dimension": "overall",
                "content_type": content_type
            }
        },
        {
            "$group": {
                "_id": None,
                "total_items": {"$sum": "$total_items"},
                "positive_count": {"$sum": "$positive_count"},
                "neutral_count": {"$sum": "$neutral_count"},
                "negative_count": {"$sum": "$negative_count"},
                "avg_sentiment": {"$avg": "$avg_sentiment"}
            }
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    if not result:
        return {
            "total_items": 0,
            "positive_count": 0,
            "neutral_count": 0,
            "negative_count": 0,
            "avg_sentiment": 0.0
        }
    
    return result[0]


async def get_most_negative_source(
    start_date: str,
    end_date: str,
    content_type: str = "all"
) -> Optional[str]:
    """Get source with lowest avg sentiment"""
    db = await get_db()
    collection = db["sentiment_analytics_daily"]
    
    pipeline = [
        {
            "$match": {
                "date": {"$gte": start_date, "$lte": end_date},
                "dimension": "source",
                "content_type": content_type,
                "dimension_value": {"$ne": None}
            }
        },
        {
            "$group": {
                "_id": "$dimension_value",
                "avg_sentiment": {"$avg": "$avg_sentiment"}
            }
        },
        {
            "$sort": {"avg_sentiment": 1}
        },
        {
            "$limit": 1
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    if result:
        return result[0]["_id"]
    return None


async def get_most_positive_source(
    start_date: str,
    end_date: str,
    content_type: str = "all"
) -> Optional[str]:
    """Get source with highest avg sentiment"""
    db = await get_db()
    collection = db["sentiment_analytics_daily"]
    
    pipeline = [
        {
            "$match": {
                "date": {"$gte": start_date, "$lte": end_date},
                "dimension": "source",
                "content_type": content_type,
                "dimension_value": {"$ne": None}
            }
        },
        {
            "$group": {
                "_id": "$dimension_value",
                "avg_sentiment": {"$avg": "$avg_sentiment"}
            }
        },
        {
            "$sort": {"avg_sentiment": -1}
        },
        {
            "$limit": 1
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    if result:
        return result[0]["_id"]
    return None


async def delete_old_aggregates(days_to_keep: int = 90):
    """
    Delete daily aggregates older than specified days
    
    Args:
        days_to_keep: Number of days to keep (default: 90)
        
    Returns:
        Number of deleted documents
    """
    db = await get_db()
    collection = db["sentiment_analytics_daily"]
    
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days_to_keep)).strftime("%Y-%m-%d")
    
    result = await collection.delete_many({
        "date": {"$lt": cutoff_date}
    })
    
    return result.deleted_count


async def delete_old_weekly_aggregates(days_to_keep: int = 365):
    """Delete weekly aggregates older than 1 year"""
    db = await get_db()
    collection = db["sentiment_analytics_weekly"]
    
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days_to_keep)).strftime("%Y-%m-%d")
    
    result = await collection.delete_many({
        "date": {"$lt": cutoff_date}
    })
    
    return result.deleted_count
