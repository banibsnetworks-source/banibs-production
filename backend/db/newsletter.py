from datetime import datetime

# Phase 4.2 - Newsletter subscriber helpers

async def subscribe_email(db, email: str):
    """
    Subscribe an email to newsletter
    Idempotent: if email exists, returns existing record
    """
    # Check if already subscribed
    existing = await db.newsletter_subscribers.find_one({"email": email})
    
    if existing:
        return existing
    
    # Create new subscription
    subscriber = {
        "email": email,
        "created_at": datetime.utcnow(),
        "confirmed": True
    }
    
    result = await db.newsletter_subscribers.insert_one(subscriber)
    subscriber["_id"] = result.inserted_id
    
    return subscriber

async def get_all_subscribers(db):
    """
    Get all newsletter subscribers
    Admin only
    """
    cursor = db.newsletter_subscribers.find({}).sort("created_at", -1)
    subscribers = await cursor.to_list(length=None)
    return subscribers
