"""
BANIBS Book Vault Studio API
Founder-only book authoring system

v1 Features:
- Create/edit/delete books
- Chapter-based writing
- Autosave drafts
- Optional cover upload

Access: super_admin only
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from db.mongodb import get_db
from routes.auth import get_current_user

router = APIRouter(prefix="/api/book-vault", tags=["Book Vault"])

# ============== Pydantic Models ==============

class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    cover_url: Optional[str] = None

class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    cover_url: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(draft|archived)$")

class ChapterCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = ""

class ChapterUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    order: Optional[int] = None

class ChapterAutosave(BaseModel):
    content: str

# ============== Helper Functions ==============

def require_super_admin(current_user: dict = Depends(get_current_user)):
    """Ensure user is super_admin"""
    if current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied. Founder-only feature.")
    return current_user

def serialize_book(book: dict) -> dict:
    """Serialize book document for JSON response"""
    return {
        "id": str(book["_id"]),
        "title": book.get("title", ""),
        "description": book.get("description", ""),
        "cover_url": book.get("cover_url"),
        "author_id": str(book.get("author_id", "")),
        "status": book.get("status", "draft"),
        "chapter_count": book.get("chapter_count", 0),
        "word_count": book.get("word_count", 0),
        "created_at": book.get("created_at", "").isoformat() if book.get("created_at") else None,
        "updated_at": book.get("updated_at", "").isoformat() if book.get("updated_at") else None,
    }

def serialize_chapter(chapter: dict) -> dict:
    """Serialize chapter document for JSON response"""
    return {
        "id": str(chapter["_id"]),
        "book_id": str(chapter.get("book_id", "")),
        "title": chapter.get("title", ""),
        "content": chapter.get("content", ""),
        "order": chapter.get("order", 0),
        "word_count": len(chapter.get("content", "").split()),
        "created_at": chapter.get("created_at", "").isoformat() if chapter.get("created_at") else None,
        "updated_at": chapter.get("updated_at", "").isoformat() if chapter.get("updated_at") else None,
    }

# ============== Book Endpoints ==============

@router.get("/books")
async def list_books(current_user: dict = Depends(require_super_admin)):
    """List all books for the current user"""
    db = get_db()
    
    books = list(db.books.find(
        {"author_id": ObjectId(current_user["user_id"])}
    ).sort("updated_at", -1))
    
    # Add chapter counts
    for book in books:
        book["chapter_count"] = db.chapters.count_documents({"book_id": book["_id"]})
    
    return {
        "books": [serialize_book(b) for b in books],
        "total": len(books)
    }

@router.post("/books")
async def create_book(data: BookCreate, current_user: dict = Depends(require_super_admin)):
    """Create a new book"""
    db = get_db()
    
    now = datetime.now(timezone.utc)
    book = {
        "title": data.title,
        "description": data.description or "",
        "cover_url": data.cover_url,
        "author_id": ObjectId(current_user["user_id"]),
        "status": "draft",
        "word_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    
    result = db.books.insert_one(book)
    book["_id"] = result.inserted_id
    book["chapter_count"] = 0
    
    return {"book": serialize_book(book), "message": "Book created successfully"}

@router.get("/books/{book_id}")
async def get_book(book_id: str, current_user: dict = Depends(require_super_admin)):
    """Get a single book with its chapters"""
    db = get_db()
    
    try:
        book = db.books.find_one({
            "_id": ObjectId(book_id),
            "author_id": ObjectId(current_user["user_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid book ID")
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get chapters
    chapters = list(db.chapters.find({"book_id": book["_id"]}).sort("order", 1))
    book["chapter_count"] = len(chapters)
    
    return {
        "book": serialize_book(book),
        "chapters": [serialize_chapter(c) for c in chapters]
    }

@router.patch("/books/{book_id}")
async def update_book(book_id: str, data: BookUpdate, current_user: dict = Depends(require_super_admin)):
    """Update a book"""
    db = get_db()
    
    try:
        book = db.books.find_one({
            "_id": ObjectId(book_id),
            "author_id": ObjectId(current_user["user_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid book ID")
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc)}
    if data.title is not None:
        update_data["title"] = data.title
    if data.description is not None:
        update_data["description"] = data.description
    if data.cover_url is not None:
        update_data["cover_url"] = data.cover_url
    if data.status is not None:
        update_data["status"] = data.status
    
    db.books.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    
    updated_book = db.books.find_one({"_id": ObjectId(book_id)})
    updated_book["chapter_count"] = db.chapters.count_documents({"book_id": ObjectId(book_id)})
    
    return {"book": serialize_book(updated_book), "message": "Book updated successfully"}

@router.delete("/books/{book_id}")
async def delete_book(book_id: str, current_user: dict = Depends(require_super_admin)):
    """Delete a book and all its chapters"""
    db = get_db()
    
    try:
        book = db.books.find_one({
            "_id": ObjectId(book_id),
            "author_id": ObjectId(current_user["user_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid book ID")
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Delete all chapters first
    db.chapters.delete_many({"book_id": ObjectId(book_id)})
    
    # Delete the book
    db.books.delete_one({"_id": ObjectId(book_id)})
    
    return {"message": "Book and all chapters deleted successfully"}

# ============== Chapter Endpoints ==============

@router.post("/books/{book_id}/chapters")
async def create_chapter(book_id: str, data: ChapterCreate, current_user: dict = Depends(require_super_admin)):
    """Create a new chapter in a book"""
    db = get_db()
    
    # Verify book ownership
    try:
        book = db.books.find_one({
            "_id": ObjectId(book_id),
            "author_id": ObjectId(current_user["user_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid book ID")
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Get next order number
    last_chapter = db.chapters.find_one(
        {"book_id": ObjectId(book_id)},
        sort=[("order", -1)]
    )
    next_order = (last_chapter["order"] + 1) if last_chapter else 1
    
    now = datetime.now(timezone.utc)
    chapter = {
        "book_id": ObjectId(book_id),
        "title": data.title,
        "content": data.content or "",
        "order": next_order,
        "created_at": now,
        "updated_at": now,
    }
    
    result = db.chapters.insert_one(chapter)
    chapter["_id"] = result.inserted_id
    
    # Update book's updated_at
    db.books.update_one(
        {"_id": ObjectId(book_id)},
        {"$set": {"updated_at": now}}
    )
    
    return {"chapter": serialize_chapter(chapter), "message": "Chapter created successfully"}

@router.get("/chapters/{chapter_id}")
async def get_chapter(chapter_id: str, current_user: dict = Depends(require_super_admin)):
    """Get a single chapter"""
    db = get_db()
    
    try:
        chapter = db.chapters.find_one({"_id": ObjectId(chapter_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid chapter ID")
    
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Verify book ownership
    book = db.books.find_one({
        "_id": chapter["book_id"],
        "author_id": ObjectId(current_user["user_id"])
    })
    
    if not book:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {"chapter": serialize_chapter(chapter)}

@router.patch("/chapters/{chapter_id}")
async def update_chapter(chapter_id: str, data: ChapterUpdate, current_user: dict = Depends(require_super_admin)):
    """Update a chapter"""
    db = get_db()
    
    try:
        chapter = db.chapters.find_one({"_id": ObjectId(chapter_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid chapter ID")
    
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Verify book ownership
    book = db.books.find_one({
        "_id": chapter["book_id"],
        "author_id": ObjectId(current_user["user_id"])
    })
    
    if not book:
        raise HTTPException(status_code=403, detail="Access denied")
    
    now = datetime.now(timezone.utc)
    update_data = {"updated_at": now}
    
    if data.title is not None:
        update_data["title"] = data.title
    if data.content is not None:
        update_data["content"] = data.content
    if data.order is not None:
        update_data["order"] = data.order
    
    db.chapters.update_one({"_id": ObjectId(chapter_id)}, {"$set": update_data})
    
    # Update book's updated_at and word count
    total_words = sum(
        len(c.get("content", "").split()) 
        for c in db.chapters.find({"book_id": chapter["book_id"]})
    )
    db.books.update_one(
        {"_id": chapter["book_id"]},
        {"$set": {"updated_at": now, "word_count": total_words}}
    )
    
    updated_chapter = db.chapters.find_one({"_id": ObjectId(chapter_id)})
    
    return {"chapter": serialize_chapter(updated_chapter), "message": "Chapter updated successfully"}

@router.post("/chapters/{chapter_id}/autosave")
async def autosave_chapter(chapter_id: str, data: ChapterAutosave, current_user: dict = Depends(require_super_admin)):
    """Autosave chapter content (lightweight endpoint for frequent saves)"""
    db = get_db()
    
    try:
        chapter = db.chapters.find_one({"_id": ObjectId(chapter_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid chapter ID")
    
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Verify book ownership
    book = db.books.find_one({
        "_id": chapter["book_id"],
        "author_id": ObjectId(current_user["user_id"])
    })
    
    if not book:
        raise HTTPException(status_code=403, detail="Access denied")
    
    now = datetime.now(timezone.utc)
    
    db.chapters.update_one(
        {"_id": ObjectId(chapter_id)},
        {"$set": {"content": data.content, "updated_at": now}}
    )
    
    # Update book's word count
    total_words = sum(
        len(c.get("content", "").split()) 
        for c in db.chapters.find({"book_id": chapter["book_id"]})
    )
    db.books.update_one(
        {"_id": chapter["book_id"]},
        {"$set": {"updated_at": now, "word_count": total_words}}
    )
    
    return {
        "saved": True,
        "saved_at": now.isoformat(),
        "word_count": len(data.content.split())
    }

@router.delete("/chapters/{chapter_id}")
async def delete_chapter(chapter_id: str, current_user: dict = Depends(require_super_admin)):
    """Delete a chapter"""
    db = get_db()
    
    try:
        chapter = db.chapters.find_one({"_id": ObjectId(chapter_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid chapter ID")
    
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Verify book ownership
    book = db.books.find_one({
        "_id": chapter["book_id"],
        "author_id": ObjectId(current_user["user_id"])
    })
    
    if not book:
        raise HTTPException(status_code=403, detail="Access denied")
    
    book_id = chapter["book_id"]
    deleted_order = chapter["order"]
    
    # Delete the chapter
    db.chapters.delete_one({"_id": ObjectId(chapter_id)})
    
    # Reorder remaining chapters
    db.chapters.update_many(
        {"book_id": book_id, "order": {"$gt": deleted_order}},
        {"$inc": {"order": -1}}
    )
    
    # Update book's word count
    total_words = sum(
        len(c.get("content", "").split()) 
        for c in db.chapters.find({"book_id": book_id})
    )
    db.books.update_one(
        {"_id": book_id},
        {"$set": {"updated_at": datetime.now(timezone.utc), "word_count": total_words}}
    )
    
    return {"message": "Chapter deleted successfully"}

@router.post("/books/{book_id}/chapters/reorder")
async def reorder_chapters(book_id: str, chapter_ids: List[str], current_user: dict = Depends(require_super_admin)):
    """Reorder chapters in a book"""
    db = get_db()
    
    # Verify book ownership
    try:
        book = db.books.find_one({
            "_id": ObjectId(book_id),
            "author_id": ObjectId(current_user["user_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid book ID")
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Update order for each chapter
    for idx, chapter_id in enumerate(chapter_ids):
        db.chapters.update_one(
            {"_id": ObjectId(chapter_id), "book_id": ObjectId(book_id)},
            {"$set": {"order": idx + 1}}
        )
    
    return {"message": "Chapters reordered successfully"}
