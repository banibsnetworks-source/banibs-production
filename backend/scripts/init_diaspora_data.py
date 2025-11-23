"""
Diaspora Connect Portal - Database Seeding Script
Phase 12.0

Populates initial data for regions, businesses, education articles, and sample stories.
"""

import asyncio
import sys
import os
from datetime import datetime
from uuid import uuid4

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from db.diaspora import DiasporaDB


# ==================== SEED DATA ====================

REGIONS_DATA = [
    {
        "name": "North America",
        "slug": "north-america",
        "description": "Home to vibrant Black communities across the United States and Canada, shaped by the Great Migration and ongoing cultural evolution.",
        "countries": ["United States", "Canada"],
        "highlight_cities": ["Atlanta", "New York", "Chicago", "Los Angeles", "Toronto", "Washington DC", "Houston", "Detroit"]
    },
    {
        "name": "Caribbean",
        "slug": "caribbean",
        "description": "Island nations rich in African heritage, from music and cuisine to language and spiritual traditions.",
        "countries": ["Jamaica", "Haiti", "Trinidad & Tobago", "Barbados", "Dominican Republic", "Cuba"],
        "highlight_cities": ["Kingston", "Port-au-Prince", "Port of Spain", "Bridgetown", "Santo Domingo", "Havana"]
    },
    {
        "name": "West Africa",
        "slug": "west-africa",
        "description": "The ancestral homeland of millions across the diaspora, a region of powerful kingdoms, resilient cultures, and modern innovation.",
        "countries": ["Ghana", "Nigeria", "Senegal", "Ivory Coast", "Benin", "Sierra Leone"],
        "highlight_cities": ["Accra", "Lagos", "Dakar", "Abidjan", "Cotonou", "Freetown"]
    },
    {
        "name": "East Africa",
        "slug": "east-africa",
        "description": "Cradle of humanity and a region of extraordinary diversity, from ancient civilizations to modern diaspora hubs.",
        "countries": ["Kenya", "Ethiopia", "Tanzania", "Uganda", "Rwanda"],
        "highlight_cities": ["Nairobi", "Addis Ababa", "Dar es Salaam", "Kampala", "Kigali"]
    },
    {
        "name": "Central & Southern Africa",
        "slug": "central-south-africa",
        "description": "Regions of immense cultural wealth and historical significance, from ancient kingdoms to modern movements.",
        "countries": ["South Africa", "Zimbabwe", "Angola", "Democratic Republic of Congo", "Mozambique"],
        "highlight_cities": ["Johannesburg", "Cape Town", "Harare", "Luanda", "Kinshasa", "Maputo"]
    },
    {
        "name": "Europe",
        "slug": "europe",
        "description": "Growing Black communities across the continent, shaped by migration, creativity, and cultural exchange.",
        "countries": ["United Kingdom", "France", "Germany", "Netherlands", "Portugal", "Italy"],
        "highlight_cities": ["London", "Paris", "Berlin", "Amsterdam", "Lisbon", "Rome"]
    },
    {
        "name": "Latin America",
        "slug": "latin-america",
        "description": "Home to the largest African diaspora population in the world, with deep roots in Brazil and across the continent.",
        "countries": ["Brazil", "Colombia", "Venezuela", "Ecuador", "Panama"],
        "highlight_cities": ["São Paulo", "Salvador", "Rio de Janeiro", "Cartagena", "Caracas", "Quito"]
    }
]


BUSINESSES_DATA = [
    {
        "name": "Accra Heritage Tours",
        "type": "tour",
        "region_slug": "west-africa",
        "country": "Ghana",
        "city": "Accra",
        "website": "https://accraheritagetours.com",
        "description": "Guided cultural and historical tours throughout Ghana, specializing in Door of No Return visits and ancestral village connections.",
        "social_links": {"instagram": "@accraheritage"},
        "is_black_owned": True
    },
    {
        "name": "Kingston Cultural Experience",
        "type": "tour",
        "region_slug": "caribbean",
        "country": "Jamaica",
        "city": "Kingston",
        "website": "https://kingstoncultural.com",
        "description": "Immersive cultural tours exploring Jamaica's music, food, and heritage sites across the island.",
        "social_links": {"instagram": "@kingstonculture"},
        "is_black_owned": True
    },
    {
        "name": "Diaspora House Lagos",
        "type": "lodging",
        "region_slug": "west-africa",
        "country": "Nigeria",
        "city": "Lagos",
        "website": "https://diasporahouselr.com",
        "description": "Boutique guesthouse designed for diaspora travelers seeking comfort, community, and cultural connection.",
        "social_links": {"instagram": "@diasporahouse_lagos"},
        "is_black_owned": True
    },
    {
        "name": "Soul Food Kitchen - Paris",
        "type": "food",
        "region_slug": "europe",
        "country": "France",
        "city": "Paris",
        "website": "https://soulfoodparis.fr",
        "description": "Authentic Southern-style soul food bringing Black American culinary traditions to the heart of Paris.",
        "social_links": {"instagram": "@soulfoodparis"},
        "is_black_owned": True
    },
    {
        "name": "Afrobeats Dance Academy - Atlanta",
        "type": "culture",
        "region_slug": "north-america",
        "country": "United States",
        "city": "Atlanta",
        "website": "https://afrobeatsatl.com",
        "description": "Dance studio celebrating African and diaspora movement traditions through classes, performances, and community events.",
        "social_links": {"instagram": "@afrobeatsatl"},
        "is_black_owned": True
    },
    {
        "name": "Black Nomad Travel Concierge",
        "type": "service",
        "region_slug": "north-america",
        "country": "United States",
        "city": "New York",
        "website": "https://blacknomadtravel.com",
        "description": "Full-service travel concierge specializing in African and Caribbean diaspora destinations, relocation planning, and cultural immersion trips.",
        "social_links": {"instagram": "@blacknomadtravel"},
        "is_black_owned": True
    }
]


EDUCATION_DATA = [
    {
        "title": "Understanding the Global Black Diaspora",
        "content": """The African diaspora represents one of the most significant population movements in human history. Today, over 200 million people of African descent live outside the African continent, creating vibrant communities from the Caribbean to Europe, from North America to Latin America.

This diaspora was shaped by multiple waves of migration—both forced and voluntary. The transatlantic slave trade forcibly displaced millions of Africans to the Americas and Caribbean between the 16th and 19th centuries. Later, the Great Migration saw millions of Black Americans move from the rural South to urban centers in the North and West between 1916 and 1970.

More recently, voluntary migration has connected Africa with global cities, as professionals, students, and entrepreneurs build bridges between continents. This modern diaspora is characterized by transnational networks, cultural exchange, and economic ties that strengthen the entire Black world.

Understanding this history helps us recognize both the trauma and the triumph—the resilience, creativity, and power of Black people who have built thriving communities across every continent.""",
        "tags": ["history", "identity", "migration"]
    },
    {
        "title": "The Great Migration: Reshaping America",
        "content": """Between 1916 and 1970, approximately six million Black Americans left the rural South for cities in the North, Midwest, and West. This massive internal migration, known as the Great Migration, fundamentally reshaped American culture, politics, and economics.

Driven by a search for better economic opportunities, escape from Jim Crow segregation, and hope for a better life, Black families traveled by train, bus, and car to cities like Chicago, Detroit, New York, Los Angeles, and Oakland. They brought with them Southern culture—music, food, religious traditions, and social practices—that would evolve into new forms in urban settings.

The Great Migration gave birth to the Harlem Renaissance, transformed American music through jazz and blues, and created the industrial Black middle class. It also changed politics, as Black voters in Northern cities gained political power that would be crucial to the Civil Rights Movement.

Today, the legacy of the Great Migration lives on in Black urban communities across America, and in a recent reverse migration that has seen many Black Americans return to the South, particularly Atlanta, Charlotte, and Houston.""",
        "tags": ["history", "migration", "culture"]
    },
    {
        "title": "The Caribbean Diaspora: Islands of Resilience",
        "content": """The Caribbean is home to some of the world's most culturally rich and historically significant Black communities. From Jamaica to Haiti, Trinidad to Barbados, island nations forged unique cultures that blend African traditions with influences from Indigenous peoples, Europeans, and Asian immigrants.

Haiti became the first Black republic in 1804, after enslaved Africans successfully overthrew French colonial rule in the only successful slave revolution in history. Jamaica gave the world reggae music, Rastafarianism, and global icons like Marcus Garvey and Bob Marley. Trinidad invented the steel drum and hosts the world's most vibrant Carnival celebration.

Caribbean people have also migrated extensively, creating diaspora communities in New York, Toronto, London, and beyond. These migrations have enriched global Black culture while maintaining strong ties to island homelands. Remittances, cultural exchanges, and transnational families keep the connection alive.

Today, Caribbean nations face challenges from climate change, economic pressures, and the legacy of colonialism. Yet Caribbean people continue to demonstrate extraordinary resilience, creativity, and cultural power that influences the entire world.""",
        "tags": ["history", "culture", "identity"]
    },
    {
        "title": "Return to Africa: Modern Homecoming Movements",
        "content": """For centuries, people of African descent in the diaspora have dreamed of returning to the continent. Today, that dream is becoming reality for thousands who are moving to African countries for work, retirement, cultural connection, and a sense of homecoming.

Ghana's "Year of Return" in 2019 marked 400 years since the first enslaved Africans arrived in Virginia. The campaign invited diaspora descendants to visit, invest, and even relocate to Ghana. Thousands responded, and many chose to stay. The Ghanaian government has since created pathways for diaspora citizens to gain residency and citizenship.

Beyond Ghana, other African nations are welcoming diaspora returnees. Rwanda offers special programs for skilled professionals. South Africa, Kenya, and Senegal have growing expatriate communities. These movements represent a healing of historical trauma and a rebuilding of connections severed by slavery and colonialism.

Returnees often face challenges—cultural adjustment, language barriers, navigating dual identities. Yet many report a profound sense of belonging, purpose, and spiritual healing. The return movement is creating new economic opportunities, cultural exchanges, and political connections that strengthen both Africa and its global diaspora.""",
        "tags": ["migration", "identity", "economics"]
    }
]


STORIES_DATA = [
    {
        "title": "Finding Home in Accra",
        "content": """After 35 years in Atlanta, I finally made the move to Ghana last year. It wasn't easy—leaving behind family, friends, and a successful career. But every day I wake up in Accra, I know I made the right choice.

The feeling of being in the majority for the first time in my life is indescribable. Walking through Osu, shopping at the market, attending church—everywhere I go, I see Black excellence. Black doctors, Black entrepreneurs, Black politicians. Not as exceptions or tokens, but as the norm.

Yes, there are challenges. The traffic is intense. The power can be unreliable. I'm still learning Twi and navigating cultural differences. But I've found a community of other diaspora returnees who understand this journey. And the warmth of Ghanaians who welcome us home has been overwhelming.

To anyone considering the move: do your research, visit multiple times, have realistic expectations. But if you feel the call, trust it. There's something powerful about standing on the same soil as your ancestors, about investing your resources and talents in Africa's future. I'm home.""",
        "origin_region_slug": "west-africa",
        "current_region_slug": "west-africa",
        "anonymous": False,
        "author_name": "Marcus Thompson"
    },
    {
        "title": "Bridging Two Worlds: My Journey Between Kingston and Toronto",
        "content": """I was born in Kingston, Jamaica, but my family moved to Toronto when I was eight. For years, I struggled with feeling split between two worlds—not quite Jamaican enough when I visited home, not quite Canadian enough in Toronto.

As I got older, I started to see this duality as a gift rather than a burden. I carry Caribbean warmth and directness in Canadian spaces that sometimes feel cold and indirect. I bring Canadian efficiency and organization to family gatherings that run on "island time." I code-switch effortlessly, speaking patois with my cousins and standard English at work.

Now in my 30s, I make it a priority to visit Jamaica at least twice a year. I invest in property there, support local businesses, and stay connected to family. My children will grow up knowing both cultures, both homes.

The diaspora experience isn't about choosing one identity over another. It's about embracing all of who we are—the complexity, the richness, the ability to move between worlds. We are bridges, and that's our power.""",
        "origin_region_slug": "caribbean",
        "current_region_slug": "north-america",
        "anonymous": False,
        "author_name": "Keisha Brown"
    },
    {
        "title": "A Journey of Healing",
        "content": """I visited Senegal last year as part of my healing journey. As a descendant of enslaved people, I needed to stand on African soil, to visit Gorée Island, to face that history directly.

Walking through the Door of No Return, I broke down. The weight of generational trauma, the grief of separation, the horror of what my ancestors endured—it all hit me at once. But our guide, a Senegalese historian, said something that changed my perspective: "They left through the Door of No Return. But you have returned. You are the answer to their prayers."

That reframed everything for me. I'm not just carrying trauma—I'm carrying triumph. My existence, my education, my freedom to travel and choose my path, is testament to my ancestors' survival and resistance.

I returned home changed. I'm more connected to my heritage, more proud of my people's resilience, more committed to honoring those who came before. That trip to Senegal wasn't just tourism—it was pilgrimage, medicine, transformation.""",
        "origin_region_slug": "west-africa",
        "current_region_slug": "north-america",
        "anonymous": True,
        "author_name": None
    }
]


# ==================== SEEDING FUNCTIONS ====================

async def seed_regions(diaspora_db: DiasporaDB):
    """Seed diaspora regions"""
    print("🌍 Seeding regions...")
    region_map = {}
    
    for region_data in REGIONS_DATA:
        region = await diaspora_db.create_region(region_data)
        region_map[region_data["slug"]] = region["id"]
        print(f"  ✓ Created region: {region['name']}")
    
    return region_map


async def seed_businesses(diaspora_db: DiasporaDB, region_map: dict):
    """Seed diaspora businesses"""
    print("\n🏢 Seeding businesses...")
    
    for business_data in BUSINESSES_DATA:
        region_slug = business_data.pop("region_slug")
        business_data["region_id"] = region_map[region_slug]
        
        await diaspora_db.create_business(business_data)
        print(f"  ✓ Created business: {business_data['name']}")


async def seed_education(diaspora_db: DiasporaDB):
    """Seed education articles"""
    print("\n📚 Seeding education articles...")
    
    for article_data in EDUCATION_DATA:
        await diaspora_db.create_education_article(article_data)
        print(f"  ✓ Created article: {article_data['title']}")


async def seed_stories(diaspora_db: DiasporaDB, region_map: dict):
    """Seed sample stories"""
    print("\n📖 Seeding sample stories...")
    
    # Create a sample user ID for seeded stories
    sample_user_id = str(uuid4())
    
    for story_data in STORIES_DATA:
        origin_slug = story_data.pop("origin_region_slug", None)
        current_slug = story_data.pop("current_region_slug", None)
        
        origin_region_id = region_map.get(origin_slug) if origin_slug else None
        current_region_id = region_map.get(current_slug) if current_slug else None
        
        await diaspora_db.create_story(
            user_id=sample_user_id,
            title=story_data["title"],
            content=story_data["content"],
            origin_region_id=origin_region_id,
            current_region_id=current_region_id,
            anonymous=story_data["anonymous"],
            author_name=story_data.get("author_name"),
            author_avatar=None
        )
        print(f"  ✓ Created story: {story_data['title']}")


# ==================== MAIN ====================

async def main():
    """Main seeding function"""
    # Get MongoDB URL from environment
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    
    # Connect to MongoDB
    print(f"Connecting to MongoDB at {mongo_url}...")
    client = AsyncIOMotorClient(mongo_url)
    db = client.banibs
    
    # Initialize DiasporaDB
    diaspora_db = DiasporaDB(db)
    
    # Check if data already exists
    existing_regions = await diaspora_db.get_regions()
    if existing_regions:
        print("\n⚠️  Diaspora data already exists!")
        response = input("Do you want to re-seed? This will duplicate data. (yes/no): ")
        if response.lower() != "yes":
            print("Seeding cancelled.")
            return
    
    print("\n" + "="*50)
    print("DIASPORA CONNECT PORTAL - DATA SEEDING")
    print("="*50)
    
    try:
        # Seed in order (regions first, since others depend on them)
        region_map = await seed_regions(diaspora_db)
        await seed_businesses(diaspora_db, region_map)
        await seed_education(diaspora_db)
        await seed_stories(diaspora_db, region_map)
        
        print("\n" + "="*50)
        print("✅ SEEDING COMPLETE!")
        print("="*50)
        print(f"\nSeeded:")
        print(f"  • {len(REGIONS_DATA)} regions")
        print(f"  • {len(BUSINESSES_DATA)} businesses")
        print(f"  • {len(EDUCATION_DATA)} education articles")
        print(f"  • {len(STORIES_DATA)} sample stories")
        print("\nDiaspora Connect Portal is ready! 🌍")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
