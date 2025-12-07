"""
BDII API Routes
Version 1.0 - Phase 1
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime

from backend.models.bdii.models import (
    InventorySnapshot,
    DemandForecastInput,
    DemandForecastResult,
    RecommendationRequest,
    InventoryRecommendation,
    BDIIConfig,
    UpgradeEligibilityRule,
    RecommendationConfig,
    DeviceModel,
    DeviceUnit,
    UserDeviceLink,
    DeviceStatus,
    ConditionGrade,
    DeviceLifecycleStage,
)
from backend.services.bdii.bdii_engine import BDIIEngine

router = APIRouter(prefix="/api/bdii", tags=["BDII"])

# Default configuration (in Phase 2, load from YAML or DB)
DEFAULT_UPGRADE_RULES = UpgradeEligibilityRule(
    min_months_active=18,
    min_daily_use_score=0.3,
    min_link_duration_months=6,
    min_time_between_upgrades_months=24,
    allowed_condition_grades=["A", "B", "C"],
    max_simultaneous_upgrades_per_user=1
)

DEFAULT_RECOMMENDATION_CONFIG = RecommendationConfig(
    safety_stock_per_model={
        "NEXA-1": 500,
        "NEXA-2": 300
    },
    max_inventory_cost=None,
    preferred_refurb_ratio=0.3,
    default_upgrade_uptake_rate=0.25,
    default_new_user_device_rate=0.7
)

# Initialize engine
bdii_engine = BDIIEngine(
    recommendation_config=DEFAULT_RECOMMENDATION_CONFIG,
    upgrade_eligibility_rule=DEFAULT_UPGRADE_RULES
)


# ==================== MOCK DATA HELPERS ====================
# In Phase 1, we'll use mock data. In Phase 2, connect to MongoDB

def get_mock_device_models():
    """Get mock device models"""
    return [
        DeviceModel(
            id="model_1",
            code="NEXA-1",
            name="NEXA One",
            lifecycle_stage=DeviceLifecycleStage.ACTIVE,
            default_upgrade_after_months=18
        ),
        DeviceModel(
            id="model_2",
            code="NEXA-2",
            name="NEXA Two",
            lifecycle_stage=DeviceLifecycleStage.ACTIVE,
            default_upgrade_after_months=24
        )
    ]


def get_mock_device_units():
    """Get mock device units"""
    units = []
    
    # NEXA-1 units
    for i in range(800):
        status = DeviceStatus.NEW if i < 400 else DeviceStatus.REFURBISHED
        grade = ConditionGrade.A if i < 600 else ConditionGrade.B
        
        units.append(DeviceUnit(
            id=f"unit_nexa1_{i}",
            model_id="model_1",
            serial_number=f"NEXA1-{i:06d}",
            status=status,
            condition_grade=grade,
            location="ATL-DC-1"
        ))
    
    # NEXA-2 units
    for i in range(500):
        status = DeviceStatus.NEW if i < 250 else DeviceStatus.REFURBISHED
        grade = ConditionGrade.A if i < 400 else ConditionGrade.C
        
        units.append(DeviceUnit(
            id=f"unit_nexa2_{i}",
            model_id="model_2",
            serial_number=f"NEXA2-{i:06d}",
            status=status,
            condition_grade=grade,
            location="ATL-DC-1"
        ))
    
    return units


def get_mock_user_device_links():
    """Get mock user device links"""
    links = []
    now = datetime.utcnow()
    
    # Create 1000 user-device links
    for i in range(1000):
        # Mix of devices nearing upgrade eligibility
        months_ago = 12 + (i % 12)  # Between 12-24 months
        
        links.append(UserDeviceLink(
            id=f"link_{i}",
            user_id=f"user_{i}",
            device_unit_id=f"unit_nexa1_{i % 800}",
            primary=True,
            activated_at=datetime(2023, 1, 1),
            last_seen_at=now,
            daily_use_score=0.5 + (i % 50) / 100.0,  # 0.5-1.0
            eligible_for_upgrade_at=now if i % 3 == 0 else None
        ))
    
    return links


# ==================== API ENDPOINTS ====================

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BDII",
        "version": "1.0",
        "phase": "1"
    }


@router.get("/inventory/snapshot", response_model=InventorySnapshot)
async def get_inventory_snapshot(region: Optional[str] = None):
    """
    Get current inventory snapshot
    
    Args:
        region: Optional region filter
        
    Returns:
        InventorySnapshot with per-model counts
    """
    try:
        # Get mock data
        device_models = get_mock_device_models()
        device_units = get_mock_device_units()
        
        # Compute snapshot
        snapshot = bdii_engine.compute_inventory_snapshot(
            device_models=device_models,
            device_units=device_units,
            region=region
        )
        
        return snapshot
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute inventory snapshot: {str(e)}"
        )


@router.post("/demand/forecast", response_model=DemandForecastResult)
async def forecast_demand(forecast_input: DemandForecastInput):
    """
    Forecast device demand
    
    Args:
        forecast_input: Forecast parameters
        
    Returns:
        DemandForecastResult with per-model projections
    """
    try:
        # Get mock data
        device_models = get_mock_device_models()
        user_device_links = get_mock_user_device_links()
        
        # Compute eligibility first
        device_units = get_mock_device_units()
        user_device_links = bdii_engine.compute_upgrade_eligibility(
            user_device_links=user_device_links,
            device_units=device_units
        )
        
        # Forecast demand
        forecast = bdii_engine.forecast_demand(
            forecast_input=forecast_input,
            device_models=device_models,
            user_device_links=user_device_links,
            total_active_users=10000  # Mock value
        )
        
        return forecast
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to forecast demand: {str(e)}"
        )


@router.post("/recommendations", response_model=InventoryRecommendation)
async def get_recommendations(request: RecommendationRequest):
    """
    Generate inventory recommendations
    
    Args:
        request: Recommendation parameters (horizon_days, region)
        
    Returns:
        InventoryRecommendation with per-model actions
    """
    try:
        # Get mock data
        device_models = get_mock_device_models()
        device_units = get_mock_device_units()
        user_device_links = get_mock_user_device_links()
        
        # Compute inventory snapshot
        snapshot = bdii_engine.compute_inventory_snapshot(
            device_models=device_models,
            device_units=device_units,
            region=request.region
        )
        
        # Compute eligibility
        user_device_links = bdii_engine.compute_upgrade_eligibility(
            user_device_links=user_device_links,
            device_units=device_units
        )
        
        # Forecast demand
        forecast_input = DemandForecastInput(
            horizon_days=request.horizon_days,
            region=request.region
        )
        forecast = bdii_engine.forecast_demand(
            forecast_input=forecast_input,
            device_models=device_models,
            user_device_links=user_device_links,
            total_active_users=10000
        )
        
        # Generate recommendations
        recommendations = bdii_engine.generate_recommendations(
            forecast=forecast,
            snapshot=snapshot
        )
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/config", response_model=BDIIConfig)
async def get_config():
    """
    Get current BDII configuration
    
    Returns:
        BDIIConfig with upgrade rules and recommendation settings
    """
    return BDIIConfig(
        upgrade_eligibility=DEFAULT_UPGRADE_RULES,
        recommendation=DEFAULT_RECOMMENDATION_CONFIG
    )
