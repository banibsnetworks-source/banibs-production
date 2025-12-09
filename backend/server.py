from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import mimetypes
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import routers
from routes.opportunities_legacy import router as opportunities_router
from routes.unified_auth import router as unified_auth_router  # Phase 6.0 - Unified Identity
from routes.bglis_auth import router as bglis_auth_router  # BGLIS v1.0 - Phone-first Global Identity
from routes.admin_uploads import router as admin_uploads_router
from routes.contributor_auth import router as contributor_auth_router
from routes.contributor_profile import router as contributor_profile_router
from routes.moderation_logs import router as moderation_logs_router
from routes.reactions import router as reactions_router  # Phase 4.1
from routes.newsletter import router as newsletter_router  # Phase 4.2
from routes.sponsor import router as sponsor_router  # Phase 5.1
from routes.admin_abuse import router as admin_abuse_router  # Phase 5.3
from routes.admin_revenue import router as admin_revenue_router  # Phase 5.5
from routes.news import router as news_router  # News aggregation feed
from routes.media import router as media_router  # BANIBS TV Featured Video
from routes.analytics import router as analytics_router  # Phase 6.2 Engagement Analytics
from routes.insights import router as insights_router  # Phase 6.3 Sentiment & Insights
from routes.business_directory import router as business_directory_router  # Business Directory v2
from routes.phase6_stubs import router as phase6_stubs_router  # Phase 6 Stub Endpoints (v1.3.2)
from tasks.rss_sync import router as rss_sync_router  # RSS sync endpoint
from scheduler import init_scheduler  # APScheduler for automated RSS sync
from routes.config import router as config_router  # Phase 6.6 - Feature Flags Config
from routes.health import router as health_router  # Phase 7.5.2 - Health Check
from routes.feedback import router as feedback_router  # Phase 7.5.3 - User Feedback
from routes.social import router as social_router  # Phase 8.3 - BANIBS Social Portal
from routes.jobs import router as jobs_router  # Phase 7.1 - BANIBS Jobs & Opportunities
from routes.reviews import router as reviews_router  # Phase 7.1 - Business Rating System
from routes.business_analytics import router as business_analytics_router  # Phase 7.1.1 - BIA Dashboard
from routes.profile_media import router as profile_media_router  # Phase 8.1 - Profile Command Center
from routes.helpinghands import router as helpinghands_router  # Phase 10.0 - BANIBS Helping Hands
from routes.relationships import router as relationships_router  # Phase 8.1 - Relationship Engine
from routes.users import router as users_router  # Phase 8.1 - User Search
from routes.circle_engine import router as circle_engine_router  # Phase 9.1 - Infinite Circle Engine
from routes.fap import router as fap_router  # Phase X - Founder Authentication Protocol
from routes.messaging_v2 import router as messaging_v2_router  # Phase 8.4 - Messaging Engine
from routes.groups import router as groups_router  # Phase 8.5 - Groups & Membership
from adcs.admin_api import router as adcs_router  # ADCS v1.0 - AI Double-Check System
from routes.region import router as region_router  # RCS-X Phase 1 - Region Content System
from routes.bcee import router as bcee_router  # BCEE v1.0 - Currency & Exchange Engine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="BANIBS API",
    description="Backend API for BANIBS Opportunities Platform - Phase 2.8",
    version="2.8.0"
)

# Simple health check endpoint for Docker healthcheck (without /api prefix)
@app.get("/health")
def health_check():
    """
    Minimal health check endpoint for Docker container healthcheck.
    Returns 200 OK if the application is running.
    For detailed health status, use /api/health
    """
    return {"status": "ok"}

# Phase 9.0.1 - Mount static directories for profile media
from fastapi.staticfiles import StaticFiles
import os

AVATAR_DIR = os.getenv("AVATAR_DIR", "/app/backend/static/avatars")
COVER_DIR = os.getenv("COVER_DIR", "/app/backend/static/covers")
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(COVER_DIR, exist_ok=True)

# Mount under /api prefix so Kubernetes ingress routes them to backend
app.mount("/api/static/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")
app.mount("/api/static/covers", StaticFiles(directory=COVER_DIR), name="covers")

# Phase 8.1 - Mount media directories for Media Composer
MEDIA_IMAGES_DIR = "/app/backend/static/media/images"
MEDIA_VIDEOS_DIR = "/app/backend/static/media/videos"
os.makedirs(MEDIA_IMAGES_DIR, exist_ok=True)
os.makedirs(MEDIA_VIDEOS_DIR, exist_ok=True)
app.mount("/api/static/media/images", StaticFiles(directory=MEDIA_IMAGES_DIR), name="media-images")
app.mount("/api/static/media/videos", StaticFiles(directory=MEDIA_VIDEOS_DIR), name="media-videos")

# High Five System - Mount emojis directory
EMOJIS_DIR = "/app/backend/static/emojis"
os.makedirs(EMOJIS_DIR, exist_ok=True)
app.mount("/api/static/emojis", StaticFiles(directory=EMOJIS_DIR), name="emojis")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

# Include opportunities router (already has /api prefix)
app.include_router(opportunities_router)

# ===== AUTHENTICATION ROUTES =====
# BGLIS v1.0 - Phone-first Global Identity (MASTER IDENTITY GATEWAY)
# Registered FIRST to take precedence over legacy routes
app.include_router(bglis_auth_router)

# Legacy Unified Auth (Phase 6.0 - Email + Password)
# ⚠️ DEPRECATED: Being phased out in favor of BGLIS phone-first auth
# Kept for backward compatibility during migration period
app.include_router(unified_auth_router)

# Include admin uploads router (already has /api prefix)
app.include_router(admin_uploads_router)

# Include contributor auth router (already has /api prefix)
app.include_router(contributor_auth_router)

# Include contributor profile router (Phase 3.1)
app.include_router(contributor_profile_router)

# Include moderation logs router (Phase 3.2)
app.include_router(moderation_logs_router)

# Include reactions router (Phase 4.1)
app.include_router(reactions_router)

# Include newsletter router (Phase 4.2)
app.include_router(newsletter_router)

# Include sponsor router (Phase 5.1)
app.include_router(sponsor_router)

# Include admin abuse router (Phase 5.3)
app.include_router(admin_abuse_router)

# Include admin revenue router (Phase 5.5)
app.include_router(admin_revenue_router)

# Include news router (News feed)
app.include_router(news_router)

# Include media router (BANIBS TV Featured Video)
app.include_router(media_router)

# Include analytics router (Phase 6.2 Engagement Analytics)
app.include_router(analytics_router)

# Include insights router (Phase 6.3 Sentiment & Insights)
app.include_router(insights_router)

# Include business directory router (Business Directory v2)
app.include_router(business_directory_router)

# Include Phase 6 stub endpoints (v1.3.2 - for frontend integration)
app.include_router(phase6_stubs_router)

# Include RSS sync router (automated aggregation)
app.include_router(rss_sync_router)

# Include notifications router (Phase 6.2.1 - Notifications System)
from routes.notifications import router as notifications_router
app.include_router(notifications_router)

# Include messages router (Phase 6.2.2 - Messaging System)
from routes.messages import router as messages_router
app.include_router(messages_router)

# Include resources router (Phase 6.2.3 - Resources Module)
from routes.resources import router as resources_router
app.include_router(resources_router)

# Include events router (Phase 6.2.3 - Events Module)
from routes.events import router as events_router
app.include_router(events_router)

# Include feed router (Phase 6.2.4 - Feed Filtering)
from routes.feed import router as feed_router
app.include_router(feed_router)

# Include search router (Phase 6.2.4 - Unified Search)
from routes.search import router as search_router
app.include_router(search_router)

# Include sentiment router (Phase 6.3 - Sentiment Analysis)
from routes.sentiment import router as sentiment_router
from routes.admin.moderation import router as admin_moderation_router  # Phase 6.4 - Moderation Queue
from routes.admin.sentiment_analytics import router as admin_sentiment_analytics_router  # Phase 6.5 - Sentiment Analytics
app.include_router(sentiment_router)
app.include_router(admin_moderation_router)  # Phase 6.4 - Moderation Admin Endpoints
app.include_router(admin_sentiment_analytics_router)  # Phase 6.5 - Sentiment Analytics Endpoints

# Include config router (Phase 6.6 - Feature Flags)
app.include_router(config_router)

# Include health check router (Phase 7.5.2 - Uptime Monitoring)
app.include_router(health_router)

# Include feedback router (Phase 7.5.3 - User Feedback)
app.include_router(feedback_router)

# Include social router (Phase 8.3 - BANIBS Social Portal)
app.include_router(social_router)

# Include social moderation router (Phase 8.3.1 - Moderation & Safety)
from routes.social_moderation import router as social_moderation_router
app.include_router(social_moderation_router)

# Include social profile router (Phase 9.0 - Social Profiles)
from routes.social_profile import router as social_profile_router
app.include_router(social_profile_router)

# Include social profile media router (Phase 9.0.1 - Profile Photos)
from routes.social_profile_media import router as social_profile_media_router
app.include_router(social_profile_media_router)


# Include social settings router (Phase 10.0 - Left Rail)
from routes.social_settings import router as social_settings_router

# Include Helping Hands router (Phase 10.0 - BANIBS Helping Hands)
app.include_router(helpinghands_router)
app.include_router(social_settings_router)

# Include relationships router (Phase 8.1 - Relationship Engine)
app.include_router(relationships_router)

# Include Peoples Room router (MEGADROP V1 - Peoples Room System)
from routes.rooms import router as rooms_router
app.include_router(rooms_router)

# Include WebSocket router (MEGADROP V1 - Phase 4: Real-time Updates)
from routes.websocket_routes import router as websocket_router
app.include_router(websocket_router, prefix="/api")

# Include users search router (Phase 8.1 - User Search)
app.include_router(users_router)

# Include circle engine router (Phase 9.1 - Infinite Circle Engine)
app.include_router(circle_engine_router)

# Include FAP router (Phase X - Founder Authentication Protocol)
app.include_router(fap_router)

# Include messaging v2 router (Phase 8.4 - Messaging Engine)
app.include_router(messaging_v2_router)

# Include jobs router (Phase 7.1 - BANIBS Jobs & Opportunities)
app.include_router(jobs_router)

# Include reviews router (Phase 7.1 - Business Rating System)
app.include_router(reviews_router)

# Include business analytics router (Phase 7.1.1 - BIA Dashboard)
app.include_router(business_analytics_router)

# Include profile media router (Phase 8.1 - Profile Command Center)
app.include_router(profile_media_router)

# Include media upload router (Phase 8.1 - Media Composer)
from routes.media_upload import router as media_upload_router
app.include_router(media_upload_router)

# Include messaging router (Phase 3.1 - BANIBS Connect)
from routes.messaging import router as messaging_router
app.include_router(messaging_router)

# Include messaging WebSocket router (Phase 3.2 - Real-Time)
from routes.messaging_ws import router as messaging_ws_router
app.include_router(messaging_ws_router)

# Include business board router FIRST (Phase 8.3 - Business Board)
# Must come before business profile router to avoid route conflicts
from routes.business_board import router as business_board_router
app.include_router(business_board_router)

# Include Phase 8.3 Business Knowledge router BEFORE business profile router
# to avoid route conflicts with /{handle_or_id} catching /knowledge
from routes.business_knowledge import router as business_knowledge_router
app.include_router(business_knowledge_router)

# Include business profile router (Phase 8.2 - Business Accounts)
from routes.business import router as business_router
app.include_router(business_router)

# Include business search router (Phase 8.2 - Geo Search)
from routes.business_search import router as business_search_router
app.include_router(business_search_router)

# Include follow router (Phase B1 - Follow System)
from routes.follow import api_router as follow_router
app.include_router(follow_router)

# Include Phase 8.3 - Peoples & Business Support routers
from routes.peoples import router as peoples_router
from routes.business_support import router as business_support_router
app.include_router(peoples_router)
app.include_router(business_support_router)

# Include Phase 11.0 - Prayer Rooms router
from routes.prayer import router as prayer_router
app.include_router(prayer_router)

# Include Phase 11.1 - Beauty & Wellness router
from routes.beauty import router as beauty_router
app.include_router(beauty_router)

# Include Phase 11.2 - Fashion & Sneakers router
from routes.fashion import router as fashion_router
app.include_router(fashion_router)

# Include Phase 12.0 - Diaspora Connect router
from routes.diaspora import router as diaspora_router
app.include_router(diaspora_router)

# Include Phase 13.0 - BANIBS Academy router
from routes.academy import router as academy_router
app.include_router(academy_router)

# Include Phase 14.0 - BANIBS Wallet router
from routes.wallet import router as wallet_router
app.include_router(wallet_router)

# Include Phase 15.0 - BANIBS OS / Developer Platform router
from routes.developer import router as developer_router
app.include_router(developer_router)

# Include Phase 16.0 - BANIBS Global Marketplace router
from routes.marketplace import router as marketplace_router
app.include_router(marketplace_router)

# Include Phase 16.2 - Marketplace Payout Engine
from routes.marketplace_payouts import router as marketplace_payouts_router
app.include_router(marketplace_payouts_router)

# Include Phase 11.6-11.9 - Community Life Hub
from routes.community import router as community_router
app.include_router(community_router)

# Phase 11.5 - Ability Network
from routes.ability import router as ability_router
app.include_router(ability_router)

# Phase 11.5.3 - Circles (Support Groups)
from routes.circles import router as circles_router
app.include_router(circles_router)

# Phase 0.0 - Platform Orchestration Core (BPOC)
from routes.orchestration import router as orchestration_router
app.include_router(orchestration_router)



# Include Phase 7.1 - Opportunities Exchange routers
from routes.opportunities.jobs import router as jobs_router
from routes.opportunities.recruiters import router as recruiters_router, employer_router
from routes.opportunities.candidates import router as candidates_router
from routes.opportunities.applications import router as applications_router
from routes.recruiter_analytics import router as recruiter_analytics_router  # Phase 7.1 Cycle 1.4
app.include_router(jobs_router)  # Job listings API
app.include_router(recruiters_router)  # Recruiter verification and profiles
app.include_router(employer_router)  # Employer profiles
app.include_router(candidates_router)  # Candidate profiles
app.include_router(applications_router)  # Job applications
app.include_router(recruiter_analytics_router)  # Recruiter analytics - Phase 7.1 Cycle 1.4
app.include_router(groups_router)  # Groups & Membership - Phase 8.5
app.include_router(adcs_router)  # ADCS v1.0 - AI Double-Check System Admin API
app.include_router(region_router)  # RCS-X Phase 1 - Region Content System

# Debug routes (email testing)
from routes.debug import router as debug_router
app.include_router(debug_router)

# ShortForm routes (Phase 1 - Short video platform)
from routes.shortform import router as shortform_router
app.include_router(shortform_router)

# Admin RSS Management
from routes.admin_rss import router as admin_rss_router
app.include_router(admin_rss_router)

# Feature Flags
from routes.feature_flags import router as feature_flags_router
app.include_router(feature_flags_router)

# Black News
from routes.black_news import router as black_news_router
app.include_router(black_news_router)

# BCEE v1.0 - Currency & Exchange Engine
app.include_router(bcee_router)

# Include BPS TIES router (BPS v1.0 - Protection Suite)
from routes.bps.ties_routes import router as ties_router
app.include_router(ties_router)

# Include BDII router (BDII v1.0 - Device Inventory Intelligence)
from routes.bdii.bdii_routes import router as bdii_router
app.include_router(bdii_router)

# Include Waitlist router (Coming Soon Page)
from routes.waitlist.waitlist_routes import router as waitlist_router
app.include_router(waitlist_router)

# Include Trust Integration Demo router (Circle Trust Order - Shadow Mode)
from routes.trust_integration_demo import router as trust_demo_router
app.include_router(trust_demo_router)

# Mount static files for local uploads
uploads_dir = Path("/app/backend/uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Mount static files for fallback images and assets
static_dir = Path("/app/backend/static")
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

from fastapi.responses import FileResponse
import mimetypes
from pathlib import Path

# Custom image serving endpoint with proper content-type
@app.get("/cdn/news/{filename}")
async def serve_news_image(filename: str):
    """Serve news images with proper content-type headers"""
    file_path = Path("/var/www/cdn.banibs.com/news") / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Determine content type
    content_type, _ = mimetypes.guess_type(str(file_path))
    if not content_type:
        content_type = "image/jpeg"  # Default for news images
    
    return FileResponse(
        path=str(file_path),
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*"
        }
    )

# Mount CDN fallback images
cdn_fallback_dir = Path("/var/www/cdn.banibs.com/fallback") 
cdn_fallback_dir.mkdir(parents=True, exist_ok=True)
app.mount("/cdn/fallback", StaticFiles(directory=str(cdn_fallback_dir)), name="cdn-fallback")

# Phase 3.5 - Request logging middleware
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        duration = time.time() - start_time
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {duration:.3f}s"
        )
        
        return response

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize APScheduler for automated RSS sync and Beanie ODM"""
    # Initialize Beanie for messaging (Phase 3.1)
    from beanie import init_beanie
    from models.messaging_conversation import Conversation
    from models.messaging_message import Message
    
    await init_beanie(
        database=db,
        document_models=[Conversation, Message],
    )
    logger.info("Beanie ODM initialized for BANIBS Connect messaging")
    
    # Initialize scheduler
    init_scheduler()
    logger.info("BANIBS RSS scheduler initialized")
    
    # Phase 8.2 - Ensure database indices for performance
    from db.indices import ensure_all_indices
    try:
        await ensure_all_indices()
    except Exception as e:
        logger.error(f"Failed to create indices: {e}")
    
    # ADCS v1.0 - Initialize AI Double-Check System
    from adcs.audit_log import ADCSAuditLog
    try:
        await ADCSAuditLog.ensure_indexes()
        logger.info("ADCS v1.0 initialized - AI Double-Check System active")
    except Exception as e:
        logger.error(f"Failed to initialize ADCS: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()