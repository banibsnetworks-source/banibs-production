"""
RSS Feed Utilities
Fetches, parses, and stores RSS feed items
"""

import feedparser
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
from models.news import NewsItemDB
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_items

def generate_content_hash(title: str, source_name: str) -> str:
    """Generate unique hash for deduplication"""
    content = f"{title.lower()}:{source_name.lower()}"
    return hashlib.md5(content.encode()).hexdigest()

def extract_image_from_entry(entry) -> Optional[str]:
    """Extract image URL from RSS entry"""
    # Try media:content
    if hasattr(entry, 'media_content') and len(entry.media_content) > 0:
        return entry.media_content[0].get('url')
    
    # Try media:thumbnail
    if hasattr(entry, 'media_thumbnail') and len(entry.media_thumbnail) > 0:
        return entry.media_thumbnail[0].get('url')
    
    # Try enclosure
    if hasattr(entry, 'enclosures') and len(entry.enclosures) > 0:
        enclosure = entry.enclosures[0]
        if enclosure.get('type', '').startswith('image/'):
            return enclosure.get('href')
    
    return None

def parse_published_date(entry) -> datetime:
    """Parse published date from RSS entry"""
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        from time import struct_time
        import time
        return datetime.fromtimestamp(time.mktime(entry.published_parsed))
    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        from time import struct_time
        import time
        return datetime.fromtimestamp(time.mktime(entry.updated_parsed))
    else:
        return datetime.utcnow()

async def fetch_and_store_feed(url: str, category: str, source_name: str, limit: int = 10) -> int:
    """
    Fetch RSS feed and store items in database
    
    Args:
        url: RSS feed URL
        category: Category for the items (Business, Education, Community, etc.)
        source_name: Name of the source (e.g., "Black Enterprise")
        limit: Maximum number of items to fetch per source
    
    Returns:
        Number of new items stored
    """
    try:
        # Parse RSS feed
        feed = feedparser.parse(url)
        
        if feed.bozo:
            # Feed has parsing errors but might still have usable data
            print(f"Warning: Feed {source_name} has parsing issues: {feed.bozo_exception}")
        
        stored_count = 0
        
        # Process entries (limit to most recent)
        for entry in feed.entries[:limit]:
            # Generate unique hash for deduplication
            title = entry.get('title', 'Untitled')
            content_hash = generate_content_hash(title, source_name)
            
            # Check if item already exists
            existing = await news_collection.find_one({"content_hash": content_hash})
            if existing:
                continue  # Skip duplicates
            
            # Extract summary/description
            summary = entry.get('summary', entry.get('description', ''))
            # Clean HTML tags from summary if present
            if summary:
                import re
                summary = re.sub('<[^<]+?>', '', summary)
                summary = summary[:500]  # Limit to 500 chars
            
            # Extract image
            image_url = extract_image_from_entry(entry)
            
            # Parse date
            published_at = parse_published_date(entry)
            
            # Get source URL
            source_url = entry.get('link', url)
            
            # Create news item
            news_item = NewsItemDB(
                title=title[:200],  # Limit title length
                summary=summary or f"Read more on {source_name}",
                category=category,
                imageUrl=image_url,
                publishedAt=published_at,
                sourceUrl=source_url,
                isFeatured=False,
                content_hash=content_hash,
                source_name=source_name
            )
            
            # Store in database
            await news_collection.insert_one(news_item.dict())
            stored_count += 1
        
        return stored_count
    
    except Exception as e:
        print(f"Error fetching RSS feed {source_name}: {str(e)}")
        raise
