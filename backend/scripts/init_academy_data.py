"""
BANIBS Academy - Database Seeding Script
Phase 13.0

Populates initial data for courses, mentors, life skills, history lessons, and opportunities.
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from db.academy import AcademyDB


# ==================== SEED DATA ====================

COURSES_DATA = [
    {
        "title": "Black Wealth 101",
        "description": "Learn the fundamentals of building generational wealth in the Black community. Covers saving strategies, investment basics, and wealth mindset.",
        "level": "beginner",
        "category": "finance",
        "modules": [
            "Introduction to Wealth Building",
            "The Psychology of Money",
            "Saving Strategies That Work",
            "Introduction to Investing",
            "Protecting Your Assets"
        ],
        "estimated_hours": 10
    },
    {
        "title": "Intro to Coding",
        "description": "Start your tech career with this beginner-friendly introduction to programming. Learn HTML, CSS, and JavaScript basics.",
        "level": "beginner",
        "category": "tech",
        "modules": [
            "Setting Up Your Environment",
            "HTML Fundamentals",
            "CSS Styling Basics",
            "JavaScript Introduction",
            "Building Your First Website"
        ],
        "estimated_hours": 15
    },
    {
        "title": "Digital Media Basics",
        "description": "Master the fundamentals of content creation, video editing, and digital storytelling for the modern creator economy.",
        "level": "intermediate",
        "category": "creative",
        "modules": [
            "Content Strategy",
            "Video Production Basics",
            "Photo Editing Essentials",
            "Social Media Presence",
            "Monetization Strategies"
        ],
        "estimated_hours": 12
    },
    {
        "title": "African Kingdoms: A Legacy Study",
        "description": "Explore the rich history of African kingdoms and empires. Understand the power, innovation, and influence that shaped world history.",
        "level": "beginner",
        "category": "history",
        "modules": [
            "The Mali Empire",
            "Ancient Egypt",
            "The Kingdom of Kush",
            "Great Zimbabwe",
            "The Songhai Empire"
        ],
        "estimated_hours": 8
    },
    {
        "title": "Entrepreneurship Fundamentals",
        "description": "Build your Black-owned business from the ground up. Learn business planning, marketing, and operations management.",
        "level": "intermediate",
        "category": "entrepreneurship",
        "modules": [
            "Business Idea Validation",
            "Creating a Business Plan",
            "Funding Your Business",
            "Marketing Strategies",
            "Scaling Your Operations"
        ],
        "estimated_hours": 20
    }
]


MENTORS_DATA = [
    {
        "name": "Kwame Osei",
        "bio": "Senior Software Engineer with 10+ years of experience building scalable web applications. Passionate about mentoring the next generation of Black tech leaders.",
        "expertise": ["Coding", "Web Development", "Career Guidance", "System Design"],
        "country": "Ghana",
        "city": "Accra",
        "contact_methods": {
            "email": "kwame@example.com",
            "linkedin": "linkedin.com/in/kwameosei"
        }
    },
    {
        "name": "Amara Johnson, RN",
        "bio": "Registered Nurse with specialization in emergency medicine. Dedicated to helping aspiring healthcare professionals navigate their careers.",
        "expertise": ["Nursing", "Healthcare", "Patient Care", "Career Development"],
        "country": "United States",
        "city": "Atlanta",
        "contact_methods": {
            "email": "amara.johnson@example.com",
            "instagram": "@amaracares"
        }
    },
    {
        "name": "Marcus Thompson",
        "bio": "Licensed electrician with 15 years in commercial and residential electrical work. Love teaching young people the skilled trades.",
        "expertise": ["Electrical Work", "Skilled Trades", "Apprenticeship Guidance"],
        "country": "Jamaica",
        "city": "Kingston",
        "contact_methods": {
            "email": "marcus.thompson@example.com"
        }
    },
    {
        "name": "Zara Williams",
        "bio": "Award-winning documentary filmmaker and cinematographer. Committed to telling Black stories through powerful visual media.",
        "expertise": ["Filmmaking", "Videography", "Storytelling", "Creative Direction"],
        "country": "United States",
        "city": "Chicago",
        "contact_methods": {
            "email": "zara@example.com",
            "instagram": "@zarafilms",
            "linkedin": "linkedin.com/in/zarawilliams"
        }
    }
]


LIFESKILLS_DATA = [
    {
        "title": "How to Budget",
        "content": """Budgeting is the foundation of financial health. Here's a simple step-by-step approach:

**Step 1: Calculate Your Income**
List all sources of monthly income after taxes. This includes salary, side hustles, and any other regular income.

**Step 2: Track Your Expenses**
For one month, write down every expense. Categorize them into fixed (rent, insurance) and variable (food, entertainment).

**Step 3: The 50/30/20 Rule**
- 50% for needs (housing, utilities, groceries)
- 30% for wants (dining out, hobbies)
- 20% for savings and debt repayment

**Step 4: Use Tools**
Apps like Mint, YNAB, or even a simple spreadsheet can help you stick to your budget.

**Step 5: Review Monthly**
Check your progress each month and adjust as needed. Budgeting is a living process.

Remember: The goal isn't restriction—it's intentional spending that aligns with your values and goals.""",
        "tags": ["financial literacy", "money management", "personal finance"]
    },
    {
        "title": "Conflict Resolution",
        "content": """Handling conflict effectively is a crucial life skill. Here's how to approach disagreements constructively:

**1. Stay Calm**
Take a breath before responding. Emotional reactions often escalate conflict.

**2. Listen Actively**
Truly hear what the other person is saying. Repeat back what you heard to ensure understanding.

**3. Use "I" Statements**
Instead of "You always...", say "I feel... when...". This reduces defensiveness.

**4. Focus on the Issue, Not the Person**
Attack the problem, not the person. Separate behavior from identity.

**5. Find Common Ground**
Look for areas of agreement. Build from there toward a solution.

**6. Seek Win-Win Solutions**
Compromise when possible. Aim for solutions where both parties feel heard and respected.

**7. Know When to Walk Away**
If emotions are too high, take a break and return to the conversation later.

Conflict doesn't have to damage relationships. With the right approach, it can actually strengthen understanding and trust.""",
        "tags": ["communication", "relationships", "emotional intelligence"]
    },
    {
        "title": "Time Management",
        "content": """Master your time, master your life. Here are proven strategies to make the most of your 24 hours:

**Priority Matrix (Eisenhower Box)**
Categorize tasks into four quadrants:
- Urgent & Important: Do first
- Important, Not Urgent: Schedule
- Urgent, Not Important: Delegate
- Neither: Eliminate

**Time Blocking**
Assign specific blocks of time to specific tasks. Treat these like appointments you can't miss.

**The Two-Minute Rule**
If something takes less than two minutes, do it immediately. Don't add it to your list.

**Eat the Frog**
Do your hardest or most important task first thing in the morning when your energy is highest.

**Batch Similar Tasks**
Group similar activities together (emails, phone calls, errands) to minimize context switching.

**Say No**
Protect your time by declining commitments that don't align with your priorities.

**Review Weekly**
Every Sunday, review the past week and plan the next. Adjust your approach as needed.

Time is your most valuable asset. Use it wisely.""",
        "tags": ["productivity", "organization", "goal setting"]
    },
    {
        "title": "Reading People",
        "content": """Understanding nonverbal communication and emotional cues can transform your relationships and professional life:

**Body Language Basics**
- Crossed arms: Defensive or closed off
- Leaning in: Interest and engagement
- Eye contact: Confidence and honesty (cultural variations apply)
- Fidgeting: Nervousness or impatience

**Facial Expressions**
The face often reveals true emotions, even when words don't. Watch for micro-expressions—brief flashes of genuine feeling.

**Tone of Voice**
It's not just what people say, but how they say it. Listen for pitch, pace, and volume changes.

**Consistency Check**
Do words match body language? Inconsistency often signals dishonesty or inner conflict.

**Context Matters**
Always consider the situation. A crossed-arms posture in a cold room means something different than in a heated argument.

**Listen for What's Unsaid**
Sometimes what people don't say is more important than what they do say.

**Trust Your Intuition**
Your gut feelings are often picking up on subtle cues your conscious mind hasn't processed.

Practice these skills daily. Observing people becomes easier with time and attention.""",
        "tags": ["communication", "emotional intelligence", "social skills"]
    },
    {
        "title": "Public Speaking",
        "content": """Public speaking is one of the most valuable skills you can develop. Here's how to become a confident speaker:

**Preparation**
- Know your material inside out
- Practice out loud multiple times
- Anticipate questions and prepare answers
- Arrive early to familiarize yourself with the space

**Structure Your Talk**
1. Opening: Hook the audience (story, question, or surprising fact)
2. Body: Three main points (maximum)
3. Closing: Call to action or memorable takeaway

**Managing Nerves**
- Deep breathing before you speak
- Visualize success
- Remember: The audience wants you to succeed
- Channel nervous energy into enthusiasm

**Delivery Tips**
- Make eye contact with individuals
- Use hand gestures naturally
- Vary your pace and tone
- Pause for emphasis
- Move with purpose (don't pace aimlessly)

**Handling Mistakes**
- If you stumble, pause and continue—most people won't notice
- If you forget something, move on—you can circle back if needed
- Use humor to recover from obvious mistakes

**Practice Venues**
- Toastmasters clubs
- Work presentations
- Community events
- Video yourself to identify areas for improvement

The best speakers aren't born—they're made through practice and persistence.""",
        "tags": ["communication", "confidence", "career development"]
    }
]


HISTORY_DATA = [
    {
        "title": "The Mali Empire",
        "theme": "african empires",
        "content": """The Mali Empire (1235-1600) was one of the wealthiest and most powerful civilizations in world history.

**Rise to Power**
Founded by Sundiata Keita after defeating the Sosso king Sumanguru, Mali grew to control vast territories across West Africa, including modern-day Mali, Senegal, Gambia, Guinea, Niger, Nigeria, Chad, Mauritania, and Burkina Faso.

**Wealth and Trade**
Mali's wealth came primarily from gold and salt trade. At its peak, Mali controlled more than half of the world's gold supply. The empire sat at the crossroads of major trans-Saharan trade routes, connecting sub-Saharan Africa with North Africa and beyond.

**Mansa Musa**
Emperor Mansa Musa (1312-1337) is often called the wealthiest person in history. His famous pilgrimage to Mecca in 1324 included a caravan of 60,000 people and so much gold that he caused inflation in the cities he passed through.

**Education and Culture**
The city of Timbuktu became a world center of learning. The Sankore University housed hundreds of thousands of manuscripts on subjects ranging from astronomy to medicine. Scholars from across the Islamic world came to study there.

**Legacy**
The Mali Empire demonstrated African political sophistication, economic power, and intellectual achievement long before European colonization. Its legacy reminds us that African civilizations were building universities while Europe was in the Dark Ages.""",
        "media_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Mali_Empire_map.PNG/800px-Mali_Empire_map.PNG"
    },
    {
        "title": "Black Wall Street",
        "theme": "economic empowerment",
        "content": """The Greenwood District of Tulsa, Oklahoma, known as "Black Wall Street," was the wealthiest Black community in America before its destruction in 1921.

**Building Black Wall Street**
After the Civil War, many Black people moved to Oklahoma seeking opportunity. O.W. Gurley, a wealthy Black landowner, purchased 40 acres and created a Black-only township. By 1921, Greenwood had over 10,000 residents and more than 600 Black-owned businesses.

**Economic Model**
The secret to Greenwood's success was economic self-sufficiency. Money circulated within the community 36 to 100 times before leaving. Businesses included banks, hotels, restaurants, movie theaters, luxury shops, and professional services. Residents created their own economy that didn't depend on white patronage.

**The Tulsa Race Massacre**
On May 31-June 1, 1921, a white mob attacked Greenwood after a false accusation against a Black teenager. Over two days, they burned 35 blocks to the ground, killed an estimated 300 people, and left 10,000 homeless. It was one of the worst episodes of racial violence in American history.

**Resilience**
Despite the devastation, Greenwood residents rebuilt. By the 1940s, the district was thriving again. However, urban renewal projects in the 1960s-70s further damaged the community.

**Lessons for Today**
Black Wall Street teaches us the power of:
1. Economic cooperation within our community
2. Black-owned businesses supporting each other
3. Building institutions that serve our needs
4. The importance of protecting what we build

Today's Black entrepreneurs are building a new Black Wall Street—digital, distributed, and determined.""",
        "media_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Greenwood_Avenue_in_Tulsa%2C_Oklahoma_in_1921.jpg/800px-Greenwood_Avenue_in_Tulsa%2C_Oklahoma_in_1921.jpg"
    },
    {
        "title": "Ancient Carthage",
        "theme": "african empires",
        "content": """Carthage was a powerful North African civilization (814 BC - 146 BC) that rivaled Rome for control of the Mediterranean.

**Foundation**
Founded by Phoenician settlers from Tyre (modern Lebanon), Carthage grew into an independent power on the coast of Tunisia. Its strategic location made it a hub of Mediterranean trade.

**Economic Power**
Carthage controlled extensive trade networks across the Mediterranean and Atlantic coast of Africa. They traded in metals, glass, purple dye, ivory, textiles, and agricultural products. Their merchant fleet was unrivaled.

**Military Might**
Carthage's most famous general, Hannibal Barca, is considered one of history's greatest military commanders. During the Second Punic War (218-201 BC), he crossed the Alps with elephants and defeated Rome multiple times.

**Culture and Innovation**
Carthaginians were master shipbuilders and navigators. They invented new ship designs and navigation techniques. The city featured advanced urban planning, harbors, and architecture.

**Fall**
After three Punic Wars with Rome, Carthage was finally destroyed in 146 BC. Rome burned the city for 17 days, sold survivors into slavery, and allegedly salted the earth so nothing would grow.

**Legacy**
Carthage proves that African civilizations were:
- Global trading powers
- Military rivals to the greatest empires
- Centers of innovation and culture
- Political and economic leaders of the ancient world

The Carthaginian story reminds us that African power extended far beyond the continent."""
    },
    {
        "title": "The Harlem Renaissance",
        "theme": "cultural movements",
        "content": """The Harlem Renaissance (1920s-1930s) was a Black cultural, artistic, and intellectual explosion centered in Harlem, New York.

**The Great Migration Context**
Millions of Black Americans moved from the rural South to Northern cities during the Great Migration. Harlem became a cultural capital—a place where Black people could express themselves freely and build new institutions.

**Key Figures**
- **Langston Hughes**: Poet who captured Black life and struggle
- **Zora Neale Hurston**: Anthropologist and novelist
- **Duke Ellington**: Jazz composer and bandleader
- **Louis Armstrong**: Jazz musician who transformed American music
- **Aaron Douglas**: Visual artist known as "Father of Black American Art"
- **W.E.B. Du Bois**: Intellectual and civil rights leader

**Literary Movement**
Black writers produced poetry, novels, and essays that celebrated Black life and challenged racism. Publications like *The Crisis* and *Opportunity* showcased Black talent.

**Music Revolution**
Jazz and blues moved from the margins to the mainstream. Black musicians created entirely new forms of American music that influenced the world.

**Visual Arts**
Artists created works celebrating Black beauty, African heritage, and modern Black life. They rejected white standards of beauty and created their own aesthetic.

**Political Significance**
The Harlem Renaissance wasn't just art—it was political. It asserted Black humanity, intelligence, and cultural contributions at a time when white America denied all three.

**Legacy**
The Harlem Renaissance:
- Proved Black intellectual and artistic excellence
- Created a cultural foundation for the Civil Rights Movement
- Influenced global culture (jazz went worldwide)
- Showed that Black people could define their own narrative

Every Black artist, writer, and musician today stands on the shoulders of the Harlem Renaissance.""",
        "media_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Portrait_of_Langston_Hughes.jpg/440px-Portrait_of_Langston_Hughes.jpg"
    },
    {
        "title": "African Diaspora Migration Timeline",
        "theme": "diaspora history",
        "content": """Understanding the movement of African people across history helps us see our global connections.

**Pre-Colonial Era (Before 1500)**
- African kingdoms traded with Asia, Europe, and the Middle East
- African scholars and travelers moved freely across continents
- Islamic Golden Age included many African Muslim scholars

**Transatlantic Slave Trade (1500-1800s)**
- Approximately 12-15 million Africans were forcibly taken to the Americas
- Created African diaspora communities in North America, Caribbean, South America
- Stripped of language, culture, and names—but resilience preserved elements

**Post-Slavery Migration (1800s-early 1900s)**
- Freed people moved to Liberia (founded 1847)
- Caribbean people migrated for work (Panama Canal, etc.)
- Early waves of voluntary migration to Europe

**Great Migration (1916-1970)**
- 6 million Black Americans moved from rural South to urban North
- Created vibrant Black communities in Chicago, Detroit, New York, Los Angeles
- Transformed American culture and politics

**Caribbean Migration (1950s-1970s)**
- Large-scale migration from Jamaica, Trinidad, Barbados to UK
- Caribbean people also moved to US and Canada
- Brought cultural influences that shaped host countries

**African Migration (1970s-Present)**
- Students and professionals from Africa migrating to US, Europe, China
- Creation of transnational African communities
- Brain drain challenges for African countries

**Return Movements**
- "Back to Africa" movements (Marcus Garvey, Rastafarianism)
- Modern returnees to Ghana, Nigeria, Kenya
- Diaspora investment in African economies

**Current Diaspora**
Today, over 200 million people of African descent live outside Africa. We are:
- Building bridges between continents
- Creating cultural hybrids
- Maintaining connections to heritage
- Contributing to global economies and culture

**The Big Picture**
We are part of a global Black family. Migration—whether forced or voluntary—has created a worldwide network of African-descended people. Understanding this history helps us recognize our shared identity and collective power."""
    }
]


OPPORTUNITIES_DATA = [
    {
        "title": "$5,000 STEM Scholarship",
        "description": "Annual scholarship for Black students pursuing degrees in Science, Technology, Engineering, or Mathematics. Open to high school seniors and undergraduate students.",
        "type": "scholarship",
        "deadline": datetime.utcnow() + timedelta(days=180),
        "organization": "BANIBS Foundation",
        "link": "https://banibs.com/stem-scholarship"
    },
    {
        "title": "Youth Entrepreneurship Grant",
        "description": "Grant program providing $2,500 to young Black entrepreneurs (ages 18-25) to start or grow their businesses. Includes mentorship component.",
        "type": "grant",
        "deadline": datetime.utcnow() + timedelta(days=90),
        "organization": "Black Business Initiative",
        "link": "https://example.com/youth-grant"
    },
    {
        "title": "Paid Summer Internship - Tech",
        "description": "10-week paid internship program for Black students interested in software engineering. Includes housing stipend and mentorship from senior engineers.",
        "type": "internship",
        "deadline": datetime.utcnow() + timedelta(days=60),
        "organization": "Code for Change",
        "link": "https://example.com/tech-internship"
    },
    {
        "title": "Global Learning Fellowship",
        "description": "Fully-funded fellowship to study abroad in Ghana, South Africa, or Brazil. Includes tuition, housing, and travel costs for one semester.",
        "type": "scholarship",
        "deadline": datetime.utcnow() + timedelta(days=120),
        "organization": "Diaspora Education Network",
        "link": "https://example.com/global-fellowship"
    }
]


# ==================== SEEDING FUNCTIONS ====================

async def seed_courses(academy_db: AcademyDB):
    """Seed courses"""
    print("📚 Seeding courses...")
    
    for course_data in COURSES_DATA:
        await academy_db.create_course(course_data)
        print(f"  ✓ Created course: {course_data['title']}")


async def seed_mentors(academy_db: AcademyDB):
    """Seed mentors"""
    print("\n👥 Seeding mentors...")
    
    for mentor_data in MENTORS_DATA:
        await academy_db.create_mentor(mentor_data)
        print(f"  ✓ Created mentor: {mentor_data['name']}")


async def seed_lifeskills(academy_db: AcademyDB):
    """Seed life skills"""
    print("\n💡 Seeding life skills...")
    
    for skill_data in LIFESKILLS_DATA:
        await academy_db.create_lifeskill(skill_data)
        print(f"  ✓ Created life skill: {skill_data['title']}")


async def seed_history(academy_db: AcademyDB):
    """Seed history lessons"""
    print("\n📖 Seeding history lessons...")
    
    for lesson_data in HISTORY_DATA:
        await academy_db.create_history_lesson(lesson_data)
        print(f"  ✓ Created history lesson: {lesson_data['title']}")


async def seed_opportunities(academy_db: AcademyDB):
    """Seed opportunities"""
    print("\n🎓 Seeding opportunities...")
    
    for opp_data in OPPORTUNITIES_DATA:
        await academy_db.create_opportunity(opp_data)
        print(f"  ✓ Created opportunity: {opp_data['title']}")


# ==================== MAIN ====================

async def main():
    """Main seeding function"""
    # Get MongoDB URL from environment
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")
    
    # Connect to MongoDB
    print(f"Connecting to MongoDB at {mongo_url}...")
    print(f"Using database: {db_name}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Initialize AcademyDB
    academy_db = AcademyDB(db)
    
    # Check if data already exists
    existing_courses = await academy_db.get_courses()
    if existing_courses:
        print("\n⚠️  Academy data already exists!")
        response = input("Do you want to re-seed? This will duplicate data. (yes/no): ")
        if response.lower() != "yes":
            print("Seeding cancelled.")
            return
    
    print("\n" + "="*60)
    print("BANIBS ACADEMY - DATA SEEDING")
    print("="*60)
    
    try:
        # Seed all collections
        await seed_courses(academy_db)
        await seed_mentors(academy_db)
        await seed_lifeskills(academy_db)
        await seed_history(academy_db)
        await seed_opportunities(academy_db)
        
        print("\n" + "="*60)
        print("✅ SEEDING COMPLETE!")
        print("="*60)
        print(f"\nSeeded:")
        print(f"  • {len(COURSES_DATA)} courses")
        print(f"  • {len(MENTORS_DATA)} mentors")
        print(f"  • {len(LIFESKILLS_DATA)} life skills")
        print(f"  • {len(HISTORY_DATA)} history lessons")
        print(f"  • {len(OPPORTUNITIES_DATA)} opportunities")
        print("\nBANIBS Academy is ready! 📚")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
