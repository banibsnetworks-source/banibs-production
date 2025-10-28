from fastapi import APIRouter, Depends, HTTPException, Request
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
from middleware.auth_guard import require_role, require_super_admin
from middleware.rate_limiter import enforce_rate_limit  # Phase 5.3
from db.reactions import hash_ip  # Phase 5.3
from db.banned_sources import is_ip_banned  # Phase 5.3

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
    user: dict = Depends(require_super_admin)  # Phase 4.5 - super_admin only
):
    """
    Export newsletter subscribers to CSV
    Super admin only (Phase 4.5 RBAC)
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


# Phase 5.2 - Newsletter Digest Sending

@router.post("/admin/send-digest")
async def send_weekly_digest(
    db=Depends(get_db),
    user: dict = Depends(require_super_admin)  # super_admin only
):
    """
    Send weekly digest to all newsletter subscribers
    
    Phase 5.2 - Automated Weekly Digest Delivery
    Super admin only (RBAC)
    
    Steps:
    1. Generate weekly digest
    2. Fetch all confirmed newsletter subscribers
    3. Send digest email to each subscriber
    4. Log send to newsletter_sends collection
    """
    from services.email_service import generate_weekly_digest, send_digest_email
    from db.newsletter_sends import create_newsletter_send
    
    # Generate digest
    digest = await generate_weekly_digest(db)
    
    if digest['total_new_opportunities'] == 0:
        raise HTTPException(
            status_code=400,
            detail="No new opportunities to send in digest. Weekly digest requires at least one new opportunity."
        )
    
    # Fetch all confirmed subscribers
    subscribers = await get_all_subscribers(db)
    confirmed_subscribers = [
        sub for sub in subscribers 
        if sub.get("confirmed", True)
    ]
    
    if not confirmed_subscribers:
        raise HTTPException(
            status_code=400,
            detail="No confirmed newsletter subscribers to send digest to."
        )
    
    # Send digest to all subscribers
    sent_count = 0
    failed_emails = []
    
    for subscriber in confirmed_subscribers:
        try:
            send_digest_email(subscriber['email'], digest)
            sent_count += 1
        except Exception as e:
            failed_emails.append(subscriber['email'])
            print(f"Failed to send digest to {subscriber['email']}: {str(e)}")
    
    # Determine status
    if sent_count == 0:
        status = "failed"
    elif failed_emails:
        status = "partial"
    else:
        status = "completed"
    
    # Log send to newsletter_sends collection
    send_log = await create_newsletter_send({
        'total_subscribers': sent_count,
        'total_opportunities': digest['total_new_opportunities'],
        'sent_by': user.get('id'),
        'status': status,
        'error_message': f"Failed to send to: {', '.join(failed_emails)}" if failed_emails else None
    })
    
    return {
        "success": True,
        "sent_to": sent_count,
        "total_opportunities": digest['total_new_opportunities'],
        "failed": len(failed_emails),
        "send_id": send_log['id'],
        "status": status,
        "message": f"Weekly digest sent to {sent_count} subscribers"
    }

@router.get("/admin/sends")
async def get_newsletter_sends(
    db=Depends(get_db),
    user: dict = Depends(require_super_admin)  # super_admin only
):
    """
    Get newsletter send history
    
    Phase 5.2 - View past digest sends
    Super admin only (RBAC)
    
    Returns list of past newsletter sends with metadata
    """
    from db.newsletter_sends import get_all_newsletter_sends
    
    sends = await get_all_newsletter_sends(limit=50)
    
    return {
        "sends": sends,
        "total": len(sends)
    }
