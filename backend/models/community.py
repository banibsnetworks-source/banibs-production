"""
BANIBS Community Life Hub - Data Models
Phase 11.6-11.9

Four Pillars:
- Health & Insurance Navigator
- Fitness & Wellness Network
- Culinary & Cultural Recipes Archive
- Alternative Schooling Hub
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


# ==================== SHARED ENUMS & BASE MODELS ====================

class CommunityPillar(str, Enum):
    """Community hub pillars"""
    HEALTH = "health"
    FITNESS = "fitness"
    FOOD = "food"
    SCHOOL = "school"


class DifficultyLevel(str, Enum):
    """Difficulty levels"""
    BEGINNER = "beginner"
    EASY = "easy"
    MODERATE = "moderate"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class CostRange(str, Enum):
    """Cost ranges"""
    FREE = "free"
    LOW = "$"
    MEDIUM = "$$"
    HIGH = "$$$"


# ==================== SHARED MODELS ====================

class CommunityTag(BaseModel):
    """Shared tag system across all pillars"""
    key: str
    label: str
    pillar: CommunityPillar
    
    class Config:
        json_schema_extra = {
            "example": {
                "key": "hypertension",
                "label": "Hypertension Friendly",
                "pillar": "health"
            }
        }


class CommunityPro(BaseModel):
    """Professional profile - doctors, trainers, chefs, tutors"""
    id: str
    user_id: str
    name: str
    role: str  # "doctor", "trainer", "chef", "tutor", "nutritionist"
    pillar_focus: List[str]  # ["health", "fitness"]
    bio: Optional[str] = None
    region: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "USA"
    online_only: bool = False
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    total_reviews: int = 0
    is_verified: bool = False
    specializations: List[str] = []
    languages: List[str] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "pro-001",
                "user_id": "user-001",
                "name": "Dr. Sarah Johnson",
                "role": "doctor",
                "pillar_focus": ["health"],
                "bio": "Primary care physician specializing in preventive care",
                "region": "Northeast",
                "online_only": True,
                "is_verified": True,
                "specializations": ["primary_care", "preventive_medicine"]
            }
        }


# ==================== HEALTH & INSURANCE MODELS ====================

class HealthResourceType(str, Enum):
    """Health resource categories"""
    INSURANCE_BASICS = "insurance_basics"
    CHRONIC_DISEASE = "chronic_disease"
    PREVENTIVE_CARE = "preventive_care"
    MENTAL_HEALTH = "mental_health"
    PRESCRIPTION_HELP = "prescription_help"
    CLAIM_ASSISTANCE = "claim_assistance"
    WELLNESS = "wellness"


class HealthResource(BaseModel):
    """Health education resource"""
    id: str
    title: str
    slug: str
    category: HealthResourceType
    level: str = "basic"  # "basic", "intermediate", "deep_dive"
    body_md: str
    summary: Optional[str] = None
    tags: List[str] = []
    region_focus: List[str] = []
    author: Optional[str] = None
    is_featured: bool = False
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "health-001",
                "title": "Understanding Your Deductible",
                "slug": "understanding-deductible",
                "category": "insurance_basics",
                "level": "basic",
                "body_md": "# What is a Deductible?\n\nA deductible is...",
                "tags": ["insurance", "basics", "deductible"]
            }
        }


class ProviderType(str, Enum):
    """Healthcare provider types"""
    PRIMARY_CARE = "primary_care"
    CLINIC = "clinic"
    MENTAL_HEALTH = "mental_health"
    DENTIST = "dentist"
    VISION = "vision"
    SPECIALIST = "specialist"
    HOSPITAL = "hospital"
    URGENT_CARE = "urgent_care"


class HealthProvider(BaseModel):
    """Healthcare provider listing"""
    id: str
    name: str
    type: ProviderType
    is_black_owned: bool = False
    cultural_competence_notes: Optional[str] = None
    address: Optional[str] = None
    city: str
    state: str
    zip_code: Optional[str] = None
    country: str = "USA"
    region: str
    telehealth: bool = False
    insurances_accepted: List[str] = []
    typical_price_range: CostRange
    contact_phone: Optional[str] = None
    contact_website: Optional[str] = None
    hours: Optional[str] = None
    specialties: List[str] = []
    languages: List[str] = []
    tags: List[str] = []
    rating: Optional[float] = None
    total_reviews: int = 0
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime


# ==================== FITNESS & WELLNESS MODELS ====================

class FitnessLevel(str, Enum):
    """Fitness difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    SENIOR = "senior"
    ADAPTIVE = "adaptive"


class FitnessProgram(BaseModel):
    """Fitness program or class"""
    id: str
    title: str
    description: str
    level: FitnessLevel
    focus: List[str]  # "weight_loss", "strength", "mobility", "cardio"
    delivery: str  # "video", "live_online", "in_person", "hybrid"
    duration_weeks: Optional[int] = None
    sessions_per_week: Optional[int] = None
    session_duration_minutes: Optional[int] = None
    equipment_needed: List[str] = []
    chronic_friendly: List[str] = []  # "diabetes", "arthritis", "heart_disease"
    intensity: str = "moderate"  # "low", "moderate", "high"
    coach_id: Optional[str] = None
    coach_name: Optional[str] = None
    price: Optional[float] = None
    cost_range: CostRange = CostRange.FREE
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False
    participants_count: int = 0
    rating: Optional[float] = None
    created_at: datetime
    updated_at: datetime


# ==================== CULINARY & CULTURAL MODELS ====================

class RecipeCategory(str, Enum):
    """Recipe categories"""
    MAIN = "main"
    SIDE = "side"
    DESSERT = "dessert"
    BREAKFAST = "breakfast"
    SNACK = "snack"
    DRINK = "drink"
    SAUCE = "sauce"


class Recipe(BaseModel):
    """Recipe with traditional and healthier versions"""
    id: str
    title: str
    slug: str
    origin_region: str  # "Deep South", "Caribbean", "West Africa", etc.
    category: RecipeCategory
    difficulty: DifficultyLevel
    traditional_instructions_md: str
    healthier_version_md: Optional[str] = None
    ingredients_traditional: List[str] = []
    ingredients_healthier: Optional[List[str]] = None
    cook_time_minutes: int
    prep_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    nutrition_level: str = "medium"  # "light", "medium", "heavy"
    dietary_notes: List[str] = []  # "high_sodium", "high_sugar", "low_carb", etc.
    is_family_submitted: bool = False
    submitted_by_user_id: Optional[str] = None
    submitted_by_name: Optional[str] = None
    chef_id: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False
    is_approved: bool = True
    view_count: int = 0
    saved_count: int = 0
    rating: Optional[float] = None
    created_at: datetime
    updated_at: datetime


# ==================== ALTERNATIVE SCHOOLING MODELS ====================

class SchoolResourceType(str, Enum):
    """School resource types"""
    CURRICULUM = "curriculum"
    PROGRAM = "program"
    TUTOR = "tutor"
    CO_OP = "co_op"
    TOOL = "tool"
    GUIDE = "guide"


class SchoolResource(BaseModel):
    """Alternative schooling resource"""
    id: str
    title: str
    slug: str
    type: SchoolResourceType
    subject: List[str]  # "math", "black_history", "finance", "science", etc.
    age_range: str  # "K-5", "6-8", "9-12", "All Ages"
    format: str  # "online", "in_person", "hybrid", "self_paced"
    description: str
    region: Optional[str] = None
    provider_name: str
    contact_website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    cost_range: CostRange
    is_accredited: bool = False
    grade_levels: List[str] = []
    learning_style: List[str] = []  # "visual", "hands_on", "project_based"
    tags: List[str] = []
    is_verified: bool = False
    is_featured: bool = False
    rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime
    updated_at: datetime


# ==================== REQUEST/CREATE MODELS ====================

class HealthResourceCreate(BaseModel):
    """Create health resource"""
    title: str
    category: HealthResourceType
    body_md: str
    summary: Optional[str] = None
    tags: List[str] = []


class RecipeCreate(BaseModel):
    """Create recipe (user submission)"""
    title: str
    origin_region: str
    category: RecipeCategory
    difficulty: DifficultyLevel
    traditional_instructions_md: str
    healthier_version_md: Optional[str] = None
    ingredients_traditional: List[str]
    ingredients_healthier: Optional[List[str]] = None
    cook_time_minutes: int
    tags: List[str] = []


# ==================== RESPONSE MODELS ====================

class HealthResourcesResponse(BaseModel):
    """Health resources list response"""
    resources: List[HealthResource]
    total: int


class HealthProvidersResponse(BaseModel):
    """Health providers list response"""
    providers: List[HealthProvider]
    total: int


class FitnessProgramsResponse(BaseModel):
    """Fitness programs list response"""
    programs: List[FitnessProgram]
    total: int


class RecipesResponse(BaseModel):
    """Recipes list response"""
    recipes: List[Recipe]
    total: int


class SchoolResourcesResponse(BaseModel):
    """School resources list response"""
    resources: List[SchoolResource]
    total: int


class CommunityProsResponse(BaseModel):
    """Community pros list response"""
    pros: List[CommunityPro]
    total: int
