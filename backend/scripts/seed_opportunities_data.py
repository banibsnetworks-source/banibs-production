"""
Phase 7.1 - Seed Data for BANIBS Opportunities Exchange

Creates realistic test data for:
- Employer profiles (verified/unverified, with/without DEI statements)
- Recruiter profiles (verified/unverified)
- Job listings (various industries, locations, types)
- Candidate profiles
- Job applications

Run with: python -m scripts.seed_opportunities_data
"""

import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from db.opportunities.employer_profiles import create_employer_profile, verify_employer
from db.opportunities.recruiter_profiles import create_recruiter_profile, verify_recruiter
from db.opportunities.job_listings import create_job_listing, update_job_listing
from db.opportunities.candidate_profiles import create_candidate_profile, add_saved_job
from db.opportunities.application_records import create_application
from db.unified_users import create_user, add_role


# Sample data
EMPLOYERS = [
    {
        "organization_name": "TechForward Inc.",
        "contact_email": "hr@techforward.com",
        "website_url": "https://techforward.com",
        "sector": "Technology",
        "organization_size": "51-200",
        "headquarters_location": "Atlanta, GA",
        "description": "We build innovative software solutions for the education sector, focusing on accessibility and inclusion.",
        "dei_statement": "TechForward is committed to building a diverse team that reflects the communities we serve. We actively recruit from HBCUs and support Black tech talent through mentorship programs.",
        "verified": True
    },
    {
        "organization_name": "Community Health Partners",
        "contact_email": "careers@chp-health.org",
        "website_url": "https://chp-health.org",
        "sector": "Healthcare",
        "organization_size": "201-500",
        "headquarters_location": "Detroit, MI",
        "description": "A nonprofit healthcare organization serving underserved communities across the Midwest.",
        "dei_statement": "We believe healthcare is a human right. Our team reflects the diversity of our patients, with a majority-minority workforce and leadership team.",
        "verified": True
    },
    {
        "organization_name": "Black Business Accelerator",
        "contact_email": "team@bba.org",
        "website_url": "https://blackbusinessaccelerator.org",
        "sector": "Nonprofit",
        "organization_size": "11-50",
        "headquarters_location": "Chicago, IL",
        "description": "Supporting Black entrepreneurs through funding, mentorship, and community.",
        "dei_statement": "Our mission is to close the wealth gap by empowering Black-owned businesses. 100% of our leadership and 95% of our team identify as Black or African American.",
        "verified": True
    },
    {
        "organization_name": "Emerald Financial Services",
        "contact_email": "hr@emeraldfs.com",
        "website_url": "https://emeraldfinancial.com",
        "sector": "Finance",
        "organization_size": "500+",
        "headquarters_location": "New York, NY",
        "description": "A leading financial services firm specializing in community banking and microfinance.",
        "dei_statement": "We are proud to be a certified minority-owned business. Our commitment to equity extends from our boardroom to our client relationships.",
        "verified": True
    },
    {
        "organization_name": "Urban Education Network",
        "contact_email": "jobs@urbaned.org",
        "website_url": "https://urbaneducationnetwork.org",
        "sector": "Education",
        "organization_size": "51-200",
        "headquarters_location": "Oakland, CA",
        "description": "Charter school network serving K-12 students in urban communities.",
        "dei_statement": None,  # No DEI statement
        "verified": True
    },
    {
        "organization_name": "NextGen Marketing",
        "contact_email": "hello@nextgenmarketing.co",
        "website_url": "https://nextgenmarketing.co",
        "sector": "Technology",
        "organization_size": "11-50",
        "headquarters_location": "Remote",
        "description": "Digital marketing agency helping small businesses grow their online presence.",
        "dei_statement": None,
        "verified": False  # Unverified
    },
    {
        "organization_name": "Green City Construction",
        "contact_email": "hr@greencityconstruction.com",
        "website_url": "https://greencity-const.com",
        "sector": "Construction",
        "organization_size": "51-200",
        "headquarters_location": "Houston, TX",
        "description": "Sustainable construction and renovation for commercial and residential properties.",
        "dei_statement": "As a Black-owned construction firm, we prioritize hiring from local communities and supporting workforce development programs.",
        "verified": True
    },
    {
        "organization_name": "Heritage Media Group",
        "contact_email": "careers@heritagemedia.com",
        "website_url": "https://heritagemediagroup.com",
        "sector": "Media",
        "organization_size": "11-50",
        "headquarters_location": "Los Angeles, CA",
        "description": "Media production company creating culturally relevant content for diverse audiences.",
        "dei_statement": "Our content celebrates Black excellence and amplifies underrepresented voices in entertainment.",
        "verified": False
    },
    {
        "organization_name": "Metro Transit Authority",
        "contact_email": "hr@metrotransit.gov",
        "website_url": "https://metrotransit.gov",
        "sector": "Government",
        "organization_size": "500+",
        "headquarters_location": "Washington, DC",
        "description": "Public transportation agency serving the greater metropolitan area.",
        "dei_statement": None,
        "verified": True
    },
    {
        "organization_name": "Roots Legal Services",
        "contact_email": "jobs@rootslegal.org",
        "website_url": "https://rootslegal.org",
        "sector": "Legal",
        "organization_size": "11-50",
        "headquarters_location": "Baltimore, MD",
        "description": "Nonprofit legal aid organization providing free services to low-income families.",
        "dei_statement": "We fight for justice and equity in communities that have been systematically marginalized. Our team is majority people of color with lived experience in the communities we serve.",
        "verified": True
    }
]


JOBS = [
    {
        "title": "Senior Full-Stack Developer",
        "industry": "Technology",
        "description": "We're looking for an experienced full-stack developer to join our education technology team. You'll work on accessible learning platforms used by thousands of students daily.",
        "pay_range_min": 100000,
        "pay_range_max": 140000,
        "pay_type": "salary",
        "location": "Atlanta, GA",
        "remote_type": "hybrid",
        "job_type": "full_time",
        "experience_level": "senior",
        "tags": ["React", "Python", "PostgreSQL", "AWS"],
        "application_email": "tech-hiring@techforward.com"
    },
    {
        "title": "Community Health Nurse",
        "industry": "Healthcare",
        "description": "Join our mission to provide quality healthcare to underserved communities. This role involves patient care, health education, and community outreach.",
        "pay_range_min": 65000,
        "pay_range_max": 85000,
        "pay_type": "salary",
        "location": "Detroit, MI",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["RN", "Community Health", "Patient Care"],
        "application_email": "nursing@chp-health.org"
    },
    {
        "title": "Business Development Manager",
        "industry": "Nonprofit",
        "description": "Help us grow partnerships and secure funding for Black entrepreneurs. Ideal candidate has experience in nonprofit fundraising and a passion for economic justice.",
        "pay_range_min": 60000,
        "pay_range_max": 75000,
        "pay_type": "salary",
        "location": "Chicago, IL",
        "remote_type": "hybrid",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Fundraising", "Partnerships", "Nonprofit"],
        "application_email": "careers@bba.org"
    },
    {
        "title": "Financial Analyst",
        "industry": "Finance",
        "description": "Analyze financial data and support community banking initiatives. Strong Excel and SQL skills required.",
        "pay_range_min": 70000,
        "pay_range_max": 95000,
        "pay_type": "salary",
        "location": "New York, NY",
        "remote_type": "hybrid",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Finance", "Excel", "SQL", "Analytics"],
        "application_email": "hr@emeraldfs.com"
    },
    {
        "title": "High School Math Teacher",
        "industry": "Education",
        "description": "Teach mathematics to high school students in an urban charter school. Must have teaching credential and passion for education equity.",
        "pay_range_min": 55000,
        "pay_range_max": 75000,
        "pay_type": "salary",
        "location": "Oakland, CA",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Teaching", "Math", "Education", "High School"],
        "application_email": "teachers@urbaned.org"
    },
    {
        "title": "Social Media Manager",
        "industry": "Technology",
        "description": "Manage social media strategy for our clients. Remote position with flexible hours.",
        "pay_range_min": 50000,
        "pay_range_max": 70000,
        "pay_type": "salary",
        "location": "Remote",
        "remote_type": "remote",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Social Media", "Marketing", "Content"],
        "application_email": "hello@nextgenmarketing.co"
    },
    {
        "title": "Construction Project Manager",
        "industry": "Construction",
        "description": "Lead sustainable construction projects from planning to completion. PMP certification preferred.",
        "pay_range_min": 80000,
        "pay_range_max": 110000,
        "pay_type": "salary",
        "location": "Houston, TX",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "senior",
        "tags": ["Project Management", "Construction", "PMP"],
        "application_email": "hr@greencityconstruction.com"
    },
    {
        "title": "Video Editor & Producer",
        "industry": "Media",
        "description": "Edit and produce video content for digital platforms. Experience with Adobe Premiere and After Effects required.",
        "pay_range_min": 55000,
        "pay_range_max": 75000,
        "pay_type": "salary",
        "location": "Los Angeles, CA",
        "remote_type": "hybrid",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Video Editing", "Adobe Premiere", "Production"],
        "application_email": "careers@heritagemedia.com"
    },
    {
        "title": "Bus Operator",
        "industry": "Government",
        "description": "Operate public transit buses safely and professionally. CDL with passenger endorsement required. Full benefits package.",
        "pay_range_min": 45000,
        "pay_range_max": 60000,
        "pay_type": "hourly",
        "location": "Washington, DC",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "entry",
        "tags": ["CDL", "Public Transit", "Driving"],
        "application_email": "hr@metrotransit.gov"
    },
    {
        "title": "Legal Aid Attorney",
        "industry": "Legal",
        "description": "Provide free legal services to low-income families in housing, family law, and civil rights matters.",
        "pay_range_min": 55000,
        "pay_range_max": 70000,
        "pay_type": "salary",
        "location": "Baltimore, MD",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Law", "Legal Aid", "Civil Rights"],
        "application_email": "jobs@rootslegal.org"
    },
    {
        "title": "Junior Software Engineer",
        "industry": "Technology",
        "description": "Entry-level position for recent graduates or bootcamp alumni. Learn from experienced engineers while building real products.",
        "pay_range_min": 65000,
        "pay_range_max": 80000,
        "pay_type": "salary",
        "location": "Atlanta, GA",
        "remote_type": "remote",
        "job_type": "full_time",
        "experience_level": "entry",
        "tags": ["JavaScript", "Python", "Entry Level"],
        "application_email": "tech-hiring@techforward.com"
    },
    {
        "title": "Medical Assistant",
        "industry": "Healthcare",
        "description": "Support our medical team in providing patient care. MA certification required.",
        "pay_range_min": 35000,
        "pay_range_max": 45000,
        "pay_type": "hourly",
        "location": "Detroit, MI",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "entry",
        "tags": ["Medical Assistant", "Healthcare", "Patient Care"],
        "application_email": "nursing@chp-health.org"
    },
    {
        "title": "Entrepreneurship Coach",
        "industry": "Nonprofit",
        "description": "Mentor Black entrepreneurs through business planning, funding, and growth. Part-time contract position.",
        "pay_range_min": 40,
        "pay_range_max": 60,
        "pay_type": "hourly",
        "location": "Chicago, IL",
        "remote_type": "hybrid",
        "job_type": "part_time",
        "experience_level": "senior",
        "tags": ["Coaching", "Entrepreneurship", "Mentorship"],
        "application_email": "careers@bba.org"
    },
    {
        "title": "Data Science Intern",
        "industry": "Finance",
        "description": "Summer internship program for students pursuing data science or statistics degrees. Work on real financial models.",
        "pay_range_min": 25,
        "pay_range_max": 30,
        "pay_type": "hourly",
        "location": "New York, NY",
        "remote_type": "hybrid",
        "job_type": "internship",
        "experience_level": "entry",
        "tags": ["Data Science", "Python", "Internship"],
        "application_email": "hr@emeraldfs.com"
    },
    {
        "title": "Elementary School Teacher",
        "industry": "Education",
        "description": "Teach grades K-5 in a diverse, supportive school environment. Teaching credential required.",
        "pay_range_min": 50000,
        "pay_range_max": 70000,
        "pay_type": "salary",
        "location": "Oakland, CA",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Teaching", "Elementary", "Education"],
        "application_email": "teachers@urbaned.org"
    },
    {
        "title": "Graphic Designer",
        "industry": "Technology",
        "description": "Create visual content for marketing campaigns and client projects. Remote-first role.",
        "pay_range_min": 55000,
        "pay_range_max": 75000,
        "pay_type": "salary",
        "location": "Remote",
        "remote_type": "remote",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Graphic Design", "Adobe Creative Suite", "Marketing"],
        "application_email": "hello@nextgenmarketing.co"
    },
    {
        "title": "Electrician",
        "industry": "Construction",
        "description": "Commercial and residential electrical work. Journeyman license required.",
        "pay_range_min": 28,
        "pay_range_max": 38,
        "pay_type": "hourly",
        "location": "Houston, TX",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Electrician", "Construction", "Licensed"],
        "application_email": "hr@greencityconstruction.com"
    },
    {
        "title": "Content Writer",
        "industry": "Media",
        "description": "Write articles, scripts, and marketing copy for diverse audiences. Strong storytelling skills essential.",
        "pay_range_min": 45000,
        "pay_range_max": 60000,
        "pay_type": "salary",
        "location": "Los Angeles, CA",
        "remote_type": "remote",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Writing", "Content", "Storytelling"],
        "application_email": "careers@heritagemedia.com"
    },
    {
        "title": "Transit Maintenance Technician",
        "industry": "Government",
        "description": "Maintain and repair buses and transit vehicles. Mechanical experience required.",
        "pay_range_min": 22,
        "pay_range_max": 32,
        "pay_type": "hourly",
        "location": "Washington, DC",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Maintenance", "Mechanical", "Transit"],
        "application_email": "hr@metrotransit.gov"
    },
    {
        "title": "Paralegal",
        "industry": "Legal",
        "description": "Support attorneys in case preparation, research, and client communication. Paralegal certificate preferred.",
        "pay_range_min": 40000,
        "pay_range_max": 55000,
        "pay_type": "salary",
        "location": "Baltimore, MD",
        "remote_type": "on_site",
        "job_type": "full_time",
        "experience_level": "mid",
        "tags": ["Paralegal", "Legal Research", "Case Management"],
        "application_email": "jobs@rootslegal.org"
    }
]


async def seed_all():
    """Create all seed data"""
    print("🌱 Starting BANIBS Opportunities Exchange seed data creation...")
    
    # Connect to database
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Clear existing data (optional - comment out to preserve existing data)
    print("\n🗑️  Clearing existing opportunities data...")
    await db.employer_profiles.delete_many({})
    await db.recruiter_profiles.delete_many({})
    await db.job_listings.delete_many({})
    await db.candidate_profiles.delete_many({})
    await db.application_records.delete_many({})
    
    # Create admin user for verification
    print("\n👤 Creating admin user...")
    try:
        admin_user = await db.banibs_users.find_one({"email": "admin@banibs.com"})
        if not admin_user:
            from models.unified_user import UserCreate
            user_data = UserCreate(
                email="admin@banibs.com",
                password="BanibsAdmin#2025",
                name="BANIBS Admin"
            )
            admin_id = await create_user(user_data)
            await add_role(admin_id, "super_admin")
            print(f"   ✅ Created admin user: {admin_id}")
        else:
            admin_id = admin_user["id"]
            print(f"   ✅ Admin user exists: {admin_id}")
    except Exception as e:
        print(f"   ⚠️  Admin user creation skipped: {e}")
        admin_id = "admin-placeholder-id"
    
    # 1. Create employers
    print("\n🏢 Creating employer profiles...")
    employer_ids = []
    for emp in EMPLOYERS:
        try:
            employer = await create_employer_profile(emp)
            employer_ids.append(employer["id"])
            
            # Verify if needed
            if emp["verified"]:
                await verify_employer(employer["id"], admin_id, "Seed data verification")
            
            verified_status = "✓ Verified" if emp["verified"] else "Unverified"
            dei_status = "DEI+" if emp.get("dei_statement") else ""
            print(f"   ✅ {emp['organization_name']} ({emp['sector']}) {verified_status} {dei_status}")
        except Exception as e:
            print(f"   ❌ Error creating {emp['organization_name']}: {e}")
    
    print(f"\n   📊 Created {len(employer_ids)} employer profiles")
    
    # 2. Create recruiter users and profiles
    print("\n👔 Creating recruiter profiles...")
    recruiter_ids = []
    recruiter_users = [
        {"name": "Sarah Johnson", "email": "sarah.j@techforward.com", "employer_idx": 0, "verified": True},
        {"name": "Michael Rodriguez", "email": "mrodriguez@chp-health.org", "employer_idx": 1, "verified": True},
        {"name": "Keisha Williams", "email": "keisha@bba.org", "employer_idx": 2, "verified": True},
        {"name": "David Chen", "email": "dchen@emeraldfs.com", "employer_idx": 3, "verified": False},
        {"name": "Tanya Brooks", "email": "tbrooks@greencityconstruction.com", "employer_idx": 6, "verified": True}
    ]
    
    for rec_user in recruiter_users:
        try:
            # Create user account
            from models.unified_user import UserCreate
            user_data = UserCreate(
                email=rec_user["email"],
                password="Recruiter#123",
                name=rec_user["name"]
            )
            user_id = await create_user(user_data)
            
            # Create recruiter profile
            recruiter_data = {
                "user_id": user_id,
                "full_name": rec_user["name"],
                "professional_title": "Talent Acquisition Specialist",
                "contact_email": rec_user["email"],
                "employer_ids": [employer_ids[rec_user["employer_idx"]]],
                "industries": [EMPLOYERS[rec_user["employer_idx"]]["sector"]],
                "verified": False  # Will be verified below if needed
            }
            recruiter = await create_recruiter_profile(recruiter_data)
            recruiter_ids.append(recruiter["id"])
            
            # Verify and grant role if needed
            if rec_user["verified"]:
                await verify_recruiter(recruiter["id"], admin_id, "Seed data verification")
                await add_role(user_id, "verified_recruiter")
            
            verified_status = "✓ Verified" if rec_user["verified"] else "Pending"
            print(f"   ✅ {rec_user['name']} - {EMPLOYERS[rec_user['employer_idx']]['organization_name']} ({verified_status})")
        except Exception as e:
            print(f"   ❌ Error creating recruiter {rec_user['name']}: {e}")
    
    print(f"\n   📊 Created {len(recruiter_ids)} recruiter profiles")
    
    # 3. Create job listings
    print("\n💼 Creating job listings...")
    job_ids = []
    
    # Map jobs to employers
    job_to_employer = [
        (0, 0, 0), (1, 1, 1), (2, 2, 2), (3, 3, 3), (4, 4, None),  # First 5 jobs
        (5, 5, None), (6, 6, 4), (7, 7, None), (8, 8, None), (9, 9, None),  # Next 5
        (10, 0, 0), (11, 1, 1), (12, 2, 2), (13, 3, 3), (14, 4, None),  # Next 5
        (15, 5, None), (16, 6, 4), (17, 7, None), (18, 8, None), (19, 9, None)  # Last 5
    ]
    
    for idx, (job_idx, emp_idx, rec_idx) in enumerate(job_to_employer):
        try:
            job_data = JOBS[job_idx].copy()
            job_data["employer_id"] = employer_ids[emp_idx]
            
            # Add recruiter if available
            if rec_idx is not None and rec_idx < len(recruiter_ids):
                job_data["posted_by_recruiter_id"] = recruiter_ids[rec_idx]
            
            # Create job
            job = await create_job_listing(job_data)
            job_ids.append(job["id"])
            
            # Approve most jobs (80%)
            if idx < 16:  # First 16 jobs are approved
                await update_job_listing(job["id"], {
                    "status": "approved",
                    "posted_at": (datetime.utcnow() - timedelta(days=idx*2)).isoformat()
                })
                status = "✓ Approved"
            else:
                status = "Pending"
            
            location_str = f"{job_data['location']} ({job_data['remote_type']})"
            print(f"   ✅ {job_data['title']} - {job_data['industry']} - {location_str} ({status})")
        except Exception as e:
            print(f"   ❌ Error creating job {JOBS[job_idx]['title']}: {e}")
    
    print(f"\n   📊 Created {len(job_ids)} job listings")
    
    # 4. Create candidate users and profiles
    print("\n🎓 Creating candidate profiles...")
    candidate_ids = []
    candidates = [
        {"name": "James Thompson", "email": "james.t@email.com", "title": "Software Engineer", "skills": ["Python", "React", "PostgreSQL"]},
        {"name": "Maria Garcia", "email": "maria.g@email.com", "title": "Healthcare Professional", "skills": ["Patient Care", "EMR", "Medical Terminology"]},
        {"name": "Andre Washington", "email": "andre.w@email.com", "title": "Business Development", "skills": ["Sales", "Partnership Development", "CRM"]},
        {"name": "Lisa Chen", "email": "lisa.c@email.com", "title": "Financial Analyst", "skills": ["Excel", "Financial Modeling", "SQL"]},
        {"name": "DeShawn Williams", "email": "deshawn.w@email.com", "title": "Educator", "skills": ["Teaching", "Curriculum Development", "Classroom Management"]},
        {"name": "Fatima Ahmed", "email": "fatima.a@email.com", "title": "Marketing Specialist", "skills": ["Social Media", "Content Marketing", "Analytics"]},
        {"name": "Marcus Brown", "email": "marcus.b@email.com", "title": "Project Manager", "skills": ["PMP", "Agile", "Stakeholder Management"]},
        {"name": "Nina Patel", "email": "nina.p@email.com", "title": "Video Producer", "skills": ["Adobe Premiere", "Storytelling", "Production"]}
    ]
    
    for candidate in candidates:
        try:
            # Create user
            from models.unified_user import UserCreate
            user_data = UserCreate(
                email=candidate["email"],
                password="Candidate#123",
                name=candidate["name"]
            )
            user_id = await create_user(user_data)
            
            # Create profile
            profile_data = {
                "user_id": user_id,
                "full_name": candidate["name"],
                "professional_title": candidate["title"],
                "contact_email": candidate["email"],
                "skills": candidate["skills"],
                "preferred_industries": ["Technology", "Healthcare", "Education"],
                "preferred_job_types": ["full_time"],
                "preferred_remote_types": ["remote", "hybrid"],
                "profile_public": True
            }
            profile = await create_candidate_profile(profile_data)
            candidate_ids.append(profile["id"])
            
            # Save some jobs
            if len(job_ids) >= 3:
                for job_id in job_ids[:3]:
                    await add_saved_job(profile["id"], job_id)
            
            print(f"   ✅ {candidate['name']} - {candidate['title']}")
        except Exception as e:
            print(f"   ❌ Error creating candidate {candidate['name']}: {e}")
    
    print(f"\n   📊 Created {len(candidate_ids)} candidate profiles")
    
    # 5. Create applications
    print("\n📝 Creating job applications...")
    application_count = 0
    
    # Create applications (2-3 per approved job for first 5 jobs)
    application_statuses = ["submitted", "reviewed", "interviewing", "offered", "rejected"]
    
    for job_idx in range(min(5, len(job_ids))):
        num_apps = min(3, len(candidate_ids))
        for cand_idx in range(num_apps):
            try:
                app_data = {
                    "job_id": job_ids[job_idx],
                    "candidate_id": candidate_ids[cand_idx],
                    "cover_letter": f"I am very interested in this position and believe my skills align well with your needs.",
                    "contact_email": candidates[cand_idx]["email"],
                    "status": application_statuses[application_count % len(application_statuses)]
                }
                app = await create_application(app_data)
                application_count += 1
                
                status_emoji = {"submitted": "📥", "reviewed": "👀", "interviewing": "🤝", "offered": "🎉", "rejected": "❌"}
                emoji = status_emoji.get(app_data["status"], "📝")
                print(f"   {emoji} {candidates[cand_idx]['name']} → {JOBS[job_idx]['title']} ({app_data['status']})")
            except Exception as e:
                print(f"   ❌ Error creating application: {e}")
    
    print(f"\n   📊 Created {application_count} applications")
    
    # Summary
    print("\n" + "="*60)
    print("✅ SEED DATA CREATION COMPLETE")
    print("="*60)
    print(f"📊 Summary:")
    print(f"   • Employers: {len(employer_ids)} ({sum(1 for e in EMPLOYERS if e['verified'])} verified)")
    print(f"   • Recruiters: {len(recruiter_ids)} ({sum(1 for r in recruiter_users if r['verified'])} verified)")
    print(f"   • Job Listings: {len(job_ids)} (16 approved, 4 pending)")
    print(f"   • Candidates: {len(candidate_ids)}")
    print(f"   • Applications: {application_count}")
    print("\n🔐 Test Credentials:")
    print(f"   Admin: admin@banibs.com / BanibsAdmin#2025")
    print(f"   Recruiter: sarah.j@techforward.com / Recruiter#123")
    print(f"   Candidate: james.t@email.com / Candidate#123")
    print("\n🚀 Ready to test BANIBS Opportunities Exchange!")


if __name__ == "__main__":
    asyncio.run(seed_all())
