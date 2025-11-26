"""
BANIBS Platform Orchestration Core (BPOC) - Phase 0.0
Database Operations for Module Management

All operations on orchestration collections:
- module_records
- rollout_triggers
- module_dependencies
- rollout_events
- orchestration_settings
"""

from typing import Optional, List, Dict
from datetime import datetime, timezone, date
from uuid import uuid4

from db.connection import get_db_client
from models.orchestration import (
    ModuleRecord, RolloutTrigger, ModuleDependency, RolloutEvent,
    OrchestrationSettings, RolloutStage, TriggerStatus, ReadinessStatus,
    EventType, ModuleCategory
)


class OrchestrationDB:
    """Database operations for BPOC"""
    
    def __init__(self, db_client):
        self.db = db_client
        self.modules = db_client.module_records
        self.triggers = db_client.rollout_triggers
        self.dependencies = db_client.module_dependencies
        self.events = db_client.rollout_events
        self.settings = db_client.orchestration_settings
    
    # ==================== MODULE OPERATIONS ====================
    
    async def create_module(self, module_data: dict) -> str:
        """Create a new module record"""
        now = datetime.now(timezone.utc)
        
        module = {
            "id": f"module-{uuid4().hex[:12]}",
            "code": module_data["code"],
            "name": module_data["name"],
            "phase": module_data["phase"],
            "layer": module_data["layer"],
            "category": module_data["category"],
            "description_short": module_data["description_short"],
            "description_internal": module_data["description_internal"],
            "rollout_stage": module_data.get("rollout_stage", "PLANNED"),
            "visibility": module_data.get("visibility", "INTERNAL_ONLY"),
            "owner_team": module_data.get("owner_team", "Neo-Core"),
            "risk_flags": module_data.get("risk_flags", []),
            "is_blocked": False,
            "blocked_reason": None,
            "created_at": now,
            "updated_at": now
        }
        
        await self.modules.insert_one(module)
        
        # Log creation event
        await self.log_event(
            module_id=module["id"],
            event_type="NOTE_ADDED",
            details=f"Module '{module['name']}' created",
            created_by="SYSTEM"
        )
        
        return module["id"]
    
    async def get_module(self, module_id: str) -> Optional[dict]:
        """Get module by ID"""
        return await self.modules.find_one({"id": module_id}, {"_id": 0})
    
    async def get_module_by_code(self, code: str) -> Optional[dict]:
        """Get module by code"""
        return await self.modules.find_one({"code": code}, {"_id": 0})
    
    async def list_modules(
        self,
        stage: Optional[str] = None,
        category: Optional[str] = None,
        phase: Optional[str] = None,
        search: Optional[str] = None,
        is_blocked: Optional[bool] = None,
        limit: int = 100
    ) -> List[dict]:
        """List modules with filtering"""
        query = {}
        
        if stage:
            query["rollout_stage"] = stage
        if category:
            query["category"] = category
        if phase:
            query["phase"] = phase
        if is_blocked is not None:
            query["is_blocked"] = is_blocked
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"code": {"$regex": search, "$options": "i"}},
                {"description_short": {"$regex": search, "$options": "i"}}
            ]
        
        modules = await self.modules.find(query, {"_id": 0}).sort("updated_at", -1).limit(limit).to_list(limit)
        return modules
    
    async def update_module(self, module_id: str, update_data: dict) -> bool:
        """Update module fields"""
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        result = await self.modules.update_one(
            {"id": module_id},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    
    async def change_module_stage(
        self,
        module_id: str,
        to_stage: str,
        reason: str,
        user_id: str,
        override: bool = False
    ) -> bool:
        """
        Change module's rollout stage.
        Creates audit event.
        """
        module = await self.get_module(module_id)
        if not module:
            return False
        
        from_stage = module["rollout_stage"]
        
        # Update stage
        await self.update_module(module_id, {"rollout_stage": to_stage})
        
        # Log event
        await self.log_event(
            module_id=module_id,
            event_type="STAGE_CHANGE",
            from_stage=from_stage,
            to_stage=to_stage,
            details=f"{reason}{' (OVERRIDE)' if override else ''}",
            created_by=user_id
        )
        
        return True
    
    async def block_module(self, module_id: str, reason: str, user_id: str) -> bool:
        """Block a module from advancing"""
        await self.update_module(module_id, {
            "is_blocked": True,
            "blocked_reason": reason
        })
        
        await self.log_event(
            module_id=module_id,
            event_type="MODULE_BLOCKED",
            details=reason,
            created_by=user_id
        )
        
        return True
    
    async def unblock_module(self, module_id: str, user_id: str) -> bool:
        """Unblock a module"""
        await self.update_module(module_id, {
            "is_blocked": False,
            "blocked_reason": None
        })
        
        await self.log_event(
            module_id=module_id,
            event_type="MODULE_UNBLOCKED",
            details="Module unblocked",
            created_by=user_id
        )
        
        return True
    
    # ==================== TRIGGER OPERATIONS ====================
    
    async def create_trigger(self, trigger_data: dict) -> str:
        """Create a rollout trigger"""
        trigger = {
            "id": f"trigger-{uuid4().hex[:12]}",
            "module_id": trigger_data["module_id"],
            "trigger_type": trigger_data["trigger_type"],
            "target_value_number": trigger_data.get("target_value_number"),
            "target_value_date": trigger_data.get("target_value_date"),
            "target_value_text": trigger_data.get("target_value_text"),
            "is_mandatory": trigger_data.get("is_mandatory", True),
            "current_status": "NOT_MET",
            "last_evaluated_at": None
        }
        
        await self.triggers.insert_one(trigger)
        return trigger["id"]
    
    async def get_module_triggers(self, module_id: str) -> List[dict]:
        """Get all triggers for a module"""
        triggers = await self.triggers.find(
            {"module_id": module_id},
            {"_id": 0}
        ).to_list(100)
        return triggers
    
    async def update_trigger_status(
        self,
        trigger_id: str,
        status: str,
        user_id: Optional[str] = None
    ) -> bool:
        """Update trigger status"""
        result = await self.triggers.update_one(
            {"id": trigger_id},
            {
                "$set": {
                    "current_status": status,
                    "last_evaluated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Log if trigger was met or overridden
        if status in ["MET", "OVERRIDDEN"]:
            trigger = await self.triggers.find_one({"id": trigger_id}, {"_id": 0})
            if trigger:
                event_type = "TRIGGER_MET" if status == "MET" else "TRIGGER_OVERRIDDEN"
                await self.log_event(
                    module_id=trigger["module_id"],
                    event_type=event_type,
                    details=f"Trigger {trigger['trigger_type']} {status}",
                    created_by=user_id or "SYSTEM"
                )
        
        return result.modified_count > 0
    
    async def override_trigger(
        self,
        trigger_id: str,
        reason: str,
        user_id: str
    ) -> bool:
        """Override a trigger that's not met"""
        await self.update_trigger_status(trigger_id, "OVERRIDDEN", user_id)
        
        trigger = await self.triggers.find_one({"id": trigger_id}, {"_id": 0})
        if trigger:
            await self.log_event(
                module_id=trigger["module_id"],
                event_type="TRIGGER_OVERRIDDEN",
                details=f"Override: {reason}",
                created_by=user_id
            )
        
        return True
    
    # ==================== DEPENDENCY OPERATIONS ====================
    
    async def create_dependency(self, dependency_data: dict) -> str:
        """Create module dependency"""
        dependency = {
            "id": f"dep-{uuid4().hex[:12]}",
            "module_id": dependency_data["module_id"],
            "depends_on_module_id": dependency_data["depends_on_module_id"],
            "required_stage": dependency_data["required_stage"],
            "is_hard_dependency": dependency_data.get("is_hard_dependency", True)
        }
        
        await self.dependencies.insert_one(dependency)
        return dependency["id"]
    
    async def get_module_dependencies(self, module_id: str) -> List[dict]:
        """Get all dependencies for a module"""
        deps = await self.dependencies.find(
            {"module_id": module_id},
            {"_id": 0}
        ).to_list(100)
        return deps
    
    async def check_dependencies_met(self, module_id: str) -> tuple[bool, List[str]]:
        """
        Check if all dependencies are met for a module.
        Returns (all_met: bool, issues: List[str])
        """
        deps = await self.get_module_dependencies(module_id)
        issues = []
        
        for dep in deps:
            parent = await self.get_module(dep["depends_on_module_id"])
            if not parent:
                issues.append(f"Dependency module not found: {dep['depends_on_module_id']}")
                continue
            
            required_stage = dep["required_stage"]
            current_stage = parent["rollout_stage"]
            
            # Check if parent is at required stage
            stage_order = ["PLANNED", "IN_DEV", "INTERNAL_SANDBOX", "PRIVATE_BETA", "SOFT_LAUNCH", "FULL_LAUNCH", "LEGACY"]
            
            if stage_order.index(current_stage) < stage_order.index(required_stage):
                issues.append(
                    f"{parent['name']} must be in {required_stage} (currently {current_stage})"
                )
        
        return (len(issues) == 0, issues)
    
    # ==================== EVENT OPERATIONS ====================
    
    async def log_event(
        self,
        module_id: str,
        event_type: str,
        details: str,
        created_by: str,
        from_stage: Optional[str] = None,
        to_stage: Optional[str] = None
    ) -> str:
        """Log an orchestration event"""
        event = {
            "id": f"event-{uuid4().hex[:12]}",
            "module_id": module_id,
            "event_type": event_type,
            "from_stage": from_stage,
            "to_stage": to_stage,
            "details": details,
            "created_by_user_id": created_by,
            "created_at": datetime.now(timezone.utc)
        }
        
        await self.events.insert_one(event)
        return event["id"]
    
    async def get_module_events(self, module_id: str, limit: int = 50) -> List[dict]:
        """Get event history for a module"""
        events = await self.events.find(
            {"module_id": module_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        return events
    
    # ==================== EVALUATION & READINESS ====================
    
    async def evaluate_module_readiness(
        self,
        module_id: str,
        metrics: Optional[dict] = None
    ) -> dict:
        """
        Evaluate if a module is ready to advance stages.
        Returns readiness assessment with details.
        """
        module = await self.get_module(module_id)
        if not module:
            return None
        
        triggers = await self.get_module_triggers(module_id)
        deps_met, dep_issues = await self.check_dependencies_met(module_id)
        
        # Count trigger status
        triggers_met = sum(1 for t in triggers if t["current_status"] in ["MET", "OVERRIDDEN"])
        triggers_total = sum(1 for t in triggers if t["is_mandatory"])
        
        unmet_triggers = []
        for trigger in triggers:
            if trigger["current_status"] == "NOT_MET" and trigger["is_mandatory"]:
                unmet_triggers.append({
                    "type": trigger["trigger_type"],
                    "target": trigger.get("target_value_number") or trigger.get("target_value_date") or trigger.get("target_value_text"),
                    "current": "Not evaluated"
                })
        
        # Determine readiness status
        if module["is_blocked"]:
            readiness = "BLOCKED"
            can_advance = False
            recommended_action = f"Unblock module first: {module['blocked_reason']}"
        elif not deps_met:
            readiness = "WAIT"
            can_advance = False
            recommended_action = "Wait for dependencies to be met"
        elif len(unmet_triggers) > 0:
            readiness = "WAIT"
            can_advance = False
            recommended_action = f"Meet remaining triggers ({len(unmet_triggers)} pending)"
        else:
            readiness = "READY"
            can_advance = True
            recommended_action = "Ready to advance to next stage"
        
        # Risk notes
        risk_notes = []
        if module["risk_flags"]:
            risk_notes.append(f"Risk flags: {', '.join(module['risk_flags'])}")
        
        return {
            "module_id": module_id,
            "current_stage": module["rollout_stage"],
            "readiness_status": readiness,
            "triggers_met": triggers_met,
            "triggers_total": triggers_total,
            "unmet_triggers": unmet_triggers,
            "dependency_issues": dep_issues,
            "risk_notes": risk_notes,
            "can_advance": can_advance,
            "recommended_action": recommended_action
        }
    
    async def get_readiness_summary(self) -> dict:
        """Get readiness summary for all modules"""
        modules = await self.list_modules(limit=1000)
        
        summaries = []
        ready_count = 0
        waiting_count = 0
        blocked_count = 0
        
        for module in modules:
            evaluation = await self.evaluate_module_readiness(module["id"])
            
            status = evaluation["readiness_status"]
            if status == "READY":
                ready_count += 1
            elif status == "WAIT":
                waiting_count += 1
            elif status == "BLOCKED":
                blocked_count += 1
            
            triggers = await self.get_module_triggers(module["id"])
            triggers_met = sum(1 for t in triggers if t["current_status"] in ["MET", "OVERRIDDEN"])
            
            summaries.append({
                "id": module["id"],
                "code": module["code"],
                "name": module["name"],
                "phase": module["phase"],
                "category": module["category"],
                "rollout_stage": module["rollout_stage"],
                "visibility": module["visibility"],
                "is_blocked": module["is_blocked"],
                "risk_flags": module["risk_flags"],
                "trigger_summary": f"{triggers_met}/{len(triggers)} met",
                "readiness_status": status,
                "updated_at": module["updated_at"]
            })
        
        # Sort by readiness: READY first, then WAIT, then BLOCKED
        sort_order = {"READY": 0, "WAIT": 1, "BLOCKED": 2}
        summaries.sort(key=lambda x: sort_order.get(x["readiness_status"], 3))
        
        return {
            "modules": summaries,
            "ready_count": ready_count,
            "waiting_count": waiting_count,
            "blocked_count": blocked_count
        }
    
    # ==================== SETTINGS OPERATIONS ====================
    
    async def get_settings(self) -> Optional[dict]:
        """Get orchestration settings"""
        settings = await self.settings.find_one({}, {"_id": 0})
        
        # Create default settings if none exist
        if not settings:
            settings = {
                "id": "settings-default",
                "min_time_between_major_releases_days": 14,
                "require_safety_review_for_safety_category": True,
                "require_legal_review_for_help_systems": True,
                "max_concurrent_help_system_live": 3,
                "show_public_coming_soon": False,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            await self.settings.insert_one(settings)
        
        return settings
    
    async def update_settings(self, update_data: dict) -> bool:
        """Update orchestration settings"""
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        result = await self.settings.update_one(
            {},
            {"$set": update_data},
            upsert=True
        )
        
        return result.modified_count > 0 or result.upserted_id is not None
