"""
BANIBS Wallet / Fintech - Data Models
Phase 14.0 - Own the flow of Black money
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
from datetime import datetime
from enum import Enum


class AccountType(str, Enum):
    """Types of wallet accounts"""
    PERSONAL = "personal"
    BUSINESS = "business"
    FAMILY = "family"


class TransactionType(str, Enum):
    """Transaction types"""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class GoalStatus(str, Enum):
    """Goal statuses"""
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class GoalCategory(str, Enum):
    """Goal categories"""
    SAVINGS = "savings"
    DEBT = "debt"
    INVESTMENT = "investment"


class InsightPeriod(str, Enum):
    """Insight time periods"""
    LAST_30_DAYS = "last_30_days"
    LAST_90_DAYS = "last_90_days"
    YEAR_TO_DATE = "year_to_date"
    CUSTOM = "custom"


# ==================== WALLET ACCOUNT ====================

class WalletAccount(BaseModel):
    """Wallet account model"""
    id: str
    user_id: str
    name: str
    type: AccountType
    currency: str = "USD"
    current_balance: float
    starting_balance: float
    created_at: datetime
    updated_at: datetime
    is_primary: bool = False
    is_archived: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "acc-001",
                "user_id": "user-001",
                "name": "Main Wallet",
                "type": "personal",
                "currency": "USD",
                "current_balance": 1250.00,
                "starting_balance": 1000.00,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T12:00:00Z",
                "is_primary": True,
                "is_archived": False
            }
        }


class WalletAccountCreate(BaseModel):
    """Request model for creating a wallet account"""
    name: str = Field(..., min_length=1, max_length=100)
    type: AccountType = AccountType.PERSONAL
    starting_balance: float = Field(default=0.0)
    is_primary: bool = False


class WalletAccountUpdate(BaseModel):
    """Request model for updating a wallet account"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_primary: Optional[bool] = None
    is_archived: Optional[bool] = None


# ==================== WALLET TRANSACTION ====================

class WalletTransaction(BaseModel):
    """Wallet transaction model"""
    id: str
    user_id: str
    account_id: str
    amount: float
    type: TransactionType
    category: str
    description: Optional[str] = None
    merchant_name: Optional[str] = None
    merchant_id: Optional[str] = None
    is_black_owned: Optional[bool] = None
    date: datetime
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "txn-001",
                "user_id": "user-001",
                "account_id": "acc-001",
                "amount": -45.50,
                "type": "expense",
                "category": "groceries",
                "description": "Weekly grocery shopping",
                "merchant_name": "Black Farmers Market",
                "merchant_id": None,
                "is_black_owned": True,
                "date": "2024-01-15T10:30:00Z",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }


class WalletTransactionCreate(BaseModel):
    """Request model for creating a transaction"""
    account_id: str
    amount: float
    type: TransactionType
    category: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    merchant_name: Optional[str] = Field(None, max_length=200)
    merchant_id: Optional[str] = None
    is_black_owned: Optional[bool] = None
    date: Optional[datetime] = None


# ==================== WALLET GOAL ====================

class WalletGoal(BaseModel):
    """Wallet goal model"""
    id: str
    user_id: str
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime] = None
    category: GoalCategory
    linked_account_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: GoalStatus
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "goal-001",
                "user_id": "user-001",
                "name": "Emergency Fund",
                "target_amount": 1000.00,
                "current_amount": 350.00,
                "deadline": "2024-12-31T23:59:59Z",
                "category": "savings",
                "linked_account_id": "acc-001",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T12:00:00Z",
                "status": "active"
            }
        }


class WalletGoalCreate(BaseModel):
    """Request model for creating a goal"""
    name: str = Field(..., min_length=1, max_length=200)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0.0, ge=0)
    deadline: Optional[datetime] = None
    category: GoalCategory
    linked_account_id: Optional[str] = None


class WalletGoalUpdate(BaseModel):
    """Request model for updating a goal"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    deadline: Optional[datetime] = None
    status: Optional[GoalStatus] = None


# ==================== WALLET ENVELOPE ====================

class WalletEnvelope(BaseModel):
    """Wallet envelope (budget category) model"""
    id: str
    user_id: str
    name: str
    monthly_budget: float
    current_spend: float
    category: str
    created_at: datetime
    updated_at: datetime
    active: bool
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "env-001",
                "user_id": "user-001",
                "name": "Groceries",
                "monthly_budget": 500.00,
                "current_spend": 245.50,
                "category": "groceries",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T12:00:00Z",
                "active": True
            }
        }


class WalletEnvelopeCreate(BaseModel):
    """Request model for creating an envelope"""
    name: str = Field(..., min_length=1, max_length=100)
    monthly_budget: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)


class WalletEnvelopeUpdate(BaseModel):
    """Request model for updating an envelope"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    monthly_budget: Optional[float] = Field(None, gt=0)
    active: Optional[bool] = None


# ==================== WALLET FAMILY PROFILE ====================

class WalletFamilyProfile(BaseModel):
    """Wallet family/household profile model"""
    id: str
    owner_user_id: str
    member_user_ids: List[str]
    name: str
    created_at: datetime
    updated_at: datetime
    permissions: Dict[str, List[str]] = {}
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "fam-001",
                "owner_user_id": "user-001",
                "member_user_ids": ["user-001", "user-002"],
                "name": "Johnson Household",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "permissions": {}
            }
        }


class WalletFamilyProfileCreate(BaseModel):
    """Request model for creating a family profile"""
    name: str = Field(..., min_length=1, max_length=200)


# ==================== WALLET INSIGHT SNAPSHOT ====================

class WalletInsightSnapshot(BaseModel):
    """Wallet insight snapshot model"""
    id: str
    user_id: str
    period: InsightPeriod
    start_date: datetime
    end_date: datetime
    total_spent: float
    spent_black_owned: float
    spent_non_black: float
    spent_unknown: float
    top_categories: List[Dict]
    top_merchants: List[Dict]
    generated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "ins-001",
                "user_id": "user-001",
                "period": "last_30_days",
                "start_date": "2023-12-15T00:00:00Z",
                "end_date": "2024-01-15T00:00:00Z",
                "total_spent": 1250.00,
                "spent_black_owned": 450.00,
                "spent_non_black": 600.00,
                "spent_unknown": 200.00,
                "top_categories": [
                    {"name": "groceries", "amount": 450.00},
                    {"name": "gas", "amount": 300.00}
                ],
                "top_merchants": [
                    {"name": "Black Farmers Market", "amount": 200.00}
                ],
                "generated_at": "2024-01-15T12:00:00Z"
            }
        }


# Response models

class WalletAccountsResponse(BaseModel):
    """Response model for listing accounts"""
    accounts: List[WalletAccount]
    total: int


class WalletTransactionsResponse(BaseModel):
    """Response model for listing transactions"""
    transactions: List[WalletTransaction]
    total: int


class WalletGoalsResponse(BaseModel):
    """Response model for listing goals"""
    goals: List[WalletGoal]
    total: int


class WalletEnvelopesResponse(BaseModel):
    """Response model for listing envelopes"""
    envelopes: List[WalletEnvelope]
    total: int
