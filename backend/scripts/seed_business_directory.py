"""
Phase 7.2 - Seed Business Directory

Creates sample business listings matching the correct schema
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.connection import client, db

BUSINESSES = [
    {
        "id": "bus-001-techforward",
        "business_name": "TechForward Solutions",
        "description": "Full-stack engineering, cloud consulting, and digital transformation services for businesses of all sizes.",
        "category": "Technology",
        "contact_phone": "(404) 555-0101",
        "contact_email": "contact@techforward.com",
        "website": "https://techforward.com",
        "address_line1": "123 Peachtree St NE",
        "city": "Atlanta",
        "state": "GA",
        "postal_code": "30303",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=TechForward+Solutions&background=3b82f6&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-002-soulfood",
        "business_name": "Soul Sisters Kitchen",
        "description": "Authentic Southern soul food with family recipes passed down through generations. Catering available for events.",
        "category": "Food & Beverage",
        "contact_phone": "(404) 555-0202",
        "contact_email": "hello@soulsisterskitchen.com",
        "website": "https://soulsisterskitchen.com",
        "address_line1": "456 Auburn Ave NE",
        "city": "Atlanta",
        "state": "GA",
        "postal_code": "30312",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Soul+Sisters+Kitchen&background=f59e0b&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-003-community-legal",
        "business_name": "Community Legal Partners",
        "description": "Affordable legal services focused on housing, employment, and civil rights. Free consultations available.",
        "category": "Professional Services",
        "contact_phone": "(202) 555-0303",
        "contact_email": "info@communitylegalpartners.org",
        "website": "https://communitylegalpartners.org",
        "address_line1": "789 Martin Luther King Jr Ave SE",
        "city": "Washington",
        "state": "DC",
        "postal_code": "20032",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Community+Legal+Partners&background=10b981&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-004-heritage-boutique",
        "business_name": "Heritage Fashion Boutique",
        "description": "Contemporary African and African-American fashion, accessories, and art. Celebrating culture through style.",
        "category": "Retail",
        "contact_phone": "(312) 555-0404",
        "contact_email": "shop@heritagefashion.com",
        "website": "https://heritagefashion.com",
        "address_line1": "234 S Michigan Ave",
        "city": "Chicago",
        "state": "IL",
        "postal_code": "60604",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Heritage+Fashion&background=ec4899&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-005-wellness-center",
        "business_name": "Holistic Wellness Center",
        "description": "Integrative health services including massage therapy, acupuncture, nutrition counseling, and mental health support.",
        "category": "Healthcare",
        "contact_phone": "(713) 555-0505",
        "contact_email": "info@holisticwellness.com",
        "website": "https://holisticwellness.com",
        "address_line1": "567 Main Street",
        "city": "Houston",
        "state": "TX",
        "postal_code": "77002",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Holistic+Wellness&background=8b5cf6&color=fff&size=200",
        "verified": False,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-006-youth-academy",
        "business_name": "Future Leaders Youth Academy",
        "description": "After-school programs, tutoring, and mentorship for middle and high school students. STEM focus with college prep.",
        "category": "Education",
        "contact_phone": "(215) 555-0606",
        "contact_email": "contact@futureleadersacademy.org",
        "website": "https://futureleadersacademy.org",
        "address_line1": "890 Broad Street",
        "city": "Philadelphia",
        "state": "PA",
        "postal_code": "19123",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Future+Leaders&background=06b6d4&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-007-construction",
        "business_name": "BuildRight Construction Group",
        "description": "Commercial and residential construction, renovation, and project management. Minority-certified contractor.",
        "category": "Construction",
        "contact_phone": "(404) 555-0707",
        "contact_email": "projects@buildrightgroup.com",
        "website": "https://buildrightgroup.com",
        "address_line1": "1234 Industrial Blvd",
        "city": "Atlanta",
        "state": "GA",
        "postal_code": "30318",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=BuildRight&background=f97316&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-008-transit-solutions",
        "business_name": "Metro Transit Solutions",
        "description": "Employee shuttle services, event transportation, and logistics coordination for businesses and organizations.",
        "category": "Transportation",
        "contact_phone": "(510) 555-0808",
        "contact_email": "dispatch@metrotransitsolutions.com",
        "website": "https://metrotransitsolutions.com",
        "address_line1": "456 Broadway",
        "city": "Oakland",
        "state": "CA",
        "postal_code": "94607",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Metro+Transit&background=14b8a6&color=fff&size=200",
        "verified": False,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-009-arts-collective",
        "business_name": "Renaissance Arts Collective",
        "description": "Gallery space, artist studios, and community arts programming. Supporting Black visual artists and performers.",
        "category": "Arts & Entertainment",
        "contact_phone": "(718) 555-0909",
        "contact_email": "hello@renaissancearts.org",
        "website": "https://renaissancearts.org",
        "address_line1": "789 Fulton Street",
        "city": "Brooklyn",
        "state": "NY",
        "postal_code": "11238",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Renaissance+Arts&background=a855f7&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "bus-010-realty",
        "business_name": "Cornerstone Realty Group",
        "description": "Full-service real estate brokerage specializing in residential and commercial properties. First-time homebuyer programs.",
        "category": "Real Estate",
        "contact_phone": "(301) 555-1010",
        "contact_email": "agents@cornerstonerealty.com",
        "website": "https://cornerstonerealty.com",
        "address_line1": "321 K Street NW",
        "city": "Washington",
        "state": "DC",
        "postal_code": "20001",
        "country": "United States",
        "logo_url": "https://ui-avatars.com/api/?name=Cornerstone+Realty&background=ef4444&color=fff&size=200",
        "verified": True,
        "status": "active",
        "owner_id": "admin-user-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]


async def seed_businesses():
    print("🌱 Seeding Business Directory...")
    
    business_listings = db.business_listings
    
    # Clear existing
    result = await business_listings.delete_many({})
    print(f"🗑️  Deleted {result.deleted_count} existing businesses")
    
    # Insert
    result = await business_listings.insert_many(BUSINESSES)
    print(f"✅ Inserted {len(result.inserted_ids)} businesses")
    
    # Summary
    verified_count = sum(1 for b in BUSINESSES if b["verified"])
    categories = set(b["category"] for b in BUSINESSES)
    
    print(f"\n📊 Summary:")
    print(f"   - Total: {len(BUSINESSES)}")
    print(f"   - Verified: {verified_count}")
    print(f"   - Categories: {len(categories)}")
    
    print("\n✅ Business Directory seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_businesses())
