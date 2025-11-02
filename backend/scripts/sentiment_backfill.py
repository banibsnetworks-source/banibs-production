"""
Sentiment Backfill Script - Phase 6.3
Iterates over news and resources collections to add sentiment analysis
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')
sys.path.insert(0, str(Path(__file__).parent.parent))

from db.connection import get_db
from services.sentiment_service import analyze_text_sentiment
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def backfill_news_sentiment():
    """Add sentiment to news items that don't have it"""
    db = await get_db()
    collection = db["news_items"]
    
    # Find items without sentiment
    query = {"sentiment_score": {"$exists": False}}
    cursor = collection.find(query)
    
    processed = 0
    errors = 0
    
    logger.info("Starting news sentiment backfill...")
    
    async for item in cursor:
        try:
            # Combine title and summary for analysis
            text = item.get("title", "")
            if item.get("summary"):
                text += " " + item["summary"]
            
            # Analyze sentiment
            sentiment = analyze_text_sentiment(text)
            
            # Update document
            await collection.update_one(
                {"_id": item["_id"]},
                {
                    "$set": {
                        "sentiment_score": sentiment["score"],
                        "sentiment_label": sentiment["label"],
                        "sentiment_at": sentiment["analyzed_at"]
                    }
                }
            )
            
            processed += 1
            
            if processed % 10 == 0:
                logger.info(f"  Processed {processed} news items...")
                
        except Exception as e:
            logger.error(f"Error processing news item {item.get('id', 'unknown')}: {e}")
            errors += 1
    
    logger.info(f"✅ News sentiment backfill complete: {processed} processed, {errors} errors")
    return {"processed": processed, "errors": errors}


async def backfill_resources_sentiment():
    """Add sentiment to resources that don't have it"""
    db = await get_db()
    collection = db["banibs_resources"]
    
    # Find items without sentiment
    query = {"sentiment_score": {"$exists": False}}
    cursor = collection.find(query)
    
    processed = 0
    errors = 0
    
    logger.info("Starting resources sentiment backfill...")
    
    async for item in cursor:
        try:
            # Combine title and description for analysis
            text = item.get("title", "")
            if item.get("description"):
                text += " " + item["description"]
            
            # Analyze sentiment
            sentiment = analyze_text_sentiment(text)
            
            # Update document
            await collection.update_one(
                {"_id": item["_id"]},
                {
                    "$set": {
                        "sentiment_score": sentiment["score"],
                        "sentiment_label": sentiment["label"],
                        "sentiment_at": sentiment["analyzed_at"]
                    }
                }
            )
            
            processed += 1
            
            if processed % 10 == 0:
                logger.info(f"  Processed {processed} resources...")
                
        except Exception as e:
            logger.error(f"Error processing resource {item.get('id', 'unknown')}: {e}")
            errors += 1
    
    logger.info(f"✅ Resources sentiment backfill complete: {processed} processed, {errors} errors")
    return {"processed": processed, "errors": errors}


async def run_backfill():
    """Run complete sentiment backfill"""
    logger.info("=" * 60)
    logger.info("SENTIMENT ANALYSIS BACKFILL - Phase 6.3")
    logger.info("=" * 60)
    logger.info("")
    
    # Get initial counts
    db = await get_db()
    total_news = await db["news_items"].count_documents({})
    total_resources = await db["banibs_resources"].count_documents({})
    
    news_missing = await db["news_items"].count_documents({"sentiment_score": {"$exists": False}})
    resources_missing = await db["banibs_resources"].count_documents({"sentiment_score": {"$exists": False}})
    
    logger.info(f"Total news items: {total_news}")
    logger.info(f"  Missing sentiment: {news_missing}")
    logger.info(f"Total resources: {total_resources}")
    logger.info(f"  Missing sentiment: {resources_missing}")
    logger.info("")
    
    # Run backfill
    news_results = await backfill_news_sentiment()
    resources_results = await backfill_resources_sentiment()
    
    # Get final counts
    news_with_sentiment = await db["news_items"].count_documents({"sentiment_score": {"$exists": True}})
    resources_with_sentiment = await db["banibs_resources"].count_documents({"sentiment_score": {"$exists": True}})
    
    logger.info("")
    logger.info("=" * 60)
    logger.info("BACKFILL COMPLETE")
    logger.info("=" * 60)
    logger.info(f"News: {news_results['processed']} processed, {news_results['errors']} errors")
    logger.info(f"  Total with sentiment: {news_with_sentiment}/{total_news}")
    logger.info(f"Resources: {resources_results['processed']} processed, {resources_results['errors']} errors")
    logger.info(f"  Total with sentiment: {resources_with_sentiment}/{total_resources}")
    logger.info("=" * 60)
    
    return {
        "news": news_results,
        "resources": resources_results,
        "totals": {
            "total_news": total_news,
            "total_resources": total_resources,
            "news_with_sentiment": news_with_sentiment,
            "resources_with_sentiment": resources_with_sentiment
        }
    }


if __name__ == "__main__":
    asyncio.run(run_backfill())
