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
from routes.opportunities import router as opportunities_router
from routes.auth import router as auth_router
from routes.unified_auth import router as unified_auth_router  # Phase 6.0 - Unified Identity
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

# Include auth router (already has /api prefix) - DISABLED FOR PHASE 6.0 TESTING
# app.include_router(auth_router)

# Include unified auth router (Phase 6.0 - Unified Identity & SSO)
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

# Include Phase 7.1 - Opportunities Exchange routers
from routes.opportunities.jobs import router as jobs_router
from routes.opportunities.recruiters import router as recruiters_router, employer_router
from routes.opportunities.candidates import router as candidates_router
from routes.opportunities.applications import router as applications_router
app.include_router(jobs_router)  # Job listings API
app.include_router(recruiters_router)  # Recruiter verification and profiles
app.include_router(employer_router)  # Employer profiles
app.include_router(candidates_router)  # Candidate profiles
app.include_router(applications_router)  # Job applications

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
    """Initialize APScheduler for automated RSS sync"""
    init_scheduler()
    logger.info("BANIBS RSS scheduler initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()