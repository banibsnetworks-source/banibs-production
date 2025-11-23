"""
Initialize Beauty & Wellness Portal - Phase 11.1
Run this script to seed initial providers and education articles
"""

import asyncio
from uuid import uuid4
from datetime import datetime, timezone
from db.connection import get_db_client


SAMPLE_PROVIDERS = [
    {
        "id": str(uuid4()),
        "name": "Natural Crown Hair Studio",
        "type": "hair",
        "location": "Atlanta, GA",
        "owner_name": "Sarah Johnson",
        "description": "Specializing in natural hair care, protective styles, and loc maintenance",
        "website": "https://naturalcrown.example.com",
        "phone": "(404) 555-0123",
        "social_links": {"instagram": "@naturalcrown", "facebook": "naturalcrownstudio"},
        "rating": None,
        "review_count": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Melanin Glow Skincare",
        "type": "skincare",
        "location": "Los Angeles, CA",
        "owner_name": "Dr. Maya Thompson",
        "description": "Premium skincare products formulated for melanin-rich skin",
        "website": "https://melaninglow.example.com",
        "phone": "(323) 555-0456",
        "social_links": {"instagram": "@melaninglow"},
        "rating": None,
        "review_count": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Elite Lash & Beauty Bar",
        "type": "lashes",
        "location": "Houston, TX",
        "owner_name": "Jasmine Williams",
        "description": "Luxury lash extensions and beauty services",
        "website": "https://elitelash.example.com",
        "phone": "(713) 555-0789",
        "social_links": {"instagram": "@elitelashbar"},
        "rating": None,
        "review_count": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc)
    }
]


EDUCATION_ARTICLES = [
    {
        "id": str(uuid4()),
        "title": "Healthy Hair Starts Here: Natural Hair Care Basics",
        "summary": "Essential tips for maintaining healthy, strong natural hair",
        "content": """
# Healthy Hair Starts Here

Natural hair is beautiful, but it requires the right care to thrive. Here are essential tips:

## 1. Moisturize Regularly
Natural hair needs moisture. Use water-based moisturizers and seal with natural oils like coconut or jojoba oil.

## 2. Protect Your Hair at Night
Sleep on a satin or silk pillowcase, or wrap your hair in a satin bonnet to prevent breakage.

## 3. Deep Condition Weekly
Deep conditioning treatments restore moisture and strengthen hair. Make it a weekly ritual.

## 4. Minimize Heat
Heat styling can damage natural hair. Embrace protective styles and limit heat tools.

## 5. Trim Regularly
Healthy ends = healthy hair. Trim every 8-12 weeks to remove split ends.

Remember: Your natural hair is your crown. Wear it with pride! 👑
        """,
        "tags": ["hair", "natural", "health", "basics"],
        "author": "BANIBS Beauty Team",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "title": "Building Confidence: Your Beauty, Your Power",
        "summary": "Embracing self-love and natural beauty",
        "content": """
# Your Beauty, Your Power

True beauty starts from within. Here's how to build unshakeable confidence:

## Celebrate Your Features
Every feature you have is uniquely yours. Your skin tone, hair texture, and facial features are part of your heritage and beauty.

## Reject Eurocentric Standards
You don't need to conform to anyone else's idea of beauty. Black beauty is diverse, powerful, and timeless.

## Focus on Health, Not Perfection
Healthy skin glows. Healthy hair shines. Focus on wellness rather than meeting impossible standards.

## Community Support
Surround yourself with people who celebrate you. The BANIBS Beauty community is here to uplift you.

## Your Power
When you feel good about yourself, you radiate confidence. That confidence is magnetic and empowering.

You are beautiful. You are enough. You are powerful. 💪🏾✨
        """,
        "tags": ["empowerment", "confidence", "self-love"],
        "author": "BANIBS Beauty Team",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "title": "Save Money, Build Wealth: Smart Beauty Spending",
        "summary": "How to reduce beauty costs and support Black-owned businesses",
        "content": """
# Smart Beauty Spending

Did you know the average woman spends over $3,000/year on beauty? Here's how to save AND support Black businesses:

## Track Your Spending
Use our cost calculator to see where your money goes. Awareness is the first step.

## DIY When Possible
Learn simple at-home treatments:
- Deep conditioning masks
- Basic nail care
- Skincare routines

## Buy Black-Owned
When you spend with Black-owned businesses, you're building community wealth. Every dollar matters.

## Quality Over Quantity
Invest in fewer, higher-quality products from trusted Black brands rather than buying cheap products that don't work.

## Subscription Savings
Many Black-owned beauty brands offer subscriptions with discounts.

## Calculate Your Impact
If 1 million Black women redirect $100/month to Black-owned beauty businesses, that's $1.2 BILLION/year staying in our community.

Your beauty dollars have power. Use them wisely. 💰
        """,
        "tags": ["money", "savings", "wealth", "empowerment"],
        "author": "BANIBS Beauty Team",
        "created_at": datetime.now(timezone.utc)
    }
]


async def init_beauty_data():
    """Initialize beauty portal data"""
    db = get_db_client()
    
    print("🌺 Initializing Beauty & Wellness Portal data...")
    
    # Check if providers already exist
    existing_providers = await db.beauty_providers.count_documents({})
    if existing_providers == 0:
        await db.beauty_providers.insert_many(SAMPLE_PROVIDERS)
        print(f"✅ Created {len(SAMPLE_PROVIDERS)} sample beauty providers")
    else:
        print(f"✅ Beauty providers already initialized ({existing_providers} exist)")
    
    # Check if education articles already exist
    existing_articles = await db.beauty_education.count_documents({})
    if existing_articles == 0:
        await db.beauty_education.insert_many(EDUCATION_ARTICLES)
        print(f"✅ Created {len(EDUCATION_ARTICLES)} education articles")
    else:
        print(f"✅ Education articles already initialized ({existing_articles} exist)")
    
    # Create indexes
    await db.beauty_providers.create_index("type")
    await db.beauty_providers.create_index("location")
    await db.beauty_providers.create_index([("type", 1), ("location", 1)])
    
    await db.beauty_posts.create_index("category")
    await db.beauty_posts.create_index("created_at")
    await db.beauty_posts.create_index([("category", 1), ("created_at", -1)])
    
    await db.beauty_education.create_index("tags")
    await db.beauty_education.create_index("created_at")
    
    await db.beauty_spending.create_index("user_id")
    await db.beauty_spending.create_index([("user_id", 1), ("created_at", -1)])
    
    print("✅ Created database indexes")
    print("\n🌺 Beauty & Wellness Portal initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_beauty_data())
