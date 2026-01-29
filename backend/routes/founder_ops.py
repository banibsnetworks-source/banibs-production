"""
Founder Ops Hub API Routes
- Ops Log CRUD
- Tasks CRUD + Move (Kanban drag/drop)
- Detectors CRUD (HDOS)
- Documents CRUD + File Upload/Download

Access: super_admin only (RBAC enforced)
All responses wrapped in { success, data, error } envelope
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, Form
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Any
from datetime import datetime, timezone
import uuid
import os
import hashlib
import re

from db.connection import get_db
from models.founder_ops import (
    OpsLogEntryCreate, OpsLogEntryUpdate, OpsLogEntry,
    TaskCreate, TaskUpdate, TaskMove, Task,
    DetectorCreate, DetectorUpdate, Detector,
    DocumentCreate, DocumentUpdate, Document
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/founder-ops", tags=["Founder Ops Hub"])


# =====================
# RESPONSE HELPERS
# =====================

def success_response(data: Any):
    """Wrap successful response"""
    return {"success": True, "data": data, "error": None}


def error_response(code: str, message: str, details: Any = None, status_code: int = 400):
    """Raise HTTP exception with error envelope"""
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "data": None, "error": {"code": code, "message": message, "details": details}}
    )


# =====================
# AUTH HELPER
# =====================

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
# OPS LOG ENDPOINTS
# =====================

@router.get("/ops-log")
async def get_ops_log(
    limit: int = 100,
    skip: int = 0,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get ops log entries (super_admin only)"""
    require_super_admin(current_user)
    
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    
    cursor = db.ops_log.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit)
    entries = await cursor.to_list(length=limit)
    
    return success_response(entries)


@router.post("/ops-log", status_code=201)
async def create_ops_log_entry(
    entry: OpsLogEntryCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create new ops log entry (super_admin only)"""
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    
    new_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": now,
        "title": entry.title,
        "notes": entry.notes,
        "category": entry.category.value if entry.category else None,
        "status": entry.status.value,
        "created_by": current_user.get("id") or current_user.get("email"),
        "updated_at": None
    }
    
    await db.ops_log.insert_one(new_entry)
    new_entry.pop("_id", None)
    
    return success_response(new_entry)


@router.put("/ops-log/{entry_id}")
async def update_ops_log_entry(
    entry_id: str,
    update: OpsLogEntryUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update ops log entry (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.ops_log.find_one({"id": entry_id})
    if not existing:
        error_response("NOT_FOUND", "Entry not found", status_code=404)
    
    update_dict = {"updated_at": datetime.now(timezone.utc)}
    
    if update.title is not None:
        update_dict["title"] = update.title
    if update.notes is not None:
        update_dict["notes"] = update.notes
    if update.category is not None:
        update_dict["category"] = update.category.value
    if update.status is not None:
        update_dict["status"] = update.status.value
    
    await db.ops_log.update_one({"id": entry_id}, {"$set": update_dict})
    
    updated = await db.ops_log.find_one({"id": entry_id}, {"_id": 0})
    return success_response(updated)


@router.delete("/ops-log/{entry_id}")
async def delete_ops_log_entry(
    entry_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete ops log entry (super_admin only)"""
    require_super_admin(current_user)
    
    result = await db.ops_log.delete_one({"id": entry_id})
    
    if result.deleted_count == 0:
        error_response("NOT_FOUND", "Entry not found", status_code=404)
    
    return success_response({"deleted": True, "id": entry_id})


# =====================
# TASKS ENDPOINTS
# =====================

@router.get("/tasks")
async def get_tasks(
    column: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(200, le=500),
    offset: int = 0,
    sort: str = "order",
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get tasks (super_admin only)"""
    require_super_admin(current_user)
    
    query = {}
    if column:
        query["column"] = column
    if status:
        query["status"] = status
    
    # Determine sort direction
    sort_field = sort.lstrip("-")
    sort_dir = -1 if sort.startswith("-") else 1
    
    cursor = db.founder_ops_tasks.find(query, {"_id": 0}).sort(sort_field, sort_dir).skip(offset).limit(limit)
    tasks = await cursor.to_list(length=limit)
    
    return success_response(tasks)


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get single task (super_admin only)"""
    require_super_admin(current_user)
    
    task = await db.founder_ops_tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        error_response("NOT_FOUND", "Task not found", status_code=404)
    
    return success_response(task)


@router.post("/tasks", status_code=201)
async def create_task(
    task: TaskCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create new task (super_admin only)"""
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    
    # Build linked object
    linked = {
        "module_key": task.linked.module_key if task.linked else None,
        "discovery_id": task.linked.discovery_id if task.linked else None,
        "detector_id": task.linked.detector_id if task.linked else None,
        "ops_log_id": task.linked.ops_log_id if task.linked else None
    }
    
    new_task = {
        "id": str(uuid.uuid4()),
        "title": task.title,
        "description": task.description,
        "column": task.column.value,
        "status": task.status.value,
        "priority": task.priority.value,
        "tags": task.tags,
        "order": task.order,
        "due_at": task.due_at,
        "owner": task.owner,
        "linked": linked,
        "audit": {
            "created_at": now,
            "updated_at": now
        }
    }
    
    await db.founder_ops_tasks.insert_one(new_task)
    new_task.pop("_id", None)
    
    return success_response(new_task)


@router.patch("/tasks/{task_id}")
async def update_task(
    task_id: str,
    update: TaskUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update/patch task (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.founder_ops_tasks.find_one({"id": task_id})
    if not existing:
        error_response("NOT_FOUND", "Task not found", status_code=404)
    
    update_dict = {"audit.updated_at": datetime.now(timezone.utc)}
    
    if update.title is not None:
        update_dict["title"] = update.title
    if update.description is not None:
        update_dict["description"] = update.description
    if update.column is not None:
        update_dict["column"] = update.column.value
    if update.status is not None:
        update_dict["status"] = update.status.value
    if update.priority is not None:
        update_dict["priority"] = update.priority.value
    if update.tags is not None:
        update_dict["tags"] = update.tags
    if update.order is not None:
        update_dict["order"] = update.order
    if update.due_at is not None:
        update_dict["due_at"] = update.due_at
    if update.owner is not None:
        update_dict["owner"] = update.owner
    if update.linked is not None:
        update_dict["linked"] = {
            "module_key": update.linked.module_key,
            "discovery_id": update.linked.discovery_id,
            "detector_id": update.linked.detector_id,
            "ops_log_id": update.linked.ops_log_id
        }
    
    await db.founder_ops_tasks.update_one({"id": task_id}, {"$set": update_dict})
    
    updated = await db.founder_ops_tasks.find_one({"id": task_id}, {"_id": 0})
    return success_response(updated)


@router.post("/tasks/{task_id}/move")
async def move_task(
    task_id: str,
    move: TaskMove,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Move task (drag/drop) - update column and order (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.founder_ops_tasks.find_one({"id": task_id})
    if not existing:
        error_response("NOT_FOUND", "Task not found", status_code=404)
    
    now = datetime.now(timezone.utc)
    
    update_dict = {
        "column": move.to_column.value,
        "order": move.to_order,
        "audit.updated_at": now
    }
    
    await db.founder_ops_tasks.update_one({"id": task_id}, {"$set": update_dict})
    
    updated = await db.founder_ops_tasks.find_one({"id": task_id}, {"_id": 0})
    return success_response(updated)


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete task (super_admin only)"""
    require_super_admin(current_user)
    
    result = await db.founder_ops_tasks.delete_one({"id": task_id})
    
    if result.deleted_count == 0:
        error_response("NOT_FOUND", "Task not found", status_code=404)
    
    return success_response({"deleted": True, "id": task_id})


# =====================
# DETECTORS ENDPOINTS
# =====================

@router.get("/detectors")
async def get_detectors(
    domain: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(200, le=500),
    offset: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get detectors (super_admin only)"""
    require_super_admin(current_user)
    
    query = {}
    if domain:
        query["domain"] = domain
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    
    cursor = db.founder_ops_detectors.find(query, {"_id": 0}).sort("audit.created_at", -1).skip(offset).limit(limit)
    detectors = await cursor.to_list(length=limit)
    
    return success_response(detectors)


@router.get("/detectors/{detector_id}")
async def get_detector(
    detector_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get single detector (super_admin only)"""
    require_super_admin(current_user)
    
    detector = await db.founder_ops_detectors.find_one({"id": detector_id}, {"_id": 0})
    if not detector:
        error_response("NOT_FOUND", "Detector not found", status_code=404)
    
    return success_response(detector)


@router.post("/detectors", status_code=201)
async def create_detector(
    detector: DetectorCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create new detector (super_admin only)"""
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    
    # Build signals list
    signals = [
        {
            "key": s.key,
            "label": s.label,
            "description": s.description,
            "weight": s.weight
        }
        for s in detector.signals
    ] if detector.signals else []
    
    # Build actions list
    actions = [
        {
            "key": a.key,
            "label": a.label,
            "description": a.description
        }
        for a in detector.actions
    ] if detector.actions else []
    
    # Build UI object
    ui = {
        "visible": detector.ui.visible if detector.ui else True,
        "color_hint": detector.ui.color_hint if detector.ui else None,
        "icon": detector.ui.icon if detector.ui else None
    }
    
    # Build linked object
    linked = {
        "module_key": detector.linked.module_key if detector.linked else None,
        "discovery_ids": detector.linked.discovery_ids if detector.linked else [],
        "related_detector_ids": detector.linked.related_detector_ids if detector.linked else []
    }
    
    new_detector = {
        "id": str(uuid.uuid4()),
        "name": detector.name,
        "domain": detector.domain.value,
        "type": detector.type.value,
        "status": detector.status.value,
        "severity_default": detector.severity_default.value,
        "description": detector.description,
        "canonical_rules": detector.canonical_rules,
        "signals": signals,
        "actions": actions,
        "ui": ui,
        "linked": linked,
        "audit": {
            "created_at": now,
            "updated_at": now
        }
    }
    
    await db.founder_ops_detectors.insert_one(new_detector)
    new_detector.pop("_id", None)
    
    return success_response(new_detector)


@router.patch("/detectors/{detector_id}")
async def update_detector(
    detector_id: str,
    update: DetectorUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update/patch detector (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.founder_ops_detectors.find_one({"id": detector_id})
    if not existing:
        error_response("NOT_FOUND", "Detector not found", status_code=404)
    
    update_dict = {"audit.updated_at": datetime.now(timezone.utc)}
    
    if update.name is not None:
        update_dict["name"] = update.name
    if update.domain is not None:
        update_dict["domain"] = update.domain.value
    if update.type is not None:
        update_dict["type"] = update.type.value
    if update.status is not None:
        update_dict["status"] = update.status.value
    if update.severity_default is not None:
        update_dict["severity_default"] = update.severity_default.value
    if update.description is not None:
        update_dict["description"] = update.description
    if update.canonical_rules is not None:
        update_dict["canonical_rules"] = update.canonical_rules
    if update.signals is not None:
        update_dict["signals"] = [
            {"key": s.key, "label": s.label, "description": s.description, "weight": s.weight}
            for s in update.signals
        ]
    if update.actions is not None:
        update_dict["actions"] = [
            {"key": a.key, "label": a.label, "description": a.description}
            for a in update.actions
        ]
    if update.ui is not None:
        update_dict["ui"] = {
            "visible": update.ui.visible,
            "color_hint": update.ui.color_hint,
            "icon": update.ui.icon
        }
    if update.linked is not None:
        update_dict["linked"] = {
            "module_key": update.linked.module_key,
            "discovery_ids": update.linked.discovery_ids,
            "related_detector_ids": update.linked.related_detector_ids
        }
    
    await db.founder_ops_detectors.update_one({"id": detector_id}, {"$set": update_dict})
    
    updated = await db.founder_ops_detectors.find_one({"id": detector_id}, {"_id": 0})
    return success_response(updated)


@router.delete("/detectors/{detector_id}")
async def delete_detector(
    detector_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete detector (super_admin only)"""
    require_super_admin(current_user)
    
    result = await db.founder_ops_detectors.delete_one({"id": detector_id})
    
    if result.deleted_count == 0:
        error_response("NOT_FOUND", "Detector not found", status_code=404)
    
    return success_response({"deleted": True, "id": detector_id})


# =====================
# DOCUMENTS ENDPOINTS
# =====================

# Storage configuration
DOCS_STORAGE_PATH = "/app/data/founder_docs"


def safe_filename(filename: str) -> str:
    """Generate safe filename from original"""
    # Remove path components and keep only filename
    filename = os.path.basename(filename)
    # Replace spaces and special chars
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    return filename


def compute_sha256(file_path: str) -> str:
    """Compute SHA256 hash of file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


@router.get("/documents")
async def get_documents(
    doc_type: Optional[str] = None,
    tag: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get documents (super_admin only)"""
    require_super_admin(current_user)
    
    query = {}
    if doc_type:
        query["doc_type"] = doc_type
    if tag:
        query["tags"] = tag
    
    cursor = db.founder_ops_documents.find(query, {"_id": 0}).sort("audit.created_at", -1)
    docs = await cursor.to_list(length=500)
    
    return success_response(docs)


@router.get("/documents/{doc_id}")
async def get_document(
    doc_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get single document metadata (super_admin only)"""
    require_super_admin(current_user)
    
    doc = await db.founder_ops_documents.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        error_response("NOT_FOUND", "Document not found", status_code=404)
    
    return success_response(doc)


@router.post("/documents", status_code=201)
async def create_document(
    title: str = Form(...),
    description: str = Form(""),
    doc_type: str = Form("Other"),
    tags: str = Form(""),  # comma-separated
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload document with file (super_admin only)"""
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    doc_id = str(uuid.uuid4())
    
    # Parse tags
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    
    # Generate safe storage path
    original_filename = file.filename or "document"
    safe_name = safe_filename(original_filename)
    storage_filename = f"{doc_id}_{safe_name}"
    storage_path = os.path.join(DOCS_STORAGE_PATH, storage_filename)
    
    # Ensure storage directory exists
    os.makedirs(DOCS_STORAGE_PATH, exist_ok=True)
    
    # Save file
    try:
        contents = await file.read()
        with open(storage_path, "wb") as f:
            f.write(contents)
        
        # Compute hash
        sha256 = compute_sha256(storage_path)
        size_bytes = os.path.getsize(storage_path)
        
    except Exception as e:
        error_response("UPLOAD_FAILED", f"Failed to save file: {str(e)}", status_code=500)
    
    # Create document record
    new_doc = {
        "id": doc_id,
        "title": title,
        "description": description,
        "doc_type": doc_type,
        "tags": tag_list,
        "filename": original_filename,
        "content_type": file.content_type or "application/octet-stream",
        "size_bytes": size_bytes,
        "storage_path": storage_path,
        "sha256": sha256,
        "audit": {
            "created_at": now,
            "updated_at": now
        }
    }
    
    await db.founder_ops_documents.insert_one(new_doc)
    new_doc.pop("_id", None)
    
    return success_response(new_doc)


@router.patch("/documents/{doc_id}")
async def update_document(
    doc_id: str,
    update: DocumentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update document metadata (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.founder_ops_documents.find_one({"id": doc_id})
    if not existing:
        error_response("NOT_FOUND", "Document not found", status_code=404)
    
    update_dict = {"audit.updated_at": datetime.now(timezone.utc)}
    
    if update.title is not None:
        update_dict["title"] = update.title
    if update.description is not None:
        update_dict["description"] = update.description
    if update.doc_type is not None:
        update_dict["doc_type"] = update.doc_type.value
    if update.tags is not None:
        update_dict["tags"] = update.tags
    
    await db.founder_ops_documents.update_one({"id": doc_id}, {"$set": update_dict})
    
    updated = await db.founder_ops_documents.find_one({"id": doc_id}, {"_id": 0})
    return success_response(updated)


@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Download document file (super_admin only)"""
    require_super_admin(current_user)
    
    doc = await db.founder_ops_documents.find_one({"id": doc_id})
    if not doc:
        error_response("NOT_FOUND", "Document not found", status_code=404)
    
    storage_path = doc.get("storage_path")
    if not storage_path or not os.path.exists(storage_path):
        error_response("FILE_NOT_FOUND", "Document file not found on server", status_code=404)
    
    # Verify integrity
    current_hash = compute_sha256(storage_path)
    if current_hash != doc.get("sha256"):
        error_response("INTEGRITY_ERROR", "Document file has been modified", status_code=500)
    
    return FileResponse(
        path=storage_path,
        filename=doc.get("filename", "document"),
        media_type=doc.get("content_type", "application/octet-stream")
    )


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete document and file (super_admin only)"""
    require_super_admin(current_user)
    
    doc = await db.founder_ops_documents.find_one({"id": doc_id})
    if not doc:
        error_response("NOT_FOUND", "Document not found", status_code=404)
    
    # Delete file from storage
    storage_path = doc.get("storage_path")
    if storage_path and os.path.exists(storage_path):
        try:
            os.remove(storage_path)
        except Exception:
            pass  # File might already be deleted
    
    # Delete from database
    await db.founder_ops_documents.delete_one({"id": doc_id})
    
    return success_response({"deleted": True, "id": doc_id})
    if update.external_url is not None:
        update_dict["external_url"] = update.external_url
    if update.internal_path is not None:
        update_dict["internal_path"] = update.internal_path
    
    await db.founder_documents.update_one({"id": doc_id}, {"$set": update_dict})
    
    updated = await db.founder_documents.find_one({"id": doc_id}, {"_id": 0})
    return success_response(updated)


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete document (super_admin only)"""
    require_super_admin(current_user)
    
    result = await db.founder_documents.delete_one({"id": doc_id})
    
    if result.deleted_count == 0:
        error_response("NOT_FOUND", "Document not found", status_code=404)
    
    return success_response({"deleted": True, "id": doc_id})
