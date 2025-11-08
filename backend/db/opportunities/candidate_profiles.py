import os
from motor.motor_asyncio import AsyncIOMotorClient
from models.candidate_profile import CandidateProfileDB
from typing import Optional, List, Dict, Any
from datetime import datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
candidate_profiles_collection = db.candidate_profiles


async def create_candidate_profile(candidate_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new candidate profile
    
    Args:
        candidate_data: Dictionary containing candidate profile fields
        
    Returns:
        Created candidate profile document
    """
    candidate = CandidateProfileDB(**candidate_data)
    candidate_dict = candidate.dict()
    
    # Convert datetime objects to ISO strings for MongoDB
    for field in ['created_at', 'updated_at']:
        if field in candidate_dict and candidate_dict[field] is not None:
            if isinstance(candidate_dict[field], datetime):
                candidate_dict[field] = candidate_dict[field].isoformat()
    
    await candidate_profiles_collection.insert_one(candidate_dict)
    return candidate_dict


async def get_candidate_profile_by_id(candidate_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a candidate profile by ID
    
    Args:
        candidate_id: Candidate profile UUID
        
    Returns:
        Candidate profile document or None if not found
    """
    candidate = await candidate_profiles_collection.find_one({"id": candidate_id}, {"_id": 0})
    return candidate


async def get_candidate_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a candidate profile by user ID
    
    Args:
        user_id: Unified user UUID
        
    Returns:
        Candidate profile document or None if not found
    """
    candidate = await candidate_profiles_collection.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    return candidate


async def get_public_candidate_profiles(
    skip: int = 0,
    limit: int = 20
) -> tuple[List[Dict[str, Any]], int]:
    """
    Get public candidate profiles (profile_public = true)
    
    Args:
        skip: Pagination offset
        limit: Number of results per page
        
    Returns:
        Tuple of (candidate profiles, total count)
    """
    query = {"profile_public": True}
    
    # Get total count
    total = await candidate_profiles_collection.count_documents(query)
    
    # Get paginated results
    candidates = await candidate_profiles_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return candidates, total


async def update_candidate_profile(candidate_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a candidate profile
    
    Args:
        candidate_id: Candidate profile UUID
        update_data: Fields to update
        
    Returns:
        Updated candidate profile or None if not found
    """
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = await candidate_profiles_collection.update_one(
        {"id": candidate_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_candidate_profile_by_id(candidate_id)
    return None


async def add_saved_job(candidate_id: str, job_id: str) -> Optional[Dict[str, Any]]:
    """
    Add a job to candidate's saved jobs list
    
    Args:
        candidate_id: Candidate profile UUID
        job_id: Job listing UUID to save
        
    Returns:
        Updated candidate profile or None if not found
    """
    result = await candidate_profiles_collection.update_one(
        {"id": candidate_id},
        {
            "$addToSet": {"saved_job_ids": job_id},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    if result.modified_count > 0:
        return await get_candidate_profile_by_id(candidate_id)
    return None


async def remove_saved_job(candidate_id: str, job_id: str) -> Optional[Dict[str, Any]]:
    """
    Remove a job from candidate's saved jobs list
    
    Args:
        candidate_id: Candidate profile UUID
        job_id: Job listing UUID to remove
        
    Returns:
        Updated candidate profile or None if not found
    """
    result = await candidate_profiles_collection.update_one(
        {"id": candidate_id},
        {
            "$pull": {"saved_job_ids": job_id},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    if result.modified_count > 0:
        return await get_candidate_profile_by_id(candidate_id)
    return None


async def increment_candidate_applications(candidate_id: str) -> None:
    """
    Increment candidate's total applications count
    
    Args:
        candidate_id: Candidate profile UUID
    """
    await candidate_profiles_collection.update_one(
        {"id": candidate_id},
        {"$inc": {"total_applications": 1}}
    )
