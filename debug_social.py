#!/usr/bin/env python3
"""
Debug script for social portal issues
"""

import asyncio
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from db.connection import get_db

async def debug_social_issue():
    """Debug the social post creation issue"""
    
    # Get database
    db = await get_db()
    
    print("=== DEBUGGING SOCIAL PORTAL ISSUE ===")
    
    # Check if user exists in banibs_users
    user_email = "social_test_user@example.com"
    user = await db.banibs_users.find_one({"email": user_email})
    
    if user:
        print(f"✅ User found in banibs_users:")
        print(f"   ID: {user['id']}")
        print(f"   Name: {user['name']}")
        print(f"   Email: {user['email']}")
        print(f"   Roles: {user.get('roles', [])}")
        
        user_id = user['id']
        
        # Check if there are any posts by this user
        posts = await db.social_posts.find({"author_id": user_id}).to_list(length=None)
        print(f"\n📝 Posts by this user: {len(posts)}")
        
        if posts:
            for i, post in enumerate(posts):
                print(f"   Post {i+1}: ID={post['id']}, Text='{post['text'][:50]}...'")
                
                # Try to get this post by ID
                found_post = await db.social_posts.find_one({"id": post['id']})
                if found_post:
                    print(f"      ✅ Post found by ID query")
                else:
                    print(f"      ❌ Post NOT found by ID query")
        
        # Check if there are any social_reactions
        reactions = await db.social_reactions.find({}).to_list(length=None)
        print(f"\n👍 Total reactions in database: {len(reactions)}")
        
        # Check if there are any social_comments
        comments = await db.social_comments.find({}).to_list(length=None)
        print(f"\n💬 Total comments in database: {len(comments)}")
        
    else:
        print(f"❌ User NOT found in banibs_users with email: {user_email}")
        
        # Check if user exists in unified_users (old collection name)
        user_unified = await db.unified_users.find_one({"email": user_email})
        if user_unified:
            print(f"⚠️ User found in unified_users collection instead!")
            print(f"   ID: {user_unified['id']}")
            print(f"   Name: {user_unified['name']}")
        
    print("\n=== DEBUG COMPLETE ===")

if __name__ == "__main__":
    asyncio.run(debug_social_issue())