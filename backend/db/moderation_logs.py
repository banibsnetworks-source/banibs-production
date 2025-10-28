from datetime import datetime
from typing import Literal, Optional

async def insert_moderation_log(
    db,
    opportunity_id: str,
    moderator_user_id: str,
    action_type: Literal["approve", "reject", "feature"],
    note: Optional[str] = None
):
    """
    Phase 3.2 - Insert moderation log entry
    """
    log_entry = {
        "opportunity_id": opportunity_id,
        "moderator_user_id": moderator_user_id,
        "action_type": action_type,
        "note": note,
        "timestamp": datetime.utcnow()
    }
    
    result = await db.moderation_logs.insert_one(log_entry)
    return str(result.inserted_id)

async def get_moderation_logs_for_opportunity(db, opportunity_id: str):
    """
    Phase 3.2 - Get all moderation logs for a specific opportunity
    """
    cursor = db.moderation_logs.find({"opportunity_id": opportunity_id}).sort("timestamp", -1)
    logs = await cursor.to_list(length=None)
    return logs

async def get_moderation_logs_by_moderator(db, moderator_user_id: str):
    """
    Phase 3.2 - Get all moderation logs by a specific moderator
    """
    cursor = db.moderation_logs.find({"moderator_user_id": moderator_user_id}).sort("timestamp", -1)
    logs = await cursor.to_list(length=None)
    return logs

async def get_all_moderation_logs(db):
    """
    Phase 3.2 - Get all moderation logs (for CSV export)
    """
    cursor = db.moderation_logs.find({}).sort("timestamp", -1)
    logs = await cursor.to_list(length=None)
    return logs
