from fastapi import APIRouter, HTTPException, Depends, Request
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Dict, Any
import os
import stripe
from datetime import datetime, timezone

from models.sponsor_order import SponsorCheckoutRequest, SponsorCheckoutResponse
from db import sponsor_orders
from db.opportunities_legacy import get_opportunity_by_id, update_opportunity_sponsor_status
from middleware.auth_guard import require_auth

router = APIRouter(prefix="/api/sponsor", tags=["sponsor"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration - gracefully handle missing env vars
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
SPONSORED_PRICE_USD = float(os.environ.get('SPONSORED_PRICE_USD', '99.0'))

# Only initialize Stripe if key is present
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

def check_stripe_configured():
    """Check if Stripe is configured, raise error if not"""
    if not STRIPE_SECRET_KEY or not STRIPE_PUBLIC_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe configuration missing. Please contact administrator."
        )

@router.post("/checkout", response_model=SponsorCheckoutResponse)
async def create_sponsor_checkout(
    request: SponsorCheckoutRequest,
    user: dict = Depends(require_auth)
):
    """
    Create Stripe Checkout Session for sponsored placement
    
    Phase 5.1 - Paid Sponsored Placement
    
    Requirements:
    - User must be authenticated as contributor
    - Opportunity must exist, be approved, and belong to this contributor
    - Stripe must be configured
    
    Returns:
    - checkout_url: Stripe Checkout Session URL
    - order_id: UUID of the created sponsor order
    """
    # Check Stripe configuration
    check_stripe_configured()
    
    # Verify this is a contributor (not admin)
    if user.get('type') != 'contributor':
        raise HTTPException(
            status_code=403,
            detail="Only contributors can sponsor their own opportunities"
        )
    
    contributor_id = user.get('id')
    
    # Fetch opportunity
    opportunity = await get_opportunity_by_id(db, request.opportunity_id)
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Verify ownership
    if opportunity.get('contributor_id') != contributor_id:
        raise HTTPException(
            status_code=403,
            detail="You can only sponsor your own opportunities"
        )
    
    # Verify it's approved
    if not opportunity.get('approved') or opportunity.get('status') != 'approved':
        raise HTTPException(
            status_code=400,
            detail="Only approved opportunities can be sponsored"
        )
    
    # Check if already sponsored
    if opportunity.get('is_sponsored'):
        raise HTTPException(
            status_code=400,
            detail="This opportunity is already sponsored"
        )
    
    # Create sponsor order record (pending)
    order_data = {
        'opportunity_id': request.opportunity_id,
        'contributor_id': contributor_id,
        'amount': SPONSORED_PRICE_USD,
        'currency': 'USD',
        'status': 'pending',
        'sponsor_label': request.sponsor_label
    }
    
    order = await sponsor_orders.create_sponsor_order(order_data)
    order_id = order['id']
    
    # Get frontend URL for success/cancel redirects
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    
    # Create Stripe Checkout Session
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': int(SPONSORED_PRICE_USD * 100),  # Convert to cents
                        'product_data': {
                            'name': f'Sponsored Placement: {opportunity.get("title")}',
                            'description': f'Promote your opportunity on BANIBS',
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f'{frontend_url}/contributor/my-opportunities?payment=success&order_id={order_id}',
            cancel_url=f'{frontend_url}/contributor/my-opportunities?payment=cancelled',
            metadata={
                'order_id': order_id,
                'opportunity_id': request.opportunity_id,
                'contributor_id': contributor_id
            }
        )
        
        # Update order with Stripe session ID
        await sponsor_orders.update_sponsor_order(
            order_id,
            {'stripe_session_id': checkout_session.id}
        )
        
        return SponsorCheckoutResponse(
            checkout_url=checkout_session.url,
            order_id=order_id
        )
        
    except stripe.error.StripeError as e:
        # Update order status to failed
        await sponsor_orders.update_sponsor_order(order_id, {'status': 'failed'})
        raise HTTPException(
            status_code=500,
            detail=f"Stripe error: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    
    Phase 5.1 - Process successful payments
    
    On successful payment:
    - Mark sponsor_orders.status = 'paid'
    - Set sponsor_orders.paid_at
    - Update opportunity: is_sponsored = true, sponsor_label
    """
    # Check Stripe webhook secret
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Stripe webhook secret not configured"
        )
    
    # Get raw body
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    
    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Get order_id from metadata
        order_id = session['metadata'].get('order_id')
        opportunity_id = session['metadata'].get('opportunity_id')
        
        if not order_id or not opportunity_id:
            # Log error but return 200 to acknowledge webhook
            print(f"WARNING: Webhook missing metadata: {session['metadata']}")
            return {"status": "missing_metadata"}
        
        # Update sponsor order to 'paid'
        update_data = {
            'status': 'paid',
            'paid_at': datetime.now(timezone.utc).isoformat(),
            'stripe_payment_intent_id': session.get('payment_intent')
        }
        
        await sponsor_orders.update_sponsor_order(order_id, update_data)
        
        # Fetch order to get sponsor_label
        order = await sponsor_orders.get_sponsor_order_by_id(order_id)
        
        if order:
            # Update opportunity to sponsored
            await update_opportunity_sponsor_status(
                db,
                opportunity_id,
                is_sponsored=True,
                sponsor_label=order.get('sponsor_label')
            )
        
        return {"status": "success", "order_id": order_id}
    
    # Return 200 for other event types
    return {"status": "ignored"}

@router.get("/config")
async def get_stripe_config():
    """
    Return Stripe public key for frontend (if configured)
    """
    if not STRIPE_PUBLIC_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe configuration missing"
        )
    
    return {
        "publicKey": STRIPE_PUBLIC_KEY,
        "sponsoredPriceUSD": SPONSORED_PRICE_USD
    }
