from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime

from models.application_record import (
    ApplicationRecordPublic,
    ApplicationCreate,
    ApplicationStatusUpdate
)
from db.opportunities.application_records import (
    create_application,
    get_application_by_id,
    get_applications_for_job,
    get_applications_for_candidate,
    update_application_status,
    check_duplicate_application
)
from db.opportunities.candidate_profiles import (
    get_candidate_profile_by_user_id,
    increment_candidate_applications
)
from db.opportunities.job_listings import (
    get_job_listing_by_id,
    increment_job_applications
)
from db.opportunities.employer_profiles import get_employer_profile_by_id
from db.opportunities.recruiter_profiles import (
    get_recruiter_profile_by_user_id,
    increment_recruiter_stats
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/applications", tags=["applications"])


# Helper function for candidate applications
async def _get_candidate_applications_logic(
    current_user: dict,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """
    Shared logic for getting candidate applications
    """
    # Get candidate profile
    candidate = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not candidate:
        return {
            "applications": [],
            "page": page,
            "limit": limit,
            "total": 0,
            "pages": 0
        }
    
    # Get applications
    skip = (page - 1) * limit
    applications, total = await get_applications_for_candidate(
        candidate["id"],
        status=status,
        skip=skip,
        limit=limit
    )
    
    # Enrich with job and employer details
    enriched_apps = []
    for app in applications:
        job = await get_job_listing_by_id(app["job_id"])
        if job:
            app["job_title"] = job.get("title")
            app["job_location"] = job.get("location")
            employer = await get_employer_profile_by_id(job["employer_id"])
            if employer:
                app["employer_name"] = employer.get("organization_name")
        enriched_apps.append(ApplicationRecordPublic(**app))
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "applications": enriched_apps,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages
    }


# IMPORTANT: Specific routes must come before generic ones in FastAPI
@router.get("/mine", response_model=dict)
async def get_my_applications_mine(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get authenticated user's job applications (candidate view)
    """
    return await _get_candidate_applications_logic(current_user, status, page, limit)


@router.get("/my-applications", response_model=dict)
async def get_my_applications(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get authenticated user's job applications (legacy endpoint)
    """
    return await _get_candidate_applications_logic(current_user, status, page, limit)


@router.post("", response_model=ApplicationRecordPublic, status_code=201)
async def submit_application(
    application_data: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a job application
    
    Requires authenticated user.
    Creates or requires a candidate profile.
    """
    # Get or create candidate profile
    candidate = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not candidate:
        raise HTTPException(
            status_code=400,
            detail="Please create a candidate profile before applying to jobs"
        )
    
    # Verify job exists and is approved
    job = await get_job_listing_by_id(application_data.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.get("status") != "approved":
        raise HTTPException(
            status_code=400,
            detail="Cannot apply to this job (not approved)"
        )
    
    # Check for duplicate application
    is_duplicate = await check_duplicate_application(
        application_data.job_id,
        candidate["id"]
    )
    
    if is_duplicate:
        raise HTTPException(
            status_code=400,
            detail="You have already applied to this job"
        )
    
    # Create application
    app_dict = application_data.dict()
    app_dict["candidate_id"] = candidate["id"]
    app_dict["status"] = "submitted"
    
    application = await create_application(app_dict)
    
    # Increment counters
    await increment_candidate_applications(candidate["id"])
    await increment_job_applications(job["id"])
    
    # Increment recruiter stats
    if job.get("posted_by_recruiter_id"):
        await increment_recruiter_stats(
            job["posted_by_recruiter_id"],
            applications=1
        )
    
    # TODO: Send notification to recruiter (Phase 7.1 integration)
    
    # Enrich response with job details
    application["job_title"] = job.get("title")
    employer = await get_employer_profile_by_id(job["employer_id"])
    if employer:
        application["employer_name"] = employer.get("organization_name")
    
    return ApplicationRecordPublic(**application)


@router.get("", response_model=dict)
async def get_applications_for_my_jobs(
    current_user: dict = Depends(get_current_user),
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get applications for jobs posted by authenticated recruiter
    
    Requires: verified_recruiter role
    """
    # Check if user has recruiter role
    roles = current_user.get("roles", [])
    if "verified_recruiter" not in roles and "super_admin" not in roles:
        raise HTTPException(
            status_code=403,
            detail="Must be a verified recruiter to view applications"
        )
    
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    if not job_id:
        raise HTTPException(
            status_code=400,
            detail="job_id query parameter is required"
        )
    
    # Verify job belongs to this recruiter
    job = await get_job_listing_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if "super_admin" not in roles:
        if job.get("posted_by_recruiter_id") != recruiter["id"]:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view applications for this job"
            )
    
    # Get applications
    skip = (page - 1) * limit
    applications, total = await get_applications_for_job(
        job_id,
        status=status,
        skip=skip,
        limit=limit
    )
    
    # Enrich with candidate details
    enriched_apps = []
    for app in applications:
        # Include candidate info for recruiter view
        enriched_apps.append(app)
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "applications": enriched_apps,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages
    }


@router.get("/{application_id}", response_model=dict)
async def get_application_detail(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get application details
    
    Can be viewed by:
    - The candidate who submitted it
    - The recruiter who posted the job
    - Super admin
    """
    application = await get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check authorization
    candidate = await get_candidate_profile_by_user_id(current_user["id"])
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    
    is_candidate = candidate and candidate["id"] == application["candidate_id"]
    
    is_recruiter = False
    if recruiter:
        job = await get_job_listing_by_id(application["job_id"])
        if job:
            is_recruiter = job.get("posted_by_recruiter_id") == recruiter["id"]
    
    is_admin = "super_admin" in current_user.get("roles", [])
    
    if not (is_candidate or is_recruiter or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this application"
        )
    
    # Enrich with job details
    job = await get_job_listing_by_id(application["job_id"])
    if job:
        application["job_title"] = job.get("title")
        employer = await get_employer_profile_by_id(job["employer_id"])
        if employer:
            application["employer_name"] = employer.get("organization_name")
    
    return application


@router.patch("/{application_id}/status", response_model=dict)
async def update_application_status_endpoint(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update application status
    
    Requires: verified_recruiter role
    Only the recruiter who posted the job can update status
    """
    # Check if user has recruiter role
    roles = current_user.get("roles", [])
    if "verified_recruiter" not in roles and "super_admin" not in roles:
        raise HTTPException(
            status_code=403,
            detail="Must be a verified recruiter to update application status"
        )
    
    # Get application
    application = await get_application_by_id(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Verify job belongs to this recruiter
    job = await get_job_listing_by_id(application["job_id"])
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if "super_admin" not in roles:
        if job.get("posted_by_recruiter_id") != recruiter["id"]:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update this application"
            )
    
    # Update status
    updated_application = await update_application_status(
        application_id,
        status_update.status,
        recruiter_id=recruiter["id"],
        notes=status_update.recruiter_notes
    )
    
    # TODO: Send notification to candidate (Phase 7.1 integration)
    
    return updated_application
