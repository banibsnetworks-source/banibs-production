from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta, timezone
import csv
import io

from db.connection import get_db
from db.newsletter import subscribe_email, get_all_subscribers
from models.newsletter import (
    NewsletterSubscribeRequest,
    NewsletterSubscriberPublic
)
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

# Phase 4.2 - Public Newsletter Endpoints

@router.post("/subscribe")
async def subscribe_to_newsletter(
    request: NewsletterSubscribeRequest,
    db=Depends(get_db)
):
    """
    Subscribe to BANIBS newsletter
    Public endpoint - anyone can subscribe
    Idempotent: returns success even if already subscribed
    """
    await subscribe_email(db, request.email)
    
    return {
        "success": True,
        "email": request.email,
        "message": "Successfully subscribed to BANIBS newsletter"
    }

# Phase 4.2 - Admin Newsletter Endpoints

@router.get("/admin/subscribers", response_model=list[NewsletterSubscriberPublic])
async def get_newsletter_subscribers(
    db=Depends(get_db),
    user: dict = Depends(require_role("admin"))
):
    """
    Get all newsletter subscribers
    Admin only
    """
    subscribers = await get_all_subscribers(db)
    
    return [
        NewsletterSubscriberPublic(
            id=str(sub["_id"]),
            email=sub["email"],
            created_at=sub["created_at"],
            confirmed=sub.get("confirmed", True)
        )
        for sub in subscribers
    ]

@router.get("/admin/subscribers/export.csv")
async def export_newsletter_subscribers_csv(
    db=Depends(get_db),
    user: dict = Depends(require_role("admin"))
):
    """
    Export newsletter subscribers to CSV
    Admin only
    """
    subscribers = await get_all_subscribers(db)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Email", "Subscribed At", "Confirmed"])
    
    # Write data rows
    for sub in subscribers:
        writer.writerow([
            sub["email"],
            sub["created_at"].isoformat(),
            sub.get("confirmed", True)
        ])
    
    # Return CSV as streaming response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=newsletter_subscribers_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )

@router.get("/admin/draft-digest")
async def get_draft_digest(
    db=Depends(get_db),
    user: dict = Depends(require_role("admin"))
):
    """
    Generate weekly digest preview
    Reuses Phase 3's generateWeeklyDigest logic
    Admin only - NO AUTO-SEND
    """
    # Reuse the existing digest generation from Phase 3
    from services.email_service import generate_weekly_digest
    
    digest = await generate_weekly_digest(db)
    
    return {
        "preview": True,
        "message": "This is a preview. No emails have been sent.",
        "digest": digest
    }
