"""
BANIBS Global Marketplace - Payout API Routes
Phase 16.2 - Seller Payout Engine
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from models.marketplace import (
    MarketplacePayoutRequest,
    PayoutRequestCreate,
    PayoutStatusUpdate,
    PayoutOverview,
    PayoutRequestsResponse
)
from db.marketplace_payouts import MarketplacePayoutDB
from middleware.auth_guard import get_current_user
from db.connection import get_db_client


router = APIRouter(prefix="/api/marketplace/payouts", tags=["Marketplace Payouts"])

# Minimum payout amount
MIN_PAYOUT_AMOUNT = 20.00


# ==================== SELLER ENDPOINTS ====================

@router.get("/overview", response_model=PayoutOverview)
async def get_payout_overview(
    current_user: dict = Depends(get_current_user)
):
    """Get seller's payout overview"""
    db = get_db_client()
    payout_db = MarketplacePayoutDB(db)
    user_id = current_user["id"]
    
    # Get seller profile
    seller = await payout_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    # Get last payout date
    last_payout_at = await payout_db.get_last_payout_date(seller["id"])
    
    return {
        "pending_payout_balance": seller.get("pending_payout_balance", 0.0),
        "available_payout_balance": seller.get("available_payout_balance", 0.0),
        "lifetime_payouts": seller.get("lifetime_payouts", 0.0),
        "last_payout_at": last_payout_at
    }


@router.get("/my", response_model=PayoutRequestsResponse)
async def get_my_payout_requests(
    current_user: dict = Depends(get_current_user)
):
    """Get current seller's payout requests"""
    db = get_db_client()
    payout_db = MarketplacePayoutDB(db)
    user_id = current_user["id"]
    
    # Get seller profile
    seller = await payout_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    # Get payout requests
    payouts = await payout_db.list_payout_requests_for_seller(seller["id"])
    
    return {
        "payouts": payouts,
        "total": len(payouts)
    }


@router.post("/request", response_model=MarketplacePayoutRequest)
async def create_payout_request(
    payout_data: PayoutRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new payout request
    
    Rules:
    - Amount must be >= $20.00
    - Amount must be <= available_payout_balance
    - Deducts amount from available_payout_balance immediately
    """
    db = get_db_client()
    payout_db = MarketplacePayoutDB(db)
    user_id = current_user["id"]
    
    # Get seller profile
    seller = await payout_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    # Validate minimum amount
    if payout_data.amount < MIN_PAYOUT_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum payout amount is ${MIN_PAYOUT_AMOUNT:.2f}"
        )
    
    # Check available balance
    available_balance = seller.get("available_payout_balance", 0.0)
    if payout_data.amount > available_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient available balance. You have ${available_balance:.2f} available."
        )
    
    # Deduct from available balance
    updated_seller = await payout_db.update_seller_balance(
        seller_id=seller["id"],
        available_delta=-payout_data.amount
    )
    
    if not updated_seller:
        raise HTTPException(status_code=500, detail="Failed to update seller balance")
    
    # Create payout request
    payout_request = await payout_db.create_payout_request(
        seller_id=seller["id"],
        user_id=user_id,
        amount=payout_data.amount,
        method=payout_data.method.value,
        method_details=payout_data.method_details
    )
    
    # Log event (using a generic order_id or create separate payout events)
    # For now, we'll log to order_events with a special marker
    await payout_db.create_payout_event(
        order_id=f"payout-{payout_request['id']}",  # Special marker
        event_type="payout_requested",
        actor=user_id,
        metadata={
            "payout_id": payout_request["id"],
            "amount_requested": payout_data.amount,
            "method": payout_data.method.value,
            "seller_id": seller["id"]
        }
    )
    
    return payout_request


# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/all", response_model=PayoutRequestsResponse)
async def get_all_payout_requests(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all payout requests (admin only)"""
    # Check if user is admin
    if "admin" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    payout_db = MarketplacePayoutDB(db)
    
    # Get payout requests
    payouts = await payout_db.list_payout_requests_for_admin(status=status)
    
    return {
        "payouts": payouts,
        "total": len(payouts)
    }


@router.post("/admin/{payout_id}/status", response_model=MarketplacePayoutRequest)
async def update_payout_status(
    payout_id: str,
    status_update: PayoutStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update payout request status (admin only)
    
    When marking as COMPLETED:
    - amount_approved is added to seller's lifetime_payouts
    - Payout is marked as processed
    """
    # Check if user is admin
    if "admin" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    payout_db = MarketplacePayoutDB(db)
    
    # Get payout request
    payout = await payout_db.get_payout_by_id(payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found")
    
    # Update payout status
    updated_payout = await payout_db.update_payout_status(
        payout_id=payout_id,
        new_status=status_update.status.value,
        amount_approved=status_update.amount_approved,
        admin_note=status_update.admin_note
    )
    
    if not updated_payout:
        raise HTTPException(status_code=500, detail="Failed to update payout status")
    
    # If completed, update seller's lifetime_payouts
    if status_update.status.value == "completed":
        amount_to_add = status_update.amount_approved or payout["amount_requested"]
        
        await payout_db.update_seller_balance(
            seller_id=payout["seller_id"],
            lifetime_delta=amount_to_add
        )
        
        # Log completion event
        await payout_db.create_payout_event(
            order_id=f"payout-{payout_id}",
            event_type="payout_completed",
            actor=current_user["id"],
            metadata={
                "payout_id": payout_id,
                "amount_approved": amount_to_add,
                "seller_id": payout["seller_id"],
                "admin_note": status_update.admin_note
            }
        )
    
    # If rejected, refund the available balance
    elif status_update.status.value == "rejected":
        await payout_db.update_seller_balance(
            seller_id=payout["seller_id"],
            available_delta=payout["amount_requested"]  # Refund to available
        )
        
        # Log rejection event
        await payout_db.create_payout_event(
            order_id=f"payout-{payout_id}",
            event_type="payout_rejected",
            actor=current_user["id"],
            metadata={
                "payout_id": payout_id,
                "amount_refunded": payout["amount_requested"],
                "seller_id": payout["seller_id"],
                "admin_note": status_update.admin_note
            }
        )
    
    # Log approved event
    elif status_update.status.value == "approved":
        await payout_db.create_payout_event(
            order_id=f"payout-{payout_id}",
            event_type="payout_approved",
            actor=current_user["id"],
            metadata={
                "payout_id": payout_id,
                "amount_approved": status_update.amount_approved or payout["amount_requested"],
                "seller_id": payout["seller_id"],
                "admin_note": status_update.admin_note
            }
        )
    
    return updated_payout
