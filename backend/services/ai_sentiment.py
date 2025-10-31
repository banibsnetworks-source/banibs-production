"""
Phase 6.3 - AI Sentiment Analysis Service

Uses OpenAI GPT-5 via Emergent LLM key for sentiment analysis.
Fallback to rule-based scoring if OpenAI is unavailable.
"""

import os
import re
from typing import Tuple, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import emergentintegrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False


async def analyze_sentiment(headline: str, summary: Optional[str] = None) -> Tuple[float, str]:
    """
    Analyze sentiment of a news headline + summary.
    
    Returns:
        (sentiment_score, sentiment_label)
        sentiment_score: float between -1.0 (negative) and 1.0 (positive)
        sentiment_label: "positive", "neutral", or "negative"
    """
    
    # Try OpenAI first
    if EMERGENT_AVAILABLE:
        try:
            return await _analyze_with_openai(headline, summary)
        except Exception as e:
            print(f"⚠️ OpenAI sentiment analysis failed: {e}")
            print("Falling back to rule-based sentiment...")
    
    # Fallback to rule-based
    return _analyze_with_rules(headline, summary)


async def _analyze_with_openai(headline: str, summary: Optional[str] = None) -> Tuple[float, str]:
    """
    Use OpenAI GPT-5 for sentiment analysis via emergentintegrations.
    """
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    # Prepare the text to analyze
    text = headline
    if summary:
        text += f"\n\n{summary[:300]}"  # Limit summary to first 300 chars
    
    # Create chat instance
    chat = LlmChat(
        api_key=api_key,
        session_id="sentiment-analysis",
        system_message=(
            "You are a sentiment analysis expert. Analyze the sentiment of news headlines and summaries. "
            "Respond with ONLY a JSON object in this exact format: "
            "{\"score\": <float between -1.0 and 1.0>, \"label\": \"<positive|neutral|negative>\"}"
        )
    )
    
    # Use GPT-5 (latest model as per integration playbook)
    chat.with_model("openai", "gpt-5")
    
    # Create message
    user_message = UserMessage(
        text=f"Analyze the sentiment of this news:\n\n{text}\n\nRespond only with JSON."
    )
    
    # Send and get response
    response = await chat.send_message(user_message)
    
    # Parse response
    # Expected format: {"score": 0.5, "label": "positive"}
    try:
        import json
        # Extract JSON from response (in case there's extra text)
        json_match = re.search(r'\{.*?\}', response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            score = float(result.get("score", 0.0))
            label = result.get("label", "neutral").lower()
            
            # Validate and clamp
            score = max(-1.0, min(1.0, score))
            if label not in ["positive", "neutral", "negative"]:
                label = "neutral"
            
            return (score, label)
        else:
            raise ValueError("No JSON found in response")
    except Exception as e:
        print(f"⚠️ Failed to parse OpenAI response: {e}")
        print(f"Raw response: {response}")
        raise


def _analyze_with_rules(headline: str, summary: Optional[str] = None) -> Tuple[float, str]:
    """
    Simple rule-based sentiment analysis as fallback.
    Uses keyword matching and basic scoring.
    """
    text = headline.lower()
    if summary:
        text += " " + summary.lower()
    
    # Positive keywords
    positive_words = [
        "success", "achieve", "win", "gain", "growth", "improve", "celebrate",
        "honor", "award", "breakthrough", "innovation", "opportunity", "benefit",
        "positive", "excellent", "great", "wonderful", "amazing", "fantastic"
    ]
    
    # Negative keywords
    negative_words = [
        "fail", "loss", "decline", "crisis", "concern", "worry", "threat",
        "danger", "risk", "problem", "issue", "challenge", "difficult", "struggle",
        "negative", "bad", "terrible", "awful", "poor", "worse"
    ]
    
    # Count matches
    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    
    # Calculate score
    total = positive_count + negative_count
    if total == 0:
        score = 0.0
        label = "neutral"
    else:
        score = (positive_count - negative_count) / total
        if score > 0.2:
            label = "positive"
        elif score < -0.2:
            label = "negative"
        else:
            label = "neutral"
    
    return (score, label)
