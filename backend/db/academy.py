"""
BANIBS Academy - Database Operations
Phase 13.0
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict
from datetime import datetime
from uuid import uuid4


class AcademyDB:
    """Database operations for BANIBS Academy"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.courses = db.academy_courses
        self.mentors = db.academy_mentors
        self.lifeskills = db.academy_lifeskills
        self.history = db.academy_history
        self.opportunities = db.academy_opportunities
    
    # ==================== COURSES ====================
    
    async def get_courses(
        self,
        category: Optional[str] = None,
        level: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get courses with optional filters"""
        query = {}
        if category:
            query["category"] = category
        if level:
            query["level"] = level
        
        courses = await self.courses.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        return courses
    
    async def get_course_by_id(self, course_id: str) -> Optional[Dict]:
        """Get a specific course by ID"""
        course = await self.courses.find_one({"id": course_id}, {"_id": 0})
        return course
    
    async def create_course(self, course_data: Dict) -> Dict:
        """Create a new course"""
        course = {
            "id": str(uuid4()),
            **course_data,
            "created_at": datetime.utcnow()
        }
        await self.courses.insert_one(course)
        return {k: v for k, v in course.items() if k != "_id"}
    
    async def search_courses(self, query_text: str, limit: int = 50) -> List[Dict]:
        """Search courses by text"""
        courses = await self.courses.find(
            {"$text": {"$search": query_text}},
            {"_id": 0}
        ).limit(limit).to_list(limit)
        return courses
    
    # ==================== MENTORS ====================
    
    async def get_mentors(
        self,
        country: Optional[str] = None,
        expertise: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get mentors with optional filters"""
        query = {}
        if country:
            query["country"] = {"$regex": country, "$options": "i"}
        if expertise:
            query["expertise"] = {"$regex": expertise, "$options": "i"}
        
        mentors = await self.mentors.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        return mentors
    
    async def get_mentor_by_id(self, mentor_id: str) -> Optional[Dict]:
        """Get a specific mentor by ID"""
        mentor = await self.mentors.find_one({"id": mentor_id}, {"_id": 0})
        return mentor
    
    async def create_mentor(self, mentor_data: Dict) -> Dict:
        """Create a new mentor profile"""
        mentor = {
            "id": str(uuid4()),
            **mentor_data,
            "created_at": datetime.utcnow()
        }
        await self.mentors.insert_one(mentor)
        return {k: v for k, v in mentor.items() if k != "_id"}
    
    # ==================== LIFE SKILLS ====================
    
    async def get_lifeskills(
        self,
        tag: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get life skills with optional tag filter"""
        query = {}
        if tag:
            query["tags"] = {"$regex": tag, "$options": "i"}
        
        skills = await self.lifeskills.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        return skills
    
    async def get_lifeskill_by_id(self, skill_id: str) -> Optional[Dict]:
        """Get a specific life skill by ID"""
        skill = await self.lifeskills.find_one({"id": skill_id}, {"_id": 0})
        return skill
    
    async def create_lifeskill(self, skill_data: Dict) -> Dict:
        """Create a new life skill"""
        skill = {
            "id": str(uuid4()),
            **skill_data,
            "created_at": datetime.utcnow()
        }
        await self.lifeskills.insert_one(skill)
        return {k: v for k, v in skill.items() if k != "_id"}
    
    # ==================== HISTORY ====================
    
    async def get_history_lessons(
        self,
        theme: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get history lessons with optional theme filter"""
        query = {}
        if theme:
            query["theme"] = {"$regex": theme, "$options": "i"}
        
        lessons = await self.history.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        return lessons
    
    async def get_history_lesson_by_id(self, lesson_id: str) -> Optional[Dict]:
        """Get a specific history lesson by ID"""
        lesson = await self.history.find_one({"id": lesson_id}, {"_id": 0})
        return lesson
    
    async def create_history_lesson(self, lesson_data: Dict) -> Dict:
        """Create a new history lesson"""
        lesson = {
            "id": str(uuid4()),
            **lesson_data,
            "created_at": datetime.utcnow()
        }
        await self.history.insert_one(lesson)
        return {k: v for k, v in lesson.items() if k != "_id"}
    
    # ==================== OPPORTUNITIES ====================
    
    async def get_opportunities(
        self,
        opportunity_type: Optional[str] = None,
        upcoming_only: bool = False,
        limit: int = 100
    ) -> List[Dict]:
        """Get opportunities with optional filters"""
        query = {}
        if opportunity_type:
            query["type"] = opportunity_type
        if upcoming_only:
            query["deadline"] = {"$gte": datetime.utcnow()}
        
        opportunities = await self.opportunities.find(query, {"_id": 0})\
            .sort("deadline", 1)\
            .limit(limit)\
            .to_list(limit)
        return opportunities
    
    async def get_opportunity_by_id(self, opportunity_id: str) -> Optional[Dict]:
        """Get a specific opportunity by ID"""
        opportunity = await self.opportunities.find_one({"id": opportunity_id}, {"_id": 0})
        return opportunity
    
    async def create_opportunity(self, opportunity_data: Dict) -> Dict:
        """Create a new opportunity"""
        opportunity = {
            "id": str(uuid4()),
            **opportunity_data,
            "created_at": datetime.utcnow()
        }
        await self.opportunities.insert_one(opportunity)
        return {k: v for k, v in opportunity.items() if k != "_id"}
