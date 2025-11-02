"""
Phase 6.0 - JWT Service

Handles JWT token generation, validation, and refresh.

Token Strategy:
- Access Token: 15 minutes (localStorage)
- Refresh Token: 7 days (HttpOnly cookie)
- Shared across *.banibs.com domains
"""

import jwt
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


class JWTService:
    """
    JWT token service for BANIBS unified identity
    """
    
    @staticmethod
    def create_access_token(
        user_id: str,
        email: str,
        roles: list,
        membership_level: str
    ) -> str:
        """
        Create access token (15 min expiry)
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        payload = {
            "sub": user_id,  # Subject (user ID)
            "email": email,
            "roles": roles,
            "membership_level": membership_level,
            "type": "access",
            "iat": int(now.timestamp()),  # Issued at
            "exp": int(expire.timestamp())  # Expiration
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return token
    
    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """
        Create refresh token (7 days expiry)
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        payload = {
            "sub": user_id,
            "type": "refresh",
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp())
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return token
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        Returns:
            Decoded payload if valid, None if invalid
        """
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            # Verify token type
            if payload.get("type") != token_type:
                return None
            
            return payload
        
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def generate_verification_token() -> str:
        """
        Generate email verification or password reset token
        """
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def get_token_expiry(days: int = 1) -> datetime:
        """
        Get expiry datetime for verification tokens
        """
        return datetime.now(timezone.utc) + timedelta(days=days)
