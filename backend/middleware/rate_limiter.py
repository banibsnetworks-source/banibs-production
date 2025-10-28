from fastapi import Request, HTTPException
from typing import Dict, Tuple
from datetime import datetime, timedelta
import time

# Phase 5.3 - In-memory rate limiter
# Structure: {ip_hash: [(timestamp, endpoint), ...]}
rate_limit_store: Dict[str, list] = {}

# Rate limit configuration
MAX_ACTIONS = 10
TIME_WINDOW_SECONDS = 300  # 5 minutes

def clean_old_entries(ip_hash: str, current_time: float):
    """Remove entries older than the time window"""
    if ip_hash not in rate_limit_store:
        return
    
    cutoff_time = current_time - TIME_WINDOW_SECONDS
    rate_limit_store[ip_hash] = [
        (ts, endpoint) for ts, endpoint in rate_limit_store[ip_hash]
        if ts > cutoff_time
    ]
    
    # Remove key if empty
    if not rate_limit_store[ip_hash]:
        del rate_limit_store[ip_hash]

def check_rate_limit(ip_hash: str, endpoint: str) -> Tuple[bool, int]:
    """
    Check if IP hash has exceeded rate limit for endpoint
    
    Args:
        ip_hash: Hashed IP address
        endpoint: Endpoint being accessed
    
    Returns:
        (is_allowed, remaining_count)
    """
    current_time = time.time()
    
    # Clean old entries
    clean_old_entries(ip_hash, current_time)
    
    # Count recent actions for this endpoint
    if ip_hash not in rate_limit_store:
        rate_limit_store[ip_hash] = []
    
    # Count actions for this specific endpoint
    endpoint_actions = [
        ts for ts, ep in rate_limit_store[ip_hash]
        if ep == endpoint
    ]
    
    actions_count = len(endpoint_actions)
    
    if actions_count >= MAX_ACTIONS:
        return False, 0
    
    # Add current action
    rate_limit_store[ip_hash].append((current_time, endpoint))
    
    remaining = MAX_ACTIONS - actions_count - 1
    return True, remaining

async def enforce_rate_limit(request: Request, endpoint: str, ip_hash: str):
    """
    Enforce rate limit for an endpoint
    Raises HTTPException 429 if limit exceeded
    
    Args:
        request: FastAPI request object
        endpoint: Endpoint identifier (e.g., "comment", "react", "newsletter")
        ip_hash: Hashed IP address
    """
    is_allowed, remaining = check_rate_limit(ip_hash, endpoint)
    
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again shortly."
        )
    
    # Optionally add rate limit headers to response
    # This can be done in a middleware wrapper if needed
    return remaining
