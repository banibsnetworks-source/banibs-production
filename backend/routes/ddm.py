"""
DDM (Dismissal Detection Model) - API Routes v1.2
EXPANDED SPECIFICATION

Pattern detection endpoints for the Dismissal Detection Model.
This is a DISCERNMENT TOOL, not an accusation system.

PRIME DIRECTIVES ENFORCED:
D0. Pattern Detection Only - No accusatory language in outputs
D1. Guardrails Enforced by Code - Finalize blocked without tests
D2. Default Private/Internal - Admin-only access
D3. Apply Inward First - Reminders for external analysis
D4. Safety Copy Required - Disclaimers on all outputs

SECURITY: Restricted to Founder/Admin roles only.
AUDIT: All operations are logged.
"""

import logging
import json
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse

from db.connection import get_db
from middleware.auth_guard import get_current_user, require_role
from models.ddm import (
    DDMObservation,
    DDMObservationCreate,
    DDMScoreResponse,
    DDMTestUpdate,
    DDMFinalizeRequest,
    DDMExportRequest,
    DDMTrendAnalysis,
    DDMTests,
    DDMAuditLogEntry,
    FalsifiableTest,
    ObservationStatus,
    Visibility,
    TestResult,
    SubjectType,
    check_language_compliance,
    ESCALATION_LADDER
)
from services.ddm_engine import get_ddm_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ddm", tags=["DDM - Dismissal Detection Model"])


# =============================================================================
# CONSTANTS & DISCLAIMERS (D4)
# =============================================================================

DISCLAIMER = (
    "DDM is a pattern-detection tool. It does not determine guilt, intent, or moral worth. "
    "All outputs are probabilistic and require falsifiable testing."
)

WATERMARK = "DDM — Pattern Analysis (Not Accusation)"


# =============================================================================
# AUDIT LOGGING
# =============================================================================

async def log_ddm_action(
    db,
    user_id: str,
    action: str,
    observation_id: str,
    diff_json: dict = None,
    notes: str = None
):
    """Log DDM action to audit trail"""
    entry = DDMAuditLogEntry(
        id=str(uuid4()),
        ts=datetime.utcnow(),
        user_id=user_id,
        action=action,
        observation_id=observation_id,
        diff_json=diff_json,
        notes=notes
    )
    await db.ddm_audit_log.insert_one(entry.dict())
    logger.info(f"DDM Audit: {action} on {observation_id} by {user_id}")


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/observe", response_model=dict)
async def create_observation(
    data: DDMObservationCreate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Create a new DDM observation.
    
    SECURITY: Founder/Admin only (D2).
    ETHICS: User must acknowledge discernment-only use.
    INWARD-FIRST: Default subject_type is "self" (D3).
    
    Returns: LDI score, breakdown, and recommended tests.
    """
    engine = get_ddm_engine()
    
    # Calculate scores
    score_response = engine.score(
        features=data.features,
        tests=None,
        stage_9_confirmed=data.stage_9_explicit_confirmation
    )
    
    # Infer protected variable
    protected, pv_confidence = engine.infer_protected_variable(data.features)
    
    # Create observation record
    observation = DDMObservation(
        id=str(uuid4()),
        created_at=datetime.utcnow(),
        created_by_user_id=current_user["id"],
        status=data.status,
        visibility=data.visibility,
        context_title=data.context_title,
        context_notes=data.context_notes,
        location_tag=data.location_tag if hasattr(data, 'location_tag') else None,
        subject_type=data.subject_type,
        subject_ref=data.subject_ref,
        subject_display_name=data.subject_display_name if hasattr(data, 'subject_display_name') else None,
        truth_claim=data.truth_claim,
        response_text=data.response_text,
        response_source=data.response_source if hasattr(data, 'response_source') else "other",
        features=data.features,
        weights_version="ddm-v1-weights",
        ldi_raw=score_response.ldi_raw,
        ldi_100=score_response.ldi_100,
        ldi_confidence=score_response.confidence,
        escalation_band=score_response.band,
        escalation_stage_observed=score_response.escalation_stage_observed,
        stage_9_explicit_confirmation=data.stage_9_explicit_confirmation,
        protected_variable=protected,
        protected_variable_confidence=pv_confidence,
        tests=DDMTests(),
        guardrail_ack=data.guardrail_ack
    )
    
    # Store in database
    obs_dict = observation.dict()
    obs_dict["features"] = observation.features.dict()
    obs_dict["protected_variable"] = observation.protected_variable.dict()
    obs_dict["tests"] = observation.tests.dict()
    
    await db.ddm_observations.insert_one(obs_dict)
    
    # Audit log
    await log_ddm_action(db, current_user["id"], "create", observation.id)
    
    logger.info(f"DDM observation created: {observation.id} by user {current_user['id']}")
    
    # Generate inward-first reminder (D3)
    inward_reminder = engine.get_inward_first_reminder(data.subject_type.value)
    
    return {
        "success": True,
        "id": observation.id,
        "ldi_raw": score_response.ldi_raw,
        "ldi_100": score_response.ldi_100,
        "band": score_response.band.value,
        "confidence": score_response.confidence,
        "escalation_stage_observed": score_response.escalation_stage_observed,
        "feature_breakdown": score_response.feature_breakdown,
        "protected_variable": protected.dict(),
        "protected_variable_confidence": pv_confidence,
        "recommended_next_test": score_response.recommended_next_test,
        "status": observation.status.value,
        "disclaimer": DISCLAIMER,
        "uncertainty_note": score_response.uncertainty_note,
        "inward_first_reminder": inward_reminder
    }


@router.get("/observations", response_model=dict)
async def list_observations(
    subject_ref: Optional[str] = Query(None, description="Filter by subject reference"),
    status: Optional[str] = Query(None, description="Filter by status"),
    band: Optional[str] = Query(None, description="Filter by escalation band"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    List DDM observations with optional filtering.
    
    SECURITY: Founder/Admin only (D2).
    """
    query = {}
    if subject_ref:
        query["subject_ref"] = subject_ref
    if status:
        query["status"] = status
    if band:
        query["escalation_band"] = band
    
    cursor = db.ddm_observations.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    observations = await cursor.to_list(length=limit)
    
    total = await db.ddm_observations.count_documents(query)
    
    return {
        "observations": observations,
        "total": total,
        "limit": limit,
        "skip": skip,
        "disclaimer": DISCLAIMER
    }


@router.get("/observation/{observation_id}", response_model=dict)
async def get_observation(
    observation_id: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Get a single DDM observation by ID.
    
    SECURITY: Founder/Admin only (D2).
    """
    observation = await db.ddm_observations.find_one({"id": observation_id}, {"_id": 0})
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    # Get audit log
    audit_cursor = db.ddm_audit_log.find({"observation_id": observation_id}, {"_id": 0}).sort("ts", -1)
    audit_log = await audit_cursor.to_list(length=100)
    
    return {
        "observation": observation,
        "audit_log": audit_log,
        "disclaimer": DISCLAIMER
    }


@router.patch("/observation/{observation_id}", response_model=dict)
async def update_observation(
    observation_id: str,
    updates: dict,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Update a DDM observation (draft/preliminary only).
    
    SECURITY: Founder/Admin only (D2).
    Cannot update finalized observations.
    """
    observation = await db.ddm_observations.find_one({"id": observation_id})
    
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    if observation.get("status") == "finalized":
        raise HTTPException(status_code=400, detail="Cannot update finalized observations")
    
    # Allowed update fields
    allowed_fields = [
        "context_title", "context_notes", "location_tag",
        "subject_ref", "subject_display_name", "truth_claim",
        "response_text", "response_source", "guardrail_ack"
    ]
    
    update_dict = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_dict["updated_at"] = datetime.utcnow()
    update_dict["updated_by_user_id"] = current_user["id"]
    
    await db.ddm_observations.update_one(
        {"id": observation_id},
        {"$set": update_dict}
    )
    
    # Audit log
    await log_ddm_action(db, current_user["id"], "update", observation_id, diff_json=update_dict)
    
    return {"success": True, "updated_fields": list(update_dict.keys())}


@router.post("/observation/{observation_id}/tests", response_model=dict)
async def update_tests(
    observation_id: str,
    data: DDMTestUpdate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Update falsifiable test results for an observation.
    
    SECURITY: Founder/Admin only (D2).
    GUARDRAIL (D1): Cannot finalize without at least 1 test completed.
    """
    engine = get_ddm_engine()
    
    # Find existing observation
    observation = await db.ddm_observations.find_one({"id": observation_id})
    
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    if observation.get("status") == "finalized":
        raise HTTPException(status_code=400, detail="Cannot update tests on finalized observations")
    
    # Build test updates
    now = datetime.utcnow()
    tests_update = {}
    
    if data.tests:
        for test_name, test_data in data.tests.items():
            if test_name in ["context_tolerance", "symmetry", "clarification"]:
                tests_update[f"tests.{test_name}"] = {
                    "result": test_data.result.value if hasattr(test_data.result, 'value') else test_data.result,
                    "notes": test_data.notes,
                    "tested_at": now.isoformat(),
                    "tested_by": current_user["id"]
                }
    
    tests_update["guardrail_ack"] = data.guardrail_ack
    tests_update["updated_at"] = now
    tests_update["updated_by_user_id"] = current_user["id"]
    
    # Check if trying to finalize
    if data.set_status == ObservationStatus.FINALIZED:
        # Build current tests state to check
        current_tests = observation.get("tests", {})
        
        # Merge with updates
        for key, val in tests_update.items():
            if key.startswith("tests."):
                test_key = key.split(".")[1]
                current_tests[test_key] = val
        
        # Count completed tests
        completed_count = sum(
            1 for t in ["context_tolerance", "symmetry", "clarification"]
            if current_tests.get(t, {}).get("result") not in [None, "unknown", TestResult.UNKNOWN]
        )
        
        if completed_count < 1:
            raise HTTPException(
                status_code=400,
                detail="D1 Guardrail: Cannot finalize without at least 1 completed test. Save as 'preliminary' instead."
            )
        
        if not data.guardrail_ack:
            raise HTTPException(
                status_code=400,
                detail="D1 Guardrail: Must acknowledge discernment-only use to finalize."
            )
        
        tests_update["status"] = ObservationStatus.FINALIZED.value
        tests_update["finalized_at"] = now
        tests_update["finalized_by_user_id"] = current_user["id"]
    else:
        tests_update["status"] = data.set_status.value
    
    # Perform update
    await db.ddm_observations.update_one(
        {"id": observation_id},
        {"$set": tests_update}
    )
    
    # Audit log
    await log_ddm_action(db, current_user["id"], "tests_updated", observation_id, diff_json={"status": tests_update.get("status")})
    
    # Get final status message
    final_status = tests_update.get("status", observation.get("status"))
    status_message = _get_status_message(final_status)
    
    logger.info(f"DDM observation {observation_id} tests updated by {current_user['id']}. Status: {final_status}")
    
    return {
        "success": True,
        "observation_id": observation_id,
        "status": final_status,
        "status_message": status_message,
        "disclaimer": DISCLAIMER
    }


@router.post("/observation/{observation_id}/finalize", response_model=dict)
async def finalize_observation(
    observation_id: str,
    data: DDMFinalizeRequest,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Finalize a DDM observation.
    
    D1 ENFORCEMENT:
    - Requires at least 1 falsifiable test completed
    - Requires guardrail acknowledgment
    - Stage 9 requires explicit confirmation
    """
    engine = get_ddm_engine()
    
    observation = await db.ddm_observations.find_one({"id": observation_id})
    
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    if observation.get("status") == "finalized":
        raise HTTPException(status_code=400, detail="Observation is already finalized")
    
    # Check tests
    tests = observation.get("tests", {})
    completed = sum(
        1 for t in ["context_tolerance", "symmetry", "clarification"]
        if tests.get(t, {}).get("result") not in [None, "unknown"]
    )
    
    if completed < 1:
        raise HTTPException(
            status_code=400,
            detail="D1 Guardrail: At least 1 falsifiable test must be completed to finalize."
        )
    
    if not data.guardrail_ack:
        raise HTTPException(
            status_code=400,
            detail="D1 Guardrail: Must acknowledge discernment-only use to finalize."
        )
    
    # Check Stage 9
    if observation.get("escalation_stage_observed") == 9:
        if not observation.get("stage_9_explicit_confirmation"):
            raise HTTPException(
                status_code=400,
                detail="D1 Guardrail: Stage 9 (Death context) requires explicit confirmation."
            )
    
    # Finalize
    now = datetime.utcnow()
    await db.ddm_observations.update_one(
        {"id": observation_id},
        {"$set": {
            "status": ObservationStatus.FINALIZED.value,
            "finalized_at": now,
            "finalized_by_user_id": current_user["id"],
            "guardrail_ack": True,
            "updated_at": now
        }}
    )
    
    # Audit log
    await log_ddm_action(db, current_user["id"], "finalize", observation_id, notes=data.final_notes)
    
    return {
        "success": True,
        "observation_id": observation_id,
        "status": "finalized",
        "finalized_at": now.isoformat(),
        "disclaimer": DISCLAIMER
    }


@router.get("/subject/{subject_ref}/trend", response_model=dict)
async def get_subject_trend(
    subject_ref: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Get LDI trend analysis for a subject over time.
    
    SECURITY: Founder/Admin only (D2).
    D4: Returns probabilistic trend summary.
    """
    engine = get_ddm_engine()
    
    # Fetch all observations for subject
    cursor = db.ddm_observations.find({"subject_ref": subject_ref}, {"_id": 0})
    observations_raw = await cursor.to_list(length=1000)
    
    # Convert to models
    observations = []
    for obs in observations_raw:
        try:
            # Handle nested objects
            if "features" in obs and isinstance(obs["features"], dict):
                from models.ddm import DDMFeatures
                obs["features"] = DDMFeatures(**obs["features"])
            if "protected_variable" in obs and isinstance(obs["protected_variable"], dict):
                from models.ddm import ProtectedVariableScores
                obs["protected_variable"] = ProtectedVariableScores(**obs["protected_variable"])
            if "tests" in obs and isinstance(obs["tests"], dict):
                obs["tests"] = DDMTests(**obs["tests"])
            
            observations.append(DDMObservation(**obs))
        except Exception as e:
            logger.warning(f"Skipping malformed observation: {e}")
    
    # Analyze trend
    trend = engine.analyze_trend(observations, subject_ref)
    
    return {
        "trend": trend.dict(),
        "disclaimer": DISCLAIMER
    }


@router.post("/observation/{observation_id}/export", response_model=dict)
async def export_observation(
    observation_id: str,
    data: DDMExportRequest,
    current_user = Depends(require_role("super_admin", "founder")),
    db = Depends(get_db)
):
    """
    Export a DDM observation with watermark.
    
    SECURITY: Super Admin/Founder only (D2).
    D4: Export includes watermark and disclaimers.
    """
    observation = await db.ddm_observations.find_one({"id": observation_id}, {"_id": 0})
    
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    # Build export data
    export_data = {
        "watermark": WATERMARK,
        "disclaimer": DISCLAIMER,
        "exported_at": datetime.utcnow().isoformat(),
        "exported_by": current_user["id"],
        "weights_version": observation.get("weights_version", "ddm-v1-weights"),
        "observation": observation
    }
    
    if data.include_audit_log:
        audit_cursor = db.ddm_audit_log.find({"observation_id": observation_id}, {"_id": 0})
        export_data["audit_log"] = await audit_cursor.to_list(length=1000)
    
    # Audit log
    await log_ddm_action(db, current_user["id"], "export", observation_id, notes=f"Format: {data.format}")
    
    return export_data


@router.delete("/observation/{observation_id}", response_model=dict)
async def delete_observation(
    observation_id: str,
    current_user = Depends(require_role("super_admin", "founder")),
    db = Depends(get_db)
):
    """
    Delete a DDM observation.
    
    SECURITY: Super Admin/Founder only.
    AUDIT: Deletion is logged before removal.
    """
    observation = await db.ddm_observations.find_one({"id": observation_id})
    
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    # Log deletion BEFORE removing
    await log_ddm_action(
        db, 
        current_user["id"], 
        "delete", 
        observation_id, 
        diff_json={"subject_ref": observation.get("subject_ref")},
        notes="Observation permanently deleted"
    )
    
    logger.warning(
        f"DDM observation {observation_id} DELETED by {current_user['id']}. "
        f"Subject: {observation.get('subject_ref', 'N/A')}"
    )
    
    await db.ddm_observations.delete_one({"id": observation_id})
    
    return {
        "success": True,
        "message": "Observation deleted",
        "observation_id": observation_id
    }


@router.get("/escalation-ladder", response_model=dict)
async def get_escalation_ladder(
    current_user = Depends(require_role("super_admin", "admin", "founder")),
):
    """
    Get the canonical escalation ladder reference.
    """
    return {
        "ladder": ESCALATION_LADDER,
        "note": "Stage 9 (Death) cannot be auto-inferred and requires explicit user confirmation.",
        "disclaimer": DISCLAIMER
    }


@router.get("/audit-log", response_model=dict)
async def get_audit_log(
    observation_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    current_user = Depends(require_role("super_admin", "founder")),
    db = Depends(get_db)
):
    """
    Get DDM audit log entries.
    
    SECURITY: Super Admin/Founder only.
    """
    query = {}
    if observation_id:
        query["observation_id"] = observation_id
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    
    cursor = db.ddm_audit_log.find(query, {"_id": 0}).sort("ts", -1).limit(limit)
    entries = await cursor.to_list(length=limit)
    
    return {
        "entries": entries,
        "total": len(entries)
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _get_status_message(status: str) -> str:
    """Get human-readable status message using allowed language (D0)"""
    messages = {
        "draft": "Draft — Not yet scored or analyzed.",
        "preliminary": "Preliminary — Pattern analysis complete, no tests verified. Interpret with caution.",
        "finalized": "Finalized — Tests completed, analysis locked. Pattern indicators documented."
    }
    return messages.get(status, "Unknown status")
