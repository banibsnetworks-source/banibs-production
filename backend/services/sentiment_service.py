"""
Sentiment Analysis Service - Phase 6.3
Simple rule-based sentiment analysis for news and resources
Can be upgraded to LLM-based analysis later (OpenAI, Claude, etc.)
"""

import logging
from typing import Dict
from datetime import datetime, timezone

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def analyze_text_sentiment(text: str) -> Dict[str, any]:
    """
    Analyze sentiment of text using simple rule-based approach
    
    Args:
        text: String to analyze (typically title + summary/description)
    
    Returns:
        dict: {
            "score": float (-1.0 to 1.0),
            "label": str ("positive" | "neutral" | "negative"),
            "analyzed_at": datetime (UTC)
        }
    
    Sentiment Rules:
        - score > 0.15 → positive
        - score < -0.15 → negative
        - else → neutral
    
    Future Enhancement:
        Replace with OpenAI GPT-5, Claude Sonnet 4, or other LLM for semantic analysis
    """
    
    if not text or not text.strip():
        logger.warning("Empty text provided for sentiment analysis")
        return {
            "score": 0.0,
            "label": "neutral",
            "analyzed_at": datetime.now(timezone.utc)
        }
    
    try:
        # Simple keyword-based sentiment scoring
        text_lower = text.lower()
        
        # Positive keywords (weight: +0.1 each)
        positive_words = [
            'success', 'successful', 'growth', 'achievement', 'win', 'winning', 'excellent',
            'great', 'good', 'better', 'best', 'progress', 'opportunity', 'opportunities',
            'positive', 'celebration', 'celebrate', 'victory', 'award', 'awarded',
            'innovation', 'innovative', 'breakthrough', 'empower', 'empowerment',
            'inspire', 'inspiring', 'hope', 'hopeful', 'amazing', 'wonderful',
            'fantastic', 'outstanding', 'remarkable', 'impressive', 'triumph',
            'advance', 'advancement', 'benefit', 'beneficial', 'thriving', 'prosper'
        ]
        
        # Negative keywords (weight: -0.1 each)
        negative_words = [
            'crisis', 'failure', 'failed', 'problem', 'problems', 'issue', 'issues',
            'concern', 'concerns', 'worry', 'worried', 'fear', 'afraid', 'threat',
            'threaten', 'risk', 'danger', 'dangerous', 'harm', 'harmful', 'attack',
            'violence', 'violent', 'death', 'die', 'dying', 'disaster', 'catastrophe',
            'decline', 'declining', 'loss', 'lose', 'losing', 'defeat', 'defeated',
            'cut', 'cuts', 'cutting', 'layoff', 'layoffs', 'unemployment',
            'discrimination', 'discriminate', 'injustice', 'unfair', 'protest',
            'controversy', 'controversial', 'scandal', 'corruption', 'corrupt'
        ]
        
        # Calculate sentiment score
        score = 0.0
        
        # Count positive words
        for word in positive_words:
            if word in text_lower:
                score += 0.1
        
        # Count negative words
        for word in negative_words:
            if word in text_lower:
                score -= 0.1
        
        # Normalize score to -1.0 to 1.0 range
        # Cap at -1.0 and 1.0
        score = max(-1.0, min(1.0, score))
        
        # Determine label based on score
        if score > 0.15:
            label = "positive"
        elif score < -0.15:
            label = "negative"
        else:
            label = "neutral"
        
        result = {
            "score": round(score, 3),
            "label": label,
            "analyzed_at": datetime.now(timezone.utc)
        }
        
        logger.info(f"Sentiment analysis: score={result['score']}, label={result['label']}")
        return result
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        # Return neutral sentiment on error
        return {
            "score": 0.0,
            "label": "neutral",
            "analyzed_at": datetime.now(timezone.utc)
        }


def analyze_batch_sentiment(texts: list) -> list:
    """
    Analyze sentiment for multiple texts in batch
    
    Args:
        texts: List of strings to analyze
    
    Returns:
        list: List of sentiment dictionaries
    """
    results = []
    for text in texts:
        result = analyze_text_sentiment(text)
        results.append(result)
    return results


# Future enhancement placeholder
def analyze_text_sentiment_llm(text: str, provider: str = "openai") -> Dict[str, any]:
    """
    Placeholder for LLM-based sentiment analysis
    
    This function can be implemented in Phase 6.3 Day 2+ to use:
    - OpenAI GPT-5 for semantic understanding
    - Claude Sonnet 4 for nuanced sentiment
    - Custom fine-tuned models
    
    Args:
        text: String to analyze
        provider: LLM provider ("openai", "anthropic", "google")
    
    Returns:
        dict: Same format as analyze_text_sentiment()
    """
    # TODO: Implement LLM-based sentiment analysis
    # For now, fall back to rule-based
    logger.warning("LLM-based sentiment not yet implemented, using rule-based")
    return analyze_text_sentiment(text)
