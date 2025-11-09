import os
from motor.motor_asyncio import AsyncIOMotorClient
from models.application_record import ApplicationRecordDB
from typing import Optional, List, Dict, Any
from datetime import datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
application_records_collection = db.application_records


async def create_application(application_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new job application
    
    Args:
        application_data: Dictionary containing application fields
        
    Returns:
        Created application document
    """
    application = ApplicationRecordDB(**application_data)
    application_dict = application.dict()
    
    # Convert datetime objects to ISO strings for MongoDB
    for field in ['created_at', 'updated_at', 'status_updated_at']:
        if field in application_dict and application_dict[field] is not None:
            if isinstance(application_dict[field], datetime):
                application_dict[field] = application_dict[field].isoformat()
    
    await application_records_collection.insert_one(application_dict)
    return application_dict


async def get_application_by_id(application_id: str) -> Optional[Dict[str, Any]]:
    """
    Get an application by ID
    
    Args:
        application_id: Application UUID
        
    Returns:
        Application document or None if not found
    """
    application = await application_records_collection.find_one(
        {"id": application_id},
        {"_id": 0}
    )
    return application


async def get_applications_for_job(
    job_id: str,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[List[Dict[str, Any]], int]:
    """
    Get applications for a specific job
    
    Args:
        job_id: Job listing UUID
        status: Filter by application status
        skip: Pagination offset
        limit: Number of results per page
        
    Returns:
        Tuple of (applications, total count)
    """
    query = {"job_id": job_id}
    
    if status:
        query["status"] = status
    
    # Get total count
    total = await application_records_collection.count_documents(query)
    
    # Get paginated results
    applications = await application_records_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return applications, total


async def get_applications_for_candidate(
    candidate_id: str,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[List[Dict[str, Any]], int]:
    """
    Get applications submitted by a candidate
    
    Args:
        candidate_id: Candidate profile UUID
        status: Filter by application status
        skip: Pagination offset
        limit: Number of results per page
        
    Returns:
        Tuple of (applications, total count)
    """
    query = {"candidate_id": candidate_id}
    
    if status:
        query["status"] = status
    
    # Get total count
    total = await application_records_collection.count_documents(query)
    
    # Get paginated results
    applications = await application_records_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return applications, total


async def update_application_status(
    application_id: str,
    status: str,
    recruiter_id: Optional[str] = None,
    notes: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Update application status
    
    Args:
        application_id: Application UUID
        status: New status
        recruiter_id: ID of recruiter updating status
        notes: Optional recruiter notes
        
    Returns:
        Updated application or None if not found
    """
    update_data = {
        "status": status,
        "status_updated_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if recruiter_id:
        update_data["status_updated_by"] = recruiter_id
    if notes:
        update_data["recruiter_notes"] = notes
    
    result = await application_records_collection.update_one(
        {"id": application_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return await get_application_by_id(application_id)
    return None


async def check_duplicate_application(job_id: str, candidate_id: str) -> bool:
    """
    Check if candidate has already applied to this job
    
    Args:
        job_id: Job listing UUID
        candidate_id: Candidate profile UUID
        
    Returns:
        True if duplicate application exists
    """
    existing = await application_records_collection.find_one({
        "job_id": job_id,
        "candidate_id": candidate_id
    })
    
    return existing is not None


# Analytics helper functions for Phase 7.1 Cycle 1.4
async def get_application_count_by_job_ids(job_ids: List[str]) -> int:
    """
    Count total applications for a list of job IDs
    
    Args:
        job_ids: List of job UUIDs
        
    Returns:
        Total count of applications
    """
    count = await application_records_collection.count_documents({
        "job_id": {"$in": job_ids}
    })
    return count


async def get_applications_by_job_ids(job_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Get all applications for a list of job IDs
    
    Args:
        job_ids: List of job UUIDs
        
    Returns:
        List of application documents
    """
    cursor = application_records_collection.find(
        {"job_id": {"$in": job_ids}},
        {"_id": 0}
    )
    applications = await cursor.to_list(length=None)
    return applications


async def get_recent_applications_count(
    job_ids: List[str], 
    since: datetime
) -> int:
    """
    Count applications created after a specific date for given job IDs
    
    Args:
        job_ids: List of job UUIDs
        since: DateTime cutoff (only count applications after this)
        
    Returns:
        Count of recent applications
    """
    # Convert datetime to ISO string for comparison
    since_str = since.isoformat()
    
    count = await application_records_collection.count_documents({
        "job_id": {"$in": job_ids},
        "created_at": {"$gte": since_str}
    })
    return count

