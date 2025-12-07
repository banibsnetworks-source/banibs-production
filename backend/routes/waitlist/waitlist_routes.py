"""
Waitlist API Routes
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import logging

from backend.models.waitlist import (
    WaitlistSubscribeRequest,
    WaitlistSubscribeResponse,
    WaitlistEntry
)
from backend.services.email.email_service import email_service
from backend.database import get_database

router = APIRouter(prefix="/api/waitlist", tags=["Waitlist"])
logger = logging.getLogger(__name__)


@router.post("/subscribe", response_model=WaitlistSubscribeResponse)
async def subscribe_to_waitlist(
    request_data: WaitlistSubscribeRequest,
    request: Request,
    db = Depends(get_database)
):
    """
    Subscribe to BANIBS waitlist
    
    Args:
        request_data: Email subscription request
        request: FastAPI request object (for IP address)
        db: MongoDB database connection
        
    Returns:
        WaitlistSubscribeResponse with success status
    """
    try:
        email = request_data.email.lower().strip()
        
        # Check if email already exists
        existing = await db.waitlist_emails.find_one({"email": email})
        if existing:
            return WaitlistSubscribeResponse(
                success=True,
                message="You're already on the list. We'll reach out when there's a real update.",
                email=email
            )
        
        # Get IP address from request
        ip_address = None
        if hasattr(request, 'client') and request.client:
            ip_address = request.client.host
        
        # Create waitlist entry
        entry = WaitlistEntry(
            email=email,
            submitted_at=datetime.utcnow(),
            source="coming_soon_v2",
            ip_address=ip_address
        )
        
        # Save to MongoDB
        result = await db.waitlist_emails.insert_one(entry.dict())
        
        logger.info(
            f"✅ Waitlist signup successful: {email} | "
            f"Source: {entry.source} | "
            f"Timestamp: {entry.submitted_at.isoformat()} | "
            f"IP: {ip_address or 'N/A'}"
        )
        
        # Send notification email (non-blocking, log if fails)
        try:
            email_sent = email_service.send_waitlist_notification(
                email=email,
                submitted_at=entry.submitted_at.isoformat(),
                source=entry.source
            )
            if not email_sent:
                logger.warning(f"Email notification not sent for {email}")
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")
        
        return WaitlistSubscribeResponse(
            success=True,
            message="You're on the list. We'll reach out when there's a real update.",
            email=email
        )
        
    except Exception as e:
        logger.error(f"Error subscribing to waitlist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your email right now. Please try again in a moment."
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Waitlist",
        "email_service_enabled": email_service.enabled
    }


@router.get("/count")
async def get_waitlist_count(db = Depends(get_database)):
    """
    Get total waitlist count
    
    Returns:
        Total number of waitlist signups
    """
    try:
        count = await db.waitlist_emails.count_documents({})
        return {"count": count}
    except Exception as e:
        logger.error(f"Error getting waitlist count: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get waitlist count")
