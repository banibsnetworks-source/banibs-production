import os
from motor.motor_asyncio import AsyncIOMotorClient
from models.job_listing import JobListingDB
from typing import Optional, List, Dict, Any
from datetime import datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
job_listings_collection = db.job_listings


async def create_job_listing(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new job listing
    
    Args:
        job_data: Dictionary containing job listing fields
        
    Returns:
        Created job listing document
    """
    job = JobListingDB(**job_data)
    job_dict = job.dict()
    
    # Convert datetime objects to ISO strings for MongoDB
    for field in ['created_at', 'updated_at', 'posted_at', 'expires_at', 'sentiment_at']:
        if field in job_dict and job_dict[field] is not None:
            if isinstance(job_dict[field], datetime):
                job_dict[field] = job_dict[field].isoformat()
    
    await job_listings_collection.insert_one(job_dict)
    return job_dict


async def get_job_listing_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a job listing by ID
    
    Args:
        job_id: Job listing UUID
        
    Returns:
        Job listing document or None if not found
    """
    job = await job_listings_collection.find_one({"id": job_id}, {"_id": 0})
    return job


async def get_job_listings(
    status: Optional[str] = None,
    employer_id: Optional[str] = None,
    industry: Optional[str] = None,
    remote_type: Optional[str] = None,
    job_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[List[Dict[str, Any]], int]:
    """
    Get job listings with filters and pagination
    
    Args:
        status: Filter by status (approved, pending, etc.)
        employer_id: Filter by employer
        industry: Filter by industry
        remote_type: Filter by remote type
        job_type: Filter by job type
        skip: Pagination offset
        limit: Number of results per page
        
    Returns:
        Tuple of (job listings, total count)
    """
    query = {}
    
    if status:
        query["status"] = status
    if employer_id:
        query["employer_id"] = employer_id
    if industry:
        query["industry"] = {"$regex": f"^{industry}$", "$options": "i"}
    if remote_type:
        query["remote_type"] = remote_type
    if job_type:
        query["job_type"] = job_type
    
    # Get total count
    total = await job_listings_collection.count_documents(query)
    
    # Get paginated results
    jobs = await job_listings_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return jobs, total


async def update_job_listing(job_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Update a job listing
    
    Args:
        job_id: Job listing UUID
        update_data: Fields to update
        
    Returns:
        Updated job listing or None if not found
    """
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = await job_listings_collection.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_job_listing_by_id(job_id)
    return None


async def delete_job_listing(job_id: str) -> bool:
    """
    Delete a job listing
    
    Args:
        job_id: Job listing UUID
        
    Returns:
        True if deleted, False if not found
    """
    result = await job_listings_collection.delete_one({"id": job_id})
    return result.deleted_count > 0


async def increment_job_view(job_id: str) -> None:
    """
    Increment view count for a job listing
    
    Args:
        job_id: Job listing UUID
    """
    await job_listings_collection.update_one(
        {"id": job_id},
        {"$inc": {"view_count": 1}}
    )


async def increment_job_applications(job_id: str) -> None:
    """
    Increment application count for a job listing
    
    Args:
        job_id: Job listing UUID
    """
    await job_listings_collection.update_one(
        {"id": job_id},
        {"$inc": {"application_count": 1}}
    )
