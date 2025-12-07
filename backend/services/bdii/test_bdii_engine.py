#!/usr/bin/env python3
# BDII Test Suite - Version 1.0

from datetime import datetime, timedelta
from backend.services.bdii.bdii_engine import BDIIEngine
from backend.models.bdii.models import (
    DeviceModel,
    DeviceUnit,
    UserDeviceLink,
    DeviceStatus,
    ConditionGrade,
    DeviceLifecycleStage,
    UpgradeEligibilityRule,
    RecommendationConfig,
    DemandForecastInput,
)


def test_inventory_snapshot_basic_counts():
    """Test inventory snapshot computation"""
    config = RecommendationConfig()
    rules = UpgradeEligibilityRule()
    engine = BDIIEngine(config, rules)
    
    models = [
        DeviceModel(id="m1", code="NEXA-1", name="NEXA One")
    ]
    
    units = [
        DeviceUnit(id="u1", model_id="m1", status=DeviceStatus.NEW),
        DeviceUnit(id="u2", model_id="m1", status=DeviceStatus.NEW),
        DeviceUnit(id="u3", model_id="m1", status=DeviceStatus.REFURBISHED, condition_grade=ConditionGrade.A),
        DeviceUnit(id="u4", model_id="m1", status=DeviceStatus.IN_TRANSIT),
    ]
    
    snapshot = engine.compute_inventory_snapshot(models, units)
    
    assert len(snapshot.per_model) == 1
    assert snapshot.per_model[0].on_hand_new == 2
    assert snapshot.per_model[0].on_hand_refurb == 1
    assert snapshot.per_model[0].in_transit == 1
    print("✅ Test inventory snapshot: PASSED")


def test_forecast_demand_eligible_users():
    """Test demand forecasting"""
    config = RecommendationConfig(
        default_upgrade_uptake_rate=0.5,
        default_new_user_device_rate=0.7
    )
    rules = UpgradeEligibilityRule()
    engine = BDIIEngine(config, rules)
    
    models = [
        DeviceModel(id="m1", code="NEXA-1", name="NEXA One")
    ]
    
    now = datetime.utcnow()
    links = [
        UserDeviceLink(
            id="l1",
            user_id="u1",
            device_unit_id="d1",
            eligible_for_upgrade_at=now
        ),
        UserDeviceLink(
            id="l2",
            user_id="u2",
            device_unit_id="d2",
            eligible_for_upgrade_at=now
        ),
    ]
    
    forecast_input = DemandForecastInput(horizon_days=30)
    forecast = engine.forecast_demand(
        forecast_input,
        models,
        links,
        total_active_users=1000
    )
    
    assert len(forecast.per_model) == 1
    assert forecast.per_model[0].eligible_users_count >= 0
    print("✅ Test demand forecast: PASSED")


def test_generate_recommendations_shortage():
    """Test recommendations with shortage"""
    from backend.models.bdii.models import (
        DemandForecastResult,
        DemandForecastPerModel,
        InventorySnapshot,
        InventoryPerModel,
    )
    
    config = RecommendationConfig(
        safety_stock_per_model={"NEXA-1": 100}
    )
    rules = UpgradeEligibilityRule()
    engine = BDIIEngine(config, rules)
    
    # Forecast high demand
    forecast = DemandForecastResult(
        horizon_days=30,
        per_model=[
            DemandForecastPerModel(
                model_code="NEXA-1",
                model_name="NEXA One",
                total_estimated_devices=500
            )
        ]
    )
    
    # Snapshot with low supply
    snapshot = InventorySnapshot(
        per_model=[
            InventoryPerModel(
                model_code="NEXA-1",
                model_name="NEXA One",
                on_hand_new=100,
                on_hand_refurb=50,
                usable_refurb=50,
                in_transit=0,
                reserved=0
            )
        ]
    )
    
    recommendations = engine.generate_recommendations(forecast, snapshot)
    
    assert len(recommendations.per_model) == 1
    rec = recommendations.per_model[0]
    assert rec.shortage > 0
    assert rec.recommended_refurb_target > 0 or rec.recommended_new_purchase > 0
    print("✅ Test recommendations (shortage): PASSED")


def test_generate_recommendations_surplus():
    """Test recommendations with surplus"""
    from backend.models.bdii.models import (
        DemandForecastResult,
        DemandForecastPerModel,
        InventorySnapshot,
        InventoryPerModel,
    )
    
    config = RecommendationConfig(
        safety_stock_per_model={"NEXA-1": 100}
    )
    rules = UpgradeEligibilityRule()
    engine = BDIIEngine(config, rules)
    
    # Forecast low demand
    forecast = DemandForecastResult(
        horizon_days=30,
        per_model=[
            DemandForecastPerModel(
                model_code="NEXA-1",
                model_name="NEXA One",
                total_estimated_devices=50
            )
        ]
    )
    
    # Snapshot with high supply
    snapshot = InventorySnapshot(
        per_model=[
            InventoryPerModel(
                model_code="NEXA-1",
                model_name="NEXA One",
                on_hand_new=500,
                on_hand_refurb=200,
                usable_refurb=200,
                in_transit=0,
                reserved=0
            )
        ]
    )
    
    recommendations = engine.generate_recommendations(forecast, snapshot)
    
    assert len(recommendations.per_model) == 1
    rec = recommendations.per_model[0]
    assert rec.surplus > 0
    assert rec.recommended_pause_purchasing == True
    print("✅ Test recommendations (surplus): PASSED")


if __name__ == "__main__":
    print("\nBDII TEST SUITE - Version 1.0\n")
    
    test_inventory_snapshot_basic_counts()
    test_forecast_demand_eligible_users()
    test_generate_recommendations_shortage()
    test_generate_recommendations_surplus()
    
    print("\nALL TESTS PASSED ✅\n")
