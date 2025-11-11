"""
Seed social posts for Phase 8.3 testing
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

async def seed_social_posts():
    """Create test social posts"""
    
    print("=" * 60)
    print("BANIBS Social Posts Seeding")
    print("=" * 60)
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Get test user
        test_user = await db.banibs_users.find_one({"email": "social_test_user@example.com"})
        if not test_user:
            print("❌ Test user not found. Run create_social_test_user.py first.")
            return
        
        user_id = test_user["id"]
        print(f"Found test user: {test_user['name']} ({user_id})")
        
        # Check if posts already exist
        existing_posts = await db.social_posts.count_documents({"author_id": user_id})
        if existing_posts > 0:
            print(f"✅ {existing_posts} posts already exist for test user")
            return
        
        # Sample posts
        sample_posts = [
            {
                "text": "Hello BANIBS Social! This is my first post on the platform. Excited to connect with the community! 🎉",
                "created_at": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "text": "Just discovered some amazing Black-owned businesses in my area. Supporting local entrepreneurs is so important! 💪 #BlackBusiness #Community",
                "created_at": datetime.utcnow() - timedelta(hours=1, minutes=30)
            },
            {
                "text": "The BANIBS platform is incredible! Love how it brings together news, opportunities, and community all in one place. 🌟",
                "created_at": datetime.utcnow() - timedelta(minutes=45)
            },
            {
                "text": "Looking forward to Phase 8.3.1 with moderation features. This platform keeps getting better! 🚀 #BANIBS #Innovation",
                "created_at": datetime.utcnow() - timedelta(minutes=20)
            },
            {
                "text": "Shoutout to all the developers working on BANIBS. The social portal is smooth and user-friendly! 👏 #TechExcellence",
                "created_at": datetime.utcnow() - timedelta(minutes=10)
            }
        ]
        
        # Create posts
        posts_created = 0
        for post_data in sample_posts:
            post_id = str(uuid.uuid4())
            
            post_doc = {
                "id": post_id,
                "author_id": user_id,
                "text": post_data["text"],
                "media_url": None,
                "created_at": post_data["created_at"],
                "updated_at": post_data["created_at"],
                "like_count": 0,
                "comment_count": 0,
                "is_deleted": False
            }
            
            await db.social_posts.insert_one(post_doc)
            posts_created += 1
            print(f"✅ Created post: {post_data['text'][:50]}...")
        
        print(f"\n🎉 Successfully created {posts_created} social posts!")
        
        # Create some likes and comments for variety
        posts = await db.social_posts.find({"author_id": user_id}).to_list(None)
        
        if len(posts) >= 2:
            # Add some likes to first post
            first_post = posts[0]
            like_doc = {
                "id": str(uuid.uuid4()),
                "post_id": first_post["id"],
                "user_id": user_id,
                "created_at": datetime.utcnow() - timedelta(minutes=5)
            }
            await db.social_likes.insert_one(like_doc)
            
            # Update like count
            await db.social_posts.update_one(
                {"id": first_post["id"]},
                {"$set": {"like_count": 1}}
            )
            
            # Add a comment to second post
            second_post = posts[1]
            comment_doc = {
                "id": str(uuid.uuid4()),
                "post_id": second_post["id"],
                "author_id": user_id,
                "text": "This is a great point! Thanks for sharing.",
                "created_at": datetime.utcnow() - timedelta(minutes=3),
                "is_deleted": False
            }
            await db.social_comments.insert_one(comment_doc)
            
            # Update comment count
            await db.social_posts.update_one(
                {"id": second_post["id"]},
                {"$set": {"comment_count": 1}}
            )
            
            print("✅ Added sample likes and comments")
        
        print("\n" + "=" * 60)
        print("Social Posts Seeding Complete!")
        print("=" * 60)
        print(f"Created {posts_created} posts with sample engagement")
        print("Ready for Phase 8.3 testing!")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_social_posts())