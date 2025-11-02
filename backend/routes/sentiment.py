"""
Sentiment Routes - Phase 6.3
Admin endpoints for sentiment analysis and recalculation
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import logging

from db.connection import get_db
from services.sentiment_service import analyze_text_sentiment
from models.sentiment import SentimentRecalculateRequest, SentimentRecalculateResponse
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/sentiment", tags=["sentiment"])
logger = logging.getLogger(__name__)


@router.post("/recalculate", response_model=SentimentRecalculateResponse, dependencies=[Depends(require_role("super_admin", "moderator"))])
async def recalculate_sentiment(request: SentimentRecalculateRequest = SentimentRecalculateRequest()):
    """
    Recalculate sentiment for news and/or resources
    
    - **Admin only** endpoint
    - Processes items missing sentiment or forces recalculation
    - Returns count of processed, skipped, and error items
    
    Permissions: super_admin, moderator
    """
    
    logger.info(f"Sentiment recalculation requested: collection={request.collection}, force={request.force}")
    
    db = await get_db()
    results = {
        "processed": 0,
        "skipped": 0,
        "errors": 0,
        "collections": {}
    }
    
    # Process news collection
    if request.collection in ["news", "all"]:
        news_collection = db["news_items"]
        
        # Build query
        if request.force:
            query = {}  # Process all items
        else:
            query = {"sentiment_score": {"$exists": False}}  # Only items without sentiment
        
        news_processed = 0
        news_skipped = 0
        news_errors = 0
        
        cursor = news_collection.find(query)
        
        async for item in cursor:
            try:
                # Combine title and summary
                text = item.get("title", "")
                if item.get("summary"):
                    text += " " + item["summary"]
                
                # Analyze sentiment
                sentiment = analyze_text_sentiment(text)
                
                # Update document
                await news_collection.update_one(
                    {"_id": item["_id"]},
                    {
                        "$set": {
                            "sentiment_score": sentiment["score"],
                            "sentiment_label": sentiment["label"],
                            "sentiment_at": sentiment["analyzed_at"]
                        }
                    }
                )
                
                news_processed += 1
                
            except Exception as e:
                logger.error(f"Error processing news item: {e}")
                news_errors += 1
        
        results["collections"]["news"] = {
            "processed": news_processed,
            "skipped": news_skipped,
            "errors": news_errors
        }
        results["processed"] += news_processed
        results["errors"] += news_errors
    
    # Process resources collection
    if request.collection in ["resources", "all"]:
        resources_collection = db["banibs_resources"]
        
        # Build query
        if request.force:
            query = {}
        else:
            query = {"sentiment_score": {"$exists": False}}
        
        resources_processed = 0
        resources_skipped = 0
        resources_errors = 0
        
        cursor = resources_collection.find(query)
        
        async for item in cursor:
            try:
                # Combine title and description
                text = item.get("title", "")
                if item.get("description"):
                    text += " " + item["description"]
                
                # Analyze sentiment
                sentiment = analyze_text_sentiment(text)
                
                # Update document
                await resources_collection.update_one(
                    {"_id": item["_id"]},
                    {
                        "$set": {
                            "sentiment_score": sentiment["score"],
                            "sentiment_label": sentiment["label"],
                            "sentiment_at": sentiment["analyzed_at"]
                        }
                    }
                )
                
                resources_processed += 1
                
            except Exception as e:
                logger.error(f"Error processing resource: {e}")
                resources_errors += 1
        
        results["collections"]["resources"] = {
            "processed": resources_processed,
            "skipped": resources_skipped,
            "errors": resources_errors
        }
        results["processed"] += resources_processed
        results["errors"] += resources_errors
    
    logger.info(f"Sentiment recalculation complete: {results['processed']} processed, {results['errors']} errors")
    
    return SentimentRecalculateResponse(**results)
