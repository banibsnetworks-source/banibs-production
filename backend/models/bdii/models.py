"""
BANIBS Device Inventory Intelligence (BDII) - Data Models
Version 1.0 - Phase 1
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class DeviceLifecycleStage(str, Enum):
    """Device model lifecycle stage"""
    ACTIVE = "ACTIVE"
    LEGACY = "LEGACY"
    EXPERIMENTAL = "EXPERIMENTAL"


class DeviceStatus(str, Enum):
    """Device unit status"""
    NEW = "NEW"
    REFURBISHED = "REFURBISHED"
    IN_USE = "IN_USE"
    IN_TRANSIT = "IN_TRANSIT"
    RESERVED = "RESERVED"
    SCRAPPED = "SCRAPPED"


class ConditionGrade(str, Enum):
    """Device condition grade"""
    A = "A"  # Like new
    B = "B"  # Good
    C = "C"  # Fair
    D = "D"  # Poor


class AccountStatus(str, Enum):
    """User account status"""
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"


# ==================== CORE MODELS ====================

class DeviceModel(BaseModel):
    """Device model/type definition"""
    id: str
    code: str  # e.g. "NEXA-1", "NEXA-2"
    name: str  # e.g. "NEXA One"
    lifecycle_stage: DeviceLifecycleStage = DeviceLifecycleStage.ACTIVE
    default_upgrade_after_months: Optional[int] = 18
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DeviceUnit(BaseModel):
    """Individual device unit"""
    id: str
    model_id: str  # Reference to DeviceModel
    serial_number: Optional[str] = None
    status: DeviceStatus = DeviceStatus.NEW
    condition_grade: ConditionGrade = ConditionGrade.A
    location: Optional[str] = None  # e.g. "ATL-DC-1", "Refurb-Center-1"
    cost_basis: Optional[float] = None
    acquired_at: Optional[datetime] = None
    last_status_change_at: datetime = Field(default_factory=datetime.utcnow)


class UserAccount(BaseModel):
    """User account (reference model)"""
    id: str
    email: str
    region: Optional[str] = None  # e.g. "US-GA", "NG-LAG"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: AccountStatus = AccountStatus.ACTIVE


class UserDeviceLink(BaseModel):
    """Link between user and device"""
    id: str
    user_id: str
    device_unit_id: str
    primary: bool = True
    activated_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen_at: Optional[datetime] = None
    daily_use_score: Optional[float] = None  # 0.0-1.0
    eligible_for_upgrade_at: Optional[datetime] = None
    last_upgrade_processed_at: Optional[datetime] = None


# ==================== CONFIGURATION MODELS ====================

class UpgradeEligibilityRule(BaseModel):
    """Rules for upgrade eligibility"""
    min_months_active: int = 18
    min_daily_use_score: float = 0.3
    min_link_duration_months: int = 6
    min_time_between_upgrades_months: int = 24
    allowed_condition_grades: List[str] = Field(default_factory=lambda: ["A", "B", "C"])
    max_simultaneous_upgrades_per_user: int = 1


class RecommendationConfig(BaseModel):
    """Configuration for inventory recommendations"""
    safety_stock_per_model: Dict[str, int] = Field(default_factory=dict)
    max_inventory_cost: Optional[float] = None
    preferred_refurb_ratio: float = 0.3
    default_upgrade_uptake_rate: float = 0.25
    default_new_user_device_rate: float = 0.7


# ==================== FORECAST MODELS ====================

class DemandForecastInput(BaseModel):
    """Input for demand forecasting"""
    horizon_days: int = 30
    region: Optional[str] = None
    include_new_users: bool = True
    include_upgrades: bool = True


class DemandForecastPerModel(BaseModel):
    """Demand forecast for a specific model"""
    model_code: str
    model_name: str
    estimated_new_user_devices: int = 0
    estimated_upgrade_devices: int = 0
    total_estimated_devices: int = 0
    eligible_users_count: int = 0
    assumptions: Dict[str, Any] = Field(default_factory=dict)


class DemandForecastResult(BaseModel):
    """Complete demand forecast result"""
    horizon_days: int
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    per_model: List[DemandForecastPerModel] = Field(default_factory=list)


# ==================== INVENTORY MODELS ====================

class InventoryPerModel(BaseModel):
    """Inventory snapshot for a specific model"""
    model_code: str
    model_name: str
    on_hand_new: int = 0
    on_hand_refurb: int = 0
    in_transit: int = 0
    reserved: int = 0
    scrapped: int = 0
    usable_refurb: int = 0  # Subset of refurb meeting condition rules


class InventorySnapshot(BaseModel):
    """Complete inventory snapshot"""
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    per_model: List[InventoryPerModel] = Field(default_factory=list)


# ==================== RECOMMENDATION MODELS ====================

class InventoryRecommendationPerModel(BaseModel):
    """Recommendation for a specific model"""
    model_code: str
    model_name: str
    projected_demand: int = 0
    projected_supply: int = 0
    shortage: int = 0
    surplus: int = 0
    recommended_refurb_target: int = 0
    recommended_new_purchase: int = 0
    recommended_pause_purchasing: bool = False


class InventoryRecommendation(BaseModel):
    """Complete inventory recommendation"""
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    horizon_days: int = 30
    region: Optional[str] = None
    per_model: List[InventoryRecommendationPerModel] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)


# ==================== API MODELS ====================

class RecommendationRequest(BaseModel):
    """Request for inventory recommendations"""
    horizon_days: int = 30
    region: Optional[str] = None


class BDIIConfig(BaseModel):
    """Complete BDII configuration"""
    upgrade_eligibility: UpgradeEligibilityRule
    recommendation: RecommendationConfig
