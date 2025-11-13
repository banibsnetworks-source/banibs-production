"""
Handle Generation Utility - Phase B1
Auto-generate URL-safe handles from business names
"""

import re
from typing import Optional


def generate_handle(name: str) -> str:
    """
    Generate a URL-safe handle from a business name
    
    Examples:
        "BANIBS Media Group" -> "banibs-media-group"
        "Joe's Coffee Shop" -> "joes-coffee-shop"
        "Tech & Innovation Co." -> "tech-innovation-co"
    """
    # Convert to lowercase
    handle = name.lower()
    
    # Replace spaces and underscores with hyphens
    handle = handle.replace(' ', '-').replace('_', '-')
    
    # Remove apostrophes
    handle = handle.replace("'", "")
    
    # Remove any character that's not alphanumeric or hyphen
    handle = re.sub(r'[^a-z0-9-]', '', handle)
    
    # Replace multiple consecutive hyphens with single hyphen
    handle = re.sub(r'-+', '-', handle)
    
    # Remove leading/trailing hyphens
    handle = handle.strip('-')
    
    # Limit length to 50 characters
    if len(handle) > 50:
        handle = handle[:50].rstrip('-')
    
    return handle


def validate_handle(handle: str) -> tuple[bool, Optional[str]]:
    """
    Validate a handle format
    
    Returns:
        (is_valid, error_message)
    """
    if not handle:
        return False, "Handle cannot be empty"
    
    if len(handle) < 3:
        return False, "Handle must be at least 3 characters long"
    
    if len(handle) > 50:
        return False, "Handle must be 50 characters or less"
    
    # Check if handle contains only lowercase letters, numbers, and hyphens
    if not re.match(r'^[a-z0-9-]+$', handle):
        return False, "Handle can only contain lowercase letters, numbers, and hyphens"
    
    # Check if handle starts or ends with hyphen
    if handle.startswith('-') or handle.endswith('-'):
        return False, "Handle cannot start or end with a hyphen"
    
    # Check for consecutive hyphens
    if '--' in handle:
        return False, "Handle cannot contain consecutive hyphens"
    
    return True, None


def make_handle_unique(base_handle: str, existing_handles: list[str]) -> str:
    """
    Make a handle unique by appending a number if needed
    
    Args:
        base_handle: The desired handle
        existing_handles: List of handles already in use
    
    Returns:
        Unique handle
    """
    if base_handle not in existing_handles:
        return base_handle
    
    # Try appending numbers until we find a unique one
    counter = 1
    while True:
        candidate = f"{base_handle}-{counter}"
        if candidate not in existing_handles:
            return candidate
        counter += 1
        
        # Safety check to prevent infinite loop
        if counter > 1000:
            # This should never happen in practice
            import uuid
            return f"{base_handle}-{uuid.uuid4().hex[:6]}"
