#!/usr/bin/env python3
"""
BANIBS Backend API Test Suite - Phase 2.9
Tests authentication, contributor endpoints, admin endpoints, and public endpoints
"""

import requests
import json
import sys
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://banibs-edit.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BanibsAPITester:
    def __init__(self):
        self.admin_token = None
        self.contributor_token = None
        self.test_opportunity_id = None
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
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
            
    def test_admin_login(self) -> bool:
        """Test admin login with admin@banibs.com / admin123"""
        self.log("Testing admin login...")
        
        response = self.make_request("POST", "/auth/login", {
            "email": "admin@banibs.com",
            "password": "BanibsAdmin#2025"
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.admin_token = data["access_token"]
                self.log("✅ Admin login successful")
                return True
            else:
                self.log("❌ Admin login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ Admin login failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_contributor_register(self) -> bool:
        """Test contributor registration"""
        self.log("Testing contributor registration...")
        
        response = self.make_request("POST", "/auth/contributor/register", {
            "email": "test@example.com",
            "password": "test123",
            "name": "Test User",
            "organization": "Test Organization"
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "contributor" in data:
                self.log("✅ Contributor registration successful")
                return True
            else:
                self.log("❌ Contributor registration response missing required fields", "ERROR")
                return False
        elif response.status_code == 400:
            # User might already exist, try login instead
            self.log("Contributor already exists, will test login instead")
            return True
        else:
            self.log(f"❌ Contributor registration failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_contributor_login(self) -> bool:
        """Test contributor login"""
        self.log("Testing contributor login...")
        
        response = self.make_request("POST", "/auth/contributor/login", {
            "email": "test@example.com",
            "password": "test123"
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.contributor_token = data["access_token"]
                self.log("✅ Contributor login successful")
                return True
            else:
                self.log("❌ Contributor login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ Contributor login failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_submit_opportunity(self) -> bool:
        """Test submitting opportunity with contributor JWT"""
        if not self.contributor_token:
            self.log("❌ No contributor token available for opportunity submission", "ERROR")
            return False
            
        self.log("Testing opportunity submission...")
        
        headers = {"Authorization": f"Bearer {self.contributor_token}"}
        
        response = self.make_request("POST", "/opportunities/submit", {
            "title": "Test Event",
            "orgName": "Test Org",
            "type": "event",
            "description": "Test description for event opportunity",
            "location": "Remote"
        }, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            if "id" in data and "status" in data:
                self.test_opportunity_id = data["id"]
                self.log(f"✅ Opportunity submitted successfully with ID: {self.test_opportunity_id}")
                return True
            else:
                self.log("❌ Opportunity submission response missing required fields", "ERROR")
                return False
        else:
            self.log(f"❌ Opportunity submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_analytics_endpoint(self) -> bool:
        """Test analytics endpoint with admin JWT"""
        if not self.admin_token:
            self.log("❌ No admin token available for analytics", "ERROR")
            return False
            
        self.log("Testing analytics endpoint...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", "/opportunities/analytics", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["status_counts", "type_counts"]
            
            if all(field in data for field in required_fields):
                status_counts = data["status_counts"]
                type_counts = data["type_counts"]
                
                # Verify status counts structure
                status_fields = ["pending", "approved", "rejected", "featured"]
                if all(field in status_counts for field in status_fields):
                    self.log(f"✅ Analytics endpoint working - Status counts: {status_counts}")
                    
                    # Verify type counts structure
                    type_fields = ["jobs", "grants", "scholarships", "training", "events"]
                    if all(field in type_counts for field in type_fields):
                        self.log(f"✅ Analytics type counts: {type_counts}")
                        return True
                    else:
                        self.log("❌ Analytics missing required type count fields", "ERROR")
                        return False
                else:
                    self.log("❌ Analytics missing required status count fields", "ERROR")
                    return False
            else:
                self.log("❌ Analytics response missing required fields", "ERROR")
                return False
        else:
            self.log(f"❌ Analytics endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_pending_opportunities(self) -> bool:
        """Test pending opportunities endpoint with admin JWT"""
        if not self.admin_token:
            self.log("❌ No admin token available for pending opportunities", "ERROR")
            return False
            
        self.log("Testing pending opportunities endpoint...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", "/opportunities/pending", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Pending opportunities endpoint working - Found {len(data)} pending opportunities")
                
                # Check if our submitted opportunity is in the list
                if self.test_opportunity_id:
                    found_opportunity = None
                    for opp in data:
                        if opp.get("id") == self.test_opportunity_id:
                            found_opportunity = opp
                            break
                            
                    if found_opportunity:
                        # Verify contributorEmail is populated
                        if "contributor_email" in found_opportunity:
                            self.log(f"✅ Submitted opportunity found with contributor email: {found_opportunity['contributor_email']}")
                        else:
                            self.log("❌ Submitted opportunity missing contributor_email field", "ERROR")
                            return False
                    else:
                        self.log("⚠️ Submitted opportunity not found in pending list (might be processed already)")
                        
                return True
            else:
                self.log("❌ Pending opportunities response is not a list", "ERROR")
                return False
        else:
            self.log(f"❌ Pending opportunities endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_moderation_with_notes(self) -> bool:
        """Test moderation endpoint with notes"""
        if not self.admin_token or not self.test_opportunity_id:
            self.log("❌ No admin token or opportunity ID available for moderation", "ERROR")
            return False
            
        self.log("Testing moderation with notes...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("PATCH", f"/opportunities/{self.test_opportunity_id}/approve", {
            "notes": "Looks great!"
        }, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "approved" in data:
                if data["approved"] == True:
                    self.log("✅ Opportunity approved successfully with notes")
                    return True
                else:
                    self.log("❌ Opportunity not marked as approved", "ERROR")
                    return False
            else:
                self.log("❌ Moderation response missing required fields", "ERROR")
                return False
        else:
            self.log(f"❌ Moderation failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_public_opportunities(self) -> bool:
        """Test public opportunities endpoint with type filter"""
        self.log("Testing public opportunities with event filter...")
        
        response = self.make_request("GET", "/opportunities/", params={"type": "event"})
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Public opportunities endpoint working - Found {len(data)} event opportunities")
                
                # Verify all returned opportunities are events
                non_events = [opp for opp in data if opp.get("type") != "event"]
                if non_events:
                    self.log(f"❌ Found {len(non_events)} non-event opportunities in event filter", "ERROR")
                    return False
                else:
                    self.log("✅ All returned opportunities are events")
                    return True
            else:
                self.log("❌ Public opportunities response is not a list", "ERROR")
                return False
        else:
            self.log(f"❌ Public opportunities endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_featured_opportunities(self) -> bool:
        """Test featured opportunities endpoint"""
        self.log("Testing featured opportunities endpoint...")
        
        response = self.make_request("GET", "/opportunities/featured")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Featured opportunities endpoint working - Found {len(data)} featured opportunities")
                
                # Verify all returned opportunities are featured
                non_featured = [opp for opp in data if not opp.get("featured", False)]
                if non_featured:
                    self.log(f"❌ Found {len(non_featured)} non-featured opportunities in featured endpoint", "ERROR")
                    return False
                else:
                    self.log("✅ All returned opportunities are featured")
                    return True
            else:
                self.log("❌ Featured opportunities response is not a list", "ERROR")
                return False
        else:
            self.log(f"❌ Featured opportunities endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_jwt_validation(self) -> bool:
        """Test that protected endpoints require JWT tokens"""
        self.log("Testing JWT validation on protected endpoints...")
        
        # Test analytics without token
        response = self.make_request("GET", "/opportunities/analytics")
        if response.status_code != 401:
            self.log(f"❌ Analytics endpoint should require authentication, got {response.status_code}", "ERROR")
            return False
            
        # Test pending without token
        response = self.make_request("GET", "/opportunities/pending")
        if response.status_code != 401:
            self.log(f"❌ Pending endpoint should require authentication, got {response.status_code}", "ERROR")
            return False
            
        # Test submit without token
        response = self.make_request("POST", "/opportunities/submit", {
            "title": "Test",
            "orgName": "Test",
            "type": "job",
            "description": "Test"
        })
        if response.status_code != 401:
            self.log(f"❌ Submit endpoint should require authentication, got {response.status_code}", "ERROR")
            return False
            
        self.log("✅ JWT validation working correctly")
        return True
        
    def run_all_tests(self) -> bool:
        """Run all tests in sequence"""
        self.log("Starting BANIBS Backend API Test Suite - Phase 2.9")
        self.log(f"Testing against: {API_BASE}")
        
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Contributor Register", self.test_contributor_register),
            ("Contributor Login", self.test_contributor_login),
            ("Submit Opportunity", self.test_submit_opportunity),
            ("Analytics Endpoint", self.test_analytics_endpoint),
            ("Pending Opportunities", self.test_pending_opportunities),
            ("Moderation with Notes", self.test_moderation_with_notes),
            ("Public Opportunities", self.test_public_opportunities),
            ("Featured Opportunities", self.test_featured_opportunities),
            ("JWT Validation", self.test_jwt_validation),
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
                
        self.log(f"\n=== TEST RESULTS ===")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All tests passed!")
            return True
        else:
            self.log(f"💥 {failed} test(s) failed")
            return False

if __name__ == "__main__":
    tester = BanibsAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)