"""
BANIBS OS / Developer Platform - Data Models
Phase 15.0 - The technical backbone for the BANIBS ecosystem
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum


class APIKeyStatus(str, Enum):
    """API key statuses"""
    ACTIVE = "active"
    DISABLED = "disabled"


class AppStatus(str, Enum):
    """App statuses"""
    DRAFT = "draft"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class ServiceStatus(str, Enum):
    """System service statuses"""
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    OUTAGE = "outage"


# ==================== DEVELOPER PROFILE ====================

class DeveloperProfile(BaseModel):
    """Developer profile model"""
    id: str
    user_id: str
    display_name: str
    website: Optional[str] = None
    github: Optional[str] = None
    api_key: Optional[str] = None
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "dev-001",
                "user_id": "user-001",
                "display_name": "Black Tech Innovators",
                "website": "https://blacktech.dev",
                "github": "blacktechinnovators",
                "api_key": "banibs_live_abc123xyz",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class DeveloperProfileCreate(BaseModel):
    """Request model for creating developer profile"""
    display_name: str = Field(..., min_length=1, max_length=100)
    website: Optional[str] = None
    github: Optional[str] = None


class DeveloperProfileUpdate(BaseModel):
    """Request model for updating developer profile"""
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    website: Optional[str] = None
    github: Optional[str] = None


# ==================== API KEY ====================

class DeveloperAPIKey(BaseModel):
    """Developer API key model"""
    id: str
    user_id: str
    label: str
    api_key: str
    created_at: datetime
    last_used: Optional[datetime] = None
    status: APIKeyStatus
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "key-001",
                "user_id": "user-001",
                "label": "Production API Key",
                "api_key": "banibs_live_abc123xyz789",
                "created_at": "2024-01-01T00:00:00Z",
                "last_used": "2024-01-15T10:30:00Z",
                "status": "active"
            }
        }


class DeveloperAPIKeyCreate(BaseModel):
    """Request model for creating API key"""
    label: str = Field(..., min_length=1, max_length=100)


class DeveloperAPIKeyUpdate(BaseModel):
    """Request model for updating API key"""
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[APIKeyStatus] = None


# ==================== DEVELOPER APP ====================

class DeveloperApp(BaseModel):
    """Developer app model"""
    id: str
    user_id: str
    name: str
    description: str
    redirect_url: str
    client_id: str
    client_secret: str
    status: AppStatus
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "app-001",
                "user_id": "user-001",
                "name": "Black Business Analytics",
                "description": "Analytics dashboard for Black-owned businesses",
                "redirect_url": "https://myapp.com/callback",
                "client_id": "banibs_client_abc123",
                "client_secret": "banibs_secret_xyz789",
                "status": "active",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class DeveloperAppCreate(BaseModel):
    """Request model for creating app"""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    redirect_url: str = Field(..., min_length=1, max_length=500)


class DeveloperAppUpdate(BaseModel):
    """Request model for updating app"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    redirect_url: Optional[str] = Field(None, min_length=1, max_length=500)
    status: Optional[AppStatus] = None


# ==================== WEBHOOK ENDPOINT ====================

class WebhookEndpoint(BaseModel):
    """Webhook endpoint model"""
    id: str
    user_id: str
    url: str
    events: List[str]
    secret: str
    created_at: datetime
    last_success: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "hook-001",
                "user_id": "user-001",
                "url": "https://myapp.com/webhooks/banibs",
                "events": ["user.created", "business.created", "transaction.created"],
                "secret": "whsec_abc123xyz",
                "created_at": "2024-01-01T00:00:00Z",
                "last_success": "2024-01-15T10:30:00Z"
            }
        }


class WebhookEndpointCreate(BaseModel):
    """Request model for creating webhook endpoint"""
    url: str = Field(..., min_length=1, max_length=500)
    events: List[str] = Field(..., min_items=1)


class WebhookEndpointUpdate(BaseModel):
    """Request model for updating webhook endpoint"""
    url: Optional[str] = Field(None, min_length=1, max_length=500)
    events: Optional[List[str]] = Field(None, min_items=1)


# ==================== API LOG ENTRY ====================

class APILogEntry(BaseModel):
    """API log entry model"""
    id: str
    user_id: str
    method: str
    endpoint: str
    status_code: int
    timestamp: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "log-001",
                "user_id": "user-001",
                "method": "GET",
                "endpoint": "/api/businesses",
                "status_code": 200,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


# ==================== SYSTEM STATUS ====================

class SystemStatusService(BaseModel):
    """System status service model"""
    name: str
    status: ServiceStatus
    last_updated: datetime
    message: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Authentication Service",
                "status": "operational",
                "last_updated": "2024-01-15T10:30:00Z",
                "message": "All systems operational"
            }
        }


# Response models

class DeveloperAPIKeysResponse(BaseModel):
    """Response model for listing API keys"""
    api_keys: List[DeveloperAPIKey]
    total: int


class DeveloperAppsResponse(BaseModel):
    """Response model for listing apps"""
    apps: List[DeveloperApp]
    total: int


class WebhookEndpointsResponse(BaseModel):
    """Response model for listing webhook endpoints"""
    webhooks: List[WebhookEndpoint]
    total: int


class APILogsResponse(BaseModel):
    """Response model for listing API logs"""
    logs: List[APILogEntry]
    total: int


class SystemStatusResponse(BaseModel):
    """Response model for system status"""
    services: List[SystemStatusService]
    overall_status: ServiceStatus
    last_updated: datetime
