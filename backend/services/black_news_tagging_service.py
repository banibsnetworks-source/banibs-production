"""
BANIBS Black News Tagging Service
Identifies and tags stories that center Black people, Black nations, and the global Black diaspora
"""

from typing import Dict, Any, Optional
import re


# ============================================================================
# BLACK FOCUS TYPE CATEGORIES
# ============================================================================
BLACK_FOCUS_TYPES = {
    'black_us': 'Black U.S. / African American',
    'africa': 'Africa / African Nations',
    'caribbean': 'Caribbean / West Indies',
    'diaspora': 'Global Black Diaspora',
    'hbcu': 'HBCUs / Black Education',
    'civil_rights': 'Civil Rights / Social Justice',
    'culture': 'Black Culture / Arts / Entertainment',
    'business': 'Black Business / Entrepreneurship',
}


# ============================================================================
# KEYWORD PATTERNS FOR BLACK FOCUS DETECTION
# ============================================================================

# People / Identity terms
BLACK_IDENTITY_KEYWORDS = [
    r'\bblack\b',
    r'\bafrican american\b',
    r'\bafro[- ]?latin[ao]?\b',
    r'\bafro[- ]?caribbean\b',
    r'\bpan[- ]?african\b',
    r'\bdiaspora\b',
]

# Geographic / Community terms
AFRICA_KEYWORDS = [
    r'\bafrica\b',
    r'\bafrican\b',
    r'\bnigeria\b',
    r'\bkenya\b',
    r'\bghana\b',
    r'\bsouth africa\b',
    r'\bethiopia\b',
    r'\bsenegal\b',
    r'\btanzania\b',
    r'\bzimbabwe\b',
    r'\brwanda\b',
]

CARIBBEAN_KEYWORDS = [
    r'\bcaribbean\b',
    r'\bjamaica\b',
    r'\bhaiti\b',
    r'\btrinidad\b',
    r'\btobago\b',
    r'\bbarbados\b',
    r'\bbahamas\b',
    r'\bgrenad[ae]\b',
    r'\bwest indies\b',
]

HBCU_KEYWORDS = [
    r'\bhbcu\b',
    r'\bhistorically black\b',
    r'\bhoward university\b',
    r'\bspelman\b',
    r'\bmorehouse\b',
    r'\bhampton university\b',
]

# Context phrases (stronger signals)
BLACK_CONTEXT_PHRASES = [
    r'black (community|communities|voters|leaders|people|owned|business)',
    r'african (leaders|nations|union|summit|diaspora)',
    r'civil rights (movement|protest|march|leader)',
    r'black lives matter',
    r'racial (justice|equity|discrimination)',
    r'police (brutality|shooting).*(black|african american)',
]


def determine_black_focus_type(text: str, source_category: str = None) -> Optional[str]:
    """
    Determine the type of Black focus based on content and context
    
    Args:
        text: Combined title + description text
        source_category: Original RSS category (for context)
        
    Returns:
        Black focus type string or None
    """
    text_lower = text.lower()
    
    # Check HBCU (highest specificity)
    if any(re.search(pattern, text_lower) for pattern in HBCU_KEYWORDS):
        return 'hbcu'
    
    # Check Africa
    if any(re.search(pattern, text_lower) for pattern in AFRICA_KEYWORDS):
        return 'africa'
    
    # Check Caribbean
    if any(re.search(pattern, text_lower) for pattern in CARIBBEAN_KEYWORDS):
        return 'caribbean'
    
    # Check Civil Rights context
    civil_rights_indicators = [
        'civil rights', 'racial justice', 'police brutality',
        'discrimination', 'protest', 'activism', 'blm'
    ]
    if any(indicator in text_lower for indicator in civil_rights_indicators):
        return 'civil_rights'
    
    # Check Culture / Entertainment
    if source_category in ['Entertainment', 'Culture / Civil Rights']:
        if any(re.search(pattern, text_lower) for pattern in BLACK_IDENTITY_KEYWORDS):
            return 'culture'
    
    # Check Business context
    if 'black-owned' in text_lower or 'black business' in text_lower:
        return 'business'
    
    # Check for U.S. context
    us_indicators = ['atlanta', 'detroit', 'chicago', 'harlem', 'baltimore', 'washington']
    if any(indicator in text_lower for indicator in us_indicators):
        if any(re.search(pattern, text_lower) for pattern in BLACK_IDENTITY_KEYWORDS):
            return 'black_us'
    
    # Default to diaspora for general Black-focused content
    if any(re.search(pattern, text_lower) for pattern in BLACK_IDENTITY_KEYWORDS):
        return 'diaspora'
    
    return None


def is_black_focused_content(title: str, description: str = '') -> bool:
    """
    Determine if content centers Black people/communities (keyword-based)
    
    Args:
        title: Story title
        description: Story description/summary
        
    Returns:
        True if content is Black-focused
    """
    text = f"{title} {description}".lower()
    
    # Check for strong Black identity keywords
    if any(re.search(pattern, text) for pattern in BLACK_IDENTITY_KEYWORDS):
        return True
    
    # Check for strong context phrases
    if any(re.search(pattern, text) for pattern in BLACK_CONTEXT_PHRASES):
        return True
    
    # Check for Africa-specific content
    if any(re.search(pattern, text) for pattern in AFRICA_KEYWORDS):
        # Must have substantial African content, not just mention
        africa_count = sum(1 for pattern in AFRICA_KEYWORDS if re.search(pattern, text))
        if africa_count >= 2:
            return True
    
    # Check for Caribbean-specific content
    if any(re.search(pattern, text) for pattern in CARIBBEAN_KEYWORDS):
        return True
    
    # Check for HBCU content
    if any(re.search(pattern, text) for pattern in HBCU_KEYWORDS):
        return True
    
    return False


def tag_black_news_item(
    item: Dict[str, Any],
    source_is_black_owned: bool = False,
    source_is_black_focus: bool = False,
    source_category: str = None
) -> Dict[str, Any]:
    """
    Tag a news item with Black News metadata
    
    Args:
        item: News item dictionary
        source_is_black_owned: Whether the source is Black-owned
        source_is_black_focus: Whether the source centers Black communities
        source_category: Original RSS category
        
    Returns:
        Updated item with is_black_focus and black_focus_type fields
    """
    # Layer 1: Source-based tagging (highest priority)
    if source_is_black_owned or source_is_black_focus:
        item['is_black_focus'] = True
        
        # Determine type based on source category
        if source_category == 'Africa Watch':
            item['black_focus_type'] = 'africa'
        elif source_category == 'Caribbean Watch':
            item['black_focus_type'] = 'caribbean'
        elif 'HBCU' in source_category or 'Education' in source_category:
            item['black_focus_type'] = 'hbcu'
        elif source_category == 'Culture / Civil Rights':
            item['black_focus_type'] = 'culture'
        elif source_category == 'Rights & Justice':
            item['black_focus_type'] = 'civil_rights'
        elif source_category == 'Business & Finance' and source_is_black_owned:
            item['black_focus_type'] = 'business'
        else:
            item['black_focus_type'] = 'diaspora'
        
        return item
    
    # Layer 2: Content-based tagging (for non-Black sources)
    title = item.get('title', '')
    description = item.get('summary', '') or item.get('description', '')
    
    if is_black_focused_content(title, description):
        item['is_black_focus'] = True
        
        # Determine specific type
        combined_text = f"{title} {description}"
        focus_type = determine_black_focus_type(combined_text, source_category)
        item['black_focus_type'] = focus_type or 'diaspora'
    else:
        item['is_black_focus'] = False
        item['black_focus_type'] = None
    
    return item


def get_black_focus_type_label(focus_type: str) -> str:
    """
    Get human-readable label for black_focus_type
    
    Args:
        focus_type: Black focus type code
        
    Returns:
        Human-readable label
    """
    return BLACK_FOCUS_TYPES.get(focus_type, 'Black Diaspora')
