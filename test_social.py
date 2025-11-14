#!/usr/bin/env python3
"""
BANIBS Social Portal Backend Test Suite - Phase 8.3
"""

import requests
import json
import sys
import time
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://emoji-migration.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class SocialPortalTester:
    def __init__(self):
        self.access_token = None
        self.test_user_email = "social_test_user@example.com"
        self.test_user_id = None
        self.test_post_id = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data=None, headers=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        
        request_headers = self.session.headers.copy()
        if headers:
            request_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise

    def test_user_registration(self) -> bool:
        """Test user registration for social portal"""
        self.log("Testing social user registration...")
        
        response = self.make_request("POST", "/auth/register", {
            "email": self.test_user_email,
            "password": "TestPass123!",
            "name": "Social Test User",
            "accepted_terms": True
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.access_token = data["access_token"]
                self.test_user_id = data["user"]["id"]
                self.log(f"✅ Social user registration successful - User ID: {self.test_user_id}")
                return True
            else:
                self.log("❌ Registration response missing required fields", "ERROR")
                return False
        elif response.status_code == 409:
            # User already exists, try login
            self.log("User already exists, attempting login...")
            return self.test_user_login()
        else:
            self.log(f"❌ Social user registration failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_user_login(self) -> bool:
        """Test user login for social portal"""
        self.log("Testing social user login...")
        
        response = self.make_request("POST", "/auth/login", {
            "email": self.test_user_email,
            "password": "TestPass123!"
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.access_token = data["access_token"]
                self.test_user_id = data["user"]["id"]
                self.log(f"✅ Social user login successful - User ID: {self.test_user_id}")
                return True
            else:
                self.log("❌ Login response missing required fields", "ERROR")
                return False
        else:
            self.log(f"❌ Social user login failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_post_creation(self) -> bool:
        """Test creating social posts"""
        if not self.access_token:
            self.log("❌ No access token available for post creation", "ERROR")
            return False
        
        self.log("Testing social post creation...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Create test posts
        test_posts = [
            "Hello BANIBS Social! This is my first post on the platform. #FirstPost",
            "Just sharing some thoughts with the community. What do you think about the new platform?",
            "Testing the social feed features. Looking forward to connecting with everyone!"
        ]
        
        created_posts = []
        
        for i, post_text in enumerate(test_posts):
            response = self.make_request("POST", "/social/posts", {
                "text": post_text
            }, headers=headers)
            
            if response.status_code == 201:
                data = response.json()
                required_fields = ["id", "author", "text", "created_at", "like_count", "comment_count", "viewer_has_liked"]
                
                if all(field in data for field in required_fields):
                    created_posts.append(data)
                    self.log(f"✅ Post {i+1} created successfully - ID: {data['id']}")
                    
                    # Verify initial counts
                    if data["like_count"] == 0 and data["comment_count"] == 0:
                        self.log(f"   Initial counts correct: likes={data['like_count']}, comments={data['comment_count']}")
                    else:
                        self.log(f"❌ Initial counts incorrect: likes={data['like_count']}, comments={data['comment_count']}", "ERROR")
                        return False
                        
                    # Verify author info
                    author = data.get("author", {})
                    if author.get("display_name") == "Social Test User":
                        self.log(f"   Author info correct: {author['display_name']}")
                    else:
                        self.log(f"❌ Author info incorrect: {author}", "ERROR")
                        return False
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log(f"❌ Post {i+1} missing fields: {missing_fields}", "ERROR")
                    return False
            else:
                self.log(f"❌ Post {i+1} creation failed: {response.status_code} - {response.text}", "ERROR")
                return False
        
        # Store first post ID for later tests
        if created_posts:
            self.test_post_id = created_posts[0]["id"]
            self.log(f"✅ All {len(created_posts)} posts created successfully")
            return True
        else:
            self.log("❌ No posts were created", "ERROR")
            return False
    
    def test_feed_retrieval(self) -> bool:
        """Test retrieving social feed"""
        if not self.access_token:
            self.log("❌ No access token available for feed retrieval", "ERROR")
            return False
        
        self.log("Testing social feed retrieval...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = self.make_request("GET", "/social/feed", headers=headers, params={"page": 1})
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["page", "page_size", "total_items", "total_pages", "items"]
            
            if all(field in data for field in required_fields):
                items = data["items"]
                self.log(f"✅ Feed retrieved successfully - {len(items)} posts on page {data['page']}")
                
                if len(items) > 0:
                    # Store the first post ID for later tests if we don't have one
                    if not self.test_post_id:
                        self.test_post_id = items[0]["id"]
                        self.log(f"   Using existing post ID for testing: {self.test_post_id}")
                    
                    # Verify posts are in reverse chronological order
                    if len(items) > 1:
                        first_post_time = items[0]["created_at"]
                        second_post_time = items[1]["created_at"]
                        if first_post_time >= second_post_time:
                            self.log("✅ Posts are in reverse chronological order (newest first)")
                        else:
                            self.log("❌ Posts are not in correct chronological order", "ERROR")
                            return False
                    
                    # Verify post structure
                    post = items[0]
                    required_post_fields = ["id", "author", "text", "created_at", "like_count", "comment_count", "viewer_has_liked"]
                    
                    if all(field in post for field in required_post_fields):
                        self.log("✅ Post structure is correct")
                        
                        # Verify author information
                        author = post.get("author", {})
                        if "id" in author and "display_name" in author:
                            self.log(f"   Author info: {author['display_name']}")
                        else:
                            self.log("❌ Author information incomplete", "ERROR")
                            return False
                            
                        # Verify viewer_has_liked is initially false
                        if post["viewer_has_liked"] == False:
                            self.log("✅ viewer_has_liked is initially false")
                        else:
                            self.log(f"❌ viewer_has_liked should be false initially, got {post['viewer_has_liked']}", "ERROR")
                            return False
                    else:
                        missing_fields = [field for field in required_post_fields if field not in post]
                        self.log(f"❌ Post missing fields: {missing_fields}", "ERROR")
                        return False
                else:
                    self.log("⚠️ No posts found in feed")
                
                return True
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Feed response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Feed retrieval failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_like_functionality(self) -> bool:
        """Test liking and unliking posts"""
        if not self.access_token or not self.test_post_id:
            self.log("❌ No access token or post ID available for like testing", "ERROR")
            return False
        
        self.log("Testing social like functionality...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Like the post
        response = self.make_request("POST", f"/social/posts/{self.test_post_id}/like", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["liked", "like_count"]
            
            if all(field in data for field in required_fields):
                if data["liked"] == True and data["like_count"] == 1:
                    self.log("✅ Post liked successfully - liked=true, like_count=1")
                else:
                    self.log(f"❌ Like response incorrect: liked={data['liked']}, like_count={data['like_count']}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Like response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Like post failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Unlike the post (like again)
        response = self.make_request("POST", f"/social/posts/{self.test_post_id}/like", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data["liked"] == False and data["like_count"] == 0:
                self.log("✅ Post unliked successfully - liked=false, like_count=0")
            else:
                self.log(f"❌ Unlike response incorrect: liked={data['liked']}, like_count={data['like_count']}", "ERROR")
                return False
        else:
            self.log(f"❌ Unlike post failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Like it one more time to leave it in liked state
        response = self.make_request("POST", f"/social/posts/{self.test_post_id}/like", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data["liked"] == True and data["like_count"] == 1:
                self.log("✅ Post liked again successfully - left in liked state")
                return True
            else:
                self.log(f"❌ Final like response incorrect: liked={data['liked']}, like_count={data['like_count']}", "ERROR")
                return False
        else:
            self.log(f"❌ Final like failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_comment_functionality(self) -> bool:
        """Test creating and retrieving comments"""
        if not self.access_token or not self.test_post_id:
            self.log("❌ No access token or post ID available for comment testing", "ERROR")
            return False
        
        self.log("Testing social comment functionality...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Create test comments
        test_comments = [
            "Great first post! Welcome to BANIBS Social!",
            "Looking forward to more content from you!"
        ]
        
        created_comments = []
        
        for i, comment_text in enumerate(test_comments):
            response = self.make_request("POST", f"/social/posts/{self.test_post_id}/comments", {
                "text": comment_text
            }, headers=headers)
            
            if response.status_code == 201:
                data = response.json()
                required_fields = ["id", "post_id", "author", "text", "created_at", "is_deleted"]
                
                if all(field in data for field in required_fields):
                    created_comments.append(data)
                    self.log(f"✅ Comment {i+1} created successfully - ID: {data['id']}")
                    
                    # Verify comment data
                    if data["post_id"] == self.test_post_id and data["text"] == comment_text:
                        self.log(f"   Comment data correct: post_id matches, text correct")
                    else:
                        self.log(f"❌ Comment data incorrect", "ERROR")
                        return False
                        
                    # Verify author info
                    author = data.get("author", {})
                    if author.get("display_name") == "Social Test User":
                        self.log(f"   Comment author correct: {author['display_name']}")
                    else:
                        self.log(f"❌ Comment author incorrect: {author}", "ERROR")
                        return False
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log(f"❌ Comment {i+1} missing fields: {missing_fields}", "ERROR")
                    return False
            else:
                self.log(f"❌ Comment {i+1} creation failed: {response.status_code} - {response.text}", "ERROR")
                return False
        
        # Retrieve comments for the post
        response = self.make_request("GET", f"/social/posts/{self.test_post_id}/comments", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["page", "page_size", "total_items", "items"]
            
            if all(field in data for field in required_fields):
                comments = data["items"]
                self.log(f"✅ Comments retrieved successfully - {len(comments)} comments found")
                
                if len(comments) >= len(test_comments):
                    # Verify all comments are present
                    comment_texts = [c["text"] for c in comments]
                    for test_text in test_comments:
                        if test_text in comment_texts:
                            self.log(f"   Found comment: {test_text[:30]}...")
                        else:
                            self.log(f"❌ Missing comment: {test_text}", "ERROR")
                            return False
                    
                    # Verify comment structure
                    comment = comments[0]
                    if "author" in comment and "display_name" in comment["author"]:
                        self.log(f"   Comment author info correct: {comment['author']['display_name']}")
                    else:
                        self.log("❌ Comment author info missing", "ERROR")
                        return False
                else:
                    self.log(f"❌ Expected at least {len(test_comments)} comments, got {len(comments)}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Comments response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Comments retrieval failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Verify post's comment_count is updated
        response = self.make_request("GET", f"/social/posts/{self.test_post_id}", headers=headers)
        
        if response.status_code == 200:
            post_data = response.json()
            if post_data.get("comment_count", 0) >= len(test_comments):
                self.log(f"✅ Post comment_count updated correctly: {post_data['comment_count']}")
                return True
            else:
                self.log(f"❌ Post comment_count not updated: expected >= {len(test_comments)}, got {post_data.get('comment_count', 0)}", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to verify post comment count: {response.status_code}", "ERROR")
            return False
    
    def test_single_post_retrieval(self) -> bool:
        """Test retrieving a single post by ID"""
        if not self.access_token or not self.test_post_id:
            self.log("❌ No access token or post ID available for single post test", "ERROR")
            return False
        
        self.log("Testing single post retrieval...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = self.make_request("GET", f"/social/posts/{self.test_post_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "author", "text", "created_at", "like_count", "comment_count", "viewer_has_liked"]
            
            if all(field in data for field in required_fields):
                self.log(f"✅ Single post retrieved successfully - ID: {data['id']}")
                
                # Verify all fields are populated correctly
                if data["id"] == self.test_post_id:
                    self.log("   Post ID matches")
                else:
                    self.log(f"❌ Post ID mismatch: expected {self.test_post_id}, got {data['id']}", "ERROR")
                    return False
                
                # Verify like status reflects previous interactions (should be liked)
                if data["viewer_has_liked"] == True and data["like_count"] >= 1:
                    self.log(f"   Like status correct: viewer_has_liked={data['viewer_has_liked']}, like_count={data['like_count']}")
                else:
                    self.log(f"❌ Like status incorrect: viewer_has_liked={data['viewer_has_liked']}, like_count={data['like_count']}", "ERROR")
                    return False
                
                # Verify comment count
                if data["comment_count"] >= 2:
                    self.log(f"   Comment count correct: {data['comment_count']}")
                else:
                    self.log(f"❌ Comment count incorrect: expected >= 2, got {data['comment_count']}", "ERROR")
                    return False
                
                # Verify author info
                author = data.get("author", {})
                if author.get("display_name") == "Social Test User":
                    self.log(f"   Author info correct: {author['display_name']}")
                else:
                    self.log(f"❌ Author info incorrect: {author}", "ERROR")
                    return False
                
                return True
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Single post missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Single post retrieval failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_authentication_required(self) -> bool:
        """Test that all social endpoints require authentication"""
        self.log("Testing social authentication requirements...")
        
        # Test endpoints without authentication
        endpoints_to_test = [
            ("GET", "/social/feed"),
            ("POST", "/social/posts"),
            ("GET", f"/social/posts/{self.test_post_id or 'test-id'}"),
            ("POST", f"/social/posts/{self.test_post_id or 'test-id'}/like"),
            ("POST", f"/social/posts/{self.test_post_id or 'test-id'}/comments"),
            ("GET", f"/social/posts/{self.test_post_id or 'test-id'}/comments")
        ]
        
        for method, endpoint in endpoints_to_test:
            if method == "POST":
                response = self.make_request(method, endpoint, {"text": "test"})
            else:
                response = self.make_request(method, endpoint)
            
            if response.status_code == 401:
                self.log(f"✅ {method} {endpoint} correctly requires authentication (401)")
            else:
                self.log(f"❌ {method} {endpoint} should require authentication, got {response.status_code}", "ERROR")
                return False
        
        self.log("✅ All social endpoints correctly require authentication")
        return True

    def run_all_tests(self) -> bool:
        """Run all social portal tests"""
        self.log("Starting BANIBS Social Portal Backend Test Suite - Phase 8.3")
        self.log(f"Testing against: {API_BASE}")
        self.log("Testing social feed, posts, likes, and comments functionality")
        
        tests = [
            # Authentication Flow
            ("Social User Registration", self.test_user_registration),
            ("Social User Login", self.test_user_login),
            
            # Social Post Creation
            ("Social Post Creation", self.test_post_creation),
            
            # Feed Retrieval
            ("Social Feed Retrieval", self.test_feed_retrieval),
            
            # Like Functionality
            ("Social Like Functionality", self.test_like_functionality),
            
            # Comment Functionality
            ("Social Comment Functionality", self.test_comment_functionality),
            
            # Single Post Retrieval
            ("Single Post Retrieval", self.test_single_post_retrieval),
            
            # Authentication Requirements
            ("Social Authentication Required", self.test_authentication_required),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} ---")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {e}", "ERROR")
                failed += 1
                
        self.log(f"\n=== SOCIAL PORTAL TEST RESULTS ===")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All social portal tests passed!")
            return True
        else:
            self.log(f"💥 {failed} social portal test(s) failed")
            return False


if __name__ == "__main__":
    tester = SocialPortalTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)