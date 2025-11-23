"""
Seed data for BANIBS Ability Network
Phase 11.5.1
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from uuid import uuid4
import os

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = 'test_database'


async def seed_ability_data():
    """Seed initial ability resources"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n" + "="*60)
    print("BANIBS ABILITY NETWORK - SEED DATA")
    print("="*60 + "\n")
    
    # Clear existing data
    await db.ability_resources.delete_many({})
    print("🗑️  Cleared existing ability resources\n")
    
    # Ability Resources
    resources = [
        {
            "id": f"ability-{str(uuid4())[:8]}",
            "title": "Comprehensive Guide to Assistive Technology",
            "slug": "assistive-technology-guide",
            "category": "assistive_tech",
            "disability_types": ["physical", "visual", "hearing", "cognitive"],
            "age_groups": ["all_ages"],
            "format": "guide",
            "description": "Complete resource covering assistive technology options for various disabilities. Includes product recommendations, funding sources, and training resources.",
            "detailed_content": "# Assistive Technology Guide\n\nThis comprehensive guide covers:\n- Mobility aids and adaptive equipment\n- Communication devices (AAC)\n- Vision and hearing assistive technology\n- Cognitive support tools\n- Smart home adaptations\n- Funding and insurance coverage\n\nEach section includes product recommendations, vendors, and training resources.",
            "provider_name": "BANIBS Ability Network",
            "provider_organization": "BANIBS",
            "contact_website": "https://banibs.com/ability",
            "region": "National",
            "cost_range": "free",
            "languages_available": ["English", "Spanish"],
            "accessibility_features": ["screen_reader", "high_contrast", "large_text"],
            "tags": ["assistive_tech", "comprehensive", "free", "national"],
            "is_verified": True,
            "is_featured": True,
            "is_government_program": False,
            "is_user_submitted": False,
            "is_approved": True,
            "view_count": 0,
            "helpful_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"ability-{str(uuid4())[:8]}",
            "title": "Your Rights Under the ADA (Americans with Disabilities Act)",
            "slug": "ada-rights-guide",
            "category": "legal_rights",
            "disability_types": ["all"],
            "age_groups": ["adults", "seniors"],
            "format": "legal_doc",
            "description": "Know your legal rights! Comprehensive guide to ADA protections covering employment, public accommodations, transportation, and housing. Includes how to file complaints and seek accommodations.",
            "detailed_content": "# ADA Rights Guide\n\n## Employment Rights\n- Reasonable accommodations\n- Anti-discrimination protections\n- Interview and hiring process\n\n## Public Access\n- Accessibility requirements\n- Service animals\n- Effective communication\n\n## Filing Complaints\n- EEOC process\n- DOJ complaints\n- State agencies\n\n## Resources\n- Legal aid organizations\n- Self-advocacy groups\n- ADA coordinators",
            "provider_name": "U.S. Department of Justice",
            "provider_organization": "Civil Rights Division",
            "contact_website": "https://www.ada.gov",
            "region": "National",
            "cost_range": "free",
            "languages_available": ["English", "Spanish"],
            "accessibility_features": ["screen_reader", "plain_language"],
            "tags": ["legal", "ADA", "rights", "employment", "government"],
            "is_verified": True,
            "is_featured": True,
            "is_government_program": True,
            "is_user_submitted": False,
            "is_approved": True,
            "view_count": 0,
            "helpful_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"ability-{str(uuid4())[:8]}",
            "title": "Caregiver Support and Self-Care Resources",
            "slug": "caregiver-support-resources",
            "category": "caregiver_support",
            "disability_types": ["all"],
            "age_groups": ["adults", "seniors"],
            "format": "guide",
            "description": "Essential resources for family caregivers. Covers respite care options, financial assistance, mental health support, and practical caregiving strategies. Includes culturally sensitive approaches for Black families.",
            "detailed_content": "# Caregiver Support Guide\n\n## Self-Care Strategies\n- Preventing burnout\n- Mental health resources\n- Support groups\n\n## Respite Care\n- Finding respite services\n- Financial assistance programs\n- Emergency backup care\n\n## Financial Planning\n- Medicaid waivers\n- Veterans benefits\n- Tax credits and deductions\n\n## Cultural Considerations\n- Honoring family traditions\n- Community support systems\n- Faith-based resources\n\n## Practical Skills\n- Medical care at home\n- Communication with healthcare providers\n- Adaptive equipment",
            "provider_name": "National Alliance for Caregiving",
            "provider_organization": "NAC",
            "contact_website": "https://www.caregiving.org",
            "region": "National",
            "cost_range": "free",
            "languages_available": ["English"],
            "accessibility_features": ["screen_reader", "downloadable_pdf"],
            "tags": ["caregiver", "support", "self_care", "respite", "mental_health"],
            "is_verified": True,
            "is_featured": True,
            "is_government_program": False,
            "is_user_submitted": False,
            "is_approved": True,
            "view_count": 0,
            "helpful_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"ability-{str(uuid4())[:8]}",
            "title": "Neurodiversity Affirming Resources for Families",
            "slug": "neurodiversity-affirming-resources",
            "category": "neurodiversity",
            "disability_types": ["neurodivergent", "cognitive"],
            "age_groups": ["children", "teens", "young_adults"],
            "format": "directory",
            "description": "Curated collection of neurodiversity-affirming resources for autistic individuals, those with ADHD, dyslexia, and other cognitive differences. Focuses on strengths-based approaches and community connection.",
            "detailed_content": "# Neurodiversity Resources\n\n## Understanding Neurodiversity\n- Identity-first vs. person-first language\n- Strengths and challenges\n- Embracing neurodivergent identity\n\n## Education\n- IEP/504 plan advocacy\n- Alternative learning approaches\n- Accommodations and modifications\n\n## Employment\n- Disclosure considerations\n- Workplace accommodations\n- Neurodiversity hiring programs\n\n## Community\n- Autistic-led organizations\n- ADHD support groups\n- Dyslexia resources\n- Online communities\n\n## Tools and Strategies\n- Executive function support\n- Sensory accommodations\n- Communication supports",
            "provider_name": "Autistic Self Advocacy Network",
            "provider_organization": "ASAN",
            "contact_website": "https://autisticadvocacy.org",
            "region": "National",
            "cost_range": "free",
            "languages_available": ["English"],
            "accessibility_features": ["plain_language", "visual_supports", "screen_reader"],
            "tags": ["neurodiversity", "autism", "ADHD", "advocacy", "community"],
            "is_verified": True,
            "is_featured": True,
            "is_government_program": False,
            "is_user_submitted": False,
            "is_approved": True,
            "view_count": 0,
            "helpful_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"ability-{str(uuid4())[:8]}",
            "title": "Social Security Disability Benefits (SSDI/SSI) Application Guide",
            "slug": "ssdi-ssi-application-guide",
            "category": "government_programs",
            "disability_types": ["all"],
            "age_groups": ["adults", "seniors"],
            "format": "guide",
            "description": "Step-by-step guide to applying for Social Security disability benefits. Covers eligibility requirements, application process, medical documentation, appeals, and how to work with representatives.",
            "detailed_content": "# SSDI/SSI Application Guide\n\n## Understanding the Programs\n- SSDI vs. SSI differences\n- Eligibility criteria\n- Benefit amounts\n\n## Application Process\n- Required documentation\n- Medical evidence needed\n- Work history requirements\n\n## After You Apply\n- Processing timeline\n- What to expect\n- Continuing disability reviews\n\n## If Denied\n- Appeals process\n- Reconsideration\n- Hearing before ALJ\n- Appeals Council\n- Federal court\n\n## Getting Help\n- Disability advocates\n- Legal representatives\n- Free clinics",
            "provider_name": "Social Security Administration",
            "provider_organization": "SSA",
            "contact_website": "https://www.ssa.gov/disability",
            "contact_phone": "1-800-772-1213",
            "region": "National",
            "cost_range": "free",
            "languages_available": ["English", "Spanish"],
            "accessibility_features": ["screen_reader", "tty_phone", "sign_language"],
            "tags": ["SSDI", "SSI", "benefits", "government", "application"],
            "is_verified": True,
            "is_featured": False,
            "is_government_program": True,
            "is_user_submitted": False,
            "is_approved": True,
            "view_count": 0,
            "helpful_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"ability-{str(uuid4())[:8]}",
            "title": "Home Modification Guide for Accessibility",
            "slug": "home-modification-accessibility-guide",
            "category": "home_modification",
            "disability_types": ["physical", "visual", "all"],
            "age_groups": ["adults", "seniors"],
            "format": "guide",
            "description": "Practical guide to making your home more accessible. Covers ramps, bathroom modifications, kitchen adaptations, smart home technology, and funding sources including grants and low-interest loans.",
            "detailed_content": "# Home Modification Guide\n\n## Assessment\n- Occupational therapy home evaluation\n- Identifying barriers\n- Prioritizing modifications\n\n## Common Modifications\n- Ramps and lifts\n- Bathroom accessibility\n- Kitchen adaptations\n- Doorway widening\n- Flooring changes\n- Lighting improvements\n\n## Smart Home Technology\n- Voice-controlled systems\n- Automated doors and windows\n- Smart appliances\n- Emergency alert systems\n\n## Funding Sources\n- Medicaid waivers\n- VA grants\n- HUD programs\n- Non-profit organizations\n- Low-interest loans\n\n## Finding Contractors\n- Certified aging-in-place specialists\n- Getting bids\n- Checking references",
            "provider_name": "AARP HomeFit Guide",
            "provider_organization": "AARP",
            "contact_website": "https://www.aarp.org/homefit",
            "region": "National",
            "cost_range": "free",
            "languages_available": ["English", "Spanish"],
            "accessibility_features": ["screen_reader", "downloadable_pdf", "video_guides"],
            "tags": ["home_modification", "accessibility", "aging_in_place", "funding"],
            "is_verified": True,
            "is_featured": False,
            "is_government_program": False,
            "is_user_submitted": False,
            "is_approved": True,
            "view_count": 0,
            "helpful_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.ability_resources.insert_many(resources)
    print(f"   ✅ Inserted {len(resources)} ability resources\n")
    
    print("="*60)
    print("SEED DATA INITIALIZATION COMPLETE")
    print("="*60 + "\n")
    
    print("📊 Data Summary:")
    print(f"   Ability Resources: {len(resources)}")
    print("\n✅ Ability Network is ready!\n")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_ability_data())
