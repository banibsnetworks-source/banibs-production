"""
Business Analytics Models - Phase 7.1.1: BIA Dashboard
BANIBS Business Insights Analytics System
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime, date


class AnalyticsEventCreate(BaseModel):
    """Create analytics event request"""
    business_profile_id: str
    event_type: str = Field(..., description="profile_view | post_view | job_view | job_apply | search_click | category_click | cta_click")
    source: Optional[str] = Field(None, description="search | category | directory | post | direct")
    meta: Optional[Dict] = Field(default={}, description="Additional event metadata")


class AnalyticsEvent(BaseModel):
    """Analytics event response"""
    id: str
    business_profile_id: str
    event_type: str
    source: Optional[str] = None
    meta: Dict = {}
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DailyAnalytics(BaseModel):
    """Daily aggregated analytics for a business"""
    business_profile_id: str
    date: date
    
    # Traffic metrics
    profile_views: int = 0
    unique_visitors: int = 0
    
    # Post metrics
    post_impressions: int = 0
    post_engagements: int = 0  # reactions + comments + shares
    
    # Job metrics
    job_views: int = 0
    job_applications: int = 0
    
    # Discovery metrics
    search_discoveries: int = 0
    category_discoveries: int = 0
    directory_discoveries: int = 0
    
    # Engagement breakdown
    reactions: int = 0
    comments: int = 0
    shares: int = 0
    clicks: int = 0
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat()
        }


class KPIMetric(BaseModel):
    """KPI metric with comparison"""
    label: str
    value: int | float
    change_percent: float = 0.0
    trend: str = Field(default="neutral", description="up | down | neutral")
    subtitle: Optional[str] = None


class TopPost(BaseModel):
    """Top performing post analytics"""
    post_id: str
    title: str
    impressions: int
    engagements: int
    engagement_rate: float
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class JobPerformance(BaseModel):
    """Job posting performance metrics"""
    job_id: str
    title: str
    status: str
    views: int
    applications: int
    apply_rate: float
    posted_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DiscoveryBreakdown(BaseModel):
    """Discovery source breakdown"""
    search: int = 0
    category: int = 0
    directory: int = 0
    posts: int = 0
    direct: int = 0


class RatingAnalytics(BaseModel):
    """Rating and review analytics"""
    average_rating: float
    total_reviews: int
    new_reviews_period: int
    distribution: Dict[str, int] = Field(
        default={"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
        description="Rating distribution"
    )


class TimeSeriesData(BaseModel):
    """Time series data point"""
    date: str
    value: int | float


class DashboardSummary(BaseModel):
    """Complete dashboard summary"""
    business_profile_id: str
    date_range: str
    
    # KPIs
    kpis: Dict[str, KPIMetric]
    
    # Time series
    profile_views_over_time: List[TimeSeriesData]
    post_impressions_over_time: List[TimeSeriesData]
    
    # Top content
    top_posts: List[TopPost]
    
    # Discovery
    discovery_breakdown: DiscoveryBreakdown
    local_rank_text: Optional[str] = None
    
    # Jobs
    job_performance: List[JobPerformance]
    
    # Ratings
    rating_analytics: RatingAnalytics
    
    # Activity & Recommendations
    activity_log: List[str] = []
    recommendations: List[str] = []
