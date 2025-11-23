"""
BANIBS Community Life Hub - Seed Data
Phase 11.6.0

Seeds initial data for all 4 pillars:
- Health & Insurance
- Fitness & Wellness
- Food & Culture
- Alternative Schooling
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime
from uuid import uuid4

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient


async def seed_community_data():
    print("=" * 60)
    print("BANIBS COMMUNITY LIFE HUB - SEED DATA INITIALIZATION")
    print("=" * 60)
    
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # ==================== HEALTH & INSURANCE ====================
    
    print("\n🏥 Seeding Health & Insurance Data...")
    
    health_resources = [
        {
            "id": f"health-{str(uuid4())[:8]}",
            "title": "Understanding Your Health Insurance Deductible",
            "slug": "understanding-deductible",
            "category": "insurance_basics",
            "level": "basic",
            "body_md": """# What is a Deductible?

A deductible is the amount you pay out-of-pocket for healthcare services before your insurance starts to pay.

## Key Points:
- Annual reset: Deductibles typically reset each calendar year
- Does not include premiums: Your monthly premium payment is separate
- Varies by plan: High-deductible plans have lower premiums but higher deductibles

## Example:
If your deductible is $1,500, you'll pay the first $1,500 of covered services yourself. After that, your insurance begins to pay its share.

## Tips:
- Track your spending throughout the year
- Some preventive care is covered before you meet your deductible
- Ask about payment plans if you can't afford the full amount""",
            "summary": "Learn what a health insurance deductible is and how it works",
            "tags": ["insurance", "basics", "deductible", "healthcare_costs"],
            "region_focus": [],
            "is_featured": True,
            "view_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"health-{str(uuid4())[:8]}",
            "title": "Managing High Blood Pressure",
            "slug": "managing-hypertension",
            "category": "chronic_disease",
            "level": "intermediate",
            "body_md": """# Managing High Blood Pressure (Hypertension)

High blood pressure affects millions of Black Americans. Here's how to manage it effectively.

## What is Hypertension?
Blood pressure readings of 130/80 mmHg or higher are considered high.

## Lifestyle Changes:
- **Diet**: Reduce sodium, increase potassium-rich foods
- **Exercise**: 30 minutes of moderate activity most days
- **Weight**: Losing even 5-10 pounds can help
- **Stress**: Practice relaxation techniques

## Medication:
Work with your doctor to find the right medication. Common types include:
- ACE inhibitors
- Diuretics (water pills)
- Beta blockers

## Cultural Considerations:
Traditional soul food can be adapted for heart health without losing flavor. See our Food & Culture section for healthier recipe versions.

## When to See a Doctor:
- Regular checkups every 3-6 months
- If readings are consistently above 140/90
- If you experience chest pain, shortness of breath, or severe headaches""",
            "summary": "Comprehensive guide to managing high blood pressure with lifestyle and medical interventions",
            "tags": ["hypertension", "chronic_disease", "prevention", "heart_health"],
            "region_focus": [],
            "is_featured": True,
            "view_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"health-{str(uuid4())[:8]}",
            "title": "Finding Low-Cost Mental Health Support",
            "slug": "affordable-mental-health",
            "category": "mental_health",
            "level": "basic",
            "body_md": """# Finding Affordable Mental Health Support

Mental health care is essential, but it doesn't have to break the bank.

## Free and Low-Cost Options:
1. **Community Health Centers**: Sliding scale fees based on income
2. **NAMI (National Alliance on Mental Illness)**: Free support groups
3. **Crisis Text Line**: Text HOME to 741741 for free 24/7 support
4. **Open Path Collective**: Therapy sessions for $30-$80
5. **University Clinics**: Supervised therapy at reduced rates

## Insurance Coverage:
- Most insurance plans now cover mental health
- Use your insurance's provider directory
- Ask about telehealth options

## Black Therapist Directories:
- Therapy for Black Girls
- Inclusive Therapists
- Black Mental Health Alliance

## What to Ask:
- Do you offer a sliding scale?
- What insurance do you accept?
- Do you offer telehealth?
- What is your experience working with Black clients?""",
            "summary": "Resources for finding affordable, culturally competent mental health support",
            "tags": ["mental_health", "therapy", "affordable", "support"],
            "region_focus": [],
            "is_featured": False,
            "view_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await db.health_resources.insert_many(health_resources)
    print(f"   ✅ Inserted {len(health_resources)} health resources")
    
    health_providers = [
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "Community Health Center of Excellence",
            "type": "clinic",
            "is_black_owned": True,
            "cultural_competence_notes": "Predominantly Black staff, culturally sensitive care",
            "address": "123 Main St",
            "city": "Atlanta",
            "state": "GA",
            "zip_code": "30303",
            "country": "USA",
            "region": "Southeast",
            "telehealth": True,
            "insurances_accepted": ["Medicaid", "Medicare", "Blue Cross", "Aetna"],
            "typical_price_range": "$",
            "contact_phone": "(404) 555-0100",
            "contact_website": "https://example-chc.org",
            "specialties": ["primary_care", "pediatrics", "mental_health"],
            "languages": ["English", "Spanish"],
            "tags": ["black_owned", "sliding_scale", "walk_ins"],
            "is_verified": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"provider-{str(uuid4())[:8]}",
            "name": "Dr. Marcus Johnson - Family Practice",
            "type": "primary_care",
            "is_black_owned": True,
            "address": "456 Oak Ave",
            "city": "Chicago",
            "state": "IL",
            "zip_code": "60614",
            "country": "USA",
            "region": "Midwest",
            "telehealth": True,
            "insurances_accepted": ["Most major insurances"],
            "typical_price_range": "$$",
            "contact_phone": "(312) 555-0200",
            "specialties": ["primary_care", "chronic_disease_management"],
            "languages": ["English"],
            "tags": ["accepting_new_patients", "telehealth"],
            "is_verified": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await db.health_providers.insert_many(health_providers)
    print(f"   ✅ Inserted {len(health_providers)} health providers")
    
    # ==================== FITNESS & WELLNESS ====================
    
    print("\n💪 Seeding Fitness & Wellness Data...")
    
    fitness_programs = [
        {
            "id": f"fitness-{str(uuid4())[:8]}",
            "title": "Beginner's Walking Program for Heart Health",
            "description": "A gentle 8-week walking program designed for people managing heart conditions or getting back into fitness.",
            "level": "beginner",
            "focus": ["cardio", "heart_health", "weight_loss"],
            "delivery": "self_paced",
            "duration_weeks": 8,
            "sessions_per_week": 5,
            "session_duration_minutes": 20,
            "equipment_needed": ["comfortable_shoes"],
            "chronic_friendly": ["hypertension", "diabetes", "heart_disease"],
            "intensity": "low",
            "cost_range": "free",
            "tags": ["beginner", "walking", "heart_friendly", "low_impact"],
            "is_featured": True,
            "participants_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"fitness-{str(uuid4())[:8]}",
            "title": "Chair Yoga for Seniors and Limited Mobility",
            "description": "Gentle yoga practice done from a chair, perfect for seniors or anyone with mobility challenges.",
            "level": "senior",
            "focus": ["flexibility", "mobility", "balance"],
            "delivery": "video",
            "duration_weeks": 4,
            "sessions_per_week": 3,
            "session_duration_minutes": 30,
            "equipment_needed": ["sturdy_chair"],
            "chronic_friendly": ["arthritis", "joint_pain", "mobility_issues"],
            "intensity": "low",
            "cost_range": "free",
            "video_url": "https://example.com/chair-yoga",
            "tags": ["senior", "chair_yoga", "gentle", "adaptive"],
            "is_featured": True,
            "participants_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"fitness-{str(uuid4())[:8]}",
            "title": "Strength Training for Women 40+",
            "description": "Build strength, bone density, and confidence with this beginner-friendly strength program.",
            "level": "intermediate",
            "focus": ["strength", "bone_health", "weight_loss"],
            "delivery": "live_online",
            "duration_weeks": 12,
            "sessions_per_week": 3,
            "session_duration_minutes": 45,
            "equipment_needed": ["dumbbells", "resistance_bands"],
            "chronic_friendly": ["osteoporosis"],
            "intensity": "moderate",
            "cost_range": "$$",
            "tags": ["strength", "women", "weights", "bone_health"],
            "is_featured": False,
            "participants_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await db.fitness_programs.insert_many(fitness_programs)
    print(f"   ✅ Inserted {len(fitness_programs)} fitness programs")
    
    # ==================== FOOD & CULTURE ====================
    
    print("\n🍲 Seeding Food & Culture Data...")
    
    recipes = [
        {
            "id": f"recipe-{str(uuid4())[:8]}",
            "title": "Classic Southern Collard Greens",
            "slug": "southern-collard-greens",
            "origin_region": "Deep South",
            "category": "side",
            "difficulty": "easy",
            "traditional_instructions_md": """# Traditional Southern Collard Greens

## Ingredients:
- 2 lbs fresh collard greens, cleaned and chopped
- 1 lb smoked ham hocks or turkey necks
- 1 large onion, diced
- 4 cloves garlic, minced
- 2 tablespoons bacon fat or vegetable oil
- 4 cups chicken broth
- 2 tablespoons apple cider vinegar
- 1 tablespoon sugar
- Salt, pepper, and red pepper flakes to taste

## Instructions:
1. In a large pot, heat bacon fat over medium heat
2. Sauté onion and garlic until softened
3. Add ham hocks and brown slightly
4. Add broth, vinegar, sugar, and seasonings
5. Bring to a boil, then reduce to simmer for 1 hour
6. Add collard greens in batches, stirring as they wilt
7. Simmer for 1-2 hours until tender
8. Adjust seasonings and serve with potlikker (cooking liquid)""",
            "healthier_version_md": """# Healthier Southern Collard Greens

## Ingredients:
- 2 lbs fresh collard greens, cleaned and chopped
- 1 lb smoked turkey (leaner than ham hocks)
- 1 large onion, diced
- 4 cloves garlic, minced
- 1 tablespoon olive oil (less fat)
- 4 cups low-sodium chicken broth
- 2 tablespoons apple cider vinegar
- 1 teaspoon honey (less sugar)
- Salt-free seasoning, black pepper, and red pepper flakes to taste

## Instructions:
Same as traditional, but:
- Use olive oil instead of bacon fat (heart-healthy fat)
- Choose low-sodium broth (reduce salt intake)
- Reduce sugar content
- Use smoked turkey for flavor with less fat
- Season with salt-free blends

## Health Benefits:
- Lower sodium by 40%
- Reduced saturated fat
- Same great flavor!
- Rich in vitamins A, C, and K""",
            "ingredients_traditional": [
                "collard greens", "ham hocks", "onion", "garlic",
                "bacon fat", "chicken broth", "vinegar", "sugar"
            ],
            "ingredients_healthier": [
                "collard greens", "smoked turkey", "onion", "garlic",
                "olive oil", "low-sodium broth", "vinegar", "honey"
            ],
            "cook_time_minutes": 120,
            "prep_time_minutes": 20,
            "servings": 8,
            "nutrition_level": "medium",
            "dietary_notes": ["high_sodium_traditional", "heart_healthy_version"],
            "is_family_submitted": False,
            "is_approved": True,
            "tags": ["southern", "vegetables", "sides", "soul_food"],
            "is_featured": True,
            "view_count": 0,
            "saved_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"recipe-{str(uuid4())[:8]}",
            "title": "Caribbean Jerk Chicken",
            "slug": "caribbean-jerk-chicken",
            "origin_region": "Caribbean",
            "category": "main",
            "difficulty": "moderate",
            "traditional_instructions_md": """# Caribbean Jerk Chicken

## Marinade Ingredients:
- 6 scallions
- 2 Scotch bonnet peppers
- 4 cloves garlic
- 2 tablespoons fresh thyme
- 2 tablespoons allspice
- 1 tablespoon black pepper
- 1 tablespoon cinnamon
- 1/4 cup soy sauce
- 1/4 cup vegetable oil
- 2 tablespoons brown sugar
- Juice of 2 limes

## Instructions:
1. Blend all marinade ingredients until smooth
2. Score chicken pieces and coat with marinade
3. Marinate for 4-24 hours
4. Grill over medium-high heat until cooked through
5. Serve with rice and peas""",
            "cook_time_minutes": 45,
            "prep_time_minutes": 30,
            "servings": 6,
            "nutrition_level": "medium",
            "dietary_notes": ["spicy", "high_sodium"],
            "is_family_submitted": False,
            "is_approved": True,
            "tags": ["caribbean", "chicken", "grilling", "spicy"],
            "is_featured": True,
            "view_count": 0,
            "saved_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"recipe-{str(uuid4())[:8]}",
            "title": "Classic Sweet Potato Pie",
            "slug": "sweet-potato-pie",
            "origin_region": "Deep South",
            "category": "dessert",
            "difficulty": "moderate",
            "traditional_instructions_md": """# Classic Sweet Potato Pie

## Ingredients:
- 2 cups mashed sweet potatoes
- 1 cup sugar
- 1/2 cup melted butter
- 2 eggs
- 1 can evaporated milk
- 1 teaspoon vanilla
- 1/2 teaspoon nutmeg
- 1/2 teaspoon cinnamon
- 1 unbaked pie crust

## Instructions:
1. Preheat oven to 350°F
2. Mix all ingredients until smooth
3. Pour into unbaked pie crust
4. Bake for 55-60 minutes until set
5. Cool completely before serving""",
            "cook_time_minutes": 60,
            "prep_time_minutes": 20,
            "servings": 8,
            "nutrition_level": "heavy",
            "dietary_notes": ["high_sugar", "dessert"],
            "is_family_submitted": False,
            "is_approved": True,
            "tags": ["southern", "dessert", "holiday", "sweet_potato"],
            "is_featured": False,
            "view_count": 0,
            "saved_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await db.recipes.insert_many(recipes)
    print(f"   ✅ Inserted {len(recipes)} recipes")
    
    # ==================== ALTERNATIVE SCHOOLING ====================
    
    print("\n📚 Seeding Alternative Schooling Data...")
    
    school_resources = [
        {
            "id": f"school-{str(uuid4())[:8]}",
            "title": "Black History Curriculum for K-5",
            "slug": "black-history-k5-curriculum",
            "type": "curriculum",
            "subject": ["black_history", "social_studies"],
            "age_range": "K-5",
            "format": "online",
            "description": "Comprehensive Black history curriculum designed for elementary students. Includes lesson plans, activities, and assessments covering ancient African civilizations through modern civil rights movements.",
            "provider_name": "BANIBS Academy",
            "contact_website": "https://banibs.com/academy",
            "cost_range": "free",
            "is_accredited": True,
            "grade_levels": ["K", "1", "2", "3", "4", "5"],
            "learning_style": ["visual", "hands_on", "reading"],
            "tags": ["black_history", "elementary", "comprehensive", "free"],
            "is_verified": True,
            "is_featured": True,
            "is_approved": True,  # Phase 11.6.4
            "is_user_submitted": False,  # Phase 11.6.4
            "total_reviews": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"school-{str(uuid4())[:8]}",
            "title": "Financial Literacy for Teens",
            "slug": "financial-literacy-teens",
            "type": "curriculum",
            "subject": ["financial_literacy", "math"],
            "age_range": "9-12",
            "format": "hybrid",
            "description": "Practical financial education covering budgeting, saving, investing, credit, and entrepreneurship. Culturally relevant examples and real-world applications.",
            "provider_name": "BANIBS Academy",
            "contact_website": "https://banibs.com/academy",
            "cost_range": "$",
            "is_accredited": False,
            "grade_levels": ["9", "10", "11", "12"],
            "learning_style": ["project_based", "hands_on"],
            "tags": ["finance", "teens", "life_skills", "entrepreneurship"],
            "is_verified": True,
            "is_featured": True,
            "is_approved": True,  # Phase 11.6.4
            "is_user_submitted": False,  # Phase 11.6.4
            "total_reviews": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": f"school-{str(uuid4())[:8]}",
            "title": "Atlanta Homeschool Co-op",
            "slug": "atlanta-homeschool-coop",
            "type": "co_op",
            "subject": ["all_subjects"],
            "age_range": "K-12",
            "format": "in_person",
            "description": "Black-centered homeschool cooperative meeting twice weekly. Offers group classes, field trips, and socialization opportunities for homeschooled children.",
            "region": "Southeast",
            "provider_name": "Atlanta Black Homeschool Network",
            "contact_email": "info@atlantahomeschool.org",
            "cost_range": "$$",
            "is_accredited": False,
            "grade_levels": ["All"],
            "learning_style": ["collaborative", "hands_on"],
            "tags": ["co_op", "atlanta", "community", "in_person"],
            "is_verified": True,
            "is_featured": False,
            "is_approved": True,  # Phase 11.6.4
            "is_user_submitted": False,  # Phase 11.6.4
            "total_reviews": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    await db.school_resources.insert_many(school_resources)
    print(f"   ✅ Inserted {len(school_resources)} school resources")
    
    # ==================== SUMMARY ====================
    
    print("\n" + "=" * 60)
    print("SEED DATA INITIALIZATION COMPLETE")
    print("=" * 60)
    print(f"\n📊 Data Summary:")
    print(f"   Health Resources: {len(health_resources)}")
    print(f"   Health Providers: {len(health_providers)}")
    print(f"   Fitness Programs: {len(fitness_programs)}")
    print(f"   Recipes: {len(recipes)}")
    print(f"   School Resources: {len(school_resources)}")
    print("\n✅ Community Life Hub is ready!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_community_data())
