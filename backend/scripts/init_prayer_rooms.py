"""
Initialize Prayer Rooms - Phase 11.0
Run this script to create the initial prayer rooms in the database
"""

import asyncio
from uuid import uuid4
from datetime import datetime, timezone
from db.connection import get_db_client


INITIAL_ROOMS = [
    {
        "id": str(uuid4()),
        "name": "Christian Prayer Room",
        "slug": "christian",
        "description": "A space for Christian prayer, worship, and spiritual reflection. Share your prayers and receive support from fellow believers.",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Muslim Prayer Room",
        "slug": "muslim",
        "description": "A sacred space for Islamic prayer (Salah), dua, and dhikr. Connect with brothers and sisters in faith.",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Interfaith Unity Room",
        "slug": "interfaith",
        "description": "A welcoming space for all faiths to pray together in unity. All spiritual traditions are honored here.",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Meditation & Peace Room",
        "slug": "meditation",
        "description": "A quiet sanctuary for meditation, mindfulness, and inner peace. Find calm and clarity here.",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid4()),
        "name": "Emergency Prayer Circle",
        "slug": "emergency",
        "description": "24/7 urgent prayer support for immediate needs. The community stands ready to pray with you in your time of need.",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
]


async def init_prayer_rooms():
    """Initialize prayer rooms in database"""
    db = get_db_client()
    
    print("🙏 Initializing Prayer Rooms...")
    
    # Check if rooms already exist
    existing_count = await db.prayer_rooms.count_documents({})
    if existing_count > 0:
        print(f"✅ Prayer rooms already initialized ({existing_count} rooms exist)")
        return
    
    # Insert rooms
    await db.prayer_rooms.insert_many(INITIAL_ROOMS)
    
    # Create indexes
    await db.prayer_rooms.create_index("slug", unique=True)
    await db.prayer_rooms.create_index("is_active")
    
    await db.prayer_posts.create_index("room_id")
    await db.prayer_posts.create_index("created_at")
    await db.prayer_posts.create_index([("room_id", 1), ("created_at", -1)])
    
    await db.prayer_amens.create_index("post_id")
    await db.prayer_amens.create_index([("post_id", 1), ("user_id", 1)], unique=True)
    
    print(f"✅ Created {len(INITIAL_ROOMS)} prayer rooms")
    print("✅ Created database indexes")
    print("\nRooms created:")
    for room in INITIAL_ROOMS:
        print(f"  - {room['name']} (/portal/prayer/room/{room['slug']})")
    
    print("\n🙏 Prayer Rooms initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_prayer_rooms())
