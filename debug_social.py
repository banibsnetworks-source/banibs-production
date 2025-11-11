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
    print(f"Database name: {db.name}")
    
    # List all collections to see what's available
    collections = await db.list_collection_names()
    print(f"Collections in database: {collections}")
    
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
        
    # Test the get_post_by_id function directly
    if posts:
        test_post_id = posts[0]['id']
        print(f"\n🔍 Testing get_post_by_id function with ID: {test_post_id}")
        
        from db.social_posts import get_post_by_id
        
        try:
            enriched_post = await get_post_by_id(test_post_id, user_id)
            if enriched_post:
                print(f"✅ get_post_by_id returned post successfully")
                print(f"   Author: {enriched_post.get('author', {}).get('display_name', 'Unknown')}")
                print(f"   Text: {enriched_post['text'][:50]}...")
            else:
                print(f"❌ get_post_by_id returned None")
                
                # Let's debug step by step
                print(f"\n🔍 Debugging get_post_by_id step by step:")
                
                # Step 1: Find the post
                post = await db.social_posts.find_one({"id": test_post_id}, {"_id": 0})
                if post:
                    print(f"   ✅ Step 1: Post found in database")
                    print(f"      Author ID: {post['author_id']}")
                    
                    # Step 2: Find the author
                    author = await db.banibs_users.find_one(
                        {"id": post["author_id"]},
                        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
                    )
                    if author:
                        print(f"   ✅ Step 2: Author found in banibs_users")
                        print(f"      Author: {author}")
                        
                        # Step 3: Check viewer like status
                        print(f"   🔍 Step 3: Checking viewer like status")
                        like = await db.social_reactions.find_one({
                            "post_id": test_post_id,
                            "user_id": user_id
                        })
                        viewer_has_liked = like is not None
                        print(f"      Like found: {like is not None}")
                        
                        # Step 4: Try to construct the return object
                        print(f"   🔍 Step 4: Constructing return object")
                        try:
                            result = {
                                **post,
                                "author": {
                                    "id": author["id"],
                                    "display_name": author.get("name", "Unknown User"),
                                    "avatar_url": author.get("avatar_url")
                                },
                                "viewer_has_liked": viewer_has_liked
                            }
                            print(f"      ✅ Return object constructed successfully")
                            print(f"      Keys: {list(result.keys())}")
                        except Exception as e:
                            print(f"      ❌ Failed to construct return object: {e}")
                            
                    else:
                        print(f"   ❌ Step 2: Author NOT found in banibs_users")
                        print(f"      Looking for ID: {post['author_id']}")
                        
                        # Check if author exists with different query
                        author_check = await db.banibs_users.find_one({"id": post["author_id"]})
                        if author_check:
                            print(f"      ⚠️ Author exists but projection failed")
                            print(f"      Full author: {author_check}")
                        else:
                            print(f"      ❌ Author truly doesn't exist")
                else:
                    print(f"   ❌ Step 1: Post NOT found in database")
                    
        except Exception as e:
            print(f"❌ get_post_by_id failed with exception: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n=== DEBUG COMPLETE ===")

if __name__ == "__main__":
    asyncio.run(debug_social_issue())