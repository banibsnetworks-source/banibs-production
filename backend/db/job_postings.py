"""
Job Postings Database Operations - Phase 7.1
BANIBS Jobs & Opportunities System
"""

from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional, List
from db.connection import get_db


async def create_job_posting(
    business_profile_id: str,
    owner_user_id: str,
    title: str,
    employment_type: str,
    category: str,
    description: str,
    location_type: str,
    **kwargs
):
    """Create a new job posting"""
    db = await get_db()
    
    job = {
        "id": str(uuid4()),
        "business_profile_id": business_profile_id,
        "owner_user_id": owner_user_id,
        "title": title,
        "employment_type": employment_type,
        "category": category,
        "tags": kwargs.get("tags", []),
        "description": description,
        "responsibilities": kwargs.get("responsibilities", []),
        "requirements": kwargs.get("requirements", []),
        "skills": kwargs.get("skills", []),
        "location_type": location_type,
        "location_city": kwargs.get("location_city"),
        "location_state": kwargs.get("location_state"),
        "location_zip": kwargs.get("location_zip"),
        "country": kwargs.get("country", "USA"),
        "salary_min": kwargs.get("salary_min"),
        "salary_max": kwargs.get("salary_max"),
        "salary_currency": kwargs.get("salary_currency", "USD"),
        "salary_visible": kwargs.get("salary_visible", True),
        "application_method": kwargs.get("application_method", "banibs"),
        "external_apply_url": kwargs.get("external_apply_url"),
        "status": kwargs.get("status", "draft"),
        "visibility": kwargs.get("visibility", "public"),
        "view_count": 0,
        "applicant_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "posted_at": datetime.now(timezone.utc) if kwargs.get("status") == "open" else None
    }
    
    await db.job_postings.insert_one(job)
    return job


async def get_job_posting_by_id(job_id: str, enrich: bool = True):
    """Get job posting by ID with optional business profile enrichment"""
    db = await get_db()
    
    job = await db.job_postings.find_one({"id": job_id}, {"_id": 0})
    
    if not job:
        return None
    
    # Enrich with business profile data
    if enrich and job.get("business_profile_id"):
        business = await db.business_profiles.find_one(
            {"id": job["business_profile_id"]},
            {"_id": 0, "name": 1, "logo": 1, "handle": 1}
        )
        if business:
            job["company_name"] = business.get("name")
            job["company_logo"] = business.get("logo")
            job["company_handle"] = business.get("handle")
    
    return job


async def get_jobs_by_owner(owner_user_id: str, status: Optional[str] = None):
    """Get all job postings for a user (employer view)"""
    db = await get_db()
    
    query = {"owner_user_id": owner_user_id}
    if status:
        query["status"] = status
    
    jobs = await db.job_postings.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=1000)
    
    # Enrich with business data
    for job in jobs:
        if job.get("business_profile_id"):
            business = await db.business_profiles.find_one(
                {"id": job["business_profile_id"]},
                {"_id": 0, "name": 1, "logo": 1, "handle": 1}
            )
            if business:
                job["company_name"] = business.get("name")
                job["company_logo"] = business.get("logo")
                job["company_handle"] = business.get("handle")
    
    return jobs


async def search_job_postings(
    query: Optional[str] = None,
    category: Optional[str] = None,
    location_zip: Optional[str] = None,
    employment_type: Optional[str] = None,
    location_type: Optional[str] = None,
    skills: Optional[List[str]] = None,
    page: int = 1,
    limit: int = 20
):
    """Search job postings (public job seeker view)"""
    db = await get_db()
    
    # Base filter: only open, public jobs
    filters = {
        "status": "open",
        "visibility": "public"
    }
    
    # Text search
    if query:
        filters["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"category": {"$regex": query, "$options": "i"}}
        ]
    
    # Category filter
    if category:
        filters["category"] = category
    
    # Location filters
    if location_zip:
        filters["location_zip"] = location_zip
    
    if location_type:
        filters["location_type"] = location_type
    
    # Employment type filter
    if employment_type:
        filters["employment_type"] = employment_type
    
    # Skills filter
    if skills and len(skills) > 0:
        filters["skills"] = {"$in": skills}
    
    # Get total count
    total = await db.job_postings.count_documents(filters)
    
    # Get paginated results
    skip = (page - 1) * limit
    jobs = await db.job_postings.find(
        filters,
        {"_id": 0}
    ).sort("posted_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Enrich with business data
    for job in jobs:
        if job.get("business_profile_id"):
            business = await db.business_profiles.find_one(
                {"id": job["business_profile_id"]},
                {"_id": 0, "name": 1, "logo": 1, "handle": 1}
            )
            if business:
                job["company_name"] = business.get("name")
                job["company_logo"] = business.get("logo")
                job["company_handle"] = business.get("handle")
    
    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


async def update_job_posting(job_id: str, owner_user_id: str, updates: dict):
    """Update job posting (only owner can update)"""
    db = await get_db()
    
    # Verify ownership
    job = await db.job_postings.find_one(
        {"id": job_id, "owner_user_id": owner_user_id},
        {"_id": 0}
    )
    
    if not job:
        return None
    
    # Update timestamp
    updates["updated_at"] = datetime.now(timezone.utc)
    
    # If status changes to open, set posted_at
    if updates.get("status") == "open" and not job.get("posted_at"):
        updates["posted_at"] = datetime.now(timezone.utc)
    
    await db.job_postings.update_one(
        {"id": job_id},
        {"$set": updates}
    )
    
    # Return updated job
    return await get_job_posting_by_id(job_id)


async def increment_job_view(job_id: str):
    """Increment view count for a job posting"""
    db = await get_db()
    
    await db.job_postings.update_one(
        {"id": job_id},
        {"$inc": {"view_count": 1}}
    )


# ============ JOB APPLICATIONS ============

async def create_job_application(
    job_id: str,
    applicant_user_id: str,
    cover_message: Optional[str] = None,
    resume_url: Optional[str] = None
):
    """Create a job application"""
    db = await get_db()
    
    # Check if user already applied
    existing = await db.job_applications.find_one({
        "job_id": job_id,
        "applicant_user_id": applicant_user_id
    })
    
    if existing:
        return None  # Already applied
    
    # Get job and business info
    job = await db.job_postings.find_one({"id": job_id}, {"_id": 0})
    if not job:
        return None
    
    # Get applicant info
    user = await db.users.find_one({"id": applicant_user_id}, {"_id": 0, "name": 1, "email": 1})
    
    application = {
        "id": str(uuid4()),
        "job_id": job_id,
        "job_title": job.get("title"),
        "applicant_user_id": applicant_user_id,
        "applicant_name": user.get("name") if user else None,
        "applicant_email": user.get("email") if user else None,
        "business_profile_id": job["business_profile_id"],
        "cover_message": cover_message,
        "resume_url": resume_url,
        "status": "submitted",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.job_applications.insert_one(application)
    
    # Increment applicant count on job
    await db.job_postings.update_one(
        {"id": job_id},
        {"$inc": {"applicant_count": 1}}
    )
    
    return application


async def get_applications_for_job(job_id: str, owner_user_id: str):
    """Get all applications for a job (employer view only)"""
    db = await get_db()
    
    # Verify ownership
    job = await db.job_postings.find_one(
        {"id": job_id, "owner_user_id": owner_user_id},
        {"_id": 0}
    )
    
    if not job:
        return []
    
    applications = await db.job_applications.find(
        {"job_id": job_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=1000)
    
    return applications


async def get_user_applications(applicant_user_id: str):
    """Get all applications for a user (job seeker view)"""
    db = await get_db()
    
    applications = await db.job_applications.find(
        {"applicant_user_id": applicant_user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=1000)
    
    return applications
