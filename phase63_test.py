#!/usr/bin/env python3
"""
Phase 6.3 - Cross-Regional Insights & AI Sentiment Analysis Backend Tests
Tests the sentiment analysis endpoints as specified in the review request.
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://banibs-features.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Phase63Tester:
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
            
    def test_admin_login(self) -> bool:
        """Test admin login with provided credentials"""
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
            
    def test_regional_insights_public(self) -> bool:
        """Test GET /api/insights/regional (public endpoint)"""
        self.log("Testing regional insights public endpoint...")
        
        response = self.make_request("GET", "/insights/regional")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Regional insights public endpoint working - Found {len(data)} regions")
                
                if len(data) == 0:
                    self.log("✅ Regional insights correctly returns empty array (no sentiment data yet)")
                    return True
                
                # Verify structure of regional aggregates
                for region_data in data:
                    required_fields = ["region", "avgSentiment", "totalRecords", "positive", "neutral", "negative", "lastAnalyzed"]
                    
                    if all(field in region_data for field in required_fields):
                        self.log(f"   Region: {region_data['region']}, Avg Sentiment: {region_data['avgSentiment']}, Total: {region_data['totalRecords']}")
                    else:
                        missing_fields = [field for field in required_fields if field not in region_data]
                        self.log(f"❌ Regional data missing fields: {missing_fields}", "ERROR")
                        return False
                
                return True
            else:
                self.log(f"❌ Regional insights should return array, got {type(data)}", "ERROR")
                return False
        else:
            self.log(f"❌ Regional insights public endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_regional_insights_public_filtered(self) -> bool:
        """Test GET /api/insights/regional?region=Global (public endpoint with filter)"""
        self.log("Testing regional insights public endpoint with Global filter...")
        
        response = self.make_request("GET", "/insights/regional", params={"region": "Global"})
        
        if response.status_code == 200:
            data = response.json()
            
            # Should return single object or null for Global region
            if data is None:
                self.log("✅ Regional insights correctly returns null for Global region (no data yet)")
                return True
            elif isinstance(data, dict):
                if data.get("region") == "Global":
                    required_fields = ["region", "avgSentiment", "totalRecords", "positive", "neutral", "negative", "lastAnalyzed"]
                    
                    if all(field in data for field in required_fields):
                        self.log(f"✅ Global regional insights working - Avg Sentiment: {data['avgSentiment']}, Total: {data['totalRecords']}")
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in data]
                        self.log(f"❌ Global regional data missing fields: {missing_fields}", "ERROR")
                        return False
                else:
                    self.log(f"❌ Expected Global region, got {data.get('region')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Regional insights with filter should return object or null, got {type(data)}", "ERROR")
                return False
        else:
            self.log(f"❌ Regional insights filtered endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_regional_insights_admin(self) -> bool:
        """Test GET /api/insights/admin/regional (JWT protected admin endpoint)"""
        self.log("Testing regional insights admin endpoint...")
        
        # Test 1: Without auth → Should return 401
        response = self.make_request("GET", "/insights/admin/regional")
        
        if response.status_code != 401:
            self.log(f"❌ Admin regional insights without auth should return 401, got {response.status_code}", "ERROR")
            return False
        
        # Test 2: With admin token → Should return 200
        if not self.admin_token:
            self.log("❌ No admin token available for admin regional insights test", "ERROR")
            return False
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.make_request("GET", "/insights/admin/regional", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["success", "regions", "generatedAt"]
            
            if all(field in data for field in required_fields):
                if data["success"] and isinstance(data["regions"], list):
                    self.log(f"✅ Admin regional insights working - {len(data['regions'])} regions, generated at {data['generatedAt']}")
                    return True
                else:
                    self.log(f"❌ Admin regional insights response invalid: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Admin regional insights missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Admin regional insights failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_regional_insights_generate(self) -> bool:
        """Test POST /api/insights/admin/regional/generate (JWT protected manual trigger)"""
        self.log("Testing regional insights manual generation...")
        
        # Test 1: Without auth → Should return 401
        response = self.make_request("POST", "/insights/admin/regional/generate")
        
        if response.status_code != 401:
            self.log(f"❌ Generate insights without auth should return 401, got {response.status_code}", "ERROR")
            return False
        
        # Test 2: With admin token → Should return 200
        if not self.admin_token:
            self.log("❌ No admin token available for generate insights test", "ERROR")
            return False
            
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.make_request("POST", "/insights/admin/regional/generate", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["success", "analyzed", "errors", "message"]
            
            if all(field in data for field in required_fields):
                if data["success"]:
                    analyzed_count = data["analyzed"]
                    error_count = data["errors"]
                    self.log(f"✅ Generate insights working - Analyzed: {analyzed_count}, Errors: {error_count}")
                    self.log(f"   Message: {data['message']}")
                    
                    # Check if AI sentiment analysis or fallback was used
                    if analyzed_count > 0:
                        self.log("✅ Sentiment analysis successfully processed stories")
                    else:
                        self.log("✅ No new stories to analyze (all already processed)")
                    
                    return True
                else:
                    self.log(f"❌ Generate insights failed: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Generate insights missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Generate insights failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def run_phase63_tests(self) -> bool:
        """Run Phase 6.3 specific tests"""
        self.log("Starting Phase 6.3 - Cross-Regional Insights & AI Sentiment Analysis Tests")
        self.log(f"Testing against: {API_BASE}")
        
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Regional Insights Public", self.test_regional_insights_public),
            ("Regional Insights Public Filtered", self.test_regional_insights_public_filtered),
            ("Regional Insights Admin", self.test_regional_insights_admin),
            ("Regional Insights Generate", self.test_regional_insights_generate),
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
                
        self.log(f"\n=== PHASE 6.3 TEST RESULTS ===")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All Phase 6.3 tests passed!")
            return True
        else:
            self.log(f"💥 {failed} test(s) failed")
            return False

if __name__ == "__main__":
    tester = Phase63Tester()
    success = tester.run_phase63_tests()
    sys.exit(0 if success else 1)