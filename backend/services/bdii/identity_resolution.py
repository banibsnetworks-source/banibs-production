"""
BDII Identity Resolution Service
BANIBS Distributed Identity Infrastructure - Phase 13

This service provides a unified interface for resolving and threading identities
across all BANIBS modules. It implements the single source of truth pattern
where BGLIS (banibs_users) is the master identity store.

Key Functions:
- resolve_identity(): Accept any identifier (UUID, email, phone, username) → BGLIS identity
- get_peoples_identity(): Get social profile for a BGLIS user
- get_contributor_identity(): Get contributor profile for a BGLIS user
- get_seller_identity(): Get seller/business profile for a BGLIS user (future)
- link_external_identity(): Link OAuth/SSO identities (future)

Architecture:
    BGLIS Identity (banibs_users)
    ├─ UUID (primary key)
    ├─ email, phone, username (lookup keys)
    ├─ roles: ["user", "contributor", "seller", "admin"]
    └─ role-specific profiles:
        ├─ contributor_profile
        ├─ seller_profile (future)
        └─ admin_profile (future)
"""

from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import re
import logging

logger = logging.getLogger(__name__)


class IdentityResolutionService:
    """
    BDII Identity Resolution Service
    
    Provides unified identity lookup and threading across all BANIBS modules.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.banibs_users
        
    async def resolve_identity(
        self,
        identifier: str,
        identifier_type: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Resolve any identifier to a BGLIS identity.
        
        Args:
            identifier: UUID, email, phone, or username
            identifier_type: Optional hint ("uuid", "email", "phone", "username")
        
        Returns:
            Full BGLIS user document or None if not found
        
        Examples:
            # By UUID
            user = await resolve_identity("b95996a9-5c8a-4190-a3d6-07e016d46bf0")
            
            # By email
            user = await resolve_identity("john@example.com")
            
            # By phone
            user = await resolve_identity("+12345678900")
            
            # By username
            user = await resolve_identity("johndoe")
        """
        if not identifier:
            return None
        
        # If type is specified, use direct lookup
        if identifier_type:
            return await self._resolve_by_type(identifier, identifier_type)
        
        # Auto-detect identifier type and resolve
        return await self._auto_resolve(identifier)
    
    async def _resolve_by_type(
        self,
        identifier: str,
        identifier_type: str
    ) -> Optional[Dict[str, Any]]:
        """Resolve identity by specific type"""
        
        query_map = {
            "uuid": {"id": identifier},
            "email": {"email": identifier.lower()},
            "phone": {"phone_number": identifier},
            "username": {"username": identifier}
        }
        
        query = query_map.get(identifier_type)
        if not query:
            logger.warning(f"Unknown identifier type: {identifier_type}")
            return None
        
        user = await self.users_collection.find_one(query, {"_id": 0})
        return user
    
    async def _auto_resolve(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Auto-detect identifier type and resolve
        
        Detection logic:
        - UUID: 36 chars with hyphens (8-4-4-4-12 pattern)
        - Email: contains @ symbol
        - Phone: starts with + and contains digits
        - Username: alphanumeric, underscores, hyphens
        """
        identifier = identifier.strip()
        
        # Try UUID pattern (8-4-4-4-12)
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        if re.match(uuid_pattern, identifier, re.IGNORECASE):
            return await self._resolve_by_type(identifier, "uuid")
        
        # Try email pattern
        if '@' in identifier:
            return await self._resolve_by_type(identifier, "email")
        
        # Try phone pattern (E.164 format: +1234567890)
        phone_pattern = r'^\+\d{10,15}$'
        if re.match(phone_pattern, identifier):
            return await self._resolve_by_type(identifier, "phone")
        
        # Try username (fallback)
        # Username is alphanumeric, underscores, hyphens (3-30 chars)
        username_pattern = r'^[a-zA-Z0-9_-]{3,30}$'
        if re.match(username_pattern, identifier):
            return await self._resolve_by_type(identifier, "username")
        
        logger.warning(f"Could not detect identifier type for: {identifier}")
        return None
    
    async def get_peoples_identity(
        self,
        bglis_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get Peoples (social) identity for a BGLIS user.
        
        Args:
            bglis_id: BGLIS UUID
        
        Returns:
            Dictionary with social profile data
            {
                "bglis_id": str,
                "username": str,
                "name": str,
                "avatar_url": str,
                "bio": str,
                "is_peoples": bool (if they've created a Peoples profile)
            }
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            return None
        
        # Extract social profile data
        peoples_identity = {
            "bglis_id": user.get("id"),
            "username": user.get("username"),
            "name": user.get("name"),
            "avatar_url": user.get("avatar_url") or user.get("profile_picture_url"),
            "bio": user.get("bio"),
            "emoji_identity": user.get("emoji_identity"),
            "is_peoples": True  # In BANIBS, all users have Peoples social layer
        }
        
        return peoples_identity
    
    async def get_contributor_identity(
        self,
        bglis_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get Contributor identity for a BGLIS user.
        
        Args:
            bglis_id: BGLIS UUID
        
        Returns:
            Dictionary with contributor profile data or None if not a contributor
            {
                "bglis_id": str,
                "is_contributor": bool,
                "organization": str,
                "display_name": str,
                "bio": str,
                "website_or_social": str,
                "verified": bool,
                "total_submissions": int,
                "approved_submissions": int,
                "featured_submissions": int
            }
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            return None
        
        # Check if user has contributor role
        roles = user.get("roles", [])
        if "contributor" not in roles:
            return {
                "bglis_id": user.get("id"),
                "is_contributor": False
            }
        
        # Extract contributor profile
        contributor_profile = user.get("contributor_profile", {})
        
        contributor_identity = {
            "bglis_id": user.get("id"),
            "is_contributor": True,
            "organization": contributor_profile.get("organization"),
            "display_name": contributor_profile.get("display_name"),
            "bio": contributor_profile.get("bio"),
            "website_or_social": contributor_profile.get("website_or_social"),
            "verified": contributor_profile.get("verified", False),
            "total_submissions": contributor_profile.get("total_submissions", 0),
            "approved_submissions": contributor_profile.get("approved_submissions", 0),
            "featured_submissions": contributor_profile.get("featured_submissions", 0)
        }
        
        return contributor_identity
    
    async def get_seller_identity(
        self,
        bglis_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get Seller/Business identity for a BGLIS user.
        
        Args:
            bglis_id: BGLIS UUID
        
        Returns:
            Dictionary with seller profile data or None if not a seller
            {
                "bglis_id": str,
                "is_seller": bool,
                "business_name": str,
                "verified_seller": bool,
                ...
            }
        
        Note: This is a placeholder for future seller integration.
        Currently returns is_seller=False for all users.
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            return None
        
        # Check if user has seller role (future)
        roles = user.get("roles", [])
        if "seller" not in roles:
            return {
                "bglis_id": user.get("id"),
                "is_seller": False
            }
        
        # Extract seller profile (future)
        seller_profile = user.get("seller_profile", {})
        
        seller_identity = {
            "bglis_id": user.get("id"),
            "is_seller": True,
            "business_name": seller_profile.get("business_name"),
            "verified_seller": seller_profile.get("verified_seller", False),
            # Add more seller fields as needed
        }
        
        return seller_identity
    
    async def get_admin_identity(
        self,
        bglis_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get Admin identity for a BGLIS user.
        
        Args:
            bglis_id: BGLIS UUID
        
        Returns:
            Dictionary with admin profile data or None if not an admin
            {
                "bglis_id": str,
                "is_admin": bool,
                "admin_level": str (super_admin, admin, moderator),
                ...
            }
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            return None
        
        # Check if user has admin role
        roles = user.get("roles", [])
        admin_roles = ["super_admin", "admin", "moderator"]
        
        is_admin = any(role in roles for role in admin_roles)
        
        if not is_admin:
            return {
                "bglis_id": user.get("id"),
                "is_admin": False
            }
        
        # Determine admin level
        admin_level = "user"
        if "super_admin" in roles:
            admin_level = "super_admin"
        elif "admin" in roles:
            admin_level = "admin"
        elif "moderator" in roles:
            admin_level = "moderator"
        
        admin_identity = {
            "bglis_id": user.get("id"),
            "is_admin": True,
            "admin_level": admin_level,
            "roles": roles
        }
        
        return admin_identity
    
    async def get_full_identity(
        self,
        bglis_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get complete threaded identity with all role-specific data.
        
        Args:
            bglis_id: BGLIS UUID
        
        Returns:
            Dictionary with all identity layers:
            {
                "bglis": {...},           # Core BGLIS identity
                "peoples": {...},         # Social identity
                "contributor": {...},     # Contributor identity (if applicable)
                "seller": {...},          # Seller identity (if applicable)
                "admin": {...}            # Admin identity (if applicable)
            }
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            return None
        
        full_identity = {
            "bglis": {
                "id": user.get("id"),
                "email": user.get("email"),
                "phone_number": user.get("phone_number"),
                "username": user.get("username"),
                "name": user.get("name"),
                "roles": user.get("roles", []),
                "membership_level": user.get("membership_level"),
                "created_at": user.get("created_at")
            },
            "peoples": await self.get_peoples_identity(bglis_id),
            "contributor": await self.get_contributor_identity(bglis_id),
            "seller": await self.get_seller_identity(bglis_id),
            "admin": await self.get_admin_identity(bglis_id)
        }
        
        return full_identity
    
    async def link_external_identity(
        self,
        bglis_id: str,
        external_type: str,
        external_id: str,
        external_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Link external identity (OAuth, SSO) to BGLIS user.
        
        Args:
            bglis_id: BGLIS UUID
            external_type: Type of external identity (e.g., "google", "github", "oauth2")
            external_id: External user ID
            external_data: Optional additional data from external provider
        
        Returns:
            True if linked successfully, False otherwise
        
        Example:
            # Link Google OAuth identity
            await link_external_identity(
                bglis_id="uuid-123",
                external_type="google",
                external_id="google-user-id-456",
                external_data={"email": "user@gmail.com", "picture": "..."}
            )
        
        Note: This is a placeholder for future OAuth/SSO integration.
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            logger.warning(f"Cannot link external identity: BGLIS user {bglis_id} not found")
            return False
        
        # Get or create external_identities array
        external_identities = user.get("external_identities", [])
        
        # Check if external identity already linked
        existing = next(
            (ext for ext in external_identities if ext.get("type") == external_type and ext.get("id") == external_id),
            None
        )
        
        if existing:
            logger.info(f"External identity {external_type}:{external_id} already linked to {bglis_id}")
            return True
        
        # Add new external identity
        new_external = {
            "type": external_type,
            "id": external_id,
            "data": external_data or {},
            "linked_at": None  # Should use datetime.now(timezone.utc).isoformat()
        }
        
        external_identities.append(new_external)
        
        # Update user document
        result = await self.users_collection.update_one(
            {"id": bglis_id},
            {"$set": {"external_identities": external_identities}}
        )
        
        if result.modified_count > 0:
            logger.info(f"Linked external identity {external_type}:{external_id} to BGLIS user {bglis_id}")
            return True
        
        logger.error(f"Failed to link external identity {external_type}:{external_id} to {bglis_id}")
        return False
    
    async def resolve_multiple_identities(
        self,
        identifiers: List[str]
    ) -> Dict[str, Optional[Dict[str, Any]]]:
        """
        Resolve multiple identities in a single call.
        
        Args:
            identifiers: List of identifiers (UUIDs, emails, phones, usernames)
        
        Returns:
            Dictionary mapping identifier → BGLIS identity
        
        Example:
            identities = await resolve_multiple_identities([
                "uuid-123",
                "john@example.com",
                "+12345678900"
            ])
        """
        results = {}
        
        for identifier in identifiers:
            results[identifier] = await self.resolve_identity(identifier)
        
        return results
    
    async def check_role(
        self,
        bglis_id: str,
        role: str
    ) -> bool:
        """
        Check if a BGLIS user has a specific role.
        
        Args:
            bglis_id: BGLIS UUID
            role: Role to check (e.g., "contributor", "seller", "admin")
        
        Returns:
            True if user has the role, False otherwise
        """
        user = await self.resolve_identity(bglis_id)
        if not user:
            return False
        
        roles = user.get("roles", [])
        return role in roles


# Singleton instance (to be initialized with database connection)
_identity_service: Optional[IdentityResolutionService] = None


def get_identity_service(db: AsyncIOMotorDatabase) -> IdentityResolutionService:
    """
    Get or create IdentityResolutionService singleton.
    
    Args:
        db: MongoDB database instance
    
    Returns:
        IdentityResolutionService instance
    """
    global _identity_service
    if _identity_service is None:
        _identity_service = IdentityResolutionService(db)
    return _identity_service
