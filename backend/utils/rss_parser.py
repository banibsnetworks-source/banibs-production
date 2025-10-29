"""
RSS Feed Utilities
Fetches, parses, and stores RSS feed items with deduplication
"""

import feedparser
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
from models.news import NewsItemDB
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
from email.utils import parsedate_to_datetime

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_items

def make_fingerprint(source_name: str, title: str) -> str:
    """
    Create a deterministic hash for deduplication
    Format: SHA256(sourceName::title)
    """
    raw = f"{source_name}::{title}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

def extract_image_from_entry(entry) -> Optional[str]:
    """
    Extract image URL from RSS entry - tries multiple common patterns
    Enhanced to search HTML content for <img> tags
    """
    import re
    
    # 1. Try media:content
    if hasattr(entry, 'media_content') and len(entry.media_content) > 0:
        for m in entry.media_content:
            url = m.get('url')
            if url and _is_valid_image_url(url):
                return url
    
    # 2. Try media:thumbnail
    if hasattr(entry, 'media_thumbnail') and len(entry.media_thumbnail) > 0:
        for t in entry.media_thumbnail:
            url = t.get('url')
            if url and _is_valid_image_url(url):
                return url
    
    # 3. Try enclosures
    if hasattr(entry, 'enclosures') and len(entry.enclosures) > 0:
        for e in entry.enclosures:
            if e.get('type', '').startswith('image/') and e.get('href'):
                url = e['href']
                if _is_valid_image_url(url):
                    return url
    
    # 4. Try links
    if hasattr(entry, 'links'):
        for link in entry.links:
            if link.get('type', '').startswith('image/') and link.get('href'):
                url = link['href']
                if _is_valid_image_url(url):
                    return url
    
    # 5. NEW: Search HTML content for <img> tags
    html_fields = [
        entry.get('content', [{}])[0].get('value', '') if entry.get('content') else '',
        entry.get('summary', ''),
        entry.get('description', '')
    ]
    
    for html_content in html_fields:
        if html_content:
            # Find <img src="..."> tags
            img_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
            for img_url in img_matches:
                if _is_valid_image_url(img_url):
                    return img_url
    
    return None

def _is_valid_image_url(url: str) -> bool:
    """Check if URL looks like a valid image"""
    if not url or len(url) < 10:
        return False
    
    # Must be HTTP/HTTPS
    if not url.startswith(('http://', 'https://')):
        return False
    
    # Avoid common non-image patterns
    avoid_patterns = [
        'favicon.ico',
        'logo.png',
        'avatar.',
        'profile.',
        '1x1.',
        'tracking.',
        'pixel.',
        'spacer.'
    ]
    
    url_lower = url.lower()
    for pattern in avoid_patterns:
        if pattern in url_lower:
            return False
    
    # Prefer common image extensions or large images
    good_patterns = [
        '.jpg', '.jpeg', '.png', '.webp', '.gif',
        'width=', 'w=', 'h=', 'resize=', 'crop='
    ]
    
    for pattern in good_patterns:
        if pattern in url_lower:
            return True
    
    # If no extension found, accept if URL is reasonably long (likely has parameters)
    return len(url) > 50

def extract_published_date(entry) -> datetime:
    """Parse published date from RSS entry"""
    
    # Try published_parsed first (most reliable)
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        import time
        return datetime.fromtimestamp(time.mktime(entry.published_parsed))
    
    # Try updated_parsed
    if hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        import time
        return datetime.fromtimestamp(time.mktime(entry.updated_parsed))
    
    # Try parsing string dates
    for field in ['published', 'pubDate', 'updated']:
        date_str = entry.get(field)
        if date_str:
            try:
                return parsedate_to_datetime(date_str)
            except Exception:
                pass
    
    # Fallback to now
    return datetime.utcnow()

def clean_html(text: str) -> str:
    """Strip HTML tags and clean text"""
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^<]+?>', '', text)
    # Decode HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = text.replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&quot;', '"').replace('&#39;', "'")
    # Clean whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

async def fetch_and_store_feed(url: str, category: str, source_name: str, limit: int = 5, fallback_image: Optional[str] = None) -> int:
    """
    Fetch RSS feed and store items in database with deduplication
    
    Args:
        url: RSS feed URL
        category: Category for the items (Business, Education, Community, etc.)
        source_name: Name of the source (e.g., "Black Enterprise")
        limit: Maximum number of items to fetch per source
    
    Returns:
        Number of new items stored
    """
    try:
        # Parse RSS feed with custom user agent
        import requests
        headers = {"User-Agent": "BANIBSFeedAgent/1.0"}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        
        if feed.bozo:
            # Feed has parsing errors but might still have usable data
            print(f"Warning: Feed {source_name} has parsing issues: {feed.bozo_exception}")
        
        stored_count = 0
        
        # Process entries (limit to most recent)
        for entry in feed.entries[:limit]:
            # Extract data
            title = entry.get('title', 'Untitled').strip()
            if not title or title == 'Untitled':
                continue  # Skip entries without titles
            
            # Generate fingerprint for deduplication
            fingerprint = make_fingerprint(source_name, title)
            
            # Check if item already exists
            existing = await news_collection.find_one({"fingerprint": fingerprint})
            if existing:
                continue  # Skip duplicates
            
            # Extract and clean summary
            summary = entry.get('summary', entry.get('description', ''))
            summary = clean_html(summary)
            if not summary:
                summary = f"Read more on {source_name}"
            summary = summary[:500]  # Limit to 500 chars
            
            # Extract image
            image_url = extract_image_from_entry(entry)
            
            # Parse date
            published_at = extract_published_date(entry)
            
            # Get source URL
            source_url = entry.get('link', url)
            
            # Create news item
            news_item = NewsItemDB(
                title=title[:200],  # Limit title length
                summary=summary,
                category=category,
                imageUrl=image_url,
                publishedAt=published_at,
                sourceUrl=source_url,
                sourceName=source_name,
                isFeatured=False,
                external=True,  # RSS content is external
                fingerprint=fingerprint
            )
            
            # Store in database
            await news_collection.insert_one(news_item.dict())
            stored_count += 1
        
        return stored_count
    
    except Exception as e:
        print(f"Error fetching RSS feed {source_name}: {str(e)}")
        raise
