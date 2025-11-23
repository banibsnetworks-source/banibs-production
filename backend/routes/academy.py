"""
BANIBS Academy - API Routes
Phase 13.0
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from db.connection import get_db_client
from db.academy import AcademyDB
from models.academy import (
    AcademyCoursesResponse,
    AcademyCourse,
    AcademyCourseCreate,
    AcademyMentorsResponse,
    AcademyMentor,
    AcademyMentorCreate,
    AcademyLifeSkillsResponse,
    AcademyLifeSkill,
    AcademyLifeSkillCreate,
    AcademyHistoryResponse,
    AcademyHistoryLesson,
    AcademyHistoryLessonCreate,
    AcademyOpportunitiesResponse,
    AcademyOpportunity,
    AcademyOpportunityCreate
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/academy", tags=["academy"])


# ==================== COURSES ====================

@router.get("/courses", response_model=AcademyCoursesResponse)
async def get_courses(
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200)
):
    """Get all courses with optional filters (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    courses = await academy_db.get_courses(category=category, level=level, limit=limit)
    return {"courses": courses, "total": len(courses)}


@router.get("/courses/{course_id}", response_model=AcademyCourse)
async def get_course(course_id: str):
    """Get a specific course by ID (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    course = await academy_db.get_course_by_id(course_id)
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course


@router.post("/courses", response_model=AcademyCourse)
async def create_course(
    course_data: AcademyCourseCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new course (requires authentication)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    
    course = await academy_db.create_course(course_data.dict())
    return course


# ==================== MENTORS ====================

@router.get("/mentors", response_model=AcademyMentorsResponse)
async def get_mentors(
    country: Optional[str] = Query(None),
    expertise: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200)
):
    """Get all mentors with optional filters (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    mentors = await academy_db.get_mentors(country=country, expertise=expertise, limit=limit)
    return {"mentors": mentors, "total": len(mentors)}


@router.get("/mentors/{mentor_id}", response_model=AcademyMentor)
async def get_mentor(mentor_id: str):
    """Get a specific mentor by ID (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    mentor = await academy_db.get_mentor_by_id(mentor_id)
    
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    return mentor


@router.post("/mentors", response_model=AcademyMentor)
async def create_mentor(
    mentor_data: AcademyMentorCreate,
    current_user: dict = Depends(get_current_user)
):
    """Submit mentor application (requires authentication)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    
    mentor = await academy_db.create_mentor(mentor_data.dict())
    return mentor


# ==================== LIFE SKILLS ====================

@router.get("/lifeskills", response_model=AcademyLifeSkillsResponse)
async def get_lifeskills(
    tag: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200)
):
    """Get all life skills with optional tag filter (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    skills = await academy_db.get_lifeskills(tag=tag, limit=limit)
    return {"skills": skills, "total": len(skills)}


@router.get("/lifeskills/{skill_id}", response_model=AcademyLifeSkill)
async def get_lifeskill(skill_id: str):
    """Get a specific life skill by ID (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    skill = await academy_db.get_lifeskill_by_id(skill_id)
    
    if not course:
        raise HTTPException(status_code=404, detail="Life skill not found")
    
    return skill


@router.post("/lifeskills", response_model=AcademyLifeSkill)
async def create_lifeskill(
    skill_data: AcademyLifeSkillCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new life skill (requires authentication)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    
    skill = await academy_db.create_lifeskill(skill_data.dict())
    return skill


# ==================== HISTORY ====================

@router.get("/history", response_model=AcademyHistoryResponse)
async def get_history_lessons(
    theme: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200)
):
    """Get history lessons with optional theme filter (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    lessons = await academy_db.get_history_lessons(theme=theme, limit=limit)
    return {"lessons": lessons, "total": len(lessons)}


@router.get("/history/{lesson_id}", response_model=AcademyHistoryLesson)
async def get_history_lesson(lesson_id: str):
    """Get a specific history lesson by ID (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    lesson = await academy_db.get_history_lesson_by_id(lesson_id)
    
    if not lesson:
        raise HTTPException(status_code=404, detail="History lesson not found")
    
    return lesson


@router.post("/history", response_model=AcademyHistoryLesson)
async def create_history_lesson(
    lesson_data: AcademyHistoryLessonCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new history lesson (requires authentication)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    
    lesson = await academy_db.create_history_lesson(lesson_data.dict())
    return lesson


# ==================== OPPORTUNITIES ====================

@router.get("/opportunities", response_model=AcademyOpportunitiesResponse)
async def get_opportunities(
    type: Optional[str] = Query(None),
    upcoming: bool = Query(False),
    limit: int = Query(100, ge=1, le=200)
):
    """Get opportunities with optional filters (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    opportunities = await academy_db.get_opportunities(
        opportunity_type=type,
        upcoming_only=upcoming,
        limit=limit
    )
    return {"opportunities": opportunities, "total": len(opportunities)}


@router.get("/opportunities/{opportunity_id}", response_model=AcademyOpportunity)
async def get_opportunity(opportunity_id: str):
    """Get a specific opportunity by ID (public access)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    opportunity = await academy_db.get_opportunity_by_id(opportunity_id)
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    return opportunity


@router.post("/opportunities", response_model=AcademyOpportunity)
async def create_opportunity(
    opportunity_data: AcademyOpportunityCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new opportunity (requires authentication)"""
    db = get_db_client()
    academy_db = AcademyDB(db)
    
    opportunity = await academy_db.create_opportunity(opportunity_data.dict())
    return opportunity
