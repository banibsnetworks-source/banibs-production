"""
Database operations for news engagement analytics
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import List, Optional, Dict, Any
from datetime import datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_click_stats_collection = db.news_click_stats
news_items_collection = db.news_items

async def track_news_click(story_id: str, region: str) -> bool:
    """
    Track a click on a news story by region.
    Increments totalClicks and updates lastClickedAt.
    """
    try:
        # Try to update existing record, or create new one
        result = await news_click_stats_collection.update_one(
            {"storyId": story_id, "region": region},
            {
                "$inc": {"totalClicks": 1},
                "$set": {"lastClickedAt": datetime.utcnow()},
                "$setOnInsert": {"createdAt": datetime.utcnow()}
            },
            upsert=True
        )
        return True
    except Exception as e:
        print(f"Error tracking news click: {e}")
        return False

async def get_trending_stories(region: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Get trending stories for a region by click count.
    Joins with news_items to get full story data.
    """
    try:
        # Aggregation pipeline to join click stats with news items
        pipeline = [
            # Match the region
            {"$match": {"region": region, "totalClicks": {"$gt": 0}}},
            
            # Sort by click count descending
            {"$sort": {"totalClicks": -1}},
            
            # Limit results
            {"$limit": limit},
            
            # Convert storyId string to ObjectId for lookup (if needed)
            # For now, assuming storyId is stored as string in both collections
            
            # Join with news items
            {"$lookup": {
                "from": "news_items",
                "localField": "storyId",
                "foreignField": "id",
                "as": "story"
            }},
            
            # Unwind the story array (should be single item)
            {"$unwind": "$story"},
            
            # Project the final result
            {"$project": {
                "storyId": 1,
                "clicks": "$totalClicks",
                "lastClickedAt": 1,
                "title": "$story.title",
                "sourceName": "$story.sourceName",
                "region": "$story.region",
                "imageUrl": "$story.imageUrl",
                "sourceUrl": "$story.sourceUrl"
            }}
        ]
        
        results = await news_click_stats_collection.aggregate(pipeline).to_list(length=None)
        return results
    
    except Exception as e:
        print(f"Error getting trending stories: {e}")
        return []

async def get_engagement_summary() -> Dict[str, Any]:
    """
    Get engagement summary across all regions for admin dashboard.
    Returns top stories and total clicks per region.
    """
    try:
        pipeline = [
            # Match only records with clicks
            {"$match": {"totalClicks": {"$gt": 0}}},
            
            # Group by region to get totals and top stories
            {"$group": {
                "_id": "$region",
                "totalRegionClicks": {"$sum": "$totalClicks"},
                "topStories": {
                    "$push": {
                        "storyId": "$storyId",
                        "clicks": "$totalClicks",
                        "lastClickedAt": "$lastClickedAt"
                    }
                }
            }},
            
            # Sort top stories within each region by clicks
            {"$addFields": {
                "topStories": {
                    "$slice": [
                        {"$sortArray": {"input": "$topStories", "sortBy": {"clicks": -1}}},
                        5  # Top 5 stories per region
                    ]
                }
            }},
            
            # Sort regions by total clicks
            {"$sort": {"totalRegionClicks": -1}}
        ]
        
        regions = await news_click_stats_collection.aggregate(pipeline).to_list(length=None)
        
        # Now fetch story titles for each top story
        for region in regions:
            for story in region["topStories"]:
                news_item = await news_items_collection.find_one(
                    {"id": story["storyId"]},
                    {"title": 1, "_id": 0}
                )
                if news_item:
                    story["title"] = news_item["title"]
                else:
                    story["title"] = "Story not found"
        
        return {
            "regions": [
                {
                    "region": region["_id"],
                    "totalRegionClicks": region["totalRegionClicks"],
                    "topStories": region["topStories"]
                }
                for region in regions
            ]
        }
        
    except Exception as e:
        print(f"Error getting engagement summary: {e}")
        return {"regions": []}