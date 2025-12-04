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
from urllib.parse import urlparse

IMG_TAG_REGEX = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)

def _is_probably_image_url(url: str) -> bool:
    """
    Quick validation that a URL looks like an image.
    Checks scheme, netloc, and common image extensions.
    """
    if not url:
        return False
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            return False
        # Check common image extensions
        path_lower = parsed.path.lower()
        return any(path_lower.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"])
    except Exception:
        return False

def _extract_image(entry):
    """
    Phase 6.5.3 - Enhanced image extraction from RSS entry.
    Priority:
      1) media:content / media:thumbnail (RSS media namespace)
      2) enclosure with image/* type (RSS 2.0)
      3) <img> tag inside summary/content (HTML parsing)
      4) (Future) OG image scraping from article URL (disabled for performance)
    
    Returns image URL or None if no valid image found.
    """
    # 1. media:content (WordPress, TechCrunch, many modern RSS feeds)
    media_content = entry.get("media_content") or entry.get("media:content")
    if isinstance(media_content, list) and media_content:
        for m in media_content:
            url = (m.get("url") or "").strip()
            if _is_probably_image_url(url):
                return url

    # 2. media:thumbnail (common in YouTube, podcasts, etc.)
    media_thumb = entry.get("media_thumbnail") or entry.get("media:thumbnail")
    if isinstance(media_thumb, list) and media_thumb:
        for t in media_thumb:
            url = (t.get("url") or "").strip()
            if _is_probably_image_url(url):
                return url

    # 3. enclosure or link of type image/* (RSS 2.0 standard)
    enclosures = entry.get("enclosures") or entry.get("links") or []
    for enc in enclosures:
        enc_type = (enc.get("type") or "").lower()
        url = (enc.get("href") or enc.get("url") or "").strip()
        if enc_type.startswith("image/") and _is_probably_image_url(url):
            return url

    # 4. First <img> tag inside summary/content HTML (very common fallback)
    html_candidates = []
    
    # Check summary
    if "summary" in entry:
        html_candidates.append(entry.get("summary") or "")
    
    # Check content (feedparser may return list of dicts or string)
    if "content" in entry:
        content_val = entry.get("content")
        if isinstance(content_val, list) and content_val:
            html_candidates.extend(c.get("value", "") for c in content_val)
        elif isinstance(content_val, str):
            html_candidates.append(content_val)
    
    # Check description as fallback
    if "description" in entry:
        html_candidates.append(entry.get("description") or "")
    
    # Parse HTML for <img> tags
    for html in html_candidates:
        if not html:
            continue
        for match in IMG_TAG_REGEX.findall(html):
            url = match.strip()
            if _is_probably_image_url(url):
                return url

    # 5. OPTIONAL: OG image scraping (disabled by default for performance)
    # Could be enabled behind a feature flag in future:
    # - Fetches article HTML and extracts og:image meta tag
    # - Adds ~1-3 seconds per article, so guard with limits
    # - Useful for sources that don't include images in RSS

    # No valid image found
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

async def fetch_and_store_feed(
    url: str, 
    category: str, 
    source_name: str, 
    limit: int = 5, 
    fallback_image: Optional[str] = None, 
    region: Optional[str] = None,
    is_black_owned: bool = False,
    is_black_focus: bool = False
) -> int:
    """
    Fetch RSS feed and store items in database with deduplication
    
    Args:
        url: RSS feed URL
        category: Category for the items (Business, Education, Community, etc.)
        source_name: Name of the source (e.g., "Black Enterprise")
        limit: Maximum number of items to fetch per source
        fallback_image: Fallback image URL for items without images
        region: Geographic region (Americas, Africa, Caribbean, etc.)
        is_black_owned: Whether the source is Black-owned/operated
        is_black_focus: Whether the source centers Black communities
    
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
            
            # Apply Black News tagging
            from services.black_news_tagging_service import tag_black_news_item
            news_dict = tag_black_news_item(
                news_dict,
                source_is_black_owned=is_black_owned,
                source_is_black_focus=is_black_focus,
                source_category=category
            )
            
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
