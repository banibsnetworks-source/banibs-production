from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime

from models.recruiter_profile import (
    RecruiterProfilePublic,
    RecruiterVerificationRequest
)
from models.employer_profile import (
    EmployerProfilePublic,
    EmployerProfileCreate
)
from db.opportunities.recruiter_profiles import (
    create_recruiter_profile,
    get_recruiter_profile_by_id,
    get_recruiter_profile_by_user_id,
    get_recruiter_profiles,
    update_recruiter_profile,
    verify_recruiter,
    request_recruiter_verification
)
from db.opportunities.employer_profiles import (
    create_employer_profile,
    get_employer_profile_by_id,
    get_employer_profile_by_email,
    get_employer_profiles,
    update_employer_profile,
    verify_employer
)
from middleware.auth_guard import get_current_user, require_role
from db.unified_users import get_user_by_id, update_user_roles

router = APIRouter(prefix="/api/recruiters", tags=["recruiters"])


@router.get("/verify-status", response_model=dict)
async def get_verification_status(current_user: dict = Depends(get_current_user)):
    """
    Get current user's recruiter verification status
    
    Returns:
    - has_profile: bool - whether user has a recruiter profile
    - verified: bool - whether profile is verified
    - verification_requested_at: datetime - when verification was requested
    - status: string - 'not_requested', 'pending', 'verified'
    """
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    
    if not recruiter:
        return {
            "has_profile": False,
            "verified": False,
            "status": "not_requested"
        }
    
    status = "verified" if recruiter.get("verified") else (
        "pending" if recruiter.get("verification_requested_at") else "not_requested"
    )
    
    return {
        "has_profile": True,
        "verified": recruiter.get("verified", False),
        "verification_requested_at": recruiter.get("verification_requested_at"),
        "verification_method": recruiter.get("verification_method"),
        "status": status,
        "profile_id": recruiter["id"]
    }


@router.post("/request-verification", response_model=dict)
async def request_verification(
    request_data: RecruiterVerificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request recruiter verification
    
    Creates a recruiter profile if none exists, or updates existing profile
    and marks it as pending verification.
    """
    # Check if user already has a recruiter profile
    existing_profile = await get_recruiter_profile_by_user_id(current_user["id"])
    
    if existing_profile:
        # Update existing profile and request verification
        update_data = request_data.dict(exclude_unset=True)
        update_data["verification_requested_at"] = datetime.utcnow().isoformat()
        
        updated_profile = await update_recruiter_profile(
            existing_profile["id"],
            update_data
        )
        
        return {
            "message": "Verification request updated",
            "profile_id": updated_profile["id"],
            "status": "pending"
        }
    
    # Create new recruiter profile
    profile_data = request_data.dict()
    profile_data["user_id"] = current_user["id"]
    profile_data["full_name"] = current_user.get("name", "")
    profile_data["contact_email"] = current_user.get("email", "")
    profile_data["verified"] = False
    profile_data["verification_requested_at"] = datetime.utcnow().isoformat()
    profile_data["verification_method"] = "admin_approval"  # Phase 7.1 - manual approval only
    
    new_profile = await create_recruiter_profile(profile_data)
    
    return {
        "message": "Verification request submitted",
        "profile_id": new_profile["id"],
        "status": "pending"
    }


@router.get("/me", response_model=RecruiterProfilePublic)
async def get_my_recruiter_profile(current_user: dict = Depends(get_current_user)):
    """
    Get authenticated user's recruiter profile
    """
    recruiter = await get_recruiter_profile_by_user_id(current_user["id"])
    
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    return RecruiterProfilePublic(**recruiter)


@router.get("/pending", response_model=dict)
async def get_pending_verifications(
    current_user: dict = Depends(require_role("super_admin")),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get pending recruiter verification requests
    
    Admin only endpoint to review verification requests
    """
    # Get all unverified recruiters with verification requests
    skip = (page - 1) * limit
    
    recruiters, total = await get_recruiter_profiles(
        verified=False,
        skip=skip,
        limit=limit
    )
    
    # Filter to only those with verification_requested_at
    pending = [r for r in recruiters if r.get("verification_requested_at")]
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "requests": pending,
        "page": page,
        "limit": limit,
        "total": len(pending),
        "pages": pages
    }


@router.post("/approve/{recruiter_id}", response_model=dict)
async def approve_recruiter(
    recruiter_id: str,
    current_user: dict = Depends(require_role("super_admin")),
    notes: Optional[str] = None
):
    """
    Approve a recruiter verification request
    
    Admin only endpoint.
    Grants verified_recruiter role to the user.
    """
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_id(recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    # Verify recruiter
    updated_recruiter = await verify_recruiter(
        recruiter_id,
        current_user["id"],
        notes
    )
    
    # Grant verified_recruiter role to user
    user = await get_user_by_id(recruiter["user_id"])
    if user:
        current_roles = user.get("roles", [])
        if "verified_recruiter" not in current_roles:
            current_roles.append("verified_recruiter")
            await update_user_roles(recruiter["user_id"], current_roles)
    
    return {
        "message": "Recruiter verified successfully",
        "recruiter_id": recruiter_id,
        "verified": True
    }


@router.post("/reject/{recruiter_id}", response_model=dict)
async def reject_recruiter(
    recruiter_id: str,
    current_user: dict = Depends(require_role("super_admin")),
    notes: Optional[str] = None
):
    """
    Reject a recruiter verification request
    
    Admin only endpoint.
    Removes verification request but keeps profile.
    """
    # Get recruiter profile
    recruiter = await get_recruiter_profile_by_id(recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    # Update profile to remove verification request
    await update_recruiter_profile(
        recruiter_id,
        {
            "verification_requested_at": None,
            "verification_notes": notes or "Verification request rejected"
        }
    )
    
    return {
        "message": "Verification request rejected",
        "recruiter_id": recruiter_id
    }


# ==========================================
# EMPLOYER PROFILE ENDPOINTS
# ==========================================

employer_router = APIRouter(prefix="/api/employers", tags=["employers"])


@employer_router.post("", response_model=EmployerProfilePublic, status_code=201)
async def create_employer(
    employer_data: EmployerProfileCreate,
    current_user: dict = Depends(require_role(["verified_recruiter", "super_admin"]))
):
    """
    Create a new employer profile
    
    Requires: verified_recruiter or super_admin role
    """
    # Check if employer with this email already exists
    existing = await get_employer_profile_by_email(employer_data.contact_email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employer with this email already exists"
        )
    
    # Create employer
    employer_dict = employer_data.dict()
    employer_dict["created_by_user_id"] = current_user["id"]
    employer_dict["verified"] = False  # Employers start unverified
    
    employer = await create_employer_profile(employer_dict)
    
    return EmployerProfilePublic(**employer)


@employer_router.get("/{employer_id}", response_model=EmployerProfilePublic)
async def get_employer(
    employer_id: str
):
    """
    Get employer profile by ID
    
    Public endpoint
    """
    employer = await get_employer_profile_by_id(employer_id)
    
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    return EmployerProfilePublic(**employer)


@employer_router.get("", response_model=dict)
async def list_employers(
    verified: Optional[bool] = Query(None),
    sector: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    List employer profiles
    
    Public endpoint with optional filtering
    """
    skip = (page - 1) * limit
    
    employers, total = await get_employer_profiles(
        verified=verified,
        sector=sector,
        skip=skip,
        limit=limit
    )
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "employers": [EmployerProfilePublic(**e) for e in employers],
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages
    }


@employer_router.post("/verify/{employer_id}", response_model=dict)
async def verify_employer_profile(
    employer_id: str,
    current_user: dict = Depends(require_role("super_admin")),
    notes: Optional[str] = None
):
    """
    Verify an employer profile
    
    Admin only endpoint
    """
    employer = await get_employer_profile_by_id(employer_id)
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    verified_employer = await verify_employer(
        employer_id,
        current_user["id"],
        notes
    )
    
    return {
        "message": "Employer verified successfully",
        "employer_id": employer_id,
        "verified": True
    }
