"""
BANIBS Academy - Data Models
Phase 13.0 - Educating a Generation Built on Legacy, Wealth, Knowledge & Power
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class CourseLevel(str, Enum):
    """Course difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseCategory(str, Enum):
    """Course categories"""
    FINANCE = "finance"
    TECH = "tech"
    WELLNESS = "wellness"
    HISTORY = "history"
    PROFESSIONALISM = "professionalism"
    ENTREPRENEURSHIP = "entrepreneurship"
    CREATIVE = "creative"


class OpportunityType(str, Enum):
    """Types of opportunities"""
    SCHOLARSHIP = "scholarship"
    INTERNSHIP = "internship"
    APPRENTICESHIP = "apprenticeship"
    GRANT = "grant"


class AcademyCourse(BaseModel):
    """Academy course model"""
    id: str
    title: str
    description: str
    level: CourseLevel
    category: CourseCategory
    modules: List[str] = []
    estimated_hours: int
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "course-001",
                "title": "Black Wealth 101",
                "description": "Learn the fundamentals of building generational wealth",
                "level": "beginner",
                "category": "finance",
                "modules": ["Introduction to Wealth", "Saving Strategies", "Investment Basics"],
                "estimated_hours": 10,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class AcademyCourseCreate(BaseModel):
    """Request model for creating a course"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    level: CourseLevel
    category: CourseCategory
    modules: List[str] = []
    estimated_hours: int = Field(..., gt=0, le=500)


class AcademyMentor(BaseModel):
    """Academy mentor model"""
    id: str
    name: str
    bio: str
    expertise: List[str]
    country: str
    city: str
    contact_methods: Dict[str, str] = {}
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "mentor-001",
                "name": "Kwame Osei",
                "bio": "Senior Software Engineer with 10 years of experience",
                "expertise": ["Coding", "Web Development", "Career Guidance"],
                "country": "Ghana",
                "city": "Accra",
                "contact_methods": {
                    "email": "kwame@example.com",
                    "linkedin": "linkedin.com/in/kwameosei"
                },
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class AcademyMentorCreate(BaseModel):
    """Request model for mentor application"""
    name: str = Field(..., min_length=1, max_length=100)
    bio: str = Field(..., min_length=1, max_length=1000)
    expertise: List[str] = Field(..., min_items=1)
    country: str = Field(..., min_length=1, max_length=100)
    city: str = Field(..., min_length=1, max_length=100)
    contact_methods: Dict[str, str] = {}


class AcademyLifeSkill(BaseModel):
    """Academy life skill model"""
    id: str
    title: str
    content: str
    tags: List[str] = []
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "skill-001",
                "title": "How to Budget",
                "content": "A comprehensive guide to personal budgeting...",
                "tags": ["financial literacy", "money management"],
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class AcademyLifeSkillCreate(BaseModel):
    """Request model for creating a life skill"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    tags: List[str] = []


class AcademyHistoryLesson(BaseModel):
    """Academy history lesson model"""
    id: str
    title: str
    theme: str
    content: str
    media_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "history-001",
                "title": "The Mali Empire",
                "theme": "african empires",
                "content": "The Mali Empire was one of the wealthiest civilizations...",
                "media_url": "https://example.com/mali-map.jpg",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class AcademyHistoryLessonCreate(BaseModel):
    """Request model for creating a history lesson"""
    title: str = Field(..., min_length=1, max_length=200)
    theme: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    media_url: Optional[str] = None


class AcademyOpportunity(BaseModel):
    """Academy opportunity model"""
    id: str
    title: str
    description: str
    type: OpportunityType
    deadline: Optional[datetime] = None
    organization: str
    link: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "opp-001",
                "title": "$5,000 STEM Scholarship",
                "description": "Annual scholarship for Black students in STEM fields",
                "type": "scholarship",
                "deadline": "2024-12-31T23:59:59Z",
                "organization": "BANIBS Foundation",
                "link": "https://banibs.com/apply",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class AcademyOpportunityCreate(BaseModel):
    """Request model for creating an opportunity"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    type: OpportunityType
    deadline: Optional[datetime] = None
    organization: str = Field(..., min_length=1, max_length=200)
    link: str = Field(..., min_length=1, max_length=500)


# Response models
class AcademyCoursesResponse(BaseModel):
    """Response model for listing courses"""
    courses: List[AcademyCourse]
    total: int


class AcademyMentorsResponse(BaseModel):
    """Response model for listing mentors"""
    mentors: List[AcademyMentor]
    total: int


class AcademyLifeSkillsResponse(BaseModel):
    """Response model for listing life skills"""
    skills: List[AcademyLifeSkill]
    total: int


class AcademyHistoryResponse(BaseModel):
    """Response model for listing history lessons"""
    lessons: List[AcademyHistoryLesson]
    total: int


class AcademyOpportunitiesResponse(BaseModel):
    """Response model for listing opportunities"""
    opportunities: List[AcademyOpportunity]
    total: int
