"""
Phase 6.6 - Heavy Content Banner Service
Detects and flags content requiring viewer discretion warnings.
"""

from typing import Optional

# Configuration Constants
HEAVY_CONTENT_SENTIMENT_THRESHOLD = -0.65  # Stricter than moderation queue (-0.5)
HEAVY_FLAGS = {"sensitive", "graphic", "controversial"}  # Moderation flag values

# Default banner messages by trigger type
DEFAULT_MESSAGES = {
    "sentiment": "This story contains emotionally charged content.",
    "moderation": "Viewer discretion advised — this content may be sensitive.",
    "manual": "This content has been marked as heavy by BANIBS editors.",
}


def is_heavy_content(item: dict) -> bool:
    """
    Determines if content should display a heavy content banner.
    
    Trigger conditions (any of these):
    1. sentiment_score < -0.65 (automatic sentiment-based)
    2. moderation_flag in {"sensitive", "graphic", "controversial"}
    3. is_heavy_content = True (manual editor override)
    
    Args:
        item: Dictionary or object with sentiment/moderation fields
        
    Returns:
        True if content is heavy, False otherwise
    """
    # Handle both dict and object attribute access
    def get_field(field_name, default=None):
        if isinstance(item, dict):
            return item.get(field_name, default)
        return getattr(item, field_name, default)
    
    # 1. Automatic sentiment-based detection
    sentiment_score = get_field("sentiment_score")
    if sentiment_score is not None and sentiment_score < HEAVY_CONTENT_SENTIMENT_THRESHOLD:
        return True
    
    # 2. Moderation flag-based detection
    moderation_flag = get_field("moderation_flag")
    if moderation_flag and moderation_flag in HEAVY_FLAGS:
        return True
    
    # 3. Manual editor override
    manual_flag = get_field("is_heavy_content", False)
    if manual_flag:
        return True
    
    return False


def get_banner_message(item: dict) -> Optional[str]:
    """
    Returns the appropriate banner message for heavy content.
    
    Priority:
    1. Admin-provided custom message (banner_message field)
    2. Default message based on trigger type
    
    Args:
        item: Dictionary or object with sentiment/moderation/banner fields
        
    Returns:
        Banner message string, or None if not heavy content
    """
    # Handle both dict and object attribute access
    def get_field(field_name, default=None):
        if isinstance(item, dict):
            return item.get(field_name, default)
        return getattr(item, field_name, default)
    
    # Check if content is actually heavy
    if not is_heavy_content(item):
        return None
    
    # 1. Admin override message (highest priority)
    custom_message = get_field("banner_message")
    if custom_message:
        return custom_message
    
    # 2. Determine trigger type and use appropriate default message
    sentiment_score = get_field("sentiment_score")
    moderation_flag = get_field("moderation_flag")
    manual_flag = get_field("is_heavy_content", False)
    
    # Sentiment-triggered
    if sentiment_score is not None and sentiment_score < HEAVY_CONTENT_SENTIMENT_THRESHOLD:
        return DEFAULT_MESSAGES["sentiment"]
    
    # Moderation-triggered
    if moderation_flag and moderation_flag in HEAVY_FLAGS:
        return DEFAULT_MESSAGES["moderation"]
    
    # Manual-triggered
    if manual_flag:
        return DEFAULT_MESSAGES["manual"]
    
    # Fallback (shouldn't reach here if is_heavy_content returned True)
    return DEFAULT_MESSAGES["moderation"]


def enrich_item_with_banner_data(item: dict) -> dict:
    """
    Adds heavy_content and banner_message fields to an item.
    
    This is a convenience function for API responses that computes
    both fields and adds them to the item dictionary.
    
    Args:
        item: News or resource item dictionary
        
    Returns:
        The same item dictionary with added fields:
        - heavy_content: bool
        - banner_message: str | None
    """
    item["heavy_content"] = is_heavy_content(item)
    item["banner_message"] = get_banner_message(item)
    return item


def get_heavy_content_stats(items: list) -> dict:
    """
    Returns statistics about heavy content in a collection.
    
    Useful for analytics and monitoring.
    
    Args:
        items: List of news or resource items
        
    Returns:
        Dictionary with statistics:
        - total: Total items analyzed
        - heavy_count: Number of heavy items
        - heavy_percentage: Percentage of heavy items
        - trigger_breakdown: Count by trigger type
    """
    total = len(items)
    heavy_count = 0
    trigger_breakdown = {
        "sentiment": 0,
        "moderation": 0,
        "manual": 0,
    }
    
    for item in items:
        if is_heavy_content(item):
            heavy_count += 1
            
            # Categorize trigger type
            def get_field(field_name, default=None):
                if isinstance(item, dict):
                    return item.get(field_name, default)
                return getattr(item, field_name, default)
            
            sentiment_score = get_field("sentiment_score")
            moderation_flag = get_field("moderation_flag")
            manual_flag = get_field("is_heavy_content", False)
            
            if sentiment_score is not None and sentiment_score < HEAVY_CONTENT_SENTIMENT_THRESHOLD:
                trigger_breakdown["sentiment"] += 1
            elif moderation_flag and moderation_flag in HEAVY_FLAGS:
                trigger_breakdown["moderation"] += 1
            elif manual_flag:
                trigger_breakdown["manual"] += 1
    
    return {
        "total": total,
        "heavy_count": heavy_count,
        "heavy_percentage": (heavy_count / total * 100) if total > 0 else 0,
        "trigger_breakdown": trigger_breakdown,
    }
