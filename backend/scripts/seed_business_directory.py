"""
Phase 7.2 - Seed Business Directory

Creates sample business listings for the BANIBS Business Directory
with diverse categories, locations, and verification statuses.
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.connection import client, db

BUSINESSES = [
    {
        "id": "bus-001-techforward",
        "business_name": "TechForward Solutions",
        "description": "Full-stack engineering, cloud consulting, and digital transformation services for businesses of all sizes.",
        "category": "Technology",
        "phone": "(404) 555-0101",
        "email": "contact@techforward.com",
        "website": "https://techforward.com",
        "address": "123 Peachtree St NE",
        "city": "Atlanta",
        "state": "GA",
        "zip_code": "30303",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=TechForward+Solutions&background=3b82f6&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-002-soulfood",
        "business_name": "Soul Sisters Kitchen",
        "description": "Authentic Southern soul food with family recipes passed down through generations. Catering available for events.",
        "category": "Food & Beverage",
        "phone": "(404) 555-0202",
        "email": "hello@soulsisterskitchen.com",
        "website": "https://soulsisterskitchen.com",
        "address": "456 Auburn Ave NE",
        "city": "Atlanta",
        "state": "GA",
        "zip_code": "30312",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Soul+Sisters+Kitchen&background=f59e0b&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-003-community-legal",
        "business_name": "Community Legal Partners",
        "description": "Affordable legal services focused on housing, employment, and civil rights. Free consultations available.",
        "category": "Professional Services",
        "phone": "(202) 555-0303",
        "email": "info@communitylegalpartners.org",
        "website": "https://communitylegalpartners.org",
        "address": "789 Martin Luther King Jr Ave SE",
        "city": "Washington",
        "state": "DC",
        "zip_code": "20032",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Community+Legal+Partners&background=10b981&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": False,  # Black-supporting nonprofit
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-004-heritage-boutique",
        "business_name": "Heritage Fashion Boutique",
        "description": "Contemporary African and African-American fashion, accessories, and art. Celebrating culture through style.",
        "category": "Retail",
        "phone": "(312) 555-0404",
        "email": "shop@heritagefashion.com",
        "website": "https://heritagefashion.com",
        "address": "234 S Michigan Ave",
        "city": "Chicago",
        "state": "IL",
        "zip_code": "60604",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Heritage+Fashion&background=ec4899&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-005-wellness-center",
        "business_name": "Holistic Wellness Center",
        "description": "Integrative health services including massage therapy, acupuncture, nutrition counseling, and mental health support.",
        "category": "Healthcare",
        "phone": "(713) 555-0505",
        "email": "info@holisticwellness.com",
        "website": "https://holisticwellness.com",
        "address": "567 Main Street",
        "city": "Houston",
        "state": "TX",
        "zip_code": "77002",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Holistic+Wellness&background=8b5cf6&color=fff&size=200",
        "is_verified": False,  # Unverified business
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-006-youth-academy",
        "business_name": "Future Leaders Youth Academy",
        "description": "After-school programs, tutoring, and mentorship for middle and high school students. STEM focus with college prep.",
        "category": "Education",
        "phone": "(215) 555-0606",
        "email": "contact@futureleadersacademy.org",
        "website": "https://futureleadersacademy.org",
        "address": "890 Broad Street",
        "city": "Philadelphia",
        "state": "PA",
        "zip_code": "19123",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Future+Leaders&background=06b6d4&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": False,  # Black-supporting nonprofit
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-007-construction",
        "business_name": "BuildRight Construction Group",
        "description": "Commercial and residential construction, renovation, and project management. Minority-certified contractor.",
        "category": "Construction",
        "phone": "(404) 555-0707",
        "email": "projects@buildrightgroup.com",
        "website": "https://buildrightgroup.com",
        "address": "1234 Industrial Blvd",
        "city": "Atlanta",
        "state": "GA",
        "zip_code": "30318",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=BuildRight&background=f97316&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-008-transit-solutions",
        "business_name": "Metro Transit Solutions",
        "description": "Employee shuttle services, event transportation, and logistics coordination for businesses and organizations.",
        "category": "Transportation",
        "phone": "(510) 555-0808",
        "email": "dispatch@metrotransitsolutions.com",
        "website": "https://metrotransitsolutions.com",
        "address": "456 Broadway",
        "city": "Oakland",
        "state": "CA",
        "zip_code": "94607",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Metro+Transit&background=14b8a6&color=fff&size=200",
        "is_verified": False,  # Unverified
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-009-arts-collective",
        "business_name": "Renaissance Arts Collective",
        "description": "Gallery space, artist studios, and community arts programming. Supporting Black visual artists and performers.",
        "category": "Arts & Entertainment",
        "phone": "(718) 555-0909",
        "email": "hello@renaissancearts.org",
        "website": "https://renaissancearts.org",
        "address": "789 Fulton Street",
        "city": "Brooklyn",
        "state": "NY",
        "zip_code": "11238",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Renaissance+Arts&background=a855f7&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-010-realty",
        "business_name": "Cornerstone Realty Group",
        "description": "Full-service real estate brokerage specializing in residential and commercial properties. First-time homebuyer programs.",
        "category": "Real Estate",
        "phone": "(301) 555-1010",
        "email": "agents@cornerstonerealty.com",
        "website": "https://cornerstonerealty.com",
        "address": "321 K Street NW",
        "city": "Washington",
        "state": "DC",
        "zip_code": "20001",
        "country": "USA",
        "logo_url": "https://ui-avatars.com/api/?name=Cornerstone+Realty&background=ef4444&color=fff&size=200",
        "is_verified": True,
        "is_black_owned": True,
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]


async def seed_businesses():
    """Seed business directory with sample listings"""
    print("🌱 Seeding Business Directory...")
    
    business_listings = db.business_listings
    
    # Check if data already exists
    existing_count = await business_listings.count_documents({})
    if existing_count > 0:
        print(f"⚠️  Found {existing_count} existing businesses")
        response = input("Clear existing data and reseed? (yes/no): ")
        if response.lower() == "yes":
            result = await business_listings.delete_many({})
            print(f"🗑️  Deleted {result.deleted_count} existing businesses")
        else:
            print("❌ Seeding cancelled")
            return
    
    # Insert businesses
    result = await business_listings.insert_many(BUSINESSES)
    print(f"✅ Inserted {len(result.inserted_ids)} businesses")
    
    # Show summary
    verified_count = sum(1 for b in BUSINESSES if b["is_verified"])
    black_owned_count = sum(1 for b in BUSINESSES if b["is_black_owned"])
    
    categories = {}
    for b in BUSINESSES:
        cat = b["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n📊 Summary:")
    print(f"   - Total businesses: {len(BUSINESSES)}")
    print(f"   - Verified: {verified_count}")
    print(f"   - Black-owned: {black_owned_count}")
    print(f"   - Categories: {', '.join(categories.keys())}")
    
    # Test the API
    print(f"\n🧪 Testing API endpoint...")
    test_listings = await business_listings.find({}, {"_id": 0, "business_name": 1, "category": 1, "city": 1}).to_list(length=5)
    for listing in test_listings:
        print(f"   ✓ {listing['business_name']} ({listing['category']}) - {listing['city']}")
    
    print("\n✅ Business Directory seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_businesses())
