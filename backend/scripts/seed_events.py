"""
Seed Events - Phase 6.2.3
Populates 10 events (upcoming, past, in-person, virtual)
"""

import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

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
    
    now = datetime.now(timezone.utc)
    
    events_data = [
        # Upcoming events (7)
        {
            "title": "Black Business Networking Mixer",
            "description": "Connect with local Black business owners and entrepreneurs. Enjoy refreshments, exchange ideas, and build lasting partnerships.",
            "category": "Networking",
            "start_date": now + timedelta(days=13),
            "end_date": now + timedelta(days=13, hours=3),
            "event_type": "In-Person",
            "location_name": "Chicago Convention Center",
            "location_address": "2301 S King Dr, Chicago, IL 60616",
            "organizer_email": "events@banibs.com",
            "rsvp_limit": 100,
            "tags": ["networking", "business", "chicago"],
            "featured": True
        },
        {
            "title": "Tech Workshop: AI for Small Business",
            "description": "Learn how to leverage AI tools to grow your small business. Hands-on workshop with industry experts.",
            "category": "Workshop",
            "start_date": now + timedelta(days=18, hours=14),
            "end_date": now + timedelta(days=18, hours=16),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/123456789",
            "organizer_email": "workshops@banibs.com",
            "rsvp_limit": 50,
            "tags": ["tech", "ai", "workshop"],
            "featured": True
        },
        {
            "title": "Indigenous Entrepreneurs Webinar",
            "description": "Celebrating Indigenous entrepreneurship and exploring funding opportunities for Indigenous-owned businesses.",
            "category": "Webinar",
            "start_date": now + timedelta(days=20, hours=11),
            "end_date": now + timedelta(days=20, hours=12),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/987654321",
            "organizer_email": "webinars@banibs.com",
            "rsvp_limit": 200,
            "tags": ["indigenous", "funding", "webinar"],
            "featured": False
        },
        {
            "title": "Small Business Conference 2025",
            "description": "Three-day conference featuring keynote speakers, workshops, and networking. Both in-person and virtual attendance options.",
            "category": "Conference",
            "start_date": now + timedelta(days=29),
            "end_date": now + timedelta(days=31),
            "event_type": "Hybrid",
            "location_name": "Atlanta Convention Center",
            "location_address": "285 Andrew Young International Blvd NW, Atlanta, GA 30313",
            "virtual_url": "https://zoom.us/j/conference2025",
            "organizer_email": "conference@banibs.com",
            "rsvp_limit": 500,
            "tags": ["conference", "business", "atlanta"],
            "featured": True
        },
        {
            "title": "Community Meetup: Chicago",
            "description": "Casual meetup for local BANIBS community members. Share experiences, ask questions, and make friends!",
            "category": "Meetup",
            "start_date": now + timedelta(days=16, hours=19),
            "end_date": now + timedelta(days=16, hours=21),
            "event_type": "In-Person",
            "location_name": "The Coffee Lab",
            "location_address": "1256 S Wabash Ave, Chicago, IL 60605",
            "organizer_email": "meetups@banibs.com",
            "rsvp_limit": 30,
            "tags": ["meetup", "community", "chicago"],
            "featured": False
        },
        {
            "title": "Grant Writing Workshop",
            "description": "Master the art of grant writing with expert guidance. Learn tips and tricks for successful applications.",
            "category": "Workshop",
            "start_date": now + timedelta(days=25, hours=13),
            "end_date": now + timedelta(days=25, hours=15),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/grantwriting",
            "organizer_email": "workshops@banibs.com",
            "rsvp_limit": 75,
            "tags": ["grant", "funding", "workshop"],
            "featured": False
        },
        {
            "title": "Holiday Social Gathering",
            "description": "Join us for a festive celebration! Food, music, and community spirit.",
            "category": "Social Gathering",
            "start_date": now + timedelta(days=50, hours=18),
            "end_date": now + timedelta(days=50, hours=22),
            "event_type": "In-Person",
            "location_name": "Community Center",
            "location_address": "100 Main St, Chicago, IL 60601",
            "organizer_email": "events@banibs.com",
            "rsvp_limit": 150,
            "tags": ["social", "community", "celebration"],
            "featured": False
        },
        
        # Past events (2)
        {
            "title": "October Networking Event",
            "description": "Monthly networking event for business owners (PAST EVENT)",
            "category": "Networking",
            "start_date": now - timedelta(days=10),
            "end_date": now - timedelta(days=10, hours=-3),
            "event_type": "In-Person",
            "location_name": "Business Hub",
            "location_address": "456 Oak St, Chicago, IL 60602",
            "organizer_email": "events@banibs.com",
            "rsvp_limit": 50,
            "tags": ["networking", "past"],
            "featured": False
        },
        {
            "title": "Intro to Digital Marketing Webinar",
            "description": "Beginner-friendly webinar on digital marketing basics (PAST EVENT)",
            "category": "Webinar",
            "start_date": now - timedelta(days=5),
            "end_date": now - timedelta(days=5, hours=-2),
            "event_type": "Virtual",
            "virtual_url": "https://zoom.us/j/pastwebinar",
            "organizer_email": "webinars@banibs.com",
            "rsvp_limit": 100,
            "tags": ["marketing", "webinar", "past"],
            "featured": False
        },
        
        # Ongoing event (1)
        {
            "title": "Week-Long Business Bootcamp",
            "description": "Intensive 7-day bootcamp for aspiring entrepreneurs (CURRENTLY ONGOING)",
            "category": "Workshop",
            "start_date": now - timedelta(days=2),
            "end_date": now + timedelta(days=5),
            "event_type": "Hybrid",
            "location_name": "Innovation Hub",
            "location_address": "789 Tech Blvd, Chicago, IL 60603",
            "virtual_url": "https://zoom.us/j/bootcamp",
            "organizer_email": "bootcamp@banibs.com",
            "rsvp_limit": 40,
            "tags": ["bootcamp", "intensive", "ongoing"],
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
                timezone_str="America/Chicago",
                event_type=event["event_type"],
                organizer_id=admin_id,
                organizer_name=admin_name,
                organizer_email=event["organizer_email"],
                location_name=event.get("location_name"),
                location_address=event.get("location_address"),
                virtual_url=event.get("virtual_url"),
                rsvp_limit=event.get("rsvp_limit"),
                tags=event.get("tags", []),
                featured=event.get("featured", False)
            )
            created_count += 1
            status = "UPCOMING" if event["start_date"] > now else "PAST" if event["end_date"] < now else "ONGOING"
            print(f"   ✅ [{status}] {event['category']}: {event['title']}")
        except Exception as e:
            print(f"   ❌ Failed: {event['title']} - {e}")
    
    print(f"\n✅ Created {created_count}/{len(events_data)} events")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_events())
