"""
BANIBS News Feed Sources
Balanced coverage across: Black-Owned Media, Indigenous News, Education, Business, Community, Grants, Tech
"""

RSS_SOURCES = [
    # Black-Owned Media
    {"category": "Business", "name": "Black Enterprise", "url": "https://www.blackenterprise.com/feed/"},
    {"category": "Community", "name": "The Root", "url": "https://www.theroot.com/rss"},
    {"category": "Community", "name": "Essence", "url": "https://www.essence.com/feed/"},
    
    # Indigenous News
    {"category": "Community", "name": "Indian Country Today", "url": "https://indiancountrytoday.com/.rss/full/"},
    {"category": "Community", "name": "Native News Online", "url": "https://nativenewsonline.net/rss"},
    
    # Education
    {"category": "Education", "name": "Education Week", "url": "https://feeds.edweek.org/edweek/latest.xml"},
    {"category": "Education", "name": "UNCF News", "url": "https://uncf.org/feed"},
    
    # Business / Finance
    {"category": "Business", "name": "Forbes Entrepreneurs", "url": "https://www.forbes.com/entrepreneurs/feed/"},
    {"category": "Business", "name": "MBDA", "url": "https://www.mbda.gov/rss.xml"},
    
    # Community / Policy
    {"category": "Community", "name": "NAACP News", "url": "https://naacp.org/rss.xml"},
    {"category": "Community", "name": "NPR Code Switch", "url": "https://feeds.npr.org/510312/podcast.xml"},
    
    # Grants / Opportunities
    {"category": "Opportunities", "name": "Grants.gov", "url": "https://www.grants.gov/rss/GG_NewOpps.xml"},
    {"category": "Opportunities", "name": "USA.gov Grants", "url": "https://www.usa.gov/feeds/benefits-grants.xml"},
    
    # Technology
    {"category": "Technology", "name": "AfroTech", "url": "https://afrotech.com/feed"},
    {"category": "Technology", "name": "TechCrunch Startups", "url": "https://techcrunch.com/startups/feed/"},
]

# Phase 6.0: Global News Expansion
# Credible international outlets for comprehensive world coverage with regional tagging
GLOBAL_RSS_SOURCES = [
    {
        "category": "World News", 
        "name": "CNN World", 
        "url": "http://rss.cnn.com/rss/edition_world.rss",
        "region": "Global"
    },
    {
        "category": "World News", 
        "name": "BBC World", 
        "url": "http://feeds.bbci.co.uk/news/world/rss.xml",
        "region": "Global"
    },
    {
        "category": "World News", 
        "name": "Reuters World", 
        "url": "http://feeds.reuters.com/reuters/worldNews",
        "region": "Global"
    },
    {
        "category": "World News", 
        "name": "Al Jazeera English", 
        "url": "https://www.aljazeera.com/xml/rss/all.xml",
        "region": "Middle East"
    },
    {
        "category": "World News", 
        "name": "Associated Press World", 
        "url": "https://rsshub.app/ap/topics/apf-topnews",
        "region": "Global"
    },
    {
        "category": "World News", 
        "name": "The Guardian World", 
        "url": "https://www.theguardian.com/world/rss",
        "region": "Global"
    },
    {
        "category": "World News", 
        "name": "Euronews International", 
        "url": "https://feeds.euronews.com/euronews/en/news/international",
        "region": "Europe"
    },
    {
        "category": "World News", 
        "name": "Bloomberg World", 
        "url": "https://feeds.bloomberg.com/politics/news.rss",
        "region": "Americas"
    },
]

# Combine all sources for the RSS sync system
RSS_SOURCES.extend(GLOBAL_RSS_SOURCES)
