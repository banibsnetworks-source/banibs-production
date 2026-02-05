"""
Alternative School Hub - Tutor Intake API Routes
Phase-0.5: Capture educator applications for review

Public endpoints:
- POST /api/alt-school/intake/tutors - Submit application

Admin endpoints (super_admin only):
- GET /api/alt-school/admin/intake/tutors - List submissions
- GET /api/alt-school/admin/intake/tutors/:id - Get single submission
- PUT /api/alt-school/admin/intake/tutors/:id - Update status/notes
- DELETE /api/alt-school/admin/intake/tutors/:id - Delete submission
- GET /api/alt-school/admin/intake/stats - Get submission stats
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from models.alt_school_intake import (
    TutorIntakeCreate,
    TutorIntakeUpdate,
    TutorIntakeSubmission,
    TutorIntakeListResponse
)
from db import alt_school_intake as db_intake
from middleware.auth_guard import require_role


router = APIRouter(prefix="/api/alt-school", tags=["Alternative School Intake"])


# ==========================================
# PUBLIC ENDPOINTS
# ==========================================

@router.post("/intake/tutors", status_code=status.HTTP_201_CREATED)
async def submit_tutor_application(data: TutorIntakeCreate):
    """
    Submit a tutor application for review.
    
    This is a capture-only endpoint. Submissions are reviewed by admin
    and there is no guarantee of listing.
    """
    # Validate consent
    if not data.consent_acknowledged:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must acknowledge that this is an application for review, not a guarantee of listing."
        )
    
    # Create submission
    submission = await db_intake.create_intake_submission(data.model_dump())
    
    return {
        "ok": True,
        "message": "Application submitted successfully. We review in phases. You'll be contacted if there's a fit."
    }


# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@router.get("/admin/intake/tutors", response_model=TutorIntakeListResponse)
async def list_intake_submissions(
    status: Optional[str] = Query(None, description="Filter by status: new, reviewed, approved, rejected"),
    limit: int = Query(100, ge=1, le=500),
    current_user=Depends(require_role("super_admin"))
):
    """List all tutor intake submissions (admin only)"""
    submissions = await db_intake.get_all_intake_submissions(status, limit)
    return {"submissions": submissions, "count": len(submissions)}


@router.get("/admin/intake/tutors/{submission_id}", response_model=TutorIntakeSubmission)
async def get_intake_submission(
    submission_id: str,
    current_user=Depends(require_role("super_admin"))
):
    """Get a single intake submission (admin only)"""
    submission = await db_intake.get_intake_submission_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.put("/admin/intake/tutors/{submission_id}", response_model=TutorIntakeSubmission)
async def update_intake_submission(
    submission_id: str,
    data: TutorIntakeUpdate,
    current_user=Depends(require_role("super_admin"))
):
    """Update an intake submission status/notes (admin only)"""
    existing = await db_intake.get_intake_submission_by_id(submission_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    updated = await db_intake.update_intake_submission(
        submission_id, 
        data.model_dump(exclude_unset=True)
    )
    return updated


@router.delete("/admin/intake/tutors/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_intake_submission(
    submission_id: str,
    current_user=Depends(require_role("super_admin"))
):
    """Delete an intake submission (admin only)"""
    deleted = await db_intake.delete_intake_submission(submission_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Submission not found")


@router.get("/admin/intake/stats")
async def get_intake_stats(
    current_user=Depends(require_role("super_admin"))
):
    """Get intake submission statistics (admin only)"""
    stats = await db_intake.get_intake_stats()
    return stats
