from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import Optional, List
import os
import uuid
from pathlib import Path

from models.candidate_profile import (
    CandidateProfilePublic,
    CandidateProfileCreate
)
from db.opportunities.candidate_profiles import (
    create_candidate_profile,
    get_candidate_profile_by_id,
    get_candidate_profile_by_user_id,
    get_public_candidate_profiles,
    update_candidate_profile,
    add_saved_job,
    remove_saved_job,
    increment_candidate_applications
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/candidates", tags=["candidates"])

# Upload configuration
UPLOADS_DIR = Path("/app/backend/uploads/resumes")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/profile", response_model=CandidateProfilePublic, status_code=201)
async def create_profile(
    profile_data: CandidateProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a candidate profile for the authenticated user
    """
    # Check if user already has a candidate profile
    existing = await get_candidate_profile_by_user_id(current_user["id"])
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Candidate profile already exists. Use PATCH to update."
        )
    
    # Create profile
    profile_dict = profile_data.dict()
    profile_dict["user_id"] = current_user["id"]
    
    profile = await create_candidate_profile(profile_dict)
    
    return CandidateProfilePublic(**profile)


@router.get("/me", response_model=dict)
async def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    """
    Get authenticated user's candidate profile
    
    Returns full profile including private fields
    """
    profile = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found. Create one first."
        )
    
    return profile


@router.patch("/me", response_model=dict)
async def update_my_profile(
    updates: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Update authenticated user's candidate profile
    """
    profile = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found. Create one first."
        )
    
    updated_profile = await update_candidate_profile(profile["id"], updates)
    
    return updated_profile


@router.post("/upload-resume", response_model=dict)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload resume file
    
    Returns URL to uploaded resume
    """
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )
    
    # Generate unique filename
    filename = f"{current_user['id']}_{uuid.uuid4()}{file_ext}"
    file_path = UPLOADS_DIR / filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Generate URL
    resume_url = f"/uploads/resumes/{filename}"
    
    # Update candidate profile
    profile = await get_candidate_profile_by_user_id(current_user["id"])
    if profile:
        await update_candidate_profile(profile["id"], {"resume_url": resume_url})
    
    return {
        "message": "Resume uploaded successfully",
        "resume_url": resume_url
    }


@router.post("/saved-jobs/{job_id}", response_model=dict)
async def save_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Save a job to candidate's saved jobs list
    """
    profile = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found. Create one first."
        )
    
    # Check if already saved
    if job_id in profile.get("saved_job_ids", []):
        return {
            "message": "Job already saved",
            "saved": True
        }
    
    await add_saved_job(profile["id"], job_id)
    
    return {
        "message": "Job saved successfully",
        "saved": True
    }


@router.delete("/saved-jobs/{job_id}", response_model=dict)
async def unsave_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Remove a job from candidate's saved jobs list
    """
    profile = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found"
        )
    
    await remove_saved_job(profile["id"], job_id)
    
    return {
        "message": "Job removed from saved",
        "saved": False
    }


@router.get("/saved-jobs", response_model=dict)
async def get_saved_jobs(
    current_user: dict = Depends(get_current_user)
):
    """
    Get candidate's saved jobs with full job details
    """
    profile = await get_candidate_profile_by_user_id(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found"
        )
    
    # Get saved job IDs
    saved_job_ids = profile.get("saved_job_ids", [])
    
    if not saved_job_ids:
        return {
            "saved_jobs": [],
            "total": 0
        }
    
    # Fetch job details
    from db.opportunities.job_listings import get_job_listing_by_id
    from db.opportunities.employer_profiles import get_employer_profile_by_id
    
    saved_jobs = []
    for job_id in saved_job_ids:
        job = await get_job_listing_by_id(job_id)
        if job:
            # Enrich with employer data
            employer = await get_employer_profile_by_id(job["employer_id"])
            if employer:
                job["employer_name"] = employer.get("organization_name")
                job["employer_logo_url"] = employer.get("logo_url")
            saved_jobs.append(job)
    
    return {
        "saved_jobs": saved_jobs,
        "total": len(saved_jobs)
    }


@router.get("/public", response_model=dict)
async def get_public_profiles(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get public candidate profiles
    
    Only returns profiles where profile_public = true
    Used by recruiters to search for candidates
    """
    skip = (page - 1) * limit
    
    profiles, total = await get_public_candidate_profiles(skip=skip, limit=limit)
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "candidates": [CandidateProfilePublic(**p) for p in profiles],
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages
    }
