"""
Phase 7.5.3 - User Feedback API Routes
Endpoints for submitting and managing user feedback
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional
from models.feedback import FeedbackCreate, FeedbackPublic, FeedbackAdmin
from db.feedback import (
    create_feedback,
    get_feedback_by_id,
    get_all_feedback,
    update_feedback_status,
    get_feedback_stats,
    delete_feedback
)
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackPublic, status_code=201)
async def submit_feedback(feedback: FeedbackCreate, request: Request):
    """
    Submit user feedback
    
    Public endpoint - no authentication required
    Rate limiting recommended in production
    
    Request body:
    - rating: 1-5 stars
    - feedback_text: Message (max 500 chars)
    - email: Optional contact email
    - category: General/Bugs/Suggestions/Content/Other
    
    Returns:
    - Feedback ID and confirmation
    """
    try:
        # Extract metadata from request
        page_url = str(request.url) if request.url else None
        user_agent = request.headers.get("user-agent", None)
        
        # TODO: Extract user_id from JWT if authenticated
        user_id = None  # For now, anonymous submissions
        
        # Create feedback
        feedback_doc = await create_feedback(
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
            category=feedback.category.value,
            email=feedback.email,
            page_url=page_url,
            user_agent=user_agent,
            user_id=user_id
        )
        
        return FeedbackPublic(
            id=feedback_doc["id"],
            rating=feedback_doc["rating"],
            category=feedback_doc["category"],
            created_at=feedback_doc["created_at"],
            status=feedback_doc["status"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")


@router.get("", response_model=List[FeedbackAdmin])
async def list_feedback(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(require_role("admin", "super_admin"))
):
    """
    List all feedback (Admin only)
    
    Query params:
    - skip: Pagination offset
    - limit: Max results (default 50)
    - status: Filter by status (new, reviewed, resolved)
    - category: Filter by category
    
    Returns:
    - List of feedback entries with all fields
    """
    try:
        feedback_list = await get_all_feedback(
            skip=skip,
            limit=limit,
            status=status,
            category=category
        )
        
        return [FeedbackAdmin(**item) for item in feedback_list]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feedback: {str(e)}")


@router.get("/stats")
async def feedback_statistics(
    current_user: dict = Depends(require_role("admin", "super_admin"))
):
    """
    Get feedback statistics (Admin only)
    
    Returns:
    - Total count
    - Average rating
    - Breakdown by status
    - Breakdown by category
    """
    try:
        stats = await get_feedback_stats()
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/{feedback_id}", response_model=FeedbackAdmin)
async def get_feedback(
    feedback_id: str,
    current_user: dict = Depends(require_role("admin", "super_admin"))
):
    """
    Get specific feedback by ID (Admin only)
    """
    feedback = await get_feedback_by_id(feedback_id)
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return FeedbackAdmin(**feedback)


@router.patch("/{feedback_id}/status")
async def update_status(
    feedback_id: str,
    status: str,
    admin_notes: Optional[str] = None,
    current_user: dict = Depends(require_role("admin", "super_admin"))
):
    """
    Update feedback status and add admin notes (Admin only)
    
    Body:
    - status: new, reviewed, or resolved
    - admin_notes: Optional internal notes
    """
    if status not in ["new", "reviewed", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be: new, reviewed, or resolved")
    
    updated = await update_feedback_status(feedback_id, status, admin_notes)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return {"message": "Feedback status updated", "feedback_id": feedback_id, "new_status": status}


@router.delete("/{feedback_id}")
async def remove_feedback(
    feedback_id: str,
    current_user: dict = Depends(require_role("admin", "super_admin"))
):
    """
    Delete feedback (Admin only)
    Use sparingly - prefer marking as resolved
    """
    deleted = await delete_feedback(feedback_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return {"message": "Feedback deleted", "feedback_id": feedback_id}
