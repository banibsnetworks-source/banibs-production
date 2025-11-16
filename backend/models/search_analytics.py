"""
Search Analytics Models - Phase 8.2
Captures business directory search patterns for future BIA
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BusinessSearchEvent(BaseModel):
    """
    Log entry for business directory searches
    Used for future Business Insights Analytics (BIA)
    """
    id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Search parameters
    query_text: Optional[str] = None
    category: Optional[str] = None
    location_type: Optional[str] = None  # "coords" | "zip" | "city_state" | "none"
    
    # Coarse location (privacy-safe)
    search_city: Optional[str] = None
    search_state: Optional[str] = None
    search_zip: Optional[str] = None
    
    # Search context
    radius_km: Optional[float] = None
    sort_method: Optional[str] = None
    results_count: int = 0
    
    # User context (optional, for logged-in users)
    user_id: Optional[str] = None
    user_location_opt_in: bool = False


class BusinessClickEvent(BaseModel):
    """
    Log entry when user clicks through to a business from search results
    """
    id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    business_id: str
    business_name: str
    
    # Context
    came_from_search: bool = False
    search_position: Optional[int] = None  # Position in search results
    distance_miles: Optional[float] = None  # How far from user when clicked
    
    # User
    user_id: Optional[str] = None
