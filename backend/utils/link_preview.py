"""
Link Preview Service - Phase 8.1
OpenGraph metadata scraper with caching
"""

import requests
from bs4 import BeautifulSoup
from typing import Optional
from datetime import datetime, timedelta
from urllib.parse import urlparse

# Simple in-memory cache with expiry
_cache = {}
CACHE_DURATION = timedelta(hours=24)


def fetch_link_preview(url: str) -> dict:
    """
    Fetch OpenGraph metadata for a URL
    
    Returns:
        {
            "title": str,
            "description": str | None,
            "image": str | None,
            "site": str (domain)
        }
    """
    # Check cache first
    if url in _cache:
        cached_data, cached_time = _cache[url]
        if datetime.now() - cached_time < CACHE_DURATION:
            return cached_data
    
    # Fetch and parse
    try:
        # Use a full browser User-Agent to avoid being blocked
        response = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            },
            timeout=10,
            allow_redirects=True
        )
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract OpenGraph tags
        og_title = _get_meta_tag(soup, "og:title")
        og_description = _get_meta_tag(soup, "og:description")
        og_image = _get_meta_tag(soup, "og:image")
        og_site = _get_meta_tag(soup, "og:site_name")
        
        # Fallbacks
        title = og_title or _get_title_tag(soup) or urlparse(url).netloc
        description = og_description or _get_meta_tag(soup, "description")
        image = og_image
        site = og_site or urlparse(url).netloc
        
        result = {
            "title": title,
            "description": description,
            "image": image,
            "site": site,
            "url": url
        }
        
        # Cache result
        _cache[url] = (result, datetime.now())
        
        return result
        
    except Exception as e:
        # Graceful fallback on error
        domain = urlparse(url).netloc or url
        result = {
            "title": domain,
            "description": None,
            "image": None,
            "site": domain,
            "url": url
        }
        return result


def _get_meta_tag(soup: BeautifulSoup, property_name: str) -> Optional[str]:
    """Extract meta tag content by property or name"""
    # Try property first (og:title)
    tag = soup.find("meta", property=property_name)
    if tag and tag.get("content"):
        return tag["content"]
    
    # Try name (description)
    tag = soup.find("meta", attrs={"name": property_name})
    if tag and tag.get("content"):
        return tag["content"]
    
    return None


def _get_title_tag(soup: BeautifulSoup) -> Optional[str]:
    """Extract page title"""
    title_tag = soup.find("title")
    if title_tag:
        return title_tag.get_text().strip()
    return None
