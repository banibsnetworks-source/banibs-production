"""
Trending Service - Phase 7.6.4
Computes trending scores for news items based on recency and sentiment intensity
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
import math


def compute_trending_score(item: Dict[str, Any]) -> float:
    """
    Compute trending score for a news item.
    
    Formula:
    - 60% recency score (exponential decay with 24h half-life)
    - 40% sentiment intensity (absolute value of sentiment_score)
    
    Args:
        item: News item dictionary with publishedAt and sentiment_score
        
    Returns:
        Trending score between 0.0 and 1.0
    """
    # Recency score (exponential decay)
    recency_score = compute_recency_score(item.get('publishedAt'))
    
    # Sentiment intensity (strong emotions trend more)
    sentiment_intensity = compute_sentiment_intensity(item.get('sentiment_score'))
    
    # Weighted combination
    trending_score = (0.60 * recency_score) + (0.40 * sentiment_intensity)
    
    return round(trending_score, 4)


def compute_recency_score(published_at) -> float:
    """
    Compute recency score using exponential decay.
    
    Half-life: 24 hours (score drops to 0.5 after 24h)
    
    Args:
        published_at: datetime object or ISO string
        
    Returns:
        Score between 0.0 and 1.0
    """
    if not published_at:
        return 0.0
    
    # Convert to datetime if string
    if isinstance(published_at, str):
        try:
            published_at = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
        except:
            return 0.0
    
    # Calculate age in hours
    now = datetime.now(timezone.utc)
    if published_at.tzinfo is None:
        published_at = published_at.replace(tzinfo=timezone.utc)
    
    age_hours = (now - published_at).total_seconds() / 3600.0
    
    if age_hours < 0:
        age_hours = 0
    
    # Exponential decay with 24h half-life
    half_life_hours = 24.0
    recency_score = math.exp(-age_hours / half_life_hours * math.log(2))
    
    return min(1.0, recency_score)


def compute_sentiment_intensity(sentiment_score) -> float:
    """
    Compute sentiment intensity score.
    
    Strong positive or negative sentiment increases trending potential.
    
    Args:
        sentiment_score: Float between -1.0 and 1.0
        
    Returns:
        Intensity score between 0.0 and 1.0
    """
    if sentiment_score is None:
        return 0.0
    
    try:
        intensity = abs(float(sentiment_score))
        return min(1.0, intensity)
    except:
        return 0.0


def get_trending_items(
    items: List[Dict[str, Any]],
    section: str = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Get top trending items from a list, optionally filtered by section.
    
    Args:
        items: List of news item dictionaries
        section: Optional section filter (e.g., 'us', 'world')
        limit: Number of trending items to return
        
    Returns:
        List of top trending items with trending_score added
    """
    # Compute trending scores for all items
    scored_items = []
    for item in items:
        # Skip if section filter doesn't match
        if section and section != 'all':
            # Check category field for section match
            item_category = (item.get('category') or '').lower()
            from services.news_categorization_service import categorize_news_item
            item_section = categorize_news_item(item)
            
            if item_section != section:
                continue
        
        # Compute and add trending score
        score = compute_trending_score(item)
        item_with_score = item.copy()
        item_with_score['trending_score'] = score
        scored_items.append(item_with_score)
    
    # Sort by trending score descending
    scored_items.sort(key=lambda x: x.get('trending_score', 0), reverse=True)
    
    # Return top N
    return scored_items[:limit]


def compute_sentiment_summary(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute sentiment distribution across a list of items.
    
    Phase 7.6.5: Now includes dominant_tone calculation.
    
    Args:
        items: List of news item dictionaries
        
    Returns:
        Dictionary with counts and dominant_tone:
        {
            "positive": X,
            "neutral": Y,
            "negative": Z,
            "dominant_tone": "Optimistic" | "Balanced" | "Concerned"
        }
    """
    summary = {
        'positive': 0,
        'neutral': 0,
        'negative': 0
    }
    
    for item in items:
        sentiment_label = (item.get('sentiment_label') or 'neutral').lower()
        if sentiment_label in summary:
            summary[sentiment_label] += 1
    
    # Calculate dominant tone (Phase 7.6.5)
    total = summary['positive'] + summary['neutral'] + summary['negative']
    
    if total == 0:
        dominant_tone = "Balanced"
    else:
        pos_pct = (summary['positive'] / total) * 100
        neg_pct = (summary['negative'] / total) * 100
        
        if pos_pct > 50:
            dominant_tone = "Optimistic"
        elif neg_pct > 50:
            dominant_tone = "Concerned"
        else:
            dominant_tone = "Balanced"
    
    summary['dominant_tone'] = dominant_tone
    
    return summary
