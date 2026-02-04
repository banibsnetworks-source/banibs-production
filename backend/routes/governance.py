"""
BANIBS Meta-Governance v1 - Structural Visibility Layer
Founder-only dashboard for system structure observability

GOVERNING RULE (LOCKED):
- Meta-Governance may: Observe, Flag, Suggest
- Meta-Governance may NOT: Decide, Enforce, Punish, Override Circle sovereignty

EXPLICITLY FORBIDDEN:
- Read or analyze content
- Rank circles or users
- Score trust, sentiment, or behavior
- Auto-apply rules or templates
- Moderate speech
- Auto-close or auto-lock circles
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from enum import Enum

from db.connection import get_db_client
from middleware.auth_guard import get_current_user as get_current_user_dependency


router = APIRouter(prefix="/api/governance", tags=["Meta-Governance - Structural Visibility"])


# ==================== MODELS ====================

class GovernanceVisibility(str, Enum):
    """Visibility modes for governance observation"""
    PUBLIC = "public"
    PRIVATE = "private"  # request_to_join or invite_only
    SEALED = "sealed"    # No external visibility
    FOUNDER_ONLY = "founder_only"


class GovernanceTemplate(str, Enum):
    """Optional governance templates (suggestions only)"""
    INSTITUTIONAL = "institutional"
    SUPPORT_CARE = "support_care"
    COMMUNITY_OPEN = "community_open"
    FOUNDER_EXPERIMENTAL = "founder_experimental"


class CircleGovernanceStatus(str, Enum):
    """Circle status from governance perspective"""
    ACTIVE = "active"
    DORMANT = "dormant"       # No activity beyond threshold
    ORPHANED = "orphaned"     # No admin


class AttentionSignal(BaseModel):
    """Informational flag - no enforcement"""
    signal_type: str
    circle_id: str
    circle_name: str
    message: str
    severity: str  # info, warning
    observed_at: datetime


class CircleGovernanceView(BaseModel):
    """Circle view for governance dashboard - structural only"""
    id: str
    name: str
    slug: str
    circle_type: str
    visibility: str  # Mapped from privacy_level
    member_count: int
    admin_count: int
    moderator_count: int
    has_rules: bool
    entry_control: str  # open, invite, approval
    status: str  # active, dormant, orphaned
    template: Optional[str] = None
    created_at: datetime
    last_activity_at: Optional[datetime] = None


class GovernanceOverview(BaseModel):
    """System overview - counts only"""
    total_circles: int
    circles_by_type: dict
    circles_by_visibility: dict
    orphaned_count: int
    dormant_count: int
    large_without_governance: int


class GovernanceTemplateInfo(BaseModel):
    """Template guidance (opt-in only)"""
    template_id: str
    name: str
    description: str
    suggested_config: dict


# ==================== TEMPLATE DEFINITIONS ====================

GOVERNANCE_TEMPLATES = {
    "institutional": GovernanceTemplateInfo(
        template_id="institutional",
        name="Institutional Circle",
        description="For formal organizations, chapters, or official groups",
        suggested_config={
            "min_admins": 2,
            "visibility": "private",
            "entry_control": "approval",
            "rules_required": True
        }
    ),
    "support_care": GovernanceTemplateInfo(
        template_id="support_care",
        name="Support / Care Circle",
        description="For support groups and care communities",
        suggested_config={
            "min_admins": 1,
            "visibility": "sealed",
            "entry_control": "approval",
            "rules_required": True,
            "safety_notes_required": True
        }
    ),
    "community_open": GovernanceTemplateInfo(
        template_id="community_open",
        name="Community / Open Circle",
        description="For open community discussions and networking",
        suggested_config={
            "min_admins": 1,
            "visibility": "public",
            "entry_control": "open",
            "rules_required": False,
            "moderators_suggested_at_size": 50
        }
    ),
    "founder_experimental": GovernanceTemplateInfo(
        template_id="founder_experimental",
        name="Founder / Experimental Circle",
        description="For founder-only testing and experimental features",
        suggested_config={
            "min_admins": 1,
            "visibility": "founder_only",
            "entry_control": "invite",
            "rules_required": False
        }
    )
}

# ==================== CONSTANTS ====================

DORMANT_THRESHOLD_DAYS = 90
LARGE_CIRCLE_THRESHOLD = 100


# ==================== HELPER FUNCTIONS ====================

def map_privacy_to_visibility(privacy_level: str) -> str:
    """Map privacy_level to governance visibility mode"""
    mapping = {
        "public": "public",
        "request_to_join": "private",
        "invite_only": "sealed"
    }
    return mapping.get(privacy_level, "private")


def map_privacy_to_entry_control(privacy_level: str) -> str:
    """Map privacy_level to entry control"""
    mapping = {
        "public": "open",
        "request_to_join": "approval",
        "invite_only": "invite"
    }
    return mapping.get(privacy_level, "approval")


def determine_circle_status(circle: dict, admin_count: int) -> str:
    """Determine governance status - structural observation only"""
    if admin_count == 0:
        return "orphaned"
    
    last_activity = circle.get("last_activity_at")
    if last_activity:
        if isinstance(last_activity, str):
            last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
        threshold = datetime.now(timezone.utc) - timedelta(days=DORMANT_THRESHOLD_DAYS)
        if last_activity < threshold:
            return "dormant"
    
    return "active"


# ==================== API ENDPOINTS ====================

@router.get("/overview")
async def get_governance_overview(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Get system overview - counts only.
    Founder/super_admin access required.
    """
    # Access control
    user_role = current_user.get("role") or ""
    user_roles = current_user.get("roles", [])
    is_founder = user_role == "super_admin" or "super_admin" in user_roles
    
    if not is_founder:
        raise HTTPException(status_code=403, detail="Founder access required")
    
    db = get_db_client()
    
    # Get all circles
    circles = await db.circles.find({"is_active": True}).to_list(length=1000)
    
    # Get member counts with admin roles
    circle_ids = [c["id"] for c in circles]
    
    # Aggregate admin/moderator counts per circle
    admin_counts = {}
    moderator_counts = {}
    
    async for member in db.circle_members.find({
        "circle_id": {"$in": circle_ids},
        "status": "active",
        "role": {"$in": ["admin", "moderator"]}
    }):
        cid = member["circle_id"]
        if member["role"] == "admin":
            admin_counts[cid] = admin_counts.get(cid, 0) + 1
        elif member["role"] == "moderator":
            moderator_counts[cid] = moderator_counts.get(cid, 0) + 1
    
    # Calculate counts
    total_circles = len(circles)
    
    by_type = {}
    by_visibility = {}
    orphaned = 0
    dormant = 0
    large_without_gov = 0
    
    for c in circles:
        # By type
        ctype = c.get("circle_type", "community")
        by_type[ctype] = by_type.get(ctype, 0) + 1
        
        # By visibility
        visibility = map_privacy_to_visibility(c.get("privacy_level", "request_to_join"))
        by_visibility[visibility] = by_visibility.get(visibility, 0) + 1
        
        # Check status
        cid = c["id"]
        admin_count = admin_counts.get(cid, 0)
        
        # For seeded circles without members, count system as admin
        if c.get("created_by_user_id") == "system" and admin_count == 0:
            admin_count = 1  # System-created circles are not orphaned
        
        status = determine_circle_status(c, admin_count)
        
        if status == "orphaned":
            orphaned += 1
        elif status == "dormant":
            dormant += 1
        
        # Large without governance
        member_count = c.get("member_count", 0)
        if member_count >= LARGE_CIRCLE_THRESHOLD and admin_count < 2:
            large_without_gov += 1
    
    return {
        "total_circles": total_circles,
        "circles_by_type": by_type,
        "circles_by_visibility": by_visibility,
        "orphaned_count": orphaned,
        "dormant_count": dormant,
        "large_without_governance": large_without_gov
    }


@router.get("/signals")
async def get_attention_signals(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Get attention signals - informational flags only.
    No enforcement, no actions. Just observations.
    """
    # Access control
    user_role = current_user.get("role") or ""
    user_roles = current_user.get("roles", [])
    is_founder = user_role == "super_admin" or "super_admin" in user_roles
    
    if not is_founder:
        raise HTTPException(status_code=403, detail="Founder access required")
    
    db = get_db_client()
    signals = []
    now = datetime.now(timezone.utc)
    
    # Get all circles
    circles = await db.circles.find({"is_active": True}).to_list(length=1000)
    circle_ids = [c["id"] for c in circles]
    
    # Get admin counts
    admin_counts = {}
    async for member in db.circle_members.find({
        "circle_id": {"$in": circle_ids},
        "status": "active",
        "role": "admin"
    }):
        cid = member["circle_id"]
        admin_counts[cid] = admin_counts.get(cid, 0) + 1
    
    for c in circles:
        cid = c["id"]
        cname = c.get("name", cid)
        admin_count = admin_counts.get(cid, 0)
        
        # System-created circles are not orphaned
        if c.get("created_by_user_id") == "system" and admin_count == 0:
            admin_count = 1
        
        # Signal: Orphaned circle
        if admin_count == 0:
            signals.append({
                "signal_type": "orphaned",
                "circle_id": cid,
                "circle_name": cname,
                "message": f"Circle '{cname}' has no admin",
                "severity": "warning",
                "observed_at": now.isoformat()
            })
        
        # Signal: Dormant circle
        last_activity = c.get("last_activity_at")
        if last_activity:
            if isinstance(last_activity, str):
                last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
            threshold = now - timedelta(days=DORMANT_THRESHOLD_DAYS)
            if last_activity < threshold:
                days_inactive = (now - last_activity).days
                signals.append({
                    "signal_type": "dormant",
                    "circle_id": cid,
                    "circle_name": cname,
                    "message": f"Circle '{cname}' inactive for {days_inactive} days",
                    "severity": "info",
                    "observed_at": now.isoformat()
                })
        
        # Signal: Large circle without governance
        member_count = c.get("member_count", 0)
        if member_count >= LARGE_CIRCLE_THRESHOLD and admin_count < 2:
            signals.append({
                "signal_type": "large_without_governance",
                "circle_id": cid,
                "circle_name": cname,
                "message": f"Circle '{cname}' has {member_count} members but only {admin_count} admin(s)",
                "severity": "info",
                "observed_at": now.isoformat()
            })
        
        # Signal: Missing basic configuration
        has_rules = bool(c.get("rules") and len(c.get("rules", [])) > 0)
        if not has_rules and c.get("circle_type") in ["support", "institutional"]:
            signals.append({
                "signal_type": "missing_config",
                "circle_id": cid,
                "circle_name": cname,
                "message": f"Circle '{cname}' ({c.get('circle_type')}) has no rules defined",
                "severity": "info",
                "observed_at": now.isoformat()
            })
    
    return {
        "signals": signals,
        "count": len(signals),
        "observed_at": now.isoformat()
    }


@router.get("/circles")
async def get_circles_inventory(
    sort_by: str = "type",
    circle_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Get circle inventory table - structural view only.
    No content inspection.
    """
    # Access control
    user_role = current_user.get("role") or ""
    user_roles = current_user.get("roles", [])
    is_founder = user_role == "super_admin" or "super_admin" in user_roles
    
    if not is_founder:
        raise HTTPException(status_code=403, detail="Founder access required")
    
    db = get_db_client()
    
    # Build query
    query = {"is_active": True}
    if circle_type:
        query["circle_type"] = circle_type
    
    circles = await db.circles.find(query).to_list(length=500)
    circle_ids = [c["id"] for c in circles]
    
    # Get role counts
    admin_counts = {}
    moderator_counts = {}
    
    async for member in db.circle_members.find({
        "circle_id": {"$in": circle_ids},
        "status": "active",
        "role": {"$in": ["admin", "moderator"]}
    }):
        cid = member["circle_id"]
        if member["role"] == "admin":
            admin_counts[cid] = admin_counts.get(cid, 0) + 1
        elif member["role"] == "moderator":
            moderator_counts[cid] = moderator_counts.get(cid, 0) + 1
    
    # Build inventory
    inventory = []
    
    for c in circles:
        cid = c["id"]
        admin_count = admin_counts.get(cid, 0)
        mod_count = moderator_counts.get(cid, 0)
        
        # System-created circles are not orphaned
        if c.get("created_by_user_id") == "system" and admin_count == 0:
            admin_count = 1
        
        circle_status = determine_circle_status(c, admin_count)
        
        # Filter by status if specified
        if status and circle_status != status:
            continue
        
        inventory.append({
            "id": cid,
            "name": c.get("name", ""),
            "slug": c.get("slug", ""),
            "circle_type": c.get("circle_type", "community"),
            "visibility": map_privacy_to_visibility(c.get("privacy_level", "request_to_join")),
            "member_count": c.get("member_count", 0),
            "admin_count": admin_count,
            "moderator_count": mod_count,
            "has_rules": bool(c.get("rules") and len(c.get("rules", [])) > 0),
            "entry_control": map_privacy_to_entry_control(c.get("privacy_level", "request_to_join")),
            "status": circle_status,
            "template": None,  # v1: no template assignment yet
            "created_at": c.get("created_at").isoformat() if c.get("created_at") else None,
            "last_activity_at": c.get("last_activity_at").isoformat() if c.get("last_activity_at") else None
        })
    
    # Sort
    if sort_by == "type":
        inventory.sort(key=lambda x: x["circle_type"])
    elif sort_by == "size":
        inventory.sort(key=lambda x: x["member_count"], reverse=True)
    elif sort_by == "status":
        status_order = {"orphaned": 0, "dormant": 1, "active": 2}
        inventory.sort(key=lambda x: status_order.get(x["status"], 2))
    
    return {
        "circles": inventory,
        "count": len(inventory)
    }


@router.get("/templates")
async def get_governance_templates(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Get available governance templates - opt-in guidance only.
    Templates may be: Suggested, Accepted, or Ignored.
    No enforcement.
    """
    # Access control
    user_role = current_user.get("role") or ""
    user_roles = current_user.get("roles", [])
    is_founder = user_role == "super_admin" or "super_admin" in user_roles
    
    if not is_founder:
        raise HTTPException(status_code=403, detail="Founder access required")
    
    templates = []
    for tid, tmpl in GOVERNANCE_TEMPLATES.items():
        templates.append({
            "template_id": tmpl.template_id,
            "name": tmpl.name,
            "description": tmpl.description,
            "suggested_config": tmpl.suggested_config
        })
    
    return {
        "templates": templates,
        "count": len(templates),
        "note": "Templates are opt-in suggestions only. No enforcement."
    }
