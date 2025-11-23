"""
Initialize Sneakers & Fashion Ownership Portal - Phase 11.2
Run this script to seed initial brands and education articles
"""

import asyncio
from uuid import uuid4
from datetime import datetime, timezone
from db.connection import get_db_client


SAMPLE_BRANDS = [
    {
        "id": str(uuid4()),
        "name": "FearOfGodEssentials",
        "type": "clothing",
        "description": "Luxury streetwear by Jerry Lorenzo, redefining contemporary fashion",
        "country": "USA",
        "city": "Los Angeles",
        "website": "https://fearofgod.com",
        "social_links": {"instagram": "@fearofgod"},
        "is_black_owned": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Kerby Jean-Raymond (Pyer Moss)",
        "type": "designer",
        "description": "Haute couture designer celebrating Black heritage and innovation",
        "country": "USA",
        "city": "New York",
        "website": "https://pyermoss.com",
        "social_links": {"instagram": "@pyermoss"},
        "is_black_owned": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Reebok x Kerby",
        "type": "sneaker",
        "description": "Collaborative sneaker line blending culture and performance",
        "country": "USA",
        "city": "Boston",
        "website": "https://reebok.com/pyermoss",
        "social_links": {"instagram": "@reebok"},
        "is_black_owned": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Heron Preston",
        "type": "clothing",
        "description": "Streetwear designer known for sustainability and bold graphics",
        "country": "USA",
        "city": "New York",
        "website": "https://heronpreston.com",
        "social_links": {"instagram": "@heronpreston"},
        "is_black_owned": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Bephies Beauty Supply",
        "type": "boutique",
        "description": "Black-owned fashion and lifestyle boutique",
        "country": "USA",
        "city": "Los Angeles",
        "website": "https://bephies.com",
        "social_links": {"instagram": "@bephiesbeautysupply"},
        "is_black_owned": True,
        "created_at": datetime.now(timezone.utc)
    }
]


EDUCATION_ARTICLES = [
    {
        "id": str(uuid4()),
        "title": "How Sneaker Brands Actually Make Money",
        "summary": "Understanding the business model behind your favorite kicks",
        "content": """
# How Sneaker Brands Actually Make Money

Ever wonder how a pair of sneakers that costs $30 to make sells for $200? Let's break it down.

## The Supply Chain

1. **Manufacturing**: Sneakers are typically made in factories overseas (China, Vietnam, Indonesia) for $15-$40 per pair depending on materials and complexity.

2. **Shipping & Import**: Getting shoes from factory to warehouse costs $5-$10 per pair.

3. **Wholesale Markup**: Brands sell to retailers at 50-60% of retail price. A $200 shoe? Retailer buys it for $100-$120.

4. **Retail Markup**: Stores mark it up to suggested retail price to cover rent, employees, and profit.

## Where The Real Money Is

- **Hype & Scarcity**: Limited releases create demand that exceeds supply = higher prices
- **Collaborations**: Designer x Brand partnerships drive premium pricing
- **Resale Market**: Some sneakers flip for 2-10x retail on StockX/GOAT
- **Licensing & Royalties**: Major athletes and celebs get 5-15% of wholesale revenue

## The Opportunity

If you understand this model, you can:
- Start small with custom designs
- Build hype through social media
- Partner with manufacturers
- Own your margin instead of feeding someone else's

The sneaker game is business. Learn it. Own it. 👟💰
        """,
        "tags": ["business", "sneakers", "ownership", "manufacturing"],
        "author": "BANIBS Fashion Team",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "title": "From Hypebeast to Owner: A Mindset Shift",
        "summary": "Transform your passion for fashion into ownership",
        "content": """
# From Hypebeast to Owner: A Mindset Shift

Loving fashion is beautiful. But there's a difference between being a consumer and being an owner.

## Consumer Mindset
- "I need those new Jordans"
- "Copped 3 pairs this month"
- "My collection is my identity"
- Net worth tied up in closet items

## Owner Mindset
- "What can I create?"
- "How do I build my brand?"
- "My collection inspires my designs"
- Net worth grows from business, not just purchases

## The Shift

You don't have to abandon your love for sneakers and streetwear. Instead, **redirect that energy**:

### 1. Study the Brands You Love
- What makes their designs work?
- How do they market?
- What's their story?

### 2. Start Small
- Customize existing shoes
- Design graphics for t-shirts
- Create a small capsule collection
- Test demand with friends

### 3. Build Your Audience
- Share your process on social media
- Connect with others on the same path
- Document your journey

### 4. Invest Wisely
- Instead of buying 10 pairs of hype sneakers, invest that money in:
  - Manufacturing samples
  - Marketing your brand
  - Website and e-commerce
  - Professional photos

## The Numbers

Average sneakerhead spends $2,000-$5,000/year on shoes. If you redirect even 20% of that into building your own line:

- Year 1: $400-$1,000 → Create samples, build social presence
- Year 2: Small batch production, first sales
- Year 3: Scalable brand with actual revenue

You can love fashion AND own it. Choose ownership. 🚀
        """,
        "tags": ["mindset", "ownership", "entrepreneurship", "wealth"],
        "author": "BANIBS Fashion Team",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "title": "Black Designers Who Changed The Game",
        "summary": "Learn from the pioneers who built fashion empires",
        "content": """
# Black Designers Who Changed The Game

Fashion isn't new to us. We've been setting trends and building brands for decades. Here are the legends you should know:

## Dapper Dan (1944-)
**The Original Luxury Remixer**
- Started in Harlem in the 1980s
- Created custom luxury pieces using high-end logos
- Dressed hip-hop royalty (LL Cool J, Salt-N-Pepa, Mike Tyson)
- Now has official partnership with Gucci

**Lesson**: Create what doesn't exist. Don't wait for permission.

## Virgil Abloh (1980-2021)
**From Architecture to Creative Director**
- Founded Off-White in 2012
- Became Louis Vuitton's Men's Artistic Director in 2018
- First Black creative director at a French luxury house
- Built a billion-dollar brand from scratch

**Lesson**: Your unique perspective is your superpower. Blend worlds.

## Kerby Jean-Raymond (Pyer Moss)
**Fashion as Cultural Statement**
- Founded Pyer Moss in 2013
- First Black American designer invited to Paris Haute Couture
- Uses fashion to tell Black American stories
- Collaborates with Reebok on sneakers

**Lesson**: Your culture is your currency. Don't dilute it.

## Jerry Lorenzo (Fear of God)
**From Assistant to Empire**
- Started Fear of God in 2013 with no fashion training
- Built following through Instagram and celebrity endorsements
- Now valued at over $500 million
- Essentials line makes luxury streetwear accessible

**Lesson**: Start where you are. Build in public. Serve your community.

## The Common Thread

None of them waited for approval. They:
1. Saw a gap in the market
2. Created something authentic to their vision
3. Built community around their work
4. Stayed true to their cultural roots
5. Scaled without compromising

**You can be next.** Study their paths. Learn the game. Build your empire. 👑
        """,
        "tags": ["history", "designers", "inspiration", "culture"],
        "author": "BANIBS Fashion Team",
        "created_at": datetime.now(timezone.utc)
    }
]


async def init_fashion_data():
    """Initialize fashion portal data"""
    db = get_db_client()
    
    print("👟 Initializing Sneakers & Fashion Portal data...")
    
    # Check if brands already exist
    existing_brands = await db.fashion_brands.count_documents({})
    if existing_brands == 0:
        await db.fashion_brands.insert_many(SAMPLE_BRANDS)
        print(f"✅ Created {len(SAMPLE_BRANDS)} sample fashion brands")
    else:
        print(f"✅ Fashion brands already initialized ({existing_brands} exist)")
    
    # Check if education articles already exist
    existing_articles = await db.fashion_education.count_documents({})
    if existing_articles == 0:
        await db.fashion_education.insert_many(EDUCATION_ARTICLES)
        print(f"✅ Created {len(EDUCATION_ARTICLES)} education articles")
    else:
        print(f"✅ Education articles already initialized ({existing_articles} exist)")
    
    # Create indexes
    await db.fashion_brands.create_index("type")
    await db.fashion_brands.create_index("country")
    await db.fashion_brands.create_index([("type", 1), ("country", 1)])
    
    await db.fashion_posts.create_index("category")
    await db.fashion_posts.create_index("created_at")
    await db.fashion_posts.create_index([("category", 1), ("created_at", -1)])
    
    await db.fashion_education.create_index("tags")
    await db.fashion_education.create_index("created_at")
    
    await db.fashion_spending.create_index("user_id")
    await db.fashion_spending.create_index([("user_id", 1), ("created_at", -1)])
    
    print("✅ Created database indexes")
    print("\n👟 Sneakers & Fashion Portal initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_fashion_data())
