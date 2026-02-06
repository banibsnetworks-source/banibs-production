"""
BANIBS System Settings Routes
Phase 17.1 - Go Live SAFE v1

This module provides system-level configuration endpoints:
- Site mode toggle (preview/live)
- Audit logging for mode changes

HARD CONSTRAINTS:
- Only super_admin can toggle site mode
- No auto-enabling of Stripe/Donations
- No exposure of founder/admin routes
- Reversible actions only
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime, timezone
from db import get_db
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/system", tags=["system"])


class SiteModeRequest(BaseModel):
    """Request model for site mode toggle"""
    mode: Literal["live", "preview"]


class SiteModeResponse(BaseModel):
    """Response model for site mode"""
    mode: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None


class AuditLogEntry(BaseModel):
    """Audit log entry for mode changes"""
    action: str
    previous_value: Optional[str]
    new_value: str
    user_id: str
    user_email: str
    timestamp: str


# Collection name for system settings
SETTINGS_COLLECTION = "banibs_settings"
AUDIT_COLLECTION = "banibs_audit_log"


@router.get("/site-mode", response_model=SiteModeResponse)
async def get_site_mode():
    """
    Get current site mode (public endpoint)
    
    Returns:
        Current site mode (live/preview) with metadata
    """
    db = await get_db()
    
    # Find the site_mode setting
    setting = await db[SETTINGS_COLLECTION].find_one(
        {"key": "site_mode"},
        {"_id": 0}
    )
    
    if not setting:
        # Default to preview mode if not set
        return SiteModeResponse(mode="preview")
    
    return SiteModeResponse(
        mode=setting.get("value", "preview"),
        updated_at=setting.get("updated_at"),
        updated_by=setting.get("updated_by")
    )


@router.post("/site-mode", response_model=SiteModeResponse)
async def set_site_mode(
    request: SiteModeRequest,
    user: dict = Depends(require_role("super_admin"))
):
    """
    Toggle site mode between live and preview
    
    SAFE v1 Implementation:
    - Only super_admin can toggle
    - No irreversible actions
    - Creates audit log entry
    
    Args:
        request: Contains the new mode (live/preview)
        user: Authenticated super_admin user
    
    Returns:
        Updated site mode with metadata
    """
    db = await get_db()
    
    # Get current mode for audit log
    current_setting = await db[SETTINGS_COLLECTION].find_one(
        {"key": "site_mode"},
        {"_id": 0}
    )
    previous_mode = current_setting.get("value") if current_setting else "preview"
    
    # Skip if mode is unchanged
    if previous_mode == request.mode:
        return SiteModeResponse(
            mode=request.mode,
            updated_at=current_setting.get("updated_at") if current_setting else None,
            updated_by=current_setting.get("updated_by") if current_setting else None
        )
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Update or create the site_mode setting
    await db[SETTINGS_COLLECTION].update_one(
        {"key": "site_mode"},
        {
            "$set": {
                "key": "site_mode",
                "value": request.mode,
                "updated_at": timestamp,
                "updated_by": user.get("email", user.get("id"))
            }
        },
        upsert=True
    )
    
    # Create audit log entry
    audit_entry = {
        "action": "site_mode_change",
        "previous_value": previous_mode,
        "new_value": request.mode,
        "user_id": user.get("id"),
        "user_email": user.get("email"),
        "timestamp": timestamp,
        "metadata": {
            "user_name": user.get("name"),
            "user_roles": user.get("roles", [])
        }
    }
    await db[AUDIT_COLLECTION].insert_one(audit_entry)
    
    return SiteModeResponse(
        mode=request.mode,
        updated_at=timestamp,
        updated_by=user.get("email", user.get("id"))
    )


@router.get("/site-mode/history")
async def get_site_mode_history(
    limit: int = 20,
    user: dict = Depends(require_role("super_admin"))
):
    """
    Get audit history of site mode changes
    
    Args:
        limit: Max number of entries to return
        user: Authenticated super_admin user
    
    Returns:
        List of audit log entries
    """
    db = await get_db()
    
    entries = await db[AUDIT_COLLECTION].find(
        {"action": "site_mode_change"},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    return {
        "entries": entries,
        "total": len(entries)
    }
