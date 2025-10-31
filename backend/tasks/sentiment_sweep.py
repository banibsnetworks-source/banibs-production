"""
Phase 6.3 - Sentiment Sweep Task

Scheduled task that finds unsentimented news items and analyzes them.
Runs every 3 hours (separate from RSS sync which runs every 6 hours).
"""

from datetime import datetime, timezone
from db.news_sentiment import get_unsentimented_stories, create_sentiment_record, cleanup_old_sentiment_records
from services.ai_sentiment import analyze_sentiment


async def run_sentiment_sweep():
    """
    Find news items without sentiment analysis and analyze them.
    Also performs cleanup of old sentiment records (90+ days).
    
    This function is called by APScheduler every 3 hours.
    """
    print(f"\\n{'='*60}")
    print(f"🧠 BANIBS Sentiment Sweep Job Started")
    print(f"   Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print(f"{'='*60}")
    
    try:
        # Get unsentimented stories (up to 50 per run)
        unsentimented = await get_unsentimented_stories(limit=50)
        
        if not unsentimented:
            print("✅ No new stories to analyze. All up to date!")
            print(f"{'='*60}\\n")
            return {
                "success": True,
                "analyzed": 0,
                "errors": 0,
                "cleaned_up": 0
            }
        
        print(f"📊 Found {len(unsentimented)} stories needing sentiment analysis...")
        
        analyzed_count = 0
        error_count = 0
        
        # Analyze each story
        for story in unsentimented:
            try:
                # Call AI sentiment service
                score, label = await analyze_sentiment(
                    headline=story["title"],
                    summary=story.get("summary")
                )
                
                # Store result
                await create_sentiment_record(
                    story_id=story["id"],
                    region=story["region"],
                    sentiment_score=score,
                    sentiment_label=label,
                    headline=story["title"],
                    summary=story.get("summary")
                )
                
                analyzed_count += 1
                print(f"  ✓ Analyzed: {story['title'][:50]}... [{label}, {score:.2f}]")
                
            except Exception as e:
                error_count += 1
                print(f"  ✗ Error analyzing story {story['id']}: {e}")
        
        # Cleanup old sentiment records (90+ days)
        print(f"\\n🧹 Cleaning up sentiment records older than 90 days...")
        deleted_count = await cleanup_old_sentiment_records(days=90)
        print(f"  ✓ Deleted {deleted_count} old sentiment records")
        
        print(f"\\n✅ Sentiment sweep complete!")
        print(f"   Analyzed: {analyzed_count}")
        print(f"   Errors: {error_count}")
        print(f"   Cleaned up: {deleted_count}")
        print(f"{'='*60}\\n")
        
        return {
            "success": True,
            "analyzed": analyzed_count,
            "errors": error_count,
            "cleaned_up": deleted_count
        }
        
    except Exception as e:
        print(f"❌ Sentiment sweep job failed: {e}")
        print(f"{'='*60}\\n")
        return {
            "success": False,
            "error": str(e)
        }
