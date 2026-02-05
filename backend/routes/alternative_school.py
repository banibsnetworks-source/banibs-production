"""
Alternative School Hub - API Routes
Phase-0 Scaffold: Admin CRUD + Public read-only endpoints

Public endpoints:
- GET /api/alt-school/hub - Combined hub data for display

Admin endpoints (super_admin only):
- CRUD for tutors, programs, resources
- POST /api/alt-school/seed - Seed initial data
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from models.alternative_school import (
    TutorListingCreate, TutorListingUpdate, TutorListing,
    ProgramCategoryCreate, ProgramCategoryUpdate, ProgramCategory,
    LearningResourceCreate, LearningResourceUpdate, LearningResource,
    TutorListingsResponse, ProgramCategoriesResponse, LearningResourcesResponse,
    AlternativeSchoolHubResponse
)
from db import alternative_school as db_alt_school
from middleware.auth_guard import require_role


router = APIRouter(prefix="/api/alt-school", tags=["Alternative School Hub"])


# ==========================================
# PUBLIC ENDPOINTS (Read-only)
# ==========================================

@router.get("/hub", response_model=AlternativeSchoolHubResponse)
async def get_hub_data():
    """
    Get all Alternative School Hub data for public display.
    Returns tutors, programs, and resources with founding/developing status.
    """
    data = await db_alt_school.get_hub_data()
    return data


@router.get("/tutors", response_model=TutorListingsResponse)
async def get_tutors(
    status: Optional[str] = Query(None, description="Filter by status: founding, developing, future"),
    limit: int = Query(100, ge=1, le=500)
):
    """Get all tutor listings (public)"""
    tutors = await db_alt_school.get_all_tutors(status, limit)
    return {"tutors": tutors, "count": len(tutors)}


@router.get("/programs", response_model=ProgramCategoriesResponse)
async def get_programs(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500)
):
    """Get all program categories (public)"""
    programs = await db_alt_school.get_all_programs(status, limit)
    return {"programs": programs, "count": len(programs)}


@router.get("/resources", response_model=LearningResourcesResponse)
async def get_resources(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=500)
):
    """Get all learning resources (public)"""
    resources = await db_alt_school.get_all_resources(status, category, limit)
    return {"resources": resources, "count": len(resources)}


# ==========================================
# ADMIN ENDPOINTS - TUTORS
# ==========================================

@router.post("/admin/tutors", response_model=TutorListing, status_code=status.HTTP_201_CREATED)
async def create_tutor(
    data: TutorListingCreate,
    current_user=Depends(require_role("super_admin"))
):
    """Create a new tutor listing (admin only)"""
    tutor = await db_alt_school.create_tutor(data.model_dump())
    return tutor


@router.put("/admin/tutors/{tutor_id}", response_model=TutorListing)
async def update_tutor(
    tutor_id: str,
    data: TutorListingUpdate,
    current_user=Depends(require_role("super_admin"))
):
    """Update a tutor listing (admin only)"""
    existing = await db_alt_school.get_tutor_by_id(tutor_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    updated = await db_alt_school.update_tutor(tutor_id, data.model_dump(exclude_unset=True))
    return updated


@router.delete("/admin/tutors/{tutor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tutor(
    tutor_id: str,
    current_user=Depends(require_role("super_admin"))
):
    """Delete a tutor listing (admin only)"""
    deleted = await db_alt_school.delete_tutor(tutor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tutor not found")


# ==========================================
# ADMIN ENDPOINTS - PROGRAMS
# ==========================================

@router.post("/admin/programs", response_model=ProgramCategory, status_code=status.HTTP_201_CREATED)
async def create_program(
    data: ProgramCategoryCreate,
    current_user=Depends(require_role("super_admin"))
):
    """Create a new program category (admin only)"""
    program = await db_alt_school.create_program(data.model_dump())
    return program


@router.put("/admin/programs/{program_id}", response_model=ProgramCategory)
async def update_program(
    program_id: str,
    data: ProgramCategoryUpdate,
    current_user=Depends(require_role("super_admin"))
):
    """Update a program category (admin only)"""
    existing = await db_alt_school.get_program_by_id(program_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Program not found")
    
    updated = await db_alt_school.update_program(program_id, data.model_dump(exclude_unset=True))
    return updated


@router.delete("/admin/programs/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(
    program_id: str,
    current_user=Depends(require_role("super_admin"))
):
    """Delete a program category (admin only)"""
    deleted = await db_alt_school.delete_program(program_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Program not found")


# ==========================================
# ADMIN ENDPOINTS - RESOURCES
# ==========================================

@router.post("/admin/resources", response_model=LearningResource, status_code=status.HTTP_201_CREATED)
async def create_resource(
    data: LearningResourceCreate,
    current_user=Depends(require_role("super_admin"))
):
    """Create a new learning resource (admin only)"""
    resource = await db_alt_school.create_resource(data.model_dump())
    return resource


@router.put("/admin/resources/{resource_id}", response_model=LearningResource)
async def update_resource(
    resource_id: str,
    data: LearningResourceUpdate,
    current_user=Depends(require_role("super_admin"))
):
    """Update a learning resource (admin only)"""
    existing = await db_alt_school.get_resource_by_id(resource_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    updated = await db_alt_school.update_resource(resource_id, data.model_dump(exclude_unset=True))
    return updated


@router.delete("/admin/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    current_user=Depends(require_role("super_admin"))
):
    """Delete a learning resource (admin only)"""
    deleted = await db_alt_school.delete_resource(resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")


# ==========================================
# ADMIN UTILITY ENDPOINTS
# ==========================================

@router.post("/admin/seed")
async def seed_data(
    current_user=Depends(require_role("super_admin"))
):
    """
    Seed initial Alternative School Hub data (admin only).
    Idempotent - will not duplicate if already seeded.
    """
    result = await db_alt_school.seed_initial_data()
    return result
