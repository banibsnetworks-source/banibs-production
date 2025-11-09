"""
Phase 7.1 Cycle 1.4 - Recruiter Analytics

Provides aggregate stats for recruiter dashboards
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_guard import get_current_user, require_role

from db.opportunities.recruiter_profiles import get_recruiter_profile_by_user_id
from db.opportunities.application_records import (
    get_application_count_by_job_ids,
    get_applications_by_job_ids,
    get_recent_applications_count
)
from db.connection import db

router = APIRouter(prefix="/api/analytics", tags=["recruiter-analytics"])


@router.get("/recruiter/overview")
async def get_recruiter_overview(
    current_user: dict = Depends(require_role("verified_recruiter", "super_admin"))
):
    """
    High-level overview for a recruiter:
    - total_jobs: all jobs owned by recruiter
    - active_jobs: jobs that are currently approved/open
    - total_applications: applications across all recruiter jobs
    - applications_last_30_days: recent activity window
    - avg_applications_per_active_job: simple ratio metric
    
    Returns current recruiter's statistics only (not platform-wide).
    """
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Get all jobs for this recruiter directly from MongoDB
    job_listings_collection = db.job_listings
    cursor = job_listings_collection.find(
        {"posted_by_recruiter_id": recruiter["id"]},
        {"_id": 0}
    )
    all_jobs = await cursor.to_list(length=None)
    
    total_jobs = len(all_jobs)
    
    # Count active jobs (status = 'approved')
    active_jobs = [j for j in all_jobs if j.get("status") == "approved"]
    active_jobs_count = len(active_jobs)
    
    # Get job IDs for application queries
    job_ids = [j["id"] for j in all_jobs]
    
    if not job_ids:
        return {
            "total_jobs": 0,
            "active_jobs": 0,
            "total_applications": 0,
            "applications_last_30_days": 0,
            "avg_applications_per_active_job": 0
        }
    
    # Count total applications
    total_applications = await get_application_count_by_job_ids(job_ids)
    
    # Count applications in last 30 days
    cutoff_30d = datetime.now(timezone.utc) - timedelta(days=30)
    applications_last_30_days = await get_recent_applications_count(
        job_ids, 
        since=cutoff_30d
    )
    
    # Calculate average
    avg_applications_per_active_job = (
        round(total_applications / active_jobs_count, 1) 
        if active_jobs_count > 0 
        else 0
    )
    
    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs_count,
        "total_applications": total_applications,
        "applications_last_30_days": applications_last_30_days,
        "avg_applications_per_active_job": avg_applications_per_active_job
    }


@router.get("/recruiter/jobs")
async def get_recruiter_job_application_stats(
    current_user: dict = Depends(require_role("verified_recruiter", "super_admin"))
):
    """
    Per-job application stats for recruiter dashboard tables.
    
    Returns:
    [
      {
        "job_id": "uuid",
        "title": "Senior Backend Engineer",
        "status": "approved",
        "application_count": 7,
        "applications_last_7_days": 3,
        "last_application_at": "2025-11-07T14:21:00Z"
      },
      ...
    ]
    """
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    # Get all jobs for this recruiter directly from MongoDB
    job_listings_collection = db.job_listings
    cursor = job_listings_collection.find(
        {"posted_by_recruiter_id": recruiter["id"]},
        {"_id": 0}
    )
    jobs = await cursor.to_list(length=None)
    
    if not jobs:
        return []
    
    job_ids = [j["id"] for j in jobs]
    
    # Get all applications for these jobs
    applications = await get_applications_by_job_ids(job_ids)
    
    # Index applications by job_id
    stats = {}
    cutoff_7d = datetime.now(timezone.utc) - timedelta(days=7)
    
    # Initialize stats for each job
    for job in jobs:
        stats[job["id"]] = {
            "job_id": job["id"],
            "title": job.get("title", "Untitled"),
            "status": job.get("status", "pending"),
            "application_count": 0,
            "applications_last_7_days": 0,
            "last_application_at": None,
        }
    
    # Aggregate application data
    for app in applications:
        job_id = app.get("job_id")
        job_stat = stats.get(job_id)
        
        if not job_stat:
            continue
        
        job_stat["application_count"] += 1
        
        # Check if application is within last 7 days
        created_at = app.get("created_at")
        if created_at:
            # Handle both datetime objects and ISO strings
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    created_at = None
            
            # Ensure created_at is timezone-aware before comparison
            if created_at:
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                    
                if created_at >= cutoff_7d:
                    job_stat["applications_last_7_days"] += 1
            
            # Track most recent application
            current_last = job_stat["last_application_at"]
            if current_last is None:
                job_stat["last_application_at"] = created_at
            elif isinstance(current_last, datetime) and created_at > current_last:
                job_stat["last_application_at"] = created_at
            elif isinstance(current_last, str):
                try:
                    current_last_dt = datetime.fromisoformat(current_last.replace('Z', '+00:00'))
                    if created_at > current_last_dt:
                        job_stat["last_application_at"] = created_at
                except:
                    pass
    
    # Convert datetime to ISO strings for JSON serialization
    for job_id, meta in stats.items():
        last_app = meta["last_application_at"]
        if last_app and isinstance(last_app, datetime):
            meta["last_application_at"] = last_app.isoformat()
    
    return list(stats.values())
