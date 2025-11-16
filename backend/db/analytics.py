"""
Business Analytics Database Operations - Phase 7.1.1
BANIBS Business Insights Analytics (BIA)
"""

from datetime import datetime, timezone, timedelta, date
from uuid import uuid4
from typing import Optional, List, Dict
from db.connection import get_db


# ============ EVENT TRACKING ============

async def track_analytics_event(
    business_profile_id: str,
    event_type: str,
    source: Optional[str] = None,
    meta: Dict = None
):
    """Track an analytics event"""
    db = await get_db()
    
    event = {
        "id": str(uuid4()),
        "business_profile_id": business_profile_id,
        "event_type": event_type,
        "source": source,
        "meta": meta or {},
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.analytics_events.insert_one(event)
    return event


async def get_events_in_range(
    business_profile_id: str,
    start_date: datetime,
    end_date: datetime,
    event_type: Optional[str] = None
):
    """Get analytics events in date range"""
    db = await get_db()
    
    query = {
        "business_profile_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    }
    
    if event_type:
        query["event_type"] = event_type
    
    events = await db.analytics_events.find(query, {"_id": 0}).to_list(length=100000)
    return events


# ============ AGGREGATION FUNCTIONS ============

async def get_kpi_metrics(business_profile_id: str, start_date: datetime, end_date: datetime):
    """Calculate KPI metrics with period comparison"""
    db = await get_db()
    
    # Calculate period length for comparison
    period_length = (end_date - start_date).days
    prev_start = start_date - timedelta(days=period_length)
    prev_end = start_date
    
    # Current period metrics
    current_profile_views = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "profile_view",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    # Previous period for comparison
    prev_profile_views = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "profile_view",
        "created_at": {"$gte": prev_start, "$lt": prev_end}
    })
    
    # Post impressions (count post_view events)
    current_post_impressions = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "post_view",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    prev_post_impressions = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "post_view",
        "created_at": {"$gte": prev_start, "$lt": prev_end}
    })
    
    # Engagements (reactions + comments from posts)
    posts = await db.social_post.find({
        "author_business_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    }, {"_id": 0, "reaction_count": 1, "comment_count": 1}).to_list(length=10000)
    
    current_engagements = sum(
        p.get("reaction_count", 0) + p.get("comment_count", 0) 
        for p in posts
    )
    
    prev_posts = await db.social_post.find({
        "author_business_id": business_profile_id,
        "created_at": {"$gte": prev_start, "$lt": prev_end}
    }, {"_id": 0, "reaction_count": 1, "comment_count": 1}).to_list(length=10000)
    
    prev_engagements = sum(
        p.get("reaction_count", 0) + p.get("comment_count", 0)
        for p in prev_posts
    )
    
    # Discovery events
    current_discoveries = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": {"$in": ["search_click", "category_click", "directory_click"]},
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    prev_discoveries = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": {"$in": ["search_click", "category_click", "directory_click"]},
        "created_at": {"$gte": prev_start, "$lt": prev_end}
    })
    
    # Job metrics (if any jobs)
    current_job_views = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "job_view",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    current_job_applications = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "job_apply",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    # Calculate changes
    def calc_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)
    
    def get_trend(change):
        if change > 0:
            return "up"
        elif change < 0:
            return "down"
        return "neutral"
    
    profile_views_change = calc_change(current_profile_views, prev_profile_views)
    post_impressions_change = calc_change(current_post_impressions, prev_post_impressions)
    engagements_change = calc_change(current_engagements, prev_engagements)
    discoveries_change = calc_change(current_discoveries, prev_discoveries)
    
    # Calculate engagement rate
    engagement_rate = (
        (current_engagements / current_post_impressions * 100) 
        if current_post_impressions > 0 else 0.0
    )
    
    # Apply rate for jobs
    apply_rate = (
        (current_job_applications / current_job_views * 100)
        if current_job_views > 0 else 0.0
    )
    
    # Get rating stats
    business = await db.business_profiles.find_one(
        {"id": business_profile_id},
        {"_id": 0, "average_rating": 1, "total_reviews": 1}
    )
    
    avg_rating = business.get("average_rating", 0.0) if business else 0.0
    total_reviews = business.get("total_reviews", 0) if business else 0
    
    return {
        "profile_views": {
            "label": "Profile Views",
            "value": current_profile_views,
            "change_percent": profile_views_change,
            "trend": get_trend(profile_views_change)
        },
        "post_reach": {
            "label": "Post Reach",
            "value": current_post_impressions,
            "change_percent": post_impressions_change,
            "trend": get_trend(post_impressions_change)
        },
        "engagements": {
            "label": "Engagements",
            "value": current_engagements,
            "change_percent": engagements_change,
            "trend": get_trend(engagements_change),
            "subtitle": f"{engagement_rate:.1f}% engagement rate"
        },
        "discoveries": {
            "label": "Discovery Events",
            "value": current_discoveries,
            "change_percent": discoveries_change,
            "trend": get_trend(discoveries_change)
        },
        "job_performance": {
            "label": "Job Applications",
            "value": current_job_applications,
            "change_percent": 0.0,
            "trend": "neutral",
            "subtitle": f"{apply_rate:.1f}% apply rate" if current_job_views > 0 else "No jobs viewed"
        },
        "rating": {
            "label": "Average Rating",
            "value": avg_rating,
            "change_percent": 0.0,
            "trend": "neutral",
            "subtitle": f"{total_reviews} total reviews"
        }
    }


async def get_time_series_data(
    business_profile_id: str,
    start_date: datetime,
    end_date: datetime,
    metric_type: str
):
    """Get time series data for charts"""
    db = await get_db()
    
    # Generate all dates in range
    date_range = []
    current = start_date.date()
    end = end_date.date()
    
    while current <= end:
        date_range.append(current)
        current += timedelta(days=1)
    
    # Get events grouped by date
    if metric_type == "profile_views":
        event_type = "profile_view"
    elif metric_type == "post_impressions":
        event_type = "post_view"
    else:
        return []
    
    result = []
    for day in date_range:
        day_start = datetime.combine(day, datetime.min.time()).replace(tzinfo=timezone.utc)
        day_end = datetime.combine(day, datetime.max.time()).replace(tzinfo=timezone.utc)
        
        count = await db.analytics_events.count_documents({
            "business_profile_id": business_profile_id,
            "event_type": event_type,
            "created_at": {"$gte": day_start, "$lte": day_end}
        })
        
        result.append({
            "date": day.isoformat(),
            "value": count
        })
    
    return result


async def get_top_posts(business_profile_id: str, start_date: datetime, end_date: datetime, limit: int = 5):
    """Get top performing posts"""
    db = await get_db()
    
    # Get posts in date range
    posts = await db.social_post.find({
        "author_business_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    }, {"_id": 0}).to_list(length=1000)
    
    # Calculate metrics for each post
    top_posts = []
    for post in posts:
        impressions = post.get("view_count", 0)
        reactions = post.get("reaction_count", 0)
        comments = post.get("comment_count", 0)
        engagements = reactions + comments
        
        engagement_rate = (engagements / impressions * 100) if impressions > 0 else 0.0
        
        # Get post title/snippet
        title = post.get("text", "")[:100] if post.get("text") else "Media post"
        
        top_posts.append({
            "post_id": post.get("id"),
            "title": title,
            "impressions": impressions,
            "engagements": engagements,
            "engagement_rate": round(engagement_rate, 2),
            "created_at": post.get("created_at")
        })
    
    # Sort by engagements and return top N
    top_posts.sort(key=lambda x: x["engagements"], reverse=True)
    return top_posts[:limit]


async def get_discovery_breakdown(business_profile_id: str, start_date: datetime, end_date: datetime):
    """Get discovery source breakdown"""
    db = await get_db()
    
    search = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "search_click",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    category = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "category_click",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    directory = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "directory_click",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    # Posts-based discovery (profile views from posts)
    posts = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "profile_view",
        "source": "post",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    # Direct traffic
    direct = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "profile_view",
        "source": "direct",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    return {
        "search": search,
        "category": category,
        "directory": directory,
        "posts": posts,
        "direct": direct
    }


async def get_job_performance(business_profile_id: str, start_date: datetime, end_date: datetime):
    """Get job posting performance metrics"""
    db = await get_db()
    
    # Get all jobs for this business
    jobs = await db.job_postings.find({
        "business_profile_id": business_profile_id
    }, {"_id": 0}).to_list(length=1000)
    
    job_performance = []
    for job in jobs:
        job_id = job.get("id")
        
        # Count views and applications in date range
        views = await db.analytics_events.count_documents({
            "business_profile_id": business_profile_id,
            "event_type": "job_view",
            "meta.job_id": job_id,
            "created_at": {"$gte": start_date, "$lte": end_date}
        })
        
        applications = await db.analytics_events.count_documents({
            "business_profile_id": business_profile_id,
            "event_type": "job_apply",
            "meta.job_id": job_id,
            "created_at": {"$gte": start_date, "$lte": end_date}
        })
        
        apply_rate = (applications / views * 100) if views > 0 else 0.0
        
        job_performance.append({
            "job_id": job_id,
            "title": job.get("title", "Untitled Job"),
            "status": job.get("status", "draft"),
            "views": views,
            "applications": applications,
            "apply_rate": round(apply_rate, 2),
            "posted_at": job.get("posted_at") or job.get("created_at")
        })
    
    return job_performance


async def get_local_rank_text(business_profile_id: str, start_date: datetime, end_date: datetime):
    """Calculate simple local rank text"""
    db = await get_db()
    
    # Get business info
    business = await db.business_profiles.find_one(
        {"id": business_profile_id},
        {"_id": 0, "industry": 1, "location": 1}
    )
    
    if not business:
        return None
    
    category = business.get("industry", "your category")
    location = business.get("location", "your area")
    
    # Get this business's profile views
    own_views = await db.analytics_events.count_documents({
        "business_profile_id": business_profile_id,
        "event_type": "profile_view",
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    # Get all businesses in same category
    similar_businesses = await db.business_profiles.find({
        "industry": business.get("industry")
    }, {"_id": 0, "id": 1}).to_list(length=10000)
    
    if len(similar_businesses) < 2:
        return f"You're one of the featured businesses in {category}!"
    
    # Count how many have more views
    better_count = 0
    for biz in similar_businesses:
        if biz["id"] == business_profile_id:
            continue
        
        biz_views = await db.analytics_events.count_documents({
            "business_profile_id": biz["id"],
            "event_type": "profile_view",
            "created_at": {"$gte": start_date, "$lte": end_date}
        })
        
        if biz_views > own_views:
            better_count += 1
    
    # Calculate percentile
    total = len(similar_businesses)
    percentile = ((total - better_count) / total) * 100
    
    if percentile >= 90:
        rank_text = "Top 10%"
    elif percentile >= 75:
        rank_text = "Top 25%"
    elif percentile >= 50:
        rank_text = "Above Average"
    else:
        rank_text = "Average"
    
    return f"You're in the {rank_text} for profile views among {category} businesses in {location} this period."


async def generate_recommendations(business_profile_id: str, start_date: datetime, end_date: datetime):
    """Generate simple rule-based recommendations"""
    db = await get_db()
    recommendations = []
    
    # Check review count
    business = await db.business_profiles.find_one(
        {"id": business_profile_id},
        {"_id": 0, "total_reviews": 1}
    )
    
    if business and business.get("total_reviews", 0) < 4:
        recommendations.append(
            "📝 Businesses with 4+ reviews get 2× more clicks. Ask happy customers to leave a review!"
        )
    
    # Check job apply rate
    jobs = await db.job_postings.find({
        "business_profile_id": business_profile_id,
        "status": "open"
    }, {"_id": 0, "id": 1, "title": 1, "view_count": 1, "applicant_count": 1}).to_list(length=100)
    
    for job in jobs:
        views = job.get("view_count", 0)
        applications = job.get("applicant_count", 0)
        
        if views > 20 and applications < 3:
            apply_rate = (applications / views * 100) if views > 0 else 0
            recommendations.append(
                f"💼 Your job '{job['title'][:40]}...' has {views} views but only {applications} applications ({apply_rate:.0f}% apply rate). Consider updating the description or salary range."
            )
            break  # Only show one job recommendation
    
    # Check posting frequency
    post_count = await db.social_post.count_documents({
        "author_business_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    days = (end_date - start_date).days
    posts_per_week = (post_count / days) * 7 if days > 0 else 0
    
    if posts_per_week < 2:
        recommendations.append(
            "📅 Posting 2-3 times per week boosts engagement by 40%. Try sharing more updates!"
        )
    
    # Check top content
    top_posts = await get_top_posts(business_profile_id, start_date, end_date, limit=1)
    if top_posts and top_posts[0]["engagements"] > 5:
        # This is a simplification - in real implementation, analyze post content
        recommendations.append(
            "🔥 Your recent post about your services got great engagement. Share more content like this!"
        )
    
    return recommendations[:3]  # Max 3 recommendations


async def generate_activity_log(business_profile_id: str, start_date: datetime, end_date: datetime):
    """Generate activity log items"""
    db = await get_db()
    activities = []
    
    # Post count
    post_count = await db.social_post.count_documents({
        "author_business_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    if post_count > 0:
        days = (end_date - start_date).days
        period_text = f"this week" if days <= 7 else "this month" if days <= 31 else "this period"
        activities.append(f"📝 You posted {post_count} time{'s' if post_count != 1 else ''} {period_text}.")
    
    # New reviews
    new_reviews = await db.business_reviews.count_documents({
        "business_profile_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    if new_reviews > 0:
        activities.append(f"⭐ You received {new_reviews} new review{'s' if new_reviews != 1 else ''}.")
    
    # Jobs posted
    jobs_posted = await db.job_postings.count_documents({
        "business_profile_id": business_profile_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    if jobs_posted > 0:
        activities.append(f"💼 You posted {jobs_posted} job{'s' if jobs_posted != 1 else ''}.")
    
    # Profile updates
    # (This would require tracking profile_update events)
    
    if not activities:
        activities.append("No recent activity. Start by posting an update or job listing!")
    
    return activities
