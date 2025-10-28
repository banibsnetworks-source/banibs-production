from datetime import datetime
from bson import ObjectId

async def insert_opportunity(db, data: dict):
    # Convert HttpUrl to string for MongoDB storage
    if "link" in data and data["link"] is not None:
        data["link"] = str(data["link"])
    
    data["approved"] = False
    data["featured"] = False
    data["createdAt"] = datetime.utcnow()
    data["updatedAt"] = datetime.utcnow()
    result = await db.opportunities.insert_one(data)
    return str(result.inserted_id)

async def get_public_opportunities(db, type_filter: str | None = None):
    query = {"approved": True}
    if type_filter and type_filter.lower() != "all":
        query["type"] = type_filter.lower()
    cursor = db.opportunities.find(query).sort("createdAt", -1)
    docs = []
    async for doc in cursor:
        docs.append(doc)
    return docs

async def get_featured_opportunities(db):
    cursor = (
        db.opportunities
        .find({"approved": True, "featured": True})
        .sort("updatedAt", -1)
        .limit(5)
    )
    docs = []
    async for doc in cursor:
        docs.append(doc)
    return docs

async def get_pending_opportunities(db):
    cursor = db.opportunities.find({"approved": False}).sort("createdAt", 1)
    docs = []
    async for doc in cursor:
        docs.append(doc)
    return docs

async def update_opportunity_status(db, opp_id: str, approved: bool, featured: bool | None = None):
    update_fields = {"approved": approved, "updatedAt": datetime.utcnow()}
    if featured is not None:
        update_fields["featured"] = featured
    await db.opportunities.update_one(
        {"_id": ObjectId(opp_id)},
        {"$set": update_fields}
    )
    return True

async def update_opportunity_sponsor_status(db, opp_id: str, is_sponsored: bool, sponsor_label: str | None = None):
    """
    Update opportunity sponsor status (Phase 5.1)
    
    Args:
        db: Database instance
        opp_id: Opportunity ID (ObjectId string)
        is_sponsored: Whether opportunity is sponsored
        sponsor_label: Optional sponsor label text
    
    Returns:
        True if updated
    """
    update_fields = {
        "is_sponsored": is_sponsored,
        "updatedAt": datetime.utcnow()
    }
    if sponsor_label is not None:
        update_fields["sponsor_label"] = sponsor_label
    
    await db.opportunities.update_one(
        {"_id": ObjectId(opp_id)},
        {"$set": update_fields}
    )
    return True

async def get_opportunity_by_id(db, opp_id: str):
    """
    Get single opportunity by ID
    
    Args:
        db: Database instance
        opp_id: Opportunity ID (ObjectId string)
    
    Returns:
        Opportunity document or None
    """
    doc = await db.opportunities.find_one({"_id": ObjectId(opp_id)})
    return doc
