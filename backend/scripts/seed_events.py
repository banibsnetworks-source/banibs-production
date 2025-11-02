"""
Seed Events - Phase 6.2.3
Populates 10 events across categories for Events & Networking module
Includes virtual, in-person, and past events for comprehensive testing
Priority events: BANIBS Small Business Meetup, Black Tech Founders Call,
Grant Application Workshop, Community Wealth Roundtable, Juneteenth, Kwanzaa
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')
sys.path.insert(0, str(Path(__file__).parent.parent))

from db.events import create_event
from db.unified_users import get_user_by_email


async def seed_events():
    print("=" * 60)
    print("BANIBS Events Seeding")
    print("=" * 60)
    
    # Get admin user
    admin = await get_user_by_email("admin@banibs.com")
    if not admin:
        print("❌ Admin user not found")
        return
    
    admin_id = admin["id"]
    admin_name = admin["name"]
    
    # Calculate dates
    now = datetime.now(timezone.utc)
    tomorrow = now + timedelta(days=1)
    next_week = now + timedelta(days=7)
    two_weeks = now + timedelta(days=14)
    three_weeks = now + timedelta(days=21)
    one_month = now + timedelta(days=30)
    past_date = now - timedelta(days=5)  # Past event for testing filters
    
    events_data = [
        # 1. BANIBS Small Business Meetup (In-Person, Upcoming)
        {
            "title": "BANIBS Small Business Meetup - New York",
            "description": "Join fellow Black and Indigenous entrepreneurs for an evening of networking, knowledge sharing, and community building. Connect with local business owners, discuss challenges, and explore collaboration opportunities. Light refreshments provided.",
            "category": "Meetup",
            "start_date": two_weeks,
            "end_date": two_weeks + timedelta(hours=3),
            "event_type": "In-Person",
            "location_name": "BANIBS Community Hub",
            "location_address": "123 Malcolm X Blvd, New York, NY 10027",
            "location_url": "https://goo.gl/maps/example",
            "organizer_email": "events@banibs.com",
            "rsvp_limit": 50,
            "tags": ["networking", "small-business", "community", "nyc"],
            "featured": True
        },
        
        # 2. Black Tech Founders Call (Virtual, Upcoming)
        {
            "title": "Black Tech Founders Monthly Call",
            "description": "Monthly virtual meetup for Black tech founders and aspiring entrepreneurs. Discuss fundraising strategies, product development, team building, and the unique challenges facing Black founders in tech. Guest speaker: TBD. Open to founders at all stages.",
            "category": "Webinar",
            "start_date": next_week,
            "end_date": next_week + timedelta(hours=1.5),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/banibs-tech-founders",
            "organizer_email": "tech@banibs.com",
            "rsvp_limit": 100,
            "tags": ["tech", "founders", "virtual", "startup", "fundraising"],
            "featured": True
        },
        
        # 3. Grant Application Workshop (Virtual, Upcoming)
        {
            "title": "Grant Application Workshop: Winning Strategies",
            "description": "Learn how to write compelling grant applications that get funded. This hands-on workshop covers: identifying the right grants, crafting strong narratives, building realistic budgets, and common pitfalls to avoid. Includes Q&A session with grant reviewers.",
            "category": "Workshop",
            "start_date": three_weeks,
            "end_date": three_weeks + timedelta(hours=2),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/banibs-grant-workshop",
            "organizer_email": "grants@banibs.com",
            "rsvp_limit": 75,
            "tags": ["grants", "funding", "workshop", "business", "nonprofit"],
            "featured": True
        },
        
        # 4. Community Wealth Roundtable (Hybrid, Upcoming)
        {
            "title": "Community Wealth Roundtable: Building Economic Power",
            "description": "Facilitated discussion on building wealth within Black and Indigenous communities. Topics include: cooperative economics, collective buying power, land ownership, financial literacy, and intergenerational wealth transfer. Featuring community leaders and financial experts.",
            "category": "Conference",
            "start_date": one_month,
            "end_date": one_month + timedelta(hours=4),
            "event_type": "Hybrid",
            "location_name": "The Schomburg Center",
            "location_address": "515 Malcolm X Blvd, New York, NY 10037",
            "location_url": "https://goo.gl/maps/schomburg",
            "virtual_url": "https://zoom.us/j/banibs-wealth-roundtable",
            "organizer_email": "wealth@banibs.com",
            "rsvp_limit": 150,
            "tags": ["wealth", "economics", "community", "financial-literacy"],
            "featured": True
        },
        
        # 5. Juneteenth Business & Culture Festival (Past Event - for filter testing)
        {
            "title": "Juneteenth Business & Culture Festival",
            "description": "A celebration of freedom, entrepreneurship, and Black culture. Featured: Black-owned business marketplace, live performances, keynote speakers, youth programs, and community awards. A day of education, empowerment, and celebration.",
            "category": "Social Gathering",
            "start_date": past_date,
            "end_date": past_date + timedelta(hours=8),
            "event_type": "In-Person",
            "location_name": "Central Park - Great Lawn",
            "location_address": "Central Park, New York, NY 10024",
            "location_url": "https://goo.gl/maps/centralpark",
            "organizer_email": "events@banibs.com",
            "rsvp_limit": 500,
            "tags": ["juneteenth", "culture", "festival", "black-owned", "celebration"],
            "featured": False
        },
        
        # 6. Indigenous Heritage & Business Symposium (Upcoming, In-Person)
        {
            "title": "Indigenous Heritage & Business Symposium",
            "description": "Two-day symposium celebrating Indigenous entrepreneurship, cultural heritage, and economic sovereignty. Panel discussions on: Indigenous business practices, cultural preservation through commerce, tribal economic development, and modern Indigenous entrepreneurship.",
            "category": "Conference",
            "start_date": now + timedelta(days=45),
            "end_date": now + timedelta(days=46),
            "event_type": "In-Person",
            "location_name": "Native American Cultural Center",
            "location_address": "Denver, CO",
            "organizer_email": "indigenous@banibs.com",
            "rsvp_limit": 200,
            "tags": ["indigenous", "heritage", "symposium", "cultural", "sovereignty"],
            "featured": True
        },
        
        # 7. Digital Marketing for Small Businesses (Virtual, Upcoming)
        {
            "title": "Digital Marketing 101 for Small Businesses",
            "description": "Master the essentials of digital marketing. Topics: social media strategy, email marketing, SEO basics, content creation, and analytics. Perfect for small business owners ready to grow their online presence. Includes actionable templates and tools.",
            "category": "Workshop",
            "start_date": now + timedelta(days=10),
            "end_date": now + timedelta(days=10, hours=2),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/banibs-digital-marketing",
            "organizer_email": "marketing@banibs.com",
            "rsvp_limit": 60,
            "tags": ["marketing", "digital", "social-media", "workshop", "seo"],
            "featured": False
        },
        
        # 8. Supplier Diversity Networking Night (In-Person, Upcoming)
        {
            "title": "Supplier Diversity Networking Night",
            "description": "Connect with corporate procurement officers and supplier diversity managers. Learn about certification programs, bidding processes, and relationship building. Ideal for businesses seeking to become corporate suppliers. Business casual attire.",
            "category": "Networking",
            "start_date": now + timedelta(days=18),
            "end_date": now + timedelta(days=18, hours=3),
            "event_type": "In-Person",
            "location_name": "Chicago Business Center",
            "location_address": "Chicago, IL",
            "organizer_email": "networking@banibs.com",
            "rsvp_limit": 80,
            "tags": ["supplier-diversity", "networking", "corporate", "procurement"],
            "featured": False
        },
        
        # 9. Kwanzaa Business Preview & Planning Session (Upcoming, Virtual)
        {
            "title": "Kwanzaa Business Preview & Planning Session",
            "description": "Get ahead of the holiday season! Plan your Kwanzaa business strategy with fellow entrepreneurs. Discuss: product planning, marketing campaigns, community partnerships, and cultural authenticity. Share ideas and build collaborations for the season of Ujamaa (cooperative economics).",
            "category": "Meetup",
            "start_date": now + timedelta(days=35),
            "end_date": now + timedelta(days=35, hours=1.5),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/banibs-kwanzaa-planning",
            "organizer_email": "culture@banibs.com",
            "tags": ["kwanzaa", "cultural", "holiday", "planning", "ujamaa"],
            "featured": False
        },
        
        # 10. AI & Automation for Entrepreneurs (Virtual, Upcoming)
        {
            "title": "AI & Automation for Entrepreneurs",
            "description": "Explore how AI and automation can transform your business operations. Learn about: AI tools for marketing, customer service automation, workflow optimization, and emerging AI opportunities for small businesses. No technical background required.",
            "category": "Webinar",
            "start_date": now + timedelta(days=12),
            "end_date": now + timedelta(days=12, hours=1.5),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/banibs-ai-automation",
            "organizer_email": "tech@banibs.com",
            "rsvp_limit": 120,
            "tags": ["ai", "automation", "technology", "innovation", "efficiency"],
            "featured": False
        }
    ]
    
    print(f"\n📋 Creating {len(events_data)} events...\n")
    
    created_count = 0
    for event in events_data:
        try:
            await create_event(
                title=event["title"],
                description=event["description"],
                category=event["category"],
                start_date=event["start_date"],
                end_date=event["end_date"],
                timezone_str="America/New_York",
                event_type=event["event_type"],
                organizer_id=admin_id,
                organizer_name=admin_name,
                organizer_email=event["organizer_email"],
                location_name=event.get("location_name"),
                location_address=event.get("location_address"),
                location_url=event.get("location_url"),
                virtual_url=event.get("virtual_url"),
                rsvp_limit=event.get("rsvp_limit"),
                tags=event.get("tags", []),
                featured=event.get("featured", False)
            )
            created_count += 1
            status = "🔥 FEATURED" if event.get("featured") else "  "
            event_type_icon = "🌐" if event["event_type"] == "Virtual" else "📍" if event["event_type"] == "In-Person" else "🔀"
            is_past = "⏰ PAST" if event["end_date"] < now else ""
            print(f"   {status} {event_type_icon} {is_past} {event['category']}: {event['title']}")
        except Exception as e:
            print(f"   ❌ Failed: {event['title']} - {e}")
    
    print(f"\n✅ Created {created_count}/{len(events_data)} events")
    print("\n📊 Event Breakdown:")
    print(f"   🌐 Virtual: {sum(1 for e in events_data if e['event_type'] == 'Virtual')}")
    print(f"   📍 In-Person: {sum(1 for e in events_data if e['event_type'] == 'In-Person')}")
    print(f"   🔀 Hybrid: {sum(1 for e in events_data if e['event_type'] == 'Hybrid')}")
    print(f"   🔥 Featured: {sum(1 for e in events_data if e.get('featured'))}")
    print(f"   ⏰ Past: 1 (Juneteenth Festival - for filter testing)")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_events())
