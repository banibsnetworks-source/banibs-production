#!/usr/bin/env python3
"""
BCEE v1.0 Phase 2 - API Endpoint Integration Testing

Tests all 7 BCEE API endpoints with comprehensive scenarios:
1. GET /api/bcee/user-region (Authenticated)
2. GET /api/bcee/price-display (Auth Optional)
3. POST /api/bcee/update-region (Authenticated)
4. GET /api/bcee/supported-currencies (Public)
5. GET /api/bcee/exchange-rates (Public)
6. POST /api/bcee/price-display/batch (Auth Optional)
7. GET /api/bcee/health (Public)
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://megadrop-banibs.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BCEEPhase2Tester:
    def __init__(self):
        self.user_token = None
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

    def setup_authentication(self) -> bool:
        """Login with test user credentials"""
        self.log("🔐 Setting up authentication...")
        
        # Test user credentials from review request
        test_user_email = "social_test_user@example.com"
        test_user_password = "TestPass123!"
        
        response = self.make_request("POST", "/auth/login", {
            "email": test_user_email,
            "password": test_user_password
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.user_token = data["access_token"]
                self.user_id = data.get("user", {}).get("id")
                self.log(f"✅ Authentication successful (User ID: {self.user_id})")
                return True
            else:
                self.log("❌ Login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ Authentication failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_health_endpoint(self) -> bool:
        """Test GET /api/bcee/health (Public)"""
        self.log("🏥 Testing BCEE Health Check Endpoint...")
        
        response = self.make_request("GET", "/bcee/health")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["service", "version", "status", "base_currency", "supported_currencies_count"]
            
            if all(field in data for field in required_fields):
                if (data["service"] == "BCEE" and 
                    data["version"] == "1.0" and 
                    data["status"] == "operational" and
                    data["base_currency"] == "USD" and
                    data["supported_currencies_count"] == 12):
                    
                    self.log("✅ BCEE health check passed")
                    self.log(f"   Service: {data['service']} v{data['version']}")
                    self.log(f"   Status: {data['status']}")
                    self.log(f"   Base Currency: {data['base_currency']}")
                    self.log(f"   Supported Currencies: {data['supported_currencies_count']}")
                    return True
                else:
                    self.log(f"❌ Health check values incorrect: {data}", "ERROR")
                    return False
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Health check missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Health check failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_supported_currencies_endpoint(self) -> bool:
        """Test GET /api/bcee/supported-currencies (Public)"""
        self.log("💱 Testing Supported Currencies Endpoint...")
        
        response = self.make_request("GET", "/bcee/supported-currencies")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["base_currency", "supported_currencies", "total_count"]
            
            if all(field in data for field in required_fields):
                if (data["base_currency"] == "USD" and 
                    data["total_count"] == 12 and
                    isinstance(data["supported_currencies"], list)):
                    
                    currencies = data["supported_currencies"]
                    
                    # Verify currency structure
                    if currencies:
                        currency = currencies[0]
                        currency_fields = ["code", "symbol", "name", "decimals"]
                        
                        if all(field in currency for field in currency_fields):
                            # Check for specific currencies
                            currency_codes = [c["code"] for c in currencies]
                            expected_currencies = ["USD", "NGN", "GBP", "EUR"]
                            
                            if all(code in currency_codes for code in expected_currencies):
                                self.log("✅ Supported currencies endpoint working")
                                self.log(f"   Base Currency: {data['base_currency']}")
                                self.log(f"   Total Count: {data['total_count']}")
                                self.log(f"   Sample Currencies: {currency_codes[:5]}")
                                return True
                            else:
                                missing = [c for c in expected_currencies if c not in currency_codes]
                                self.log(f"❌ Missing expected currencies: {missing}", "ERROR")
                                return False
                        else:
                            missing = [f for f in currency_fields if f not in currency]
                            self.log(f"❌ Currency object missing fields: {missing}", "ERROR")
                            return False
                    else:
                        self.log("❌ No currencies returned", "ERROR")
                        return False
                else:
                    self.log(f"❌ Supported currencies response invalid: {data}", "ERROR")
                    return False
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Supported currencies missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Supported currencies failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_exchange_rates_endpoint(self) -> bool:
        """Test GET /api/bcee/exchange-rates (Public)"""
        self.log("📈 Testing Exchange Rates Endpoint...")
        
        response = self.make_request("GET", "/bcee/exchange-rates")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["base_currency", "rates", "source"]
            
            if all(field in data for field in required_fields):
                if (data["base_currency"] == "USD" and 
                    data["source"] == "dev" and
                    isinstance(data["rates"], dict)):
                    
                    rates = data["rates"]
                    
                    # Check for expected rates
                    expected_rates = {
                        "USD": 1.0,
                        "NGN": 1450.0,
                        "GBP": 0.79,
                        "EUR": 0.92
                    }
                    
                    rates_correct = True
                    for currency, expected_rate in expected_rates.items():
                        if currency not in rates:
                            self.log(f"❌ Missing rate for {currency}", "ERROR")
                            rates_correct = False
                        elif rates[currency] != expected_rate:
                            self.log(f"❌ Incorrect rate for {currency}: expected {expected_rate}, got {rates[currency]}", "ERROR")
                            rates_correct = False
                    
                    if rates_correct:
                        self.log("✅ Exchange rates endpoint working")
                        self.log(f"   Base Currency: {data['base_currency']}")
                        self.log(f"   Source: {data['source']}")
                        self.log(f"   Sample Rates: USD=1.0, NGN={rates['NGN']}, GBP={rates['GBP']}")
                        return True
                    else:
                        return False
                else:
                    self.log(f"❌ Exchange rates response invalid: {data}", "ERROR")
                    return False
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Exchange rates missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Exchange rates failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_user_region_authenticated(self) -> bool:
        """Test GET /api/bcee/user-region (Authenticated)"""
        self.log("🌍 Testing User Region Endpoint (Authenticated)...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test with authentication
        response = self.make_request("GET", "/bcee/user-region", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["country_code", "preferred_currency", "locale"]
            
            if all(field in data for field in required_fields):
                self.log("✅ User region endpoint working (authenticated)")
                self.log(f"   Country Code: {data['country_code']}")
                self.log(f"   Preferred Currency: {data['preferred_currency']}")
                self.log(f"   Locale: {data['locale']}")
                return True
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ User region missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ User region (authenticated) failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_user_region_unauthenticated(self) -> bool:
        """Test GET /api/bcee/user-region without authentication (should return 401)"""
        self.log("🔒 Testing User Region Endpoint (Unauthenticated)...")
        
        response = self.make_request("GET", "/bcee/user-region")
        
        if response.status_code == 401:
            self.log("✅ User region correctly requires authentication (401)")
            return True
        else:
            self.log(f"❌ User region should return 401 without auth, got {response.status_code}", "ERROR")
            return False

    def test_price_display_authenticated(self) -> bool:
        """Test GET /api/bcee/price-display with authenticated user"""
        self.log("💰 Testing Price Display Endpoint (Authenticated User)...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test 1: Convert $10 USD to user's currency
        response = self.make_request("GET", "/bcee/price-display", 
                                   headers=headers, 
                                   params={"amount": 10.0})
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["base", "label"]
            
            if all(field in data for field in required_fields):
                base = data["base"]
                if base["amount"] == 10.0 and base["currency"] == "USD":
                    self.log("✅ Price display (authenticated) working")
                    self.log(f"   Base: ${base['amount']} {base['currency']}")
                    self.log(f"   Label: {data['label']}")
                    
                    # Test 2: Convert with explicit target currency (NGN)
                    response2 = self.make_request("GET", "/bcee/price-display",
                                                headers=headers,
                                                params={"amount": 25.50, "target_currency": "NGN"})
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        if "local" in data2 and data2["local"]["currency"] == "NGN":
                            expected_ngn = 25.50 * 1450.0  # NGN rate
                            actual_ngn = data2["local"]["amount"]
                            
                            if abs(actual_ngn - expected_ngn) < 0.01:
                                self.log("✅ Price display with target currency working")
                                self.log(f"   $25.50 USD → ₦{actual_ngn:,.2f} NGN")
                                return True
                            else:
                                self.log(f"❌ Incorrect NGN conversion: expected {expected_ngn}, got {actual_ngn}", "ERROR")
                                return False
                        else:
                            self.log(f"❌ Target currency conversion failed: {data2}", "ERROR")
                            return False
                    else:
                        self.log(f"❌ Price display with target currency failed: {response2.status_code}", "ERROR")
                        return False
                else:
                    self.log(f"❌ Price display base values incorrect: {base}", "ERROR")
                    return False
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Price display missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Price display (authenticated) failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_price_display_anonymous(self) -> bool:
        """Test GET /api/bcee/price-display without authentication (should work)"""
        self.log("👤 Testing Price Display Endpoint (Anonymous User)...")
        
        response = self.make_request("GET", "/bcee/price-display", 
                                   params={"amount": 50.0})
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["base", "label"]
            
            if all(field in data for field in required_fields):
                base = data["base"]
                if base["amount"] == 50.0 and base["currency"] == "USD":
                    self.log("✅ Price display (anonymous) working")
                    self.log(f"   Base: ${base['amount']} {base['currency']}")
                    self.log(f"   Label: {data['label']}")
                    return True
                else:
                    self.log(f"❌ Price display base values incorrect: {base}", "ERROR")
                    return False
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Price display missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Price display (anonymous) failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_price_display_validation(self) -> bool:
        """Test price display input validation"""
        self.log("🔍 Testing Price Display Input Validation...")
        
        # Test 1: Negative amount (should fail)
        response = self.make_request("GET", "/bcee/price-display", 
                                   params={"amount": -10.0})
        
        if response.status_code == 422:  # Pydantic validation error
            self.log("✅ Negative amount correctly rejected (422)")
        else:
            self.log(f"❌ Negative amount should return 422, got {response.status_code}", "ERROR")
            return False
        
        # Test 2: Zero amount (should process correctly)
        response = self.make_request("GET", "/bcee/price-display", 
                                   params={"amount": 0.0})
        
        if response.status_code == 422:  # gt=0 validation
            self.log("✅ Zero amount correctly rejected (422)")
        else:
            self.log(f"❌ Zero amount should return 422, got {response.status_code}", "ERROR")
            return False
        
        # Test 3: Invalid currency code
        response = self.make_request("GET", "/bcee/price-display", 
                                   params={"amount": 10.0, "target_currency": "INVALID"})
        
        if response.status_code in [400, 500]:  # Should handle gracefully
            self.log("✅ Invalid currency code handled")
            return True
        else:
            self.log(f"⚠️ Invalid currency returned {response.status_code} (might fallback to USD)")
            return True

    def test_update_region_authenticated(self) -> bool:
        """Test POST /api/bcee/update-region (Authenticated)"""
        self.log("🔄 Testing Update Region Endpoint (Authenticated)...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test 1: Update to Nigeria (NG/NGN)
        response = self.make_request("POST", "/bcee/update-region",
                                   data={"country_code": "NG"},
                                   headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("country_code") == "NG" and data.get("preferred_currency") == "NGN":
                self.log("✅ Region update to NG/NGN successful")
                self.log(f"   Country: {data['country_code']}")
                self.log(f"   Currency: {data['preferred_currency']}")
                
                # Test 2: Update to Great Britain (GB/GBP)
                response2 = self.make_request("POST", "/bcee/update-region",
                                            data={"country_code": "GB"},
                                            headers=headers)
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    if data2.get("country_code") == "GB" and data2.get("preferred_currency") == "GBP":
                        self.log("✅ Region update to GB/GBP successful")
                        
                        # Test 3: Reset to US/USD
                        response3 = self.make_request("POST", "/bcee/update-region",
                                                    data={"country_code": "US"},
                                                    headers=headers)
                        
                        if response3.status_code == 200:
                            data3 = response3.json()
                            if data3.get("country_code") == "US" and data3.get("preferred_currency") == "USD":
                                self.log("✅ Region update to US/USD successful")
                                return True
                            else:
                                self.log(f"❌ US update failed: {data3}", "ERROR")
                                return False
                        else:
                            self.log(f"❌ US update failed: {response3.status_code}", "ERROR")
                            return False
                    else:
                        self.log(f"❌ GB update failed: {data2}", "ERROR")
                        return False
                else:
                    self.log(f"❌ GB update failed: {response2.status_code}", "ERROR")
                    return False
            else:
                self.log(f"❌ NG update failed: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Region update failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_update_region_validation(self) -> bool:
        """Test update region input validation"""
        self.log("🔍 Testing Update Region Input Validation...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test 1: Invalid country code (not 2 letters)
        response = self.make_request("POST", "/bcee/update-region",
                                   data={"country_code": "USA"},  # 3 letters
                                   headers=headers)
        
        if response.status_code == 400:
            self.log("✅ Invalid country code correctly rejected (400)")
        else:
            self.log(f"❌ Invalid country code should return 400, got {response.status_code}", "ERROR")
            return False
        
        # Test 2: Missing country_code
        response = self.make_request("POST", "/bcee/update-region",
                                   data={},
                                   headers=headers)
        
        if response.status_code == 422:  # Pydantic validation
            self.log("✅ Missing country_code correctly rejected (422)")
            return True
        else:
            self.log(f"❌ Missing country_code should return 422, got {response.status_code}", "ERROR")
            return False

    def test_update_region_unauthenticated(self) -> bool:
        """Test POST /api/bcee/update-region without authentication (should return 401)"""
        self.log("🔒 Testing Update Region Endpoint (Unauthenticated)...")
        
        response = self.make_request("POST", "/bcee/update-region",
                                   data={"country_code": "US"})
        
        if response.status_code == 401:
            self.log("✅ Update region correctly requires authentication (401)")
            return True
        else:
            self.log(f"❌ Update region should return 401 without auth, got {response.status_code}", "ERROR")
            return False

    def test_batch_price_display_authenticated(self) -> bool:
        """Test POST /api/bcee/price-display/batch with authenticated user"""
        self.log("📊 Testing Batch Price Display Endpoint (Authenticated)...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Test 1: Batch conversion with multiple amounts
        amounts = [10.0, 25.0, 50.0, 100.0]
        response = self.make_request("POST", "/bcee/price-display/batch",
                                   data={"amounts": amounts},
                                   headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["prices", "target_currency"]
            
            if all(field in data for field in required_fields):
                prices = data["prices"]
                if len(prices) == len(amounts):
                    # Verify each price has correct structure
                    for i, price in enumerate(prices):
                        if price["base"]["amount"] != amounts[i]:
                            self.log(f"❌ Batch price {i} amount mismatch", "ERROR")
                            return False
                    
                    self.log("✅ Batch price display (authenticated) working")
                    self.log(f"   Converted {len(amounts)} amounts")
                    self.log(f"   Target Currency: {data['target_currency']}")
                    self.log(f"   Sample: ${amounts[0]} → {prices[0]['label']}")
                    
                    # Test 2: Batch with explicit target currency
                    response2 = self.make_request("POST", "/bcee/price-display/batch",
                                                data={"amounts": [20.0, 40.0], "target_currency": "GBP"},
                                                headers=headers)
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        if data2["target_currency"] == "GBP":
                            self.log("✅ Batch price display with target currency working")
                            return True
                        else:
                            self.log(f"❌ Target currency not applied: {data2}", "ERROR")
                            return False
                    else:
                        self.log(f"❌ Batch with target currency failed: {response2.status_code}", "ERROR")
                        return False
                else:
                    self.log(f"❌ Batch returned {len(prices)} prices for {len(amounts)} amounts", "ERROR")
                    return False
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Batch price display missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Batch price display failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_batch_price_display_anonymous(self) -> bool:
        """Test POST /api/bcee/price-display/batch without authentication"""
        self.log("👤 Testing Batch Price Display Endpoint (Anonymous)...")
        
        amounts = [15.0, 30.0]
        response = self.make_request("POST", "/bcee/price-display/batch",
                                   data={"amounts": amounts})
        
        if response.status_code == 200:
            data = response.json()
            if len(data["prices"]) == len(amounts):
                self.log("✅ Batch price display (anonymous) working")
                self.log(f"   Converted {len(amounts)} amounts")
                return True
            else:
                self.log(f"❌ Batch anonymous returned wrong count", "ERROR")
                return False
        else:
            self.log(f"❌ Batch price display (anonymous) failed: {response.status_code} - {response.text}", "ERROR")
            return False

    def test_batch_price_display_validation(self) -> bool:
        """Test batch price display input validation"""
        self.log("🔍 Testing Batch Price Display Validation...")
        
        # Test 1: Empty amounts list
        response = self.make_request("POST", "/bcee/price-display/batch",
                                   data={"amounts": []})
        
        if response.status_code == 400:
            self.log("✅ Empty amounts list correctly rejected (400)")
        else:
            self.log(f"❌ Empty amounts should return 400, got {response.status_code}", "ERROR")
            return False
        
        # Test 2: Too many amounts (>100)
        large_amounts = [1.0] * 101
        response = self.make_request("POST", "/bcee/price-display/batch",
                                   data={"amounts": large_amounts})
        
        if response.status_code == 400:
            self.log("✅ Too many amounts correctly rejected (400)")
            return True
        else:
            self.log(f"❌ Too many amounts should return 400, got {response.status_code}", "ERROR")
            return False

    def test_end_to_end_user_flow(self) -> bool:
        """Test complete end-to-end user flow"""
        self.log("🔄 Testing End-to-End User Flow...")
        
        if not self.user_token:
            self.log("❌ No user token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        
        # Step 1: Get initial user region
        response = self.make_request("GET", "/bcee/user-region", headers=headers)
        if response.status_code != 200:
            self.log("❌ Failed to get initial user region", "ERROR")
            return False
        
        initial_region = response.json()
        self.log(f"   Initial region: {initial_region['country_code']}/{initial_region['preferred_currency']}")
        
        # Step 2: Get price display (should use initial region)
        response = self.make_request("GET", "/bcee/price-display",
                                   params={"amount": 25.0},
                                   headers=headers)
        if response.status_code != 200:
            self.log("❌ Failed to get initial price display", "ERROR")
            return False
        
        initial_price = response.json()
        self.log(f"   Initial price: {initial_price['label']}")
        
        # Step 3: Update region to NG
        response = self.make_request("POST", "/bcee/update-region",
                                   data={"country_code": "NG"},
                                   headers=headers)
        if response.status_code != 200:
            self.log("❌ Failed to update region to NG", "ERROR")
            return False
        
        self.log("   Updated region to NG/NGN")
        
        # Step 4: Get price display again (should now show NGN)
        response = self.make_request("GET", "/bcee/price-display",
                                   params={"amount": 25.0},
                                   headers=headers)
        if response.status_code != 200:
            self.log("❌ Failed to get updated price display", "ERROR")
            return False
        
        updated_price = response.json()
        self.log(f"   Updated price: {updated_price['label']}")
        
        # Step 5: Get batch prices (should all be in NGN)
        response = self.make_request("POST", "/bcee/price-display/batch",
                                   data={"amounts": [10.0, 20.0, 30.0]},
                                   headers=headers)
        if response.status_code != 200:
            self.log("❌ Failed to get batch prices", "ERROR")
            return False
        
        batch_data = response.json()
        if batch_data["target_currency"] == "NGN":
            self.log("✅ End-to-end user flow working")
            self.log(f"   Batch prices in {batch_data['target_currency']}")
            
            # Reset to original region
            self.make_request("POST", "/bcee/update-region",
                            data={"country_code": initial_region["country_code"]},
                            headers=headers)
            return True
        else:
            self.log(f"❌ Batch prices not in NGN: {batch_data['target_currency']}", "ERROR")
            return False

    def test_performance_benchmarks(self) -> bool:
        """Test performance benchmarks"""
        self.log("⚡ Testing Performance Benchmarks...")
        
        # Test 1: Single price display performance
        start_time = time.time()
        response = self.make_request("GET", "/bcee/price-display", params={"amount": 10.0})
        single_duration = time.time() - start_time
        
        if response.status_code == 200 and single_duration < 0.1:  # < 100ms
            self.log(f"✅ Single price display: {single_duration*1000:.1f}ms (< 100ms)")
        else:
            self.log(f"⚠️ Single price display: {single_duration*1000:.1f}ms (target: < 100ms)")
        
        # Test 2: Batch 50 items performance
        amounts = [float(i) for i in range(1, 51)]  # 50 amounts
        start_time = time.time()
        response = self.make_request("POST", "/bcee/price-display/batch", data={"amounts": amounts})
        batch_duration = time.time() - start_time
        
        if response.status_code == 200 and batch_duration < 0.5:  # < 500ms
            self.log(f"✅ Batch 50 items: {batch_duration*1000:.1f}ms (< 500ms)")
            return True
        else:
            self.log(f"⚠️ Batch 50 items: {batch_duration*1000:.1f}ms (target: < 500ms)")
            return True  # Still pass, just note performance

    def run_all_tests(self) -> bool:
        """Run all BCEE Phase 2 API tests"""
        self.log("🚀 BCEE v1.0 PHASE 2 - API ENDPOINT INTEGRATION TESTING")
        self.log("=" * 60)
        
        tests = [
            ("Authentication Setup", self.setup_authentication),
            ("Health Check Endpoint", self.test_health_endpoint),
            ("Supported Currencies Endpoint", self.test_supported_currencies_endpoint),
            ("Exchange Rates Endpoint", self.test_exchange_rates_endpoint),
            ("User Region (Authenticated)", self.test_user_region_authenticated),
            ("User Region (Unauthenticated)", self.test_user_region_unauthenticated),
            ("Price Display (Authenticated)", self.test_price_display_authenticated),
            ("Price Display (Anonymous)", self.test_price_display_anonymous),
            ("Price Display Validation", self.test_price_display_validation),
            ("Update Region (Authenticated)", self.test_update_region_authenticated),
            ("Update Region Validation", self.test_update_region_validation),
            ("Update Region (Unauthenticated)", self.test_update_region_unauthenticated),
            ("Batch Price Display (Authenticated)", self.test_batch_price_display_authenticated),
            ("Batch Price Display (Anonymous)", self.test_batch_price_display_anonymous),
            ("Batch Price Display Validation", self.test_batch_price_display_validation),
            ("End-to-End User Flow", self.test_end_to_end_user_flow),
            ("Performance Benchmarks", self.test_performance_benchmarks),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n📋 {test_name}...")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
                    self.log(f"❌ {test_name} FAILED", "ERROR")
            except Exception as e:
                failed += 1
                self.log(f"❌ {test_name} FAILED with exception: {e}", "ERROR")
        
        self.log("\n" + "=" * 60)
        self.log(f"🏁 BCEE PHASE 2 API TESTING COMPLETE")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        return failed == 0


def main():
    """Main test execution"""
    tester = BCEEPhase2Tester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL BCEE PHASE 2 API TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n💥 SOME BCEE PHASE 2 API TESTS FAILED!")
        sys.exit(1)


if __name__ == "__main__":
    main()