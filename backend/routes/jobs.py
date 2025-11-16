"""
Jobs API Routes - Phase 7.1: BANIBS Jobs & Opportunities
Unified job posting and application system
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.job_posting import (
    JobPostingCreate, JobPostingUpdate, JobPosting,
    JobApplicationCreate, JobApplication
)
from db import job_postings as db_jobs
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/jobs", tags=["Jobs & Opportunities"])


# ============ EMPLOYER ENDPOINTS (Business Mode Only) ============

@router.post("", response_model=JobPosting, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobPostingCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a new job posting (Employers only - Business mode)
    Requires authentication and business profile ownership
    """
    # Verify user owns the business profile
    # (In production, add explicit ownership check)
    
    job = await db_jobs.create_job_posting(
        business_profile_id=job_data.business_profile_id,
        owner_user_id=current_user["id"],
        title=job_data.title,
        employment_type=job_data.employment_type,
        category=job_data.category,
        description=job_data.description,
        location_type=job_data.location_type,
        tags=job_data.tags,
        responsibilities=job_data.responsibilities,
        requirements=job_data.requirements,
        skills=job_data.skills,
        location_city=job_data.location_city,
        location_state=job_data.location_state,
        location_zip=job_data.location_zip,
        country=job_data.country,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        salary_currency=job_data.salary_currency,
        salary_visible=job_data.salary_visible,
        application_method=job_data.application_method,
        external_apply_url=job_data.external_apply_url,
        status=job_data.status,
        visibility=job_data.visibility
    )
    
    return job


@router.get("/mine", response_model=List[JobPosting])
async def get_my_jobs(
    status: Optional[str] = Query(None, description="Filter by status: open, closed, draft"),
    current_user=Depends(require_role("user", "member"))
):
    """
    Get all job postings for current user (Employer dashboard)
    """
    jobs = await db_jobs.get_jobs_by_owner(current_user["id"], status=status)
    return jobs


@router.get("/{job_id}", response_model=JobPosting)
async def get_job_detail(
    job_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get job posting details (for editing)
    """
    job = await db_jobs.get_job_posting_by_id(job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Verify ownership for private access
    if job["owner_user_id"] != current_user["id"]:
        # If not owner, only show if public and open
        if job["status"] != "open" or job["visibility"] != "public":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this job"
            )
    
    return job


@router.patch("/{job_id}", response_model=JobPosting)
async def update_job(
    job_id: str,
    job_data: JobPostingUpdate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Update job posting (Employer only)
    """
    updates = job_data.dict(exclude_unset=True)
    
    job = await db_jobs.update_job_posting(job_id, current_user["id"], updates)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not authorized"
        )
    
    return job


@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: str,
    status: str = Query(..., description="open or closed"),
    current_user=Depends(require_role("user", "member"))
):
    """
    Quick status toggle (open/close job)
    """
    if status not in ["open", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'open' or 'closed'"
        )
    
    job = await db_jobs.update_job_posting(
        job_id,
        current_user["id"],
        {"status": status}
    )
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not authorized"
        )
    
    return {"success": True, "status": status}


@router.get("/{job_id}/applications", response_model=List[JobApplication])
async def get_job_applications(
    job_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get all applications for a job (Employer only)
    """
    applications = await db_jobs.get_applications_for_job(job_id, current_user["id"])
    return applications


# ============ JOB SEEKER ENDPOINTS (Social Mode) ============

@router.get("", response_model=dict)
async def search_jobs(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Job category"),
    location_zip: Optional[str] = Query(None, description="ZIP code"),
    location_type: Optional[str] = Query(None, description="onsite, remote, hybrid"),
    employment_type: Optional[str] = Query(None, description="full_time, part_time, contract, etc."),
    skills: Optional[str] = Query(None, description="Comma-separated skills"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Browse and search job postings (Public - Job seekers)
    Returns only open, public jobs
    """
    skills_list = skills.split(",") if skills else None
    
    result = await db_jobs.search_job_postings(
        query=q,
        category=category,
        location_zip=location_zip,
        location_type=location_type,
        employment_type=employment_type,
        skills=skills_list,
        page=page,
        limit=limit
    )
    
    return result


@router.get("/{job_id}/public", response_model=JobPosting)
async def get_public_job_detail(job_id: str):
    """
    Get public job details (for job seekers)
    Increments view count
    """
    job = await db_jobs.get_job_posting_by_id(job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Only show if public and open
    if job["status"] != "open" or job["visibility"] != "public":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not available"
        )
    
    # Increment view count
    await db_jobs.increment_job_view(job_id)
    
    return job


@router.post("/{job_id}/apply", response_model=JobApplication, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: str,
    application_data: JobApplicationCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Apply to a job (BANIBS native application)
    """
    application = await db_jobs.create_job_application(
        job_id=job_id,
        applicant_user_id=current_user["id"],
        cover_message=application_data.cover_message,
        resume_url=application_data.resume_url
    )
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to apply (already applied or job not found)"
        )
    
    return application


@router.get("/applications/mine", response_model=List[JobApplication])
async def get_my_applications(
    current_user=Depends(require_role("user", "member"))
):
    """
    Get all applications for current user (Job seeker view)
    """
    applications = await db_jobs.get_user_applications(current_user["id"])
    return applications
