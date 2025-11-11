"""
News Categorization Service - Phase 7.6.1
Intelligent categorization of news items into homepage sections
"""

from typing import Dict, List, Any, Optional
from datetime import datetime


def categorize_news_item(item: Dict[str, Any]) -> str:
    """
    Categorize a news item into one of the homepage sections.
    
    Sections: "us", "world", "business", "tech", "sports"
    
    Logic:
    1. Check category field for direct matches
    2. Check region for US vs World distinction
    3. Check sourceName for additional context
    4. Default to "world" if unclear
    
    Args:
        item: News item dictionary from MongoDB
        
    Returns:
        Section identifier: "us", "world", "business", "tech", or "sports"
    """
    category = (item.get('category') or '').lower()
    region = (item.get('region') or '').lower()
    source_name = (item.get('sourceName') or '').lower()
    
    # Business section
    business_keywords = [
        'business', 'economy', 'entrepreneur', 'startup', 
        'wealth', 'finance', 'grant', 'funding'
    ]
    if any(keyword in category for keyword in business_keywords):
        return 'business'
    if 'business' in source_name or 'entrepreneur' in source_name:
        return 'business'
    
    # Tech section
    tech_keywords = [
        'technology', 'tech', 'innovation', 'ai', 'digital',
        'startup', 'cyber', 'software'
    ]
    if any(keyword in category for keyword in tech_keywords):
        return 'tech'
    if 'tech' in source_name or 'innovation' in source_name:
        return 'tech'
    
    # Sports section
    sports_keywords = ['sport', 'athletic', 'game', 'championship']
    if any(keyword in category for keyword in sports_keywords):
        return 'sports'
    if 'sport' in source_name:
        return 'sports'
    
    # US section - domestic/Americas focus
    us_indicators = [
        'americas', 'united states', 'usa', 'us', 'america',
        'domestic', 'national'
    ]
    if any(indicator in region for indicator in us_indicators):
        return 'us'
    
    # Check for US-focused sources
    us_sources = [
        'npr', 'bloomberg', 'black enterprise', 'essence',
        'grants.gov', 'uncf', 'mbda'
    ]
    if any(us_source in source_name for us_source in us_sources):
        return 'us'
    
    # World section - international focus
    world_regions = [
        'global', 'africa', 'asia', 'europe', 'middle east', 
        'pacific', 'international'
    ]
    if any(world_region in region for world_region in world_regions):
        return 'world'
    
    world_keywords = ['world', 'international', 'global']
    if any(keyword in category for keyword in world_keywords):
        return 'world'
    
    # Default to world for uncategorized items
    return 'world'


def sort_items_by_section(items: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Sort news items into sections for homepage display.
    
    Args:
        items: List of news item dictionaries from MongoDB
        
    Returns:
        Dictionary with section keys and lists of items:
        {
            "hero": [item],  # Featured/hero story
            "top_stories": [items],  # Top 6 stories
            "us": [items],
            "world": [items],
            "business": [items],
            "tech": [items],
            "sports": [items]
        }
    """
    result = {
        'hero': [],
        'top_stories': [],
        'us': [],
        'world': [],
        'business': [],
        'tech': [],
        'sports': []
    }
    
    # Separate featured item if exists
    featured = None
    regular_items = []
    
    for item in items:
        if item.get('isFeatured'):
            if not featured:  # Only take first featured item
                featured = item
        else:
            regular_items.append(item)
    
    # Add featured item as hero
    if featured:
        result['hero'] = [featured]
    
    # Process remaining items
    for item in regular_items:
        section = categorize_news_item(item)
        result[section].append(item)
    
    # Fill top_stories from most populated sections
    # Priority order: business, tech, world, us, sports
    top_stories_pool = []
    for section in ['business', 'tech', 'world', 'us', 'sports']:
        top_stories_pool.extend(result[section][:3])  # Take top 3 from each
    
    # Sort by published date and take top 6
    top_stories_pool.sort(
        key=lambda x: x.get('publishedAt', datetime.min),
        reverse=True
    )
    result['top_stories'] = top_stories_pool[:6]
    
    return result


def get_section_display_name(section: str) -> str:
    """Get display name for section identifier"""
    display_names = {
        'us': 'US',
        'world': 'World',
        'business': 'Business',
        'tech': 'Technology',
        'sports': 'Sports'
    }
    return display_names.get(section, section.title())
