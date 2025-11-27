"""
BANIBS Founder Authentication Protocol (FAP) Database Layer
Phase X - 21-Layer Security Foundation

Database operations for FAP authentication, logging, and command authorization.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from uuid import uuid4

from schemas.fap import (
    FAPConfig, FounderAuthSession, SecurityEvent,
    CommandAuthorizationResult, RegisteredCommand,
    RiskLevel, CommandDecision, VerificationStatus
)


# Collection names
FAP_CONFIG_COLLECTION = "fap_config"
AUTH_SESSIONS_COLLECTION = "founder_auth_sessions"
SECURITY_EVENTS_COLLECTION = "security_events"
COMMAND_AUTHORIZATIONS_COLLECTION = "command_authorizations"
REGISTERED_COMMANDS_COLLECTION = "registered_commands"


async def init_fap_collections(db: AsyncIOMotorDatabase):
    """Initialize FAP database collections and indexes"""
    
    # FAP Config collection
    config_collection = db[FAP_CONFIG_COLLECTION]
    await config_collection.create_index("layer_number", unique=True)
    await config_collection.create_index("enabled")
    
    # Auth sessions collection
    sessions_collection = db[AUTH_SESSIONS_COLLECTION]
    await sessions_collection.create_index("founder_user_id")
    await sessions_collection.create_index("session_token", unique=True)
    await sessions_collection.create_index("expires_at")
    await sessions_collection.create_index("is_active")
    
    # Security events collection
    events_collection = db[SECURITY_EVENTS_COLLECTION]
    await events_collection.create_index([("timestamp", -1)])
    await events_collection.create_index("event_type")
    await events_collection.create_index("severity")
    await events_collection.create_index("founder_user_id")
    
    # Command authorizations collection
    auth_collection = db[COMMAND_AUTHORIZATIONS_COLLECTION]
    await auth_collection.create_index([("evaluated_at", -1)])
    await auth_collection.create_index("command_name")
    await auth_collection.create_index("decision")
    
    # Registered commands collection
    commands_collection = db[REGISTERED_COMMANDS_COLLECTION]
    await commands_collection.create_index("command_name", unique=True)
    await commands_collection.create_index("risk_level")
    
    return {
        "config": config_collection,
        "sessions": sessions_collection,
        "events": events_collection,
        "authorizations": auth_collection,
        "commands": commands_collection
    }


async def initialize_fap_config(db: AsyncIOMotorDatabase):
    """Initialize all 21 FAP layers in the database"""
    
    layers = [
        # TIER 1: Identity Layers (1-7)
        {
            "layer_number": 1,
            "layer_name": "Biometric Identity",
            "description": "Face ID, fingerprint, liveness detection",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 2,
            "layer_name": "Device-Bound Auth",
            "description": "TPM chip, Secure Enclave, hardware signatures",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "partial",
            "required_for_risk_levels": ["medium", "high", "sovereign"]
        },
        {
            "layer_number": 3,
            "layer_name": "Hardware Key",
            "description": "YubiKey / NFC physical token",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 4,
            "layer_name": "Linguistic Fingerprint",
            "description": "Writing cadence, pattern, rhythm, style",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 5,
            "layer_name": "Voiceprint Signature",
            "description": "Vocal tone, frequency, biometric voice pattern",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 6,
            "layer_name": "Keystroke DNA",
            "description": "Typing rhythm, pressure pattern, correction habit",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 7,
            "layer_name": "Behavioral Biometrics",
            "description": "Mouse movement, scroll pattern, reaction timing",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["medium", "high", "sovereign"]
        },
        
        # TIER 2: Context Layers (8-14)
        {
            "layer_number": 8,
            "layer_name": "Location Auth",
            "description": "Geofence, IP, device triangulation",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "complete",
            "required_for_risk_levels": ["medium", "high", "sovereign"]
        },
        {
            "layer_number": 9,
            "layer_name": "Environmental Match",
            "description": "Lighting, background noise, room pattern",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["sovereign"]
        },
        {
            "layer_number": 10,
            "layer_name": "Device History Match",
            "description": "Past login timeline & behavioral continuity",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "complete",
            "required_for_risk_levels": ["medium", "high", "sovereign"]
        },
        {
            "layer_number": 11,
            "layer_name": "Time-of-Day Signature",
            "description": "Typical timing patterns; anomaly detection",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "complete",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 12,
            "layer_name": "Cognitive Clarity Check",
            "description": "Fatigue, stress, confusion detection",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 13,
            "layer_name": "Emotional State Check",
            "description": "Anger, panic, distress pause high-risk ops",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 14,
            "layer_name": "Intent Verification",
            "description": "Does this command make sense?",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "partial",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        
        # TIER 3: Governance Layers (15-21)
        {
            "layer_number": 15,
            "layer_name": "Context Impact Check",
            "description": "Predicts downstream effects; blocks harmful chains",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "partial",
            "required_for_risk_levels": ["high", "sovereign"]
        },
        {
            "layer_number": 16,
            "layer_name": "Historical Self-Consistency",
            "description": "Compares with long-term Founder patterns",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "partial",
            "required_for_risk_levels": ["sovereign"]
        },
        {
            "layer_number": 17,
            "layer_name": "Multi-Agent Confirmation",
            "description": "Second AI validates first AI's decision",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["sovereign"]
        },
        {
            "layer_number": 18,
            "layer_name": "Safe Mode Delay",
            "description": "24-72 hour hold + reconfirmation for critical commands",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "complete",
            "required_for_risk_levels": ["sovereign"]
        },
        {
            "layer_number": 19,
            "layer_name": "Physical-World Auth",
            "description": "Physical key, HQ location, offline codes",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["sovereign"]
        },
        {
            "layer_number": 20,
            "layer_name": "Elders-Council Gate",
            "description": "For nation-scale governance actions",
            "is_stub": True,
            "enabled": False,
            "implementation_status": "stub",
            "required_for_risk_levels": ["sovereign"]
        },
        {
            "layer_number": 21,
            "layer_name": "Moral Override",
            "description": "Blocks commands violating Founder values, community safety, BANIBS integrity",
            "is_stub": False,
            "enabled": True,
            "implementation_status": "partial",
            "required_for_risk_levels": ["medium", "high", "sovereign"]
        }
    ]
    
    collection = db[FAP_CONFIG_COLLECTION]
    
    for layer_data in layers:
        layer_data["id"] = str(uuid4())
        layer_data["updated_at"] = datetime.utcnow()
        layer_data["config_data"] = {}
        
        # Upsert based on layer_number
        await collection.update_one(
            {"layer_number": layer_data["layer_number"]},
            {"$set": layer_data},
            upsert=True
        )
    
    return len(layers)


async def get_fap_config(db: AsyncIOMotorDatabase) -> List[Dict]:
    """Get all FAP layer configurations"""
    collection = db[FAP_CONFIG_COLLECTION]
    cursor = collection.find({}, {"_id": 0}).sort("layer_number", 1)
    return await cursor.to_list(length=21)


async def log_security_event(
    db: AsyncIOMotorDatabase,
    event_type: str,
    severity: str,
    details: str,
    founder_user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    command_name: Optional[str] = None,
    authorization_id: Optional[str] = None,
    decision: Optional[str] = None,
    metadata: Dict = None,
    ip_address: Optional[str] = None,
    device_fingerprint: Optional[str] = None
):
    """Log a security event"""
    collection = db[SECURITY_EVENTS_COLLECTION]
    
    event = {
        "id": str(uuid4()),
        "event_type": event_type,
        "severity": severity,
        "founder_user_id": founder_user_id,
        "session_id": session_id,
        "command_name": command_name,
        "authorization_id": authorization_id,
        "decision": decision,
        "details": details,
        "metadata": metadata or {},
        "ip_address": ip_address,
        "device_fingerprint": device_fingerprint,
        "timestamp": datetime.utcnow()
    }
    
    await collection.insert_one(event)
    return event["id"]


async def save_command_authorization(
    db: AsyncIOMotorDatabase,
    result: CommandAuthorizationResult
):
    """Save command authorization result"""
    collection = db[COMMAND_AUTHORIZATIONS_COLLECTION]
    
    doc = result.dict()
    doc["_id"] = result.authorization_id
    
    await collection.insert_one(doc)
    return result.authorization_id


async def register_command(
    db: AsyncIOMotorDatabase,
    command: RegisteredCommand
):
    """Register a command for FAP protection"""
    collection = db[REGISTERED_COMMANDS_COLLECTION]
    
    doc = command.dict()
    doc["_id"] = command.id
    
    await collection.update_one(
        {"command_name": command.command_name},
        {"$set": doc},
        upsert=True
    )
    
    return command.id


async def get_registered_command(
    db: AsyncIOMotorDatabase,
    command_name: str
) -> Optional[Dict]:
    """Get a registered command by name"""
    collection = db[REGISTERED_COMMANDS_COLLECTION]
    return await collection.find_one({"command_name": command_name}, {"_id": 0})
