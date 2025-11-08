from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import os

from models.job_listing import (
    JobListingPublic,
    JobListingCreate,
    JobListingUpdate,
    JobListingDB
)
from db.opportunities.job_listings import (
    create_job_listing,
    get_job_listing_by_id,
    get_job_listings,
    update_job_listing,
    delete_job_listing,
    increment_job_view
)
from db.opportunities.employer_profiles import get_employer_profile_by_id
from db.opportunities.recruiter_profiles import (
    get_recruiter_profile_by_user_id,
    increment_recruiter_stats
)
from middleware.auth_guard import get_current_user, require_role
from motor.motor_asyncio import AsyncIOMotorClient

# For moderation and sentiment integration
from services.ai_sentiment import analyze_sentiment

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
job_listings_collection = db.job_listings


def has_verified_recruiter_role(current_user: dict) -> bool:
    """Check if user has verified_recruiter role"""
    roles = current_user.get("roles", [])
    return "verified_recruiter" in roles or "super_admin" in roles


@router.get("", response_model=dict)
async def get_jobs_public(
    # Search & Keyword
    q: Optional[str] = Query(None, description="Search by title, company, or keywords"),
    
    # Location & Remote
    location: Optional[str] = Query(None, description="City, region, or country"),
    remote_type: Optional[str] = Query(None, description="on_site, hybrid, or remote"),
    
    # Job Details
    job_type: Optional[str] = Query(None, description="Comma-separated: full_time, part_time, contract, internship"),
    experience_level: Optional[str] = Query(None, description="entry, mid, senior, executive"),
    industry: Optional[str] = Query(None, description="Technology, Healthcare, Finance, etc."),
    
    # Date Filtering
    posted_since: Optional[str] = Query(None, description="ISO date - show listings newer than this"),
    
    # Employer Filters
    verified_employer: Optional[bool] = Query(None, description="Only show verified employers"),
    has_dei_statement: Optional[bool] = Query(None, description="Only show employers with DEI statements"),
    
    # Salary Range
    min_salary: Optional[int] = Query(None, description="Minimum pay range"),
    max_salary: Optional[int] = Query(None, description="Maximum pay range"),
    
    # Pagination & Sorting
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    sort_by: str = Query("posted_at", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction: asc or desc")
):
    """
    Public job listings endpoint with comprehensive filtering
    
    Returns active, approved job listings with optional filters.
    Default: sorted by posted_at desc, 20 results per page.
    
    BANIBS Values: Open to all, rooted in Black advancement.
    DEI and verified employer filters surface mission-aligned opportunities.
    """
    # Build MongoDB query
    query = {
        "status": "approved",  # Only show approved jobs
    }
    
    # Ensure job is not expired
    query["$or"] = [
        {"expires_at": None},
        {"expires_at": {"$gt": datetime.utcnow().isoformat()}}
    ]
    
    # Keyword search (search in title and description)
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q]}}
        ]
    
    # Location filter
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Remote type filter
    if remote_type:
        query["remote_type"] = remote_type
    
    # Job type filter (support comma-separated values)
    if job_type:
        job_types = [jt.strip() for jt in job_type.split(",")]
        query["job_type"] = {"$in": job_types}
    
    # Experience level filter
    if experience_level:
        query["experience_level"] = experience_level
    
    # Industry filter
    if industry:
        query["industry"] = {"$regex": f"^{industry}$", "$options": "i"}
    
    # Posted since date filter
    if posted_since:
        try:
            since_date = datetime.fromisoformat(posted_since)
            query["posted_at"] = {"$gte": since_date.isoformat()}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid posted_since date format")
    
    # Salary range filters
    if min_salary is not None:
        query["pay_range_max"] = {"$gte": min_salary}
    if max_salary is not None:
        query["pay_range_min"] = {"$lte": max_salary}
    
    # Calculate skip for pagination
    skip = (page - 1) * limit
    
    # Get total count
    total = await job_listings_collection.count_documents(query)
    
    # Sort direction
    sort_direction = -1 if sort_dir == "desc" else 1
    
    # Get jobs
    jobs = await job_listings_collection.find(
        query,
        {"_id": 0}
    ).sort(sort_by, sort_direction).skip(skip).limit(limit).to_list(length=None)
    
    # Enrich with employer data
    enriched_jobs = []
    for job in jobs:
        employer = await get_employer_profile_by_id(job["employer_id"])
        
        if employer:
            # Apply employer filters
            if verified_employer and not employer.get("verified", False):
                continue
            if has_dei_statement and not employer.get("dei_statement"):
                continue
            
            # Add employer info to job
            job["employer_name"] = employer.get("organization_name")
            job["employer_logo_url"] = employer.get("logo_url")
            
        enriched_jobs.append(JobListingPublic(**job))
    
    # Calculate pages
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "jobs": enriched_jobs,
        "page": page,
        "limit": limit,
        "total": len(enriched_jobs),  # After employer filtering
        "pages": pages
    }


@router.get("/mine", response_model=dict)
async def get_my_jobs(
    current_user: dict = Depends(get_current_user),
    
    # Search
    q: Optional[str] = Query(None, description="Search by title or job ID"),
    
    # Status filter
    status: Optional[str] = Query(None, description="draft, pending, approved, active, expired, closed"),
    
    # Date range
    created_from: Optional[str] = Query(None, description="Filter by creation date (from)"),
    created_to: Optional[str] = Query(None, description="Filter by creation date (to)"),
    
    # Location
    location: Optional[str] = Query(None, description="City, region, or remote"),
    
    # Applications
    has_applications: Optional[bool] = Query(None, description="Only jobs with applications"),
    
    # Moderation
    flagged_only: Optional[bool] = Query(None, description="Only moderated/flagged postings"),
    
    # Pagination
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_dir: str = Query("desc", description="asc or desc")
):
    """
    Get job listings created by the authenticated recruiter/employer
    
    Requires: verified_recruiter or super_admin role
    """
    # Check if user has recruiter role
    if not has_verified_recruiter_role(current_user):
        raise HTTPException(
            status_code=403,
            detail="Must be a verified recruiter to view your jobs"
        )
    
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Build query - find jobs posted by this recruiter
    query = {"posted_by_recruiter_id": recruiter["id"]}
    
    # Search filter
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"id": q}
        ]
    
    # Status filter
    if status:
        query["status"] = status
    
    # Date range filters
    if created_from:
        try:
            from_date = datetime.fromisoformat(created_from)
            query["created_at"] = {"$gte": from_date.isoformat()}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid created_from date")
    
    if created_to:
        try:
            to_date = datetime.fromisoformat(created_to)
            if "created_at" in query:
                query["created_at"]["$lte"] = to_date.isoformat()
            else:
                query["created_at"] = {"$lte": to_date.isoformat()}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid created_to date")
    
    # Location filter
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Applications filter
    if has_applications:
        query["application_count"] = {"$gt": 0}
    
    # Flagged only filter
    if flagged_only:
        query["moderation_flag"] = {"$ne": None}
    
    # Pagination
    skip = (page - 1) * limit
    total = await job_listings_collection.count_documents(query)
    
    # Sort
    sort_direction = -1 if sort_dir == "desc" else 1
    
    # Get jobs
    jobs = await job_listings_collection.find(
        query,
        {"_id": 0}
    ).sort(sort_by, sort_direction).skip(skip).limit(limit).to_list(length=None)
    
    # Enrich with employer data and application counts
    enriched_jobs = []
    for job in jobs:
        employer = await get_employer_profile_by_id(job["employer_id"])
        if employer:
            job["employer_name"] = employer.get("organization_name")
            job["employer_logo_url"] = employer.get("logo_url")
        
        # Add application stats
        applications_collection = db.application_records
        applications_new = await applications_collection.count_documents({
            "job_id": job["id"],
            "status": "submitted"
        })
        
        job["applications_total"] = job.get("application_count", 0)
        job["applications_new"] = applications_new
        
        enriched_jobs.append(job)
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "jobs": enriched_jobs,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages
    }


@router.get("/{job_id}", response_model=JobListingPublic)
async def get_job_detail(job_id: str):
    """
    Get detailed job listing by ID
    
    Public endpoint - increments view count
    """
    job = await get_job_listing_by_id(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Only show approved jobs to public
    if job.get("status") != "approved":
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Increment view count
    await increment_job_view(job_id)
    
    # Enrich with employer data
    employer = await get_employer_profile_by_id(job["employer_id"])
    if employer:
        job["employer_name"] = employer.get("organization_name")
        job["employer_logo_url"] = employer.get("logo_url")
    
    return JobListingPublic(**job)


@router.post("", response_model=JobListingPublic, status_code=201)
async def create_job(
    job_data: JobListingCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new job listing
    
    Requires: verified_recruiter or super_admin role
    
    Job will be created with status='pending' and sent to moderation queue.
    """
    # Check if user has recruiter role
    if not has_verified_recruiter_role(current_user):
        raise HTTPException(
            status_code=403,
            detail="Must be a verified recruiter to post jobs"
        )
    
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Verify employer exists
    employer = await get_employer_profile_by_id(job_data.employer_id)
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    # Check if recruiter is authorized for this employer
    if job_data.employer_id not in recruiter.get("employer_ids", []):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to post jobs for this employer"
        )
    
    # Create job data dict
    job_dict = job_data.dict()
    job_dict["posted_by_recruiter_id"] = recruiter["id"]
    job_dict["status"] = "pending"  # All new jobs start as pending
    
    # Phase 6.3 - Analyze sentiment of job description
    try:
        sentiment_result = await analyze_sentiment(job_data.description)
        job_dict["sentiment_score"] = sentiment_result["score"]
        job_dict["sentiment_label"] = sentiment_result["label"]
        job_dict["sentiment_at"] = datetime.utcnow()
        
        # TODO: Phase 7.2 - Store job sentiment in dedicated collection if needed
        # For Phase 7.1, we just store it in the job document itself
    except Exception as e:
        print(f"Sentiment analysis failed: {e}")
        # Don't block job creation if sentiment fails
    
    # Phase 6.4 - Check if should be flagged for moderation
    if job_dict.get("sentiment_score") and job_dict["sentiment_score"] < -0.5:
        job_dict["moderation_flag"] = "negative_sentiment"
    
    # Create job listing
    job = await create_job_listing(job_dict)
    
    # Increment recruiter stats
    await increment_recruiter_stats(recruiter["id"], jobs_posted=1)
    
    # Enrich response with employer data
    job["employer_name"] = employer.get("organization_name")
    job["employer_logo_url"] = employer.get("logo_url")
    
    return JobListingPublic(**job)


@router.patch("/{job_id}", response_model=JobListingPublic)
async def update_job(
    job_id: str,
    job_update: JobListingUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a job listing
    
    Requires: verified_recruiter or super_admin role
    Only the recruiter who created the job can update it
    """
    # Check if user has recruiter role
    if not has_verified_recruiter_role(current_user):
        raise HTTPException(
            status_code=403,
            detail="Must be a verified recruiter to update jobs"
        )
    
    # Get existing job
    existing_job = await get_job_listing_by_id(job_id)
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Verify ownership (unless super_admin)
    if "super_admin" not in current_user.get("roles", []):
        if existing_job.get("posted_by_recruiter_id") != recruiter["id"]:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update this job"
            )
    
    # Update job
    update_dict = job_update.dict(exclude_unset=True)
    
    # If description is updated, re-analyze sentiment
    if "description" in update_dict:
        try:
            sentiment_result = await analyze_sentiment(update_dict["description"])
            update_dict["sentiment_score"] = sentiment_result["score"]
            update_dict["sentiment_label"] = sentiment_result["label"]
            update_dict["sentiment_at"] = datetime.utcnow().isoformat()
            
            # Check if should be flagged for moderation
            if sentiment_result["score"] < -0.5:
                update_dict["moderation_flag"] = "negative_sentiment"
        except Exception as e:
            print(f"Sentiment analysis failed: {e}")
    
    updated_job = await update_job_listing(job_id, update_dict)
    
    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Enrich with employer data
    employer = await get_employer_profile_by_id(updated_job["employer_id"])
    if employer:
        updated_job["employer_name"] = employer.get("organization_name")
        updated_job["employer_logo_url"] = employer.get("logo_url")
    
    return JobListingPublic(**updated_job)


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a job listing
    
    Requires: verified_recruiter or super_admin role
    Only the recruiter who created the job can delete it
    """
    # Check if user has recruiter role
    if not has_verified_recruiter_role(current_user):
        raise HTTPException(
            status_code=403,
            detail="Must be a verified recruiter to delete jobs"
        )
    
    # Get existing job
    existing_job = await get_job_listing_by_id(job_id)
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Verify ownership (unless super_admin)
    if "super_admin" not in current_user.get("roles", []):
        if existing_job.get("posted_by_recruiter_id") != recruiter["id"]:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this job"
            )
    
    # Delete job
    deleted = await delete_job_listing(job_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return None
