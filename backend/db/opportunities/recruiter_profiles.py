import os
from motor.motor_asyncio import AsyncIOMotorClient
from models.recruiter_profile import RecruiterProfileDB
from typing import Optional, List, Dict, Any
from datetime import datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
recruiter_profiles_collection = db.recruiter_profiles


async def create_recruiter_profile(recruiter_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new recruiter profile
    
    Args:
        recruiter_data: Dictionary containing recruiter profile fields
        
    Returns:
        Created recruiter profile document
    """
    recruiter = RecruiterProfileDB(**recruiter_data)
    recruiter_dict = recruiter.dict()
    
    # Convert datetime objects to ISO strings for MongoDB
    for field in ['created_at', 'updated_at', 'verification_requested_at', 'verified_at']:
        if field in recruiter_dict and recruiter_dict[field] is not None:
            if isinstance(recruiter_dict[field], datetime):
                recruiter_dict[field] = recruiter_dict[field].isoformat()
    
    await recruiter_profiles_collection.insert_one(recruiter_dict)
    return recruiter_dict


async def get_recruiter_profile_by_id(recruiter_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a recruiter profile by ID
    
    Args:
        recruiter_id: Recruiter profile UUID
        
    Returns:
        Recruiter profile document or None if not found
    """
    recruiter = await recruiter_profiles_collection.find_one({"id": recruiter_id}, {"_id": 0})
    return recruiter


async def get_recruiter_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a recruiter profile by user ID
    
    Args:
        user_id: Unified user UUID
        
    Returns:
        Recruiter profile document or None if not found
    """
    recruiter = await recruiter_profiles_collection.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    return recruiter


async def get_recruiter_profiles(
    verified: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[List[Dict[str, Any]], int]:
    """
    Get recruiter profiles with filters and pagination
    
    Args:
        verified: Filter by verification status
        skip: Pagination offset
        limit: Number of results per page
        
    Returns:
        Tuple of (recruiter profiles, total count)
    """
    query = {}
    
    if verified is not None:
        query["verified"] = verified
    
    # Get total count
    total = await recruiter_profiles_collection.count_documents(query)
    
    # Get paginated results
    recruiters = await recruiter_profiles_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return recruiters, total


async def update_recruiter_profile(recruiter_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a recruiter profile
    
    Args:
        recruiter_id: Recruiter profile UUID
        update_data: Fields to update
        
    Returns:
        Updated recruiter profile or None if not found
    """
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = await recruiter_profiles_collection.update_one(
        {"id": recruiter_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_recruiter_profile_by_id(recruiter_id)
    return None


async def verify_recruiter(recruiter_id: str, admin_id: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Verify a recruiter profile
    
    Args:
        recruiter_id: Recruiter profile UUID
        admin_id: Admin user ID performing verification
        notes: Optional verification notes
        
    Returns:
        Updated recruiter profile or None if not found
    """
    update_data = {
        "verified": True,
        "verified_by_admin_id": admin_id,
        "verified_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if notes:
        update_data["verification_notes"] = notes
    
    result = await recruiter_profiles_collection.update_one(
        {"id": recruiter_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_recruiter_profile_by_id(recruiter_id)
    return None


async def request_recruiter_verification(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Mark a recruiter profile as requesting verification
    
    Args:
        user_id: User ID requesting verification
        
    Returns:
        Updated recruiter profile or None if not found
    """
    result = await recruiter_profiles_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "verification_requested_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    if result.modified_count > 0:
        return await get_recruiter_profile_by_user_id(user_id)
    return None


async def increment_recruiter_stats(recruiter_id: str, jobs_posted: int = 0, applications: int = 0) -> None:
    """
    Increment recruiter activity stats
    
    Args:
        recruiter_id: Recruiter profile UUID
        jobs_posted: Number of jobs to add to total
        applications: Number of applications to add to total
    """
    update_fields = {}
    
    if jobs_posted > 0:
        update_fields["total_jobs_posted"] = jobs_posted
    if applications > 0:
        update_fields["total_applications_received"] = applications
    
    if update_fields:
        await recruiter_profiles_collection.update_one(
            {"id": recruiter_id},
            {"$inc": update_fields}
        )
