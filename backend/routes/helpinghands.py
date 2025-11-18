"""
BANIBS Helping Hands - API Routes
Phase 10.0 - Donation-Based Crowdfunding

Routes:
- Campaign CRUD
- Support/Donation flow
- Stripe integration
- Reports/Moderation
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from uuid import uuid4
import os

from models.helpinghands import (
    HelpingHandsCampaign,
    CampaignCreateRequest,
    CampaignUpdateRequest,
    CampaignListResponse,
    CampaignStatus,
    CampaignCategory,
    SupportRequest,
    StripeCheckoutResponse,
    ReportCampaignRequest,
    HelpingHandsReport,
    ReportReason
)
from middleware.auth_guard import require_role
from db.connection import get_db_client

router = APIRouter(prefix="/api/helping-hands", tags=["Helping Hands"])

# Stripe setup (will be configured via environment)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

try:
    import stripe
    if STRIPE_SECRET_KEY:
        stripe.api_key = STRIPE_SECRET_KEY
except ImportError:
    stripe = None


# ============= Campaign Routes =============

@router.post("/campaigns", response_model=HelpingHandsCampaign)
async def create_campaign(
    campaign_data: CampaignCreateRequest,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a new Helping Hands campaign
    """
    db = get_db_client()
    
    # Generate campaign ID
    campaign_id = str(uuid4())
    
    # Prepare campaign document
    now = datetime.now(timezone.utc)
    campaign = {
        "_id": campaign_id,
        "id": campaign_id,
        "owner_id": current_user["id"],
        "is_personal": campaign_data.is_personal,
        "business_id": campaign_data.business_id,
        "title": campaign_data.title,
        "summary": campaign_data.summary,
        "story": campaign_data.story,
        "category": campaign_data.category,
        "city": campaign_data.city,
        "state": campaign_data.state,
        "goal_amount": campaign_data.goal_amount,
        "raised_amount": 0.0,
        "supporters_count": 0,
        "cover_image": campaign_data.cover_image,
        "gallery": campaign_data.gallery or [],
        "status": campaign_data.status,
        "featured": False,
        "created_at": now,
        "updated_at": now,
        "published_at": now if campaign_data.status == CampaignStatus.ACTIVE else None,
        "ends_at": None
    }
    
    await db.helpinghands_campaigns.insert_one(campaign)
    
    # TODO: If status is ACTIVE, create Social post
    # if campaign_data.status == CampaignStatus.ACTIVE:
    #     await create_social_post_for_campaign(campaign)
    
    return campaign


@router.get("/campaigns", response_model=CampaignListResponse)
async def list_campaigns(
    status: Optional[CampaignStatus] = Query(None),
    category: Optional[CampaignCategory] = Query(None),
    featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    List campaigns with filters
    """
    db = get_db_client()
    
    # Build query
    query = {}
    if status:
        query["status"] = status
    else:
        # Default: only show active campaigns to public
        query["status"] = CampaignStatus.ACTIVE
    
    if category:
        query["category"] = category
    
    if featured is not None:
        query["featured"] = featured
    
    # Count total
    total = await db.helpinghands_campaigns.count_documents(query)
    
    # Fetch campaigns
    skip = (page - 1) * limit
    cursor = db.helpinghands_campaigns.find(query).sort("created_at", -1).skip(skip).limit(limit)
    
    campaigns = await cursor.to_list(length=limit)
    
    return {
        "campaigns": campaigns,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": (skip + len(campaigns)) < total
    }


@router.get("/campaigns/{campaign_id}", response_model=HelpingHandsCampaign)
async def get_campaign(campaign_id: str):
    """
    Get single campaign details
    """
    db = get_db_client()
    
    campaign = await db.helpinghands_campaigns.find_one({"id": campaign_id})
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return campaign


@router.patch("/campaigns/{campaign_id}", response_model=HelpingHandsCampaign)
async def update_campaign(
    campaign_id: str,
    updates: CampaignUpdateRequest,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Update campaign (owner only)
    """
    db = get_db_client()
    
    # Verify ownership
    campaign = await db.helpinghands_campaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this campaign")
    
    # Build update dict
    update_data = {}
    if updates.title is not None:
        update_data["title"] = updates.title
    if updates.summary is not None:
        update_data["summary"] = updates.summary
    if updates.story is not None:
        update_data["story"] = updates.story
    if updates.category is not None:
        update_data["category"] = updates.category
    if updates.city is not None:
        update_data["city"] = updates.city
    if updates.state is not None:
        update_data["state"] = updates.state
    if updates.goal_amount is not None:
        update_data["goal_amount"] = updates.goal_amount
    if updates.cover_image is not None:
        update_data["cover_image"] = updates.cover_image
    if updates.gallery is not None:
        update_data["gallery"] = updates.gallery
    if updates.status is not None:
        update_data["status"] = updates.status
        # Set published_at if publishing for first time
        if updates.status == CampaignStatus.ACTIVE and not campaign.get("published_at"):
            update_data["published_at"] = datetime.now(timezone.utc)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Update
    await db.helpinghands_campaigns.update_one(
        {"id": campaign_id},
        {"$set": update_data}
    )
    
    # Fetch updated campaign
    updated_campaign = await db.helpinghands_campaigns.find_one(
        {"id": campaign_id},
        {"_id": 0}
    )
    
    return updated_campaign


# ============= Support/Donation Routes =============

@router.post("/campaigns/{campaign_id}/support", response_model=StripeCheckoutResponse)
async def create_support_checkout(
    campaign_id: str,
    support_data: SupportRequest
):
    """
    Create Stripe Checkout session for donation
    """
    if not stripe:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    db = get_db_client()
    
    # Verify campaign exists and is active
    campaign = await db.helpinghands_campaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign["status"] != CampaignStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Campaign is not accepting donations")
    
    # Validate amount
    if support_data.amount < 1.0:
        raise HTTPException(status_code=400, detail="Minimum donation is $1.00")
    
    # Create Stripe Checkout Session
    try:
        # Convert amount to cents
        amount_cents = int(support_data.amount * 100)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': amount_cents,
                    'product_data': {
                        'name': f'Support: {campaign["title"]}',
                        'description': f'Donation to {campaign["title"]} on BANIBS Helping Hands'
                    }
                },
                'quantity': 1
            }],
            mode='payment',
            success_url=f'{os.getenv("FRONTEND_URL", "http://localhost:3000")}/portal/helping-hands/campaign/{campaign_id}?success=true',
            cancel_url=f'{os.getenv("FRONTEND_URL", "http://localhost:3000")}/portal/helping-hands/campaign/{campaign_id}?canceled=true',
            metadata={
                'campaign_id': campaign_id,
                'supporter_name': support_data.supporter_name or 'Anonymous',
                'supporter_email': support_data.supporter_email,
                'visibility': support_data.visibility,
                'message': support_data.message or ''
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


# ============= Webhook Route =============

@router.post("/webhooks/stripe")
async def stripe_webhook(request):
    """
    Handle Stripe webhook events
    Processes successful payments and updates campaign data
    """
    if not stripe or not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Get payload and signature
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Extract metadata
        campaign_id = session['metadata']['campaign_id']
        supporter_name = session['metadata'].get('supporter_name', 'Anonymous')
        supporter_email = session['metadata']['supporter_email']
        visibility = session['metadata'].get('visibility', 'public')
        message = session['metadata'].get('message', '')
        
        # Get amount (convert from cents)
        amount = session['amount_total'] / 100.0
        
        db = get_db_client()
        
        # Create support record
        support_id = str(uuid4())
        support = {
            "_id": support_id,
            "id": support_id,
            "campaign_id": campaign_id,
            "supporter_id": None,  # TODO: Link to user if logged in
            "amount": amount,
            "stripe_payment_intent_id": session['payment_intent'],
            "stripe_charge_id": None,
            "supporter_name": supporter_name,
            "supporter_email": supporter_email,
            "visibility": visibility,
            "message": message,
            "supported_at": datetime.now(timezone.utc)
        }
        
        await db.helpinghands_supports.insert_one(support)
        
        # Update campaign raised_amount and supporters_count
        await db.helpinghands_campaigns.update_one(
            {"id": campaign_id},
            {
                "$inc": {
                    "raised_amount": amount,
                    "supporters_count": 1
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
    
    return {"status": "success"}


# ============= Report Routes =============

@router.post("/campaigns/{campaign_id}/report")
async def report_campaign(
    campaign_id: str,
    report_data: ReportCampaignRequest,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Report a campaign for moderation
    """
    db = get_db_client()
    
    # Verify campaign exists
    campaign = await db.helpinghands_campaigns.find_one({"id": campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Create report
    report_id = str(uuid4())
    report = {
        "_id": report_id,
        "id": report_id,
        "campaign_id": campaign_id,
        "reporter_id": current_user["id"],
        "reason": report_data.reason,
        "details": report_data.details,
        "reviewed": False,
        "reviewed_by": None,
        "reviewed_at": None,
        "action_taken": None,
        "reported_at": datetime.now(timezone.utc)
    }
    
    await db.helpinghands_reports.insert_one(report)
    
    return {"message": "Report submitted successfully"}


# ============= Admin Routes =============

@router.post("/admin/campaigns/{campaign_id}/pause")
async def admin_pause_campaign(
    campaign_id: str,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Admin: Pause a campaign
    """
    # TODO: Add admin role check
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    
    await db.helpinghands_campaigns.update_one(
        {"id": campaign_id},
        {"$set": {
            "status": CampaignStatus.PAUSED,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Campaign paused"}


@router.get("/admin/reports")
async def admin_list_reports(
    current_user: dict = Depends(require_role("user", "member")),
    reviewed: Optional[bool] = Query(None)
):
    """
    Admin: List moderation reports
    """
    # TODO: Add admin role check
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    
    query = {}
    if reviewed is not None:
        query["reviewed"] = reviewed
    
    reports = await db.helpinghands_reports.find(
        query,
        {"_id": 0}
    ).sort("reported_at", -1).to_list(length=100)
    
    return {"reports": reports}
