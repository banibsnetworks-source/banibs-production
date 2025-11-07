"""
Fix news items with None published_at dates
Sets them to Nov 2, 2025 to enable sentiment analytics
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

async def update_published_dates():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client['banibs']
    news = db['news_items']
    
    # Set publishedAt to Nov 2, 2025 for all items with None
    target_date = datetime(2025, 11, 2, 12, 0, 0, tzinfo=timezone.utc)
    
    print(f"Updating news items with publishedAt=None to {target_date}")
    
    result = await news.update_many(
        {'publishedAt': None},
        {'$set': {'publishedAt': target_date}}
    )
    
    print(f'✅ Updated {result.modified_count} news items')
    
    # Verify
    updated_count = await news.count_documents({'publishedAt': target_date})
    print(f'Verification: {updated_count} items now have publishedAt={target_date}')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_published_dates())
