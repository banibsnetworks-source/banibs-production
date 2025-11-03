"""
Moderation Service - Phase 6.4
Service layer for content moderation routing based on sentiment
"""

from typing import Optional, Dict, Any
import logging

from utils.features import get_feature, is_feature_enabled
from db.moderation_queue import (
    create_moderation_item,
    check_if_already_moderated
)

logger = logging.getLogger(__name__)


async def should_moderate_content(
    sentiment_label: Optional[str],
    sentiment_score: Optional[float]
) -> bool:
    """
    Determine if content should be routed to moderation queue
    
    Args:
        sentiment_label: Sentiment label (positive/neutral/negative)
        sentiment_score: Sentiment score (-1.0 to 1.0)
        
    Returns:
        True if content should be moderated, False otherwise
    """
    # Feature flag check
    if not is_feature_enabled("moderation.auto_from_sentiment"):
        return False
    
    # Must have sentiment data
    if not sentiment_label or sentiment_score is None:
        return False
    
    # Check if sentiment is negative/critical
    if sentiment_label.lower() not in ["negative", "critical", "bad"]:
        return False
    
    # Check threshold
    threshold = get_feature("moderation.threshold", -0.5)
    if sentiment_score <= threshold:
        return True
    
    return False


async def route_to_moderation(
    content_id: str,
    content_type: str,
    title: str,
    sentiment_label: Optional[str],
    sentiment_score: Optional[float],
    reason: str = "LOW_SENTIMENT"
) -> Optional[str]:
    """
    Route content to moderation queue
    
    Args:
        content_id: ID of the content
        content_type: Type of content (news/resource)
        title: Title of the content
        sentiment_label: Sentiment label
        sentiment_score: Sentiment score
        reason: Reason for moderation
        
    Returns:
        Moderation item ID if created, None if already exists or error
    """
    try:
        # Check if already in queue
        if await check_if_already_moderated(content_id, content_type):
            logger.info(f"Content {content_type}/{content_id} already in moderation queue")
            return None
        
        # Create moderation item
        mod_id = await create_moderation_item(
            content_id=content_id,
            content_type=content_type,
            title=title,
            sentiment_label=sentiment_label,
            sentiment_score=sentiment_score,
            reason=reason
        )
        
        logger.info(
            f"Routed {content_type}/{content_id} to moderation queue: "
            f"sentiment={sentiment_label} ({sentiment_score}), reason={reason}"
        )
        
        return mod_id
        
    except Exception as e:
        logger.error(f"Failed to route content to moderation: {e}")
        return None


async def handle_content_moderation(
    content_id: str,
    content_type: str,
    title: str,
    sentiment_label: Optional[str],
    sentiment_score: Optional[float]
) -> Dict[str, Any]:
    """
    Handle moderation routing for content
    
    This is the main entry point for moderation logic.
    Call this after sentiment analysis is complete.
    
    Args:
        content_id: ID of the content
        content_type: Type of content (news/resource)
        title: Title of the content
        sentiment_label: Sentiment label
        sentiment_score: Sentiment score
        
    Returns:
        Dict with moderation result: {
            "should_moderate": bool,
            "moderation_id": str or None,
            "blocked": bool (if block_negative is enabled)
        }
    """
    result = {
        "should_moderate": False,
        "moderation_id": None,
        "blocked": False
    }
    
    # Check if content should be moderated
    if not await should_moderate_content(sentiment_label, sentiment_score):
        return result
    
    result["should_moderate"] = True
    
    # Route to moderation queue
    mod_id = await route_to_moderation(
        content_id=content_id,
        content_type=content_type,
        title=title,
        sentiment_label=sentiment_label,
        sentiment_score=sentiment_score,
        reason="LOW_SENTIMENT"
    )
    
    result["moderation_id"] = mod_id
    
    # Check if content should be blocked (Mode B - not active yet)
    block_negative = get_feature("moderation.block_negative", False)
    if block_negative:
        result["blocked"] = True
        logger.warning(
            f"Content {content_type}/{content_id} blocked due to negative sentiment "
            f"(block_negative=true)"
        )
    
    return result
