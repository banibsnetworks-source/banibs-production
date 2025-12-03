"""
BANIBS ShortForm - Database Operations
"""
from typing import Optional, List, Dict
from datetime import datetime
from models.shortform_video import ShortFormVideo, VideoSafetyRating
import logging

logger = logging.getLogger(__name__)

class ShortFormDB:
    def __init__(self, db):
        self.db = db
        self.collection = db.shortform_videos
    
    async def create_video(self, video_data: Dict) -> str:
        """Create a new video entry"""
        try:
            result = await self.collection.insert_one(video_data)
            logger.info(f"✅ Created video: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"❌ Failed to create video: {e}")
            raise
    
    async def get_video(self, video_id: str) -> Optional[Dict]:
        """Get video by ID"""
        try:
            video = await self.collection.find_one(
                {"id": video_id, "is_active": True},
                {"_id": 0}
            )
            return video
        except Exception as e:
            logger.error(f"❌ Failed to get video {video_id}: {e}")
            return None
    
    async def get_discovery_feed(
        self,
        page: int = 1,
        limit: int = 20,
        user_age: Optional[int] = None,
        region: Optional[str] = None
    ) -> List[Dict]:
        """
        Get discovery feed with safety filtering
        Youth mode: Only show youth_safe content
        """
        try:
            query = {"is_active": True}
            
            # Youth safety filter
            if user_age and user_age < 18:
                query["safety_rating"] = VideoSafetyRating.YOUTH_SAFE.value
            
            # Region filter (RCS-X integration)
            if region:
                query["$or"] = [
                    {"region": region},
                    {"region": None}  # Also show global content
                ]
            
            skip = (page - 1) * limit
            
            videos = await self.collection.find(
                query,
                {"_id": 0}
            ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
            
            return videos
        except Exception as e:
            logger.error(f"❌ Failed to get discovery feed: {e}")
            return []
    
    async def get_personal_feed(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20
    ) -> List[Dict]:
        """Get videos from user's personal circle"""
        # TODO: Integrate with Circle OS to get circle members
        # For MVP, return empty
        return []
    
    async def get_community_feed(
        self,
        community_ids: List[str],
        page: int = 1,
        limit: int = 20
    ) -> List[Dict]:
        """Get videos from specific communities"""
        # TODO: Integrate with Communities system
        # For MVP, return empty
        return []
    
    async def increment_views(self, video_id: str) -> bool:
        """Increment view count"""
        try:
            result = await self.collection.update_one(
                {"id": video_id},
                {"$inc": {"views": 1}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"❌ Failed to increment views: {e}")
            return False
    
    async def increment_likes(self, video_id: str) -> bool:
        """Increment like count"""
        try:
            result = await self.collection.update_one(
                {"id": video_id},
                {"$inc": {"likes": 1}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"❌ Failed to increment likes: {e}")
            return False
    
    async def update_completion_rate(
        self,
        video_id: str,
        completion_rate: float
    ) -> bool:
        """Update video completion rate"""
        try:
            result = await self.collection.update_one(
                {"id": video_id},
                {"$set": {"completion_rate": completion_rate}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"❌ Failed to update completion rate: {e}")
            return False
    
    async def get_total_count(self, query: Dict = None) -> int:
        """Get total video count"""
        try:
            if query is None:
                query = {"is_active": True}
            return await self.collection.count_documents(query)
        except Exception as e:
            logger.error(f"❌ Failed to get video count: {e}")
            return 0
