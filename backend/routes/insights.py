"""
Phase 6.3 - Regional Insights API Routes

Public endpoint: GET /api/insights/regional
Admin endpoints: GET /api/admin/insights/regional, POST /api/admin/insights/regional/generate
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, timezone

from db.news_sentiment import (
    get_regional_sentiment_aggregate,
    get_all_regional_aggregates,
    get_unsentimented_stories,
    create_sentiment_record
)
from services.ai_sentiment import analyze_sentiment
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/insights")


@router.get("/regional")
async def get_regional_insights(region: Optional[str] = None):
    """
    Public endpoint: Get aggregated sentiment insights by region.
    
    Query params:
        - region: Optional filter (Global, Africa, Americas, Europe, Asia, Middle East)
    
    Returns:
        If region specified: Single aggregate object
        If no region: List of all regional aggregates
    """
    if region:
        aggregate = await get_regional_sentiment_aggregate(region)
        return aggregate
    else:
        aggregates = await get_all_regional_aggregates()
        return aggregates


@router.get("/admin/regional")
async def get_admin_regional_insights(current_user: dict = Depends(require_role("super_admin"))):
    """
    Admin endpoint: Get detailed regional sentiment insights.
    JWT-protected (admin only).
    
    Returns:
        List of all regional aggregates with detailed stats
    """
    aggregates = await get_all_regional_aggregates()
    return {
        "success": True,
        "regions": aggregates,
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }


@router.post("/admin/regional/generate")
async def generate_regional_insights(current_user: dict = Depends(require_role("super_admin"))):
    """
    Admin endpoint: Manually trigger sentiment analysis for unsentimented stories.
    JWT-protected (admin only).
    
    Analyzes up to 50 stories that don't have sentiment yet.
    
    Returns:
        {
            "success": bool,
            "analyzed": int,
            "errors": int,
            "message": str
        }
    """
    try:
        # Get stories that need sentiment analysis
        unsentimented = await get_unsentimented_stories(limit=50)
        
        if not unsentimented:
            return {
                "success": True,
                "analyzed": 0,
                "errors": 0,
                "message": "All stories already have sentiment analysis"
            }
        
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
                
            except Exception as e:
                print(f"⚠️ Failed to analyze story {story['id']}: {e}")
                error_count += 1
        
        return {
            "success": True,
            "analyzed": analyzed_count,
            "errors": error_count,
            "message": f"Successfully analyzed {analyzed_count} stories ({error_count} errors)"
        }
        
    except Exception as e:
        print(f"❌ Generate insights failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
