from fastapi import APIRouter, Depends
from typing import Optional, List, Dict, Any

from db.connection import get_db
from db.sponsor_orders import get_all_sponsor_orders, get_total_revenue
from db.newsletter import get_all_subscribers
from db.newsletter_sends import get_last_newsletter_send
from middleware.auth_guard import require_super_admin

router = APIRouter(prefix="/api/admin/revenue", tags=["admin-revenue"])

# Phase 5.5 - Admin Revenue & Reach Overview

@router.get("/overview")
async def get_revenue_overview(
    db=Depends(get_db),
    user: dict = Depends(require_super_admin)
):
    """
    Get revenue and reach metrics overview
    
    Phase 5.5 - Admin Revenue Panel
    Super admin only
    
    Returns:
    - Total sponsored orders count (paid)
    - Total sponsored revenue in USD
    - Recent sponsor orders
    - Newsletter subscribers count
    - Last newsletter send details
    """
    # Get total sponsored orders (paid)
    paid_orders = await get_all_sponsor_orders(status="paid", limit=1000)
    total_sponsored_orders = len(paid_orders)
    
    # Get total revenue
    total_revenue = await get_total_revenue()
    
    # Get recent sponsor orders (last 10)
    recent_orders = await get_all_sponsor_orders(status="paid", limit=10)
    recent_sponsor_orders = [
        {
            "opportunityId": order['opportunity_id'],
            "contributorId": order['contributor_id'],
            "amount": order['amount'],
            "currency": order['currency'],
            "paidAt": order.get('paid_at')
        }
        for order in recent_orders
    ]
    
    # Get newsletter subscribers count
    subscribers = await get_all_subscribers(db)
    confirmed_subscribers = [
        sub for sub in subscribers 
        if sub.get("confirmed", True)
    ]
    newsletter_subscribers_count = len(confirmed_subscribers)
    
    # Get last newsletter send
    last_send = await get_last_newsletter_send()
    last_newsletter_send = None
    if last_send:
        last_newsletter_send = {
            "timestamp": last_send.get('sent_at'),
            "recipientsCount": last_send.get('total_subscribers', 0)
        }
    
    return {
        "totalSponsoredOrders": total_sponsored_orders,
        "totalSponsoredRevenueUSD": total_revenue,
        "recentSponsorOrders": recent_sponsor_orders,
        "newsletterSubscribersCount": newsletter_subscribers_count,
        "lastNewsletterSend": last_newsletter_send
    }
