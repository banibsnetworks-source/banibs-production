"""
BANIBS News Feed Sources - Phase 6.5.2 Schema
Standardized schema with comprehensive global coverage
"""

# ============================================================================
# STANDARDIZED RSS SOURCE SCHEMA
# ============================================================================
# Each source must include:
#   - id: unique snake_case identifier
#   - region: Geographic region (Global, Africa, Asia, Europe, Middle East, Americas, Pacific) or None
#   - category: Content category (World, Business, Community, Education, Technology, Opportunities)
#   - source_name: Display name for the source
#   - rss_url: RSS feed URL
#   - language: ISO language code (default: "en")
#   - active: Boolean flag to enable/disable feed
#   - featured_source: (Optional) Boolean flag indicating source has reliable images for featured stories
# ============================================================================

RSS_SOURCES = [
    # ========================================================================
    # BLACK-OWNED MEDIA & INDIGENOUS NEWS
    # ========================================================================
    {
        "id": "black_enterprise_business",
        "region": None,
        "category": "Business",
        "source_name": "Black Enterprise",
        "rss_url": "https://www.blackenterprise.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,  # Reliable images for featured stories
    },
    {
        "id": "the_root_community",
        "region": None,
        "category": "Community",
        "source_name": "The Root",
        "rss_url": "https://www.theroot.com/rss",
        "language": "en",
        "active": False,  # Returns 403 Forbidden
    },
    {
        "id": "essence_community",
        "region": None,
        "category": "Community",
        "source_name": "Essence",
        "rss_url": "https://www.essence.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,  # Reliable images for featured stories
    },
    {
        "id": "indian_country_today_community",
        "region": None,
        "category": "Community",
        "source_name": "Indian Country Today",
        "rss_url": "https://indiancountrytoday.com/.rss/full/",
        "language": "en",
        "active": False,  # Returns 404 Not Found
    },
    {
        "id": "native_news_online_community",
        "region": None,
        "category": "Community",
        "source_name": "Native News Online",
        "rss_url": "https://nativenewsonline.net/rss",
        "language": "en",
        "active": False,  # Returns 404 Not Found
    },
    
    # ========================================================================
    # EDUCATION
    # ========================================================================
    {
        "id": "education_week",
        "region": None,
        "category": "Education",
        "source_name": "Education Week",
        "rss_url": "https://feeds.edweek.org/edweek/latest.xml",
        "language": "en",
        "active": False,  # DNS resolution fails
    },
    {
        "id": "uncf_news",
        "region": None,
        "category": "Education",
        "source_name": "UNCF News",
        "rss_url": "https://uncf.org/feed",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # ENTERTAINMENT (BLACK-FOCUSED)
    # ========================================================================
    {
        "id": "bet_entertainment",
        "region": None,
        "category": "Entertainment",
        "source_name": "BET Entertainment",
        "rss_url": "https://www.bet.com/feed.rss",
        "language": "en",
        "active": True,
        "featured_source": True,
    },
    {
        "id": "vibe_entertainment",
        "region": None,
        "category": "Entertainment",
        "source_name": "Vibe",
        "rss_url": "https://www.vibe.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
    },
    {
        "id": "blavity_entertainment",
        "region": None,
        "category": "Entertainment",
        "source_name": "Blavity Entertainment",
        "rss_url": "https://blavity.com/feed",
        "language": "en",
        "active": True,
    },
    {
        "id": "shadow_and_act",
        "region": None,
        "category": "Entertainment",
        "source_name": "Shadow and Act",
        "rss_url": "https://shadowandact.com/feed",
        "language": "en",
        "active": True,
        "featured_source": True,
    },
    {
        "id": "rolling_stone_entertainment",
        "region": None,
        "category": "Entertainment",
        "source_name": "Rolling Stone",
        "rss_url": "https://www.rollingstone.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
    },
    {
        "id": "billboard_entertainment",
        "region": None,
        "category": "Entertainment",
        "source_name": "Billboard",
        "rss_url": "https://www.billboard.com/feed/",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # LIFESTYLE (BLACK-FOCUSED)
    # ========================================================================
    {
        "id": "essence_lifestyle",
        "region": None,
        "category": "Lifestyle",
        "source_name": "Essence Lifestyle",
        "rss_url": "https://www.essence.com/lifestyle/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
    },
    {
        "id": "travel_noire",
        "region": None,
        "category": "Lifestyle",
        "source_name": "Travel Noire",
        "rss_url": "https://travelnoire.com/feed",
        "language": "en",
        "active": True,
    },
    {
        "id": "blavity_lifestyle",
        "region": None,
        "category": "Lifestyle",
        "source_name": "Blavity Lifestyle",
        "rss_url": "https://blavity.com/c/lifestyle/feed",
        "language": "en",
        "active": True,
    },
    {
        "id": "healthline_wellness",
        "region": None,
        "category": "Lifestyle",
        "source_name": "Healthline",
        "rss_url": "https://www.healthline.com/rss",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # BUSINESS & FINANCE
    # ========================================================================
    {
        "id": "forbes_entrepreneurs",
        "region": None,
        "category": "Business",
        "source_name": "Forbes Entrepreneurs",
        "rss_url": "https://www.forbes.com/entrepreneurs/feed/",
        "language": "en",
        "active": False,  # Returns 404 Not Found
    },
    {
        "id": "mbda_business",
        "region": None,
        "category": "Business",
        "source_name": "MBDA",
        "rss_url": "https://www.mbda.gov/rss.xml",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # COMMUNITY & POLICY
    # ========================================================================
    {
        "id": "naacp_news",
        "region": None,
        "category": "Community",
        "source_name": "NAACP News",
        "rss_url": "https://naacp.org/rss.xml",
        "language": "en",
        "active": False,  # Returns 404 Not Found
    },
    {
        "id": "npr_code_switch",
        "region": None,
        "category": "Community",
        "source_name": "NPR Code Switch",
        "rss_url": "https://feeds.npr.org/510312/podcast.xml",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # GRANTS & OPPORTUNITIES
    # ========================================================================
    {
        "id": "grants_gov",
        "region": None,
        "category": "Opportunities",
        "source_name": "Grants.gov",
        "rss_url": "https://www.grants.gov/rss/GG_NewOpps.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "usa_gov_grants",
        "region": None,
        "category": "Opportunities",
        "source_name": "USA.gov Grants",
        "rss_url": "https://www.usa.gov/feeds/benefits-grants.xml",
        "language": "en",
        "active": False,  # Returns 404 Not Found
    },
    
    # ========================================================================
    # TECHNOLOGY
    # ========================================================================
    {
        "id": "afrotech",
        "region": None,
        "category": "Technology",
        "source_name": "AfroTech",
        "rss_url": "https://afrotech.com/feed",
        "language": "en",
        "active": False,  # Returns 404 Not Found
    },
    {
        "id": "techcrunch_startups",
        "region": None,
        "category": "Technology",
        "source_name": "TechCrunch Startups",
        "rss_url": "https://techcrunch.com/startups/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,  # Reliable images for featured stories
    },
    
    # ========================================================================
    # GLOBAL WORLD NEWS
    # ========================================================================
    {
        "id": "cnn_world",
        "region": "Global",
        "category": "World",
        "source_name": "CNN World",
        "rss_url": "http://rss.cnn.com/rss/edition_world.rss",
        "language": "en",
        "active": True,
        "featured_source": True,  # Reliable images for featured stories
    },
    {
        "id": "bbc_world",
        "region": "Global",
        "category": "World",
        "source_name": "BBC World",
        "rss_url": "http://feeds.bbci.co.uk/news/world/rss.xml",
        "language": "en",
        "active": True,
        "featured_source": True,  # Reliable images for featured stories
    },
    {
        "id": "reuters_world",
        "region": "Global",
        "category": "World",
        "source_name": "Reuters World",
        "rss_url": "http://feeds.reuters.com/reuters/worldNews",
        "language": "en",
        "active": False,  # DNS resolution fails
    },
    {
        "id": "associated_press_world",
        "region": "Global",
        "category": "World",
        "source_name": "Associated Press World",
        "rss_url": "https://rsshub.app/ap/topics/apf-topnews",
        "language": "en",
        "active": False,  # Returns 503 Service Unavailable
    },
    {
        "id": "the_guardian_world",
        "region": "Global",
        "category": "World",
        "source_name": "The Guardian World",
        "rss_url": "https://www.theguardian.com/world/rss",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # AFRICA
    # ========================================================================
    {
        "id": "bbc_africa_world",
        "region": "Africa",
        "category": "World",
        "source_name": "BBC News - Africa",
        "rss_url": "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "allafrica_top_stories",
        "region": "Africa",
        "category": "World",
        "source_name": "AllAfrica - Top Stories",
        "rss_url": "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
        "language": "en",
        "active": True,
    },
    {
        "id": "africanews_world",
        "region": "Africa",
        "category": "World",
        "source_name": "Africanews",
        "rss_url": "https://www.africanews.com/feed/rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "the_guardian_africa",
        "region": "Africa",
        "category": "World",
        "source_name": "The Guardian - Africa",
        "rss_url": "https://www.theguardian.com/world/africa/rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "reuters_africa",
        "region": "Africa",
        "category": "World",
        "source_name": "Reuters Africa",
        "rss_url": "https://www.reutersagency.com/feed/?best-topics=africa&post_type=best",
        "language": "en",
        "active": False,  # Authentication required
    },
    
    # ========================================================================
    # ASIA
    # ========================================================================
    {
        "id": "bbc_asia_world",
        "region": "Asia",
        "category": "World",
        "source_name": "BBC News - Asia",
        "rss_url": "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "the_hindu_world",
        "region": "Asia",
        "category": "World",
        "source_name": "The Hindu - World",
        "rss_url": "https://www.thehindu.com/news/international/feeder/default.rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "nikkei_asia_world",
        "region": "Asia",
        "category": "World",
        "source_name": "Nikkei Asia - World/Region",
        "rss_url": "https://asia.nikkei.com/rss/feed/nar",
        "language": "en",
        "active": False,  # Personal use only - terms unclear
    },
    {
        "id": "scmp_world",
        "region": "Asia",
        "category": "World",
        "source_name": "South China Morning Post",
        "rss_url": "https://www.scmp.com/rss/91/feed",
        "language": "en",
        "active": True,
    },
    {
        "id": "channel_news_asia",
        "region": "Asia",
        "category": "World",
        "source_name": "Channel News Asia",
        "rss_url": "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "japan_times_world",
        "region": "Asia",
        "category": "World",
        "source_name": "The Japan Times",
        "rss_url": "https://www.japantimes.co.jp/feed/",
        "language": "en",
        "active": True,
    },
    {
        "id": "reuters_asia",
        "region": "Asia",
        "category": "World",
        "source_name": "Reuters Asia",
        "rss_url": "https://www.reutersagency.com/feed/?best-topics=asia&post_type=best",
        "language": "en",
        "active": False,  # Authentication required
    },
    
    # ========================================================================
    # MIDDLE EAST
    # ========================================================================
    {
        "id": "aljazeera_world",
        "region": "Middle East",
        "category": "World",
        "source_name": "Al Jazeera English - News",
        "rss_url": "https://www.aljazeera.com/xml/rss/all.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "bbc_middle_east",
        "region": "Middle East",
        "category": "World",
        "source_name": "BBC News - Middle East",
        "rss_url": "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "arab_news_world",
        "region": "Middle East",
        "category": "World",
        "source_name": "Arab News - World",
        "rss_url": "https://www.arabnews.com/rss.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "middle_east_eye",
        "region": "Middle East",
        "category": "World",
        "source_name": "Middle East Eye",
        "rss_url": "https://www.middleeasteye.net/rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "the_national_uae",
        "region": "Middle East",
        "category": "World",
        "source_name": "The National (UAE)",
        "rss_url": "https://www.thenationalnews.com/rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "times_of_israel_world",
        "region": "Middle East",
        "category": "World",
        "source_name": "The Times of Israel - News Feed",
        "rss_url": "https://www.timesofisrael.com/feed/",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # EUROPE
    # ========================================================================
    {
        "id": "bbc_europe_world",
        "region": "Europe",
        "category": "World",
        "source_name": "BBC News - Europe",
        "rss_url": "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "euronews_world",
        "region": "Europe",
        "category": "World",
        "source_name": "Euronews - World",
        "rss_url": "https://www.euronews.com/rss?level=theme&name=news",
        "language": "en",
        "active": True,
    },
    {
        "id": "dw_world",
        "region": "Europe",
        "category": "World",
        "source_name": "Deutsche Welle - All News (EN)",
        "rss_url": "https://rss.dw.com/rdf/rss-en-all",
        "language": "en",
        "active": True,
    },
    {
        "id": "france24_world",
        "region": "Europe",
        "category": "World",
        "source_name": "France 24",
        "rss_url": "https://www.france24.com/en/rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "the_local_uk",
        "region": "Europe",
        "category": "World",
        "source_name": "The Local (UK)",
        "rss_url": "https://www.thelocal.com/rss",
        "language": "en",
        "active": True,
    },
    {
        "id": "politico_europe",
        "region": "Europe",
        "category": "World",
        "source_name": "Politico Europe",
        "rss_url": "https://www.politico.eu/feed/",
        "language": "en",
        "active": True,
    },
    {
        "id": "reuters_europe",
        "region": "Europe",
        "category": "World",
        "source_name": "Reuters Europe",
        "rss_url": "https://www.reutersagency.com/feed/?best-topics=europe&post_type=best",
        "language": "en",
        "active": False,  # Authentication required
    },
    
    # ========================================================================
    # AMERICAS
    # ========================================================================
    {
        "id": "bloomberg_world",
        "region": "Americas",
        "category": "World",
        "source_name": "Bloomberg World",
        "rss_url": "https://feeds.bloomberg.com/politics/news.rss",
        "language": "en",
        "active": True,
    },
    
    # ========================================================================
    # PACIFIC / OCEANIA
    # ========================================================================
    {
        "id": "abc_just_in",
        "region": "Pacific",
        "category": "World",
        "source_name": "ABC News Australia - Just In",
        "rss_url": "https://www.abc.net.au/news/feed/51120/rss.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "rnz_world",
        "region": "Pacific",
        "category": "World",
        "source_name": "RNZ - World News",
        "rss_url": "https://www.rnz.co.nz/rss/world.xml",
        "language": "en",
        "active": True,
    },
    {
        "id": "rnz_pacific",
        "region": "Pacific",
        "category": "World",
        "source_name": "RNZ - Pacific",
        "rss_url": "https://www.rnz.co.nz/rss/pacific.xml",
        "language": "en",
        "active": True,
    },
]

# ============================================================================
# SUMMARY STATISTICS
# ============================================================================
def get_source_stats():
    """Get summary statistics for RSS sources"""
    active_count = sum(1 for s in RSS_SOURCES if s['active'])
    inactive_count = len(RSS_SOURCES) - active_count
    
    regions = {}
    categories = {}
    
    for source in RSS_SOURCES:
        region = source['region'] or 'No Region'
        category = source['category']
        
        regions[region] = regions.get(region, 0) + 1
        categories[category] = categories.get(category, 0) + 1
    
    return {
        'total': len(RSS_SOURCES),
        'active': active_count,
        'inactive': inactive_count,
        'by_region': regions,
        'by_category': categories
    }

if __name__ == "__main__":
    stats = get_source_stats()
    print(f"Total RSS Sources: {stats['total']}")
    print(f"  Active: {stats['active']}")
    print(f"  Inactive: {stats['inactive']}")
    print(f"\nBy Region:")
    for region, count in sorted(stats['by_region'].items()):
        print(f"  {region}: {count}")
    print(f"\nBy Category:")
    for category, count in sorted(stats['by_category'].items()):
        print(f"  {category}: {count}")
