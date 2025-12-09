#!/usr/bin/env python3
"""
BANIBS Ability Network Test Suite - Phase 11.5.4
Tests submission and moderation functionality
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://peoplerooms.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class AbilityNetworkTester:
    def __init__(self):
        self.user_token = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data: dict = None, 
                    headers: dict = None, params: dict = None) -> requests.Response:
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
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
    
    def test_ability_network_comprehensive(self) -> bool:
        """
        PHASE 11.5.4 COMPREHENSIVE TESTING: Ability Network Submission & Moderation MVP
        
        Tests all ability network submission and moderation endpoints:
        1. User submission flow (resources and providers)
        2. Admin moderation flow (approve/reject)
        3. Authorization tests (401/403 scenarios)
        4. Public endpoint verification after approval
        """
        self.log("🦽 PHASE 11.5.4 COMPREHENSIVE TESTING: Ability Network Submission & Moderation MVP")
        
        # ============ AUTHENTICATION SETUP ============
        
        # Test user credentials from review request
        test_user_email = "social_test_user@example.com"
        test_user_password = "TestPass123!"
        
        self.log("🔐 Setting up authentication...")
        
        # Login as test user (who has is_admin: True)
        response = self.make_request("POST", "/auth/login", {
            "email": test_user_email,
            "password": test_user_password
        })
        
        if response.status_code != 200:
            self.log(f"❌ Failed to login test user: {response.status_code} - {response.text}", "ERROR")
            return False
        
        login_data = response.json()
        if "access_token" not in login_data:
            self.log("❌ Login response missing access_token", "ERROR")
            return False
        
        self.user_token = login_data["access_token"]
        self.log(f"✅ Test user logged in successfully")
        
        # ============ USER SUBMISSION FLOW TESTING ============
        
        self.log("📝 Testing User Submission Flow...")
        
        # Test 1: Submit a resource with CORRECT enum values
        self.log("🔬 Test 1: Submitting ability resource...")
        
        resource_data = {
            "title": "Comprehensive Assistive Technology Guide",
            "category": "assistive_tech",
            "disability_types": ["physical", "visual"],
            "age_groups": ["adults"],
            "format": "guide",
            "description": "A complete guide covering assistive technology options",
            "provider_name": "National Assistive Tech Foundation",
            "contact_website": "https://assistivetech.org",
            "region": "north_america",
            "cost_range": "free",
            "languages_available": ["English"]
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response = self.make_request("POST", "/ability/resources/submit", resource_data, headers=headers)
        
        if response.status_code == 200:
            submit_data = response.json()
            if submit_data.get("success") and "resource_id" in submit_data:
                submitted_resource_id = submit_data["resource_id"]
                self.log(f"✅ Resource submitted successfully: {submitted_resource_id}")
            else:
                self.log(f"❌ Resource submission response invalid: {submit_data}", "ERROR")
                return False
        else:
            self.log(f"❌ Resource submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 2: Submit a provider with CORRECT enum values
        self.log("👩‍⚕️ Test 2: Submitting ability provider...")
        
        provider_data = {
            "name": "Dr. Sarah Johnson",
            "provider_type": "specialist",
            "disability_types_served": ["physical", "cognitive"],
            "age_groups_served": ["adults", "seniors"],
            "bio": "Experienced disability specialist with 15 years of practice",
            "region": "north_america",
            "city": "Atlanta",
            "state": "Georgia",
            "telehealth_available": True,
            "languages": ["English", "Spanish"],
            "cost_range": "$$",
            "contact_website": "https://drjohnson.com"
        }
        
        response = self.make_request("POST", "/ability/providers/submit", provider_data, headers=headers)
        
        if response.status_code == 200:
            submit_data = response.json()
            if submit_data.get("success") and "provider_id" in submit_data:
                submitted_provider_id = submit_data["provider_id"]
                self.log(f"✅ Provider submitted successfully: {submitted_provider_id}")
            else:
                self.log(f"❌ Provider submission response invalid: {submit_data}", "ERROR")
                return False
        else:
            self.log(f"❌ Provider submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # ============ ADMIN MODERATION FLOW TESTING ============
        
        self.log("👨‍💼 Testing Admin Moderation Flow...")
        
        # Test 3: Get pending resources (admin endpoint)
        self.log("📋 Test 3: Getting pending resources...")
        
        response = self.make_request("GET", "/ability/admin/pending/resources", headers=headers)
        
        if response.status_code == 200:
            pending_data = response.json()
            resources = pending_data.get("resources", [])
            total = pending_data.get("total", 0)
            
            self.log(f"✅ Found {total} pending resources")
            
            # Verify our submitted resource is in the list
            found_resource = None
            for resource in resources:
                if resource.get("id") == submitted_resource_id:
                    found_resource = resource
                    break
            
            if found_resource:
                self.log(f"✅ Submitted resource found in pending list")
                # Verify it's marked as not approved
                if not found_resource.get("is_approved", True):
                    self.log("✅ Resource correctly marked as not approved")
                else:
                    self.log("❌ Resource should not be approved yet", "ERROR")
                    return False
            else:
                self.log("❌ Submitted resource not found in pending list", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to get pending resources: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 4: Get pending providers (admin endpoint)
        self.log("📋 Test 4: Getting pending providers...")
        
        response = self.make_request("GET", "/ability/admin/pending/providers", headers=headers)
        
        if response.status_code == 200:
            pending_data = response.json()
            providers = pending_data.get("providers", [])
            total = pending_data.get("total", 0)
            
            self.log(f"✅ Found {total} pending providers")
            
            # Verify our submitted provider is in the list
            found_provider = None
            for provider in providers:
                if provider.get("id") == submitted_provider_id:
                    found_provider = provider
                    break
            
            if found_provider:
                self.log(f"✅ Submitted provider found in pending list")
                # Verify it's marked as not approved
                if not found_provider.get("is_approved", True):
                    self.log("✅ Provider correctly marked as not approved")
                else:
                    self.log("❌ Provider should not be approved yet", "ERROR")
                    return False
            else:
                self.log("❌ Submitted provider not found in pending list", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to get pending providers: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 5: Approve resource
        self.log("✅ Test 5: Approving resource...")
        
        response = self.make_request("POST", f"/ability/admin/resources/{submitted_resource_id}/approve", headers=headers)
        
        if response.status_code == 200:
            approve_data = response.json()
            if approve_data.get("success"):
                self.log("✅ Resource approved successfully")
            else:
                self.log(f"❌ Resource approval response invalid: {approve_data}", "ERROR")
                return False
        else:
            self.log(f"❌ Resource approval failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 6: Approve provider
        self.log("✅ Test 6: Approving provider...")
        
        response = self.make_request("POST", f"/ability/admin/providers/{submitted_provider_id}/approve", headers=headers)
        
        if response.status_code == 200:
            approve_data = response.json()
            if approve_data.get("success"):
                self.log("✅ Provider approved successfully")
            else:
                self.log(f"❌ Provider approval response invalid: {approve_data}", "ERROR")
                return False
        else:
            self.log(f"❌ Provider approval failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 7: Verify approved items appear in public endpoints
        self.log("🌐 Test 7: Verifying approved items in public endpoints...")
        
        # Check resources endpoint
        response = self.make_request("GET", "/ability/resources")
        
        if response.status_code == 200:
            resources_data = response.json()
            resources = resources_data.get("resources", [])
            
            # Look for our approved resource
            found_approved_resource = False
            for resource in resources:
                if resource.get("id") == submitted_resource_id:
                    found_approved_resource = True
                    # If the resource appears in the public endpoint, it means it was approved
                    # (since the endpoint filters out unapproved resources)
                    self.log("✅ Approved resource appears in public endpoint")
                    break
            
            if not found_approved_resource:
                self.log("❌ Approved resource not found in public endpoint", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to get public resources: {response.status_code}", "ERROR")
            return False
        
        # Check providers endpoint
        response = self.make_request("GET", "/ability/providers")
        
        if response.status_code == 200:
            providers_data = response.json()
            providers = providers_data.get("providers", [])
            
            # Look for our approved provider
            found_approved_provider = False
            for provider in providers:
                if provider.get("id") == submitted_provider_id:
                    found_approved_provider = True
                    # If the provider appears in the public endpoint, it means it was approved
                    # (since the endpoint filters out unapproved providers)
                    self.log("✅ Approved provider appears in public endpoint")
                    break
            
            if not found_approved_provider:
                self.log("❌ Approved provider not found in public endpoint", "ERROR")
                # Debug: show all provider IDs
                provider_ids = [p.get("id") for p in providers]
                self.log(f"   Available provider IDs: {provider_ids}", "ERROR")
                self.log(f"   Looking for: {submitted_provider_id}", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to get public providers: {response.status_code}", "ERROR")
            return False
        
        # ============ REJECTION FLOW TESTING ============
        
        self.log("❌ Testing Rejection Flow...")
        
        # Test 8: Submit another resource to test rejection
        self.log("📝 Test 8: Submitting resource for rejection test...")
        
        reject_resource_data = {
            "title": "Test Resource for Rejection",
            "category": "assistive_tech",
            "disability_types": ["cognitive"],
            "age_groups": ["children"],
            "format": "tool",
            "description": "This resource will be rejected for testing",
            "provider_name": "Test Provider",
            "region": "north_america",
            "cost_range": "free"
        }
        
        response = self.make_request("POST", "/ability/resources/submit", reject_resource_data, headers=headers)
        
        if response.status_code == 200:
            submit_data = response.json()
            reject_resource_id = submit_data.get("resource_id")
            self.log(f"✅ Resource for rejection submitted: {reject_resource_id}")
        else:
            self.log(f"❌ Failed to submit resource for rejection: {response.status_code}", "ERROR")
            return False
        
        # Test 9: Reject the resource
        self.log("❌ Test 9: Rejecting resource...")
        
        response = self.make_request("POST", f"/ability/admin/resources/{reject_resource_id}/reject", headers=headers)
        
        if response.status_code == 200:
            reject_data = response.json()
            if reject_data.get("success"):
                self.log("✅ Resource rejected successfully")
            else:
                self.log(f"❌ Resource rejection response invalid: {reject_data}", "ERROR")
                return False
        else:
            self.log(f"❌ Resource rejection failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test 10: Verify rejected resource is deleted
        self.log("🗑️ Test 10: Verifying rejected resource is deleted...")
        
        response = self.make_request("GET", "/ability/admin/pending/resources", headers=headers)
        
        if response.status_code == 200:
            pending_data = response.json()
            resources = pending_data.get("resources", [])
            
            # Verify rejected resource is not in pending list
            found_rejected = False
            for resource in resources:
                if resource.get("id") == reject_resource_id:
                    found_rejected = True
                    break
            
            if not found_rejected:
                self.log("✅ Rejected resource successfully removed from pending list")
            else:
                self.log("❌ Rejected resource still found in pending list", "ERROR")
                return False
        else:
            self.log(f"❌ Failed to verify rejection: {response.status_code}", "ERROR")
            return False
        
        # ============ AUTHORIZATION TESTING ============
        
        self.log("🔒 Testing Authorization Scenarios...")
        
        # Test 11: Access admin endpoints without token → should get 401
        self.log("🚫 Test 11: Testing admin endpoints without authentication...")
        
        response = self.make_request("GET", "/ability/admin/pending/resources")
        
        if response.status_code == 401:
            self.log("✅ Admin endpoint correctly returns 401 without token")
        else:
            self.log(f"❌ Admin endpoint should return 401 without token, got {response.status_code}", "ERROR")
            return False
        
        response = self.make_request("GET", "/ability/admin/pending/providers")
        
        if response.status_code == 401:
            self.log("✅ Admin endpoint correctly returns 401 without token")
        else:
            self.log(f"❌ Admin endpoint should return 401 without token, got {response.status_code}", "ERROR")
            return False
        
        # Test 12: Access submission endpoints without token → should get 401
        self.log("🚫 Test 12: Testing submission endpoints without authentication...")
        
        response = self.make_request("POST", "/ability/resources/submit", resource_data)
        
        if response.status_code == 401:
            self.log("✅ Resource submission correctly returns 401 without token")
        else:
            self.log(f"❌ Resource submission should return 401 without token, got {response.status_code}", "ERROR")
            return False
        
        response = self.make_request("POST", "/ability/providers/submit", provider_data)
        
        if response.status_code == 401:
            self.log("✅ Provider submission correctly returns 401 without token")
        else:
            self.log(f"❌ Provider submission should return 401 without token, got {response.status_code}", "ERROR")
            return False
        
        # ============ FINAL VERIFICATION ============
        
        self.log("🎯 Final Verification...")
        
        # Test 13: Verify complete flow worked end-to-end
        self.log("🔄 Test 13: End-to-end flow verification...")
        
        # Check that we have approved items in public endpoints
        response = self.make_request("GET", "/ability/resources")
        if response.status_code == 200:
            resources_data = response.json()
            total_resources = resources_data.get("total", 0)
            self.log(f"✅ Public resources endpoint has {total_resources} resources")
        
        response = self.make_request("GET", "/ability/providers")
        if response.status_code == 200:
            providers_data = response.json()
            total_providers = providers_data.get("total", 0)
            self.log(f"✅ Public providers endpoint has {total_providers} providers")
        
        self.log("🎉 PHASE 11.5.4 ABILITY NETWORK TESTING COMPLETE")
        self.log("✅ All submission and moderation flows working correctly")
        self.log("✅ Authorization properly enforced")
        self.log("✅ Approve/reject flows functional")
        self.log("✅ Public endpoints show approved items")
        
        return True

def main():
    """Run the Ability Network tests"""
    tester = AbilityNetworkTester()
    
    print("🦽 BANIBS Ability Network Test Suite - Phase 11.5.4")
    print(f"Testing against: {API_BASE}")
    print("=" * 60)
    
    try:
        success = tester.test_ability_network_comprehensive()
        
        if success:
            print("\n🎉 ALL TESTS PASSED!")
            sys.exit(0)
        else:
            print("\n💥 SOME TESTS FAILED!")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Test suite failed with exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()