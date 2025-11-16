"""
Business Analytics API Routes - Phase 7.1.1
BANIBS Business Insights Analytics (BIA) Dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime, timezone, timedelta
from models.analytics import (
    AnalyticsEventCreate, DashboardSummary, KPIMetric,
    TimeSeriesData, TopPost, JobPerformance, DiscoveryBreakdown, RatingAnalytics
)
from db import analytics as db_analytics
from db import business_reviews as db_reviews
from middleware.auth_guard import require_role
import io
import csv

router = APIRouter(prefix="/api/business-analytics", tags=["Business Analytics - BIA"])


def parse_date_range(range_param: str):
    """Parse date range parameter into start/end dates"""
    end_date = datetime.now(timezone.utc)
    
    if range_param == "7d":
        start_date = end_date - timedelta(days=7)
    elif range_param == "30d":
        start_date = end_date - timedelta(days=30)
    elif range_param == "90d":
        start_date = end_date - timedelta(days=90)
    else:
        # Default to 30 days
        start_date = end_date - timedelta(days=30)
    
    return start_date, end_date


@router.post("/track")
async def track_event(
    event: AnalyticsEventCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Track an analytics event
    Used internally to log business profile interactions
    """
    result = await db_analytics.track_analytics_event(
        business_profile_id=event.business_profile_id,
        event_type=event.event_type,
        source=event.source,
        meta=event.meta
    )
    
    return {"success": True, "event_id": result["id"]}


@router.get("/dashboard/{business_profile_id}")
async def get_dashboard(
    business_profile_id: str,
    date_range: str = Query("30d", description="7d | 30d | 90d"),
    current_user=Depends(require_role("user", "member"))
):
    """
    Get complete dashboard summary for a business profile
    
    Includes:
    - KPI metrics with comparisons
    - Time series data
    - Top posts
    - Discovery breakdown
    - Job performance
    - Rating analytics
    - Activity log
    - Recommendations
    """
    # TODO: Add permission check - verify user owns this business profile
    
    start_date, end_date = parse_date_range(date_range)
    
    # Get all metrics
    kpis = await db_analytics.get_kpi_metrics(business_profile_id, start_date, end_date)
    
    profile_views_series = await db_analytics.get_time_series_data(
        business_profile_id, start_date, end_date, "profile_views"
    )
    
    post_impressions_series = await db_analytics.get_time_series_data(
        business_profile_id, start_date, end_date, "post_impressions"
    )
    
    top_posts = await db_analytics.get_top_posts(business_profile_id, start_date, end_date, limit=5)
    
    discovery = await db_analytics.get_discovery_breakdown(business_profile_id, start_date, end_date)
    
    job_performance = await db_analytics.get_job_performance(business_profile_id, start_date, end_date)
    
    # Rating analytics
    rating_stats = await db_reviews.get_rating_stats(business_profile_id)
    
    # Count new reviews in period
    from db.connection import get_db
    db = await get_db()
    new_reviews = await db.business_reviews.count_documents({
        "business_profile_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    rating_analytics = {
        "average_rating": rating_stats["average_rating"],
        "total_reviews": rating_stats["total_reviews"],
        "new_reviews_period": new_reviews,
        "distribution": rating_stats["rating_distribution"]
    }
    
    local_rank = await db_analytics.get_local_rank_text(business_profile_id, start_date, end_date)
    
    recommendations = await db_analytics.generate_recommendations(business_profile_id, start_date, end_date)
    
    activity_log = await db_analytics.generate_activity_log(business_profile_id, start_date, end_date)
    
    return {
        "business_profile_id": business_profile_id,
        "date_range": date_range,
        "kpis": kpis,
        "profile_views_over_time": profile_views_series,
        "post_impressions_over_time": post_impressions_series,
        "top_posts": top_posts,
        "discovery_breakdown": discovery,
        "local_rank_text": local_rank,
        "job_performance": job_performance,
        "rating_analytics": rating_analytics,
        "activity_log": activity_log,
        "recommendations": recommendations
    }


@router.get("/kpis/{business_profile_id}")
async def get_kpis(
    business_profile_id: str,
    date_range: str = Query("30d"),
    current_user=Depends(require_role("user", "member"))
):
    """Get KPI metrics only"""
    start_date, end_date = parse_date_range(date_range)
    kpis = await db_analytics.get_kpi_metrics(business_profile_id, start_date, end_date)
    return kpis


@router.get("/time-series/{business_profile_id}")
async def get_time_series(
    business_profile_id: str,
    metric: str = Query("profile_views", description="profile_views | post_impressions"),
    date_range: str = Query("30d"),
    current_user=Depends(require_role("user", "member"))
):
    """Get time series data for charts"""
    start_date, end_date = parse_date_range(date_range)
    data = await db_analytics.get_time_series_data(
        business_profile_id, start_date, end_date, metric
    )
    return {"metric": metric, "data": data}


@router.get("/top-posts/{business_profile_id}")
async def get_top_posts_endpoint(
    business_profile_id: str,
    date_range: str = Query("30d"),
    limit: int = Query(5, ge=1, le=20),
    current_user=Depends(require_role("user", "member"))
):
    """Get top performing posts"""
    start_date, end_date = parse_date_range(date_range)
    posts = await db_analytics.get_top_posts(business_profile_id, start_date, end_date, limit)
    return {"posts": posts}


@router.get("/discovery/{business_profile_id}")
async def get_discovery(
    business_profile_id: str,
    date_range: str = Query("30d"),
    current_user=Depends(require_role("user", "member"))
):
    """Get discovery source breakdown"""
    start_date, end_date = parse_date_range(date_range)
    discovery = await db_analytics.get_discovery_breakdown(business_profile_id, start_date, end_date)
    return discovery


@router.get("/jobs/{business_profile_id}")
async def get_job_analytics(
    business_profile_id: str,
    date_range: str = Query("30d"),
    current_user=Depends(require_role("user", "member"))
):
    """Get job performance analytics"""
    start_date, end_date = parse_date_range(date_range)
    jobs = await db_analytics.get_job_performance(business_profile_id, start_date, end_date)
    return {"jobs": jobs}


@router.get("/export/top-posts/{business_profile_id}")
async def export_top_posts_csv(
    business_profile_id: str,
    date_range: str = Query("30d"),
    current_user=Depends(require_role("user", "member"))
):
    """Export top posts as CSV"""
    start_date, end_date = parse_date_range(date_range)
    posts = await db_analytics.get_top_posts(business_profile_id, start_date, end_date, limit=20)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Post ID", "Title", "Impressions", "Engagements", "Engagement Rate (%)", "Created At"])
    
    # Data
    for post in posts:
        writer.writerow([
            post["post_id"],
            post["title"],
            post["impressions"],
            post["engagements"],
            post["engagement_rate"],
            post["created_at"].isoformat() if isinstance(post["created_at"], datetime) else post["created_at"]
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=top_posts_{date_range}.csv"}
    )


@router.get("/export/jobs/{business_profile_id}")
async def export_jobs_csv(
    business_profile_id: str,
    date_range: str = Query("30d"),
    current_user=Depends(require_role("user", "member"))
):
    """Export job performance as CSV"""
    start_date, end_date = parse_date_range(date_range)
    jobs = await db_analytics.get_job_performance(business_profile_id, start_date, end_date)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Job ID", "Title", "Status", "Views", "Applications", "Apply Rate (%)", "Posted At"])
    
    # Data
    for job in jobs:
        writer.writerow([
            job["job_id"],
            job["title"],
            job["status"],
            job["views"],
            job["applications"],
            job["apply_rate"],
            job["posted_at"].isoformat() if isinstance(job["posted_at"], datetime) else job["posted_at"]
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=job_performance_{date_range}.csv"}
    )
