"""
HDOS Engine v1 - Deterministic Exit-Safe Routing Classifier
BANIBS Human Defense Operating System

CONSTITUTIONAL LOCK:
- HDOS Engine is a STRUCTURAL VISIBILITY TOOL
- It NEVER prescribes actions, predicts behavior, enforces compliance, or inspects inner states
- It MAY classify STRUCTURE/CONFIGURATION, map pressure vectors, and output confidence

OUTPUT CONTRACT: routing.state + confidence + pressure_breakdown + collapse_path + warnings
CLASSIFICATION: EXIT-PRESERVED | EXIT-THREATENED | EXIT-SEALED | UNDETERMINED
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
# MODELS - Per Constitutional Specification
# =============================================================================

class HDOSAnalysisInput(BaseModel):
    """
    INPUT SCHEMA (STRUCTURED FORM)
    Required fields minimum for anything other than UNDETERMINED
    """
    # Required fields
    context_type: Literal["personal", "work", "institution", "public"]
    public_exposure: bool
    power_asymmetry: Literal["none", "low", "med", "high"]
    urgency_level: Literal["none", "low", "med", "high"]
    moral_loading: Literal["none", "low", "med", "high"]
    refusal_cost: Literal["none", "low", "med", "high"]
    exit_paths_available: Literal["yes", "partial", "no", "unknown"]
    force_level: Literal["none", "verbal", "social", "physical", "weapon"]
    
    # Optional fields
    escalation_sequence: Optional[List[str]] = []
    notes: Optional[str] = Field(None, max_length=500)


class PressureVector(BaseModel):
    vector: str
    trigger: str
    amplifiers: List[str]
    observable_signals: List[str]
    magnitude: Literal["Low", "Medium", "High"]


class RoutingState(BaseModel):
    state: Literal["EXIT-PRESERVED", "EXIT-THREATENED", "EXIT-SEALED", "UNDETERMINED"]


class HDOSAnalysisOutput(BaseModel):
    routing: RoutingState
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    pressure_breakdown: List[PressureVector]
    collapse_path: str
    warnings: List[str]
    guardrails_footer: str
    hdos_version: str
    # Optional geometry-only DOG reference (not identity)
    dog_config_present: Optional[bool] = None
    # Indices for transparency
    pressure_index: int
    exit_integrity_index: int
    escalation_index: int


# =============================================================================
# DETERMINISTIC RULES ENGINE (NO LLM)
# =============================================================================

# Scoring maps per specification
URGENCY_SCORES = {"none": 0, "low": 10, "med": 25, "high": 40}
MORAL_LOADING_SCORES = {"none": 0, "low": 10, "med": 25, "high": 40}
POWER_ASYMMETRY_SCORES = {"none": 0, "low": 10, "med": 25, "high": 40}
REFUSAL_COST_SCORES = {"none": 0, "low": 15, "med": 35, "high": 60}
FORCE_LEVEL_SCORES = {"none": 0, "verbal": 10, "social": 20, "physical": 45, "weapon": 80}
EXIT_BASELINE = {"yes": 100, "partial": 60, "no": 20, "unknown": 50}


def clamp(value: int, min_val: int = 0, max_val: int = 100) -> int:
    """Clamp value to range [min_val, max_val]"""
    return max(min_val, min(max_val, value))


def calculate_completion_ratio(input_data: HDOSAnalysisInput) -> float:
    """
    CONFIDENCE RULE (NO GUESSING)
    completion_ratio = filled_required / total_required
    """
    total_required = 8  # All required fields
    filled = 0
    
    # All required fields are present by Pydantic validation
    # But we check for "meaningful" values vs defaults
    if input_data.context_type:
        filled += 1
    if input_data.public_exposure is not None:
        filled += 1
    if input_data.power_asymmetry != "none" or input_data.power_asymmetry == "none":
        filled += 1  # Any explicit choice counts
    if input_data.urgency_level:
        filled += 1
    if input_data.moral_loading:
        filled += 1
    if input_data.refusal_cost:
        filled += 1
    if input_data.exit_paths_available:
        filled += 1
    if input_data.force_level:
        filled += 1
    
    return filled / total_required


def determine_confidence(completion_ratio: float) -> str:
    """
    >= 0.85 -> HIGH
    0.60-0.84 -> MEDIUM
    < 0.60 -> LOW + routing.state="UNDETERMINED"
    """
    if completion_ratio >= 0.85:
        return "HIGH"
    elif completion_ratio >= 0.60:
        return "MEDIUM"
    else:
        return "LOW"


def calculate_indices(input_data: HDOSAnalysisInput) -> tuple:
    """
    Compute three structural indices (0-100):
    A) PRESSURE_INDEX
    B) EXIT_INTEGRITY_INDEX
    C) ESCALATION_INDEX
    """
    # PRESSURE_INDEX = clamp(urgency + moral + public + power + refusal_cost, 0..100)
    urgency_pts = URGENCY_SCORES.get(input_data.urgency_level, 0)
    moral_pts = MORAL_LOADING_SCORES.get(input_data.moral_loading, 0)
    public_pts = 20 if input_data.public_exposure else 0
    power_pts = POWER_ASYMMETRY_SCORES.get(input_data.power_asymmetry, 0)
    refusal_pts = REFUSAL_COST_SCORES.get(input_data.refusal_cost, 0)
    
    pressure_index = clamp(urgency_pts + moral_pts + public_pts + power_pts + refusal_pts)
    
    # ESCALATION_INDEX = clamp(force_level_points + (public_exposure?10:0) + (refusal_cost>=med?10:0), 0..100)
    force_pts = FORCE_LEVEL_SCORES.get(input_data.force_level, 0)
    escalation_public = 10 if input_data.public_exposure else 0
    escalation_refusal = 10 if input_data.refusal_cost in ["med", "high"] else 0
    
    escalation_index = clamp(force_pts + escalation_public + escalation_refusal)
    
    # EXIT_INTEGRITY_INDEX = baseline_exit
    # Then subtract structural compression:
    # EXIT_INTEGRITY_INDEX -= round(0.35*PRESSURE_INDEX)
    # EXIT_INTEGRITY_INDEX -= round(0.25*ESCALATION_INDEX)
    exit_baseline = EXIT_BASELINE.get(input_data.exit_paths_available, 50)
    exit_integrity_index = exit_baseline
    exit_integrity_index -= round(0.35 * pressure_index)
    exit_integrity_index -= round(0.25 * escalation_index)
    exit_integrity_index = clamp(exit_integrity_index)
    
    return pressure_index, exit_integrity_index, escalation_index


def determine_routing_state(
    confidence: str,
    exit_paths: str,
    exit_integrity_index: int
) -> str:
    """
    CLASSIFICATION (ROUTING.STATE)
    - if confidence LOW -> UNDETERMINED
    - else if exit_paths_available == "no" OR EXIT_INTEGRITY_INDEX <= 25 -> EXIT-SEALED
    - else if EXIT_INTEGRITY_INDEX <= 55 -> EXIT-THREATENED
    - else -> EXIT-PRESERVED
    """
    if confidence == "LOW":
        return "UNDETERMINED"
    
    if exit_paths == "no" or exit_integrity_index <= 25:
        return "EXIT-SEALED"
    elif exit_integrity_index <= 55:
        return "EXIT-THREATENED"
    else:
        return "EXIT-PRESERVED"


def determine_dog_config_present(routing_state: str, pressure_index: int) -> bool:
    """
    DOG_CONFIG_PRESENT (GEOMETRY ONLY)
    DOG_CONFIG_PRESENT = true if routing.state in {EXIT-SEALED, EXIT-THREATENED} AND PRESSURE_INDEX >= 60
    """
    return routing_state in ["EXIT-SEALED", "EXIT-THREATENED"] and pressure_index >= 60


def magnitude_from_level(level: str) -> str:
    """Map none/low/med/high to Low/Medium/High"""
    if level in ["none", "low"]:
        return "Low"
    elif level == "med":
        return "Medium"
    else:
        return "High"


def build_pressure_breakdown(input_data: HDOSAnalysisInput) -> List[PressureVector]:
    """
    PRESSURE BREAKDOWN (DETERMINISTIC MAPPING)
    Always populate from fields only (no psych inference)
    """
    vectors = []
    
    # URGENCY vector
    if input_data.urgency_level != "none":
        amplifiers = []
        if input_data.public_exposure:
            amplifiers.append("public exposure")
        if input_data.refusal_cost in ["med", "high"]:
            amplifiers.append("high refusal cost")
        
        vectors.append(PressureVector(
            vector="URGENCY",
            trigger=f"urgency_level: {input_data.urgency_level}",
            amplifiers=amplifiers,
            observable_signals=["time pressure applied", "deadline imposed"],
            magnitude=magnitude_from_level(input_data.urgency_level)
        ))
    
    # MORAL FORCE vector
    if input_data.moral_loading != "none":
        amplifiers = []
        if input_data.public_exposure:
            amplifiers.append("public exposure")
        if input_data.power_asymmetry in ["med", "high"]:
            amplifiers.append("power asymmetry")
        
        vectors.append(PressureVector(
            vector="MORAL FORCE",
            trigger=f"moral_loading: {input_data.moral_loading}",
            amplifiers=amplifiers,
            observable_signals=["obligation invoked", "duty/guilt referenced"],
            magnitude=magnitude_from_level(input_data.moral_loading)
        ))
    
    # POWER ASYMMETRY vector
    if input_data.power_asymmetry != "none":
        amplifiers = []
        if input_data.force_level in ["social", "physical", "weapon"]:
            amplifiers.append("force escalation")
        if input_data.refusal_cost in ["med", "high"]:
            amplifiers.append("high refusal cost")
        
        vectors.append(PressureVector(
            vector="POWER ASYMMETRY",
            trigger=f"power_asymmetry: {input_data.power_asymmetry}",
            amplifiers=amplifiers,
            observable_signals=["hierarchical leverage present", "authority invoked"],
            magnitude=magnitude_from_level(input_data.power_asymmetry)
        ))
    
    # PUBLIC EXPOSURE vector
    if input_data.public_exposure:
        amplifiers = []
        if input_data.moral_loading in ["med", "high"]:
            amplifiers.append("high moral loading")
        
        vectors.append(PressureVector(
            vector="PUBLIC EXPOSURE",
            trigger="public_exposure: true",
            amplifiers=amplifiers,
            observable_signals=["visibility multiplier active", "reputation at stake"],
            magnitude="Medium"  # Public exposure is inherently medium
        ))
    
    # REFUSAL PENALTY vector
    if input_data.refusal_cost != "none":
        amplifiers = []
        if input_data.power_asymmetry in ["med", "high"]:
            amplifiers.append("power asymmetry")
        if input_data.force_level in ["physical", "weapon"]:
            amplifiers.append("force escalation")
        
        vectors.append(PressureVector(
            vector="REFUSAL PENALTY",
            trigger=f"refusal_cost: {input_data.refusal_cost}",
            amplifiers=amplifiers,
            observable_signals=["cost for saying no", "penalty for pausing/leaving"],
            magnitude=magnitude_from_level(input_data.refusal_cost)
        ))
    
    # ESCALATION vector
    if input_data.force_level != "none" or (input_data.escalation_sequence and len(input_data.escalation_sequence) > 0):
        amplifiers = []
        if input_data.public_exposure:
            amplifiers.append("public exposure")
        if input_data.escalation_sequence and len(input_data.escalation_sequence) > 0:
            amplifiers.append(f"{len(input_data.escalation_sequence)} escalation step(s)")
        
        force_magnitude = "Low"
        if input_data.force_level in ["verbal", "social"]:
            force_magnitude = "Medium" if input_data.force_level == "social" else "Low"
        elif input_data.force_level in ["physical", "weapon"]:
            force_magnitude = "High"
        
        vectors.append(PressureVector(
            vector="ESCALATION",
            trigger=f"force_level: {input_data.force_level}",
            amplifiers=amplifiers,
            observable_signals=["force applied or threatened", "progressive intensification"],
            magnitude=force_magnitude
        ))
    
    return vectors


def build_collapse_path(
    input_data: HDOSAnalysisInput,
    pressure_index: int,
    routing_state: str,
    escalation_index: int
) -> str:
    """
    Collapse Path String (TEMPLATE)
    Example format:
    "Pressure(URGENCY+MORAL+POWER) -> RefusalCost(HIGH) -> Exits(NARROWING) -> Output(ESCALATION=SOCIAL/PHYSICAL)"
    NO moral verdicts. NO "should". NO advice.
    """
    # Build pressure components
    pressure_components = []
    if input_data.urgency_level != "none":
        pressure_components.append("URGENCY")
    if input_data.moral_loading != "none":
        pressure_components.append("MORAL")
    if input_data.power_asymmetry != "none":
        pressure_components.append("POWER")
    if input_data.public_exposure:
        pressure_components.append("PUBLIC")
    
    pressure_str = "+".join(pressure_components) if pressure_components else "MINIMAL"
    
    # Refusal cost string
    refusal_str = input_data.refusal_cost.upper() if input_data.refusal_cost != "none" else "NONE"
    
    # Exit status
    exit_map = {
        "EXIT-PRESERVED": "OPEN",
        "EXIT-THREATENED": "NARROWING",
        "EXIT-SEALED": "CLOSED",
        "UNDETERMINED": "UNCLEAR"
    }
    exit_str = exit_map.get(routing_state, "UNCLEAR")
    
    # Force output
    force_str = input_data.force_level.upper() if input_data.force_level != "none" else "NONE"
    
    return f"Pressure({pressure_str}) -> RefusalCost({refusal_str}) -> Exits({exit_str}) -> Output(FORCE={force_str})"


def build_warnings(input_data: HDOSAnalysisInput, pressure_index: int, escalation_index: int) -> List[str]:
    """Build warning flags based on structural conditions"""
    warnings = []
    
    if input_data.public_exposure:
        warnings.append("PUBLIC EXPOSURE MULTIPLIER")
    
    if input_data.power_asymmetry in ["med", "high"]:
        warnings.append("POWER ASYMMETRY PRESENT")
    
    if input_data.force_level in ["physical", "weapon"]:
        warnings.append("PHYSICAL FORCE INDICATED")
    
    if input_data.refusal_cost == "high":
        warnings.append("HIGH REFUSAL COST")
    
    if input_data.exit_paths_available == "no":
        warnings.append("EXIT PATHS BLOCKED")
    
    if pressure_index >= 80:
        warnings.append("ELEVATED PRESSURE INDEX")
    
    if escalation_index >= 50:
        warnings.append("ESCALATION RISK")
    
    return warnings


def analyze_scenario(input_data: HDOSAnalysisInput) -> HDOSAnalysisOutput:
    """
    Main analysis function - DETERMINISTIC RULES ENGINE (NO LLM)
    """
    # Calculate completion ratio and confidence
    completion_ratio = calculate_completion_ratio(input_data)
    confidence = determine_confidence(completion_ratio)
    
    # Calculate structural indices
    pressure_index, exit_integrity_index, escalation_index = calculate_indices(input_data)
    
    # Determine routing state
    routing_state = determine_routing_state(
        confidence,
        input_data.exit_paths_available,
        exit_integrity_index
    )
    
    # Determine DOG configuration (geometry only)
    dog_config = determine_dog_config_present(routing_state, pressure_index)
    
    # Build pressure breakdown
    pressure_breakdown = build_pressure_breakdown(input_data)
    
    # Build collapse path
    collapse_path = build_collapse_path(input_data, pressure_index, routing_state, escalation_index)
    
    # Build warnings
    warnings = build_warnings(input_data, pressure_index, escalation_index)
    
    # Fixed guardrails footer (no advice, no moral verdict)
    guardrails_footer = "HDOS classifies structural patterns; it does not prescribe action, predict behavior, or assess intent."
    
    return HDOSAnalysisOutput(
        routing=RoutingState(state=routing_state),
        confidence=confidence,
        pressure_breakdown=pressure_breakdown,
        collapse_path=collapse_path,
        warnings=warnings,
        guardrails_footer=guardrails_footer,
        hdos_version=HDOS_VERSION,
        dog_config_present=dog_config if dog_config else None,
        pressure_index=pressure_index,
        exit_integrity_index=exit_integrity_index,
        escalation_index=escalation_index
    )


# =============================================================================
# API ENDPOINTS
# =============================================================================

@router.post("/analyze", response_model=HDOSAnalysisOutput)
async def analyze(
    input_data: HDOSAnalysisInput,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    POST /api/hdos/analyze
    
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
    """
    GET /api/hdos/glossary
    Canonical HDOS terms and definitions (updated for v1.2.0 exit-based model)
    """
    return {
        "hdos_version": HDOS_VERSION,
        "terms": [
            {
                "term": "EXIT-PRESERVED",
                "definition": "Routing state where exit paths remain open and accessible. Decision space is not under structural compression.",
                "indicators": ["Clear exit options available", "Low pressure index", "No significant refusal penalties"]
            },
            {
                "term": "EXIT-THREATENED",
                "definition": "Routing state where exit paths are narrowing but not fully blocked. Structural pressure is compressing decision space.",
                "indicators": ["Partial exit availability", "Moderate pressure index", "Some refusal penalties active"]
            },
            {
                "term": "EXIT-SEALED",
                "definition": "Routing state where exit paths are blocked or heavily penalized. Decision space is structurally collapsed.",
                "indicators": ["No viable exit paths", "High pressure index", "Severe refusal penalties"]
            },
            {
                "term": "DOG_CONFIG_PRESENT",
                "definition": "Geometry-only flag indicating structural configuration matches DOG pattern. NOT a label for persons.",
                "indicators": ["EXIT-THREATENED or EXIT-SEALED state", "Pressure index >= 60", "Structural pattern match only"]
            },
            {
                "term": "Pressure Index",
                "definition": "Composite score (0-100) measuring total structural pressure from urgency, moral loading, public exposure, power asymmetry, and refusal cost.",
                "formula": "urgency + moral + public + power + refusal_cost (clamped 0-100)"
            },
            {
                "term": "Exit Integrity Index",
                "definition": "Score (0-100) measuring the structural availability of exit paths after accounting for pressure and escalation compression.",
                "formula": "baseline_exit - (0.35 * PRESSURE_INDEX) - (0.25 * ESCALATION_INDEX)"
            },
            {
                "term": "Escalation Index",
                "definition": "Score (0-100) measuring force level and escalation factors that compress exit availability.",
                "formula": "force_level_points + public_modifier + refusal_cost_modifier"
            },
            {
                "term": "Pressure Vector",
                "definition": "A distinct dimension of structural pressure identified in the analysis. Mapped from input fields only, not psychological inference.",
                "types": ["URGENCY", "MORAL FORCE", "POWER ASYMMETRY", "PUBLIC EXPOSURE", "REFUSAL PENALTY", "ESCALATION"]
            },
            {
                "term": "Collapse Path",
                "definition": "Descriptive sequence showing pressure flow through the system: Pressure -> Cost -> Routing -> Output. Purely descriptive, no predictions.",
                "format": "Pressure(COMPONENTS) -> RefusalCost(LEVEL) -> Exits(STATUS) -> Output(FORCE=LEVEL)"
            },
            {
                "term": "Confidence",
                "definition": "Assessment reliability based ONLY on field completion ratio. No guessing or inference.",
                "values": ["HIGH (>= 85% complete)", "MEDIUM (60-84% complete)", "LOW (< 60% complete)"]
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
    """
    GET /api/hdos/amendments
    List of ratified HDOS amendments
    """
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
        "platform_suite_tests": 6,
        "model": "EXIT-SAFE",
        "classification_states": ["EXIT-PRESERVED", "EXIT-THREATENED", "EXIT-SEALED", "UNDETERMINED"]
    }
