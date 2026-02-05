"""
Alternative School Hub - Database Operations
Phase-0 Scaffold: CRUD operations for admin management

Collections:
- alt_school_tutors
- alt_school_programs
- alt_school_resources
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List
from db.connection import get_db


# ==========================================
# TUTOR LISTINGS
# ==========================================

async def get_all_tutors(status_filter: Optional[str] = None, limit: int = 100) -> List[dict]:
    """Get all tutor listings, optionally filtered by status"""
    db = await get_db()
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    tutors = []
    async for doc in db.alt_school_tutors.find(query, {"_id": 0}).sort("created_at", -1).limit(limit):
        tutors.append(doc)
    
    return tutors


async def get_tutor_by_id(tutor_id: str) -> Optional[dict]:
    """Get a single tutor listing by ID"""
    db = await get_db()
    return await db.alt_school_tutors.find_one({"id": tutor_id}, {"_id": 0})


async def create_tutor(data: dict) -> dict:
    """Create a new tutor listing (admin only)"""
    db = await get_db()
    
    now = datetime.now(timezone.utc)
    tutor = {
        "id": str(uuid.uuid4()),
        **data,
        "created_at": now,
        "updated_at": None
    }
    
    await db.alt_school_tutors.insert_one(tutor)
    
    # Return without _id
    tutor.pop("_id", None)
    return tutor


async def update_tutor(tutor_id: str, data: dict) -> Optional[dict]:
    """Update a tutor listing (admin only)"""
    db = await get_db()
    
    # Remove None values
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_tutor_by_id(tutor_id)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.alt_school_tutors.update_one(
        {"id": tutor_id},
        {"$set": update_data}
    )
    
    return await get_tutor_by_id(tutor_id)


async def delete_tutor(tutor_id: str) -> bool:
    """Delete a tutor listing (admin only)"""
    db = await get_db()
    result = await db.alt_school_tutors.delete_one({"id": tutor_id})
    return result.deleted_count > 0


# ==========================================
# PROGRAM CATEGORIES
# ==========================================

async def get_all_programs(status_filter: Optional[str] = None, limit: int = 100) -> List[dict]:
    """Get all program categories, optionally filtered by status"""
    db = await get_db()
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    programs = []
    async for doc in db.alt_school_programs.find(query, {"_id": 0}).sort("created_at", -1).limit(limit):
        programs.append(doc)
    
    return programs


async def get_program_by_id(program_id: str) -> Optional[dict]:
    """Get a single program category by ID"""
    db = await get_db()
    return await db.alt_school_programs.find_one({"id": program_id}, {"_id": 0})


async def create_program(data: dict) -> dict:
    """Create a new program category (admin only)"""
    db = await get_db()
    
    now = datetime.now(timezone.utc)
    program = {
        "id": str(uuid.uuid4()),
        **data,
        "created_at": now,
        "updated_at": None
    }
    
    await db.alt_school_programs.insert_one(program)
    
    program.pop("_id", None)
    return program


async def update_program(program_id: str, data: dict) -> Optional[dict]:
    """Update a program category (admin only)"""
    db = await get_db()
    
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_program_by_id(program_id)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.alt_school_programs.update_one(
        {"id": program_id},
        {"$set": update_data}
    )
    
    return await get_program_by_id(program_id)


async def delete_program(program_id: str) -> bool:
    """Delete a program category (admin only)"""
    db = await get_db()
    result = await db.alt_school_programs.delete_one({"id": program_id})
    return result.deleted_count > 0


# ==========================================
# LEARNING RESOURCES
# ==========================================

async def get_all_resources(status_filter: Optional[str] = None, category: Optional[str] = None, limit: int = 100) -> List[dict]:
    """Get all learning resources, optionally filtered"""
    db = await get_db()
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    if category:
        query["category"] = category
    
    resources = []
    async for doc in db.alt_school_resources.find(query, {"_id": 0}).sort("created_at", -1).limit(limit):
        resources.append(doc)
    
    return resources


async def get_resource_by_id(resource_id: str) -> Optional[dict]:
    """Get a single learning resource by ID"""
    db = await get_db()
    return await db.alt_school_resources.find_one({"id": resource_id}, {"_id": 0})


async def create_resource(data: dict) -> dict:
    """Create a new learning resource (admin only)"""
    db = await get_db()
    
    now = datetime.now(timezone.utc)
    resource = {
        "id": str(uuid.uuid4()),
        **data,
        "created_at": now,
        "updated_at": None
    }
    
    await db.alt_school_resources.insert_one(resource)
    
    resource.pop("_id", None)
    return resource


async def update_resource(resource_id: str, data: dict) -> Optional[dict]:
    """Update a learning resource (admin only)"""
    db = await get_db()
    
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_resource_by_id(resource_id)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.alt_school_resources.update_one(
        {"id": resource_id},
        {"$set": update_data}
    )
    
    return await get_resource_by_id(resource_id)


async def delete_resource(resource_id: str) -> bool:
    """Delete a learning resource (admin only)"""
    db = await get_db()
    result = await db.alt_school_resources.delete_one({"id": resource_id})
    return result.deleted_count > 0


# ==========================================
# COMBINED HUB DATA
# ==========================================

async def get_hub_data() -> dict:
    """Get all data for Alternative School Hub page (public, read-only)"""
    # Get all active listings (founding + developing, not future)
    tutors = await get_all_tutors()
    programs = await get_all_programs()
    resources = await get_all_resources()
    
    # Filter to only show founding and developing (not future)
    visible_statuses = {"founding", "developing"}
    tutors = [t for t in tutors if t.get("status") in visible_statuses]
    programs = [p for p in programs if p.get("status") in visible_statuses]
    resources = [r for r in resources if r.get("status") in visible_statuses]
    
    return {
        "tutors": tutors,
        "programs": programs,
        "resources": resources,
        "tutor_count": len(tutors),
        "program_count": len(programs),
        "resource_count": len(resources)
    }


# ==========================================
# SEED DATA (For initial population)
# ==========================================

async def seed_initial_data():
    """Seed initial Alternative School Hub data (idempotent)"""
    db = await get_db()
    
    # Check if already seeded
    existing_tutors = await db.alt_school_tutors.count_documents({})
    if existing_tutors > 0:
        return {"message": "Data already seeded", "seeded": False}
    
    now = datetime.now(timezone.utc)
    
    # Seed Tutors
    tutors = [
        {
            "id": str(uuid.uuid4()),
            "name": "Mrs. Angela Thompson",
            "focus_subject": "K-5 Literacy & Reading Foundations",
            "age_or_grade_range": "Ages 5-11 (K-5)",
            "location": "Atlanta, GA / Remote Available",
            "description": "20+ years experience in early childhood literacy. Specializes in phonics, reading comprehension, and building a love of books in young learners.",
            "contact_info": "Contact via BANIBS messaging (coming soon)",
            "status": "founding",
            "created_at": now,
            "updated_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mr. James Carter",
            "focus_subject": "Middle School Mathematics",
            "age_or_grade_range": "Grades 6-8",
            "location": "Remote Only",
            "description": "Former public school math teacher now focused on alternative education. Makes math accessible and relevant through real-world applications.",
            "contact_info": "Contact via BANIBS messaging (coming soon)",
            "status": "founding",
            "created_at": now,
            "updated_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Michelle Davis",
            "focus_subject": "High School Science & Test Prep",
            "age_or_grade_range": "Grades 9-12",
            "location": "Chicago, IL / Remote Available",
            "description": "PhD in Biology. Helps students excel in science courses and prepare for standardized tests including SAT, ACT, and AP exams.",
            "contact_info": "Contact via BANIBS messaging (coming soon)",
            "status": "developing",
            "created_at": now,
            "updated_at": None
        }
    ]
    
    # Seed Programs
    programs = [
        {
            "id": str(uuid.uuid4()),
            "title": "Homeschool Co-op Network",
            "description": "A collaborative network for homeschooling families. Share resources, coordinate group learning activities, and connect with other families on similar educational journeys. Emphasis on community support and collective wisdom.",
            "status": "founding",
            "created_at": now,
            "updated_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Afrocentric Curriculum Resources",
            "description": "Curated educational materials that center African and African-American history, culture, and contributions. Supplemental resources for families seeking to enrich their children's education with culturally affirming content.",
            "status": "founding",
            "created_at": now,
            "updated_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Youth Entrepreneurship Track",
            "description": "Age-appropriate business and financial literacy education for young people. Learn the basics of entrepreneurship, money management, and economic empowerment from an early age.",
            "status": "developing",
            "created_at": now,
            "updated_at": None
        }
    ]
    
    # Seed Resources
    resources = [
        {
            "id": str(uuid.uuid4()),
            "title": "Getting Started with Homeschooling",
            "description": "A comprehensive guide for families considering or just beginning their homeschool journey. Covers legal requirements, curriculum options, and practical tips.",
            "link_url": None,
            "internal_post_id": None,
            "category": "Getting Started",
            "status": "founding",
            "created_at": now,
            "updated_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Free Online Learning Platforms",
            "description": "A curated list of free educational websites and apps suitable for different age groups and subjects.",
            "link_url": None,
            "internal_post_id": None,
            "category": "Tools & Platforms",
            "status": "founding",
            "created_at": now,
            "updated_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Local Learning Pods Directory",
            "description": "Find and connect with learning pods and micro-schools in your area. Community-sourced directory of alternative education options.",
            "link_url": None,
            "internal_post_id": None,
            "category": "Community",
            "status": "developing",
            "created_at": now,
            "updated_at": None
        }
    ]
    
    # Insert all
    await db.alt_school_tutors.insert_many(tutors)
    await db.alt_school_programs.insert_many(programs)
    await db.alt_school_resources.insert_many(resources)
    
    return {
        "message": "Initial data seeded successfully",
        "seeded": True,
        "tutors_added": len(tutors),
        "programs_added": len(programs),
        "resources_added": len(resources)
    }
