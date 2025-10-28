"""
Contributor Authentication Routes for BANIBS Phase 2.9
Public users can register and login to submit opportunities
"""

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt
from datetime import datetime
from bson import ObjectId

from models.contributor import (
    ContributorCreate,
    ContributorLogin,
    ContributorPublic,
    ContributorTokenResponse
)
from services.jwt import create_access_token, create_refresh_token
from db.connection import get_db

router = APIRouter(prefix="/api/auth/contributor", tags=["contributor-auth"])

@router.post("/register", response_model=ContributorTokenResponse)
async def register_contributor(
    data: ContributorCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Register a new contributor account
    
    Contributors can submit opportunities but have no admin access
    """
    # Check if email already exists
    existing = await db.contributors.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Hash password
    password_bytes = data.password.encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    # Create contributor document
    contributor_doc = {
        "email": data.email,
        "password_hash": password_hash,
        "name": data.name,
        "organization": data.organization,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into database
    result = await db.contributors.insert_one(contributor_doc)
    contributor_id = str(result.inserted_id)
    
    # Create JWT tokens
    token_data = {
        "user_id": contributor_id,
        "email": data.email,
        "role": "contributor",
        "name": data.name
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"user_id": contributor_id, "email": data.email})
    
    return ContributorTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        contributor=ContributorPublic(
            id=contributor_id,
            email=data.email,
            name=data.name,
            organization=data.organization,
            created_at=contributor_doc["created_at"]
        )
    )

@router.post("/login", response_model=ContributorTokenResponse)
async def login_contributor(
    credentials: ContributorLogin,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Login as contributor
    
    Returns JWT tokens for authenticated contributor
    """
    # Find contributor by email
    contributor = await db.contributors.find_one({"email": credentials.email})
    
    if not contributor:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Verify password
    password_bytes = credentials.password.encode('utf-8')
    stored_hash = contributor['password_hash'].encode('utf-8')
    
    if not bcrypt.checkpw(password_bytes, stored_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Create JWT tokens
    token_data = {
        "user_id": str(contributor['_id']),
        "email": contributor['email'],
        "role": "contributor",
        "name": contributor.get('name', '')
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({
        "user_id": str(contributor['_id']),
        "email": contributor['email']
    })
    
    # Update last login
    await db.contributors.update_one(
        {"_id": contributor['_id']},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return ContributorTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        contributor=ContributorPublic(
            id=str(contributor['_id']),
            email=contributor['email'],
            name=contributor.get('name', ''),
            organization=contributor.get('organization'),
            created_at=contributor['created_at']
        )
    )
