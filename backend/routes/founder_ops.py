"""
Founder Ops Hub API Routes
- Ops Log CRUD
- Tasks CRUD  
- Documents CRUD + File Upload

Access: super_admin only (RBAC enforced)
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from db.connection import get_db
from models.founder_ops import (
    OpsLogEntryCreate, OpsLogEntryUpdate, OpsLogEntry,
    TaskCreate, TaskUpdate, Task,
    DocumentCreate, DocumentUpdate, Document
)
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/founder-ops", tags=["Founder Ops Hub"])


# =====================
# AUTH HELPER
# =====================

def require_super_admin(user: dict):
    """Verify user has super_admin role"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Support both 'role' (string) and 'roles' (array) formats
    is_super_admin = (
        user.get("role") == "super_admin" or
        "super_admin" in user.get("roles", [])
    )
    
    if not is_super_admin:
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    return user


# =====================
# OPS LOG ENDPOINTS
# =====================

@router.get("/ops-log", response_model=List[OpsLogEntry])
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
    
    return entries


@router.post("/ops-log", response_model=OpsLogEntry)
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
    
    # Remove MongoDB _id before returning
    new_entry.pop("_id", None)
    return new_entry


@router.put("/ops-log/{entry_id}", response_model=OpsLogEntry)
async def update_ops_log_entry(
    entry_id: str,
    update: OpsLogEntryUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update ops log entry (super_admin only)"""
    require_super_admin(current_user)
    
    # Find existing entry
    existing = await db.ops_log.find_one({"id": entry_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Build update dict
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
    
    # Return updated entry
    updated = await db.ops_log.find_one({"id": entry_id}, {"_id": 0})
    return updated


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
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return {"message": "Entry deleted", "id": entry_id}


# =====================
# TASKS ENDPOINTS
# =====================

@router.get("/tasks", response_model=List[Task])
async def get_tasks(
    column: Optional[str] = None,
    status: Optional[str] = None,
    owner: Optional[str] = None,
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
    if owner:
        query["owner"] = owner
    
    cursor = db.founder_tasks.find(query, {"_id": 0}).sort("created_at", -1)
    tasks = await cursor.to_list(length=500)
    
    return tasks


@router.post("/tasks", response_model=Task)
async def create_task(
    task: TaskCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create new task (super_admin only)"""
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    
    new_task = {
        "id": str(uuid.uuid4()),
        "title": task.title,
        "description": task.description,
        "column": task.column.value,
        "status": task.status.value,
        "owner": task.owner.value,
        "related_link": task.related_link,
        "created_at": now,
        "updated_at": None,
        "created_by": current_user.get("id") or current_user.get("email")
    }
    
    await db.founder_tasks.insert_one(new_task)
    new_task.pop("_id", None)
    
    return new_task


@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    update: TaskUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update task (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.founder_tasks.find_one({"id": task_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_dict = {"updated_at": datetime.now(timezone.utc)}
    
    if update.title is not None:
        update_dict["title"] = update.title
    if update.description is not None:
        update_dict["description"] = update.description
    if update.column is not None:
        update_dict["column"] = update.column.value
    if update.status is not None:
        update_dict["status"] = update.status.value
    if update.owner is not None:
        update_dict["owner"] = update.owner.value
    if update.related_link is not None:
        update_dict["related_link"] = update.related_link
    
    await db.founder_tasks.update_one({"id": task_id}, {"$set": update_dict})
    
    updated = await db.founder_tasks.find_one({"id": task_id}, {"_id": 0})
    return updated


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete task (super_admin only)"""
    require_super_admin(current_user)
    
    result = await db.founder_tasks.delete_one({"id": task_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted", "id": task_id}


# =====================
# DOCUMENTS ENDPOINTS
# =====================

@router.get("/documents", response_model=List[Document])
async def get_documents(
    doc_type: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get documents (super_admin only)"""
    require_super_admin(current_user)
    
    query = {}
    if doc_type:
        query["doc_type"] = doc_type
    
    cursor = db.founder_documents.find(query, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    
    return docs


@router.post("/documents", response_model=Document)
async def create_document(
    doc: DocumentCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create document reference (super_admin only)"""
    require_super_admin(current_user)
    
    now = datetime.now(timezone.utc)
    
    new_doc = {
        "id": str(uuid.uuid4()),
        "title": doc.title,
        "description": doc.description,
        "doc_type": doc.doc_type.value,
        "external_url": doc.external_url,
        "internal_path": doc.internal_path,
        "file_id": None,
        "file_name": None,
        "file_size": None,
        "created_at": now,
        "updated_at": None,
        "created_by": current_user.get("id") or current_user.get("email")
    }
    
    await db.founder_documents.insert_one(new_doc)
    new_doc.pop("_id", None)
    
    return new_doc


@router.put("/documents/{doc_id}", response_model=Document)
async def update_document(
    doc_id: str,
    update: DocumentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update document (super_admin only)"""
    require_super_admin(current_user)
    
    existing = await db.founder_documents.find_one({"id": doc_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_dict = {"updated_at": datetime.now(timezone.utc)}
    
    if update.title is not None:
        update_dict["title"] = update.title
    if update.description is not None:
        update_dict["description"] = update.description
    if update.doc_type is not None:
        update_dict["doc_type"] = update.doc_type.value
    if update.external_url is not None:
        update_dict["external_url"] = update.external_url
    if update.internal_path is not None:
        update_dict["internal_path"] = update.internal_path
    
    await db.founder_documents.update_one({"id": doc_id}, {"$set": update_dict})
    
    updated = await db.founder_documents.find_one({"id": doc_id}, {"_id": 0})
    return updated


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
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document deleted", "id": doc_id}
