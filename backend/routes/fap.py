"""
BANIBS Founder Authentication Protocol (FAP) API Routes
Phase X - 21-Layer Security Foundation

API endpoints for FAP administration, command authorization, and monitoring.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase
from middleware.auth_guard import get_current_user
from db import get_db

from schemas.fap import (
    FAPConfig, FAPHealthCheck, RegisteredCommand,
    CommandAuthorizationRequest, CommandAuthorizationResult,
    SecurityEvent, RiskLevel
)
from db.fap import (
    get_fap_config, initialize_fap_config,
    register_command, get_registered_command,
    log_security_event, init_fap_collections
)
from services.fap_gateway import FAPCommandGateway


router = APIRouter(prefix="/api/fap", tags=["Founder Authentication Protocol"])


# ==========================================
# SYSTEM MANAGEMENT ENDPOINTS
# ==========================================

@router.post("/initialize", include_in_schema=False)
async def initialize_fap_system(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Initialize FAP system (collections + config)
    
    FOUNDER ONLY - One-time setup
    """
    # TODO: Add founder-only check when FAP is active
    
    try:
        # Initialize collections
        await init_fap_collections(db)
        
        # Initialize 21-layer config
        layers_created = await initialize_fap_config(db)
        
        # Log initialization
        await log_security_event(
            db,
            event_type="fap_system_initialized",
            severity="info",
            details=f"FAP system initialized with {layers_created} layers",
            founder_user_id=current_user.get("id"),
            metadata={"layers_created": layers_created}
        )
        
        return {
            "success": True,
            "message": "FAP system initialized",
            "layers_created": layers_created
        }
    
    except Exception as e:
        await log_security_event(
            db,
            event_type="fap_initialization_failed",
            severity="critical",
            details=f"FAP initialization failed: {str(e)}",
            founder_user_id=current_user.get("id")
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config", response_model=List[FAPConfig])
async def get_system_config(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get FAP layer configuration
    
    FOUNDER ONLY
    """
    # TODO: Add founder-only check when FAP is active
    
    config = await get_fap_config(db)
    
    return [FAPConfig(**layer) for layer in config]


@router.get("/health", response_model=FAPHealthCheck)
async def get_system_health(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get FAP system health status
    
    FOUNDER ONLY
    """
    # TODO: Add founder-only check when FAP is active
    
    config = await get_fap_config(db)
    
    active_layers = sum(1 for layer in config if layer.get("enabled", False))
    stub_layers = sum(1 for layer in config if layer.get("is_stub", True))
    
    # Determine system status
    if active_layers >= 10:
        status = "operational"
    elif active_layers >= 5:
        status = "degraded"
    else:
        status = "offline"
    
    return FAPHealthCheck(
        active_layers=active_layers,
        stub_layers=stub_layers,
        system_status=status,
        last_check=datetime.utcnow(),
        layer_status=[
            {
                "layer": layer["layer_number"],
                "name": layer["layer_name"],
                "enabled": layer.get("enabled", False),
                "status": layer.get("implementation_status", "stub")
            }
            for layer in config
        ]
    )


# ==========================================
# COMMAND REGISTRATION ENDPOINTS
# ==========================================

@router.post("/commands/register")
async def register_protected_command(
    command_name: str,
    command_category: str,
    risk_level: RiskLevel,
    description: str,
    required_layers: Optional[List[int]] = None,
    requires_time_delay: bool = False,
    delay_hours: int = 0,
    requires_multi_step: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Register a command for FAP protection
    
    FOUNDER ONLY or SYSTEM
    """
    # TODO: Add founder-only check when FAP is active
    
    command = RegisteredCommand(
        id=str(uuid4()),
        command_name=command_name,
        command_category=command_category,
        risk_level=risk_level,
        description=description,
        required_layers=required_layers or [],
        requires_time_delay=requires_time_delay,
        delay_hours=delay_hours,
        requires_multi_step=requires_multi_step,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    command_id = await register_command(db, command)
    
    await log_security_event(
        db,
        event_type="command_registered",
        severity="info",
        details=f"Command registered: {command_name} (risk: {risk_level.value})",
        founder_user_id=current_user.get("id"),
        command_name=command_name,
        metadata={"risk_level": risk_level.value}
    )
    
    return {
        "success": True,
        "command_id": command_id,
        "command_name": command_name
    }


@router.get("/commands/{command_name}")
async def get_command_info(
    command_name: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get information about a registered command
    
    FOUNDER ONLY
    """
    # TODO: Add founder-only check when FAP is active
    
    command = await get_registered_command(db, command_name)
    
    if not command:
        raise HTTPException(status_code=404, detail="Command not registered with FAP")
    
    return command


# ==========================================
# COMMAND AUTHORIZATION ENDPOINT
# ==========================================

@router.post("/authorize", response_model=CommandAuthorizationResult)
async def authorize_command(
    request: CommandAuthorizationRequest,
    device_fingerprint: Optional[str] = Header(None),
    x_forwarded_for: Optional[str] = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Authorize a command through FAP gateway
    
    This is the main entry point for all FAP-protected commands.
    """
    # TODO: Add founder verification when FAP is active
    
    # Build context
    context = {
        "device_fingerprint": device_fingerprint,
        "ip_address": x_forwarded_for or "unknown",
        "session": {
            "user_id": current_user.get("id"),
            "last_activity": datetime.utcnow()
        },
        "request_context": request.context
    }
    
    # Initialize gateway
    gateway = FAPCommandGateway(db)
    await gateway.initialize()
    
    # Authorize command
    result = await gateway.authorize_command(request, context)
    
    return result


# ==========================================
# MONITORING ENDPOINTS
# ==========================================

@router.get("/events")
async def get_security_events(
    limit: int = 50,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get security event log
    
    FOUNDER ONLY
    """
    # TODO: Add founder-only check when FAP is active
    
    collection = db["security_events"]
    
    query = {}
    if severity:
        query["severity"] = severity
    if event_type:
        query["event_type"] = event_type
    
    cursor = collection.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
    events = await cursor.to_list(length=limit)
    
    return events


@router.get("/authorizations")
async def get_authorization_history(
    limit: int = 50,
    command_name: Optional[str] = None,
    decision: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get command authorization history
    
    FOUNDER ONLY
    """
    # TODO: Add founder-only check when FAP is active
    
    collection = db["command_authorizations"]
    
    query = {}
    if command_name:
        query["command_name"] = command_name
    if decision:
        query["decision"] = decision
    
    cursor = collection.find(query, {"_id": 0}).sort("evaluated_at", -1).limit(limit)
    authorizations = await cursor.to_list(length=limit)
    
    return authorizations
