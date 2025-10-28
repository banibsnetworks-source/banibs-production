import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Optional

# JWT Configuration from environment
JWT_ACCESS_SECRET = os.environ.get("JWT_ACCESS_SECRET", "dev-access-secret-change-in-production")
JWT_REFRESH_SECRET = os.environ.get("JWT_REFRESH_SECRET", "dev-refresh-secret-change-in-production")
JWT_ALGORITHM = "HS256"

# Parse expiration times
def parse_expiration(exp_str: str) -> timedelta:
    """Parse expiration string like '15m', '7d', '1h'"""
    if exp_str.endswith('m'):
        return timedelta(minutes=int(exp_str[:-1]))
    elif exp_str.endswith('h'):
        return timedelta(hours=int(exp_str[:-1]))
    elif exp_str.endswith('d'):
        return timedelta(days=int(exp_str[:-1]))
    else:
        return timedelta(minutes=15)  # default

JWT_ACCESS_EXPIRES = parse_expiration(os.environ.get("JWT_ACCESS_EXPIRES", "15m"))
JWT_REFRESH_EXPIRES = parse_expiration(os.environ.get("JWT_REFRESH_EXPIRES", "7d"))

def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new JWT access token
    
    Args:
        data: Payload to encode (typically user_id, email, role)
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + JWT_ACCESS_EXPIRES
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, JWT_ACCESS_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new JWT refresh token
    
    Args:
        data: Payload to encode (typically user_id, email)
        expires_delta: Optional custom expiration time
    
    Returns:
        Encoded JWT refresh token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + JWT_REFRESH_EXPIRES
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> Optional[Dict]:
    """
    Verify and decode an access token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_ACCESS_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Verify it's an access token
        if payload.get("type") != "access":
            return None
        
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def verify_refresh_token(token: str) -> Optional[Dict]:
    """
    Verify and decode a refresh token
    
    Args:
        token: JWT refresh token string
    
    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_REFRESH_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Verify it's a refresh token
        if payload.get("type") != "refresh":
            return None
        
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def decode_token_without_verification(token: str) -> Optional[Dict]:
    """
    Decode token without verification (for debugging only)
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except jwt.JWTError:
        return None
