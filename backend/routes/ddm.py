"""
DDM (Dismissal Detection Model) - API Routes

Pattern detection endpoints for the Dismissal Detection Model.
This is a DISCERNMENT TOOL, not an accusation system.

SECURITY: Restricted to Founder/Admin roles only.
AUDIT: All operations are logged.
"""

import logging
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Query

from db.connection import get_db
from middleware.auth_guard import get_current_user, require_role
from models.ddm import (
    DDMObservation,
    DDMObservationCreate,
    DDMScoreResponse,
    DDMTestUpdate,
    DDMTrendAnalysis,
    DDMTests,
    FalsifiableTest,
    ObservationStatus,
    TestResult
)
from services.ddm_engine import get_ddm_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ddm", tags=["DDM - Dismissal Detection Model"])


# =============================================================================
# CONSTANTS
# =============================================================================

DISCLAIMER = (
    "DDM is a pattern detection tool for discernment purposes only. "
    "It does NOT label individuals as liars or make accusations. "
    "All outputs are probabilistic and require falsifiable testing."
)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def add_audit_entry(observation: dict, action: str, user_id: str, details: str = None) -> dict:
    """Add audit log entry to observation"""
    if "audit_log" not in observation:
        observation["audit_log"] = []
    
    observation["audit_log"].append({
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "user_id": user_id,
        "details": details
    })
    return observation


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
    
    SECURITY: Founder/Admin only.
    ETHICS: User must acknowledge discernment-only use.
    
    Returns: LDI score, breakdown, and recommended tests.
    """
    engine = get_ddm_engine()
    
    # Calculate scores
    score_response = engine.score(data.features)
    
    # Create observation record
    observation = DDMObservation(
        id=str(uuid4()),
        created_at=datetime.utcnow(),
        created_by=current_user["id"],
        context_title=data.context_title,
        context_notes=data.context_notes,
        subject_type=data.subject_type,
        subject_ref=data.subject_ref,
        truth_claim=data.truth_claim,
        response_text=data.response_text,
        features=data.features,
        weights_version="v1",
        ldi_score=score_response.ldi_score_normalized,
        ldi_confidence=score_response.ldi_confidence,
        escalation_band=score_response.escalation_band,
        protected_variable=score_response.protected_variable,
        tests=DDMTests(),
        guardrail_ack=data.guardrail_ack,
        status=ObservationStatus.PRELIMINARY,
        audit_log=[]
    )
    
    # Add creation audit entry
    obs_dict = observation.dict()
    obs_dict = add_audit_entry(obs_dict, "created", current_user["id"], "Observation created")
    
    # Store in database
    await db.ddm_observations.insert_one(obs_dict)
    
    logger.info(f"DDM observation created: {observation.id} by user {current_user['id']}")
    
    return {
        "success": True,
        "observation_id": observation.id,
        "ldi_score": score_response.ldi_score_normalized,
        "ldi_confidence": score_response.ldi_confidence,
        "escalation_band": score_response.escalation_band.value,
        "feature_breakdown": score_response.feature_breakdown,
        "protected_variable": score_response.protected_variable.dict(),
        "recommended_tests": score_response.recommended_tests,
        "status": ObservationStatus.PRELIMINARY.value,
        "disclaimer": DISCLAIMER,
        "uncertainty_note": score_response.uncertainty_note
    }


@router.get("/observations", response_model=dict)
async def list_observations(
    subject_ref: Optional[str] = Query(None, description="Filter by subject reference"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List DDM observations with optional filtering.
    
    SECURITY: Founder/Admin only.
    """
    query = {}
    if subject_ref:
        query["subject_ref"] = subject_ref
    
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
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get a single DDM observation by ID.
    
    SECURITY: Founder/Admin only.
    """
    observation = await db.ddm_observations.find_one({"id": observation_id}, {"_id": 0})
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    return {
        "observation": observation,
        "disclaimer": DISCLAIMER
    }


@router.post("/observation/{observation_id}/tests", response_model=dict)
async def update_tests(
    observation_id: str,
    data: DDMTestUpdate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update falsifiable test results for an observation.
    
    SECURITY: Founder/Admin only.
    ETHICS: Must acknowledge guardrail before finalizing.
    
    Rule: Cannot finalize without at least 1 test OR explicit 'Preliminary only' state.
    """
    engine = get_ddm_engine()
    
    # Find existing observation
    observation = await db.ddm_observations.find_one({"id": observation_id})
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    # Update tests
    tests_update = {}
    now = datetime.utcnow()
    
    if data.context_tolerance:
        tests_update["tests.context_tolerance"] = {
            "result": data.context_tolerance.result.value,
            "notes": data.context_tolerance.notes,
            "tested_at": now.isoformat(),
            "tested_by": current_user["id"]
        }
    
    if data.symmetry:
        tests_update["tests.symmetry"] = {
            "result": data.symmetry.result.value,
            "notes": data.symmetry.notes,
            "tested_at": now.isoformat(),
            "tested_by": current_user["id"]
        }
    
    if data.clarification:
        tests_update["tests.clarification"] = {
            "result": data.clarification.result.value,
            "notes": data.clarification.notes,
            "tested_at": now.isoformat(),
            "tested_by": current_user["id"]
        }
    
    tests_update["guardrail_ack"] = data.guardrail_ack
    tests_update["updated_at"] = now
    
    # Perform update
    await db.ddm_observations.update_one(
        {"id": observation_id},
        {"$set": tests_update}
    )
    
    # Fetch updated and determine status
    updated = await db.ddm_observations.find_one({"id": observation_id})
    
    # Convert to model for status calculation
    obs_model = DDMObservation(**{k: v for k, v in updated.items() if k != "_id"})
    new_status = engine.determine_status(obs_model)
    
    # Update status
    await db.ddm_observations.update_one(
        {"id": observation_id},
        {
            "$set": {"status": new_status.value},
            "$push": {
                "audit_log": {
                    "timestamp": now.isoformat(),
                    "action": "tests_updated",
                    "user_id": current_user["id"],
                    "details": f"Status: {new_status.value}"
                }
            }
        }
    )
    
    logger.info(f"DDM observation {observation_id} tests updated by {current_user['id']}. Status: {new_status.value}")
    
    return {
        "success": True,
        "observation_id": observation_id,
        "status": new_status.value,
        "message": _get_status_message(new_status),
        "disclaimer": DISCLAIMER
    }


@router.get("/subject/{subject_ref}/trend", response_model=dict)
async def get_subject_trend(
    subject_ref: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get LDI trend analysis for a subject over time.
    
    SECURITY: Founder/Admin only.
    
    Returns: Time series data + delta LDI + probabilistic trend summary.
    """
    engine = get_ddm_engine()
    
    # Fetch all observations for subject
    cursor = db.ddm_observations.find({"subject_ref": subject_ref}, {"_id": 0})
    observations_raw = await cursor.to_list(length=1000)
    
    # Convert to models
    observations = []
    for obs in observations_raw:
        try:
            observations.append(DDMObservation(**obs))
        except Exception as e:
            logger.warning(f"Skipping malformed observation: {e}")
    
    # Analyze trend
    trend = engine.analyze_trend(observations, subject_ref)
    
    return {
        "trend": trend.dict(),
        "disclaimer": DISCLAIMER
    }


@router.delete("/observation/{observation_id}", response_model=dict)
async def delete_observation(
    observation_id: str,
    current_user = Depends(require_role("super_admin", "founder")),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Delete a DDM observation.
    
    SECURITY: Super Admin/Founder only.
    AUDIT: Deletion is logged before removal.
    """
    observation = await db.ddm_observations.find_one({"id": observation_id})
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    # Log deletion before removing
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


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _get_status_message(status: ObservationStatus) -> str:
    """Get human-readable status message"""
    messages = {
        ObservationStatus.PRELIMINARY: "Preliminary — No tests completed. Interpret with caution.",
        ObservationStatus.IN_REVIEW: "In Review — Some tests completed. Continue verification.",
        ObservationStatus.VERIFIED: "Verified — All tests completed. Pattern analysis complete.",
        ObservationStatus.DEFENSE_LIKELY: "Defense Likely — Clarification test suggests defended position."
    }
    return messages.get(status, "Unknown status")
