"""
Seed data for BANIBS Ability Network
Phase 11.5.1 - Resources
Phase 11.5.2 - Providers
Phase 11.5.3 - Support Groups (Circles)
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
    await db.ability_providers.delete_many({})
    await db.circles.delete_many({"pillar": "ability"})
    print("🗑️  Cleared existing ability resources, providers, and support groups\n")
    
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
    
    # Phase 11.5.2 - Ability Providers
    print("👥 Seeding Ability Providers...\n")
    
    providers = [
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "Dr. Maya Thompson, SLP",
            "provider_type": "therapist",
            "specializations": ["speech_therapy", "language_development", "AAC_devices", "swallowing_disorders"],
            "disability_types_served": ["cognitive", "neurodivergent", "physical", "all"],
            "age_groups_served": ["children", "teens", "young_adults", "adults"],
            "credentials": ["CCC-SLP", "MA Speech Pathology", "AAC Specialist"],
            "bio": "Dr. Maya Thompson is a certified speech-language pathologist with 15 years of experience working with children and adults with communication challenges. She specializes in augmentative and alternative communication (AAC) devices and has extensive experience supporting autistic individuals and those with cerebral palsy. Dr. Thompson takes a neurodiversity-affirming approach and works closely with families to develop individualized treatment plans.",
            "organization": "Thompson Speech & Language Center",
            "region": "Southeast",
            "city": "Atlanta",
            "state": "GA",
            "telehealth_available": True,
            "in_person_available": True,
            "languages": ["English", "Spanish"],
            "accepts_insurance": True,
            "insurance_accepted": ["Medicaid", "Medicare", "BCBS", "Aetna", "UnitedHealthcare"],
            "cost_range": "$$",
            "contact_website": "https://thompsonspeech.example.com",
            "contact_email": "info@thompsonspeech.example.com",
            "contact_phone": "(404) 555-0123",
            "availability": "Mon-Fri 9am-6pm, Sat 10am-2pm",
            "is_verified": True,
            "is_black_owned": True,
            "rating": 4.9,
            "total_reviews": 47,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "NeuroSpectrum Support Services",
            "provider_type": "specialist",
            "specializations": ["autism_support", "ADHD_coaching", "executive_function", "social_skills", "sensory_integration"],
            "disability_types_served": ["neurodivergent", "cognitive"],
            "age_groups_served": ["children", "teens", "young_adults"],
            "credentials": ["BCBA", "Licensed Clinical Psychologists", "Certified Autism Specialists"],
            "bio": "NeuroSpectrum Support Services is a Black-owned practice dedicated to supporting neurodivergent individuals and their families. Our team includes board-certified behavior analysts, clinical psychologists, and certified autism specialists who provide comprehensive assessments, individualized therapy, parent coaching, and school consultation. We embrace a strengths-based, neurodiversity-affirming philosophy that honors each person's unique way of being.",
            "organization": "NeuroSpectrum Support Services",
            "region": "Mid-Atlantic",
            "city": "Washington",
            "state": "DC",
            "telehealth_available": True,
            "in_person_available": True,
            "languages": ["English"],
            "accepts_insurance": True,
            "insurance_accepted": ["Medicaid", "BCBS", "Cigna", "Aetna"],
            "cost_range": "$$",
            "contact_website": "https://neurospectrum.example.com",
            "contact_email": "contact@neurospectrum.example.com",
            "contact_phone": "(202) 555-0456",
            "availability": "Mon-Sat 8am-8pm",
            "is_verified": True,
            "is_black_owned": True,
            "rating": 4.8,
            "total_reviews": 89,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "Mobility & Independence Rehab Center",
            "provider_type": "therapist",
            "specializations": ["physical_therapy", "occupational_therapy", "wheelchair_training", "adaptive_equipment", "home_modifications"],
            "disability_types_served": ["physical", "chronic_condition", "all"],
            "age_groups_served": ["young_adults", "adults", "seniors"],
            "credentials": ["Licensed PT", "Licensed OT", "CAPS (Certified Aging-in-Place Specialist)"],
            "bio": "Mobility & Independence Rehab Center provides comprehensive physical and occupational therapy services focused on maximizing independence and quality of life. Our team specializes in wheelchair training, adaptive equipment assessment, and home modification consultations. We work with individuals recovering from injuries, managing chronic conditions, and aging with disabilities to help them maintain their independence and participate fully in their communities.",
            "organization": "Mobility & Independence Rehab Center",
            "region": "Midwest",
            "city": "Chicago",
            "state": "IL",
            "telehealth_available": False,
            "in_person_available": True,
            "languages": ["English"],
            "accepts_insurance": True,
            "insurance_accepted": ["Medicare", "Medicaid", "BCBS", "Humana", "UnitedHealthcare"],
            "cost_range": "$$$",
            "contact_website": "https://mobilityindependence.example.com",
            "contact_email": "info@mobilityindependence.example.com",
            "contact_phone": "(312) 555-0789",
            "availability": "Mon-Fri 7am-7pm",
            "is_verified": True,
            "is_black_owned": False,
            "rating": 4.7,
            "total_reviews": 124,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "Justice & Access Legal Advocates",
            "provider_type": "advocate",
            "specializations": ["disability_rights", "ADA_compliance", "SSDI_appeals", "special_education", "employment_discrimination"],
            "disability_types_served": ["all"],
            "age_groups_served": ["children", "teens", "young_adults", "adults", "seniors"],
            "credentials": ["Licensed Attorneys", "Disability Rights Specialists", "Special Education Advocates"],
            "bio": "Justice & Access Legal Advocates is a nonprofit law firm dedicated to protecting the civil rights of individuals with disabilities. Our attorneys and advocates have extensive experience with ADA compliance, SSDI/SSI appeals, special education law (IEPs and 504 plans), employment discrimination, and housing accessibility. We provide free consultations and work on a sliding scale fee structure to ensure access to legal representation for all.",
            "organization": "Justice & Access Legal Advocates",
            "region": "West Coast",
            "city": "Los Angeles",
            "state": "CA",
            "telehealth_available": True,
            "in_person_available": True,
            "languages": ["English", "Spanish"],
            "accepts_insurance": False,
            "insurance_accepted": [],
            "cost_range": "$",
            "contact_website": "https://justiceaccess.example.org",
            "contact_email": "help@justiceaccess.example.org",
            "contact_phone": "(323) 555-0234",
            "availability": "Mon-Fri 9am-5pm",
            "is_verified": True,
            "is_black_owned": True,
            "rating": 4.9,
            "total_reviews": 67,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "Caregiver Wellness & Support Network",
            "provider_type": "case_manager",
            "specializations": ["caregiver_support", "respite_care", "care_coordination", "mental_health", "support_groups"],
            "disability_types_served": ["all"],
            "age_groups_served": ["adults", "seniors"],
            "credentials": ["Licensed Social Workers", "Certified Care Managers", "Mental Health Counselors"],
            "bio": "Caregiver Wellness & Support Network provides comprehensive support services for family caregivers of individuals with disabilities. Our licensed social workers and care managers help coordinate services, connect families with resources, facilitate support groups, and provide counseling to prevent caregiver burnout. We understand the unique challenges faced by Black families caring for disabled loved ones and offer culturally competent, trauma-informed care.",
            "organization": "Caregiver Wellness & Support Network",
            "region": "Southeast",
            "city": "Houston",
            "state": "TX",
            "telehealth_available": True,
            "in_person_available": True,
            "languages": ["English", "Spanish"],
            "accepts_insurance": True,
            "insurance_accepted": ["Medicaid", "Medicare", "Private insurance"],
            "cost_range": "$",
            "contact_website": "https://caregiverwellness.example.org",
            "contact_email": "support@caregiverwellness.example.org",
            "contact_phone": "(713) 555-0567",
            "availability": "Mon-Sun 24/7 hotline, Office hours Mon-Fri 8am-6pm",
            "is_verified": True,
            "is_black_owned": True,
            "rating": 4.8,
            "total_reviews": 156,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.ability_providers.insert_many(providers)
    print(f"   ✅ Inserted {len(providers)} ability providers\n")
    
    # Phase 11.5.3 - Support Groups (Circles)
    print("👥 Seeding Ability Support Groups...\n")
    
    circles = [
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Autism & ADHD (Adults)",
            "slug": "autism-adhd-adults",
            "description": "A neurodiversity-affirming space for autistic and ADHD adults to share experiences, strategies, and support. We celebrate neurodivergent identities and discuss workplace, relationships, daily life, and self-advocacy.",
            "pillar": "ability",
            "tags": ["autism", "ADHD", "neurodiversity", "adults"],
            "primary_disability_type": "neurodivergent",
            "audience": "self",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": True,
            "safety_notes": "Identity-first language welcomed. No functioning labels or cure talk.",
            "rules": [
                "No ableist language or functioning labels",
                "Respect neurodiversity paradigm",
                "No unsolicited advice",
                "Share personal experiences, not medical claims",
                "Be patient with communication differences"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 47,
            "post_count": 289,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Black Caregivers Circle",
            "slug": "black-caregivers-circle",
            "description": "A dedicated space for Black family caregivers supporting loved ones with disabilities. Share culturally relevant strategies, navigate systems, prevent burnout, and find community. You don't have to do this alone.",
            "pillar": "ability",
            "tags": ["caregiver", "Black community", "family support", "respite"],
            "primary_disability_type": "all",
            "audience": "caregiver",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": True,
            "safety_notes": "Trauma-aware space. We honor cultural traditions and family structures.",
            "rules": [
                "No judgment of caregiving choices",
                "Respect confidentiality",
                "Center Black caregiver experiences",
                "No medical advice",
                "Support self-care and boundaries"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 134,
            "post_count": 567,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Living with Chronic Pain",
            "slug": "living-with-chronic-pain",
            "description": "For those living with chronic pain conditions. Share coping strategies, medical experiences, pain management techniques, and emotional support. A judgment-free zone for good days and bad.",
            "pillar": "ability",
            "tags": ["chronic pain", "chronic illness", "pain management", "self care"],
            "primary_disability_type": "chronic",
            "audience": "self",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": True,
            "safety_notes": "No graphic descriptions of pain. Trigger warnings for medical procedures.",
            "rules": [
                "No one-size-fits-all advice",
                "Respect varied pain experiences",
                "No cure claims or MLM products",
                "Validate invisible illness",
                "Content warnings for triggering topics"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 89,
            "post_count": 423,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Parents of Autistic Children",
            "slug": "parents-autistic-children",
            "description": "For parents raising autistic children. Connect with other parents, share resources, discuss IEPs, sensory strategies, and celebrate your child's strengths. Neurodiversity-affirming and accepting.",
            "pillar": "ability",
            "tags": ["autism", "parenting", "children", "IEP", "school support"],
            "primary_disability_type": "neurodivergent",
            "audience": "caregiver",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": True,
            "safety_notes": "Presuming competence. No ABA debates. Focus on support.",
            "rules": [
                "Presume competence in all children",
                "No cure-seeking discussions",
                "Respect communication differences",
                "Share resources, not diagnoses",
                "Celebrate neurodivergent children"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 203,
            "post_count": 1456,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Stroke Recovery & Mobility",
            "slug": "stroke-recovery-mobility",
            "description": "Supporting individuals recovering from stroke and navigating mobility changes. Share therapy progress, adaptive strategies, emotional journeys, and practical tips for daily living.",
            "pillar": "ability",
            "tags": ["stroke", "mobility", "recovery", "physical disability"],
            "primary_disability_type": "physical",
            "audience": "both",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": False,
            "safety_notes": "Be patient with communication differences. Aphasia-friendly.",
            "rules": [
                "Recovery looks different for everyone",
                "No pressure to 'get better'",
                "Share experiences, not medical advice",
                "Be patient with typing/communication",
                "Celebrate all progress"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 62,
            "post_count": 234,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Vision & Hearing Loss Support",
            "slug": "vision-hearing-loss-support",
            "description": "For individuals with vision loss, hearing loss, or deafblindness. Share assistive technology tips, navigation strategies, communication preferences, and experiences in a sighted/hearing world.",
            "pillar": "ability",
            "tags": ["vision loss", "hearing loss", "Deaf", "blind", "assistive tech"],
            "primary_disability_type": "sensory",
            "audience": "both",
            "privacy_level": "public",
            "is_featured_in_ability": False,
            "safety_notes": "Accessible format posts. Describe images. Use captions.",
            "rules": [
                "Always describe images in text",
                "Respect communication preferences",
                "Deaf culture awareness",
                "No inspiration porn",
                "Share accessibility tips freely"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 34,
            "post_count": 178,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "SSDI / SSI Journey Group",
            "slug": "ssdi-ssi-journey",
            "description": "Navigating Social Security disability benefits together. Share application tips, appeal experiences, denial support, and celebrate approvals. Practical advice from people who've been through it.",
            "pillar": "ability",
            "tags": ["SSDI", "SSI", "benefits", "legal", "advocacy"],
            "primary_disability_type": "all",
            "audience": "both",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": False,
            "safety_notes": "No legal advice. Share experiences only.",
            "rules": [
                "No legal advice - share experiences only",
                "No benefit fraud",
                "Respect privacy about disabilities",
                "Support through denials",
                "Celebrate approvals kindly"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 156,
            "post_count": 892,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Workplace Accommodations & Rights",
            "slug": "workplace-accommodations-rights",
            "description": "Discussing workplace disability rights, reasonable accommodations, disclosure, discrimination, and career advancement. Know your rights. Share what works.",
            "pillar": "ability",
            "tags": ["employment", "ADA", "accommodations", "workplace", "career"],
            "primary_disability_type": "all",
            "audience": "self",
            "privacy_level": "request_to_join",
            "is_featured_in_ability": False,
            "safety_notes": "No identifying employers publicly. General advice only.",
            "rules": [
                "No identifying employers in posts",
                "Know your ADA rights",
                "No legal advice",
                "Share successful accommodation strategies",
                "Respect disclosure choices"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 78,
            "post_count": 312,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "Elder Care at Home",
            "slug": "elder-care-at-home",
            "description": "For family members caring for aging parents or relatives with disabilities at home. Share resources for home modifications, in-home care, medical coordination, and emotional support.",
            "pillar": "ability",
            "tags": ["elder care", "aging", "home care", "family caregiver"],
            "primary_disability_type": "all",
            "audience": "caregiver",
            "privacy_level": "public",
            "is_featured_in_ability": False,
            "safety_notes": "Respect elder dignity. No graphic medical details.",
            "rules": [
                "Respect elder privacy and dignity",
                "No nursing home debates",
                "Share practical resources",
                "Support difficult decisions",
                "Cultural caregiving practices welcomed"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 112,
            "post_count": 534,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": f"circle-{str(uuid4())[:8]}",
            "name": "College & Disability",
            "slug": "college-disability",
            "description": "For disabled college students and recent graduates. Discuss accommodations, accessibility, self-advocacy, campus life, and transitioning to post-grad life.",
            "pillar": "ability",
            "tags": ["college", "education", "young adults", "504", "accommodations"],
            "primary_disability_type": "all",
            "audience": "self",
            "privacy_level": "public",
            "is_featured_in_ability": True,
            "safety_notes": "No identifying schools. Share general strategies.",
            "rules": [
                "No identifying schools publicly",
                "Know your Section 504 rights",
                "Share successful accommodation strategies",
                "Respect varied college experiences",
                "Celebrate academic achievements"
            ],
            "created_by_user_id": "system",
            "created_by_name": "BANIBS Ability Network",
            "member_count": 91,
            "post_count": 467,
            "last_activity_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.circles.insert_many(circles)
    print(f"   ✅ Inserted {len(circles)} support groups\n")
    
    print("="*60)
    print("SEED DATA INITIALIZATION COMPLETE")
    print("="*60 + "\n")
    
    print("📊 Data Summary:")
    print(f"   Ability Resources: {len(resources)}")
    print(f"   Ability Providers: {len(providers)}")
    print(f"   Support Groups: {len(circles)}")
    print("\n✅ Ability Network is ready!\n")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_ability_data())
