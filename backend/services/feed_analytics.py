"""
Feed Analytics Service - Phase C Circle Trust Order
Tracks and analyzes shadow mode feed ranking data

Collects metrics for minimum 2-week evaluation period before activation
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import logging

from db.connection import get_db
from services.feed_ranker import FeedRankerService

logger = logging.getLogger(__name__)


async def log_shadow_feed_comparison(
    viewer_id: str,
    chronological_posts: List[Dict[str, Any]],
    trust_ranked_posts: List[Dict[str, Any]],
    rank_deltas: Dict[str, int],
    diversity_analysis: Dict[str, Any],
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Log a shadow mode feed comparison for analytics.
    
    Args:
        viewer_id: ID of user viewing feed
        chronological_posts: Posts in chronological order
        trust_ranked_posts: Posts in trust-ranked order
        rank_deltas: Position changes per post
        diversity_analysis: Diversity metrics
        db: Database connection (optional)
    
    Returns:
        The logged comparison document
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    # Extract post IDs and scores
    chrono_order = [p.get("id", "") for p in chronological_posts]
    trust_order = [p.get("id", "") for p in trust_ranked_posts]
    
    # Calculate summary stats
    total_posts = len(chronological_posts)
    posts_reordered = sum(1 for delta in rank_deltas.values() if delta != 0)
    avg_delta = sum(abs(d) for d in rank_deltas.values()) / total_posts if total_posts > 0 else 0
    
    comparison_log = {
        "id": str(uuid.uuid4()),
        "viewer_id": viewer_id,
        "timestamp": now,
        "total_posts": total_posts,
        "chronological_order": chrono_order,
        "trust_ranked_order": trust_order,
        "rank_deltas": rank_deltas,
        "posts_reordered": posts_reordered,
        "avg_rank_delta": avg_delta,
        "diversity_analysis": diversity_analysis,
        "suppression_warnings": FeedRankerService.detect_suppression_effects(diversity_analysis)
    }
    
    await db.feed_shadow_logs.insert_one(comparison_log)
    
    logger.info(
        f"Shadow feed comparison logged for {viewer_id}: "
        f"{total_posts} posts, {posts_reordered} reordered, avg delta: {avg_delta:.2f}"
    )
    
    return comparison_log


async def get_shadow_mode_stats(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Get aggregate statistics from shadow mode logs.
    
    Args:
        start_date: Start date for analysis (defaults to 7 days ago)
        end_date: End date for analysis (defaults to now)
        db: Database connection (optional)
    
    Returns:
        Aggregate statistics
    """
    if db is None:
        db = await get_db()
    
    if end_date is None:
        end_date = datetime.now(timezone.utc)
    
    if start_date is None:
        start_date = end_date - timedelta(days=7)
    
    # Query shadow logs
    logs = await db.feed_shadow_logs.find(
        {
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            }
        },
        {"_id": 0}
    ).to_list(10000)
    
    if not logs:
        return {
            "total_comparisons": 0,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }
    
    # Aggregate metrics
    total_comparisons = len(logs)
    total_posts_analyzed = sum(log.get("total_posts", 0) for log in logs)
    total_reordered = sum(log.get("posts_reordered", 0) for log in logs)
    
    avg_delta = sum(log.get("avg_rank_delta", 0) for log in logs) / total_comparisons
    
    # Diversity metrics
    diversity_scores = [
        log.get("diversity_analysis", {}).get("diversity_entropy", 0)
        for log in logs
    ]
    avg_diversity = sum(diversity_scores) / len(diversity_scores) if diversity_scores else 0
    
    # Suppression warnings
    all_warnings = []
    for log in logs:
        warnings = log.get("suppression_warnings", [])
        all_warnings.extend(warnings)
    
    warning_counts = {}
    for warning in all_warnings:
        warning_counts[warning] = warning_counts.get(warning, 0) + 1
    
    return {
        "total_comparisons": total_comparisons,
        "total_posts_analyzed": total_posts_analyzed,
        "total_reordered": total_reordered,
        "avg_rank_delta": avg_delta,
        "avg_diversity_entropy": avg_diversity,
        "suppression_warnings": warning_counts,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }


async def generate_weekly_report(
    week_start: Optional[datetime] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Generate a weekly shadow mode comparison report.
    
    Founder-required metrics:
    - Engagement rate
    - Trust-tier interaction distribution
    - Content diversity
    - Visibility fairness
    - Feed saturation
    - Suppression effects
    
    Args:
        week_start: Start of week (defaults to last Monday)
        db: Database connection (optional)
    
    Returns:
        Weekly report with all required metrics
    """
    if db is None:
        db = await get_db()
    
    if week_start is None:
        # Default to last Monday
        now = datetime.now(timezone.utc)
        week_start = now - timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    week_end = week_start + timedelta(days=7)
    
    # Get shadow mode stats
    stats = await get_shadow_mode_stats(week_start, week_end, db)
    
    # Get engagement metrics (if available)
    # This would be populated by tracking user interactions
    engagement_pipeline = [
        {
            "$match": {
                "timestamp": {
                    "$gte": week_start,
                    "$lt": week_end
                }
            }
        },
        {
            "$group": {
                "_id": "$action_type",
                "count": {"$sum": 1}
            }
        }
    ]
    
    engagement_results = await db.feed_interactions.aggregate(engagement_pipeline).to_list(100)
    engagement_by_type = {result["_id"]: result["count"] for result in engagement_results}
    
    report = {
        "report_id": str(uuid.uuid4()),
        "generated_at": datetime.now(timezone.utc),
        "week_start": week_start,
        "week_end": week_end,
        "shadow_mode_status": "ACTIVE",
        "data_collection_days": (week_end - week_start).days,
        
        # Core metrics
        "shadow_comparisons": stats.get("total_comparisons", 0),
        "posts_analyzed": stats.get("total_posts_analyzed", 0),
        "posts_reordered": stats.get("total_reordered", 0),
        "avg_rank_delta": stats.get("avg_rank_delta", 0),
        
        # Engagement metrics
        "engagement": {
            "by_type": engagement_by_type,
            "total_interactions": sum(engagement_by_type.values())
        },
        
        # Diversity & fairness
        "diversity": {
            "avg_entropy": stats.get("avg_diversity_entropy", 0),
            "suppression_warnings": stats.get("suppression_warnings", {})
        },
        
        # Recommendations
        "recommendations": _generate_recommendations(stats),
        
        "note": "Shadow mode only - no user-facing changes made"
    }
    
    # Store report
    await db.feed_shadow_reports.insert_one(report)
    
    logger.info(
        f"Generated weekly shadow report: {report['shadow_comparisons']} comparisons, "
        f"{report['posts_analyzed']} posts analyzed"
    )
    
    return report


def _generate_recommendations(stats: Dict[str, Any]) -> List[str]:
    """
    Generate recommendations based on shadow mode data.
    
    Args:
        stats: Shadow mode statistics
    
    Returns:
        List of recommendations
    """
    recommendations = []
    
    avg_delta = stats.get("avg_rank_delta", 0)
    suppression_warnings = stats.get("suppression_warnings", {})
    
    # Recommendation: High reordering
    if avg_delta > 5:
        recommendations.append(
            "⚠️ High avg rank delta (>5) - trust weights may be too aggressive. "
            "Consider reducing weight multipliers."
        )
    
    # Recommendation: Low reordering
    if avg_delta < 1:
        recommendations.append(
            "ℹ️ Low avg rank delta (<1) - trust weights may have minimal effect. "
            "Consider increasing weight multipliers if trust-based ranking is desired."
        )
    
    # Recommendation: Suppression issues
    if suppression_warnings:
        recommendations.append(
            "⚠️ Content suppression detected - review diversity metrics to ensure "
            "lower-tier content remains visible."
        )
    
    # Recommendation: Continue data collection
    total_comparisons = stats.get("total_comparisons", 0)
    if total_comparisons < 1000:
        recommendations.append(
            "📊 Continue data collection - minimum 1000 comparisons recommended "
            "before activation consideration."
        )
    
    if not recommendations:
        recommendations.append(
            "✅ Shadow mode data looks balanced. Continue monitoring for 2+ weeks "
            "before activation discussion."
        )
    
    return recommendations


async def cleanup_old_shadow_logs(
    retention_days: int = 30,
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Clean up old shadow mode logs (maintenance task).
    
    Args:
        retention_days: Number of days to retain logs
        db: Database connection (optional)
    
    Returns:
        Number of logs deleted
    """
    if db is None:
        db = await get_db()
    
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=retention_days)
    
    result = await db.feed_shadow_logs.delete_many({
        "timestamp": {"$lt": cutoff_date}
    })
    
    logger.info(f"Cleaned up {result.deleted_count} old shadow logs (older than {retention_days} days)")
    
    return result.deleted_count
