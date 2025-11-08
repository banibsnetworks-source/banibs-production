"""
Update existing news items with correct regional tags
Maps sourceName to region based on RSS_SOURCES configuration
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.rss_sources import RSS_SOURCES

# Build source name to region mapping
SOURCE_TO_REGION = {}
for source in RSS_SOURCES:
    if 'region' in source and source['region']:
        SOURCE_TO_REGION[source['source_name']] = source['region']

print(f"Found {len(SOURCE_TO_REGION)} sources with regions:")
for name, region in SOURCE_TO_REGION.items():
    print(f"  {name} → {region}")

async def update_regions():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    news = db['news_items']
    
    print(f"\nUpdating regions in {db_name}.news_items...")
    
    total_updated = 0
    
    for source_name, region in SOURCE_TO_REGION.items():
        result = await news.update_many(
            {'sourceName': source_name, 'region': None},
            {'$set': {'region': region}}
        )
        
        if result.modified_count > 0:
            print(f"  Updated {result.modified_count} items from {source_name} to region={region}")
            total_updated += result.modified_count
    
    print(f"\n✅ Total items updated: {total_updated}")
    
    # Verify
    print("\nVerification - Items by region:")
    regions = ['Africa', 'Asia', 'Europe', 'Americas', 'Middle East', 'Global']
    for region in regions:
        count = await news.count_documents({'region': region})
        if count > 0:
            print(f"  {region}: {count} items")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_regions())
