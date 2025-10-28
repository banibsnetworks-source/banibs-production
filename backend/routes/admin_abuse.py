from fastapi import APIRouter, Depends, HTTPException
from typing import List

from db.banned_sources import (
    ban_ip_hash,
    get_all_banned_sources,
    unban_ip_hash
)
from models.banned_source import BanSourceRequest, BannedSourcePublic
from middleware.auth_guard import require_super_admin

router = APIRouter(prefix="/api/admin", tags=["admin-abuse-control"])

# Phase 5.3 - Admin Abuse Control Endpoints

@router.post("/ban-source")
async def ban_source(
    ban_request: BanSourceRequest,
    user: dict = Depends(require_super_admin)
):
    """
    Ban an IP hash from posting comments, reactions, or subscribing
    
    Phase 5.3 - Abuse/Safety Controls
    Super admin only
    
    Args:
        ban_request: Contains ip_hash and reason for ban
    
    Returns:
        Success message with ban details
    """
    if not ban_request.ip_hash or not ban_request.ip_hash.strip():
        raise HTTPException(
            status_code=400,
            detail="IP hash is required"
        )
    
    if not ban_request.reason or not ban_request.reason.strip():
        raise HTTPException(
            status_code=400,
            detail="Reason is required"
        )
    
    # Ban the IP hash
    ban_record = await ban_ip_hash(ban_request.ip_hash, ban_request.reason)
    
    return {
        "success": True,
        "id": ban_record['id'],
        "ip_hash": ban_request.ip_hash,
        "ip_hash_display": ban_request.ip_hash[:6],
        "reason": ban_request.reason,
        "message": f"IP hash {ban_request.ip_hash[:6]}... has been banned"
    }

@router.get("/banned-sources", response_model=List[BannedSourcePublic])
async def get_banned_sources(
    user: dict = Depends(require_super_admin)
):
    """
    Get all banned sources
    
    Phase 5.3 - Abuse/Safety Controls
    Super admin only
    
    Returns:
        List of banned sources with truncated IP hashes
    """
    banned_sources = await get_all_banned_sources()
    
    return [
        BannedSourcePublic(
            id=source['id'],
            ip_hash_display=source['ip_hash'][:6] + "...",  # Truncate for display
            reason=source['reason'],
            created_at=source['created_at']
        )
        for source in banned_sources
    ]

@router.delete("/unban-source/{ip_hash}")
async def unban_source(
    ip_hash: str,
    user: dict = Depends(require_super_admin)
):
    """
    Unban an IP hash
    
    Phase 5.3 - Abuse/Safety Controls
    Super admin only
    
    Args:
        ip_hash: Full IP hash to unban
    
    Returns:
        Success message
    """
    success = await unban_ip_hash(ip_hash)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="IP hash not found in banned sources"
        )
    
    return {
        "success": True,
        "ip_hash_display": ip_hash[:6] + "...",
        "message": "IP hash has been unbanned"
    }
