"""
HDOS Engine v1 - Deterministic Routing Classifier
BANIBS Human Defense Operating System

Classifies scenarios into DOG/GOD/MIXED/UNDETERMINED based on
structured input fields using pure scoring + thresholds.

No LLM needed. No prescriptions. Classification only.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from bson import ObjectId
import os

router = APIRouter(prefix="/api/hdos", tags=["HDOS Engine"])

# MongoDB connection
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "banibs_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
hdos_analyses_collection = db["hdos_analyses"]

# Auth
from middleware.auth_guard import get_current_user, get_current_user_optional

# Current HDOS Version
HDOS_VERSION = "1.2.0"

# =============================================================================
# MODELS
# =============================================================================

class IdentityStake(BaseModel):
    level: Literal["none", "low", "med", "high"]
    description: Optional[str] = None

class PowerAsymmetry(BaseModel):
    present: bool
    type: Optional[str] = None  # e.g., "employer/employee", "parent/child", "state/citizen"

class EscalationStep(BaseModel):
    step_number: int
    description: str
    force_level: Optional[str] = None

class HDOSAnalysisInput(BaseModel):
    scenario_summary: Optional[str] = Field(None, max_length=2000)
    context_type: Literal["relationship", "work", "public", "other"]
    public_exposure: bool
    identity_stake: IdentityStake
    power_asymmetry: PowerAsymmetry
    urgency_level: Literal["none", "low", "med", "high"]
    force_level: Literal["none", "verbal", "social", "physical", "weapon"]
    escalation_sequence: List[EscalationStep] = []
    prior_pattern: Literal["first", "repeat", "unknown"]

class PressureVector(BaseModel):
    vector: str
    trigger: str
    amplifiers: List[str]
    signals: List[str]
    magnitude: Literal["low", "medium", "high", "critical"]

class HDOSAnalysisOutput(BaseModel):
    routing_classification: Literal["DOG", "GOD", "MIXED", "UNDETERMINED"]
    confidence: Literal["High", "Medium", "Low"]
    pressure_breakdown: List[PressureVector]
    collapse_path: str
    guardrails_footer: str
    hdos_version: str
    missing_fields: List[str] = []
    analysis_notes: List[str] = []

class SavedAnalysis(BaseModel):
    id: str
    input_data: dict
    output_data: dict
    created_at: str
    hdos_version: str

# =============================================================================
# DETERMINISTIC RULES ENGINE
# =============================================================================

def calculate_field_completeness(input_data: HDOSAnalysisInput) -> tuple[float, List[str]]:
    """Calculate how complete the input is and list missing fields."""
    missing = []
    total_fields = 9
    filled = 0
    
    # Check each field
    if input_data.scenario_summary and len(input_data.scenario_summary.strip()) > 10:
        filled += 1
    else:
        missing.append("scenario_summary (detailed description)")
    
    if input_data.context_type:
        filled += 1
    
    if input_data.public_exposure is not None:
        filled += 1
    
    if input_data.identity_stake.level != "none" or input_data.identity_stake.description:
        filled += 1
    else:
        missing.append("identity_stake (what's at risk for identity)")
    
    if input_data.power_asymmetry.present and input_data.power_asymmetry.type:
        filled += 1
    elif not input_data.power_asymmetry.present:
        filled += 1
    else:
        missing.append("power_asymmetry.type (specify the power relationship)")
    
    if input_data.urgency_level:
        filled += 1
    
    if input_data.force_level:
        filled += 1
    
    if len(input_data.escalation_sequence) > 0:
        filled += 1
    else:
        missing.append("escalation_sequence (steps that led to current state)")
    
    if input_data.prior_pattern != "unknown":
        filled += 1
    else:
        missing.append("prior_pattern (is this first occurrence or repeat)")
    
    completeness = filled / total_fields
    return completeness, missing


def calculate_pressure_score(input_data: HDOSAnalysisInput) -> dict:
    """Calculate pressure scores across dimensions."""
    scores = {
        "coercion": 0,
        "social": 0,
        "identity": 0,
        "temporal": 0,
        "escalation": 0
    }
    
    # Coercion score (based on force level)
    force_scores = {"none": 0, "verbal": 2, "social": 4, "physical": 7, "weapon": 10}
    scores["coercion"] = force_scores.get(input_data.force_level, 0)
    
    # Social pressure score
    if input_data.public_exposure:
        scores["social"] += 4
    if input_data.context_type == "work":
        scores["social"] += 2
    if input_data.context_type == "public":
        scores["social"] += 3
    
    # Identity stake score
    identity_scores = {"none": 0, "low": 2, "med": 5, "high": 8}
    scores["identity"] = identity_scores.get(input_data.identity_stake.level, 0)
    
    # Temporal pressure score
    urgency_scores = {"none": 0, "low": 2, "med": 5, "high": 8}
    scores["temporal"] = urgency_scores.get(input_data.urgency_level, 0)
    
    # Escalation score
    if len(input_data.escalation_sequence) >= 3:
        scores["escalation"] = 6
    elif len(input_data.escalation_sequence) >= 1:
        scores["escalation"] = 3
    
    if input_data.prior_pattern == "repeat":
        scores["escalation"] += 4
    
    return scores


def determine_routing(scores: dict, input_data: HDOSAnalysisInput) -> str:
    """
    Determine DOG/GOD/MIXED routing based on pressure scores.
    
    DOG (Dismiss, Obstruct, Gaslight): High coercion + identity pressure
    GOD (Guilt, Overwhelm, Demand): High social + temporal pressure
    MIXED: Both patterns present
    UNDETERMINED: Insufficient signal
    """
    total_score = sum(scores.values())
    
    # DOG indicators: coercion + identity + escalation
    dog_score = scores["coercion"] + scores["identity"] + scores["escalation"]
    
    # GOD indicators: social + temporal + identity
    god_score = scores["social"] + scores["temporal"] + scores["identity"]
    
    # Power asymmetry amplifies both
    if input_data.power_asymmetry.present:
        dog_score += 3
        god_score += 2
    
    # Thresholds
    DOG_THRESHOLD = 12
    GOD_THRESHOLD = 10
    
    is_dog = dog_score >= DOG_THRESHOLD
    is_god = god_score >= GOD_THRESHOLD
    
    if is_dog and is_god:
        return "MIXED"
    elif is_dog:
        return "DOG"
    elif is_god:
        return "GOD"
    else:
        return "UNDETERMINED"


def build_pressure_vectors(scores: dict, input_data: HDOSAnalysisInput) -> List[PressureVector]:
    """Build detailed pressure breakdown."""
    vectors = []
    
    # Coercion vector
    if scores["coercion"] > 0:
        magnitude = "low" if scores["coercion"] <= 2 else "medium" if scores["coercion"] <= 5 else "high" if scores["coercion"] <= 8 else "critical"
        amplifiers = []
        if input_data.power_asymmetry.present:
            amplifiers.append(f"Power asymmetry: {input_data.power_asymmetry.type or 'unspecified'}")
        if input_data.prior_pattern == "repeat":
            amplifiers.append("Repeat pattern")
        
        vectors.append(PressureVector(
            vector="Coercion",
            trigger=f"Force level: {input_data.force_level}",
            amplifiers=amplifiers,
            signals=["Direct pressure applied", "Compliance demanded"],
            magnitude=magnitude
        ))
    
    # Social pressure vector
    if scores["social"] > 0:
        magnitude = "low" if scores["social"] <= 3 else "medium" if scores["social"] <= 5 else "high"
        amplifiers = []
        if input_data.public_exposure:
            amplifiers.append("Public visibility")
        if input_data.context_type in ["work", "public"]:
            amplifiers.append(f"Context: {input_data.context_type}")
        
        vectors.append(PressureVector(
            vector="Social",
            trigger="Reputation/standing at stake",
            amplifiers=amplifiers,
            signals=["Social cost imposed", "Community visibility"],
            magnitude=magnitude
        ))
    
    # Identity pressure vector
    if scores["identity"] > 0:
        magnitude = "low" if scores["identity"] <= 2 else "medium" if scores["identity"] <= 5 else "high"
        vectors.append(PressureVector(
            vector="Identity",
            trigger=f"Identity stake: {input_data.identity_stake.level}",
            amplifiers=[input_data.identity_stake.description] if input_data.identity_stake.description else [],
            signals=["Self-concept threatened", "Values/beliefs challenged"],
            magnitude=magnitude
        ))
    
    # Temporal pressure vector
    if scores["temporal"] > 0:
        magnitude = "low" if scores["temporal"] <= 2 else "medium" if scores["temporal"] <= 5 else "high"
        vectors.append(PressureVector(
            vector="Temporal",
            trigger=f"Urgency level: {input_data.urgency_level}",
            amplifiers=["Deadline pressure"] if input_data.urgency_level in ["med", "high"] else [],
            signals=["Time constraint imposed", "Rushed decision demanded"],
            magnitude=magnitude
        ))
    
    # Escalation vector
    if scores["escalation"] > 0:
        magnitude = "low" if scores["escalation"] <= 3 else "medium" if scores["escalation"] <= 6 else "high"
        step_count = len(input_data.escalation_sequence)
        vectors.append(PressureVector(
            vector="Escalation",
            trigger=f"{step_count} escalation step(s) observed",
            amplifiers=["Repeat pattern"] if input_data.prior_pattern == "repeat" else [],
            signals=["Progressive intensification", "Boundary testing"],
            magnitude=magnitude
        ))
    
    return vectors


def build_collapse_path(routing: str, scores: dict) -> str:
    """Build the collapse path description."""
    total = sum(scores.values())
    
    if routing == "DOG":
        return f"Pressure ({total}) → Identity/Safety Cost → DOG Routing → Submission/Resistance"
    elif routing == "GOD":
        return f"Pressure ({total}) → Social/Temporal Cost → GOD Routing → Compliance/Burnout"
    elif routing == "MIXED":
        return f"Pressure ({total}) → Multi-Vector Cost → MIXED Routing → Complex Response Required"
    else:
        return f"Pressure ({total}) → Cost Unclear → Routing Undetermined → More Information Needed"


def analyze_scenario(input_data: HDOSAnalysisInput) -> HDOSAnalysisOutput:
    """Main analysis function - deterministic rules engine."""
    
    # Calculate completeness
    completeness, missing_fields = calculate_field_completeness(input_data)
    
    # Determine confidence based on completeness
    if completeness >= 0.8:
        confidence = "High"
    elif completeness >= 0.5:
        confidence = "Medium"
    else:
        confidence = "Low"
    
    # Calculate pressure scores
    scores = calculate_pressure_score(input_data)
    
    # Determine routing
    routing = determine_routing(scores, input_data)
    
    # If very low completeness, force UNDETERMINED
    if completeness < 0.4:
        routing = "UNDETERMINED"
        confidence = "Low"
    
    # Build pressure breakdown
    pressure_vectors = build_pressure_vectors(scores, input_data)
    
    # Build collapse path
    collapse_path = build_collapse_path(routing, scores)
    
    # Analysis notes
    notes = []
    if input_data.power_asymmetry.present:
        notes.append(f"Power asymmetry detected: {input_data.power_asymmetry.type or 'type unspecified'}")
    if input_data.prior_pattern == "repeat":
        notes.append("This is a repeat pattern - escalation risk elevated")
    if input_data.force_level in ["physical", "weapon"]:
        notes.append("Physical force indicated - safety priority")
    
    return HDOSAnalysisOutput(
        routing_classification=routing,
        confidence=confidence,
        pressure_breakdown=pressure_vectors,
        collapse_path=collapse_path,
        guardrails_footer="HDOS classifies routing patterns; it does not justify harm or prescribe action.",
        hdos_version=HDOS_VERSION,
        missing_fields=missing_fields,
        analysis_notes=notes
    )


# =============================================================================
# API ENDPOINTS
# =============================================================================

@router.post("/analyze")
async def analyze(
    input_data: HDOSAnalysisInput,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Analyze a scenario using HDOS deterministic routing classifier.
    
    Returns structured classification without prescriptions.
    Optionally saves analysis for authenticated users.
    """
    # Run analysis
    result = analyze_scenario(input_data)
    
    # Save for authenticated users
    if current_user:
        analysis_doc = {
            "user_id": current_user["id"],
            "input_data": input_data.model_dump(),
            "output_data": result.model_dump(),
            "hdos_version": HDOS_VERSION,
            "created_at": datetime.now(timezone.utc)
        }
        await hdos_analyses_collection.insert_one(analysis_doc)
    
    return result


@router.get("/analyses")
async def get_user_analyses(
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's saved analyses (private)."""
    cursor = hdos_analyses_collection.find(
        {"user_id": current_user["id"]},
        {"_id": 1, "input_data": 1, "output_data": 1, "created_at": 1, "hdos_version": 1}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    analyses = []
    async for doc in cursor:
        analyses.append({
            "id": str(doc["_id"]),
            "input_data": doc["input_data"],
            "output_data": doc["output_data"],
            "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
            "hdos_version": doc.get("hdos_version", "unknown")
        })
    
    total = await hdos_analyses_collection.count_documents({"user_id": current_user["id"]})
    
    return {
        "analyses": analyses,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/analyses/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific analysis by ID (user's own only)."""
    try:
        oid = ObjectId(analysis_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")
    
    doc = await hdos_analyses_collection.find_one({
        "_id": oid,
        "user_id": current_user["id"]
    })
    
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "id": str(doc["_id"]),
        "input_data": doc["input_data"],
        "output_data": doc["output_data"],
        "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
        "hdos_version": doc.get("hdos_version", "unknown")
    }


@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific analysis (user's own only)."""
    try:
        oid = ObjectId(analysis_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")
    
    result = await hdos_analyses_collection.delete_one({
        "_id": oid,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {"message": "Analysis deleted"}


@router.get("/glossary")
async def get_glossary():
    """Get canonical HDOS terms and definitions."""
    return {
        "hdos_version": HDOS_VERSION,
        "terms": [
            {
                "term": "DOG",
                "definition": "Dismiss, Obstruct, Gaslight - Routing pattern characterized by coercion, identity pressure, and escalation tactics.",
                "indicators": ["Direct force/coercion", "Identity threats", "Progressive escalation", "Power asymmetry exploitation"]
            },
            {
                "term": "GOD",
                "definition": "Guilt, Overwhelm, Demand - Routing pattern characterized by social pressure, temporal urgency, and compliance demands.",
                "indicators": ["Social/reputation pressure", "Artificial urgency", "Guilt manipulation", "Overwhelm tactics"]
            },
            {
                "term": "MIXED",
                "definition": "Scenario exhibiting both DOG and GOD routing patterns simultaneously.",
                "indicators": ["Multiple pressure vectors active", "Combined coercion and guilt", "Complex multi-front pressure"]
            },
            {
                "term": "Pressure Vector",
                "definition": "A distinct dimension of pressure being applied in a scenario.",
                "types": ["Coercion", "Social", "Identity", "Temporal", "Escalation"]
            },
            {
                "term": "Collapse Path",
                "definition": "The sequence from pressure application through cost imposition to routing outcome.",
                "format": "Pressure → Cost → Routing → Outcome"
            },
            {
                "term": "Power Asymmetry",
                "definition": "Imbalance of power between parties that amplifies pressure effectiveness.",
                "examples": ["Employer/Employee", "Parent/Child", "State/Citizen", "Institution/Individual"]
            },
            {
                "term": "Routing Classification",
                "definition": "The determined pattern category based on pressure analysis. Does not prescribe action.",
                "values": ["DOG", "GOD", "MIXED", "UNDETERMINED"]
            },
            {
                "term": "Harm Confirmation",
                "definition": "Per A-0006: Objective verification that harm has occurred through rule violation, behavioral evidence, mutual acknowledgment, or third-party validation.",
                "states": ["Confirmed", "Disputed"]
            },
            {
                "term": "Responsibility Evasion State",
                "definition": "Per A-0005: State entered when responsible party avoids acknowledgment after confirmed harm.",
                "trigger": "Absence of acknowledgment after direct request in confirmed harm scenario"
            },
            {
                "term": "Accountability Inversion",
                "definition": "Per A-0008: When accountability rules are weaponized to reverse victim burden.",
                "flag": "Accountability Inversion Risk"
            }
        ]
    }


@router.get("/amendments")
async def get_amendments():
    """Get list of ratified HDOS amendments."""
    return {
        "hdos_version": HDOS_VERSION,
        "amendments": [
            {
                "id": "A-0001",
                "title": "Abuse Shield Protocol",
                "status": "RATIFIED",
                "date": "2026-02-10",
                "summary": "Protection against coordinated abuse, harassment, and brigading attacks."
            },
            {
                "id": "A-0002",
                "title": "Emergency Urgency Defense",
                "status": "RATIFIED",
                "date": "2026-02-10",
                "summary": "Resistance to artificial urgency and FOMO manipulation tactics."
            },
            {
                "id": "A-0003",
                "title": "Analysis Loop Circuit Breaker",
                "status": "RATIFIED",
                "date": "2026-02-10",
                "summary": "Circuit breakers for AI systems to prevent infinite loops."
            },
            {
                "id": "A-0004",
                "title": "Power Asymmetry Guardrails",
                "status": "RATIFIED",
                "date": "2026-02-10",
                "summary": "Protection against platform power exploitation of users."
            },
            {
                "id": "A-0005",
                "title": "Responsibility Acknowledgment Requirement",
                "status": "RATIFIED",
                "date": "2026-02-13",
                "summary": "Requires explicit responsibility acknowledgment in confirmed harm scenarios."
            },
            {
                "id": "A-0006",
                "title": "Harm Confirmation Standard",
                "status": "RATIFIED",
                "date": "2026-02-13",
                "summary": "Defines threshold for confirmed vs disputed harm claims."
            },
            {
                "id": "A-0007",
                "title": "Responsibility Granularity Framework",
                "status": "RATIFIED",
                "date": "2026-02-13",
                "summary": "Allows proportional responsibility acknowledgment (full/partial/contextual)."
            },
            {
                "id": "A-0008",
                "title": "Abuse Inversion Safeguard",
                "status": "RATIFIED",
                "date": "2026-02-13",
                "summary": "Prevents weaponization of accountability rules against vulnerable parties."
            }
        ]
    }


@router.get("/version")
async def get_version():
    """Get current HDOS version info."""
    return {
        "version": HDOS_VERSION,
        "status": "GREEN",
        "release_gate": "GREEN-only",
        "last_updated": "2026-02-13",
        "amendment_count": 8,
        "logic_suite_tests": 10,
        "platform_suite_tests": 6
    }
