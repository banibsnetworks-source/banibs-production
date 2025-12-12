#!/usr/bin/env python3
"""
Business Verification System - Phase 1A E2E Testing
Tests all backend API endpoints for business verification
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://reveal-library.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BusinessVerificationTester:
    def __init__(self):
        self.admin_token = None
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
            
    def test_admin_login(self) -> bool:
        """Test admin login with admin@banibs.com / BanibsAdmin#2025"""
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
    
    def test_business_verification_status_endpoint(self) -> bool:
        """Test GET /api/business/verification/status/{businessId}"""
        self.log("🏢 BUSINESS VERIFICATION STATUS TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available for verification status test", "ERROR")
            return False
        
        # Use a test business ID
        test_business_id = "test-business-123"
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", f"/business/verification/status/{test_business_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["is_verified", "status", "documents_uploaded"]
            
            if all(field in data for field in required_fields):
                self.log(f"✅ Verification status endpoint working")
                self.log(f"   Status: {data['status']}")
                self.log(f"   Is Verified: {data['is_verified']}")
                self.log(f"   Documents: {data['documents_uploaded']}")
                return True
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Verification status missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Verification status failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_business_verification_upload_endpoint(self) -> bool:
        """Test POST /api/business/verification/{businessId}/upload"""
        self.log("📄 BUSINESS VERIFICATION UPLOAD TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available for verification upload test", "ERROR")
            return False
        
        # Create a test file content (simple text file for testing)
        test_file_content = b"Test EIN Document Content - This is a test document for verification"
        test_business_id = "test-business-123"
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Prepare multipart form data
        files = {
            'file': ('test_ein.txt', test_file_content, 'text/plain')
        }
        data = {
            'document_type': 'EIN'
        }
        
        # Remove Content-Type header to let requests handle multipart
        upload_headers = headers.copy()
        if 'Content-Type' in upload_headers:
            del upload_headers['Content-Type']
        
        try:
            url = f"{API_BASE}/business/verification/{test_business_id}/upload"
            response = self.session.post(url, files=files, data=data, headers=upload_headers)
            
            self.log(f"POST /business/verification/{test_business_id}/upload -> {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["success", "message", "verification_status", "document_count"]
                
                if all(field in data for field in required_fields):
                    if data["success"]:
                        self.log(f"✅ Document upload successful")
                        self.log(f"   Message: {data['message']}")
                        self.log(f"   Status: {data['verification_status']}")
                        self.log(f"   Documents: {data['document_count']}")
                        return True
                    else:
                        self.log(f"❌ Upload marked as failed: {data}", "ERROR")
                        return False
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log(f"❌ Upload response missing fields: {missing_fields}", "ERROR")
                    return False
            else:
                self.log(f"❌ Document upload failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Document upload exception: {e}", "ERROR")
            return False
    
    def test_business_verification_admin_list_endpoint(self) -> bool:
        """Test GET /api/business/verification/admin/list"""
        self.log("📋 BUSINESS VERIFICATION ADMIN LIST TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available for admin list test", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test with pending status filter
        response = self.make_request("GET", "/business/verification/admin/list", 
                                   headers=headers, params={"status": "pending"})
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["verifications", "count"]
            
            if all(field in data for field in required_fields):
                verifications = data["verifications"]
                count = data["count"]
                
                self.log(f"✅ Admin list endpoint working")
                self.log(f"   Found {count} pending verifications")
                
                # Check structure of verification items if any exist
                if verifications and len(verifications) > 0:
                    verification = verifications[0]
                    verification_fields = ["business_id", "business_name", "verification_status", "documents", "created_at"]
                    
                    if all(field in verification for field in verification_fields):
                        self.log(f"   Sample verification: {verification['business_name']} ({verification['verification_status']})")
                        return True
                    else:
                        missing_fields = [field for field in verification_fields if field not in verification]
                        self.log(f"❌ Verification item missing fields: {missing_fields}", "ERROR")
                        return False
                else:
                    self.log("   No pending verifications found (expected for clean test)")
                    return True
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Admin list response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Admin list failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_business_verification_admin_review_endpoint(self) -> bool:
        """Test POST /api/business/verification/admin/review/{businessId}"""
        self.log("✅ BUSINESS VERIFICATION ADMIN REVIEW TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available for admin review test", "ERROR")
            return False
        
        test_business_id = "test-business-123"
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test approval action
        review_data = {
            "action": "verified",
            "notes": "Approved via automated test - documents look good"
        }
        
        response = self.make_request("POST", f"/business/verification/admin/review/{test_business_id}", 
                                   data=review_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["success", "message", "verification"]
            
            if all(field in data for field in required_fields):
                if data["success"]:
                    self.log(f"✅ Verification approval successful")
                    self.log(f"   Message: {data['message']}")
                    
                    # Check verification object structure
                    verification = data["verification"]
                    if "verification_status" in verification:
                        self.log(f"   New Status: {verification['verification_status']}")
                        return True
                    else:
                        self.log("❌ Verification object missing status", "ERROR")
                        return False
                else:
                    self.log(f"❌ Review marked as failed: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Review response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Admin review failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_business_verification_admin_document_download(self) -> bool:
        """Test GET /api/business/verification/admin/document/{businessId}/{docIndex}"""
        self.log("📥 BUSINESS VERIFICATION DOCUMENT DOWNLOAD TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available for document download test", "ERROR")
            return False
        
        test_business_id = "test-business-123"
        doc_index = 0
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", f"/business/verification/admin/document/{test_business_id}/{doc_index}", 
                                   headers=headers)
        
        if response.status_code == 404:
            # Expected for non-existent business/document
            self.log("✅ Document download endpoint working (404 for non-existent document)")
            return True
        elif response.status_code == 200:
            # If document exists, check response headers
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if content_disposition and 'attachment' in content_disposition:
                self.log("✅ Document download successful with proper headers")
                self.log(f"   Content-Type: {content_type}")
                self.log(f"   Content-Disposition: {content_disposition}")
                return True
            else:
                self.log("❌ Document download missing proper headers", "ERROR")
                return False
        else:
            self.log(f"❌ Document download failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_business_verification_authentication_scenarios(self) -> bool:
        """Test authentication requirements for verification endpoints"""
        self.log("🔐 BUSINESS VERIFICATION AUTHENTICATION TEST")
        
        test_business_id = "test-business-123"
        
        # Test 1: Status endpoint without auth → Should return 401
        response = self.make_request("GET", f"/business/verification/status/{test_business_id}")
        if response.status_code != 401:
            self.log(f"❌ Status endpoint should require auth, got {response.status_code}", "ERROR")
            return False
        
        # Test 2: Admin list without auth → Should return 401
        response = self.make_request("GET", "/business/verification/admin/list")
        if response.status_code != 401:
            self.log(f"❌ Admin list should require auth, got {response.status_code}", "ERROR")
            return False
        
        # Test 3: Admin review without auth → Should return 401
        response = self.make_request("POST", f"/business/verification/admin/review/{test_business_id}", 
                                   data={"action": "verified", "notes": "test"})
        if response.status_code != 401:
            self.log(f"❌ Admin review should require auth, got {response.status_code}", "ERROR")
            return False
        
        # Test 4: Document download without auth → Should return 401
        response = self.make_request("GET", f"/business/verification/admin/document/{test_business_id}/0")
        if response.status_code != 401:
            self.log(f"❌ Document download should require auth, got {response.status_code}", "ERROR")
            return False
        
        self.log("✅ All verification endpoints properly require authentication")
        return True
    
    def run_all_tests(self) -> bool:
        """Run all business verification tests"""
        self.log("🏢 BUSINESS VERIFICATION SYSTEM - PHASE 1A E2E TESTING")
        self.log(f"Testing against: {API_BASE}")
        self.log("=" * 80)
        
        tests = [
            # Authentication Setup
            ("Admin Login", self.test_admin_login),
            
            # Business Verification System - Phase 1A
            ("Verification Status Endpoint", self.test_business_verification_status_endpoint),
            ("Document Upload Endpoint", self.test_business_verification_upload_endpoint),
            ("Admin List Endpoint", self.test_business_verification_admin_list_endpoint),
            ("Admin Review Endpoint", self.test_business_verification_admin_review_endpoint),
            ("Document Download Endpoint", self.test_business_verification_admin_document_download),
            ("Authentication Requirements", self.test_business_verification_authentication_scenarios),
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
        self.log("📊 BUSINESS VERIFICATION TEST RESULTS")
        self.log("=" * 80)
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All Business Verification tests passed!")
            return True
        else:
            self.log(f"💥 {failed} test(s) failed")
            return False

if __name__ == "__main__":
    tester = BusinessVerificationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)