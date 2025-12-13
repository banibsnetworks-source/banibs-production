"""
Book Vault - API Routes v1.0
CANONICAL SPEC - Raymond Al Zedeck

Admin-only module for managing founder's literary works.
Base prefix: /api/book-vault

SECURITY: Restricted to super_admin/admin/founder only.

GUIDING PRINCIPLES:
1) Nothing gets lost: edits create versions, never overwrite
2) Soft delete only
3) All exports include watermark
4) If entry.is_locked=true, block metadata edit except tags
"""

import logging
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import PlainTextResponse, Response

from db.connection import get_db
from middleware.auth_guard import get_current_user, require_role
from models.book_vault import (
    Work, WorkCreate, WorkUpdate, WorkStatus, SeriesKey, WorkType,
    Entry, EntryCreate, EntryUpdate, EntryType,
    EntryVersion, EntryVersionCreate, ContentFormat, VersionSource
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/book-vault", tags=["Book Vault"])

# Watermark for all exports
EXPORT_WATERMARK = """
================================================================================
BANIBS Book Vault — Internal Draft — Not for distribution
Exported: {timestamp}
================================================================================

"""


# =============================================================================
# WORKS CRUD
# =============================================================================

@router.get("/works", response_model=dict)
async def list_works(
    series_key: Optional[str] = Query(None, description="Filter by series (D, G, O, BANIBS, LIFE, OTHER)"),
    work_status: Optional[str] = Query(None, description="Filter by status"),
    work_type: Optional[str] = Query(None, description="Filter by type"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    search: Optional[str] = Query(None, description="Search title/description"),
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """List all works with optional filtering"""
    query = {"is_deleted": False}
    
    if series_key:
        query["series_key"] = series_key
    if work_status:
        query["status"] = work_status
    if work_type:
        query["work_type"] = work_type
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    cursor = db.vault_works.find(query, {"_id": 0}).sort([
        ("series_key", 1), 
        ("order_key", 1),
        ("title", 1)
    ])
    works = await cursor.to_list(length=500)
    
    # Text search if provided
    if search:
        search_lower = search.lower()
        works = [w for w in works if 
                 search_lower in w.get("title", "").lower() or
                 search_lower in (w.get("subtitle") or "").lower() or
                 search_lower in (w.get("description") or "").lower()]
    
    return {"works": works, "total": len(works)}


@router.post("/works", response_model=dict)
async def create_work(
    data: WorkCreate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Create a new work"""
    work = Work(
        id=str(uuid4()),
        series_key=data.series_key,
        work_type=data.work_type,
        order_key=data.order_key,
        title=data.title,
        subtitle=data.subtitle,
        status=data.status,
        description=data.description,
        tags=data.tags,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        created_by_user_id=current_user["id"]
    )
    
    await db.vault_works.insert_one(work.model_dump())
    logger.info(f"Book Vault: Work created - {work.id} '{work.title}' by {current_user['id']}")
    
    return {"success": True, "work": work.model_dump()}


@router.get("/works/{work_id}", response_model=dict)
async def get_work(
    work_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Get a single work with entry counts"""
    work = await db.vault_works.find_one(
        {"id": work_id, "is_deleted": False}, 
        {"_id": 0}
    )
    
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    # Get entry count
    entry_count = await db.vault_entries.count_documents({
        "work_id": work_id, 
        "is_deleted": False
    })
    
    # Get version count
    entries = await db.vault_entries.find(
        {"work_id": work_id, "is_deleted": False},
        {"id": 1}
    ).to_list(length=1000)
    entry_ids = [e["id"] for e in entries]
    
    version_count = 0
    if entry_ids:
        version_count = await db.vault_entry_versions.count_documents({
            "entry_id": {"$in": entry_ids}
        })
    
    return {
        "work": work,
        "entry_count": entry_count,
        "version_count": version_count
    }


@router.patch("/works/{work_id}", response_model=dict)
async def update_work(
    work_id: str,
    data: WorkUpdate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Update work metadata"""
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.vault_works.update_one(
        {"id": work_id, "is_deleted": False},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Work not found")
    
    logger.info(f"Book Vault: Work updated - {work_id} by {current_user['id']}")
    return {"success": True, "updated_fields": list(update_dict.keys())}


@router.delete("/works/{work_id}", response_model=dict)
async def delete_work(
    work_id: str,
    current_user=Depends(require_role("super_admin", "founder")),
    db=Depends(get_db)
):
    """Soft delete a work (archive)"""
    result = await db.vault_works.update_one(
        {"id": work_id},
        {"$set": {
            "is_deleted": True, 
            "status": "archived",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Work not found")
    
    logger.warning(f"Book Vault: Work soft-deleted - {work_id} by {current_user['id']}")
    return {"success": True, "message": "Work archived (soft delete)"}


# =============================================================================
# ENTRIES CRUD
# =============================================================================

@router.get("/works/{work_id}/entries", response_model=dict)
async def list_entries(
    work_id: str,
    entry_type: Optional[str] = Query(None),
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """List entries for a work"""
    query = {"work_id": work_id, "is_deleted": False}
    
    if entry_type:
        query["entry_type"] = entry_type
    
    cursor = db.vault_entries.find(query, {"_id": 0}).sort([
        ("order_index", 1),
        ("created_at", 1)
    ])
    entries = await cursor.to_list(length=1000)
    
    # Enrich with current version preview
    for entry in entries:
        if entry.get("current_version_id"):
            version = await db.vault_entry_versions.find_one(
                {"id": entry["current_version_id"]},
                {"_id": 0, "content": 1}
            )
            if version:
                content = version.get("content", "")
                entry["content_preview"] = content[:200] + "..." if len(content) > 200 else content
    
    return {"entries": entries, "total": len(entries)}


@router.post("/works/{work_id}/entries", response_model=dict)
async def create_entry(
    work_id: str,
    data: EntryCreate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Create a new entry (auto creates v1 version if content provided)"""
    # Verify work exists
    work = await db.vault_works.find_one({"id": work_id, "is_deleted": False})
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    entry = Entry(
        id=str(uuid4()),
        work_id=work_id,
        entry_type=data.entry_type,
        title=data.title,
        order_index=data.order_index,
        tags=data.tags,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    # If content provided, create initial version
    version_created = None
    if data.content:
        version = EntryVersion(
            id=str(uuid4()),
            entry_id=entry.id,
            version_number=1,
            content_format=data.content_format,
            content=data.content,
            created_at=datetime.now(timezone.utc),
            created_by_user_id=current_user["id"],
            source=VersionSource.USER
        )
        await db.vault_entry_versions.insert_one(version.model_dump())
        entry.current_version_id = version.id
        version_created = version.model_dump()
    
    await db.vault_entries.insert_one(entry.model_dump())
    
    logger.info(f"Book Vault: Entry created - {entry.id} '{entry.title}' in work {work_id}")
    
    return {
        "success": True, 
        "entry": entry.model_dump(),
        "version": version_created
    }


@router.get("/entries/{entry_id}", response_model=dict)
async def get_entry(
    entry_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Get entry with current version"""
    entry = await db.vault_entries.find_one(
        {"id": entry_id, "is_deleted": False}, 
        {"_id": 0}
    )
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Get current version
    current_version = None
    if entry.get("current_version_id"):
        current_version = await db.vault_entry_versions.find_one(
            {"id": entry["current_version_id"]},
            {"_id": 0}
        )
    
    # Get version count
    version_count = await db.vault_entry_versions.count_documents({
        "entry_id": entry_id
    })
    
    return {
        "entry": entry,
        "current_version": current_version,
        "version_count": version_count
    }


@router.patch("/entries/{entry_id}", response_model=dict)
async def update_entry(
    entry_id: str,
    data: EntryUpdate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Update entry metadata (title/tags/order/lock) - NOT content"""
    entry = await db.vault_entries.find_one({"id": entry_id, "is_deleted": False})
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # If locked, only allow tag updates
    if entry.get("is_locked") and data.title is not None:
        raise HTTPException(
            status_code=400, 
            detail="Entry is locked. Only tags can be updated. Create a new version to change content."
        )
    
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.vault_entries.update_one(
        {"id": entry_id},
        {"$set": update_dict}
    )
    
    return {"success": True, "updated_fields": list(update_dict.keys())}


@router.delete("/entries/{entry_id}", response_model=dict)
async def delete_entry(
    entry_id: str,
    current_user=Depends(require_role("super_admin", "founder")),
    db=Depends(get_db)
):
    """Soft delete (archive) an entry"""
    result = await db.vault_entries.update_one(
        {"id": entry_id},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    logger.warning(f"Book Vault: Entry soft-deleted - {entry_id} by {current_user['id']}")
    return {"success": True, "message": "Entry archived"}


# =============================================================================
# VERSIONS CRUD (The Vault's Memory)
# =============================================================================

@router.get("/entries/{entry_id}/versions", response_model=dict)
async def list_versions(
    entry_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """List all versions for an entry"""
    entry = await db.vault_entries.find_one({"id": entry_id, "is_deleted": False})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    cursor = db.vault_entry_versions.find(
        {"entry_id": entry_id},
        {"_id": 0}
    ).sort("version_number", -1)
    
    versions = await cursor.to_list(length=500)
    
    return {
        "entry_id": entry_id,
        "current_version_id": entry.get("current_version_id"),
        "versions": versions,
        "total": len(versions)
    }


@router.post("/entries/{entry_id}/versions", response_model=dict)
async def create_version(
    entry_id: str,
    data: EntryVersionCreate,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """
    Create a new version of an entry.
    RULE: Edits always create new versions, NEVER overwrite.
    """
    entry = await db.vault_entries.find_one({"id": entry_id, "is_deleted": False})
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    if entry.get("is_locked"):
        raise HTTPException(
            status_code=400, 
            detail="Entry is locked. Cannot create new versions."
        )
    
    # Get highest version number
    latest = await db.vault_entry_versions.find_one(
        {"entry_id": entry_id},
        sort=[("version_number", -1)]
    )
    next_version = (latest.get("version_number", 0) if latest else 0) + 1
    
    version = EntryVersion(
        id=str(uuid4()),
        entry_id=entry_id,
        version_number=next_version,
        content_format=data.content_format,
        content=data.content,
        created_at=datetime.now(timezone.utc),
        created_by_user_id=current_user["id"],
        source=data.source,
        notes=data.notes,
        parent_version_id=entry.get("current_version_id")
    )
    
    await db.vault_entry_versions.insert_one(version.model_dump())
    
    # Update entry's current version
    await db.vault_entries.update_one(
        {"id": entry_id},
        {"$set": {
            "current_version_id": version.id,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    logger.info(f"Book Vault: Version {next_version} created for entry {entry_id}")
    
    return {"success": True, "version": version.model_dump()}


@router.get("/versions/{version_id}", response_model=dict)
async def get_version(
    version_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Get a specific version"""
    version = await db.vault_entry_versions.find_one(
        {"id": version_id},
        {"_id": 0}
    )
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return {"version": version}


@router.post("/entries/{entry_id}/set-current", response_model=dict)
async def set_current_version(
    entry_id: str,
    version_id: str = Query(..., description="Version ID to set as current"),
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Set a specific version as the current version"""
    entry = await db.vault_entries.find_one({"id": entry_id, "is_deleted": False})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    version = await db.vault_entry_versions.find_one({
        "id": version_id,
        "entry_id": entry_id
    })
    if not version:
        raise HTTPException(status_code=404, detail="Version not found for this entry")
    
    await db.vault_entries.update_one(
        {"id": entry_id},
        {"$set": {
            "current_version_id": version_id,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"success": True, "current_version_id": version_id}


# =============================================================================
# SEARCH
# =============================================================================

@router.get("/search", response_model=dict)
async def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    series: Optional[str] = Query(None),
    entry_type: Optional[str] = Query(None),
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Search across works, entries, and versions"""
    q_lower = q.lower()
    
    # Search works
    work_query = {"is_deleted": False}
    if series:
        work_query["series_key"] = series
    
    works = await db.vault_works.find(work_query, {"_id": 0}).to_list(1000)
    matching_works = [
        {**w, "_type": "work"} 
        for w in works 
        if q_lower in w.get("title", "").lower() or
           q_lower in (w.get("subtitle") or "").lower() or
           q_lower in (w.get("description") or "").lower() or
           any(q_lower in tag.lower() for tag in w.get("tags", []))
    ]
    
    # Search entries
    entry_query = {"is_deleted": False}
    if entry_type:
        entry_query["entry_type"] = entry_type
    
    entries = await db.vault_entries.find(entry_query, {"_id": 0}).to_list(1000)
    matching_entries = [
        {**e, "_type": "entry"}
        for e in entries
        if q_lower in e.get("title", "").lower() or
           any(q_lower in tag.lower() for tag in e.get("tags", []))
    ]
    
    # Search version content
    versions = await db.vault_entry_versions.find({}, {"_id": 0}).to_list(2000)
    matching_versions = []
    for v in versions:
        content = v.get("content", "")
        if q_lower in content.lower():
            # Get entry title for context
            entry = await db.vault_entries.find_one({"id": v["entry_id"]}, {"title": 1})
            matching_versions.append({
                **v,
                "_type": "version",
                "entry_title": entry.get("title") if entry else None,
                "snippet": _extract_snippet(content, q)
            })
    
    return {
        "query": q,
        "works": matching_works[:20],
        "entries": matching_entries[:50],
        "versions": matching_versions[:30],
        "total": len(matching_works) + len(matching_entries) + len(matching_versions)
    }


def _extract_snippet(content: str, query: str, context_chars: int = 100) -> str:
    """Extract a snippet around the search query"""
    content_lower = content.lower()
    query_lower = query.lower()
    
    pos = content_lower.find(query_lower)
    if pos == -1:
        return content[:200] + "..." if len(content) > 200 else content
    
    start = max(0, pos - context_chars)
    end = min(len(content), pos + len(query) + context_chars)
    
    snippet = content[start:end]
    if start > 0:
        snippet = "..." + snippet
    if end < len(content):
        snippet = snippet + "..."
    
    return snippet


# =============================================================================
# EXPORT
# =============================================================================

@router.post("/works/{work_id}/export/markdown")
async def export_work_markdown(
    work_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Export a work as Markdown with watermark"""
    work = await db.vault_works.find_one({"id": work_id, "is_deleted": False}, {"_id": 0})
    
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    entries = await db.vault_entries.find(
        {"work_id": work_id, "is_deleted": False}, 
        {"_id": 0}
    ).sort("order_index", 1).to_list(1000)
    
    # Build markdown
    timestamp = datetime.now(timezone.utc).isoformat()
    md = EXPORT_WATERMARK.format(timestamp=timestamp)
    
    md += f"# {work['title']}\n\n"
    
    if work.get("subtitle"):
        md += f"*{work['subtitle']}*\n\n"
    
    if work.get("description"):
        md += f"{work['description']}\n\n"
    
    md += f"**Series:** {work.get('series_key', 'N/A')} | "
    md += f"**Type:** {work.get('work_type', 'N/A')} | "
    md += f"**Status:** {work.get('status', 'N/A')}\n\n"
    
    if work.get("tags"):
        md += f"**Tags:** {', '.join(work['tags'])}\n\n"
    
    md += "---\n\n"
    
    # Group entries by type
    chapters = [e for e in entries if e.get("entry_type") == "chapter"]
    sections = [e for e in entries if e.get("entry_type") == "section"]
    other_entries = [e for e in entries if e.get("entry_type") not in ["chapter", "section"]]
    
    # Chapters
    if chapters:
        for ch in chapters:
            order = ch.get("order_index") or 0
            md += f"## Chapter {order}: {ch['title']}\n\n"
            
            # Get current version content
            if ch.get("current_version_id"):
                version = await db.vault_entry_versions.find_one(
                    {"id": ch["current_version_id"]},
                    {"content": 1}
                )
                if version:
                    md += f"{version.get('content', '')}\n\n"
    
    # Sections
    if sections:
        md += "## Sections\n\n"
        for sec in sections:
            md += f"### {sec['title']}\n\n"
            if sec.get("current_version_id"):
                version = await db.vault_entry_versions.find_one(
                    {"id": sec["current_version_id"]},
                    {"content": 1}
                )
                if version:
                    md += f"{version.get('content', '')}\n\n"
    
    # Other entries
    if other_entries:
        md += "## Additional Content\n\n"
        for entry in other_entries:
            entry_type = entry.get("entry_type", "").upper().replace("_", " ")
            md += f"### [{entry_type}] {entry['title']}\n\n"
            if entry.get("current_version_id"):
                version = await db.vault_entry_versions.find_one(
                    {"id": entry["current_version_id"]},
                    {"content": 1}
                )
                if version:
                    md += f"{version.get('content', '')}\n\n"
    
    md += "\n---\n"
    md += f"*Exported from BANIBS Book Vault — {timestamp}*\n"
    
    logger.info(f"Book Vault: Work exported - {work_id} by {current_user['id']}")
    
    return PlainTextResponse(
        content=md, 
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{work["title"].replace(" ", "_")}.md"'
        }
    )


@router.post("/entries/{entry_id}/export/markdown")
async def export_entry_markdown(
    entry_id: str,
    current_user=Depends(require_role("super_admin", "admin", "founder")),
    db=Depends(get_db)
):
    """Export a single entry as Markdown with watermark"""
    entry = await db.vault_entries.find_one({"id": entry_id, "is_deleted": False}, {"_id": 0})
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    timestamp = datetime.now(timezone.utc).isoformat()
    md = EXPORT_WATERMARK.format(timestamp=timestamp)
    
    entry_type = entry.get("entry_type", "").upper().replace("_", " ")
    md += f"# {entry['title']}\n\n"
    md += f"**Type:** {entry_type}\n"
    
    if entry.get("tags"):
        md += f"**Tags:** {', '.join(entry['tags'])}\n"
    
    md += "\n---\n\n"
    
    # Get current version
    if entry.get("current_version_id"):
        version = await db.vault_entry_versions.find_one(
            {"id": entry["current_version_id"]},
            {"_id": 0}
        )
        if version:
            md += f"**Version:** {version.get('version_number', 1)}\n\n"
            md += version.get("content", "")
    
    md += f"\n\n---\n*Exported from BANIBS Book Vault — {timestamp}*\n"
    
    return PlainTextResponse(
        content=md,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{entry["title"].replace(" ", "_")}.md"'
        }
    )


# =============================================================================
# SEED DATA
# =============================================================================

@router.post("/seed", response_model=dict)
async def seed_initial_data(
    current_user=Depends(require_role("super_admin", "founder")),
    db=Depends(get_db)
):
    """Seed the canonical book registry with initial works"""
    
    # Check if already seeded
    existing = await db.vault_works.count_documents({})
    if existing > 0:
        return {"success": False, "message": f"Vault already contains {existing} works. Seed skipped."}
    
    now = datetime.now(timezone.utc)
    user_id = current_user["id"]
    
    # Canonical seed works
    seed_works = [
        Work(
            id=str(uuid4()),
            series_key=SeriesKey.D,
            work_type=WorkType.BOOK,
            order_key="D-1",
            title="The Devil's Dismissive Argument",
            subtitle=None,
            status=WorkStatus.PUBLISHED,
            description="The foundational revelation on recognition of dismissive patterns.",
            tags=["D-Series", "published"],
            created_at=now,
            updated_at=now,
            created_by_user_id=user_id
        ),
        Work(
            id=str(uuid4()),
            series_key=SeriesKey.D,
            work_type=WorkType.BOOK,
            order_key="D-2",
            title="The Devil's Deceitful Master Plan",
            subtitle=None,
            status=WorkStatus.PLANNED,
            description="The second revelation in the D-Series.",
            tags=["D-Series", "planned"],
            created_at=now,
            updated_at=now,
            created_by_user_id=user_id
        ),
        Work(
            id=str(uuid4()),
            series_key=SeriesKey.G,
            work_type=WorkType.BOOK,
            order_key="G-1",
            title="The Light God Wants You to See",
            subtitle="What God Reveals When Truth Is Chosen",
            status=WorkStatus.DRAFTING,
            description="The first book in the G-Series.",
            tags=["G-Series", "drafting"],
            created_at=now,
            updated_at=now,
            created_by_user_id=user_id
        ),
        Work(
            id=str(uuid4()),
            series_key=SeriesKey.D,
            work_type=WorkType.COMPANION,
            order_key="D-C1",
            title="Before You Call It Out",
            subtitle=None,
            status=WorkStatus.DRAFTING,
            description="Explores when speaking helps — and when it hardens everything.",
            tags=["companion", "in-development"],
            created_at=now,
            updated_at=now,
            created_by_user_id=user_id
        )
    ]
    
    # Insert works
    for work in seed_works:
        await db.vault_works.insert_one(work.model_dump())
    
    # Create scripture anchor entries for G-1
    g1_work = seed_works[2]  # The Light God Wants You to See
    
    scripture_anchors = [
        ("Matthew 5:15–16", "Let your light shine before others"),
        ("John 8:32", "The truth shall set you free"),
        ("John 8:33–44", "The devil's nature as the father of lies"),
        ("2 Thessalonians 2:3–4", "The man of lawlessness"),
        ("Ephesians 6:12 (KJV/NKJV)", "We wrestle not against flesh and blood")
    ]
    
    for ref, note in scripture_anchors:
        entry = Entry(
            id=str(uuid4()),
            work_id=g1_work.id,
            entry_type=EntryType.SCRIPTURE_NOTE,
            title=ref,
            tags=["scripture"],
            created_at=now,
            updated_at=now
        )
        
        # Create initial version with the note
        version = EntryVersion(
            id=str(uuid4()),
            entry_id=entry.id,
            version_number=1,
            content_format=ContentFormat.MARKDOWN,
            content=f"**{ref}**\n\n{note}",
            created_at=now,
            created_by_user_id=user_id,
            source=VersionSource.USER
        )
        
        entry.current_version_id = version.id
        
        await db.vault_entries.insert_one(entry.model_dump())
        await db.vault_entry_versions.insert_one(version.model_dump())
    
    # Create "Before You Call It Out" page copy entry under D-C1
    d_c1_work = seed_works[3]
    
    bycio_content = """## Before You Call It Out

*A reflection before speaking truth to power—or to anyone.*

Have you noticed how some people only get harder when confronted?

This is not an accident.

There's a pattern that protects itself by being called out—because calling it out gives it what it needs: conflict, division, and another excuse to dismiss.

**Before You Call It Out**, ask yourself:
- Am I speaking to help, or to prove I'm right?
- Will this person's heart soften, or harden?
- Is this the right time, or am I forcing it?

Sometimes, the most powerful thing you can do is wait.

Not because you're weak.
Not because you're afraid.
But because you understand: **some truths need the right soil.**

---

*From the D-Series Companion: "Before You Call It Out"*
"""
    
    bycio_entry = Entry(
        id=str(uuid4()),
        work_id=d_c1_work.id,
        entry_type=EntryType.PAGE_COPY,
        title="Before You Call It Out - Main Copy",
        tags=["page_copy", "coming-soon", "approved"],
        created_at=now,
        updated_at=now
    )
    
    bycio_version = EntryVersion(
        id=str(uuid4()),
        entry_id=bycio_entry.id,
        version_number=1,
        content_format=ContentFormat.MARKDOWN,
        content=bycio_content,
        created_at=now,
        created_by_user_id=user_id,
        source=VersionSource.USER,
        notes="Approved copy used on /coming-soon page"
    )
    
    bycio_entry.current_version_id = bycio_version.id
    
    await db.vault_entries.insert_one(bycio_entry.model_dump())
    await db.vault_entry_versions.insert_one(bycio_version.model_dump())
    
    logger.info(f"Book Vault: Seeded {len(seed_works)} works + {len(scripture_anchors) + 1} entries")
    
    return {
        "success": True,
        "message": f"Seeded {len(seed_works)} works and {len(scripture_anchors) + 1} entries",
        "works": [w.title for w in seed_works]
    }
