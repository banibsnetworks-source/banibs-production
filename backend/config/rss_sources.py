"""
BANIBS News Feed Sources - V2.0 Category System
Updated: December 2025

New BANIBS Category System with 85+ curated sources
Organized by audience-focused categories for better content discovery
"""

# ============================================================================
# BANIBS V2.0 RSS SOURCE SCHEMA
# ============================================================================
# Each source must include:
#   - id: unique snake_case identifier
#   - category: BANIBS V2 category (see categories below)
#   - source_name: Display name for the source
#   - rss_url: RSS feed URL
#   - language: ISO language code (default: "en")
#   - active: Boolean flag to enable/disable feed
#   - featured_source: (Optional) Boolean for high-quality image sources
#   - priority: (Optional) Integer 1-5 for feed priority (1=highest)
#   - is_black_owned: (Optional) Boolean - True for Black-owned/operated sources
#   - is_black_focus: (Optional) Boolean - True for sources centering Black communities
# ============================================================================

# BANIBS V2.0 CATEGORIES:
# - Global Diaspora
# - Africa Watch
# - Caribbean Watch
# - Culture / Civil Rights
# - Business & Finance
# - Entertainment
# - Health & Wellness
# - Sports
# - Science & Tech
# - Rights & Justice

RSS_SOURCES = [
    # ========================================================================
    # GLOBAL DIASPORA (14 sources)
    # ========================================================================
    {
        "id": "reuters_world",
        "category": "Global Diaspora",
        "source_name": "Reuters World",
        "rss_url": "https://feeds.reuters.com/reuters/worldNews",
        "language": "en",
        "active": False,  # DNS resolution failure
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "bbc_world",
        "category": "Global Diaspora",
        "source_name": "BBC World",
        "rss_url": "http://feeds.bbci.co.uk/news/world/rss.xml",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "ap_world",
        "category": "Global Diaspora",
        "source_name": "AP World News",
        "rss_url": "https://rsshub.app/apnews/topics/apf-intlnews",
        "language": "en",
        "active": False,  # Read timeout
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "al_jazeera_world",
        "category": "Global Diaspora",
        "source_name": "Al Jazeera World",
        "rss_url": "https://www.aljazeera.com/xml/rss/all.xml",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "voa_global",
        "category": "Global Diaspora",
        "source_name": "Voice of America",
        "rss_url": "https://www.voanews.com/api/zitqveoii",
        "language": "en",
        "active": False,  # 404 Not Found
        "priority": 2,
    },
    {
        "id": "npr_world",
        "category": "Global Diaspora",
        "source_name": "NPR World",
        "rss_url": "https://feeds.npr.org/1004/rss.xml",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "dw_global",
        "category": "Global Diaspora",
        "source_name": "Deutsche Welle",
        "rss_url": "https://rss.dw.com/rdf/rss-en-all",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "news_americas_now",
        "category": "Global Diaspora",
        "source_name": "News Americas Now",
        "rss_url": "https://www.newsamericasnow.com/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "africa_times_diaspora",
        "category": "Global Diaspora",
        "source_name": "Africa Times",
        "rss_url": "https://africatimes.com/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "face2face_africa",
        "category": "Global Diaspora",
        "source_name": "Face2Face Africa",
        "rss_url": "https://face2faceafrica.com/feed",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 2,
    },
    {
        "id": "black_enterprise_global",
        "category": "Global Diaspora",
        "source_name": "Black Enterprise (Global)",
        "rss_url": "https://www.blackenterprise.com/category/news/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "global_voices",
        "category": "Global Diaspora",
        "source_name": "Global Voices",
        "rss_url": "https://globalvoices.org/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "the_root_world",
        "category": "Global Diaspora",
        "source_name": "The Root (World)",
        "rss_url": "https://www.theroot.com/rss",
        "language": "en",
        "active": False,  # Note: May return 403
        "priority": 2,
    },
    {
        "id": "okayafrica",
        "category": "Global Diaspora",
        "source_name": "OkayAfrica",
        "rss_url": "https://www.okayafrica.com/feed/",
        "language": "en",
        "active": False,  # Dead feed
        "featured_source": True,
        "priority": 2,
    },

    # ========================================================================
    # AFRICA WATCH (11 sources)
    # ========================================================================
    {
        "id": "allafrica",
        "category": "Africa Watch",
        "source_name": "AllAfrica",
        "rss_url": "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf",
        "language": "en",
        "active": False,  # Dead feed
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "guardian_nigeria",
        "category": "Africa Watch",
        "source_name": "Guardian Nigeria",
        "rss_url": "https://guardian.ng/feed/",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "punch_ng",
        "category": "Africa Watch",
        "source_name": "Punch Nigeria",
        "rss_url": "https://punchng.com/feed/",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "daily_trust",
        "category": "Africa Watch",
        "source_name": "Daily Trust",
        "rss_url": "https://dailytrust.com/feed",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "vanguard_ng",
        "category": "Africa Watch",
        "source_name": "Vanguard Nigeria",
        "rss_url": "https://www.vanguardngr.com/feed/",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "modern_ghana",
        "category": "Africa Watch",
        "source_name": "ModernGhana",
        "rss_url": "https://www.modernghana.com/GhanaHome/rss/news.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "africa_report",
        "category": "Africa Watch",
        "source_name": "The Africa Report",
        "rss_url": "https://www.theafricareport.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "business_daily_africa",
        "category": "Africa Watch",
        "source_name": "Business Daily Africa",
        "rss_url": "https://www.businessdailyafrica.com/bd/feed",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "sabc_news",
        "category": "Africa Watch",
        "source_name": "SABC News",
        "rss_url": "https://www.sabcnews.com/sabcnews/feed/",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "mail_guardian",
        "category": "Africa Watch",
        "source_name": "Mail & Guardian",
        "rss_url": "https://mg.co.za/feed/",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "daily_nation_kenya",
        "category": "Africa Watch",
        "source_name": "Daily Nation (Kenya)",
        "rss_url": "https://nation.africa/kenya/rss",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },

    # ========================================================================
    # CARIBBEAN WATCH (10 sources)
    # ========================================================================
    {
        "id": "caribbean_journal",
        "category": "Caribbean Watch",
        "source_name": "Caribbean Journal",
        "rss_url": "https://www.caribjournal.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "loop_caribbean",
        "category": "Caribbean Watch",
        "source_name": "Loop News Caribbean",
        "rss_url": "https://caribbean.loopnews.com/rss",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "jamaica_gleaner",
        "category": "Caribbean Watch",
        "source_name": "Jamaica Gleaner",
        "rss_url": "http://jamaica-gleaner.com/feed/rss.xml",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "jamaica_observer",
        "category": "Caribbean Watch",
        "source_name": "Jamaica Observer",
        "rss_url": "http://www.jamaicaobserver.com/rss/news",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "trinidad_express",
        "category": "Caribbean Watch",
        "source_name": "Trinidad Express",
        "rss_url": "https://trinidadexpress.com/feed/",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "barbados_today",
        "category": "Caribbean Watch",
        "source_name": "Barbados Today",
        "rss_url": "https://barbadostoday.bb/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "haiti_libre",
        "category": "Caribbean Watch",
        "source_name": "Haiti Libre",
        "rss_url": "https://www.haitilibre.com/en/rss.xml",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "st_lucia_times",
        "category": "Caribbean Watch",
        "source_name": "St. Lucia Times",
        "rss_url": "https://www.stluciatimes.com/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "bahamas_press",
        "category": "Caribbean Watch",
        "source_name": "Bahamas Press",
        "rss_url": "https://bahamaspress.com/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "caribbean_national_weekly",
        "category": "Caribbean Watch",
        "source_name": "Caribbean National Weekly",
        "rss_url": "https://www.caribbeannationalweekly.com/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },

    # ========================================================================
    # CULTURE / CIVIL RIGHTS (9 sources)
    # ========================================================================
    {
        "id": "the_root",
        "category": "Culture / Civil Rights",
        "source_name": "The Root",
        "rss_url": "https://www.theroot.com/rss",
        "language": "en",
        "active": False,  # Note: May return 403
        "priority": 1,
    },
    {
        "id": "blavity",
        "category": "Culture / Civil Rights",
        "source_name": "Blavity",
        "rss_url": "https://blavity.com/feed",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "essence",
        "category": "Culture / Civil Rights",
        "source_name": "Essence",
        "rss_url": "https://www.essence.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "bet",
        "category": "Culture / Civil Rights",
        "source_name": "BET",
        "rss_url": "https://www.bet.com/feed.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "atlanta_black_star",
        "category": "Culture / Civil Rights",
        "source_name": "Atlanta Black Star",
        "rss_url": "https://atlantablackstar.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "the_grio",
        "category": "Culture / Civil Rights",
        "source_name": "The Grio",
        "rss_url": "https://thegrio.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "revolt",
        "category": "Culture / Civil Rights",
        "source_name": "Revolt",
        "rss_url": "https://www.revolt.tv/feed",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "npr_race_culture",
        "category": "Culture / Civil Rights",
        "source_name": "NPR Race & Culture",
        "rss_url": "https://feeds.npr.org/1053/rss.xml",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "naacp_news",
        "category": "Culture / Civil Rights",
        "source_name": "NAACP News",
        "rss_url": "https://naacp.org/rss.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },

    # ========================================================================
    # BUSINESS & FINANCE (8 sources)
    # ========================================================================
    {
        "id": "black_enterprise_business",
        "category": "Business & Finance",
        "source_name": "Black Enterprise",
        "rss_url": "https://www.blackenterprise.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "forbes",
        "category": "Business & Finance",
        "source_name": "Forbes",
        "rss_url": "https://www.forbes.com/real-time/feed2/",
        "language": "en",
        "active": False,  # Dead feed
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "reuters_business",
        "category": "Business & Finance",
        "source_name": "Reuters Business",
        "rss_url": "https://feeds.reuters.com/reuters/businessNews",
        "language": "en",
        "active": False,  # Dead feed
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "cnbc",
        "category": "Business & Finance",
        "source_name": "CNBC",
        "rss_url": "https://www.cnbc.com/id/100003114/device/rss/rss.html",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "bloomberg",
        "category": "Business & Finance",
        "source_name": "Bloomberg",
        "rss_url": "https://feeds.bloomberg.com/markets/news.rss",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "financial_times",
        "category": "Business & Finance",
        "source_name": "Financial Times",
        "rss_url": "https://www.ft.com/?format=rss",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "sba_small_business",
        "category": "Business & Finance",
        "source_name": "SBA Small Business",
        "rss_url": "https://www.sba.gov/rss",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "marketwatch",
        "category": "Business & Finance",
        "source_name": "MarketWatch",
        "rss_url": "http://feeds.marketwatch.com/marketwatch/topstories/",
        "language": "en",
        "active": True,
        "priority": 1,
    },

    # ========================================================================
    # ENTERTAINMENT (8 sources)
    # ========================================================================
    {
        "id": "essence_entertainment",
        "category": "Entertainment",
        "source_name": "Essence Entertainment",
        "rss_url": "https://www.essence.com/entertainment/feed/",
        "language": "en",
        "active": False,  # Dead feed
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "shade_room",
        "category": "Entertainment",
        "source_name": "The Shade Room",
        "rss_url": "https://theshaderoom.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "complex",
        "category": "Entertainment",
        "source_name": "Complex",
        "rss_url": "https://www.complex.com/feeds/channel/pop-culture.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "rolling_out",
        "category": "Entertainment",
        "source_name": "Rolling Out",
        "rss_url": "https://rollingout.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "billboard",
        "category": "Entertainment",
        "source_name": "Billboard",
        "rss_url": "https://www.billboard.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "variety",
        "category": "Entertainment",
        "source_name": "Variety",
        "rss_url": "https://variety.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "hollywood_reporter",
        "category": "Entertainment",
        "source_name": "Hollywood Reporter",
        "rss_url": "https://www.hollywoodreporter.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "ebony",
        "category": "Entertainment",
        "source_name": "Ebony",
        "rss_url": "https://www.ebony.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },

    # ========================================================================
    # HEALTH & WELLNESS (7 sources)
    # ========================================================================
    {
        "id": "cdc",
        "category": "Health & Wellness",
        "source_name": "CDC",
        "rss_url": "https://tools.cdc.gov/api/v2/resources/media/132608.rss",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "who",
        "category": "Health & Wellness",
        "source_name": "WHO",
        "rss_url": "https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "healthline",
        "category": "Health & Wellness",
        "source_name": "Healthline",
        "rss_url": "https://www.healthline.com/rss",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "medical_news_today",
        "category": "Health & Wellness",
        "source_name": "Medical News Today",
        "rss_url": "https://www.medicalnewstoday.com/rss",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "npr_health",
        "category": "Health & Wellness",
        "source_name": "NPR Health",
        "rss_url": "https://feeds.npr.org/1128/rss.xml",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "reuters_health",
        "category": "Health & Wellness",
        "source_name": "Reuters Health",
        "rss_url": "https://feeds.reuters.com/reuters/healthNews",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "johns_hopkins",
        "category": "Health & Wellness",
        "source_name": "Johns Hopkins",
        "rss_url": "https://www.hopkinsmedicine.org/news/feed",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },

    # ========================================================================
    # SPORTS (8 sources)
    # ========================================================================
    {
        "id": "espn",
        "category": "Sports",
        "source_name": "ESPN",
        "rss_url": "https://www.espn.com/espn/rss/news",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "bleacher_report",
        "category": "Sports",
        "source_name": "Bleacher Report",
        "rss_url": "https://bleacherreport.com/articles/feed",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "africa_sports_network",
        "category": "Sports",
        "source_name": "Africa Sports Network",
        "rss_url": "https://africasportnetwork.com/feed/",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "caribbean_sports_news",
        "category": "Sports",
        "source_name": "Caribbean Sports News",
        "rss_url": "https://caribbeansportsnews.com/feed/",
        "language": "en",
        "active": True,
        "priority": 2,
    },
    {
        "id": "ncaa",
        "category": "Sports",
        "source_name": "NCAA",
        "rss_url": "https://www.ncaa.com/news/rss",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },
    {
        "id": "nba",
        "category": "Sports",
        "source_name": "NBA",
        "rss_url": "https://www.nba.com/rss/nba_rss.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "nfl",
        "category": "Sports",
        "source_name": "NFL",
        "rss_url": "https://www.nfl.com/feeds/rss/news",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "espn_africa",
        "category": "Sports",
        "source_name": "ESPN Africa",
        "rss_url": "https://www.espn.com/espn/rss/africa/news",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 2,
    },

    # ========================================================================
    # SCIENCE & TECH (7 sources)
    # ========================================================================
    {
        "id": "techcrunch",
        "category": "Science & Tech",
        "source_name": "TechCrunch",
        "rss_url": "https://techcrunch.com/feed/",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "wired",
        "category": "Science & Tech",
        "source_name": "Wired",
        "rss_url": "https://www.wired.com/feed/rss",
        "language": "en",
        "active": True,
        "featured_source": True,
        "priority": 1,
    },
    {
        "id": "ars_technica",
        "category": "Science & Tech",
        "source_name": "Ars Technica",
        "rss_url": "http://feeds.arstechnica.com/arstechnica/index",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "mit_news",
        "category": "Science & Tech",
        "source_name": "MIT News",
        "rss_url": "https://news.mit.edu/rss/feed",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "science_daily",
        "category": "Science & Tech",
        "source_name": "Science Daily",
        "rss_url": "https://www.sciencedaily.com/rss/all.xml",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "reuters_tech",
        "category": "Science & Tech",
        "source_name": "Reuters Tech",
        "rss_url": "https://feeds.reuters.com/reuters/technologyNews",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "bbc_tech",
        "category": "Science & Tech",
        "source_name": "BBC Tech",
        "rss_url": "http://feeds.bbci.co.uk/news/technology/rss.xml",
        "language": "en",
        "active": True,
        "priority": 1,
    },

    # ========================================================================
    # RIGHTS & JUSTICE (4 sources)
    # ========================================================================
    {
        "id": "naacp",
        "category": "Rights & Justice",
        "source_name": "NAACP",
        "rss_url": "https://naacp.org/rss.xml",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
    {
        "id": "aclu",
        "category": "Rights & Justice",
        "source_name": "ACLU",
        "rss_url": "https://www.aclu.org/rss.xml",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "amnesty_international",
        "category": "Rights & Justice",
        "source_name": "Amnesty International",
        "rss_url": "https://www.amnesty.org/en/rss/",
        "language": "en",
        "active": True,
        "priority": 1,
    },
    {
        "id": "un_human_rights",
        "category": "Rights & Justice",
        "source_name": "UN Human Rights News",
        "rss_url": "https://www.ohchr.org/EN/NewsEvents/Pages/media.aspx?IsMediaPage=true&DVName=feed",
        "language": "en",
        "active": False,  # Dead feed
        "priority": 1,
    },
]


# Helper function to get sources by category
def get_sources_by_category(category):
    """Get all sources for a specific category"""
    return [source for source in RSS_SOURCES if source["category"] == category and source["active"]]


# Helper function to get all active sources
def get_active_sources():
    """Get all active sources"""
    return [source for source in RSS_SOURCES if source["active"]]


# Helper function to get categories
def get_categories():
    """Get list of all categories"""
    categories = list(set(source["category"] for source in RSS_SOURCES))
    return sorted(categories)


# Stats
def get_stats():
    """Get statistics about RSS sources"""
    total = len(RSS_SOURCES)
    active = len([s for s in RSS_SOURCES if s["active"]])
    inactive = total - active
    categories = get_categories()
    
    return {
        "total_sources": total,
        "active_sources": active,
        "inactive_sources": inactive,
        "categories": len(categories),
        "category_list": categories,
    }


if __name__ == "__main__":
    # Print stats when run directly
    stats = get_stats()
    print("BANIBS RSS Sources V2.0")
    print("=" * 50)
    print(f"Total Sources: {stats['total_sources']}")
    print(f"Active Sources: {stats['active_sources']}")
    print(f"Inactive Sources: {stats['inactive_sources']}")
    print(f"Categories: {stats['categories']}")
    print("\nCategory Breakdown:")
    for category in stats['category_list']:
        count = len(get_sources_by_category(category))
        print(f"  - {category}: {count} sources")
