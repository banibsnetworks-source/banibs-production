"""
Phase 7.5.2 - Health Check Endpoint
Provides system health status for uptime monitoring
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

router = APIRouter(prefix="/api", tags=["health"])

# Database connection with TLS support
client = AsyncIOMotorClient(
    os.environ['MONGO_URL'],
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=5000
)
db = client[os.environ['DB_NAME']]


@router.get("/health")
async def health_check():
    """
    System health check endpoint
    
    Returns:
    - 200 OK if all systems operational
    - 503 Service Unavailable if critical systems down
    
    Checks:
    - API server is running
    - Database connectivity
    - Basic response time
    
    Used by: UptimeRobot, internal monitoring, load balancers
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "BANIBS API",
        "version": "1.0.0",
        "checks": {}
    }
    
    # Check 1: API Server (implicit - if this runs, API is up)
    health_status["checks"]["api_server"] = {
        "status": "healthy",
        "message": "API server responding"
    }
    
    # Check 2: Database Connectivity
    try:
        # Ping database to verify connection
        await db.command("ping")
        
        # Check if we can query collections
        news_count = await db.news_items.count_documents({})
        
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": f"Database connected ({news_count} news items)",
            "connection": "active"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}",
            "connection": "failed"
        }
    
    # Check 3: Critical Collections Exist
    try:
        collections = await db.list_collection_names()
        critical_collections = [
            "news_items",
            "unified_users",
            "business_listings",
            "job_listings",
            "groups",
            "notifications",
            "adcs_audit_logs"
        ]
        
        missing = [c for c in critical_collections if c not in collections]
        
        if missing:
            health_status["checks"]["collections"] = {
                "status": "warning",
                "message": f"Missing collections: {', '.join(missing)}"
            }
        else:
            health_status["checks"]["collections"] = {
                "status": "healthy",
                "message": "All critical collections present"
            }
    except Exception as e:
        health_status["checks"]["collections"] = {
            "status": "warning",
            "message": f"Collection check failed: {str(e)}"
        }
    
    # Check 4: Notification System
    try:
        notification_count = await db.notifications.count_documents({})
        health_status["checks"]["notifications"] = {
            "status": "healthy",
            "message": f"Notification system operational ({notification_count} notifications)",
            "count": notification_count
        }
    except Exception as e:
        health_status["checks"]["notifications"] = {
            "status": "warning",
            "message": f"Notification check failed: {str(e)}"
        }
    
    # Check 5: ADCS Audit Logs
    try:
        audit_count = await db.adcs_audit_logs.count_documents({})
        pending_count = await db.adcs_audit_logs.count_documents({"approval_status": "pending_founder"})
        health_status["checks"]["adcs"] = {
            "status": "healthy",
            "message": f"ADCS operational ({audit_count} logs, {pending_count} pending)",
            "audit_logs": audit_count,
            "pending_approvals": pending_count
        }
    except Exception as e:
        health_status["checks"]["adcs"] = {
            "status": "warning",
            "message": f"ADCS check failed: {str(e)}"
        }
    
    # Overall status determination
    if health_status["status"] == "unhealthy":
        raise HTTPException(
            status_code=503,
            detail=health_status
        )
    
    return health_status


@router.get("/health/simple")
async def simple_health_check():
    """
    Minimal health check for basic uptime monitoring
    Returns 200 OK if API is responding
    """
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
