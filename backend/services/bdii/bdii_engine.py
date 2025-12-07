"""
BDII Engine - Device Inventory Intelligence
Version 1.0 - Phase 1

Purpose: Analytics + Recommendations for device inventory management
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict

from models.bdii.models import (
    DeviceModel,
    DeviceUnit,
    UserDeviceLink,
    DeviceStatus,
    ConditionGrade,
    InventorySnapshot,
    InventoryPerModel,
    DemandForecastInput,
    DemandForecastResult,
    DemandForecastPerModel,
    InventoryRecommendation,
    InventoryRecommendationPerModel,
    RecommendationConfig,
    UpgradeEligibilityRule,
)


class BDIIEngine:
    """
    BANIBS Device Inventory Intelligence Engine
    
    Manages device inventory analytics and recommendations
    """
    
    def __init__(
        self,
        recommendation_config: RecommendationConfig,
        upgrade_eligibility_rule: UpgradeEligibilityRule
    ):
        self.recommendation_config = recommendation_config
        self.upgrade_eligibility_rule = upgrade_eligibility_rule
    
    def compute_inventory_snapshot(
        self,
        device_models: List[DeviceModel],
        device_units: List[DeviceUnit],
        region: Optional[str] = None
    ) -> InventorySnapshot:
        """
        Compute current inventory snapshot
        
        Args:
            device_models: List of device models
            device_units: List of device units
            region: Optional region filter
            
        Returns:
            InventorySnapshot with per-model counts
        """
        # Create model lookup
        model_lookup = {m.id: m for m in device_models}
        
        # Filter by region if specified
        if region:
            device_units = [
                u for u in device_units
                if u.location and region in u.location
            ]
        
        # Group units by model
        units_by_model: Dict[str, List[DeviceUnit]] = defaultdict(list)
        for unit in device_units:
            if unit.model_id in model_lookup:
                units_by_model[unit.model_id].append(unit)
        
        # Compute counts per model
        per_model = []
        for model_id, units in units_by_model.items():
            model = model_lookup[model_id]
            
            # Count by status
            on_hand_new = sum(1 for u in units if u.status == DeviceStatus.NEW)
            on_hand_refurb = sum(1 for u in units if u.status == DeviceStatus.REFURBISHED)
            in_transit = sum(1 for u in units if u.status == DeviceStatus.IN_TRANSIT)
            reserved = sum(1 for u in units if u.status == DeviceStatus.RESERVED)
            scrapped = sum(1 for u in units if u.status == DeviceStatus.SCRAPPED)
            
            # Count usable refurb (meets condition grade requirements)
            allowed_grades = set(self.upgrade_eligibility_rule.allowed_condition_grades)
            usable_refurb = sum(
                1 for u in units
                if u.status == DeviceStatus.REFURBISHED
                and u.condition_grade.value in allowed_grades
            )
            
            per_model.append(InventoryPerModel(
                model_code=model.code,
                model_name=model.name,
                on_hand_new=on_hand_new,
                on_hand_refurb=on_hand_refurb,
                in_transit=in_transit,
                reserved=reserved,
                scrapped=scrapped,
                usable_refurb=usable_refurb
            ))
        
        return InventorySnapshot(per_model=per_model)
    
    def compute_upgrade_eligibility(
        self,
        user_device_links: List[UserDeviceLink],
        device_units: List[DeviceUnit],
        now: Optional[datetime] = None
    ) -> List[UserDeviceLink]:
        """
        Compute upgrade eligibility for user device links
        
        Args:
            user_device_links: List of user-device links
            device_units: List of device units (for condition check)
            now: Current timestamp (default: utcnow)
            
        Returns:
            Updated user_device_links with eligible_for_upgrade_at set
        """
        if now is None:
            now = datetime.utcnow()
        
        # Create device lookup
        device_lookup = {u.id: u for u in device_units}
        
        rules = self.upgrade_eligibility_rule
        
        for link in user_device_links:
            # Get device unit
            device = device_lookup.get(link.device_unit_id)
            if not device:
                continue
            
            # Check condition grade
            if device.condition_grade.value not in rules.allowed_condition_grades:
                link.eligible_for_upgrade_at = None
                continue
            
            # Check activation duration
            months_active = (now - link.activated_at).days / 30.0
            if months_active < rules.min_months_active:
                link.eligible_for_upgrade_at = None
                continue
            
            # Check link duration
            link_months = (now - link.activated_at).days / 30.0
            if link_months < rules.min_link_duration_months:
                link.eligible_for_upgrade_at = None
                continue
            
            # Check usage score
            if link.daily_use_score is not None:
                if link.daily_use_score < rules.min_daily_use_score:
                    link.eligible_for_upgrade_at = None
                    continue
            
            # Check upgrade cooldown
            if link.last_upgrade_processed_at:
                months_since_upgrade = (now - link.last_upgrade_processed_at).days / 30.0
                if months_since_upgrade < rules.min_time_between_upgrades_months:
                    link.eligible_for_upgrade_at = None
                    continue
            
            # If all checks pass, mark as eligible
            link.eligible_for_upgrade_at = now
        
        return user_device_links
    
    def forecast_demand(
        self,
        forecast_input: DemandForecastInput,
        device_models: List[DeviceModel],
        user_device_links: List[UserDeviceLink],
        total_active_users: int = 0
    ) -> DemandForecastResult:
        """
        Forecast device demand for the given horizon
        
        Args:
            forecast_input: Forecast parameters
            device_models: List of device models
            user_device_links: List of user-device links
            total_active_users: Total active user count (for new user estimation)
            
        Returns:
            DemandForecastResult with per-model projections
        """
        config = self.recommendation_config
        
        # Filter links by region if specified
        if forecast_input.region:
            # In Phase 1, we'll use a simple filter
            # In Phase 2, this could be more sophisticated
            pass
        
        # Count eligible users per model
        eligible_by_model: Dict[str, List[UserDeviceLink]] = defaultdict(list)
        for link in user_device_links:
            if link.eligible_for_upgrade_at:
                # Find model for this device (simplified - in real impl, join with device_units)
                # For now, we'll aggregate all eligible users
                eligible_by_model["ALL"].append(link)
        
        per_model = []
        
        for model in device_models:
            # Estimate upgrade demand
            eligible_count = len(eligible_by_model.get(model.code, []))
            if not eligible_count:
                eligible_count = len(eligible_by_model.get("ALL", [])) // len(device_models)
            
            estimated_upgrade_devices = 0
            if forecast_input.include_upgrades:
                estimated_upgrade_devices = int(
                    eligible_count * config.default_upgrade_uptake_rate
                )
            
            # Estimate new user demand
            estimated_new_user_devices = 0
            if forecast_input.include_new_users:
                # Simple heuristic: assume X% of active users will sign up per horizon
                # In Phase 1, use a simple growth rate
                growth_rate_per_30_days = 0.02  # 2% growth
                periods = forecast_input.horizon_days / 30.0
                new_users = int(total_active_users * growth_rate_per_30_days * periods)
                estimated_new_user_devices = int(
                    new_users * config.default_new_user_device_rate
                )
                # Distribute across models (simplified)
                estimated_new_user_devices = estimated_new_user_devices // len(device_models)
            
            total_estimated = estimated_new_user_devices + estimated_upgrade_devices
            
            per_model.append(DemandForecastPerModel(
                model_code=model.code,
                model_name=model.name,
                estimated_new_user_devices=estimated_new_user_devices,
                estimated_upgrade_devices=estimated_upgrade_devices,
                total_estimated_devices=total_estimated,
                eligible_users_count=eligible_count,
                assumptions={
                    "upgrade_uptake_rate": config.default_upgrade_uptake_rate,
                    "new_user_device_rate": config.default_new_user_device_rate,
                    "growth_rate_per_30_days": growth_rate_per_30_days
                }
            ))
        
        return DemandForecastResult(
            horizon_days=forecast_input.horizon_days,
            per_model=per_model
        )
    
    def generate_recommendations(
        self,
        forecast: DemandForecastResult,
        snapshot: InventorySnapshot,
    ) -> InventoryRecommendation:
        """
        Generate inventory recommendations
        
        Args:
            forecast: Demand forecast
            snapshot: Current inventory snapshot
            
        Returns:
            InventoryRecommendation with per-model actions
        """
        config = self.recommendation_config
        
        # Create lookups
        forecast_by_code = {f.model_code: f for f in forecast.per_model}
        inventory_by_code = {i.model_code: i for i in snapshot.per_model}
        
        per_model_recommendations = []
        notes = []
        
        # Process each model in forecast
        for forecast_item in forecast.per_model:
            code = forecast_item.model_code
            inventory_item = inventory_by_code.get(code)
            
            if not inventory_item:
                notes.append(f"No inventory data for {code} - skipping")
                continue
            
            # Calculate projected supply
            projected_supply = (
                inventory_item.on_hand_new +
                inventory_item.usable_refurb +
                inventory_item.in_transit -
                inventory_item.reserved
            )
            
            # Get safety stock
            safety_stock = config.safety_stock_per_model.get(code, 0)
            
            # Calculate target total
            projected_demand = forecast_item.total_estimated_devices
            target_total = projected_demand + safety_stock
            
            # Calculate shortage/surplus
            shortage = max(target_total - projected_supply, 0)
            surplus = max(projected_supply - target_total, 0)
            
            # Generate recommendations
            recommended_refurb_target = 0
            recommended_new_purchase = 0
            recommended_pause_purchasing = False
            
            if shortage > 0:
                # We need more devices
                # First, try to fill via refurb
                available_refurb = inventory_item.on_hand_refurb
                recommended_refurb_target = min(shortage, available_refurb)
                
                # Remaining shortage after refurb
                remaining_shortage = shortage - recommended_refurb_target
                
                # Buy new for the rest
                recommended_new_purchase = max(remaining_shortage, 0)
                
                if recommended_refurb_target > 0:
                    notes.append(
                        f"{code}: Refurbish {recommended_refurb_target} units before buying new"
                    )
                if recommended_new_purchase > 0:
                    notes.append(
                        f"{code}: Purchase {recommended_new_purchase} new units"
                    )
            
            elif surplus > 0:
                # We have excess inventory
                recommended_pause_purchasing = True
                notes.append(
                    f"{code}: PAUSE new orders - current stock exceeds "
                    f"{forecast.horizon_days}-day demand by {surplus} units"
                )
            
            per_model_recommendations.append(InventoryRecommendationPerModel(
                model_code=code,
                model_name=forecast_item.model_name,
                projected_demand=projected_demand,
                projected_supply=projected_supply,
                shortage=shortage,
                surplus=surplus,
                recommended_refurb_target=recommended_refurb_target,
                recommended_new_purchase=recommended_new_purchase,
                recommended_pause_purchasing=recommended_pause_purchasing
            ))
        
        return InventoryRecommendation(
            horizon_days=forecast.horizon_days,
            per_model=per_model_recommendations,
            notes=notes
        )
