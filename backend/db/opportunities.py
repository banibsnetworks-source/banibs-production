from datetime import datetime
from bson import ObjectId

async def insert_opportunity(db, data: dict):
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
