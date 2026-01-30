"""
Founder Office Vault API Routes
Phase 2 - UI Integration

All endpoints require super_admin role.
Filesystem at /opt/banibs-office/ is source of truth.
UI is just a window - no schema invention.
"""

import os
import json
import glob
import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

# Import auth dependencies
from middleware.auth_guard import get_current_user
from routes.founder_ops import require_super_admin

router = APIRouter(prefix="/api/office", tags=["Office Vault"])

# Configuration
OFFICE_ROOT = "/opt/banibs-office"
INDEX_PATH = os.path.join(OFFICE_ROOT, "index.json")
ITEMS_PATH = os.path.join(OFFICE_ROOT, "items")
INBOX_PATH = os.path.join(OFFICE_ROOT, "inbox")

# Valid item types
ITEM_TYPES = [
    "discoveries", "inventions", "contacts", "projects", "tasks",
    "books", "glossary", "mechanisms", "scripts", "detectors", "policies", "ops"
]


# Response models
class VaultStats(BaseModel):
    total_items: int
    by_type: dict
    by_status: dict
    by_confidentiality: dict


class VaultIndexResponse(BaseModel):
    success: bool
    stats: VaultStats
    last_updated: Optional[str] = None


class VaultItemSummary(BaseModel):
    id: str
    type: str
    title: str
    status: str
    confidentiality: str
    version: int
    tags: List[str] = []
    created_at: Optional[str] = None
    filepath: Optional[str] = None


class VaultItemsResponse(BaseModel):
    success: bool
    items: List[VaultItemSummary]
    total: int
    filtered: int


class VaultItemDetail(BaseModel):
    id: str
    type: str
    title: str
    status: str
    confidentiality: str
    version: int
    tags: List[str] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    source_thread: Optional[str] = None
    source_date: Optional[str] = None
    supersedes: Optional[str] = None
    hash_sha256: Optional[str] = None
    # Content fields - conditionally included based on confidentiality
    summary: Optional[str] = None
    body: Optional[str] = None
    # Contact-specific fields
    data: Optional[dict] = None


class VaultItemDetailResponse(BaseModel):
    success: bool
    item: Optional[VaultItemDetail] = None
    message: Optional[str] = None


class IngestResult(BaseModel):
    processed: int
    inserted: int
    versioned: int
    skipped: int
    errors: int


class IngestResponse(BaseModel):
    success: bool
    result: Optional[IngestResult] = None
    message: Optional[str] = None


def load_index() -> dict:
    """Load the index.json registry."""
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, 'r') as f:
            return json.load(f)
    return {
        "meta": {},
        "stats": {
            "total_items": 0,
            "by_type": {},
            "by_status": {"LOCKED": 0, "DRAFT": 0},
            "by_confidentiality": {"PUBLIC": 0, "PRIVATE": 0}
        },
        "items": {}
    }


def parse_markdown_frontmatter(filepath: str) -> dict:
    """Parse YAML frontmatter from markdown file."""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        if not content.startswith('---'):
            return {}
        
        parts = content.split('---', 2)
        if len(parts) < 3:
            return {}
        
        frontmatter = parts[1].strip()
        body = parts[2].strip()
        
        # Simple YAML parsing (key: value or key: [list])
        result = {"_body": body}
        for line in frontmatter.split('\n'):
            line = line.strip()
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                # Handle quoted strings
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                # Handle arrays
                elif value.startswith('[') and value.endswith(']'):
                    try:
                        value = json.loads(value)
                    except:
                        pass
                # Handle null
                elif value.lower() == 'null':
                    value = None
                # Handle numbers
                elif value.isdigit():
                    value = int(value)
                
                result[key] = value
        
        return result
    except Exception as e:
        return {"_error": str(e)}


def get_summary_from_body(body: str, max_length: int = 200) -> str:
    """Extract a summary from body content."""
    if not body:
        return ""
    
    # Remove markdown headers
    lines = body.split('\n')
    content_lines = []
    for line in lines:
        if not line.startswith('#') and line.strip():
            content_lines.append(line.strip())
    
    summary = ' '.join(content_lines)
    if len(summary) > max_length:
        summary = summary[:max_length] + "..."
    
    return summary


@router.get("/stats", response_model=VaultIndexResponse)
async def get_vault_stats(current_user: dict = Depends(get_current_user)):
    """Get vault statistics from index."""
    require_super_admin(current_user)
    index = load_index()
    
    return VaultIndexResponse(
        success=True,
        stats=VaultStats(
            total_items=index.get("stats", {}).get("total_items", 0),
            by_type=index.get("stats", {}).get("by_type", {}),
            by_status=index.get("stats", {}).get("by_status", {}),
            by_confidentiality=index.get("stats", {}).get("by_confidentiality", {})
        ),
        last_updated=index.get("meta", {}).get("last_updated")
    )


@router.get("/items", response_model=VaultItemsResponse)
async def list_vault_items(
    item_type: Optional[str] = Query(None, description="Filter by item type"),
    status: Optional[str] = Query(None, description="Filter by status (LOCKED/DRAFT)"),
    confidentiality: Optional[str] = Query(None, description="Filter by confidentiality (PUBLIC/PRIVATE)"),
    search: Optional[str] = Query(None, description="Search in title"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """List vault items with filtering."""
    require_super_admin(current_user)
    index = load_index()
    
    all_items = []
    
    # Determine which types to search
    types_to_search = [item_type] if item_type and item_type in ITEM_TYPES else ITEM_TYPES
    
    for t in types_to_search:
        items = index.get("items", {}).get(t, [])
        for item in items:
            # Map type name correctly
            type_mapping = {
                "discoveries": "DISCOVERY",
                "inventions": "INVENTION",
                "contacts": "CONTACT",
                "projects": "PROJECT",
                "tasks": "TASK",
                "books": "BOOK",
                "glossary": "GLOSSARY",
                "mechanisms": "MECHANISM",
                "scripts": "SCRIPT",
                "detectors": "DETECTOR",
                "policies": "POLICY",
                "ops": "OPS"
            }
            all_items.append({**item, "type": type_mapping.get(t, t.upper())})
    
    # Apply filters
    filtered = all_items
    
    if status:
        filtered = [i for i in filtered if i.get("status", "").upper() == status.upper()]
    
    if confidentiality:
        filtered = [i for i in filtered if i.get("confidentiality", "PRIVATE").upper() == confidentiality.upper()]
    
    if search:
        search_lower = search.lower()
        filtered = [i for i in filtered if search_lower in i.get("title", "").lower()]
    
    # Sort by created_at descending
    filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    total = len(all_items)
    filtered_count = len(filtered)
    
    # Apply pagination
    paginated = filtered[offset:offset + limit]
    
    # Convert to response model
    items_response = []
    for item in paginated:
        items_response.append(VaultItemSummary(
            id=item.get("id", ""),
            type=item.get("type", ""),
            title=item.get("title", ""),
            status=item.get("status", "DRAFT"),
            confidentiality=item.get("confidentiality", "PRIVATE"),
            version=item.get("version", 1),
            tags=item.get("tags", []),
            created_at=item.get("created_at"),
            filepath=item.get("filepath")
        ))
    
    return VaultItemsResponse(
        success=True,
        items=items_response,
        total=total,
        filtered=filtered_count
    )


@router.get("/items/{item_id}", response_model=VaultItemDetailResponse)
async def get_vault_item(
    item_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single vault item by ID."""
    require_super_admin(current_user)
    index = load_index()
    
    # Find item in index
    found_item = None
    item_type = None
    
    for t, items in index.get("items", {}).items():
        for item in items:
            if item.get("id") == item_id:
                found_item = item
                item_type = t
                break
        if found_item:
            break
    
    if not found_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    filepath = found_item.get("filepath")
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Item file not found")
    
    # Parse content based on file type
    confidentiality = found_item.get("confidentiality", "PRIVATE")
    
    if filepath.endswith('.json'):
        # Contact or JSON item
        with open(filepath, 'r') as f:
            content = json.load(f)
        
        return VaultItemDetailResponse(
            success=True,
            item=VaultItemDetail(
                id=content.get("id", item_id),
                type="CONTACT",
                title=content.get("name", content.get("title", "")),
                status=content.get("status", "DRAFT"),
                confidentiality=content.get("confidentiality", "PRIVATE"),
                version=content.get("version", 1),
                tags=content.get("tags", []),
                created_at=content.get("created_at"),
                updated_at=content.get("updated_at"),
                source_thread=content.get("source_thread"),
                source_date=content.get("source_date"),
                supersedes=content.get("supersedes"),
                hash_sha256=content.get("hash_sha256"),
                data=content.get("data")
            )
        )
    else:
        # Markdown item
        parsed = parse_markdown_frontmatter(filepath)
        body = parsed.get("_body", "")
        
        # Map type name correctly
        type_mapping = {
            "discoveries": "DISCOVERY",
            "inventions": "INVENTION",
            "contacts": "CONTACT",
            "projects": "PROJECT",
            "tasks": "TASK",
            "books": "BOOK",
            "glossary": "GLOSSARY",
            "mechanisms": "MECHANISM",
            "scripts": "SCRIPT",
            "detectors": "DETECTOR",
            "policies": "POLICY",
            "ops": "OPS"
        }
        type_name = type_mapping.get(item_type, item_type.upper())
        
        # For PRIVATE inventions, only show summary
        is_invention = item_type == "inventions"
        is_private = confidentiality == "PRIVATE"
        
        # Determine what content to show
        show_body = not (is_invention and is_private)
        summary = get_summary_from_body(body) if not show_body else None
        
        return VaultItemDetailResponse(
            success=True,
            item=VaultItemDetail(
                id=parsed.get("id", item_id),
                type=type_name,
                title=parsed.get("title", ""),
                status=parsed.get("status", "DRAFT"),
                confidentiality=parsed.get("confidentiality", "PRIVATE"),
                version=parsed.get("version", 1),
                tags=parsed.get("tags", []),
                created_at=parsed.get("created_at"),
                updated_at=parsed.get("updated_at"),
                source_thread=parsed.get("source_thread"),
                source_date=parsed.get("source_date"),
                supersedes=parsed.get("supersedes"),
                hash_sha256=parsed.get("hash_sha256"),
                summary=summary if is_invention and is_private else None,
                body=body if show_body else None
            ),
            message="Implementation details hidden (PRIVATE invention)" if is_invention and is_private else None
        )


@router.post("/ingest", response_model=IngestResponse)
async def trigger_ingest(
    current_user: dict = Depends(get_current_user)
):
    """Trigger inbox ingestion process."""
    require_super_admin(current_user)
    import subprocess
    
    ingest_script = os.path.join(OFFICE_ROOT, "office_ingest")
    
    if not os.path.exists(ingest_script):
        raise HTTPException(status_code=500, detail="Ingest script not found")
    
    # Check for files in inbox
    inbox_files = glob.glob(os.path.join(INBOX_PATH, "*.json"))
    if not inbox_files:
        return IngestResponse(
            success=True,
            result=IngestResult(processed=0, inserted=0, versioned=0, skipped=0, errors=0),
            message="No files in inbox to process"
        )
    
    try:
        result = subprocess.run(
            ["python3", ingest_script],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Parse output for summary
        output = result.stdout
        
        # Extract numbers from output
        processed = 0
        inserted = 0
        versioned = 0
        skipped = 0
        errors = 0
        
        for line in output.split('\n'):
            if 'Processed:' in line:
                processed = int(re.search(r'(\d+)', line).group(1))
            elif 'Inserted:' in line:
                inserted = int(re.search(r'(\d+)', line).group(1))
            elif 'Versioned:' in line:
                versioned = int(re.search(r'(\d+)', line).group(1))
            elif 'Skipped:' in line:
                skipped = int(re.search(r'(\d+)', line).group(1))
            elif 'Errors:' in line:
                errors = int(re.search(r'(\d+)', line).group(1))
        
        return IngestResponse(
            success=True,
            result=IngestResult(
                processed=processed,
                inserted=inserted,
                versioned=versioned,
                skipped=skipped,
                errors=errors
            ),
            message=f"Ingestion complete. Processed {len(inbox_files)} file(s)."
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Ingest process timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingest failed: {str(e)}")


@router.get("/types")
async def get_item_types(current_user: dict = Depends(get_current_user)):
    """Get available item types."""
    require_super_admin(current_user)
    return {
        "success": True,
        "types": ITEM_TYPES
    }
