import hashlib
from datetime import datetime

# Phase 4.1 - IP hashing utility
def hash_ip(ip_address: str) -> str:
    """
    Hash IP address using SHA-256 for anonymous tracking
    Does not store raw IP for privacy
    """
    return hashlib.sha256(ip_address.encode()).hexdigest()

# Phase 4.1 - Reactions helpers
async def toggle_reaction(db, opportunity_id: str, ip_hash: str, reaction_type: str = "like"):
    """
    Toggle a reaction (like) for an opportunity
    If exists, remove it (unlike)
    If doesn't exist, add it (like)
    Returns: ("added" | "removed", new_count)
    """
    existing = await db.reactions.find_one({
        "opportunity_id": opportunity_id,
        "ip_hash": ip_hash,
        "reaction_type": reaction_type
    })
    
    if existing:
        # Unlike - remove the reaction
        await db.reactions.delete_one({"_id": existing["_id"]})
        action = "removed"
    else:
        # Like - add the reaction
        await db.reactions.insert_one({
            "opportunity_id": opportunity_id,
            "ip_hash": ip_hash,
            "reaction_type": reaction_type,
            "timestamp": datetime.utcnow()
        })
        action = "added"
    
    # Get new count
    count = await db.reactions.count_documents({
        "opportunity_id": opportunity_id,
        "reaction_type": reaction_type
    })
    
    return action, count

async def get_reaction_count(db, opportunity_id: str, reaction_type: str = "like"):
    """
    Get count of reactions for an opportunity
    """
    count = await db.reactions.count_documents({
        "opportunity_id": opportunity_id,
        "reaction_type": reaction_type
    })
    return count

# Phase 4.1 - Comments helpers
async def create_comment(db, opportunity_id: str, display_name: str, body: str):
    """
    Create a new comment
    """
    # Fallback to Anonymous if name is empty
    if not display_name or not display_name.strip():
        display_name = "Anonymous"
    
    comment = {
        "opportunity_id": opportunity_id,
        "display_name": display_name.strip(),
        "body": body.strip(),
        "timestamp": datetime.utcnow(),
        "status": "visible"
    }
    
    result = await db.comments.insert_one(comment)
    comment["_id"] = result.inserted_id
    return comment

async def get_visible_comments(db, opportunity_id: str):
    """
    Get all visible comments for an opportunity
    Ordered by timestamp (oldest first)
    """
    cursor = db.comments.find({
        "opportunity_id": opportunity_id,
        "status": "visible"
    }).sort("timestamp", 1)
    
    comments = await cursor.to_list(length=None)
    return comments

async def hide_comment(db, comment_id: str):
    """
    Hide a comment (admin action)
    Does not delete, sets status to "hidden"
    """
    result = await db.comments.update_one(
        {"_id": comment_id},
        {"$set": {"status": "hidden"}}
    )
    return result.modified_count > 0

async def get_comment_count(db, opportunity_id: str):
    """
    Get count of visible comments for an opportunity
    """
    count = await db.comments.count_documents({
        "opportunity_id": opportunity_id,
        "status": "visible"
    })
    return count
