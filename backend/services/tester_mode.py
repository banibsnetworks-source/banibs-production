"""
Tester Mode Service - Early Tester Preparation
Phase 2: Add tester logging and feature flags

Features:
- Tester identification
- Enhanced logging for tester actions
- Feature flag management
- Tester-specific feedback collection
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from db.connection import get_db

# Configure tester logger
tester_logger = logging.getLogger("tester_mode")
tester_logger.setLevel(logging.DEBUG)

# Tester email domains/patterns (can be configured)
TESTER_EMAIL_PATTERNS = [
    "@test.banibs.com",
    "@tester.banibs.com",
    "test_",
    "_tester"
]

# Feature flags for tester mode
TESTER_FEATURES = {
    "advanced_debugging": True,
    "unreleased_features": True,
    "performance_metrics": True,
    "verbose_errors": True,
}


def is_tester(email: Optional[str] = None, user_id: Optional[str] = None) -> bool:
    """
    Check if a user is a designated tester
    
    Args:
        email: User email to check
        user_id: User ID to check (can check against whitelist)
    
    Returns:
        True if user is a tester
    """
    if email:
        # Check email patterns
        for pattern in TESTER_EMAIL_PATTERNS:
            if pattern in email.lower():
                return True
    
    # Additional checks can be added:
    # - Check user_id against whitelist in DB
    # - Check user role/permissions
    # - Check environment variable
    
    return False


async def log_tester_action(
    user_id: str,
    action: str,
    details: Optional[Dict[str, Any]] = None,
    success: bool = True,
    error: Optional[str] = None
):
    """
    Log a tester action for analysis
    
    Args:
        user_id: Tester's user ID
        action: Action performed (e.g., "login", "create_group", "api_call")
        details: Additional action details
        success: Whether the action succeeded
        error: Error message if action failed
    """
    db = await get_db()
    
    log_entry = {
        "user_id": user_id,
        "action": action,
        "details": details or {},
        "success": success,
        "error": error,
        "timestamp": datetime.now(timezone.utc),
        "environment": "test"
    }
    
    try:
        # Store in database
        await db.tester_logs.insert_one(log_entry)
        
        # Also log to console for real-time monitoring
        log_msg = f"TESTER ACTION | User: {user_id} | Action: {action} | Success: {success}"
        if error:
            log_msg += f" | Error: {error}"
        
        if success:
            tester_logger.info(log_msg)
        else:
            tester_logger.error(log_msg)
            
    except Exception as e:
        tester_logger.error(f"Failed to log tester action: {str(e)}")


def get_feature_flag(feature_name: str, is_tester_user: bool = False) -> bool:
    """
    Get feature flag value
    
    Args:
        feature_name: Name of the feature
        is_tester_user: Whether the user is a tester
    
    Returns:
        True if feature is enabled for this user
    """
    # Testers get access to all features
    if is_tester_user:
        return TESTER_FEATURES.get(feature_name, True)
    
    # Regular users only get production-ready features
    # (add your production feature flags here)
    return False


async def get_tester_stats(user_id: Optional[str] = None, days: int = 7) -> Dict[str, Any]:
    """
    Get statistics about tester activity
    
    Args:
        user_id: Specific tester ID (optional)
        days: Number of days to look back
    
    Returns:
        Dictionary with tester statistics
    """
    db = await get_db()
    
    from datetime import timedelta
    cutoff_time = datetime.now(timezone.utc) - timedelta(days=days)
    
    query = {"timestamp": {"$gte": cutoff_time}}
    if user_id:
        query["user_id"] = user_id
    
    # Get action counts
    total_actions = await db.tester_logs.count_documents(query)
    failed_actions = await db.tester_logs.count_documents({**query, "success": False})
    
    # Get action breakdown
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$action",
            "count": {"$sum": 1},
            "failures": {
                "$sum": {"$cond": [{"$eq": ["$success", False]}, 1, 0]}
            }
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    action_breakdown = await db.tester_logs.aggregate(pipeline).to_list(10)
    
    return {
        "period_days": days,
        "total_actions": total_actions,
        "failed_actions": failed_actions,
        "success_rate": (total_actions - failed_actions) / total_actions * 100 if total_actions > 0 else 100,
        "top_actions": action_breakdown,
        "user_id": user_id
    }


async def submit_tester_feedback(
    user_id: str,
    feedback_type: str,
    title: str,
    description: str,
    severity: str = "medium",
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Submit feedback from a tester
    
    Args:
        user_id: Tester's user ID
        feedback_type: Type (bug, feature_request, improvement, praise)
        title: Brief title
        description: Detailed description
        severity: Severity level (low, medium, high, critical)
        metadata: Additional context (browser, device, etc.)
    """
    db = await get_db()
    
    feedback_entry = {
        "id": str(__import__('uuid').uuid4()),
        "user_id": user_id,
        "feedback_type": feedback_type,
        "title": title,
        "description": description,
        "severity": severity,
        "metadata": metadata or {},
        "status": "new",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.tester_feedback.insert_one(feedback_entry)
    
    tester_logger.info(
        f"TESTER FEEDBACK | User: {user_id} | Type: {feedback_type} | "
        f"Severity: {severity} | Title: {title}"
    )
    
    return feedback_entry["id"]


# Middleware helper for request logging
def log_tester_request(user_id: str, endpoint: str, method: str, response_time: float, status_code: int):
    """
    Log API request from tester
    
    Args:
        user_id: Tester's user ID
        endpoint: API endpoint called
        method: HTTP method
        response_time: Response time in milliseconds
        status_code: HTTP status code
    """
    tester_logger.debug(
        f"TESTER API | User: {user_id} | {method} {endpoint} | "
        f"Status: {status_code} | Time: {response_time:.2f}ms"
    )
