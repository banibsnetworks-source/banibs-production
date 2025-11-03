"""
RSS Feed Utilities
Fetches, parses, and stores RSS feed items with deduplication
"""

import feedparser
import hashlib
import requests
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

async def fetch_and_store_feed(url: str, category: str, source_name: str, limit: int = 5, fallback_image: Optional[str] = None, region: Optional[str] = None) -> int:
    """
    Fetch RSS feed and store items in database with deduplication
    
    Args:
        url: RSS feed URL
        category: Category for the items (Business, Education, Community, etc.)
        source_name: Name of the source (e.g., "Black Enterprise")
        limit: Maximum number of items to fetch per source
        fallback_image: Fallback image URL for items without images
    
    Returns:
        Number of new items stored
    """
    try:
        # Use the new parse_rss_feed function
        feed_items = parse_rss_feed(url)
        
        stored_count = 0
        
        # Process entries (limit to most recent)
        for item in feed_items[:limit]:
            title = item.get('title', '').strip()
            if not title:
                continue  # Skip entries without titles
            
            # Generate fingerprint for deduplication
            fingerprint = make_fingerprint(source_name, title)
            
            # Check if item already exists
            existing = await news_collection.find_one({"fingerprint": fingerprint})
            if existing:
                continue  # Skip duplicates
            
            # Get image URL or use fallback
            image_url = item.get("imageUrl")
            if not image_url and fallback_image:
                image_url = fallback_image
            
            # Clean and limit summary
            summary = item.get('summary', '')
            summary = clean_html(summary) if summary else f"Read more on {source_name}"
            summary = summary[:500]  # Limit to 500 chars
            
            # Phase 6.3: Analyze sentiment (fail gracefully if error)
            sentiment_score = 0.0
            sentiment_label = "neutral"
            sentiment_at = None
            try:
                from services.sentiment_service import analyze_text_sentiment
                text_for_sentiment = f"{title} {summary}"
                sentiment_result = analyze_text_sentiment(text_for_sentiment)
                sentiment_score = sentiment_result["score"]
                sentiment_label = sentiment_result["label"]
                sentiment_at = sentiment_result["analyzed_at"]
            except Exception as sentiment_error:
                print(f"Sentiment analysis failed for {title[:50]}: {sentiment_error}")
                # Continue without sentiment - don't break RSS sync
            
            # Create news item
            news_item = NewsItemDB(
                title=title[:200],  # Limit title length
                summary=summary,
                category=category,
                region=region,  # Geographic region from RSS source config
                imageUrl=image_url,
                publishedAt=item.get('publishedAt') or datetime.utcnow(),
                sourceUrl=item.get('sourceUrl', url),
                sourceName=source_name,
                isFeatured=False,
                external=True,  # RSS content is external
                fingerprint=fingerprint
            )
            
            # Convert to dict and add sentiment fields
            news_dict = news_item.dict()
            news_dict["sentiment_score"] = sentiment_score
            news_dict["sentiment_label"] = sentiment_label
            news_dict["sentiment_at"] = sentiment_at
            
            # Store in database
            await news_collection.insert_one(news_dict)
            stored_count += 1
            
            # Phase 6.4: Route to moderation if needed (fail gracefully if error)
            try:
                from services.moderation_service import handle_content_moderation
                await handle_content_moderation(
                    content_id=news_dict["id"],
                    content_type="news",
                    title=title[:200],
                    sentiment_label=sentiment_label,
                    sentiment_score=sentiment_score
                )
            except Exception as mod_error:
                print(f"Moderation routing failed for {title[:50]}: {mod_error}")
                # Continue without moderation - don't break RSS sync
        
        return stored_count
    
    except Exception as e:
        print(f"Error fetching RSS feed {source_name}: {str(e)}")
        raise
