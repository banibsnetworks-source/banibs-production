"""
Sentiment Analytics Admin Routes - Phase 6.5
Admin endpoints for sentiment analytics and reporting
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import StreamingResponse
from typing import Optional, Literal
from datetime import datetime, timedelta, date
import io
import json
import csv

from models.sentiment_analytics import (
    SentimentTrendsResponse,
    SentimentTrendData,
    SentimentByDimensionResponse,
    SentimentByDimensionItem,
    SentimentSummaryStats
)
from db.sentiment_analytics import (
    get_aggregates,
    get_aggregates_by_dimension_values,
    get_summary_stats,
    get_most_negative_source,
    get_most_positive_source
)
from middleware.auth_guard import require_role
from utils.features import is_feature_enabled

router = APIRouter(prefix="/api/admin/analytics/sentiment", tags=["admin", "analytics"])


def _parse_period_to_dates(period: str) -> tuple[str, str]:
    """Convert period string to start/end dates"""
    today = date.today()
    
    if period == "7d":
        start = today - timedelta(days=7)
    elif period == "30d":
        start = today - timedelta(days=30)
    elif period == "90d":
        start = today - timedelta(days=90)
    elif period == "1y":
        start = today - timedelta(days=365)
    else:
        start = today - timedelta(days=30)  # default
    
    return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")


def _calculate_trend(items: list) -> str:
    """Calculate sentiment trend from time series data"""
    if len(items) < 2:
        return "stable"
    
    # Compare first half vs second half avg sentiment
    mid = len(items) // 2
    first_half_avg = sum(item.get("avg_sentiment", 0) for item in items[:mid]) / max(mid, 1)
    second_half_avg = sum(item.get("avg_sentiment", 0) for item in items[mid:]) / max(len(items) - mid, 1)
    
    diff = second_half_avg - first_half_avg
    
    if diff > 0.05:
        return "improving"
    elif diff < -0.05:
        return "declining"
    else:
        return "stable"


@router.get("/trends", response_model=SentimentTrendsResponse)
async def get_sentiment_trends(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    granularity: Literal["daily", "weekly", "monthly"] = "daily",
    content_type: Literal["news", "resource", "all"] = "all",
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Get sentiment trends over time
    
    Returns time series data for charting sentiment changes.
    """
    # Check feature flag
    if not is_feature_enabled("analytics.sentiment_enabled"):
        raise HTTPException(status_code=503, detail="Sentiment analytics is disabled")
    
    # Default to last 30 days if not specified
    if not start_date or not end_date:
        end = date.today()
        start = end - timedelta(days=30)
        start_date = start.strftime("%Y-%m-%d")
        end_date = end.strftime("%Y-%m-%d")
    
    # Fetch aggregates
    aggregates = await get_aggregates(
        start_date=start_date,
        end_date=end_date,
        dimension="overall",
        content_type=content_type,
        granularity=granularity
    )
    
    # Format response
    data = [
        SentimentTrendData(
            date=agg["date"],
            total_items=agg["total_items"],
            positive_count=agg["positive_count"],
            neutral_count=agg["neutral_count"],
            negative_count=agg["negative_count"],
            avg_sentiment=agg["avg_sentiment"]
        )
        for agg in aggregates
    ]
    
    return SentimentTrendsResponse(
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
        content_type=content_type,
        data=data
    )


@router.get("/by-source", response_model=SentimentByDimensionResponse)
async def get_sentiment_by_source(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 10,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Get sentiment breakdown by source (RSS feeds)
    
    Returns top sources with sentiment metrics.
    """
    if not is_feature_enabled("analytics.sentiment_enabled"):
        raise HTTPException(status_code=503, detail="Sentiment analytics is disabled")
    
    if not start_date or not end_date:
        end = date.today()
        start = end - timedelta(days=30)
        start_date = start.strftime("%Y-%m-%d")
        end_date = end.strftime("%Y-%m-%d")
    
    aggregates = await get_aggregates_by_dimension_values(
        start_date=start_date,
        end_date=end_date,
        dimension="source",
        content_type="news",  # Only news has sources
        limit=limit
    )
    
    items = []
    for agg in aggregates:
        total = agg["total_items"]
        items.append(SentimentByDimensionItem(
            dimension_value=agg["dimension_value"],
            total_items=total,
            positive_count=agg["positive_count"],
            neutral_count=agg["neutral_count"],
            negative_count=agg["negative_count"],
            positive_pct=round((agg["positive_count"] / total * 100) if total > 0 else 0, 1),
            neutral_pct=round((agg["neutral_count"] / total * 100) if total > 0 else 0, 1),
            negative_pct=round((agg["negative_count"] / total * 100) if total > 0 else 0, 1),
            avg_sentiment=round(agg["avg_sentiment"], 3)
        ))
    
    return SentimentByDimensionResponse(
        start_date=start_date,
        end_date=end_date,
        dimension="source",
        items=items
    )


@router.get("/by-category", response_model=SentimentByDimensionResponse)
async def get_sentiment_by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """Get sentiment breakdown by category"""
    if not is_feature_enabled("analytics.sentiment_enabled"):
        raise HTTPException(status_code=503, detail="Sentiment analytics is disabled")
    
    if not start_date or not end_date:
        end = date.today()
        start = end - timedelta(days=30)
        start_date = start.strftime("%Y-%m-%d")
        end_date = end.strftime("%Y-%m-%d")
    
    aggregates = await get_aggregates_by_dimension_values(
        start_date=start_date,
        end_date=end_date,
        dimension="category",
        content_type="all"
    )
    
    items = []
    for agg in aggregates:
        total = agg["total_items"]
        items.append(SentimentByDimensionItem(
            dimension_value=agg["dimension_value"],
            total_items=total,
            positive_count=agg["positive_count"],
            neutral_count=agg["neutral_count"],
            negative_count=agg["negative_count"],
            positive_pct=round((agg["positive_count"] / total * 100) if total > 0 else 0, 1),
            neutral_pct=round((agg["neutral_count"] / total * 100) if total > 0 else 0, 1),
            negative_pct=round((agg["negative_count"] / total * 100) if total > 0 else 0, 1),
            avg_sentiment=round(agg["avg_sentiment"], 3)
        ))
    
    return SentimentByDimensionResponse(
        start_date=start_date,
        end_date=end_date,
        dimension="category",
        items=items
    )


@router.get("/by-region", response_model=SentimentByDimensionResponse)
async def get_sentiment_by_region(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """Get sentiment breakdown by region"""
    if not is_feature_enabled("analytics.sentiment_enabled"):
        raise HTTPException(status_code=503, detail="Sentiment analytics is disabled")
    
    if not start_date or not end_date:
        end = date.today()
        start = end - timedelta(days=30)
        start_date = start.strftime("%Y-%m-%d")
        end_date = end.strftime("%Y-%m-%d")
    
    aggregates = await get_aggregates_by_dimension_values(
        start_date=start_date,
        end_date=end_date,
        dimension="region",
        content_type="news"  # Only news has regions
    )
    
    items = []
    for agg in aggregates:
        total = agg["total_items"]
        items.append(SentimentByDimensionItem(
            dimension_value=agg["dimension_value"],
            total_items=total,
            positive_count=agg["positive_count"],
            neutral_count=agg["neutral_count"],
            negative_count=agg["negative_count"],
            positive_pct=round((agg["positive_count"] / total * 100) if total > 0 else 0, 1),
            neutral_pct=round((agg["neutral_count"] / total * 100) if total > 0 else 0, 1),
            negative_pct=round((agg["negative_count"] / total * 100) if total > 0 else 0, 1),
            avg_sentiment=round(agg["avg_sentiment"], 3)
        ))
    
    return SentimentByDimensionResponse(
        start_date=start_date,
        end_date=end_date,
        dimension="region",
        items=items
    )


@router.get("/summary", response_model=SentimentSummaryStats)
async def get_sentiment_summary(
    period: Literal["7d", "30d", "90d", "1y"] = "30d",
    content_type: Literal["news", "resource", "all"] = "all",
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Get summary statistics for a period
    
    Returns overall metrics and trending information.
    """
    if not is_feature_enabled("analytics.sentiment_enabled"):
        raise HTTPException(status_code=503, detail="Sentiment analytics is disabled")
    
    start_date, end_date = _parse_period_to_dates(period)
    
    # Get summary stats
    stats = await get_summary_stats(start_date, end_date, content_type)
    
    total = stats.get("total_items", 0)
    positive = stats.get("positive_count", 0)
    neutral = stats.get("neutral_count", 0)
    negative = stats.get("negative_count", 0)
    
    # Get most positive/negative sources
    most_negative = await get_most_negative_source(start_date, end_date, content_type)
    most_positive = await get_most_positive_source(start_date, end_date, content_type)
    
    # Get trend data
    aggregates = await get_aggregates(
        start_date=start_date,
        end_date=end_date,
        dimension="overall",
        content_type=content_type,
        granularity="daily"
    )
    trend = _calculate_trend(aggregates)
    
    return SentimentSummaryStats(
        period=period,
        start_date=start_date,
        end_date=end_date,
        total_items=total,
        positive_count=positive,
        neutral_count=neutral,
        negative_count=negative,
        positive_percentage=round((positive / total * 100) if total > 0 else 0, 1),
        neutral_percentage=round((neutral / total * 100) if total > 0 else 0, 1),
        negative_percentage=round((negative / total * 100) if total > 0 else 0, 1),
        avg_sentiment=round(stats.get("avg_sentiment", 0), 3),
        most_negative_source=most_negative,
        most_positive_source=most_positive,
        trend=trend
    )


@router.get("/export")
async def export_sentiment_data(
    start_date: str,
    end_date: str,
    dimension: Literal["overall", "source", "category", "region"] = "overall",
    granularity: Literal["daily", "weekly", "monthly"] = "daily",
    format: Literal["csv", "json"] = "csv",
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Export sentiment data as CSV or JSON
    
    Required: start_date, end_date
    """
    if not is_feature_enabled("analytics.export_enabled"):
        raise HTTPException(status_code=503, detail="Export is disabled")
    
    # Fetch data
    if dimension == "overall":
        aggregates = await get_aggregates(
            start_date=start_date,
            end_date=end_date,
            dimension="overall",
            content_type="all",
            granularity=granularity
        )
    else:
        # Get by dimension values
        aggregates = await get_aggregates_by_dimension_values(
            start_date=start_date,
            end_date=end_date,
            dimension=dimension,
            content_type="all"
        )
    
    # Export as JSON
    if format == "json":
        return Response(
            content=json.dumps(aggregates, indent=2, default=str),
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="sentiment_{dimension}_{start_date}_to_{end_date}.json"'
            }
        )
    
    # Export as CSV
    output = io.StringIO()
    if aggregates:
        # Dynamic columns based on data
        fieldnames = ["date", "dimension_value", "total_items", "positive_count", 
                     "neutral_count", "negative_count", "positive_pct", "neutral_pct", 
                     "negative_pct", "avg_sentiment"]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for agg in aggregates:
            total = agg.get("total_items", 0)
            row = {
                "date": agg.get("date", ""),
                "dimension_value": agg.get("dimension_value", ""),
                "total_items": total,
                "positive_count": agg.get("positive_count", 0),
                "neutral_count": agg.get("neutral_count", 0),
                "negative_count": agg.get("negative_count", 0),
                "positive_pct": round((agg.get("positive_count", 0) / total * 100) if total > 0 else 0, 1),
                "neutral_pct": round((agg.get("neutral_count", 0) / total * 100) if total > 0 else 0, 1),
                "negative_pct": round((agg.get("negative_count", 0) / total * 100) if total > 0 else 0, 1),
                "avg_sentiment": round(agg.get("avg_sentiment", 0), 3)
            }
            writer.writerow(row)
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="sentiment_{dimension}_{start_date}_to_{end_date}.csv"'
        }
    )
