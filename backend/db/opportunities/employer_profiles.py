import os
from motor.motor_asyncio import AsyncIOMotorClient
from models.employer_profile import EmployerProfileDB
from typing import Optional, List, Dict, Any
from datetime import datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
employer_profiles_collection = db.employer_profiles


async def create_employer_profile(employer_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new employer profile
    
    Args:
        employer_data: Dictionary containing employer profile fields
        
    Returns:
        Created employer profile document
    """
    employer = EmployerProfileDB(**employer_data)
    employer_dict = employer.dict()
    
    # Convert datetime objects to ISO strings for MongoDB
    for field in ['created_at', 'updated_at', 'verified_at']:
        if field in employer_dict and employer_dict[field] is not None:
            if isinstance(employer_dict[field], datetime):
                employer_dict[field] = employer_dict[field].isoformat()
    
    await employer_profiles_collection.insert_one(employer_dict)
    return employer_dict


async def get_employer_profile_by_id(employer_id: str) -> Optional[Dict[str, Any]]:
    """
    Get an employer profile by ID
    
    Args:
        employer_id: Employer profile UUID
        
    Returns:
        Employer profile document or None if not found
    """
    employer = await employer_profiles_collection.find_one({"id": employer_id}, {"_id": 0})
    return employer


async def get_employer_profile_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get an employer profile by contact email
    
    Args:
        email: Contact email address
        
    Returns:
        Employer profile document or None if not found
    """
    employer = await employer_profiles_collection.find_one(
        {"contact_email": email},
        {"_id": 0}
    )
    return employer


async def get_employer_profiles(
    verified: Optional[bool] = None,
    sector: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[List[Dict[str, Any]], int]:
    """
    Get employer profiles with filters and pagination
    
    Args:
        verified: Filter by verification status
        sector: Filter by sector
        skip: Pagination offset
        limit: Number of results per page
        
    Returns:
        Tuple of (employer profiles, total count)
    """
    query = {}
    
    if verified is not None:
        query["verified"] = verified
    if sector:
        query["sector"] = {"$regex": f"^{sector}$", "$options": "i"}
    
    # Get total count
    total = await employer_profiles_collection.count_documents(query)
    
    # Get paginated results
    employers = await employer_profiles_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return employers, total


async def update_employer_profile(employer_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update an employer profile
    
    Args:
        employer_id: Employer profile UUID
        update_data: Fields to update
        
    Returns:
        Updated employer profile or None if not found
    """
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = await employer_profiles_collection.update_one(
        {"id": employer_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_employer_profile_by_id(employer_id)
    return None


async def verify_employer(employer_id: str, admin_id: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Verify an employer profile
    
    Args:
        employer_id: Employer profile UUID
        admin_id: Admin user ID performing verification
        notes: Optional verification notes
        
    Returns:
        Updated employer profile or None if not found
    """
    update_data = {
        "verified": True,
        "verified_by_admin_id": admin_id,
        "verified_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if notes:
        update_data["verification_notes"] = notes
    
    result = await employer_profiles_collection.update_one(
        {"id": employer_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_employer_profile_by_id(employer_id)
    return None
