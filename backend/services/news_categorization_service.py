"""
News Categorization Service - Phase 7.6.1
Intelligent categorization of news items into homepage sections
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

# ============================================================================
# RSS V2.0 CATEGORY → HOMEPAGE SECTION MAPPING BRIDGE
# ============================================================================
# Maps RSS source categories to homepage display sections
RSS_V2_TO_HOMEPAGE_MAPPING = {
    'Global Diaspora': 'world',
    'Africa Watch': 'world',
    'Caribbean Watch': 'world',
    'Business & Finance': 'business',
    'Sports': 'sports',
    'Science & Tech': 'tech',
    'Entertainment': 'entertainment',
    'Health & Wellness': 'health',
    'Culture / Civil Rights': 'civil_rights',
    'Rights & Justice': 'civil_rights',
    # Legacy categories
    'World': 'world',
    'World News': 'world',
    'Business': 'business',
    'Technology': 'tech',
    'Community': 'lifestyle',
    'Education': 'education',
}


def categorize_news_item(item: Dict[str, Any]) -> str:
    """
    Categorize a news item into one of the homepage sections.
    
    Sections: "us", "world", "business", "tech", "sports", "entertainment", "health", "civil_rights"
    
    Logic:
    1. Check RSS V2.0 category for direct mapping (PRIORITY)
    2. Check category field for keyword matches
    3. Check region for US vs World distinction
    4. Check sourceName for additional context
    5. Default to "world" if unclear
    
    Args:
        item: News item dictionary from MongoDB
        
    Returns:
        Section identifier: "us", "world", "business", "tech", "sports", etc.
    """
    category = (item.get('category') or '').strip()
    category_lower = category.lower()
    region = (item.get('region') or '').lower()
    source_name = (item.get('sourceName') or '').lower()
    
    # STEP 1: Direct RSS V2.0 category mapping (highest priority)
    if category in RSS_V2_TO_HOMEPAGE_MAPPING:
        mapped_section = RSS_V2_TO_HOMEPAGE_MAPPING[category]
        # Check if it's a US-focused source even within these categories
        if _is_us_focused(source_name, region):
            return 'us'
        return mapped_section
    
    # STEP 2: Keyword-based categorization
    
    # Health section
    health_keywords = [
        'health', 'wellness', 'medical', 'hospital', 'doctor', 
        'medicine', 'disease', 'treatment', 'vaccine', 'cdc', 'who'
    ]
    if any(keyword in category_lower for keyword in health_keywords):
        return 'health'
    
    # Civil Rights / Justice section
    civil_rights_keywords = [
        'civil rights', 'justice', 'equality', 'discrimination', 
        'protest', 'activism', 'human rights', 'rights', 'aclu', 'naacp'
    ]
    if any(keyword in category_lower for keyword in civil_rights_keywords):
        return 'civil_rights'
    
    # Entertainment section
    entertainment_keywords = [
        'entertainment', 'celebrity', 'music', 'film', 'movie', 
        'tv', 'show', 'concert', 'album', 'artist', 'actor'
    ]
    if any(keyword in category_lower for keyword in entertainment_keywords):
        return 'entertainment'
    if any(keyword in source_name for keyword in ['bet', 'vibe', 'billboard', 'rolling stone', 'shadow and act', 'hollywood', 'variety', 'ebony']):
        return 'entertainment'
    
    # Lifestyle section
    lifestyle_keywords = [
        'lifestyle', 'beauty', 'fashion', 'travel', 'food', 
        'relationship', 'culture', 'style'
    ]
    if any(keyword in category_lower for keyword in lifestyle_keywords):
        return 'lifestyle'
    if any(keyword in source_name for keyword in ['essence', 'travel noire', 'blavity']):
        return 'lifestyle'
    
    # Business section
    business_keywords = [
        'business', 'economy', 'entrepreneur', 'startup', 
        'wealth', 'finance', 'grant', 'funding', 'market', 'stock', 'investment'
    ]
    if any(keyword in category_lower for keyword in business_keywords):
        return 'business'
    if any(keyword in source_name for keyword in ['business', 'entrepreneur', 'forbes', 'cnbc', 'bloomberg', 'marketwatch']):
        return 'business'
    
    # Tech section (enhanced keywords)
    tech_keywords = [
        'technology', 'tech', 'innovation', 'ai', 'artificial intelligence',
        'machine learning', 'digital', 'startup', 'cyber', 'software', 
        'cryptocurrency', 'blockchain', 'data', 'science'
    ]
    if any(keyword in category_lower for keyword in tech_keywords):
        return 'tech'
    if any(keyword in source_name for keyword in ['tech', 'innovation', 'wired', 'mit', 'ars technica']):
        return 'tech'
    
    # Sports section (enhanced keywords)
    sports_keywords = [
        'sport', 'athletic', 'game', 'championship', 'nba', 'nfl', 
        'soccer', 'basketball', 'football', 'baseball', 'tennis', 
        'olympics', 'espn', 'league'
    ]
    if any(keyword in category_lower for keyword in sports_keywords):
        return 'sports'
    if any(keyword in source_name for keyword in ['sport', 'espn', 'nba', 'nfl']):
        return 'sports'
    
    # STEP 3: Region-based categorization
    # US section - domestic/Americas focus
    if _is_us_focused(source_name, region):
        return 'us'
    
    # World section - international focus
    world_regions = [
        'global', 'africa', 'asia', 'europe', 'middle east', 
        'pacific', 'international', 'caribbean'
    ]
    if any(world_region in region for world_region in world_regions):
        return 'world'
    
    world_keywords = ['world', 'international', 'global']
    if any(keyword in category_lower for keyword in world_keywords):
        return 'world'
    
    # Default to world for uncategorized items
    return 'world'


def _is_us_focused(source_name: str, region: str) -> bool:
    """
    Helper to determine if a source or region is US-focused
    
    Args:
        source_name: Lowercase source name
        region: Lowercase region string
        
    Returns:
        True if US-focused, False otherwise
    """
    us_indicators = [
        'americas', 'united states', 'usa', 'us', 'america',
        'domestic', 'national'
    ]
    if any(indicator in region for indicator in us_indicators):
        return True
    
    # Check for US-focused sources
    us_sources = [
        'npr', 'black enterprise', 'cdc', 'grants.gov', 'uncf', 
        'mbda', 'sba', 'aclu'
    ]
    if any(us_source in source_name for us_source in us_sources):
        return True
    
    return False


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
        'sports': [],
        'entertainment': [],
        'lifestyle': [],
        'health': [],
        'civil_rights': [],
        'education': []
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
        featured['mapped_section'] = categorize_news_item(featured)
        result['hero'] = [featured]
    
    # Process remaining items
    for item in regular_items:
        section = categorize_news_item(item)
        # Add mapped section to item for frontend display
        item['mapped_section'] = section
        result[section].append(item)
    
    # Fill top_stories from ALL active sections
    # Priority order: business, tech, entertainment, world, us, sports, health, civil_rights, lifestyle
    top_stories_pool = []
    for section in ['business', 'tech', 'entertainment', 'world', 'us', 'sports', 'health', 'civil_rights', 'lifestyle', 'education']:
        top_stories_pool.extend(result[section][:2])  # Take top 2 from each
    
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
        'top-stories': 'Top Stories',
        'us': 'U.S.',
        'world': 'World',
        'politics': 'Politics',
        'healthwatch': 'HealthWatch',
        'moneywatch': 'MoneyWatch',
        'entertainment': 'Entertainment',
        'crime': 'Crime',
        'sports': 'Sports',
        'culture': 'Culture',
        'science-tech': 'Science & Tech',
        'civil-rights': 'Civil Rights',
        'business': 'Business',
        'education': 'Education',
        'tech': 'Technology'  # alias
    }
    return display_names.get(section, section.replace('-', ' ').title())


def filter_items_by_section(items: List[Dict[str, Any]], section: str) -> List[Dict[str, Any]]:
    """
    Filter news items by section identifier.
    
    Args:
        items: List of news item dictionaries
        section: Section identifier (e.g., 'us', 'world', 'business')
        
    Returns:
        Filtered list of items matching the section
    """
    if section == 'top-stories' or section == 'all':
        return items
    
    # Map section to categorization
    section_mapping = {
        'us': 'us',
        'world': 'world',
        'politics': 'politics',
        'healthwatch': 'health',
        'health': 'health',
        'moneywatch': 'business',
        'entertainment': 'entertainment',
        'lifestyle': 'lifestyle',
        'crime': 'crime',
        'sports': 'sports',
        'culture': 'culture',
        'science-tech': 'tech',
        'tech': 'tech',
        'civil-rights': 'civil_rights',
        'civil_rights': 'civil_rights',
        'business': 'business',
        'education': 'education'
    }
    
    target_category = section_mapping.get(section, section)
    filtered = []
    
    for item in items:
        # Get categorization
        item_category = categorize_news_item(item)
        
        # Check if it matches
        if item_category == target_category:
            filtered.append(item)
            continue
        
        # Additional keyword matching for flexible categorization
        category = (item.get('category') or '').lower()
        title = (item.get('title') or '').lower()
        
        # Politics section
        if section == 'politics' and any(kw in category + title for kw in ['politic', 'election', 'congress', 'senate', 'president']):
            filtered.append(item)
        
        # HealthWatch section
        elif section == 'healthwatch' and any(kw in category + title for kw in ['health', 'medical', 'wellness', 'hospital', 'doctor', 'medicine']):
            filtered.append(item)
        
        # MoneyWatch section
        elif section == 'moneywatch' and any(kw in category + title for kw in ['economy', 'finance', 'stock', 'market', 'investment', 'money']):
            filtered.append(item)
        
        # Entertainment section
        elif section == 'entertainment' and any(kw in category + title for kw in ['entertainment', 'film', 'movie', 'music', 'celebrity', 'tv', 'show']):
            filtered.append(item)
        
        # Crime section
        elif section == 'crime' and any(kw in category + title for kw in ['crime', 'criminal', 'arrest', 'prison', 'jail', 'police', 'law enforcement']):
            filtered.append(item)
        
        # Culture section
        elif section == 'culture' and any(kw in category + title for kw in ['culture', 'art', 'identity', 'heritage', 'tradition', 'lifestyle']):
            filtered.append(item)
        
        # Civil Rights section
        elif section == 'civil-rights' and any(kw in category + title for kw in ['civil rights', 'justice', 'equality', 'discrimination', 'protest', 'activism']):
            filtered.append(item)
        
        # Education section
        elif section == 'education' and any(kw in category + title for kw in ['education', 'school', 'college', 'university', 'student', 'teacher', 'learning']):
            filtered.append(item)
    
    return filtered


def paginate_items(
    items: List[Dict[str, Any]], 
    page: int = 1, 
    page_size: int = 20
) -> tuple[List[Dict[str, Any]], int, int]:
    """
    Paginate a list of items.
    
    Args:
        items: List of items to paginate
        page: Page number (1-indexed)
        page_size: Number of items per page
        
    Returns:
        Tuple of (paginated_items, total_items, total_pages)
    """
    total_items = len(items)
    total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
    
    if page < 1:
        page = 1
    if page > total_pages and total_pages > 0:
        page = total_pages
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    paginated = items[start_idx:end_idx]
    
    return paginated, total_items, total_pages
