"""
Module Registry API
Founder Command Center - Module tracking and observational registry

GET /api/founder/modules - Returns the canonical module registry

This is READ-ONLY and observational - does not control behavior.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
import json
import os
from pathlib import Path

router = APIRouter(prefix="/api/founder", tags=["Founder - Module Registry"])

# Auth dependencies
from middleware.auth_guard import get_current_user

# Path to the canonical registry file
REGISTRY_PATH = Path(__file__).parent.parent / "config" / "modules_registry.json"


def load_registry():
    """Load the module registry from the canonical JSON file"""
    if not REGISTRY_PATH.exists():
        return {
            "registry_version": "1.0.0",
            "error": "Registry file not found",
            "modules": []
        }
    
    with open(REGISTRY_PATH, 'r') as f:
        return json.load(f)


@router.get("/modules")
async def get_modules(
    status: Optional[str] = None,
    world: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the canonical module registry
    
    Query Parameters:
    - status: Filter by status (active, opening_soon, disabled)
    - world: Filter by world (Social World, Skills World, etc.)
    - category: Filter by category
    
    Returns:
    - Complete registry with optional filtering
    - Summary statistics
    """
    # Check for founder/admin access
    user_roles = current_user.get("roles", [])
    if "super_admin" not in user_roles and "admin" not in user_roles:
        raise HTTPException(
            status_code=403,
            detail="Founder or admin access required"
        )
    
    registry = load_registry()
    modules = registry.get("modules", [])
    
    # Apply filters
    if status:
        modules = [m for m in modules if m.get("status") == status]
    
    if world:
        modules = [m for m in modules if m.get("world", "").lower() == world.lower()]
    
    if category:
        modules = [m for m in modules if m.get("category") == category]
    
    # Calculate summary statistics
    all_modules = registry.get("modules", [])
    summary = {
        "total": len(all_modules),
        "active": len([m for m in all_modules if m.get("status") == "active"]),
        "opening_soon": len([m for m in all_modules if m.get("status") == "opening_soon"]),
        "disabled": len([m for m in all_modules if m.get("status") == "disabled"]),
        "worlds": list(set(m.get("world", "Unknown") for m in all_modules)),
        "categories": list(set(m.get("category", "unknown") for m in all_modules))
    }
    
    return {
        "registry_version": registry.get("registry_version", "1.0.0"),
        "last_updated": registry.get("last_updated"),
        "description": registry.get("description"),
        "summary": summary,
        "modules": modules,
        "filters_applied": {
            "status": status,
            "world": world,
            "category": category
        }
    }


@router.get("/modules/{module_id}")
async def get_module_by_id(
    module_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a single module by ID
    """
    # Check for founder/admin access
    user_roles = current_user.get("roles", [])
    if "super_admin" not in user_roles and "admin" not in user_roles:
        raise HTTPException(
            status_code=403,
            detail="Founder or admin access required"
        )
    
    registry = load_registry()
    modules = registry.get("modules", [])
    
    for module in modules:
        if module.get("id") == module_id:
            return module
    
    raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found in registry")


@router.get("/modules/stats/summary")
async def get_modules_summary(
    current_user: dict = Depends(get_current_user)
):
    """
    Get summary statistics only (lighter endpoint)
    """
    # Check for founder/admin access
    user_roles = current_user.get("roles", [])
    if "super_admin" not in user_roles and "admin" not in user_roles:
        raise HTTPException(
            status_code=403,
            detail="Founder or admin access required"
        )
    
    registry = load_registry()
    modules = registry.get("modules", [])
    
    # Group by world
    worlds_breakdown = {}
    for m in modules:
        world = m.get("world", "Unknown")
        if world not in worlds_breakdown:
            worlds_breakdown[world] = {"total": 0, "active": 0, "opening_soon": 0}
        worlds_breakdown[world]["total"] += 1
        if m.get("status") == "active":
            worlds_breakdown[world]["active"] += 1
        elif m.get("status") == "opening_soon":
            worlds_breakdown[world]["opening_soon"] += 1
    
    return {
        "registry_version": registry.get("registry_version"),
        "last_updated": registry.get("last_updated"),
        "totals": {
            "all": len(modules),
            "active": len([m for m in modules if m.get("status") == "active"]),
            "opening_soon": len([m for m in modules if m.get("status") == "opening_soon"]),
            "disabled": len([m for m in modules if m.get("status") == "disabled"])
        },
        "by_world": worlds_breakdown
    }
