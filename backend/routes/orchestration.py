"""
BANIBS Platform Orchestration Core (BPOC) - Phase 0.0
API Routes for Module Management & Rollout Governance

Admin-only endpoints for founder/admin governance.
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List

from models.orchestration import (
    ModuleRecord, StageChangeRequest, TriggerOverrideRequest,
    ModulesListResponse, ModuleDetail, ReadinessEvaluation,
    ReadinessSummaryResponse, RolloutTrigger, ModuleDependency
)
from db.orchestration import OrchestrationDB
from db.connection import get_db_client
from middleware.auth_guard import require_admin

router = APIRouter(prefix="/api/admin/orchestration", tags=["BPOC - Platform Orchestration"])


# ==================== MODULE ENDPOINTS ====================

@router.get("/modules", response_model=ModulesListResponse)
async def list_modules(
    stage: Optional[str] = Query(None, description="Filter by rollout stage"),
    category: Optional[str] = Query(None, description="Filter by category"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    search: Optional[str] = Query(None, description="Search by name/code/description"),
    is_blocked: Optional[bool] = Query(None, description="Filter by blocked status"),
    limit: int = Query(100, le=1000, description="Max results"),
    admin_user: dict = Depends(require_admin)
):
    """
    List all modules with filtering.
    Returns modules with trigger summary and readiness status.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    modules = await orch_db.list_modules(
        stage=stage,
        category=category,
        phase=phase,
        search=search,
        is_blocked=is_blocked,
        limit=limit
    )
    
    # Enhance with trigger summary and readiness
    summaries = []
    for module in modules:
        triggers = await orch_db.get_module_triggers(module["id"])
        triggers_met = sum(1 for t in triggers if t["current_status"] in ["MET", "OVERRIDDEN"])
        
        evaluation = await orch_db.evaluate_module_readiness(module["id"])
        
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
            "readiness_status": evaluation["readiness_status"],
            "updated_at": module["updated_at"]
        })
    
    return {
        "modules": summaries,
        "total": len(summaries)
    }


@router.post("/modules")
async def create_module(
    module_data: dict,
    admin_user: dict = Depends(require_admin)
):
    """
    Create a new module record.
    Used when designing new BANIBS modules.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    # Validate required fields
    required = ["code", "name", "phase", "category", "description_short", "description_internal"]
    for field in required:
        if field not in module_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    module_id = await orch_db.create_module(module_data)
    
    return {
        "success": True,
        "message": "Module created successfully",
        "module_id": module_id
    }


@router.get("/modules/{module_id}", response_model=ModuleDetail)
async def get_module_detail(
    module_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Get full module details including triggers, dependencies, and history.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    module = await orch_db.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    triggers = await orch_db.get_module_triggers(module_id)
    dependencies = await orch_db.get_module_dependencies(module_id)
    events = await orch_db.get_module_events(module_id, limit=20)
    evaluation = await orch_db.evaluate_module_readiness(module_id)
    
    deps_met, dep_issues = await orch_db.check_dependencies_met(module_id)
    dependency_status = "All met" if deps_met else f"{len(dep_issues)} issues"
    
    return {
        "module": module,
        "triggers": triggers,
        "dependencies": dependencies,
        "recent_events": events,
        "readiness_status": evaluation["readiness_status"],
        "unmet_triggers": [f"{t['type']}: {t['target']}" for t in evaluation["unmet_triggers"]],
        "dependency_status": dependency_status
    }


@router.patch("/modules/{module_id}")
async def update_module(
    module_id: str,
    update_data: dict,
    admin_user: dict = Depends(require_admin)
):
    """
    Update module fields (description, visibility, risk flags, owner, etc).
    Does NOT change stage - use POST /modules/{id}/stage for that.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    # Don't allow stage changes through this endpoint
    if "rollout_stage" in update_data:
        raise HTTPException(
            status_code=400,
            detail="Use POST /modules/{id}/stage to change stage"
        )
    
    success = await orch_db.update_module(module_id, update_data)
    
    if not success:
        raise HTTPException(status_code=404, detail="Module not found or no changes made")
    
    # Log the update
    await orch_db.log_event(
        module_id=module_id,
        event_type="NOTE_ADDED",
        details=f"Module updated: {', '.join(update_data.keys())}",
        created_by=admin_user["id"]
    )
    
    return {
        "success": True,
        "message": "Module updated successfully"
    }


@router.post("/modules/{module_id}/stage")
async def change_module_stage(
    module_id: str,
    request: StageChangeRequest,
    admin_user: dict = Depends(require_admin)
):
    """
    Change a module's rollout stage.
    Creates audit event.
    
    If override=false, checks readiness evaluation first.
    If override=true, bypasses checks (with reason logged).
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    module = await orch_db.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if blocked
    if module["is_blocked"] and not request.override:
        raise HTTPException(
            status_code=403,
            detail=f"Module is blocked: {module['blocked_reason']}"
        )
    
    # Evaluate readiness if not overriding
    if not request.override:
        evaluation = await orch_db.evaluate_module_readiness(module_id)
        
        if not evaluation["can_advance"]:
            raise HTTPException(
                status_code=403,
                detail=f"Module not ready to advance: {evaluation['recommended_action']}"
            )
    
    # Change stage
    success = await orch_db.change_module_stage(
        module_id=module_id,
        to_stage=request.to_stage,
        reason=request.reason,
        user_id=admin_user["id"],
        override=request.override
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to change stage")
    
    return {
        "success": True,
        "message": f"Stage changed to {request.to_stage}",
        "override": request.override
    }


@router.post("/modules/{module_id}/block")
async def block_module(
    module_id: str,
    reason: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Block a module from advancing stages.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    success = await orch_db.block_module(module_id, reason, admin_user["id"])
    
    if not success:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return {
        "success": True,
        "message": "Module blocked"
    }


@router.post("/modules/{module_id}/unblock")
async def unblock_module(
    module_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Unblock a module.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    success = await orch_db.unblock_module(module_id, admin_user["id"])
    
    if not success:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return {
        "success": True,
        "message": "Module unblocked"
    }


# ==================== TRIGGER ENDPOINTS ====================

@router.get("/modules/{module_id}/triggers")
async def get_module_triggers(
    module_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Get all triggers for a module.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    triggers = await orch_db.get_module_triggers(module_id)
    
    return {
        "triggers": triggers,
        "total": len(triggers)
    }


@router.post("/modules/{module_id}/triggers")
async def create_trigger(
    module_id: str,
    trigger_data: dict,
    admin_user: dict = Depends(require_admin)
):
    """
    Add a new trigger rule to a module.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    # Validate module exists
    module = await orch_db.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    trigger_data["module_id"] = module_id
    
    trigger_id = await orch_db.create_trigger(trigger_data)
    
    return {
        "success": True,
        "message": "Trigger created successfully",
        "trigger_id": trigger_id
    }


@router.patch("/triggers/{trigger_id}")
async def update_trigger(
    trigger_id: str,
    update_data: dict,
    admin_user: dict = Depends(require_admin)
):
    """
    Update trigger threshold or mandatory flag.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    result = await orch_db.triggers.update_one(
        {"id": trigger_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trigger not found")
    
    return {
        "success": True,
        "message": "Trigger updated successfully"
    }


@router.post("/triggers/{trigger_id}/override")
async def override_trigger(
    trigger_id: str,
    request: TriggerOverrideRequest,
    admin_user: dict = Depends(require_admin)
):
    """
    Override a trigger that's not met.
    Logs reason and who approved it.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    success = await orch_db.override_trigger(
        trigger_id=trigger_id,
        reason=request.reason,
        user_id=admin_user["id"]
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Trigger not found")
    
    return {
        "success": True,
        "message": "Trigger overridden",
        "reason": request.reason
    }


# ==================== DEPENDENCY ENDPOINTS ====================

@router.get("/modules/{module_id}/dependencies")
async def get_module_dependencies(
    module_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Get all dependencies for a module.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    dependencies = await orch_db.get_module_dependencies(module_id)
    
    # Enhance with parent module names
    enhanced_deps = []
    for dep in dependencies:
        parent = await orch_db.get_module(dep["depends_on_module_id"])
        if parent:
            dep["parent_name"] = parent["name"]
            dep["parent_stage"] = parent["rollout_stage"]
        enhanced_deps.append(dep)
    
    return {
        "dependencies": enhanced_deps,
        "total": len(enhanced_deps)
    }


@router.post("/modules/{module_id}/dependencies")
async def create_dependency(
    module_id: str,
    dependency_data: dict,
    admin_user: dict = Depends(require_admin)
):
    """
    Create a module dependency.
    Links child module to parent module with required stage.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    # Validate modules exist
    child = await orch_db.get_module(module_id)
    parent = await orch_db.get_module(dependency_data["depends_on_module_id"])
    
    if not child or not parent:
        raise HTTPException(status_code=404, detail="Module not found")
    
    dependency_data["module_id"] = module_id
    
    dep_id = await orch_db.create_dependency(dependency_data)
    
    return {
        "success": True,
        "message": "Dependency created successfully",
        "dependency_id": dep_id
    }


@router.delete("/dependencies/{dependency_id}")
async def delete_dependency(
    dependency_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Remove a module dependency.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    result = await orch_db.dependencies.delete_one({"id": dependency_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dependency not found")
    
    return {
        "success": True,
        "message": "Dependency removed"
    }


# ==================== EVALUATION ENDPOINTS ====================

@router.post("/modules/{module_id}/evaluate", response_model=ReadinessEvaluation)
async def evaluate_module(
    module_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Evaluate if a module is ready to advance stages.
    Checks triggers, dependencies, and risk factors.
    
    Returns readiness assessment with recommendations.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    evaluation = await orch_db.evaluate_module_readiness(module_id)
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return evaluation


@router.get("/readiness_summary", response_model=ReadinessSummaryResponse)
async def get_readiness_summary(
    admin_user: dict = Depends(require_admin)
):
    """
    Get summary of all modules sorted by readiness.
    Shows which modules are closest to being ready for launch.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    summary = await orch_db.get_readiness_summary()
    
    return summary


# ==================== SETTINGS ENDPOINTS ====================

@router.get("/settings")
async def get_settings(
    admin_user: dict = Depends(require_admin)
):
    """
    Get orchestration settings.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    settings = await orch_db.get_settings()
    
    return settings


@router.patch("/settings")
async def update_settings(
    update_data: dict,
    admin_user: dict = Depends(require_admin)
):
    """
    Update orchestration settings.
    
    Admin only.
    """
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    success = await orch_db.update_settings(update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update settings")
    
    return {
        "success": True,
        "message": "Settings updated successfully"
    }
