"""
BANIBS Ability Network - Data Models
Phase 11.5

Standalone portal for disability support, neurodiversity, caregivers, and accessibility services.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class ResourceCategory(str, Enum):
    """Ability resource categories"""
    ASSISTIVE_TECH = "assistive_tech"
    LEGAL_RIGHTS = "legal_rights"
    CAREGIVER_SUPPORT = "caregiver_support"
    NEURODIVERSITY = "neurodiversity"
    GOVERNMENT_PROGRAMS = "government_programs"
    ACCESSIBILITY_TOOLS = "accessibility_tools"
    HOME_MODIFICATION = "home_modification"
    FINANCIAL_AID = "financial_aid"
    EDUCATION = "education"
    EMPLOYMENT = "employment"


class DisabilityType(str, Enum):
    """Disability types for filtering"""
    PHYSICAL = "physical"
    VISUAL = "visual"
    HEARING = "hearing"
    COGNITIVE = "cognitive"
    NEURODIVERGENT = "neurodivergent"
    CHRONIC_CONDITION = "chronic_condition"
    MENTAL_HEALTH = "mental_health"
    MULTIPLE = "multiple"
    ALL = "all"


class AgeGroup(str, Enum):
    """Age groups"""
    CHILDREN = "children"  # 0-12
    TEENS = "teens"  # 13-17
    YOUNG_ADULTS = "young_adults"  # 18-30
    ADULTS = "adults"  # 31-64
    SENIORS = "seniors"  # 65+
    ALL_AGES = "all_ages"


class CostRange(str, Enum):
    """Cost ranges"""
    FREE = "free"
    LOW = "$"
    MODERATE = "$$"
    HIGH = "$$$"
    VARIES = "varies"


class ResourceFormat(str, Enum):
    """Resource format types"""
    GUIDE = "guide"
    TOOL = "tool"
    SERVICE = "service"
    PROGRAM = "program"
    DIRECTORY = "directory"
    SUPPORT_GROUP = "support_group"
    LEGAL_DOC = "legal_doc"
    TRAINING = "training"


# ==================== MODELS ====================

class AbilityResource(BaseModel):
    """Ability Network resource - Phase 11.5.1"""
    id: str
    title: str
    slug: str
    category: ResourceCategory
    disability_types: List[DisabilityType]
    age_groups: List[AgeGroup]
    format: ResourceFormat
    description: str
    detailed_content: Optional[str] = None  # Markdown content
    provider_name: str
    provider_organization: Optional[str] = None
    contact_website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    region: Optional[str] = None  # Geographic availability
    cost_range: CostRange = CostRange.FREE
    languages_available: List[str] = ["English"]
    accessibility_features: List[str] = []  # "screen_reader", "sign_language", etc.
    tags: List[str] = []
    is_verified: bool = False
    is_featured: bool = False
    is_government_program: bool = False
    is_user_submitted: bool = False
    submitted_by_user_id: Optional[str] = None
    submitted_by_name: Optional[str] = None
    is_approved: bool = True
    view_count: int = 0
    helpful_count: int = 0
    created_at: datetime
    updated_at: datetime


class AbilityResourcesResponse(BaseModel):
    """Response for ability resources list"""
    resources: List[AbilityResource]
    total: int


# ==================== PROVIDER MODELS (Phase 11.5.2) ====================

class ProviderType(str, Enum):
    """Provider types"""
    SPECIALIST = "specialist"
    THERAPIST = "therapist"
    ADVOCATE = "advocate"
    CASE_MANAGER = "case_manager"
    HOME_CARE = "home_care"
    ACCESSIBILITY_CONSULTANT = "accessibility_consultant"
    COACH = "coach"
    EDUCATOR = "educator"


class AbilityProvider(BaseModel):
    """Ability service provider - Phase 11.5.2"""
    id: str
    name: str
    provider_type: ProviderType
    specializations: List[str]  # Specific areas of expertise
    disability_types_served: List[DisabilityType]
    age_groups_served: List[AgeGroup]
    credentials: List[str] = []
    bio: str
    organization: Optional[str] = None
    region: str
    city: Optional[str] = None
    state: Optional[str] = None
    telehealth_available: bool = False
    in_person_available: bool = True
    languages: List[str] = ["English"]
    accepts_insurance: bool = False
    insurance_accepted: List[str] = []
    cost_range: CostRange
    contact_website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    availability: Optional[str] = None
    is_verified: bool = False
    is_black_owned: bool = False
    rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime
    updated_at: datetime


class AbilityProvidersResponse(BaseModel):
    """Response for ability providers list"""
    providers: List[AbilityProvider]
    total: int
