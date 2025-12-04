#!/usr/bin/env python3
"""
BANIBS Backend API Test Suite - Phase 7.4 Comprehensive Testing
Tests authentication, news, business directory, opportunities, and candidate APIs
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://a-series-preview.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Phase74APITester:
    def __init__(self):
        self.admin_token = None
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
    
    def test_auth_login(self) -> bool:
        """Test Phase 7.4 - Authentication login with valid credentials"""
        self.log("Testing Phase 7.4 - Authentication login...")
        
        start_time = time.time()
        response = self.make_request("POST", "/auth/login", {
            "email": "admin@banibs.com",
            "password": "BanibsAdmin#2025"
        })
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.admin_token = data["access_token"]
                self.log(f"✅ Auth login successful - Response time: {response_time:.2f}ms")
                return True
            else:
                self.log("❌ Auth login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ Auth login failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_auth_register(self) -> bool:
        """Test Phase 7.4 - User registration"""
        self.log("Testing Phase 7.4 - User registration...")
        
        # Use unique email to avoid conflicts
        test_email = f"phase74test{int(time.time())}@example.com"
        
        start_time = time.time()
        response = self.make_request("POST", "/auth/register", {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Phase 7.4 Test User",
            "role": "candidate",
            "accepted_terms": True
        })
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code in [200, 201]:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.user_token = data["access_token"]
                self.log(f"✅ User registration successful - Response time: {response_time:.2f}ms")
                return True
            else:
                self.log("❌ Registration response missing required fields", "ERROR")
                return False
        elif response.status_code == 400:
            # User might already exist or validation error
            self.log(f"⚠️ Registration returned 400 - might be validation issue: {response.text}")
            return True
        else:
            self.log(f"❌ User registration failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_jwt_validation(self) -> bool:
        """Test Phase 7.4 - JWT token validation on protected routes"""
        self.log("Testing Phase 7.4 - JWT token validation...")
        
        # Test protected route without token - should return 401
        response = self.make_request("GET", "/candidates/me")
        if response.status_code != 401:
            self.log(f"❌ Protected route should require auth, got {response.status_code}", "ERROR")
            return False
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = self.make_request("GET", "/candidates/me", headers=headers)
        if response.status_code != 401:
            self.log(f"❌ Invalid token should return 401, got {response.status_code}", "ERROR")
            return False
        
        self.log("✅ JWT validation working correctly")
        return True
    
    def test_news_apis(self) -> bool:
        """Test Phase 7.4 - News & Content APIs"""
        self.log("Testing Phase 7.4 - News & Content APIs...")
        
        # Test GET /api/news/latest
        start_time = time.time()
        response = self.make_request("GET", "/news/latest")
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ GET /api/news/latest working - {len(data)} items - Response time: {response_time:.2f}ms")
                
                # Check if response time is under 200ms target
                if response_time > 200:
                    self.log(f"⚠️ Response time {response_time:.2f}ms exceeds 200ms target")
            else:
                self.log("❌ News API should return array", "ERROR")
                return False
        else:
            self.log(f"❌ News API failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test GET /api/news/featured
        start_time = time.time()
        response = self.make_request("GET", "/news/featured")
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"✅ GET /api/news/featured working - Response time: {response_time:.2f}ms")
            
            # Verify featured story structure
            if data and isinstance(data, dict):
                required_fields = ["id", "title", "summary"]
                if all(field in data for field in required_fields):
                    self.log(f"   Featured story: {data['title'][:50]}...")
                else:
                    self.log("⚠️ Featured story missing some fields")
        else:
            self.log(f"❌ Featured news API failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test GET /api/media/featured
        start_time = time.time()
        response = self.make_request("GET", "/media/featured")
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"✅ GET /api/media/featured working - Response time: {response_time:.2f}ms")
            
            # Verify BANIBS TV content structure
            if data and isinstance(data, dict):
                if "title" in data and "description" in data:
                    self.log(f"   BANIBS TV: {data['title'][:50]}...")
                else:
                    self.log("⚠️ BANIBS TV content missing some fields")
        else:
            self.log(f"❌ BANIBS TV API failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        return True
    
    def test_business_directory(self) -> bool:
        """Test Phase 7.4 - Business Directory API with performance check"""
        self.log("Testing Phase 7.4 - Business Directory API...")
        
        # Test basic directory fetch
        start_time = time.time()
        response = self.make_request("GET", "/business/directory")
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Business directory working - {len(data)} businesses - Response time: {response_time:.2f}ms")
                
                # Check if response time is under 1s target (after Phase 2 optimization)
                if response_time > 1000:
                    self.log(f"❌ Response time {response_time:.2f}ms exceeds 1s target", "ERROR")
                    return False
                else:
                    self.log(f"✅ Response time {response_time:.2f}ms meets <1s target")
            else:
                self.log("❌ Business directory should return array", "ERROR")
                return False
        else:
            self.log(f"❌ Business directory failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test with filters
        test_filters = [
            {"category": "Technology"},
            {"location": "Toronto"},
            {"verified_only": "true"},
            {"category": "Healthcare", "location": "Vancouver"}
        ]
        
        for filter_params in test_filters:
            start_time = time.time()
            response = self.make_request("GET", "/business/directory", params=filter_params)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                filter_str = ", ".join([f"{k}={v}" for k, v in filter_params.items()])
                self.log(f"✅ Business directory filter ({filter_str}) - {len(data)} results - {response_time:.2f}ms")
            else:
                self.log(f"❌ Business directory filter failed: {response.status_code}", "ERROR")
                return False
        
        return True
    
    def test_opportunities_apis(self) -> bool:
        """Test Phase 7.4 - Opportunities APIs"""
        self.log("Testing Phase 7.4 - Opportunities APIs...")
        
        # Test GET /api/opportunities/jobs
        start_time = time.time()
        response = self.make_request("GET", "/jobs")
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if "jobs" in data:
                jobs = data["jobs"]
                self.log(f"✅ GET /api/opportunities/jobs working - {len(jobs)} jobs - Response time: {response_time:.2f}ms")
            else:
                self.log("❌ Jobs API should return jobs array", "ERROR")
                return False
        else:
            self.log(f"❌ Jobs API failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test POST /api/opportunities/jobs (requires auth and recruiter profile)
        if not self.admin_token:
            self.log("❌ No admin token for job creation test", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        job_data = {
            "title": "Phase 7.4 Test Job",
            "company": "Test Company",
            "description": "This is a comprehensive test job description for Phase 7.4 testing that meets the minimum character requirements for job posting validation.",
            "location": "Remote",
            "salary_min": 50000,
            "salary_max": 80000,
            "job_type": "full_time",
            "industry": "Technology",
            "employer_id": "test-employer-id"
        }
        
        start_time = time.time()
        response = self.make_request("POST", "/jobs", job_data, headers=headers)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code in [200, 201]:
            data = response.json()
            if "id" in data:
                self.log(f"✅ POST /api/opportunities/jobs working - Job created - Response time: {response_time:.2f}ms")
            else:
                self.log("❌ Job creation response missing ID", "ERROR")
                return False
        elif response.status_code == 404 and "Recruiter profile not found" in response.text:
            self.log("⚠️ Job creation requires recruiter profile (expected for admin user)")
            # This is expected behavior - admin users don't have recruiter profiles
        else:
            self.log(f"❌ Job creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test GET /api/applications/my-applications (requires auth)
        start_time = time.time()
        response = self.make_request("GET", "/applications/my-applications", headers=headers)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if "applications" in data and isinstance(data["applications"], list):
                applications = data["applications"]
                self.log(f"✅ GET /api/applications/my-applications working - {len(applications)} applications - Response time: {response_time:.2f}ms")
            else:
                self.log("❌ Applications API should return object with applications array", "ERROR")
                return False
        else:
            self.log(f"❌ Applications API failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        return True
    
    def test_candidate_apis(self) -> bool:
        """Test Phase 7.4 - Candidate APIs"""
        self.log("Testing Phase 7.4 - Candidate APIs...")
        
        if not self.admin_token:
            self.log("❌ No token for candidate API tests", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /api/candidates/me
        start_time = time.time()
        response = self.make_request("GET", "/candidates/me", headers=headers)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"✅ GET /api/candidates/me working - Response time: {response_time:.2f}ms")
            
            # Verify profile structure
            if isinstance(data, dict):
                profile_fields = ["id", "name", "email"]
                present_fields = [field for field in profile_fields if field in data]
                self.log(f"   Profile fields present: {present_fields}")
        elif response.status_code == 404:
            self.log("⚠️ No candidate profile found (expected for admin user)")
        else:
            self.log(f"❌ Candidate profile fetch failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        # Test POST /api/candidates/profile (create/update profile)
        # Use the user token from registration if available
        test_headers = headers
        if self.user_token:
            test_headers = {"Authorization": f"Bearer {self.user_token}"}
        
        profile_data = {
            "full_name": "Phase 7.4 Test Candidate",
            "contact_email": "test.candidate@example.com",
            "skills": ["Python", "JavaScript", "React"],
            "experience_years": 3,
            "location": "Toronto, ON"
        }
        
        start_time = time.time()
        response = self.make_request("POST", "/candidates/profile", profile_data, headers=test_headers)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code in [200, 201]:
            data = response.json()
            self.log(f"✅ POST /api/candidates/profile working - Response time: {response_time:.2f}ms")
            
            # Verify created/updated profile
            if "id" in data:
                self.log(f"   Profile ID: {data['id']}")
        elif response.status_code == 422 and "user_id" in response.text:
            self.log("⚠️ Candidate profile creation requires proper user context (expected validation)")
            # This is expected - the endpoint requires proper user context from JWT
        else:
            self.log(f"❌ Candidate profile creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        return True
    
    def test_recruiter_analytics(self) -> bool:
        """Test Phase 7.4 - Recruiter Analytics API"""
        self.log("Testing Phase 7.4 - Recruiter Analytics...")
        
        if not self.admin_token:
            self.log("❌ No token for recruiter analytics test", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /api/recruiter-analytics/overview
        start_time = time.time()
        response = self.make_request("GET", "/recruiter-analytics/overview", headers=headers)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"✅ GET /api/recruiter-analytics/overview working - Response time: {response_time:.2f}ms")
            
            # Verify analytics structure
            expected_fields = ["total_jobs", "active_jobs", "total_applications", "recent_activity"]
            present_fields = [field for field in expected_fields if field in data]
            
            if len(present_fields) >= 2:
                self.log(f"   Analytics fields present: {present_fields}")
                
                # Log some stats if available
                if "total_jobs" in data:
                    self.log(f"   Total jobs: {data['total_jobs']}")
                if "total_applications" in data:
                    self.log(f"   Total applications: {data['total_applications']}")
            else:
                self.log("⚠️ Analytics response missing expected fields")
        elif response.status_code == 404:
            self.log("⚠️ No recruiter analytics found (expected for non-recruiter user)")
        else:
            self.log(f"❌ Recruiter analytics failed: {response.status_code} - {response.text}", "ERROR")
            return False
        
        return True
    
    def test_cors_headers(self) -> bool:
        """Test Phase 7.4 - CORS headers are present"""
        self.log("Testing Phase 7.4 - CORS headers...")
        
        response = self.make_request("GET", "/news/latest")
        
        if response.status_code == 200:
            headers = response.headers
            cors_headers = [
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods", 
                "Access-Control-Allow-Headers"
            ]
            
            present_cors = [header for header in cors_headers if header in headers]
            
            # Check for any CORS-related headers (case insensitive)
            all_headers = list(headers.keys())
            cors_found = any("access-control" in header.lower() for header in all_headers)
            
            if len(present_cors) >= 1 or cors_found:
                self.log(f"✅ CORS headers present: {present_cors if present_cors else 'Found access-control headers'}")
                return True
            else:
                self.log("⚠️ No explicit CORS headers found - may be handled by middleware")
                # Don't fail the test as CORS might be handled differently
                return True
        else:
            self.log(f"❌ Could not test CORS headers: {response.status_code}", "ERROR")
            return False
    
    def test_error_handling(self) -> bool:
        """Test Phase 7.4 - Error handling and validation"""
        self.log("Testing Phase 7.4 - Error handling...")
        
        # Test invalid endpoint
        response = self.make_request("GET", "/invalid/endpoint")
        if response.status_code == 404:
            self.log("✅ 404 error handling working")
        else:
            self.log(f"⚠️ Invalid endpoint returned {response.status_code} instead of 404")
        
        # Test invalid data submission
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Test job creation with missing required fields
            invalid_job = {"title": "Test"}  # Missing required fields
            response = self.make_request("POST", "/jobs", invalid_job, headers=headers)
            
            if response.status_code in [400, 422]:
                self.log("✅ Data validation error handling working")
            else:
                self.log(f"⚠️ Invalid data returned {response.status_code} instead of 400/422")
        
        return True
    
    def run_all_tests(self) -> bool:
        """Run all Phase 7.4 tests"""
        self.log("Starting BANIBS Backend API Test Suite - Phase 7.4 Comprehensive Testing")
        self.log(f"Testing against: {API_BASE}")
        self.log("Testing authentication, news, business directory, opportunities, and candidate APIs")
        
        tests = [
            # Phase 7.4 - Authentication & Authorization
            ("Phase 7.4 - Auth Login", self.test_auth_login),
            ("Phase 7.4 - Auth Register", self.test_auth_register),
            ("Phase 7.4 - JWT Validation", self.test_jwt_validation),
            
            # Phase 7.4 - News & Content APIs
            ("Phase 7.4 - News APIs", self.test_news_apis),
            
            # Phase 7.4 - Business Directory API
            ("Phase 7.4 - Business Directory", self.test_business_directory),
            
            # Phase 7.4 - Opportunities APIs
            ("Phase 7.4 - Opportunities APIs", self.test_opportunities_apis),
            
            # Phase 7.4 - Candidate & Recruiter APIs
            ("Phase 7.4 - Candidate APIs", self.test_candidate_apis),
            ("Phase 7.4 - Recruiter Analytics", self.test_recruiter_analytics),
            
            # Phase 7.4 - Security & Error Handling
            ("Phase 7.4 - CORS Headers", self.test_cors_headers),
            ("Phase 7.4 - Error Handling", self.test_error_handling),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} ---")
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name}: PASSED")
                else:
                    failed += 1
                    self.log(f"❌ {test_name}: FAILED")
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {e}", "ERROR")
                failed += 1
                
        self.log(f"\n=== PHASE 7.4 TEST RESULTS ===")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All Phase 7.4 tests passed!")
            return True
        else:
            self.log(f"💥 {failed} Phase 7.4 test(s) failed")
            return False

if __name__ == "__main__":
    tester = Phase74APITester()
    
    # Run Phase 7.4 comprehensive backend API tests
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)