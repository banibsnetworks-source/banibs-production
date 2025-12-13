"""
Book Vault - API Routes

Admin-only module for managing books, chapters, content blocks,
and scripture anchors with version history.

SECURITY: Restricted to super_admin/admin/founder only.
"""

import logging
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import PlainTextResponse

from db.connection import get_db
from middleware.auth_guard import get_current_user, require_role
from models.book_vault import (
    Book, BookCreate, BookStatus, BookSeries,
    Chapter, ChapterCreate, ChapterStatus,
    ContentBlock, ContentBlockCreate, BlockType,
    ScriptureAnchor, ScriptureAnchorCreate,
    ExportRequest, ExportFormat
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/book-vault", tags=["Book Vault"])


# =============================================================================
# BOOKS
# =============================================================================

@router.get("/books", response_model=dict)
async def list_books(
    series: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """List all books with optional filtering"""
    query = {"is_deleted": False}
    
    if series:
        query["series"] = series
    if status:
        query["status"] = status
    
    cursor = db.vault_books.find(query, {"_id": 0}).sort([("series", 1), ("book_number", 1)])
    books = await cursor.to_list(length=500)
    
    # Filter by search if provided
    if search:
        search_lower = search.lower()
        books = [b for b in books if search_lower in b.get("title", "").lower() 
                 or search_lower in b.get("subtitle", "").lower()
                 or search_lower in b.get("description", "").lower()]
    
    return {"books": books, "total": len(books)}


@router.post("/books", response_model=dict)
async def create_book(
    data: BookCreate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Create a new book"""
    book = Book(
        id=str(uuid4()),
        series=data.series,
        book_number=data.book_number,
        title=data.title,
        subtitle=data.subtitle,
        status=data.status,
        description=data.description,
        tags=data.tags,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=current_user["id"]
    )
    
    await db.vault_books.insert_one(book.dict())
    logger.info(f"Book created: {book.id} - {book.title}")
    
    return {"success": True, "book": book.dict()}


@router.get("/books/{book_id}", response_model=dict)
async def get_book(
    book_id: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Get a single book with its chapters"""
    book = await db.vault_books.find_one({"id": book_id, "is_deleted": False}, {"_id": 0})
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get chapters
    chapters = await db.vault_chapters.find(
        {"book_id": book_id, "is_deleted": False}, {"_id": 0}
    ).sort("order_index", 1).to_list(length=500)
    
    # Get block count
    block_count = await db.vault_blocks.count_documents({"book_id": book_id, "is_deleted": False})
    
    # Get scripture count
    scripture_count = await db.vault_scriptures.count_documents({"book_id": book_id, "is_deleted": False})
    
    return {
        "book": book,
        "chapters": chapters,
        "block_count": block_count,
        "scripture_count": scripture_count
    }


@router.patch("/books/{book_id}", response_model=dict)
async def update_book(
    book_id: str,
    updates: dict,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Update a book"""
    allowed = ["title", "subtitle", "status", "description", "tags", "series", "book_number"]
    update_dict = {k: v for k, v in updates.items() if k in allowed}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.vault_books.update_one(
        {"id": book_id, "is_deleted": False},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return {"success": True, "updated_fields": list(update_dict.keys())}


@router.delete("/books/{book_id}", response_model=dict)
async def delete_book(
    book_id: str,
    current_user = Depends(require_role("super_admin", "founder")),
    db = Depends(get_db)
):
    """Soft delete a book"""
    result = await db.vault_books.update_one(
        {"id": book_id},
        {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    
    logger.warning(f"Book soft-deleted: {book_id} by {current_user['id']}")
    return {"success": True, "message": "Book deleted"}


# =============================================================================
# CHAPTERS
# =============================================================================

@router.get("/books/{book_id}/chapters", response_model=dict)
async def list_chapters(
    book_id: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """List chapters for a book"""
    chapters = await db.vault_chapters.find(
        {"book_id": book_id, "is_deleted": False}, {"_id": 0}
    ).sort("order_index", 1).to_list(length=500)
    
    return {"chapters": chapters, "total": len(chapters)}


@router.post("/chapters", response_model=dict)
async def create_chapter(
    data: ChapterCreate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Create a new chapter"""
    chapter = Chapter(
        id=str(uuid4()),
        book_id=data.book_id,
        chapter_number=data.chapter_number,
        title=data.title,
        status=data.status,
        summary=data.summary,
        order_index=data.order_index
    )
    
    await db.vault_chapters.insert_one(chapter.dict())
    
    return {"success": True, "chapter": chapter.dict()}


@router.patch("/chapters/{chapter_id}", response_model=dict)
async def update_chapter(
    chapter_id: str,
    updates: dict,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Update a chapter"""
    chapter = await db.vault_chapters.find_one({"id": chapter_id})
    
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    if chapter.get("status") == "locked":
        raise HTTPException(status_code=400, detail="Cannot edit locked chapter. Create new version.")
    
    allowed = ["title", "summary", "status", "order_index", "chapter_number"]
    update_dict = {k: v for k, v in updates.items() if k in allowed}
    update_dict["updated_at"] = datetime.utcnow()
    
    await db.vault_chapters.update_one({"id": chapter_id}, {"$set": update_dict})
    
    return {"success": True}


# =============================================================================
# CONTENT BLOCKS (Pull-Down Units)
# =============================================================================

@router.get("/blocks", response_model=dict)
async def list_blocks(
    book_id: Optional[str] = Query(None),
    chapter_id: Optional[str] = Query(None),
    block_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    include_versions: bool = Query(False),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """List content blocks with filtering"""
    query = {"is_deleted": False}
    
    if book_id:
        query["book_id"] = book_id
    if chapter_id:
        query["chapter_id"] = chapter_id
    if block_type:
        query["block_type"] = block_type
    
    # If not including versions, only get latest (no parent)
    if not include_versions:
        query["parent_version_id"] = None
    
    cursor = db.vault_blocks.find(query, {"_id": 0}).sort("created_at", -1)
    blocks = await cursor.to_list(length=1000)
    
    # Filter by search
    if search:
        search_lower = search.lower()
        blocks = [b for b in blocks if 
                  search_lower in b.get("title", "").lower() or
                  search_lower in b.get("content", "").lower() or
                  any(search_lower in tag.lower() for tag in b.get("tags", []))]
    
    return {"blocks": blocks, "total": len(blocks)}


@router.post("/blocks", response_model=dict)
async def create_block(
    data: ContentBlockCreate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Create a new content block"""
    block = ContentBlock(
        id=str(uuid4()),
        book_id=data.book_id,
        chapter_id=data.chapter_id,
        block_type=data.block_type,
        title=data.title,
        content=data.content,
        tags=data.tags,
        version=1,
        parent_version_id=None,
        created_by=current_user["id"]
    )
    
    await db.vault_blocks.insert_one(block.dict())
    
    return {"success": True, "block": block.dict()}


@router.get("/blocks/{block_id}", response_model=dict)
async def get_block(
    block_id: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Get a block with its version history"""
    block = await db.vault_blocks.find_one({"id": block_id, "is_deleted": False}, {"_id": 0})
    
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    
    # Get version history (blocks that have this as parent)
    versions = await db.vault_blocks.find(
        {"parent_version_id": block_id, "is_deleted": False}, {"_id": 0}
    ).sort("version", -1).to_list(length=100)
    
    # Also get parent versions
    parent_chain = []
    current_parent = block.get("parent_version_id")
    while current_parent:
        parent = await db.vault_blocks.find_one({"id": current_parent}, {"_id": 0})
        if parent:
            parent_chain.append(parent)
            current_parent = parent.get("parent_version_id")
        else:
            break
    
    return {
        "block": block,
        "newer_versions": versions,
        "older_versions": parent_chain
    }


@router.post("/blocks/{block_id}/new-version", response_model=dict)
async def create_block_version(
    block_id: str,
    data: dict,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """
    Create a new version of a block.
    Rule: Edits always create new versions, never overwrite.
    """
    original = await db.vault_blocks.find_one({"id": block_id, "is_deleted": False})
    
    if not original:
        raise HTTPException(status_code=404, detail="Block not found")
    
    if original.get("is_locked"):
        raise HTTPException(status_code=400, detail="Block is locked. Cannot create new version.")
    
    new_version = ContentBlock(
        id=str(uuid4()),
        book_id=original.get("book_id"),
        chapter_id=original.get("chapter_id"),
        block_type=original.get("block_type"),
        title=data.get("title", original.get("title")),
        content=data.get("content", original.get("content")),
        tags=data.get("tags", original.get("tags", [])),
        version=original.get("version", 1) + 1,
        parent_version_id=block_id,
        created_by=current_user["id"]
    )
    
    await db.vault_blocks.insert_one(new_version.dict())
    
    logger.info(f"New version created for block {block_id}: v{new_version.version}")
    
    return {"success": True, "block": new_version.dict()}


@router.post("/blocks/{block_id}/lock", response_model=dict)
async def lock_block(
    block_id: str,
    current_user = Depends(require_role("super_admin", "founder")),
    db = Depends(get_db)
):
    """Lock a block to prevent further edits"""
    result = await db.vault_blocks.update_one(
        {"id": block_id, "is_deleted": False},
        {"$set": {"is_locked": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    
    return {"success": True, "message": "Block locked"}


# =============================================================================
# SCRIPTURE ANCHORS
# =============================================================================

@router.get("/scriptures", response_model=dict)
async def list_scriptures(
    book_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """List scripture anchors"""
    query = {"is_deleted": False}
    
    if book_id:
        query["book_id"] = book_id
    
    cursor = db.vault_scriptures.find(query, {"_id": 0})
    scriptures = await cursor.to_list(length=1000)
    
    if search:
        search_lower = search.lower()
        scriptures = [s for s in scriptures if
                      search_lower in s.get("reference", "").lower() or
                      search_lower in s.get("note", "").lower() or
                      search_lower in s.get("excerpt", "").lower()]
    
    return {"scriptures": scriptures, "total": len(scriptures)}


@router.post("/scriptures", response_model=dict)
async def create_scripture(
    data: ScriptureAnchorCreate,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Create a scripture anchor"""
    scripture = ScriptureAnchor(
        id=str(uuid4()),
        book_id=data.book_id,
        chapter_id=data.chapter_id,
        reference=data.reference,
        translation=data.translation,
        excerpt=data.excerpt,
        note=data.note,
        tags=data.tags
    )
    
    await db.vault_scriptures.insert_one(scripture.dict())
    
    return {"success": True, "scripture": scripture.dict()}


# =============================================================================
# SEARCH (Global)
# =============================================================================

@router.get("/search", response_model=dict)
async def global_search(
    q: str = Query(..., min_length=2),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Search across books, blocks, and scriptures"""
    q_lower = q.lower()
    
    # Search books
    books = await db.vault_books.find({"is_deleted": False}, {"_id": 0}).to_list(1000)
    matching_books = [b for b in books if q_lower in b.get("title", "").lower() 
                      or q_lower in str(b.get("description", "")).lower()]
    
    # Search blocks
    blocks = await db.vault_blocks.find({"is_deleted": False, "parent_version_id": None}, {"_id": 0}).to_list(1000)
    matching_blocks = [b for b in blocks if q_lower in b.get("title", "").lower() 
                       or q_lower in b.get("content", "").lower()
                       or any(q_lower in t.lower() for t in b.get("tags", []))]
    
    # Search scriptures
    scriptures = await db.vault_scriptures.find({"is_deleted": False}, {"_id": 0}).to_list(1000)
    matching_scriptures = [s for s in scriptures if q_lower in s.get("reference", "").lower() 
                           or q_lower in str(s.get("note", "")).lower()]
    
    return {
        "query": q,
        "books": matching_books[:20],
        "blocks": matching_blocks[:50],
        "scriptures": matching_scriptures[:30]
    }


# =============================================================================
# EXPORT
# =============================================================================

@router.get("/books/{book_id}/export")
async def export_book(
    book_id: str,
    format: str = Query("markdown"),
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Export a book as Markdown"""
    book = await db.vault_books.find_one({"id": book_id, "is_deleted": False}, {"_id": 0})
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    chapters = await db.vault_chapters.find(
        {"book_id": book_id, "is_deleted": False}, {"_id": 0}
    ).sort("order_index", 1).to_list(500)
    
    blocks = await db.vault_blocks.find(
        {"book_id": book_id, "is_deleted": False, "parent_version_id": None}, {"_id": 0}
    ).to_list(1000)
    
    scriptures = await db.vault_scriptures.find(
        {"book_id": book_id, "is_deleted": False}, {"_id": 0}
    ).to_list(500)
    
    # Build Markdown
    md = f"# {book['title']}\n\n"
    
    if book.get("subtitle"):
        md += f"*{book['subtitle']}*\n\n"
    
    if book.get("description"):
        md += f"{book['description']}\n\n"
    
    md += f"**Series:** {book.get('series', 'N/A')}\n"
    md += f"**Status:** {book.get('status', 'N/A')}\n\n"
    md += "---\n\n"
    
    # Chapters
    if chapters:
        md += "## Chapters\n\n"
        for ch in chapters:
            md += f"### Chapter {ch['chapter_number']}: {ch['title']}\n\n"
            if ch.get("summary"):
                md += f"{ch['summary']}\n\n"
            
            # Get blocks for this chapter
            ch_blocks = [b for b in blocks if b.get("chapter_id") == ch["id"]]
            for block in ch_blocks:
                md += f"#### [{block['block_type'].upper()}] {block['title']}\n\n"
                md += f"{block['content']}\n\n"
    
    # Unassigned blocks
    unassigned = [b for b in blocks if not b.get("chapter_id")]
    if unassigned:
        md += "## Content Blocks (Unassigned)\n\n"
        for block in unassigned:
            md += f"### [{block['block_type'].upper()}] {block['title']}\n\n"
            md += f"{block['content']}\n\n"
    
    # Scriptures
    if scriptures:
        md += "## Scripture Anchors\n\n"
        for s in scriptures:
            md += f"**{s['reference']}** ({s.get('translation', 'KJV')})\n"
            if s.get("excerpt"):
                md += f"> {s['excerpt']}\n"
            if s.get("note"):
                md += f"*Note: {s['note']}*\n"
            md += "\n"
    
    md += f"\n---\n*Exported from BANIBS Book Vault*\n"
    
    return PlainTextResponse(content=md, media_type="text/markdown")


@router.get("/blocks/{block_id}/export")
async def export_block(
    block_id: str,
    current_user = Depends(require_role("super_admin", "admin", "founder")),
    db = Depends(get_db)
):
    """Export a single block as Markdown"""
    block = await db.vault_blocks.find_one({"id": block_id, "is_deleted": False}, {"_id": 0})
    
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    
    md = f"# {block['title']}\n\n"
    md += f"**Type:** {block['block_type']}\n"
    md += f"**Version:** {block.get('version', 1)}\n"
    if block.get("tags"):
        md += f"**Tags:** {', '.join(block['tags'])}\n"
    md += "\n---\n\n"
    md += block['content']
    md += f"\n\n---\n*Exported from BANIBS Book Vault*\n"
    
    return PlainTextResponse(content=md, media_type="text/markdown")


# =============================================================================
# SEED INITIAL BOOKS
# =============================================================================

@router.post("/seed", response_model=dict)
async def seed_initial_books(
    current_user = Depends(require_role("super_admin", "founder")),
    db = Depends(get_db)
):
    """Seed the canonical book registry"""
    
    # Check if already seeded
    existing = await db.vault_books.count_documents({})
    if existing > 0:
        return {"success": False, "message": "Books already exist. Seed skipped."}
    
    seed_books = [
        Book(
            id=str(uuid4()),
            series=BookSeries.D_SERIES,
            book_number=1,
            title="The Devil's Dismissive Argument",
            subtitle="How Society Blocks Truth, Accountability, and Growth",
            status=BookStatus.PUBLISHED,
            description="The foundational revelation on recognition of dismissive patterns.",
            tags=["D-Series", "Core", "Published"],
            created_by=current_user["id"]
        ),
        Book(
            id=str(uuid4()),
            series=BookSeries.D_SERIES,
            book_number=2,
            title="The Devil's Deceitful Master Plan",
            subtitle=None,
            status=BookStatus.PLANNED,
            description="The second revelation in the D-Series.",
            tags=["D-Series", "Planned"],
            created_by=current_user["id"]
        ),
        Book(
            id=str(uuid4()),
            series=BookSeries.G_SERIES,
            book_number=1,
            title="The Light God Wants You to See",
            subtitle="(Subtitle locked)",
            status=BookStatus.PLANNED,
            description="The first book in the G-Series.",
            tags=["G-Series", "Planned"],
            created_by=current_user["id"]
        ),
        Book(
            id=str(uuid4()),
            series=BookSeries.COMPANION,
            book_number=None,
            title="Before You Call It Out",
            subtitle="A Companion Reflection",
            status=BookStatus.DRAFTING,
            description="Explores when speaking helps — and when it hardens everything.",
            tags=["Companion", "In Development"],
            created_by=current_user["id"]
        )
    ]
    
    for book in seed_books:
        await db.vault_books.insert_one(book.dict())
    
    logger.info(f"Seeded {len(seed_books)} initial books")
    
    return {"success": True, "message": f"Seeded {len(seed_books)} books"}
