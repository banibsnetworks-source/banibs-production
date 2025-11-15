#!/usr/bin/env python3
"""
BANIBS Social Moderation & Safety Backend Testing - Phase 8.3.1
Comprehensive test suite for user reporting and admin moderation endpoints
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://banibs-connect.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class SocialModerationTester:
    def __init__(self):
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_post_id = None
        self.test_post_id_2 = None
        self.test_report_id = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, params: Optional[Dict] = None) -> requests.Response:
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
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
    
    def setup_admin_auth(self) -> bool:
        """Setup admin authentication"""
        self.log("Setting up admin authentication...")
        
        response = self.make_request("POST", "/auth/login", {
            "email": "admin@banibs.com",
            "password": "BanibsAdmin#2025"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("access_token")
            if self.admin_token:
                self.log("✅ Admin authentication successful")
                return True
            else:
                self.log("❌ Admin login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ Admin login failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def setup_user_auth(self) -> bool:
        """Setup user authentication"""
        self.log("Setting up user authentication...")
        
        # Create unique user
        timestamp = int(time.time())
        test_email = f"social_mod_test_{timestamp}@example.com"
        
        response = self.make_request("POST", "/auth/register", {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Social Moderation Test User",
            "accepted_terms": True
        })
        
        if response.status_code == 200:
            data = response.json()
            self.user_token = data.get("access_token")
            self.test_user_id = data.get("user", {}).get("id")
            if self.user_token and self.test_user_id:
                self.log("✅ User authentication successful")
                return True
            else:
                self.log("❌ User registration response missing required fields", "ERROR")
                return False
        else:
            self.log(f"❌ User registration failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def create_test_posts(self) -> bool:
        """Create test posts for moderation testing"""
        self.log("Creating test posts...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Create first test post
        response = self.make_request("POST", "/social/posts", {
            "text": "This is a test post for moderation testing. It should be reportable."
        }, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            self.test_post_id = data.get("id")
            self.log(f"✅ First test post created: {self.test_post_id}")
        else:
            self.log(f"❌ Failed to create first test post: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Create second test post
        response = self.make_request("POST", "/social/posts", {
            "text": "This is another test post for different moderation scenarios."
        }, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            self.test_post_id_2 = data.get("id")
            self.log(f"✅ Second test post created: {self.test_post_id_2}")
            return True
        else:
            self.log(f"❌ Failed to create second test post: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_valid_report_submission(self) -> bool:
        """Test Case 1: Valid report submission"""
        self.log("Test Case 1: Valid report submission...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        response = self.make_request("POST", f"/social/posts/{self.test_post_id}/report", {
            "reason_code": "spam",
            "reason_text": "This looks like a spam post"
        }, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            report_id = data.get("report_id")
            status = data.get("status")
            
            if report_id and status == "pending":
                self.test_report_id = report_id
                self.log(f"✅ Valid report submission successful - Report ID: {report_id}, Status: {status}")
                return True
            else:
                self.log("❌ Report response missing required fields or incorrect status", "ERROR")
                return False
        else:
            self.log(f"❌ Valid report submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_different_reason_codes(self) -> bool:
        """Test Case 2: Report with different reason codes"""
        self.log("Test Case 2: Testing different reason codes...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        reason_codes = ["abuse", "misinfo", "other"]
        success_count = 0
        
        for reason in reason_codes:
            response = self.make_request("POST", f"/social/posts/{self.test_post_id_2}/report", {
                "reason_code": reason,
                "reason_text": f"Testing {reason} reason code"
            }, headers=headers)
            
            if response.status_code == 201:
                success_count += 1
                self.log(f"✓ Reason code '{reason}' accepted")
            else:
                self.log(f"❌ Reason code '{reason}' failed: {response.status_code}", "ERROR")
        
        if success_count == 3:
            self.log("✅ All reason codes (abuse, misinfo, other) working correctly")
            return True
        else:
            self.log(f"❌ Some reason codes failed ({success_count}/3 passed)", "ERROR")
            return False
    
    def test_invalid_reason_code(self) -> bool:
        """Test Case 3: Invalid reason code"""
        self.log("Test Case 3: Testing invalid reason code...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        response = self.make_request("POST", f"/social/posts/{self.test_post_id}/report", {
            "reason_code": "invalid_reason",
            "reason_text": "This should fail"
        }, headers=headers)
        
        if response.status_code == 400:
            self.log("✅ Invalid reason code correctly rejected with 400 Bad Request")
            return True
        else:
            self.log(f"❌ Invalid reason code should return 400, got: {response.status_code}", "ERROR")
            return False
    
    def test_report_nonexistent_post(self) -> bool:
        """Test Case 4: Report non-existent post"""
        self.log("Test Case 4: Testing report on non-existent post...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        response = self.make_request("POST", "/social/posts/non-existent-post-id/report", {
            "reason_code": "spam",
            "reason_text": "This should fail"
        }, headers=headers)
        
        if response.status_code == 404:
            self.log("✅ Non-existent post correctly returns 404 Not Found")
            return True
        else:
            self.log(f"❌ Non-existent post should return 404, got: {response.status_code}", "ERROR")
            return False
    
    def test_unauthenticated_report(self) -> bool:
        """Test Case 5: Unauthenticated request"""
        self.log("Test Case 5: Testing unauthenticated report request...")
        
        response = self.make_request("POST", f"/social/posts/{self.test_post_id}/report", {
            "reason_code": "spam",
            "reason_text": "This should fail"
        })
        
        if response.status_code == 401:
            self.log("✅ Unauthenticated request correctly returns 401 Unauthorized")
            return True
        else:
            self.log(f"❌ Unauthenticated request should return 401, got: {response.status_code}", "ERROR")
            return False
    
    def test_admin_moderation_queue(self) -> bool:
        """Test Case 6: Admin moderation queue - list pending reports"""
        self.log("Test Case 6: Testing admin moderation queue...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", "/admin/social/reports", params={"status": "pending"}, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            total = data.get("total", 0)
            
            self.log(f"✅ Admin moderation queue working - Found {total} pending reports")
            
            # Check if our report is in the list
            if self.test_report_id:
                found_report = None
                for item in items:
                    if item.get("id") == self.test_report_id:
                        found_report = item
                        break
                
                if found_report:
                    self.log("✓ Our test report found in moderation queue")
                    
                    # Verify report structure
                    post = found_report.get("post", {})
                    if post.get("text") and post.get("author", {}).get("display_name"):
                        self.log(f"✓ Report contains post details: '{post['text'][:50]}...' by '{post['author']['display_name']}'")
                    else:
                        self.log("⚠️ Report missing some post details")
                else:
                    self.log("⚠️ Our test report not found in queue")
            
            return True
        else:
            self.log(f"❌ Admin moderation queue failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_moderation_queue_filters(self) -> bool:
        """Test Case 7: Filter by different statuses"""
        self.log("Test Case 7: Testing moderation queue status filters...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        statuses = ["pending", "kept", "hidden", "all"]
        success_count = 0
        
        for status in statuses:
            response = self.make_request("GET", "/admin/social/reports", params={"status": status}, headers=headers)
            
            if response.status_code == 200:
                success_count += 1
                self.log(f"✓ Status filter '{status}' working")
            else:
                self.log(f"❌ Status filter '{status}' failed: {response.status_code}", "ERROR")
        
        if success_count == 4:
            self.log("✅ All status filters (pending, kept, hidden, all) working correctly")
            return True
        else:
            self.log(f"❌ Some status filters failed ({success_count}/4 passed)", "ERROR")
            return False
    
    def test_non_admin_moderation_access(self) -> bool:
        """Test Case 8: Non-admin access to moderation queue"""
        self.log("Test Case 8: Testing non-admin access to moderation queue...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        response = self.make_request("GET", "/admin/social/reports", headers=headers)
        
        if response.status_code == 403:
            self.log("✅ Non-admin correctly denied access with 403 Forbidden")
            return True
        else:
            self.log(f"❌ Non-admin access should return 403, got: {response.status_code}", "ERROR")
            return False
    
    def test_keep_report(self) -> bool:
        """Test Case 9: Keep a report (dismiss)"""
        self.log("Test Case 9: Testing keep report action...")
        
        if not self.test_report_id:
            self.log("❌ No test report ID available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("PATCH", f"/admin/social/reports/{self.test_report_id}", {
            "action": "keep",
            "resolution_note": "Content is acceptable, report dismissed"
        }, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            new_status = data.get("new_status")
            action = data.get("action")
            
            if new_status == "kept" and action == "keep":
                self.log(f"✅ Keep report action successful - Status: {new_status}")
                return True
            else:
                self.log(f"❌ Keep report response incorrect: status={new_status}, action={action}", "ERROR")
                return False
        else:
            self.log(f"❌ Keep report action failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_hide_post(self) -> bool:
        """Test Case 10: Hide a post"""
        self.log("Test Case 10: Testing hide post action...")
        
        # First create a new report to hide
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        response = self.make_request("POST", f"/social/posts/{self.test_post_id_2}/report", {
            "reason_code": "abuse",
            "reason_text": "This post should be hidden"
        }, headers=headers)
        
        if response.status_code != 201:
            self.log(f"❌ Failed to create report for hide test: {response.status_code}", "ERROR")
            return False
        
        hide_report_id = response.json().get("report_id")
        
        # Now hide the post
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("PATCH", f"/admin/social/reports/{hide_report_id}", {
            "action": "hide",
            "resolution_note": "Content violates community guidelines"
        }, headers=admin_headers)
        
        if response.status_code == 200:
            data = response.json()
            new_status = data.get("new_status")
            action = data.get("action")
            
            if new_status == "hidden" and action == "hide":
                self.log(f"✅ Hide post action successful - Status: {new_status}")
                return True
            else:
                self.log(f"❌ Hide post response incorrect: status={new_status}, action={action}", "ERROR")
                return False
        else:
            self.log(f"❌ Hide post action failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_invalid_action(self) -> bool:
        """Test Case 11: Invalid action"""
        self.log("Test Case 11: Testing invalid action...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("PATCH", f"/admin/social/reports/{self.test_report_id}", {
            "action": "invalid_action",
            "resolution_note": "This should fail"
        }, headers=headers)
        
        if response.status_code == 400:
            self.log("✅ Invalid action correctly rejected with 400 Bad Request")
            return True
        else:
            self.log(f"❌ Invalid action should return 400, got: {response.status_code}", "ERROR")
            return False
    
    def test_nonexistent_report(self) -> bool:
        """Test Case 12: Non-existent report"""
        self.log("Test Case 12: Testing non-existent report resolution...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("PATCH", "/admin/social/reports/non-existent-id", {
            "action": "keep",
            "resolution_note": "This should fail"
        }, headers=headers)
        
        if response.status_code == 404:
            self.log("✅ Non-existent report correctly returns 404 Not Found")
            return True
        else:
            self.log(f"❌ Non-existent report should return 404, got: {response.status_code}", "ERROR")
            return False
    
    def test_feed_filtering(self) -> bool:
        """Test Case 13: Feed filtering - hidden posts don't appear"""
        self.log("Test Case 13: Testing feed filtering (hidden posts excluded)...")
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        response = self.make_request("GET", "/social/feed", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            total_items = data.get("total_items", 0)
            
            # Check if hidden post (TEST_POST_ID_2) is NOT in the feed
            hidden_post_found = False
            for item in items:
                if item.get("id") == self.test_post_id_2:
                    hidden_post_found = True
                    break
            
            if not hidden_post_found:
                self.log(f"✅ Feed filtering working - Hidden post excluded from feed (showing {total_items} visible posts)")
                return True
            else:
                self.log("❌ Hidden post still appears in feed", "ERROR")
                return False
        else:
            self.log(f"❌ Feed request failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_moderation_stats(self) -> bool:
        """Test Case 14: Moderation stats"""
        self.log("Test Case 14: Testing moderation stats...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", "/admin/social/reports/stats", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            pending = data.get("pending", 0)
            kept = data.get("kept", 0)
            hidden = data.get("hidden", 0)
            total = data.get("total", 0)
            
            self.log(f"✅ Moderation stats working - Pending: {pending}, Kept: {kept}, Hidden: {hidden}, Total: {total}")
            
            # Verify total calculation
            calculated_total = pending + kept + hidden
            if calculated_total == total:
                self.log("✓ Total count calculation correct")
            else:
                self.log(f"⚠️ Total count mismatch: calculated={calculated_total}, returned={total}")
            
            return True
        else:
            self.log(f"❌ Moderation stats failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all test cases"""
        self.log("🚀 Starting BANIBS Social Moderation & Safety Backend Testing - Phase 8.3.1")
        self.log("=" * 80)
        
        # Setup phase
        if not self.setup_admin_auth():
            self.log("❌ Admin authentication setup failed", "ERROR")
            return False
        
        if not self.setup_user_auth():
            self.log("❌ User authentication setup failed", "ERROR")
            return False
        
        if not self.create_test_posts():
            self.log("❌ Test post creation failed", "ERROR")
            return False
        
        self.log("✅ Setup phase completed successfully")
        self.log("")
        
        # Test cases
        test_cases = [
            ("Valid Report Submission", self.test_valid_report_submission),
            ("Different Reason Codes", self.test_different_reason_codes),
            ("Invalid Reason Code", self.test_invalid_reason_code),
            ("Report Non-existent Post", self.test_report_nonexistent_post),
            ("Unauthenticated Request", self.test_unauthenticated_report),
            ("Admin Moderation Queue", self.test_admin_moderation_queue),
            ("Moderation Queue Filters", self.test_moderation_queue_filters),
            ("Non-admin Access", self.test_non_admin_moderation_access),
            ("Keep Report Action", self.test_keep_report),
            ("Hide Post Action", self.test_hide_post),
            ("Invalid Action", self.test_invalid_action),
            ("Non-existent Report", self.test_nonexistent_report),
            ("Feed Filtering", self.test_feed_filtering),
            ("Moderation Stats", self.test_moderation_stats)
        ]
        
        passed = 0
        failed = 0
        failed_tests = []
        
        for test_name, test_func in test_cases:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
                    failed_tests.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} threw exception: {e}", "ERROR")
                failed += 1
                failed_tests.append(test_name)
            
            self.log("")  # Add spacing between tests
        
        # Summary
        self.log("=" * 80)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 80)
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        
        if failed > 0:
            self.log("")
            self.log("Failed tests:")
            for test in failed_tests:
                self.log(f"  - {test}")
            self.log("")
            return False
        else:
            self.log("")
            self.log("🎉 All tests passed successfully!")
            self.log("")
            return True

def main():
    """Main test execution"""
    tester = SocialModerationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()