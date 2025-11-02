"""
Seed Resources - Phase 6.2.3
Populates 20 resources across 6 categories
"""

import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')
sys.path.insert(0, str(Path(__file__).parent.parent))

from db.resources import create_resource
from db.unified_users import get_user_by_email


async def seed_resources():
    print("=" * 60)
    print("BANIBS Resources Seeding")
    print("=" * 60)
    
    # Get admin user
    admin = await get_user_by_email("admin@banibs.com")
    if not admin:
        print("❌ Admin user not found")
        return
    
    admin_id = admin["id"]
    admin_name = admin["name"]
    
    resources_data = [
        # Business Support (4)
        {
            "title": "How to Register Your Business",
            "description": "Complete guide to business registration for Black and Indigenous entrepreneurs",
            "category": "Business Support",
            "type": "Guide",
            "content": "# Business Registration Guide\n\nStep-by-step instructions for registering your business...",
            "tags": ["business", "registration", "legal"],
            "featured": True
        },
        {
            "title": "Business Plan Template",
            "description": "Free downloadable business plan template with examples",
            "category": "Business Support",
            "type": "Download",
            "external_url": "https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan",
            "tags": ["business", "planning", "template"],
            "featured": False
        },
        {
            "title": "Marketing for Small Businesses",
            "description": "Essential marketing strategies for small business owners",
            "category": "Business Support",
            "type": "Article",
            "content": "# Marketing Strategies\n\nLearn how to market your business effectively...",
            "tags": ["marketing", "business", "strategy"],
            "featured": False
        },
        {
            "title": "Financial Management Basics",
            "description": "Understanding financial statements and cash flow management",
            "category": "Business Support",
            "type": "Video",
            "video_url": "https://www.youtube.com/watch?v=example",
            "tags": ["finance", "accounting", "business"],
            "featured": False
        },
        
        # Grants & Funding (4)
        {
            "title": "Small Business Grant Application Guide",
            "description": "How to find and apply for grants successfully",
            "category": "Grants & Funding",
            "type": "Guide",
            "content": "# Grant Application Guide\n\nDiscover available grants and learn the application process...",
            "tags": ["grant", "funding", "application"],
            "featured": True
        },
        {
            "title": "List of Grants for Black Entrepreneurs",
            "description": "Curated list of grants specifically for Black business owners",
            "category": "Grants & Funding",
            "type": "Article",
            "external_url": "https://www.mbda.gov/grants",
            "tags": ["grant", "funding", "black-owned"],
            "featured": True
        },
        {
            "title": "Crowdfunding Best Practices",
            "description": "Tips for running successful crowdfunding campaigns",
            "category": "Grants & Funding",
            "type": "Guide",
            "content": "# Crowdfunding Guide\n\nMaximize your crowdfunding success...",
            "tags": ["crowdfunding", "funding", "kickstarter"],
            "featured": False
        },
        {
            "title": "SBA Loan Programs Overview",
            "description": "Understanding Small Business Administration loan options",
            "category": "Grants & Funding",
            "type": "Article",
            "external_url": "https://www.sba.gov/funding-programs/loans",
            "tags": ["loan", "sba", "funding"],
            "featured": False
        },
        
        # Education (3)
        {
            "title": "Free Online Business Courses",
            "description": "Top free courses for entrepreneurs and business owners",
            "category": "Education",
            "type": "Article",
            "external_url": "https://www.coursera.org/courses?query=business",
            "tags": ["education", "courses", "free"],
            "featured": True
        },
        {
            "title": "Certification Programs for Entrepreneurs",
            "description": "Professional certification programs to boost your credentials",
            "category": "Education",
            "type": "Guide",
            "content": "# Certification Programs\n\nExplore certification opportunities...",
            "tags": ["certification", "education", "professional"],
            "featured": False
        },
        {
            "title": "Mentorship Opportunities",
            "description": "Find experienced mentors in your industry",
            "category": "Education",
            "type": "Article",
            "content": "# Finding a Mentor\n\nConnect with experienced business leaders...",
            "tags": ["mentorship", "networking", "growth"],
            "featured": False
        },
        
        # Health & Wellness (3)
        {
            "title": "Mental Health Resources for Entrepreneurs",
            "description": "Support services and resources for entrepreneurial mental health",
            "category": "Health & Wellness",
            "type": "Guide",
            "external_url": "https://www.nami.org/",
            "tags": ["mental-health", "wellness", "support"],
            "featured": False
        },
        {
            "title": "Work-Life Balance Strategies",
            "description": "Maintaining balance while building your business",
            "category": "Health & Wellness",
            "type": "Article",
            "content": "# Work-Life Balance\n\nStrategies for healthy work-life integration...",
            "tags": ["balance", "wellness", "lifestyle"],
            "featured": False
        },
        {
            "title": "Healthcare Options for Small Business Owners",
            "description": "Understanding healthcare coverage for entrepreneurs",
            "category": "Health & Wellness",
            "type": "Guide",
            "external_url": "https://www.healthcare.gov/small-businesses/",
            "tags": ["healthcare", "insurance", "business"],
            "featured": False
        },
        
        # Technology (3)
        {
            "title": "Free Tools for Small Businesses",
            "description": "Essential free software and tools for running your business",
            "category": "Technology",
            "type": "Article",
            "content": "# Free Business Tools\n\nDiscover essential free tools for your business...",
            "tags": ["tools", "software", "free"],
            "featured": True
        },
        {
            "title": "Website Building Guide",
            "description": "How to create a professional website for your business",
            "category": "Technology",
            "type": "Guide",
            "content": "# Website Building\n\nBuild your business website step-by-step...",
            "tags": ["website", "online", "digital"],
            "featured": False
        },
        {
            "title": "Social Media Marketing Tools",
            "description": "Top tools for managing your social media presence",
            "category": "Technology",
            "type": "Tool",
            "external_url": "https://buffer.com/",
            "tags": ["social-media", "marketing", "tools"],
            "featured": False
        },
        
        # Community & Culture (3)
        {
            "title": "Networking Groups & Organizations",
            "description": "Connect with Black and Indigenous business communities",
            "category": "Community & Culture",
            "type": "Article",
            "content": "# Business Networks\n\nFind your community and build connections...",
            "tags": ["networking", "community", "organizations"],
            "featured": True
        },
        {
            "title": "Cultural Heritage Preservation Guides",
            "description": "Resources for preserving Indigenous cultural heritage",
            "category": "Community & Culture",
            "type": "Guide",
            "external_url": "https://www.nativephilanthropy.org/",
            "tags": ["culture", "heritage", "indigenous"],
            "featured": False
        },
        {
            "title": "Community Building Strategies",
            "description": "How to build and engage your local community",
            "category": "Community & Culture",
            "type": "Article",
            "content": "# Community Building\n\nStrategies for growing a strong community...",
            "tags": ["community", "engagement", "local"],
            "featured": False
        }
    ]
    
    print(f"\n📋 Creating {len(resources_data)} resources...\n")
    
    created_count = 0
    for resource in resources_data:
        try:
            await create_resource(
                title=resource["title"],
                description=resource["description"],
                category=resource["category"],
                resource_type=resource["type"],
                author_id=admin_id,
                author_name=admin_name,
                content=resource.get("content"),
                external_url=resource.get("external_url"),
                tags=resource.get("tags", []),
                featured=resource.get("featured", False),
                video_url=resource.get("video_url")
            )
            created_count += 1
            print(f"   ✅ {resource['category']}: {resource['title']}")
        except Exception as e:
            print(f"   ❌ Failed: {resource['title']} - {e}")
    
    print(f"\n✅ Created {created_count}/{len(resources_data)} resources")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_resources())
