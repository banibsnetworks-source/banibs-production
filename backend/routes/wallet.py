"""
BANIBS Wallet - API Routes
Phase 14.0 - All routes require authentication
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta
from db.connection import get_db_client
from db.wallet import WalletDB
from models.wallet import (
    WalletAccountsResponse,
    WalletAccount,
    WalletAccountCreate,
    WalletAccountUpdate,
    WalletTransactionsResponse,
    WalletTransaction,
    WalletTransactionCreate,
    WalletGoalsResponse,
    WalletGoal,
    WalletGoalCreate,
    WalletGoalUpdate,
    WalletEnvelopesResponse,
    WalletEnvelope,
    WalletEnvelopeCreate,
    WalletEnvelopeUpdate,
    WalletFamilyProfile,
    WalletFamilyProfileCreate,
    WalletInsightSnapshot
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


# ==================== ACCOUNTS ====================

@router.get("/accounts", response_model=WalletAccountsResponse)
async def get_accounts(current_user: dict = Depends(get_current_user)):
    """Get all wallet accounts for current user"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    accounts = await wallet_db.get_accounts_for_user(current_user["id"])
    return {"accounts": accounts, "total": len(accounts)}


@router.post("/accounts", response_model=WalletAccount)
async def create_account(
    account_data: WalletAccountCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new wallet account"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    account = await wallet_db.create_wallet_account(
        current_user["id"],
        account_data.dict()
    )
    return account


@router.patch("/accounts/{account_id}", response_model=WalletAccount)
async def update_account(
    account_id: str,
    updates: WalletAccountUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a wallet account"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Only update non-None fields
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    account = await wallet_db.update_account(account_id, current_user["id"], update_data)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account


# ==================== TRANSACTIONS ====================

@router.get("/transactions", response_model=WalletTransactionsResponse)
async def get_transactions(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    """Get filtered transactions for current user"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Parse dates
    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
    
    transactions = await wallet_db.get_transactions_for_user(
        user_id=current_user["id"],
        start_date=start_dt,
        end_date=end_dt,
        category=category,
        transaction_type=type,
        account_id=account_id,
        limit=limit
    )
    
    return {"transactions": transactions, "total": len(transactions)}


@router.post("/transactions", response_model=WalletTransaction)
async def create_transaction(
    transaction_data: WalletTransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new transaction"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Verify account belongs to user
    account = await wallet_db.get_account_by_id(
        transaction_data.account_id,
        current_user["id"]
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    transaction = await wallet_db.create_transaction(
        current_user["id"],
        transaction_data.dict()
    )
    
    return transaction


# ==================== ENVELOPES (BUDGETS) ====================

@router.get("/envelopes", response_model=WalletEnvelopesResponse)
async def get_envelopes(current_user: dict = Depends(get_current_user)):
    """Get all budget envelopes for current user"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    envelopes = await wallet_db.get_envelopes_for_user(current_user["id"])
    return {"envelopes": envelopes, "total": len(envelopes)}


@router.post("/envelopes", response_model=WalletEnvelope)
async def create_envelope(
    envelope_data: WalletEnvelopeCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new budget envelope"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    envelope = await wallet_db.create_envelope(
        current_user["id"],
        envelope_data.dict()
    )
    return envelope


@router.patch("/envelopes/{envelope_id}", response_model=WalletEnvelope)
async def update_envelope(
    envelope_id: str,
    updates: WalletEnvelopeUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a budget envelope"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Only update non-None fields
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    envelope = await wallet_db.update_envelope(envelope_id, current_user["id"], update_data)
    if not envelope:
        raise HTTPException(status_code=404, detail="Envelope not found")
    
    return envelope


# ==================== GOALS ====================

@router.get("/goals", response_model=WalletGoalsResponse)
async def get_goals(current_user: dict = Depends(get_current_user)):
    """Get all goals for current user"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    goals = await wallet_db.get_goals_for_user(current_user["id"])
    return {"goals": goals, "total": len(goals)}


@router.post("/goals", response_model=WalletGoal)
async def create_goal(
    goal_data: WalletGoalCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new goal"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    goal = await wallet_db.create_goal(
        current_user["id"],
        goal_data.dict()
    )
    return goal


@router.patch("/goals/{goal_id}", response_model=WalletGoal)
async def update_goal(
    goal_id: str,
    updates: WalletGoalUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a goal"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Only update non-None fields
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    goal = await wallet_db.update_goal(goal_id, current_user["id"], update_data)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal


# ==================== INSIGHTS ====================

@router.get("/insights/summary", response_model=WalletInsightSnapshot)
async def get_insights_summary(
    period: str = Query("last_30_days"),
    current_user: dict = Depends(get_current_user)
):
    """Get spending insights for a period"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Check for cached insight
    cached = await wallet_db.get_latest_insight(current_user["id"], period)
    if cached:
        return cached
    
    # Calculate date range
    end_date = datetime.utcnow()
    if period == "last_30_days":
        start_date = end_date - timedelta(days=30)
    elif period == "last_90_days":
        start_date = end_date - timedelta(days=90)
    elif period == "year_to_date":
        start_date = datetime(end_date.year, 1, 1)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Generate new insight
    insight = await wallet_db.generate_insight_snapshot(
        current_user["id"],
        period,
        start_date,
        end_date
    )
    
    return insight


# ==================== FAMILY PROFILE ====================

@router.get("/family")
async def get_family_profile(current_user: dict = Depends(get_current_user)):
    """Get family profile for current user"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    profile = await wallet_db.get_family_profile_for_user(current_user["id"])
    
    if not profile:
        return {"family_profile": None, "message": "No family profile found"}
    
    return profile


@router.post("/family", response_model=WalletFamilyProfile)
async def create_family_profile(
    profile_data: WalletFamilyProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a family profile"""
    db = get_db_client()
    wallet_db = WalletDB(db)
    
    # Check if user already has a family profile
    existing = await wallet_db.get_family_profile_for_user(current_user["id"])
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User already has a family profile"
        )
    
    profile = await wallet_db.create_family_profile(
        current_user["id"],
        profile_data.dict()
    )
    
    return profile
