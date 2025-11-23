"""
BANIBS Community Life Hub - API Routes
Phase 11.6-11.9

Base path: /api/community/*
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List

from models.community import (
    HealthResourcesResponse,
    HealthProvidersResponse,
    FitnessProgramsResponse,
    RecipesResponse,
    SchoolResourcesResponse,
    CommunityProsResponse,
    HealthResource,
    HealthProvider,
    FitnessProgram,
    Recipe,
    SchoolResource,
    CommunityPro
)
from db.community import CommunityDB
from db.connection import get_db_client


router = APIRouter(prefix="/api/community", tags=["Community Life Hub"])


# ==================== SHARED ENDPOINTS ====================

@router.get("/pros", response_model=CommunityProsResponse)
async def get_community_pros(
    pillar: Optional[str] = None,
    role: Optional[str] = None,
    region: Optional[str] = None,
    verified_only: bool = False
):
    """Get community professionals across all pillars"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    pros = await community_db.get_all_pros(
        pillar=pillar,
        role=role,
        region=region,
        verified_only=verified_only
    )
    
    return {
        "pros": pros,
        "total": len(pros)
    }


# ==================== HEALTH & INSURANCE ENDPOINTS ====================

@router.get("/health/resources", response_model=HealthResourcesResponse)
async def get_health_resources(
    category: Optional[str] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100)
):
    """Get health education resources"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    tags_list = tags.split(",") if tags else None
    
    resources = await community_db.get_health_resources(
        category=category,
        tags=tags_list,
        limit=limit
    )
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/health/resources/{slug}", response_model=HealthResource)
async def get_health_resource(slug: str):
    """Get a specific health resource by slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    resource = await community_db.get_health_resource_by_slug(slug)
    
    if not resource:
        raise HTTPException(status_code=404, detail="Health resource not found")
    
    return resource


@router.get("/health/providers", response_model=HealthProvidersResponse)
async def get_health_providers(
    type: Optional[str] = None,
    service_types: Optional[str] = Query(None, description="Comma-separated service types"),
    region: Optional[str] = None,
    city: Optional[str] = None,
    telehealth: Optional[bool] = None,
    black_owned: Optional[bool] = None,
    accepts_uninsured: Optional[bool] = None,
    sliding_scale: Optional[bool] = None,
    ability_friendly: Optional[bool] = None,
    limit: int = Query(50, le=100)
):
    """Get healthcare providers - Phase 11.6.1 enhanced filters"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    service_types_list = service_types.split(",") if service_types else None
    
    providers = await community_db.get_health_providers(
        type=type,
        service_types=service_types_list,
        region=region,
        city=city,
        telehealth=telehealth,
        black_owned=black_owned,
        accepts_uninsured=accepts_uninsured,
        sliding_scale=sliding_scale,
        ability_friendly=ability_friendly,
        limit=limit
    )
    
    return {
        "providers": providers,
        "total": len(providers)
    }


@router.get("/health/providers/{provider_id}", response_model=HealthProvider)
async def get_health_provider_detail(provider_id: str):
    """Get a specific healthcare provider by ID or slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Try by ID first, then by slug
    provider = await community_db.get_health_provider_by_id(provider_id)
    if not provider:
        provider = await community_db.get_health_provider_by_slug(provider_id)
    
    if not provider:
        raise HTTPException(status_code=404, detail="Healthcare provider not found")
    
    return provider


# ==================== FITNESS & WELLNESS ENDPOINTS ====================

@router.get("/fitness/programs", response_model=FitnessProgramsResponse)
async def get_fitness_programs(
    level: Optional[str] = None,
    focus: Optional[str] = Query(None, description="Comma-separated focus areas"),
    delivery: Optional[str] = None,
    chronic_friendly: Optional[str] = Query(None, description="Comma-separated conditions"),
    limit: int = Query(50, le=100)
):
    """Get fitness programs and classes"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    focus_list = focus.split(",") if focus else None
    chronic_list = chronic_friendly.split(",") if chronic_friendly else None
    
    programs = await community_db.get_fitness_programs(
        level=level,
        focus=focus_list,
        delivery=delivery,
        chronic_friendly=chronic_list,
        limit=limit
    )
    
    return {
        "programs": programs,
        "total": len(programs)
    }


@router.get("/fitness/programs/{program_id}", response_model=FitnessProgram)
async def get_fitness_program(program_id: str):
    """Get a specific fitness program by ID or slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Try by ID first, then by slug
    program = await community_db.get_fitness_program_by_id(program_id)
    if not program:
        program = await community_db.get_fitness_program_by_slug(program_id)
    
    if not program:
        raise HTTPException(status_code=404, detail="Fitness program not found")
    
    return program


@router.get("/fitness/coaches", response_model=CommunityProsResponse)
async def get_fitness_coaches(
    region: Optional[str] = None,
    specialization: Optional[str] = None,
    online_only: Optional[bool] = None
):
    """Get fitness coaches and trainers - Phase 11.6.2"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    coaches = await community_db.get_fitness_coaches(
        region=region,
        specialization=specialization,
        online_only=online_only
    )
    
    return {
        "pros": coaches,
        "total": len(coaches)
    }


@router.get("/fitness/coaches/{coach_id}", response_model=CommunityPro)
async def get_fitness_coach_detail(coach_id: str):
    """Get a specific fitness coach detail"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Get coach from pros collection
    coach = await community_db.pros.find_one({"id": coach_id}, {"_id": 0})
    
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    return coach


@router.post("/fitness/programs/{program_id}/enroll")
async def enroll_in_program(
    program_id: str, 
    request: Request,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Enroll in a fitness program - Phase 11.6.2 (P1)"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Verify program exists
    program = await community_db.fitness_programs.find_one(
        {"$or": [{"id": program_id}, {"slug": program_id}]}, 
        {"_id": 0}
    )
    
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Check if already enrolled
    existing = await community_db.program_enrollments.find_one({
        "user_id": current_user["id"],
        "program_id": program["id"]
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this program")
    
    # Create enrollment record
    enrollment = {
        "id": f"enroll-{uuid4().hex[:8]}",
        "program_id": program["id"],
        "user_id": current_user["id"],
        "user_name": current_user.get("name", ""),
        "user_email": current_user.get("email", ""),
        "status": "enrolled",
        "enrolled_at": datetime.now(timezone.utc),
        "progress": 0,
        "notes": None
    }
    
    await community_db.program_enrollments.insert_one(enrollment)
    
    # Increment participant count on program
    await community_db.fitness_programs.update_one(
        {"id": program["id"]},
        {"$inc": {"participants_count": 1}}
    )
    
    return {
        "success": True,
        "message": "Successfully enrolled in program",
        "enrollment_id": enrollment["id"]
    }


# ==================== FOOD & CULTURE ENDPOINTS ====================

@router.get("/food/recipes", response_model=RecipesResponse)
async def get_recipes(
    category: Optional[str] = None,
    origin_region: Optional[str] = None,
    difficulty: Optional[str] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100)
):
    """Get culinary recipes"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    tags_list = tags.split(",") if tags else None
    
    recipes = await community_db.get_recipes(
        category=category,
        origin_region=origin_region,
        difficulty=difficulty,
        tags=tags_list,
        approved_only=True,
        limit=limit
    )
    
    return {
        "recipes": recipes,
        "total": len(recipes)
    }


@router.get("/food/recipes/{slug}", response_model=Recipe)
async def get_recipe(slug: str):
    """Get a specific recipe by slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    recipe = await community_db.get_recipe_by_slug(slug)
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return recipe


# ==================== ALTERNATIVE SCHOOLING ENDPOINTS ====================

@router.get("/school/resources", response_model=SchoolResourcesResponse)
async def get_school_resources(
    type: Optional[str] = None,
    subject: Optional[str] = Query(None, description="Comma-separated subjects"),
    age_range: Optional[str] = None,
    format: Optional[str] = None,
    cost_range: Optional[str] = None,
    verified_only: bool = False,
    limit: int = Query(50, le=100)
):
    """Get alternative schooling resources"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    subject_list = subject.split(",") if subject else None
    
    resources = await community_db.get_school_resources(
        type=type,
        subject=subject_list,
        age_range=age_range,
        format=format,
        cost_range=cost_range,
        verified_only=verified_only,
        limit=limit
    )
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/school/resources/{slug}", response_model=SchoolResource)
async def get_school_resource(slug: str):
    """Get a specific school resource by slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    resource = await community_db.get_school_resource_by_slug(slug)
    
    if not resource:
        raise HTTPException(status_code=404, detail="School resource not found")
    
    return resource
