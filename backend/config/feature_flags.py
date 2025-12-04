"""
BANIBS Feature Flags
Global configuration for turning features on/off
"""
import os

# ============================================================================
# COMING SOON / MAINTENANCE MODE
# ============================================================================
# When True: Show "Coming Soon" page to public visitors
# When False: Show normal BANIBS experience
#
# Backend, admin, and Founder access remains fully functional regardless
COMING_SOON_MODE = os.getenv('COMING_SOON_MODE', 'false').lower() == 'true'

# Message displayed on Coming Soon page
COMING_SOON_MESSAGE = """
BANIBS is in early access. Systems are online, but we are currently 
tuning the news engine and core experience. Thank you for your patience 
as we prepare the full public launch.
"""

# Paths that bypass Coming Soon mode (always accessible)
BYPASS_PATHS = [
    '/api/',  # All API endpoints remain functional
    '/admin/',  # Admin access
    '/auth/',  # Authentication
    '/developer/',  # Developer platform
]


def should_show_coming_soon(path: str) -> bool:
    """
    Determine if Coming Soon page should be shown for this path
    
    Args:
        path: Request path
        
    Returns:
        True if Coming Soon should be shown, False otherwise
    """
    if not COMING_SOON_MODE:
        return False
    
    # Check if path is in bypass list
    for bypass_path in BYPASS_PATHS:
        if path.startswith(bypass_path):
            return False
    
    return True


def get_feature_flags() -> dict:
    """
    Get all feature flags for debugging
    
    Returns:
        Dictionary of feature flags and their states
    """
    return {
        "coming_soon_mode": COMING_SOON_MODE,
        "coming_soon_message": COMING_SOON_MESSAGE,
        "bypass_paths": BYPASS_PATHS,
    }
