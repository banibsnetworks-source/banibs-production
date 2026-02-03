"""
BANIBS Circles - API Routes
Phase 11.5.3 - Support Groups
Updated: Unified Circle model with circle_type for presentation
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timezone

from models.circles import (
    CirclesResponse,
    Circle,
    CircleMembersResponse,
    CirclePostsResponse
)
from db.circles import CirclesDB
from db.connection import get_db_client
from middleware.auth_guard import get_current_user as get_current_user_dependency

router = APIRouter(prefix="/api/circles", tags=["Circles - Support Groups"])


# ==================== CONSOLIDATED CIRCLES SEED DATA ====================
# All circles in one list. circle_type determines UI presentation.
# Idempotent by slug - missing circles are added even if collection has entries.

SEED_CIRCLES = [
    # ==================== COMMUNITY CIRCLES ====================
    {
        "slug": "black-entrepreneurs",
        "name": "Black Entrepreneurs Network",
        "circle_type": "community",
        "description": "A space for Black business owners and aspiring entrepreneurs to connect, share resources, and support each other's ventures.",
        "pillar": "community",
        "tags": ["business", "entrepreneurship", "networking", "startups"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Business discussions only. No solicitation without approval.",
        "rules": ["Be supportive and constructive", "No spam or unsolicited pitches", "Share resources generously", "Respect confidentiality"],
        "is_verified": True
    },
    {
        "slug": "parents-caregivers",
        "name": "Parents & Caregivers Support",
        "circle_type": "community",
        "description": "For parents and caregivers in the Black community. Share experiences, get advice, and find support in your parenting journey.",
        "pillar": "community",
        "tags": ["parenting", "family", "support", "caregiving"],
        "primary_disability_type": None,
        "audience": "caregiver",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Safe space for parents. Be mindful of sensitive topics.",
        "rules": ["No judgment - every family is different", "Keep children's privacy protected", "Support over criticism", "Be respectful of different parenting styles"],
        "is_verified": True
    },
    {
        "slug": "black-in-tech",
        "name": "Black in Tech",
        "circle_type": "community",
        "description": "Connect with Black professionals in technology. Share job opportunities, career advice, and industry insights.",
        "pillar": "community",
        "tags": ["technology", "careers", "coding", "jobs", "networking"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": None,
        "rules": ["Share opportunities freely", "Mentor when you can", "No gatekeeping", "Support career growth at all levels"],
        "is_verified": True
    },
    {
        "slug": "black-creatives",
        "name": "Black Creatives Collective",
        "circle_type": "community",
        "description": "Artists, writers, musicians, designers, and all creatives. Share your work, collaborate, and celebrate Black creativity.",
        "pillar": "community",
        "tags": ["art", "music", "writing", "design", "creativity", "culture"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": None,
        "rules": ["Credit original creators", "Constructive feedback only", "Celebrate all forms of creativity", "Support emerging artists"],
        "is_verified": True
    },
    {
        "slug": "mental-health-wellness",
        "name": "Mental Health & Wellness",
        "circle_type": "community",
        "description": "A supportive community focused on mental health awareness, self-care practices, and emotional well-being in the Black community.",
        "pillar": "health",
        "tags": ["mental health", "wellness", "self-care", "therapy", "support"],
        "primary_disability_type": "mental_health",
        "audience": "both",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": True,
        "safety_notes": "Trauma-aware space. No graphic descriptions. Crisis resources available.",
        "rules": ["This is not a substitute for professional help", "Be kind and supportive", "Respect privacy - what's shared here stays here", "Use content warnings for sensitive topics", "No diagnosis or medical advice"],
        "is_verified": True
    },
    
    # ==================== FAITH CIRCLES ====================
    {
        "slug": "faith-spirituality",
        "name": "Faith & Spirituality",
        "circle_type": "faith",
        "description": "A respectful space for discussing faith, spirituality, and religious traditions in the Black community.",
        "pillar": "community",
        "tags": ["faith", "spirituality", "religion", "community"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "All faiths welcome. Mutual respect required.",
        "rules": ["Respect all belief systems", "No proselytizing or conversion attempts", "Share, don't preach", "Interfaith dialogue encouraged"],
        "is_verified": True
    },
    {
        "slug": "black-churches-network",
        "name": "Black Churches Network",
        "circle_type": "faith",
        "description": "Connecting Black churches, ministries, and congregations. Share events, resources, and community outreach initiatives.",
        "pillar": "community",
        "tags": ["church", "ministry", "Christian", "congregation", "outreach"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Respectful interfaith dialogue welcome.",
        "rules": ["Respect all denominations", "Share events and resources", "Support community outreach", "No church competition"],
        "is_verified": True
    },
    
    # ==================== PRAYER CIRCLES ====================
    {
        "slug": "christian-prayer",
        "name": "Christian Prayer Circle",
        "circle_type": "prayer",
        "description": "A space for Christian prayer, worship, and spiritual reflection. Share your prayers and receive support from fellow believers.",
        "pillar": "community",
        "tags": ["prayer", "Christian", "worship", "faith", "spiritual"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Respectful prayer requests only.",
        "rules": ["Keep prayers respectful", "Support one another", "No judgment", "Confidentiality honored"],
        "is_verified": True
    },
    {
        "slug": "muslim-prayer",
        "name": "Muslim Prayer Circle",
        "circle_type": "prayer",
        "description": "A sacred space for Islamic prayer (Salah), dua, and dhikr. Connect with brothers and sisters in faith.",
        "pillar": "community",
        "tags": ["prayer", "Muslim", "Islam", "dua", "salah", "faith"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Respectful Islamic practices observed.",
        "rules": ["Respect Islamic traditions", "Support fellow Muslims", "Dua requests welcome", "Brotherhood/sisterhood honored"],
        "is_verified": True
    },
    {
        "slug": "interfaith-unity",
        "name": "Interfaith Unity Circle",
        "circle_type": "prayer",
        "description": "A welcoming space for all faiths to pray together in unity. All spiritual traditions are honored here.",
        "pillar": "community",
        "tags": ["interfaith", "unity", "prayer", "spiritual", "inclusive"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "All traditions respected equally.",
        "rules": ["Honor all faiths", "No proselytizing", "Unity over division", "Learn from each other"],
        "is_verified": True
    },
    {
        "slug": "meditation-peace",
        "name": "Meditation & Peace Circle",
        "circle_type": "prayer",
        "description": "A quiet sanctuary for meditation, mindfulness, and inner peace. Find calm and clarity here.",
        "pillar": "community",
        "tags": ["meditation", "mindfulness", "peace", "calm", "spiritual"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Quiet, respectful space.",
        "rules": ["Maintain peaceful atmosphere", "All meditation styles welcome", "Respect silence", "Share techniques kindly"],
        "is_verified": True
    },
    {
        "slug": "emergency-prayer",
        "name": "Emergency Prayer Circle",
        "circle_type": "prayer",
        "description": "24/7 urgent prayer support for immediate needs. The community stands ready to pray with you in your time of need.",
        "pillar": "community",
        "tags": ["prayer", "urgent", "emergency", "support", "24/7"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "For urgent prayer needs. Crisis resources available.",
        "rules": ["Respond with compassion", "Pray immediately when able", "Respect privacy", "No judgment in times of crisis"],
        "is_verified": True
    },
    
    # ==================== SUPPORT CIRCLES (Ability Network) ====================
    {
        "slug": "autism-adhd-adults",
        "name": "Autism & ADHD (Adults)",
        "circle_type": "support",
        "description": "A neurodiversity-affirming space for autistic and ADHD adults to share experiences, strategies, and support. We celebrate neurodivergent identities.",
        "pillar": "ability",
        "tags": ["autism", "ADHD", "neurodiversity", "adults"],
        "primary_disability_type": "neurodivergent",
        "audience": "self",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": True,
        "safety_notes": "Identity-first language welcomed. No functioning labels or cure talk.",
        "rules": ["No ableist language or functioning labels", "Respect neurodiversity paradigm", "No unsolicited advice", "Share personal experiences, not medical claims", "Be patient with communication differences"],
        "is_verified": True
    },
    {
        "slug": "black-caregivers-circle",
        "name": "Black Caregivers Circle",
        "circle_type": "support",
        "description": "A dedicated space for Black family caregivers supporting loved ones with disabilities. Share culturally relevant strategies, navigate systems, prevent burnout.",
        "pillar": "ability",
        "tags": ["caregiver", "Black community", "family support", "respite"],
        "primary_disability_type": "all",
        "audience": "caregiver",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": True,
        "safety_notes": "Trauma-aware space. We honor cultural traditions and family structures.",
        "rules": ["No judgment of caregiving choices", "Respect confidentiality", "Center Black caregiver experiences", "No medical advice", "Support self-care and boundaries"],
        "is_verified": True
    },
    {
        "slug": "living-with-chronic-pain",
        "name": "Living with Chronic Pain",
        "circle_type": "support",
        "description": "For those living with chronic pain conditions. Share coping strategies, medical experiences, pain management techniques, and emotional support.",
        "pillar": "ability",
        "tags": ["chronic pain", "chronic illness", "pain management", "self care"],
        "primary_disability_type": "chronic",
        "audience": "self",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": True,
        "safety_notes": "No graphic descriptions of pain. Trigger warnings for medical procedures.",
        "rules": ["No one-size-fits-all advice", "Respect varied pain experiences", "No cure claims or MLM products", "Validate invisible illness", "Content warnings for triggering topics"],
        "is_verified": True
    },
    {
        "slug": "parents-autistic-children",
        "name": "Parents of Autistic Children",
        "circle_type": "support",
        "description": "For parents raising autistic children. Connect with other parents, share resources, discuss IEPs, sensory strategies, and celebrate your child's strengths.",
        "pillar": "ability",
        "tags": ["autism", "parenting", "children", "IEP", "school support"],
        "primary_disability_type": "neurodivergent",
        "audience": "caregiver",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": True,
        "safety_notes": "Presuming competence. No ABA debates. Focus on support.",
        "rules": ["Presume competence in all children", "No cure-seeking discussions", "Respect communication differences", "Share resources, not diagnoses", "Celebrate neurodivergent children"],
        "is_verified": True
    },
    {
        "slug": "stroke-recovery-mobility",
        "name": "Stroke Recovery & Mobility",
        "circle_type": "support",
        "description": "Supporting individuals recovering from stroke and navigating mobility changes. Share therapy progress, adaptive strategies, and practical tips.",
        "pillar": "ability",
        "tags": ["stroke", "mobility", "recovery", "physical disability"],
        "primary_disability_type": "physical",
        "audience": "both",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": False,
        "safety_notes": "Be patient with communication differences. Aphasia-friendly.",
        "rules": ["Recovery looks different for everyone", "No pressure to 'get better'", "Share experiences, not medical advice", "Be patient with typing/communication", "Celebrate all progress"],
        "is_verified": True
    },
    {
        "slug": "vision-hearing-loss-support",
        "name": "Vision & Hearing Loss Support",
        "circle_type": "support",
        "description": "For individuals with vision loss, hearing loss, or deafblindness. Share assistive technology tips, navigation strategies, and experiences.",
        "pillar": "ability",
        "tags": ["vision loss", "hearing loss", "Deaf", "blind", "assistive tech"],
        "primary_disability_type": "sensory",
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Accessible format posts. Describe images. Use captions.",
        "rules": ["Always describe images in text", "Respect communication preferences", "Deaf culture awareness", "No inspiration porn", "Share accessibility tips freely"],
        "is_verified": True
    },
    {
        "slug": "ssdi-ssi-journey",
        "name": "SSDI / SSI Journey Group",
        "circle_type": "support",
        "description": "Navigating Social Security disability benefits together. Share application tips, appeal experiences, denial support, and celebrate approvals.",
        "pillar": "ability",
        "tags": ["SSDI", "SSI", "benefits", "legal", "advocacy"],
        "primary_disability_type": "all",
        "audience": "both",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": False,
        "safety_notes": "No legal advice. Share experiences only.",
        "rules": ["No legal advice - share experiences only", "No benefit fraud", "Respect privacy about disabilities", "Support through denials", "Celebrate approvals kindly"],
        "is_verified": True
    },
    {
        "slug": "workplace-accommodations-rights",
        "name": "Workplace Accommodations & Rights",
        "circle_type": "support",
        "description": "Discussing workplace disability rights, reasonable accommodations, disclosure, discrimination, and career advancement. Know your rights.",
        "pillar": "ability",
        "tags": ["employment", "ADA", "accommodations", "workplace", "career"],
        "primary_disability_type": "all",
        "audience": "self",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": False,
        "safety_notes": "No identifying employers publicly. General advice only.",
        "rules": ["No identifying employers in posts", "Know your ADA rights", "No legal advice", "Share successful accommodation strategies", "Respect disclosure choices"],
        "is_verified": True
    },
    {
        "slug": "elder-care-at-home",
        "name": "Elder Care at Home",
        "circle_type": "support",
        "description": "For family members caring for aging parents or relatives with disabilities at home. Share resources for home modifications, in-home care, and support.",
        "pillar": "ability",
        "tags": ["elder care", "aging", "home care", "family caregiver"],
        "primary_disability_type": "all",
        "audience": "caregiver",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Respect elder dignity. No graphic medical details.",
        "rules": ["Respect elder privacy and dignity", "No nursing home debates", "Share practical resources", "Support difficult decisions", "Cultural caregiving practices welcomed"],
        "is_verified": True
    },
    {
        "slug": "college-disability",
        "name": "College & Disability",
        "circle_type": "support",
        "description": "For disabled college students and recent graduates. Discuss accommodations, accessibility, self-advocacy, campus life, and transitioning to post-grad life.",
        "pillar": "ability",
        "tags": ["college", "education", "young adults", "504", "accommodations"],
        "primary_disability_type": "all",
        "audience": "self",
        "privacy_level": "public",
        "is_featured_in_ability": True,
        "safety_notes": "No identifying schools. Share general strategies.",
        "rules": ["No identifying schools publicly", "Know your Section 504 rights", "Share successful accommodation strategies", "Respect varied college experiences", "Celebrate academic achievements"],
        "is_verified": True
    }
]


async def seed_circles(db):
    """
    Seed circles into database - IDEMPOTENT BY SLUG.
    Will add missing circles even if collection already has entries.
    Returns dict with counts by circle_type.
    """
    circles_db = CirclesDB(db)
    counts = {"community": 0, "support": 0, "prayer": 0, "faith": 0, "skipped": 0}
    
    for circle_data in SEED_CIRCLES:
        slug = circle_data["slug"]
        circle_type = circle_data.get("circle_type", "community")
        
        # Check if slug already exists (idempotent check)
        existing = await circles_db.get_circle_by_slug(slug)
        if existing:
            counts["skipped"] += 1
            continue
        
        # Generate ID from slug for consistency
        circle_id = f"circle-{slug}"
        
        # Build full circle document
        now = datetime.now(timezone.utc)
        full_circle = {
            "id": circle_id,
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Team",
            "member_count": 0,
            "post_count": 0,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
            "last_activity_at": now,
            **circle_data
        }
        
        await circles_db.circles.insert_one(full_circle)
        counts[circle_type] = counts.get(circle_type, 0) + 1
    
    return counts
    },
    {
        "id": "circle-parents-caregivers",
        "name": "Parents & Caregivers Support",
        "slug": "parents-caregivers",
        "description": "For parents and caregivers in the Black community. Share experiences, get advice, and find support in your parenting journey.",
        "pillar": "community",
        "tags": ["parenting", "family", "support", "caregiving"],
        "primary_disability_type": None,
        "audience": "caregiver",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "Safe space for parents. Be mindful of sensitive topics.",
        "rules": [
            "No judgment - every family is different",
            "Keep children's privacy protected",
            "Support over criticism",
            "Be respectful of different parenting styles"
        ],
        "created_by_user_id": "system",
        "created_by_name": "BANIBS Team",
        "member_count": 0,
        "post_count": 0,
        "is_active": True,
        "is_verified": True
    },
    {
        "id": "circle-mental-health",
        "name": "Mental Health & Wellness",
        "slug": "mental-health-wellness",
        "description": "A supportive community focused on mental health awareness, self-care practices, and emotional well-being in the Black community.",
        "pillar": "health",
        "tags": ["mental health", "wellness", "self-care", "therapy", "support"],
        "primary_disability_type": "mental_health",
        "audience": "both",
        "privacy_level": "request_to_join",
        "is_featured_in_ability": True,
        "safety_notes": "Trauma-aware space. No graphic descriptions. Crisis resources available.",
        "rules": [
            "This is not a substitute for professional help",
            "Be kind and supportive",
            "Respect privacy - what's shared here stays here",
            "Use content warnings for sensitive topics",
            "No diagnosis or medical advice"
        ],
        "created_by_user_id": "system",
        "created_by_name": "BANIBS Team",
        "member_count": 0,
        "post_count": 0,
        "is_active": True,
        "is_verified": True
    },
    {
        "id": "circle-tech-careers",
        "name": "Black in Tech",
        "slug": "black-in-tech",
        "description": "Connect with Black professionals in technology. Share job opportunities, career advice, and industry insights.",
        "pillar": "community",
        "tags": ["technology", "careers", "coding", "jobs", "networking"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": None,
        "rules": [
            "Share opportunities freely",
            "Mentor when you can",
            "No gatekeeping",
            "Support career growth at all levels"
        ],
        "created_by_user_id": "system",
        "created_by_name": "BANIBS Team",
        "member_count": 0,
        "post_count": 0,
        "is_active": True,
        "is_verified": True
    },
    {
        "id": "circle-creatives",
        "name": "Black Creatives Collective",
        "slug": "black-creatives",
        "description": "Artists, writers, musicians, designers, and all creatives. Share your work, collaborate, and celebrate Black creativity.",
        "pillar": "community",
        "tags": ["art", "music", "writing", "design", "creativity", "culture"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": None,
        "rules": [
            "Credit original creators",
            "Constructive feedback only",
            "Celebrate all forms of creativity",
            "Support emerging artists"
        ],
        "created_by_user_id": "system",
        "created_by_name": "BANIBS Team",
        "member_count": 0,
        "post_count": 0,
        "is_active": True,
        "is_verified": True
    },
    {
        "id": "circle-faith-spirituality",
        "name": "Faith & Spirituality",
        "slug": "faith-spirituality",
        "description": "A respectful space for discussing faith, spirituality, and religious traditions in the Black community.",
        "pillar": "community",
        "tags": ["faith", "spirituality", "religion", "community"],
        "primary_disability_type": None,
        "audience": "both",
        "privacy_level": "public",
        "is_featured_in_ability": False,
        "safety_notes": "All faiths welcome. Mutual respect required.",
        "rules": [
            "Respect all belief systems",
            "No proselytizing or conversion attempts",
            "Share, don't preach",
            "Interfaith dialogue encouraged"
        ],
        "created_by_user_id": "system",
        "created_by_name": "BANIBS Team",
        "member_count": 0,
        "post_count": 0,
        "is_active": True,
        "is_verified": True
    }
]


async def seed_circles(db):
    """Seed pre-created circles into database"""
    circles_db = CirclesDB(db)
    seeded_count = 0
    
    for circle_data in SEED_CIRCLES:
        # Check if already exists
        existing = await circles_db.get_circle_by_id(circle_data["id"])
        if existing:
            continue
        
        # Add timestamps
        now = datetime.now(timezone.utc)
        circle_data["created_at"] = now
        circle_data["updated_at"] = now
        circle_data["last_activity_at"] = now
        
        await circles_db.circles.insert_one(circle_data)
        seeded_count += 1
    
    return seeded_count


# ==================== CIRCLE ENDPOINTS ====================

@router.get("", response_model=CirclesResponse)
async def get_circles(
    pillar: Optional[str] = Query(None, description="Filter by pillar (ability, health, community)"),
    disability_type: Optional[str] = Query(None, description="Filter by disability type"),
    audience: Optional[str] = Query(None, description="Filter by audience (self, caregiver, both)"),
    featured_only: bool = Query(False, description="Only featured circles"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100, description="Max results")
):
    """Get support circles with filtering - Phase 11.5.3"""
    db = get_db_client()
    
    # Auto-seed circles on first request if none exist
    circles_db = CirclesDB(db)
    count = await circles_db.circles.count_documents({})
    if count == 0:
        await seed_circles(db)
    
    # Parse tags
    tag_list = tags.split(',') if tags else None
    
    circles = await circles_db.get_circles(
        pillar=pillar,
        disability_type=disability_type,
        audience=audience,
        featured_only=featured_only,
        tags=tag_list,
        limit=limit
    )
    
    return {
        "circles": circles,
        "total": len(circles)
    }


@router.get("/suggested", response_model=CirclesResponse)
async def get_suggested_circles(
    disability_type: Optional[str] = Query(None, description="User's disability type"),
    audience: Optional[str] = Query(None, description="User's role (self/caregiver)"),
    limit: int = Query(5, le=10, description="Max results")
):
    """Get suggested circles based on user preferences"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    circles = await circles_db.get_suggested_circles(
        disability_type=disability_type,
        audience=audience,
        limit=limit
    )
    
    return {
        "circles": circles,
        "total": len(circles)
    }


@router.get("/{circle_id}", response_model=Circle)
async def get_circle(circle_id: str):
    """Get a specific circle by ID"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    circle = await circles_db.get_circle_by_id(circle_id)
    
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    return circle


@router.post("/{circle_id}/join")
async def join_circle(
    circle_id: str,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Request to join or join a circle"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    # Check if circle exists
    circle = await circles_db.get_circle_by_id(circle_id)
    
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if already a member
    existing_member = await circles_db.get_member(circle_id, current_user["id"])
    
    if existing_member:
        if existing_member["status"] == "active":
            raise HTTPException(status_code=400, detail="Already a member")
        elif existing_member["status"] == "pending":
            return {"success": True, "message": "Join request already pending", "status": "pending"}
    
    # Create membership
    status = "pending" if circle["privacy_level"] == "request_to_join" else "active"
    
    member = {
        "id": f"member-{uuid4().hex[:8]}",
        "circle_id": circle_id,
        "user_id": current_user["id"],
        "user_name": current_user.get("name", current_user.get("email", "User")),
        "role": "member",
        "status": status,
        "joined_at": datetime.now(timezone.utc)
    }
    
    await circles_db.circle_members.insert_one(member)
    
    # Increment member count if active
    if status == "active":
        await circles_db.increment_member_count(circle_id)
    
    return {
        "success": True,
        "message": "Joined successfully" if status == "active" else "Join request sent",
        "status": status
    }


@router.get("/{circle_id}/members", response_model=CircleMembersResponse)
async def get_circle_members(
    circle_id: str,
    limit: int = Query(50, le=100)
):
    """Get members of a circle (admin/moderator only in production)"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    members = await circles_db.get_circle_members(circle_id, limit=limit)
    
    return {
        "members": members,
        "total": len(members)
    }


@router.get("/{circle_id}/posts", response_model=CirclePostsResponse)
async def get_circle_posts(
    circle_id: str,
    limit: int = Query(20, le=50)
):
    """Get posts in a circle"""
    db = get_db_client()
    circles_db = CirclesDB(db)
    
    posts = await circles_db.get_circle_posts(circle_id, limit=limit)
    
    return {
        "posts": posts,
        "total": len(posts)
    }
