"""
Reading Night - API Routes v1.0
BANIBS Reading Night - Guided Communal Reading Experience

Endpoints:
- Sessions: CRUD for reading sessions
- RSVPs: Access requests
- Reflections: Post-session responses
- Audio: TTS generation and retrieval
"""

import logging
import os
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import Response

from db.connection import get_db
from middleware.auth_guard import get_current_user, require_role
from models.reading_night import (
    ReadingSession, ReadingSessionCreate, ReadingSessionUpdate,
    SessionStatus, SessionSpeed, AudioStatus,
    RSVP, RSVPCreate, RSVPStatus,
    Reflection, ReflectionCreate,
    REFLECTION_PROMPTS
)
from services.reading_night_tts import get_tts_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reading-night", tags=["Reading Night"])


# =============================================================================
# SESSIONS - PUBLIC ENDPOINTS
# =============================================================================

@router.get("/sessions", response_model=dict)
async def list_sessions(
    status: Optional[str] = Query(None, description="Filter by status"),
    include_past: bool = Query(False, description="Include past premieres"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """List available reading sessions (scheduled and replay)"""
    query = {}
    
    # Filter by status
    if status:
        query["status"] = status
    else:
        # Default: show scheduled, live, and replay sessions
        query["status"] = {"$in": ["scheduled", "live", "replay"]}
    
    sessions = await db.reading_sessions.find(query, {"_id": 0}).sort([
        ("premiere_at", -1),
        ("created_at", -1)
    ]).to_list(100)
    
    # Separate upcoming vs replay
    now = datetime.now(timezone.utc)
    upcoming = [s for s in sessions if s.get("status") in ["scheduled", "live"]]
    replays = [s for s in sessions if s.get("status") == "replay"]
    
    return {
        "sessions": sessions,
        "total": len(sessions),
        "upcoming_count": len(upcoming),
        "replay_count": len(replays)
    }


@router.get("/sessions/{session_id}", response_model=dict)
async def get_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get session details with user's RSVP and reflection status"""
    session = await db.reading_sessions.find_one(
        {"id": session_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check user's RSVP status
    user_rsvp = None
    if current_user:
        user_rsvp = await db.reading_rsvps.find_one(
            {"session_id": session_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
    
    # Check user's reflection
    user_reflection = None
    if current_user:
        user_reflection = await db.reading_reflections.find_one(
            {"session_id": session_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
    
    # Determine access
    has_access = False
    user_roles = current_user.get("roles", []) if current_user else []
    
    # Admins/founders always have access
    if any(r in user_roles for r in ["super_admin", "admin", "founder"]):
        has_access = True
    # Approved RSVP grants access
    elif user_rsvp and user_rsvp.get("status") == "approved":
        has_access = True
    # Replays might be more open (for v1, still require approval)
    
    return {
        "session": session,
        "user_rsvp": user_rsvp,
        "user_reflection": user_reflection,
        "has_access": has_access,
        "reflection_prompts": REFLECTION_PROMPTS
    }


# =============================================================================
# RSVP ENDPOINTS
# =============================================================================

@router.post("/sessions/{session_id}/rsvp", response_model=dict)
async def request_access(
    session_id: str,
    data: Optional[RSVPCreate] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Request access to a reading session (Commitment Pass)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check session exists
    session = await db.reading_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if already RSVPed
    existing = await db.reading_rsvps.find_one({
        "session_id": session_id,
        "user_id": current_user["id"]
    })
    
    if existing:
        return {
            "success": True,
            "message": "Already registered",
            "rsvp": {**existing, "_id": None} if existing else None,
            "status": existing.get("status")
        }
    
    # For v1: Auto-approve for admins, pending for others
    user_roles = current_user.get("roles", [])
    auto_approve = any(r in user_roles for r in ["super_admin", "admin", "founder"])
    
    rsvp = RSVP(
        id=str(uuid4()),
        session_id=session_id,
        user_id=current_user["id"],
        user_email=current_user.get("email"),
        user_name=f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip(),
        status=RSVPStatus.APPROVED if auto_approve else RSVPStatus.PENDING,
        message=data.message if data else None,
        created_at=datetime.now(timezone.utc)
    )
    
    if auto_approve:
        rsvp.reviewed_at = datetime.now(timezone.utc)
        rsvp.reviewed_by = "auto"
    
    await db.reading_rsvps.insert_one(rsvp.model_dump())
    
    # Update session RSVP count
    await db.reading_sessions.update_one(
        {"id": session_id},
        {"$inc": {"rsvp_count": 1}}
    )
    
    logger.info(f"Reading Night: RSVP created for session {session_id} by user {current_user['id']}")
    
    return {
        "success": True,
        "message": "Access approved" if auto_approve else "Access requested - pending approval",
        "rsvp": rsvp.model_dump(),
        "status": rsvp.status
    }


@router.get("/my-rsvps", response_model=dict)
async def get_my_rsvps(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all RSVPs for current user"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    rsvps = await db.reading_rsvps.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    return {"rsvps": rsvps, "total": len(rsvps)}


# =============================================================================
# REFLECTION ENDPOINTS
# =============================================================================

@router.post("/sessions/{session_id}/reflection", response_model=dict)
async def submit_reflection(
    session_id: str,
    data: ReflectionCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Submit post-session reflection"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check session exists
    session = await db.reading_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if already submitted
    existing = await db.reading_reflections.find_one({
        "session_id": session_id,
        "user_id": current_user["id"]
    })
    
    if existing:
        # Update existing reflection
        await db.reading_reflections.update_one(
            {"id": existing["id"]},
            {"$set": {
                "prompt_1_response": data.prompt_1_response,
                "prompt_2_response": data.prompt_2_response,
                "prompt_3_response": data.prompt_3_response
            }}
        )
        return {"success": True, "message": "Reflection updated"}
    
    reflection = Reflection(
        id=str(uuid4()),
        session_id=session_id,
        user_id=current_user["id"],
        prompt_1_response=data.prompt_1_response,
        prompt_2_response=data.prompt_2_response,
        prompt_3_response=data.prompt_3_response,
        created_at=datetime.now(timezone.utc)
    )
    
    await db.reading_reflections.insert_one(reflection.model_dump())
    
    logger.info(f"Reading Night: Reflection submitted for session {session_id}")
    
    return {"success": True, "reflection": reflection.model_dump()}


@router.get("/prompts", response_model=dict)
async def get_reflection_prompts():
    """Get standard reflection prompts"""
    return {"prompts": REFLECTION_PROMPTS}


# =============================================================================
# AUDIO ENDPOINTS
# =============================================================================

@router.get("/sessions/{session_id}/audio")
async def get_session_audio(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get audio for a reading session (requires access)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    session = await db.reading_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check access
    user_roles = current_user.get("roles", [])
    has_admin_access = any(r in user_roles for r in ["super_admin", "admin", "founder"])
    
    if not has_admin_access:
        rsvp = await db.reading_rsvps.find_one({
            "session_id": session_id,
            "user_id": current_user["id"],
            "status": "approved"
        })
        if not rsvp:
            raise HTTPException(status_code=403, detail="Access not approved")
    
    # Check audio status
    if session.get("audio_status") != "ready":
        raise HTTPException(
            status_code=404, 
            detail=f"Audio not available (status: {session.get('audio_status', 'unknown')})"
        )
    
    # Get audio from storage
    audio_data = await db.reading_audio.find_one({"session_id": session_id})
    
    if not audio_data or not audio_data.get("audio_bytes"):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    # Increment replay count
    await db.reading_sessions.update_one(
        {"id": session_id},
        {"$inc": {"replay_count": 1}}
    )
    
    return Response(
        content=audio_data["audio_bytes"],
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f'inline; filename="reading_night_{session_id}.mp3"'
        }
    )


# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@router.post("/admin/sessions", response_model=dict)
async def create_session(
    data: ReadingSessionCreate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Create a new reading session (admin only)"""
    
    # Get work details from Book Vault
    work = await db.vault_works.find_one({"id": data.work_id}, {"_id": 0})
    if not work:
        raise HTTPException(status_code=404, detail="Book Vault work not found")
    
    session = ReadingSession(
        id=str(uuid4()),
        title=data.title,
        subtitle=data.subtitle,
        synopsis=data.synopsis,
        work_id=data.work_id,
        work_title=work.get("title"),
        episode_number=data.episode_number,
        status=SessionStatus.DRAFT,
        premiere_at=data.premiere_at,
        estimated_duration_minutes=data.estimated_duration_minutes,
        script=data.script.model_dump() if data.script else None,
        speed_mode=data.speed_mode,
        discussion_room_link=data.discussion_room_link,
        commitment_fee_cents=data.commitment_fee_cents,
        commitment_label=data.commitment_label,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        created_by_user_id=current_user["id"]
    )
    
    await db.reading_sessions.insert_one(session.model_dump())
    
    logger.info(f"Reading Night: Session created - {session.id} '{session.title}'")
    
    return {"success": True, "session": session.model_dump()}


@router.get("/admin/sessions", response_model=dict)
async def list_admin_sessions(
    include_drafts: bool = Query(True),
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """List all sessions including drafts (admin only)"""
    query = {}
    
    if not include_drafts:
        query["status"] = {"$ne": "draft"}
    
    sessions = await db.reading_sessions.find(query, {"_id": 0}).sort([
        ("created_at", -1)
    ]).to_list(100)
    
    return {"sessions": sessions, "total": len(sessions)}


@router.patch("/admin/sessions/{session_id}", response_model=dict)
async def update_session(
    session_id: str,
    data: ReadingSessionUpdate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Update session metadata (admin only)"""
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.reading_sessions.update_one(
        {"id": session_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"success": True, "updated_fields": list(update_dict.keys())}


@router.post("/admin/sessions/{session_id}/generate-audio", response_model=dict)
async def generate_session_audio(
    session_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Generate TTS audio for a session (admin only)"""
    session = await db.reading_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if already generating
    if session.get("audio_status") == "generating":
        return {"success": False, "message": "Audio generation already in progress"}
    
    # Mark as generating
    await db.reading_sessions.update_one(
        {"id": session_id},
        {"$set": {"audio_status": "generating", "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Start background generation
    background_tasks.add_task(
        _generate_audio_task,
        session_id=session_id,
        db_name=os.environ.get("DB_NAME", "test_database")
    )
    
    return {"success": True, "message": "Audio generation started", "status": "generating"}


async def _generate_audio_task(session_id: str, db_name: str):
    """Background task to generate audio"""
    from motor.motor_asyncio import AsyncIOMotorClient
    
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        session = await db.reading_sessions.find_one({"id": session_id})
        if not session:
            logger.error(f"Session {session_id} not found for audio generation")
            return
        
        # Get content from Book Vault
        script = session.get("script", {})
        work_id = session.get("work_id")
        
        # Gather all content
        content_parts = []
        
        # Add intro if present
        if script.get("intro_text"):
            content_parts.append(script["intro_text"])
        
        # Get entries from script segments or all entries from work
        segments = script.get("segments", [])
        
        if segments:
            for segment in sorted(segments, key=lambda x: x.get("order_index", 0)):
                entry = await db.vault_entries.find_one({"id": segment["entry_id"]})
                if entry and entry.get("current_version_id"):
                    version = await db.vault_entry_versions.find_one({"id": entry["current_version_id"]})
                    if version:
                        content = version.get("content", "")
                        # Apply start/end indices if specified
                        start = segment.get("start_index") or 0
                        end = segment.get("end_index") or len(content)
                        content_parts.append(content[start:end])
        else:
            # Get all entries from work
            entries = await db.vault_entries.find(
                {"work_id": work_id, "is_deleted": False},
                {"_id": 0}
            ).sort("order_index", 1).to_list(100)
            
            for entry in entries:
                if entry.get("current_version_id"):
                    version = await db.vault_entry_versions.find_one({"id": entry["current_version_id"]})
                    if version:
                        content_parts.append(version.get("content", ""))
        
        # Add outro if present
        if script.get("outro_text"):
            content_parts.append(script["outro_text"])
        
        full_content = "\n\n".join(content_parts)
        
        if not full_content.strip():
            logger.error(f"No content found for session {session_id}")
            await db.reading_sessions.update_one(
                {"id": session_id},
                {"$set": {"audio_status": "failed", "updated_at": datetime.now(timezone.utc)}}
            )
            return
        
        # Generate audio
        tts_service = get_tts_service()
        audio_bytes, metadata = await tts_service.generate_full_audio(
            content=full_content,
            intro_text=script.get("intro_text"),
            outro_text=script.get("outro_text")
        )
        
        # Store audio
        await db.reading_audio.update_one(
            {"session_id": session_id},
            {"$set": {
                "session_id": session_id,
                "audio_bytes": audio_bytes,
                "metadata": metadata,
                "generated_at": datetime.now(timezone.utc)
            }},
            upsert=True
        )
        
        # Update session
        await db.reading_sessions.update_one(
            {"id": session_id},
            {"$set": {
                "audio_status": "ready",
                "word_count": metadata.get("word_count"),
                "actual_duration_seconds": metadata.get("estimated_duration_seconds"),
                "audio_generated_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        logger.info(f"Reading Night: Audio generated for session {session_id} - {metadata}")
        
    except Exception as e:
        logger.error(f"Audio generation failed for session {session_id}: {e}")
        await db.reading_sessions.update_one(
            {"id": session_id},
            {"$set": {"audio_status": "failed", "updated_at": datetime.now(timezone.utc)}}
        )
    finally:
        client.close()


@router.post("/admin/sessions/{session_id}/publish", response_model=dict)
async def publish_session(
    session_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Publish a session (make it scheduled/visible)"""
    session = await db.reading_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    new_status = SessionStatus.SCHEDULED if session.get("premiere_at") else SessionStatus.REPLAY
    
    await db.reading_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "status": new_status.value,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"success": True, "status": new_status.value}


@router.get("/admin/sessions/{session_id}/rsvps", response_model=dict)
async def list_session_rsvps(
    session_id: str,
    status: Optional[str] = Query(None),
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """List RSVPs for a session (admin only)"""
    query = {"session_id": session_id}
    if status:
        query["status"] = status
    
    rsvps = await db.reading_rsvps.find(query, {"_id": 0}).to_list(500)
    
    return {"rsvps": rsvps, "total": len(rsvps)}


@router.post("/admin/rsvps/{rsvp_id}/approve", response_model=dict)
async def approve_rsvp(
    rsvp_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Approve an RSVP"""
    result = await db.reading_rsvps.update_one(
        {"id": rsvp_id},
        {"$set": {
            "status": "approved",
            "reviewed_by": current_user["id"],
            "reviewed_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="RSVP not found")
    
    return {"success": True, "status": "approved"}


@router.post("/admin/rsvps/{rsvp_id}/deny", response_model=dict)
async def deny_rsvp(
    rsvp_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Deny an RSVP"""
    result = await db.reading_rsvps.update_one(
        {"id": rsvp_id},
        {"$set": {
            "status": "denied",
            "reviewed_by": current_user["id"],
            "reviewed_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="RSVP not found")
    
    return {"success": True, "status": "denied"}


@router.get("/admin/sessions/{session_id}/reflections", response_model=dict)
async def list_session_reflections(
    session_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """List reflections for a session (admin only)"""
    reflections = await db.reading_reflections.find(
        {"session_id": session_id},
        {"_id": 0}
    ).to_list(500)
    
    return {"reflections": reflections, "total": len(reflections)}
