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

import re

IMG_TAG_REGEX = re.compile(r'<img[^>]+src="([^">]+)"', re.IGNORECASE)

def _extract_image(entry):
    """
    Extract the best possible image URL from an RSS entry.
    Checks media, thumbnail, enclosure, and inline <img> tags.
    """
    # 1. media:content (WordPress, TechCrunch, AfroTech)
    media = entry.get("media_content")
    if media and isinstance(media, list):
        for m in media:
            url = m.get("url")
            if url:
                return url

    # 2. media:thumbnail
    thumbs = entry.get("media_thumbnail")
    if thumbs and isinstance(thumbs, list):
        for t in thumbs:
            url = t.get("url")
            if url:
                return url

    # 3. enclosure or link of type image/*
    enclosures = entry.get("enclosures") or entry.get("links")
    if enclosures and isinstance(enclosures, list):
        for enc in enclosures:
            if enc.get("type", "").startswith("image/") and enc.get("href"):
                return enc["href"]

    # 4. First <img> tag inside summary/content HTML
    for field in ["summary", "summary_detail", "content", "description"]:
        html_block = entry.get(field)
        if isinstance(html_block, dict):
            html_block = html_block.get("value")
        if isinstance(html_block, str):
            m = IMG_TAG_REGEX.search(html_block)
            if m:
                return m.group(1)

    # 5. No image found
    return None

def _extract_published(entry):
    for key in ["published", "pubDate", "updated"]:
        if entry.get(key):
            try:
                return parsedate_to_datetime(entry[key])
            except Exception:
                pass
    return datetime.utcnow()


def parse_rss_feed(url: str):
    """
    Fetch and normalize RSS/Atom feed at `url`.
    Returns list of dictionaries compatible with NewsItem schema.
    """
    resp = requests.get(url, headers={"User-Agent": "BANIBSFeedAgent/1.0"}, timeout=20)
    resp.raise_for_status()
    feed = feedparser.parse(resp.content)

    items = []
    for entry in feed.entries:
        title = entry.get("title", "").strip()
        summary = entry.get("summary", "") or entry.get("description", "")
        image = _extract_image(entry)
        published = _extract_published(entry)
        link = entry.get("link", "")

        items.append({
            "title": title,
            "summary": summary.strip()[:500],
            "imageUrl": image,
            "publishedAt": published,
            "sourceUrl": link,
        })

    return items

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
            
            # Apply fallback image if no image found
            if not image_url and fallback_image:
                image_url = fallback_image
            
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
