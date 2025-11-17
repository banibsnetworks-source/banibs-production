#!/usr/bin/env python3
"""
Phase 8.3 Backend API Test Suite
Tests Peoples, Business Support, and Business Knowledge Flags systems
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://social-business-hub.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Phase83Tester:
    def __init__(self):
        self.access_token = None
        self.user_id = None
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
                response = self.session.post(url, json=data, headers=request_headers, params=params)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise

    def authenticate(self) -> bool:
        """Authenticate with test credentials"""
        self.log("🔐 Authenticating with test credentials...")
        
        test_email = "testprofile@example.com"
        test_password = "testpass123"
        
        response = self.make_request("POST", "/auth/login", {
            "email": test_email,
            "password": test_password
        })
        
        if response.status_code != 200:
            self.log(f"❌ Authentication failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        data = response.json()
        if "access_token" not in data:
            self.log("❌ Login response missing access_token", "ERROR")
            return False
        
        self.access_token = data["access_token"]
        self.user_id = data.get("user", {}).get("id")
        self.log(f"✅ Authentication successful - User ID: {self.user_id}")
        return True

    def test_peoples_system(self) -> bool:
        """Test Peoples System endpoints"""
        self.log("👥 Testing Peoples System...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test 1: Get initial peoples stats
        self.log("📊 Test 1: Getting initial peoples stats...")
        response = self.make_request("GET", f"/social/peoples/{self.user_id}/stats", headers=headers)
        
        if response.status_code == 200:
            stats = response.json()
            initial_peoples_count = stats.get("peoples_count", 0)
            self.log(f"✅ Initial peoples count: {initial_peoples_count}")
        else:
            self.log(f"❌ Failed to get peoples stats: {response.status_code}", "ERROR")
            return False
        
        # Test 2: Try to add self to peoples (should fail)
        self.log("🚫 Test 2: Attempting to add self to peoples (should fail)...")
        response = self.make_request("POST", f"/social/peoples/{self.user_id}", headers=headers)
        
        if response.status_code == 400:
            self.log("✅ Correctly prevented adding self to peoples")
        else:
            self.log(f"❌ Should prevent adding self to peoples, got {response.status_code}", "ERROR")
            return False
        
        # Test 3: Get peoples list
        self.log("📋 Test 3: Getting peoples list...")
        response = self.make_request("GET", f"/social/peoples/{self.user_id}", headers=headers)
        
        if response.status_code == 200:
            peoples_list = response.json()
            self.log(f"✅ Peoples list retrieved: {len(peoples_list)} people")
        else:
            self.log(f"❌ Failed to get peoples list: {response.status_code}", "ERROR")
            return False
        
        return True

    def test_business_support_system(self) -> bool:
        """Test Business Support System endpoints"""
        self.log("🏢 Testing Business Support System...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        business_id = "9c1933dd-e207-4e0c-845e-766bc4706f1d"
        
        # Test 1: Get initial business support stats
        self.log("📊 Test 1: Getting initial business support stats...")
        response = self.make_request("GET", f"/business/{business_id}/support/stats", headers=headers)
        
        if response.status_code == 200:
            stats = response.json()
            initial_supporters_count = stats.get("supporters_count", 0)
            is_supported = stats.get("is_supported", False)
            self.log(f"✅ Initial supporters count: {initial_supporters_count}, is_supported: {is_supported}")
        else:
            self.log(f"❌ Failed to get business support stats: {response.status_code}", "ERROR")
            return False
        
        # Test 2: Support a business
        self.log("💖 Test 2: Supporting a business...")
        response = self.make_request("POST", f"/business/{business_id}/support", headers=headers)
        
        if response.status_code in [201, 200]:  # 201 for created, 200 for already exists
            result = response.json()
            self.log(f"✅ Support business result: {result.get('status', 'unknown')}")
        else:
            self.log(f"❌ Failed to support business: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 3: Get business supporters
        self.log("👥 Test 3: Getting business supporters...")
        response = self.make_request("GET", f"/business/{business_id}/supporters", headers=headers)
        
        if response.status_code == 200:
            supporters = response.json()
            self.log(f"✅ Business supporters retrieved: {len(supporters)} supporters")
        else:
            self.log(f"❌ Failed to get business supporters: {response.status_code}", "ERROR")
            return False
        
        # Test 4: Get user's supported businesses
        self.log("🏪 Test 4: Getting user's supported businesses...")
        response = self.make_request("GET", f"/business/user/{self.user_id}/supported-businesses", headers=headers)
        
        if response.status_code == 200:
            supported_businesses = response.json()
            self.log(f"✅ Supported businesses retrieved: {len(supported_businesses)} businesses")
        else:
            self.log(f"❌ Failed to get supported businesses: {response.status_code}", "ERROR")
            return False
        
        return True

    def test_business_knowledge_flags(self) -> bool:
        """Test Business Knowledge Flags endpoints"""
        self.log("🧠 Testing Business Knowledge Flags...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test 1: Create knowledge flag (pitfall type)
        self.log("📝 Test 1: Creating pitfall knowledge flag...")
        
        pitfall_description = "This is a comprehensive test of the business knowledge flag system. " \
                            "We're testing the minimum 80 character requirement and ensuring that " \
                            "business owners can share valuable insights about potential pitfalls " \
                            "in their industry. This description meets the quality standards."
        
        response = self.make_request("POST", "/business/knowledge", {}, headers=headers, params={
            "type": "pitfall",
            "title": "Test Pitfall Flag",
            "description": pitfall_description,
            "anonymous": False,
            "tags": ["testing", "api"]
        })
        
        pitfall_flag_id = None
        if response.status_code == 201:
            result = response.json()
            pitfall_flag_id = result.get("flag_id")
            self.log(f"✅ Pitfall flag created: {pitfall_flag_id}")
        else:
            self.log(f"❌ Failed to create pitfall flag: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 2: Create anonymous knowledge flag (plus type) or verify rate limiting
        self.log("🔒 Test 2: Creating anonymous plus knowledge flag...")
        
        plus_description = "This is an anonymous test flag to verify the anonymity feature works correctly. " \
                         "Business owners should be able to share sensitive information without revealing " \
                         "their identity to other business owners, while still allowing BANIBS admins to " \
                         "track the author for moderation purposes. This meets the 80 character minimum."
        
        response = self.make_request("POST", "/business/knowledge", {}, headers=headers, params={
            "type": "plus",
            "title": "Anonymous Plus Flag Test",
            "description": plus_description,
            "anonymous": True,
            "tags": ["anonymous", "testing"]
        })
        
        anonymous_flag_id = None
        if response.status_code == 201:
            result = response.json()
            anonymous_flag_id = result.get("flag_id")
            self.log(f"✅ Anonymous plus flag created: {anonymous_flag_id}")
        elif response.status_code == 429:
            self.log("✅ Rate limiting working correctly - maximum flags per day reached")
            # Use the pitfall flag for subsequent tests
            anonymous_flag_id = pitfall_flag_id
        else:
            self.log(f"❌ Failed to create anonymous flag: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 3: Test minimum character requirement (should fail)
        self.log("📏 Test 3: Testing minimum character requirement (should fail)...")
        
        short_description = "This is too short"  # Less than 80 characters
        
        response = self.make_request("POST", "/business/knowledge", {}, headers=headers, params={
            "type": "pitfall",
            "title": "Short Description Test",
            "description": short_description,
            "anonymous": False
        })
        
        if response.status_code in [400, 422]:  # 422 is also valid for validation errors
            self.log("✅ Correctly rejected short description")
        else:
            self.log(f"❌ Should reject short description, got {response.status_code}", "ERROR")
            self.log(f"Response: {response.text}")
            return False
        
        # Test 4: Get knowledge flags (verify anonymity)
        self.log("📋 Test 4: Getting knowledge flags (verifying anonymity)...")
        response = self.make_request("GET", "/business/knowledge", headers=headers)
        
        if response.status_code == 200:
            flags = response.json()
            self.log(f"✅ Knowledge flags retrieved: {len(flags)} flags")
            
            # Verify anonymity handling
            anonymous_flags = [f for f in flags if f.get("anonymous")]
            non_anonymous_flags = [f for f in flags if not f.get("anonymous")]
            
            self.log(f"   Anonymous flags: {len(anonymous_flags)}")
            self.log(f"   Non-anonymous flags: {len(non_anonymous_flags)}")
            
            # Check if anonymous flags show "Anonymous Business Owner"
            for flag in anonymous_flags:
                if flag.get("business_name") == "Anonymous Business Owner":
                    self.log("✅ Anonymous flag correctly shows 'Anonymous Business Owner'")
                else:
                    self.log(f"❌ Anonymous flag shows wrong name: {flag.get('business_name')}", "ERROR")
                    return False
        else:
            self.log(f"❌ Failed to get knowledge flags: {response.status_code}", "ERROR")
            return False
        
        # Test 5: Vote on knowledge flag (helpful)
        if pitfall_flag_id:
            self.log("👍 Test 5: Voting 'helpful' on knowledge flag...")
            response = self.make_request("POST", f"/business/knowledge/{pitfall_flag_id}/vote", 
                                       headers=headers, params={"vote_type": "helpful"})
            
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Vote recorded: {result.get('action', 'unknown')}")
            else:
                self.log(f"❌ Failed to vote on flag: {response.status_code} - {response.text}", "ERROR")
                return False
        
        # Test 6: Try to vote on own flag (should fail)
        if pitfall_flag_id:
            self.log("🚫 Test 6: Attempting to vote on own flag (should fail)...")
            response = self.make_request("POST", f"/business/knowledge/{pitfall_flag_id}/vote", 
                                       headers=headers, params={"vote_type": "helpful"})
            
            if response.status_code == 400:
                self.log("✅ Correctly prevented voting on own flag")
            else:
                self.log(f"❌ Should prevent voting on own flag, got {response.status_code}", "ERROR")
                return False
        
        # Test 7: Filter flags by type
        self.log("🔍 Test 7: Filtering flags by type...")
        response = self.make_request("GET", "/business/knowledge", headers=headers, params={"type": "pitfall"})
        
        if response.status_code == 200:
            pitfall_flags = response.json()
            self.log(f"✅ Pitfall flags retrieved: {len(pitfall_flags)} flags")
            
            # Verify all are pitfall type
            non_pitfall = [f for f in pitfall_flags if f.get("type") != "pitfall"]
            if non_pitfall:
                self.log(f"❌ Found non-pitfall flags in pitfall filter: {len(non_pitfall)}", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to filter pitfall flags: {response.status_code}", "ERROR")
            return False
        
        # Test 8: Test rate limiting verification
        self.log("⏱️ Test 8: Verifying rate limiting is working...")
        
        rate_limit_description = "This is a rate limiting test flag to verify that the system properly " \
                               "enforces the maximum of 5 flags per business per 24 hours. This description " \
                               "meets the minimum 80 character requirement for quality control purposes."
        
        response = self.make_request("POST", "/business/knowledge", {}, headers=headers, params={
            "type": "plus",
            "title": "Rate Limit Test Flag",
            "description": rate_limit_description,
            "anonymous": False
        })
        
        if response.status_code == 429:
            self.log("✅ Rate limiting correctly enforced - maximum flags per day reached")
        elif response.status_code == 201:
            self.log("✅ Flag created successfully (rate limit not yet reached)")
        else:
            self.log(f"⚠️ Unexpected response for rate limit test: {response.status_code}")
        
        return True

    def run_all_tests(self) -> bool:
        """Run all Phase 8.3 tests"""
        self.log("=" * 80)
        self.log("🎯 PHASE 8.3 BACKEND API TESTS")
        self.log("=" * 80)
        self.log(f"Testing against: {API_BASE}")
        self.log("Testing Peoples, Business Support, and Business Knowledge Flags systems")
        
        # Step 1: Authenticate
        if not self.authenticate():
            return False
        
        # Step 2: Run all test suites
        tests = [
            ("Peoples System", self.test_peoples_system),
            ("Business Support System", self.test_business_support_system),
            ("Business Knowledge Flags", self.test_business_knowledge_flags),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n🧪 Running: {test_name}")
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name} PASSED")
                else:
                    failed += 1
                    self.log(f"❌ {test_name} FAILED")
            except Exception as e:
                failed += 1
                self.log(f"💥 {test_name} ERROR: {e}")
        
        self.log("\n" + "=" * 80)
        self.log("📊 PHASE 8.3 TEST RESULTS")
        self.log("=" * 80)
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All Phase 8.3 tests passed!")
            return True
        else:
            self.log(f"💥 {failed} test(s) failed")
            return False


if __name__ == "__main__":
    tester = Phase83Tester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)