"""
HDOS v2 - Circle Trust Order API Routes
7-Level Trust System

Endpoints:
- /api/hdos/trust/levels - Trust levels (read-only after seed)
- /api/hdos/trust/policies - Trust policies (CRUD)
- /api/hdos/trust/assignments - Subject trust assignments (CRUD)

Access: super_admin only (Builder Mode)
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from db.connection import get_db
from models.hdos_trust import (
    TrustLevel, TrustLevelKey, TRUST_LEVEL_ORDER, SEED_TRUST_LEVELS,
    TrustPolicyCreate, TrustPolicyUpdate, TrustPolicy,
    TrustAssignmentCreate, TrustAssignmentUpdate, TrustAssignment,
    SubjectType
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/hdos/trust", tags=["HDOS Trust Order"])


# =====================
# RESPONSE HELPERS
# =====================

def success_response(data):
    """Wrap successful response"""
    return {"success": True, "data": data, "error": None}


def error_response(code: str, message: str, details=None, status_code: int = 400):
    """Raise HTTP exception with error envelope"""
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "data": None, "error": {"code": code, "message": message, "details": details}}
    )


def require_super_admin(user: dict):
    """Verify user has super_admin role"""
    if not user:
        error_response("UNAUTHORIZED", "Authentication required", status_code=401)
    
    is_super_admin = (
        user.get("role") == "super_admin" or
        "super_admin" in user.get("roles", [])
    )
    
    if not is_super_admin:
        error_response("FORBIDDEN", "Super admin access required", status_code=403)
    
    return user


# =====================
# TRUST LEVELS ENDPOINTS
# =====================

@router.get("/levels")
async def get_trust_levels(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all trust levels in canonical order (super_admin only)"""
    require_super_admin(current_user)
    
    # Ensure levels are seeded
    await seed_trust_levels(db)
    
    cursor = db.hdos_trust_levels.find({"is_active": True}, {"_id": 0}).sort("order", 1)
    levels = await cursor.to_list(length=10)
    
    return success_response(levels)


@router.get("/levels/{level_key}")
async def get_trust_level(
    level_key: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get single trust level (super_admin only)"""
    require_super_admin(current_user)
    
    level = await db.hdos_trust_levels.find_one({"key": level_key.upper()}, {"_id": 0})
    if not level:
        error_response("NOT_FOUND", "Trust level not found", status_code=404)
    
    return success_response(level)


async def seed_trust_levels(db: AsyncIOMotorDatabase):
    """Seed trust levels if not already present"""
    count = await db.hdos_trust_levels.count_documents({})
    if count >= 7:
        return  # Already seeded
    
    now = datetime.now(timezone.utc)
    
    for level_data in SEED_TRUST_LEVELS:
        existing = await db.hdos_trust_levels.find_one({"key": level_data["key"]})
        if not existing:
            level = {
                "id": str(uuid.uuid4()),
                "key": level_data["key"],
                "order": level_data["order"],
                "name": level_data["name"],
                "description": level_data["description"],
                "color": level_data["color"],
                "icon": level_data.get("icon"),
                "is_active": True,
                "audit": {
                    "created_at": now,
                    "updated_at": now
                }
            }
            await db.hdos_trust_levels.insert_one(level)


@router.post("/levels/seed")
async def seed_levels_endpoint(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Manually trigger trust levels seeding (super_admin only)"""
    require_super_admin(current_user)
    
    await seed_trust_levels(db)
    
    cursor = db.hdos_trust_levels.find({}, {"_id": 0}).sort("order", 1)
    levels = await cursor.to_list(length=10)
    
    return success_response({"seeded": True, "levels": levels})


# =====================
# TRUST POLICIES ENDPOINTS
# =====================

@router.get("/policies")
async def get_trust_policies(
    level_key: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get trust policies (super_admin only)"""
    require_super_admin(current_user)
    
    query = {}
    if level_key:
        query["level_key"] = level_key.upper()
    
    cursor = db.hdos_trust_policies.find(query, {"_id": 0}).sort("level_order", 1)
    policies = await cursor.to_list(length=20)
    
    return success_response(policies)


@router.get("/policies/{policy_id}")
async def get_trust_policy(
    policy_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get single trust policy (super_admin only)"""
    require_super_admin(current_user)
    
    policy = await db.hdos_trust_policies.find_one({"id": policy_id}, {"_id": 0})
    if not policy:
        error_response("NOT_FOUND", "Trust policy not found", status_code=404)
    
    return success_response(policy)


@router.post("/policies", status_code=201)
async def create_trust_policy(
    policy: TrustPolicyCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create trust policy for a level (super_admin only)"""
    require_super_admin(current_user)
    
    # Validate level exists
    level_key = policy.level_key.upper()
    level = await db.hdos_trust_levels.find_one({"key": level_key})
    if not level:
        error_response("INVALID_LEVEL", f"Trust level '{level_key}' not found", status_code=400)
    
    # Check if policy already exists for this level
    existing = await db.hdos_trust_policies.find_one({"level_key": level_key})
    if existing:
        error_response("POLICY_EXISTS", f"Policy already exists for level '{level_key}'. Use PATCH to update.", status_code=409)
    
    now = datetime.now(timezone.utc)
    
    new_policy = {
        "id": str(uuid.uuid4()),
        "level_key": level_key,
        "level_order": level["order"],
        "allowed_modules": policy.allowed_modules,
        "detector_thresholds": [
            {
                "detector_type": dt.detector_type,
                "max_severity": dt.max_severity,
                "action_on_exceed": dt.action_on_exceed
            }
            for dt in policy.detector_thresholds
        ],
        "notes": policy.notes,
        "audit": {
            "created_at": now,
            "updated_at": now
        }
    }
    
    await db.hdos_trust_policies.insert_one(new_policy)
    new_policy.pop("_id", None)
    
    return success_response(new_policy)


@router.patch("/policies/{policy_id}")
async def update_trust_policy(
    policy_id: str,
    update: TrustPolicyUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update trust policy (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.hdos_trust_policies.find_one({"id": policy_id})
    if not existing:
        error_response("NOT_FOUND", "Trust policy not found", status_code=404)
    
    update_dict = {"audit.updated_at": datetime.now(timezone.utc)}
    
    if update.allowed_modules is not None:
        update_dict["allowed_modules"] = update.allowed_modules
    if update.detector_thresholds is not None:
        update_dict["detector_thresholds"] = [
            {
                "detector_type": dt.detector_type,
                "max_severity": dt.max_severity,
                "action_on_exceed": dt.action_on_exceed
            }
            for dt in update.detector_thresholds
        ]
    if update.notes is not None:
        update_dict["notes"] = update.notes
    
    await db.hdos_trust_policies.update_one({"id": policy_id}, {"$set": update_dict})
    
    updated = await db.hdos_trust_policies.find_one({"id": policy_id}, {"_id": 0})
    return success_response(updated)


@router.patch("/policies/by-level/{level_key}")
async def update_trust_policy_by_level(
    level_key: str,
    update: TrustPolicyUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update trust policy by level key - creates if not exists (super_admin only)"""
    require_super_admin(current_user)
    
    level_key = level_key.upper()
    
    # Validate level exists
    level = await db.hdos_trust_levels.find_one({"key": level_key})
    if not level:
        error_response("INVALID_LEVEL", f"Trust level '{level_key}' not found", status_code=400)
    
    existing = await db.hdos_trust_policies.find_one({"level_key": level_key})
    now = datetime.now(timezone.utc)
    
    if existing:
        # Update existing
        update_dict = {"audit.updated_at": now}
        
        if update.allowed_modules is not None:
            update_dict["allowed_modules"] = update.allowed_modules
        if update.detector_thresholds is not None:
            update_dict["detector_thresholds"] = [
                {
                    "detector_type": dt.detector_type,
                    "max_severity": dt.max_severity,
                    "action_on_exceed": dt.action_on_exceed
                }
                for dt in update.detector_thresholds
            ]
        if update.notes is not None:
            update_dict["notes"] = update.notes
        
        await db.hdos_trust_policies.update_one({"level_key": level_key}, {"$set": update_dict})
    else:
        # Create new
        new_policy = {
            "id": str(uuid.uuid4()),
            "level_key": level_key,
            "level_order": level["order"],
            "allowed_modules": update.allowed_modules or [],
            "detector_thresholds": [
                {
                    "detector_type": dt.detector_type,
                    "max_severity": dt.max_severity,
                    "action_on_exceed": dt.action_on_exceed
                }
                for dt in (update.detector_thresholds or [])
            ],
            "notes": update.notes or "",
            "audit": {
                "created_at": now,
                "updated_at": now
            }
        }
        await db.hdos_trust_policies.insert_one(new_policy)
    
    updated = await db.hdos_trust_policies.find_one({"level_key": level_key}, {"_id": 0})
    return success_response(updated)


@router.delete("/policies/{policy_id}")
async def delete_trust_policy(
    policy_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete trust policy (super_admin only)"""
    require_super_admin(current_user)
    
    result = await db.hdos_trust_policies.delete_one({"id": policy_id})
    
    if result.deleted_count == 0:
        error_response("NOT_FOUND", "Trust policy not found", status_code=404)
    
    return success_response({"deleted": True, "id": policy_id})


# =====================
# TRUST ASSIGNMENTS ENDPOINTS
# =====================

@router.get("/assignments")
async def get_trust_assignments(
    level_key: Optional[str] = None,
    subject_type: Optional[str] = None,
    is_active: bool = True,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get trust assignments (super_admin only)"""
    require_super_admin(current_user)
    
    query = {"is_active": is_active}
    if level_key:
        query["level_key"] = level_key.upper()
    if subject_type:
        query["subject_type"] = subject_type.upper()
    
    cursor = db.hdos_subject_trust.find(query, {"_id": 0}).sort("level_order", 1).skip(offset).limit(limit)
    assignments = await cursor.to_list(length=limit)
    
    return success_response(assignments)


@router.get("/assignments/{assignment_id}")
async def get_trust_assignment(
    assignment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get single trust assignment (super_admin only)"""
    require_super_admin(current_user)
    
    assignment = await db.hdos_subject_trust.find_one({"id": assignment_id}, {"_id": 0})
    if not assignment:
        error_response("NOT_FOUND", "Trust assignment not found", status_code=404)
    
    return success_response(assignment)


@router.get("/assignments/lookup/{subject_id}")
async def lookup_trust_assignment(
    subject_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lookup trust assignment by subject ID (super_admin only)"""
    require_super_admin(current_user)
    
    assignment = await db.hdos_subject_trust.find_one(
        {"subject_id": subject_id, "is_active": True},
        {"_id": 0}
    )
    
    if not assignment:
        # Return default level (OTHERS)
        level = await db.hdos_trust_levels.find_one({"key": "OTHERS"}, {"_id": 0})
        return success_response({
            "found": False,
            "default_level": level
        })
    
    return success_response({"found": True, "assignment": assignment})


@router.post("/assignments", status_code=201)
async def create_trust_assignment(
    assignment: TrustAssignmentCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create trust assignment (super_admin only)"""
    require_super_admin(current_user)
    
    # Validate level exists
    level_key = assignment.level_key.upper()
    level = await db.hdos_trust_levels.find_one({"key": level_key})
    if not level:
        error_response("INVALID_LEVEL", f"Trust level '{level_key}' not found", status_code=400)
    
    # Check if assignment already exists for this subject
    existing = await db.hdos_subject_trust.find_one({
        "subject_id": assignment.subject_id,
        "subject_type": assignment.subject_type.value,
        "is_active": True
    })
    if existing:
        error_response("ASSIGNMENT_EXISTS", f"Active assignment already exists for this subject. Use PATCH to update.", status_code=409)
    
    now = datetime.now(timezone.utc)
    
    new_assignment = {
        "id": str(uuid.uuid4()),
        "subject_type": assignment.subject_type.value,
        "subject_id": assignment.subject_id,
        "subject_label": assignment.subject_label,
        "level_key": level_key,
        "level_order": level["order"],
        "level_name": level["name"],
        "reason": assignment.reason,
        "expires_at": assignment.expires_at,
        "assigned_by": assignment.assigned_by or current_user.get("email"),
        "is_active": True,
        "audit": {
            "created_at": now,
            "updated_at": now
        }
    }
    
    await db.hdos_subject_trust.insert_one(new_assignment)
    new_assignment.pop("_id", None)
    
    return success_response(new_assignment)


@router.patch("/assignments/{assignment_id}")
async def update_trust_assignment(
    assignment_id: str,
    update: TrustAssignmentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update trust assignment (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.hdos_subject_trust.find_one({"id": assignment_id})
    if not existing:
        error_response("NOT_FOUND", "Trust assignment not found", status_code=404)
    
    update_dict = {"audit.updated_at": datetime.now(timezone.utc)}
    
    if update.level_key is not None:
        level_key = update.level_key.upper()
        level = await db.hdos_trust_levels.find_one({"key": level_key})
        if not level:
            error_response("INVALID_LEVEL", f"Trust level '{level_key}' not found", status_code=400)
        update_dict["level_key"] = level_key
        update_dict["level_order"] = level["order"]
        update_dict["level_name"] = level["name"]
    
    if update.subject_label is not None:
        update_dict["subject_label"] = update.subject_label
    if update.reason is not None:
        update_dict["reason"] = update.reason
    if update.expires_at is not None:
        update_dict["expires_at"] = update.expires_at
    
    await db.hdos_subject_trust.update_one({"id": assignment_id}, {"$set": update_dict})
    
    updated = await db.hdos_subject_trust.find_one({"id": assignment_id}, {"_id": 0})
    return success_response(updated)


@router.post("/assignments/bulk")
async def bulk_update_assignments(
    updates: List[dict],
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Bulk update trust assignments (super_admin only)
    
    Each update should have: subject_id, level_key
    Optional: subject_type (default: EMAIL), subject_label, reason
    """
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    results = []
    
    for update in updates:
        subject_id = update.get("subject_id")
        level_key = update.get("level_key", "").upper()
        subject_type = update.get("subject_type", "EMAIL").upper()
        
        if not subject_id or not level_key:
            results.append({"subject_id": subject_id, "success": False, "error": "Missing subject_id or level_key"})
            continue
        
        # Validate level
        level = await db.hdos_trust_levels.find_one({"key": level_key})
        if not level:
            results.append({"subject_id": subject_id, "success": False, "error": f"Invalid level: {level_key}"})
            continue
        
        # Upsert assignment
        existing = await db.hdos_subject_trust.find_one({
            "subject_id": subject_id,
            "subject_type": subject_type,
            "is_active": True
        })
        
        if existing:
            # Update
            await db.hdos_subject_trust.update_one(
                {"id": existing["id"]},
                {"$set": {
                    "level_key": level_key,
                    "level_order": level["order"],
                    "level_name": level["name"],
                    "reason": update.get("reason", existing.get("reason", "")),
                    "audit.updated_at": now
                }}
            )
            results.append({"subject_id": subject_id, "success": True, "action": "updated"})
        else:
            # Create
            new_assignment = {
                "id": str(uuid.uuid4()),
                "subject_type": subject_type,
                "subject_id": subject_id,
                "subject_label": update.get("subject_label"),
                "level_key": level_key,
                "level_order": level["order"],
                "level_name": level["name"],
                "reason": update.get("reason", ""),
                "expires_at": None,
                "assigned_by": current_user.get("email"),
                "is_active": True,
                "audit": {
                    "created_at": now,
                    "updated_at": now
                }
            }
            await db.hdos_subject_trust.insert_one(new_assignment)
            results.append({"subject_id": subject_id, "success": True, "action": "created"})
    
    return success_response({"processed": len(results), "results": results})


@router.delete("/assignments/{assignment_id}")
async def delete_trust_assignment(
    assignment_id: str,
    hard_delete: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete trust assignment (super_admin only)
    
    By default, soft-deletes (sets is_active=False).
    Pass hard_delete=true to permanently remove.
    """
    require_super_admin(current_user)
    
    existing = await db.hdos_subject_trust.find_one({"id": assignment_id})
    if not existing:
        error_response("NOT_FOUND", "Trust assignment not found", status_code=404)
    
    if hard_delete:
        await db.hdos_subject_trust.delete_one({"id": assignment_id})
    else:
        await db.hdos_subject_trust.update_one(
            {"id": assignment_id},
            {"$set": {"is_active": False, "audit.updated_at": datetime.now(timezone.utc)}}
        )
    
    return success_response({"deleted": True, "id": assignment_id, "hard_delete": hard_delete})


# =====================
# TRUST LOOKUP (PUBLIC-FACING HELPER)
# =====================

@router.get("/check/{subject_id}")
async def check_trust_level(
    subject_id: str,
    subject_type: str = "EMAIL",
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Check effective trust level for a subject (super_admin only)
    
    Returns the trust level and applicable policy.
    """
    require_super_admin(current_user)
    
    # Look up assignment
    assignment = await db.hdos_subject_trust.find_one({
        "subject_id": subject_id,
        "subject_type": subject_type.upper(),
        "is_active": True
    }, {"_id": 0})
    
    if assignment:
        level_key = assignment["level_key"]
    else:
        level_key = "OTHERS"  # Default level
    
    # Get level details
    level = await db.hdos_trust_levels.find_one({"key": level_key}, {"_id": 0})
    
    # Get policy for this level
    policy = await db.hdos_trust_policies.find_one({"level_key": level_key}, {"_id": 0})
    
    return success_response({
        "subject_id": subject_id,
        "subject_type": subject_type.upper(),
        "has_assignment": assignment is not None,
        "assignment": assignment,
        "level": level,
        "policy": policy
    })
