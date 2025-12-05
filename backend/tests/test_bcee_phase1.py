#!/usr/bin/env python3
"""
BCEE v1.0 Phase 1 - Backend Foundation Testing

Tests the newly implemented BCEE backend services for multi-currency display functionality:
1. UserRegionService - Region detection and management
2. PriceDisplayService - Currency conversion and formatting  
3. PaymentProviderService - Abstract payment interface
4. Integration tests - Services working together
"""

import asyncio
import sys
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any

# Add backend to path for imports
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from services.user_region_service import UserRegionService
from services.price_display_service import PriceDisplayService
from services.payment_provider_service import PaymentProviderFactory, PaymentProviderError
from services.exchange_rate_service import ExchangeRateService
from services.currency_config import CurrencyConfigService
from models.currency import UserRegionProfile, PriceDisplay, MoneyValue

class BCEEPhase1Tester:
    def __init__(self):
        self.db = None
        self.client = None
        self.user_region_service = None
        self.price_display_service = None
        self.exchange_rate_service = None
        self.test_user_id = "social_test_user@example.com"
        self.test_results = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    async def setup(self):
        """Initialize database connection and services"""
        self.log("🔧 Setting up BCEE Phase 1 test environment...")
        
        # Connect to MongoDB
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        
        # Initialize services
        self.user_region_service = UserRegionService(self.db)
        self.price_display_service = PriceDisplayService(self.db)
        self.exchange_rate_service = ExchangeRateService(self.db)
        
        # Initialize dev exchange rates
        await self.exchange_rate_service.initialize_dev_rates()
        
        self.log("✅ BCEE services initialized successfully")
        
    async def cleanup(self):
        """Clean up database connections"""
        if self.client:
            self.client.close()
            
    def record_test_result(self, test_name: str, passed: bool, details: str = ""):
        """Record test result"""
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
        status = "✅ PASS" if passed else "❌ FAIL"
        self.log(f"{status}: {test_name}")
        if details:
            self.log(f"   Details: {details}")
            
    # ============ USER REGION SERVICE TESTS ============
    
    async def test_user_region_service_fallback_chain(self) -> bool:
        """Test region detection fallback chain: User profile → IP → Default"""
        self.log("🌍 Testing UserRegionService fallback chain...")
        
        try:
            # Test 1: No user_id (should use IP → Default fallback)
            region = await self.user_region_service.get_user_region(None)
            
            if not isinstance(region, UserRegionProfile):
                self.record_test_result("UserRegion: Anonymous fallback", False, "Invalid return type")
                return False
                
            if region.country_code != "US" or region.preferred_currency != "USD":
                self.record_test_result("UserRegion: Anonymous fallback", False, 
                                      f"Expected US/USD, got {region.country_code}/{region.preferred_currency}")
                return False
                
            self.record_test_result("UserRegion: Anonymous fallback", True, "Correctly defaults to US/USD")
            
            # Test 2: Non-existent user (should use Default fallback)
            region = await self.user_region_service.get_user_region("non_existent_user")
            
            if region.country_code != "US" or region.preferred_currency != "USD":
                self.record_test_result("UserRegion: Non-existent user fallback", False,
                                      f"Expected US/USD, got {region.country_code}/{region.preferred_currency}")
                return False
                
            self.record_test_result("UserRegion: Non-existent user fallback", True, "Correctly defaults to US/USD")
            
            # Test 3: Create test user with detected_country
            await self.db.banibs_users.update_one(
                {"id": self.test_user_id},
                {
                    "$set": {
                        "id": self.test_user_id,
                        "detected_country": "NG",
                        "region_detection_method": "test"
                    }
                },
                upsert=True
            )
            
            # Test user with detected_country (should use profile)
            region = await self.user_region_service.get_user_region(self.test_user_id)
            
            if region.country_code != "NG" or region.preferred_currency != "NGN":
                self.record_test_result("UserRegion: Profile detection", False,
                                      f"Expected NG/NGN, got {region.country_code}/{region.preferred_currency}")
                return False
                
            self.record_test_result("UserRegion: Profile detection", True, "Correctly uses user profile NG/NGN")
            
            return True
            
        except Exception as e:
            self.record_test_result("UserRegion: Fallback chain", False, f"Exception: {str(e)}")
            return False
            
    async def test_user_region_update_methods(self) -> bool:
        """Test update_user_region and detect_and_save_region_for_user"""
        self.log("🔄 Testing UserRegionService update methods...")
        
        try:
            # Test 1: update_user_region with valid data
            success = await self.user_region_service.update_user_region(
                self.test_user_id, "GB", "GBP"
            )
            
            if not success:
                self.record_test_result("UserRegion: Manual update", False, "Update returned False")
                return False
                
            # Verify update
            region = await self.user_region_service.get_user_region(self.test_user_id)
            if region.country_code != "GB" or region.preferred_currency != "GBP":
                self.record_test_result("UserRegion: Manual update", False,
                                      f"Update failed, got {region.country_code}/{region.preferred_currency}")
                return False
                
            self.record_test_result("UserRegion: Manual update", True, "Successfully updated to GB/GBP")
            
            # Test 2: update_user_region with invalid currency
            success = await self.user_region_service.update_user_region(
                self.test_user_id, "US", "INVALID"
            )
            
            if success:
                self.record_test_result("UserRegion: Invalid currency validation", False, "Should reject invalid currency")
                return False
                
            self.record_test_result("UserRegion: Invalid currency validation", True, "Correctly rejects invalid currency")
            
            # Test 3: detect_and_save_region_for_user (new user)
            new_user_id = "test_new_user_bcee"
            region = await self.user_region_service.detect_and_save_region_for_user(new_user_id)
            
            if region.country_code != "US" or region.preferred_currency != "USD":
                self.record_test_result("UserRegion: New user detection", False,
                                      f"Expected US/USD default, got {region.country_code}/{region.preferred_currency}")
                return False
                
            # Verify it was saved to database
            user = await self.db.banibs_users.find_one({"id": new_user_id})
            if not user or user.get("detected_country") != "US":
                self.record_test_result("UserRegion: New user detection", False, "Region not saved to database")
                return False
                
            self.record_test_result("UserRegion: New user detection", True, "Successfully detected and saved region")
            
            return True
            
        except Exception as e:
            self.record_test_result("UserRegion: Update methods", False, f"Exception: {str(e)}")
            return False
            
    # ============ PRICE DISPLAY SERVICE TESTS ============
    
    async def test_price_display_currency_conversion(self) -> bool:
        """Test USD to local currency conversion with proper rates"""
        self.log("💱 Testing PriceDisplayService currency conversion...")
        
        try:
            # Test 1: USD to NGN conversion
            price_display = await self.price_display_service.get_display_price(
                base_amount=10.0,
                target_currency="NGN"
            )
            
            if not isinstance(price_display, PriceDisplay):
                self.record_test_result("PriceDisplay: NGN conversion", False, "Invalid return type")
                return False
                
            # Check base price
            if price_display.base.amount != 10.0 or price_display.base.currency != "USD":
                self.record_test_result("PriceDisplay: NGN conversion", False, "Incorrect base price")
                return False
                
            # Check local conversion (1450 NGN per USD)
            expected_ngn = 10.0 * 1450.0
            if not price_display.local or price_display.local.amount != expected_ngn:
                self.record_test_result("PriceDisplay: NGN conversion", False, 
                                      f"Expected {expected_ngn} NGN, got {price_display.local.amount if price_display.local else None}")
                return False
                
            # Check exchange rate
            if price_display.exchange_rate != 1450.0:
                self.record_test_result("PriceDisplay: NGN conversion", False, 
                                      f"Expected rate 1450.0, got {price_display.exchange_rate}")
                return False
                
            self.record_test_result("PriceDisplay: NGN conversion", True, 
                                  f"$10.00 → ₦{expected_ngn:,.0f} at rate 1450.0")
            
            # Test 2: USD to GBP conversion
            price_display = await self.price_display_service.get_display_price(
                base_amount=100.0,
                target_currency="GBP"
            )
            
            expected_gbp = 100.0 * 0.79
            if not price_display.local or abs(price_display.local.amount - expected_gbp) > 0.01:
                self.record_test_result("PriceDisplay: GBP conversion", False,
                                      f"Expected {expected_gbp} GBP, got {price_display.local.amount if price_display.local else None}")
                return False
                
            self.record_test_result("PriceDisplay: GBP conversion", True,
                                  f"$100.00 → £{expected_gbp} at rate 0.79")
            
            # Test 3: USD to EUR conversion
            price_display = await self.price_display_service.get_display_price(
                base_amount=50.0,
                target_currency="EUR"
            )
            
            expected_eur = 50.0 * 0.92
            if not price_display.local or abs(price_display.local.amount - expected_eur) > 0.01:
                self.record_test_result("PriceDisplay: EUR conversion", False,
                                      f"Expected {expected_eur} EUR, got {price_display.local.amount if price_display.local else None}")
                return False
                
            self.record_test_result("PriceDisplay: EUR conversion", True,
                                  f"$50.00 → €{expected_eur} at rate 0.92")
            
            return True
            
        except Exception as e:
            self.record_test_result("PriceDisplay: Currency conversion", False, f"Exception: {str(e)}")
            return False
            
    async def test_price_display_formatting(self) -> bool:
        """Test price formatting with correct symbols and decimals"""
        self.log("🎨 Testing PriceDisplayService formatting...")
        
        try:
            # Test 1: format_price_simple with different currencies
            usd_formatted = await self.price_display_service.format_price_simple(25.99, "USD")
            if usd_formatted != "$25.99":
                self.record_test_result("PriceDisplay: USD formatting", False, f"Expected $25.99, got {usd_formatted}")
                return False
                
            self.record_test_result("PriceDisplay: USD formatting", True, f"Correctly formatted: {usd_formatted}")
            
            # Test 2: NGN formatting (should show thousands separator)
            ngn_formatted = await self.price_display_service.format_price_simple(1.0, "NGN")  # 1 USD = 1450 NGN
            if ngn_formatted != "₦1,450.00":
                self.record_test_result("PriceDisplay: NGN formatting", False, f"Expected ₦1,450.00, got {ngn_formatted}")
                return False
                
            self.record_test_result("PriceDisplay: NGN formatting", True, f"Correctly formatted: {ngn_formatted}")
            
            # Test 3: GBP formatting
            gbp_formatted = await self.price_display_service.format_price_simple(10.0, "GBP")  # 10 USD = 7.90 GBP
            if gbp_formatted != "£7.90":
                self.record_test_result("PriceDisplay: GBP formatting", False, f"Expected £7.90, got {gbp_formatted}")
                return False
                
            self.record_test_result("PriceDisplay: GBP formatting", True, f"Correctly formatted: {gbp_formatted}")
            
            # Test 4: Test label generation with dual currency display
            price_display = await self.price_display_service.get_display_price(
                base_amount=20.0,
                target_currency="NGN"
            )
            
            expected_label = "$20.00 (approx. ₦29,000.00)"
            if price_display.label != expected_label:
                self.record_test_result("PriceDisplay: Dual currency label", False,
                                      f"Expected '{expected_label}', got '{price_display.label}'")
                return False
                
            self.record_test_result("PriceDisplay: Dual currency label", True, f"Correctly formatted: {price_display.label}")
            
            return True
            
        except Exception as e:
            self.record_test_result("PriceDisplay: Formatting", False, f"Exception: {str(e)}")
            return False
            
    async def test_price_display_batch_operations(self) -> bool:
        """Test get_batch_display_prices for multiple amounts"""
        self.log("📊 Testing PriceDisplayService batch operations...")
        
        try:
            # Test batch conversion to NGN
            amounts = [5.0, 10.0, 25.0, 100.0]
            batch_results = await self.price_display_service.get_batch_display_prices(
                amounts=amounts,
                target_currency="NGN"
            )
            
            if len(batch_results) != len(amounts):
                self.record_test_result("PriceDisplay: Batch count", False, 
                                      f"Expected {len(amounts)} results, got {len(batch_results)}")
                return False
                
            # Verify each result
            for i, (amount, result) in enumerate(zip(amounts, batch_results)):
                expected_ngn = amount * 1450.0
                
                if not result.local or result.local.amount != expected_ngn:
                    self.record_test_result("PriceDisplay: Batch conversion accuracy", False,
                                          f"Amount {amount}: expected {expected_ngn} NGN, got {result.local.amount if result.local else None}")
                    return False
                    
                if result.exchange_rate != 1450.0:
                    self.record_test_result("PriceDisplay: Batch exchange rate", False,
                                          f"Amount {amount}: expected rate 1450.0, got {result.exchange_rate}")
                    return False
                    
            self.record_test_result("PriceDisplay: Batch operations", True, 
                                  f"Successfully processed {len(amounts)} amounts to NGN")
            
            # Test batch with USD (no conversion)
            usd_results = await self.price_display_service.get_batch_display_prices(
                amounts=amounts,
                target_currency="USD"
            )
            
            for i, (amount, result) in enumerate(zip(amounts, usd_results)):
                if result.local is not None:
                    self.record_test_result("PriceDisplay: Batch USD no-conversion", False,
                                          f"USD conversion should have local=None, got {result.local}")
                    return False
                    
                if result.exchange_rate != 1.0:
                    self.record_test_result("PriceDisplay: Batch USD rate", False,
                                          f"USD rate should be 1.0, got {result.exchange_rate}")
                    return False
                    
            self.record_test_result("PriceDisplay: Batch USD operations", True, 
                                  "Correctly handled USD batch with no conversion")
            
            return True
            
        except Exception as e:
            self.record_test_result("PriceDisplay: Batch operations", False, f"Exception: {str(e)}")
            return False
            
    async def test_price_display_fallback_behavior(self) -> bool:
        """Test proper fallback to USD when rate unavailable"""
        self.log("🔄 Testing PriceDisplayService fallback behavior...")
        
        try:
            # Test with unsupported currency
            price_display = await self.price_display_service.get_display_price(
                base_amount=15.0,
                target_currency="UNSUPPORTED"
            )
            
            # Should fallback to USD display
            if price_display.local is not None:
                self.record_test_result("PriceDisplay: Unsupported currency fallback", False,
                                      f"Should fallback to USD only, but got local: {price_display.local}")
                return False
                
            if price_display.exchange_rate is not None:
                self.record_test_result("PriceDisplay: Unsupported currency rate", False,
                                      f"Should have no exchange rate, got {price_display.exchange_rate}")
                return False
                
            if price_display.label != "$15.00":
                self.record_test_result("PriceDisplay: Unsupported currency label", False,
                                      f"Expected '$15.00', got '{price_display.label}'")
                return False
                
            self.record_test_result("PriceDisplay: Unsupported currency fallback", True,
                                  "Correctly falls back to USD display")
            
            return True
            
        except Exception as e:
            self.record_test_result("PriceDisplay: Fallback behavior", False, f"Exception: {str(e)}")
            return False
            
    # ============ PAYMENT PROVIDER SERVICE TESTS ============
    
    async def test_payment_provider_abstract_interface(self) -> bool:
        """Test abstract interface structure and error handling"""
        self.log("🏗️ Testing PaymentProviderService abstract interface...")
        
        try:
            # Test 1: PaymentProviderFactory registration and retrieval
            from services.payment_provider_service import PaymentProvider, PaymentProviderFactory
            
            # Test empty factory state
            providers = PaymentProviderFactory.get_available_providers()
            if len(providers) != 0:
                self.record_test_result("PaymentProvider: Factory initial state", False,
                                      f"Expected empty factory, got {len(providers)} providers")
                return False
                
            self.record_test_result("PaymentProvider: Factory initial state", True, "Factory starts empty")
            
            # Test 2: PaymentProviderError exception
            try:
                raise PaymentProviderError("Test error", "test_provider", "TEST_001")
            except PaymentProviderError as e:
                if e.message != "Test error" or e.provider != "test_provider" or e.error_code != "TEST_001":
                    self.record_test_result("PaymentProvider: Error exception", False,
                                          f"Error attributes incorrect: {e.message}, {e.provider}, {e.error_code}")
                    return False
                    
            self.record_test_result("PaymentProvider: Error exception", True, "PaymentProviderError works correctly")
            
            # Test 3: Factory methods with no providers
            provider = PaymentProviderFactory.get_provider("nonexistent")
            if provider is not None:
                self.record_test_result("PaymentProvider: Factory get nonexistent", False,
                                      f"Should return None for nonexistent provider, got {provider}")
                return False
                
            self.record_test_result("PaymentProvider: Factory get nonexistent", True, "Correctly returns None")
            
            # Test 4: get_provider_for_currency with no providers
            provider = await PaymentProviderFactory.get_provider_for_currency("USD")
            if provider is not None:
                self.record_test_result("PaymentProvider: Factory currency lookup empty", False,
                                      f"Should return None when no providers, got {provider}")
                return False
                
            self.record_test_result("PaymentProvider: Factory currency lookup", True, "Correctly handles empty provider list")
            
            return True
            
        except Exception as e:
            self.record_test_result("PaymentProvider: Abstract interface", False, f"Exception: {str(e)}")
            return False
            
    async def test_payment_provider_abstract_methods(self) -> bool:
        """Test that all abstract methods are defined correctly"""
        self.log("🔍 Testing PaymentProvider abstract method definitions...")
        
        try:
            from services.payment_provider_service import PaymentProvider
            import inspect
            
            # Get all abstract methods
            abstract_methods = []
            for name, method in inspect.getmembers(PaymentProvider, predicate=inspect.isfunction):
                if hasattr(method, '__isabstractmethod__') and method.__isabstractmethod__:
                    abstract_methods.append(name)
                    
            expected_methods = [
                'create_checkout_session',
                'verify_payment', 
                'refund_payment',
                'get_supported_currencies',
                'get_provider_name'
            ]
            
            for method in expected_methods:
                if method not in abstract_methods:
                    self.record_test_result("PaymentProvider: Abstract method definitions", False,
                                          f"Missing abstract method: {method}")
                    return False
                    
            self.record_test_result("PaymentProvider: Abstract method definitions", True,
                                  f"All {len(expected_methods)} abstract methods defined")
            
            # Test method signatures
            create_session = getattr(PaymentProvider, 'create_checkout_session')
            sig = inspect.signature(create_session)
            
            expected_params = ['self', 'amount', 'currency', 'success_url', 'cancel_url', 'metadata']
            actual_params = list(sig.parameters.keys())
            
            if actual_params != expected_params:
                self.record_test_result("PaymentProvider: Method signatures", False,
                                      f"create_checkout_session signature mismatch: {actual_params} vs {expected_params}")
                return False
                
            self.record_test_result("PaymentProvider: Method signatures", True, "Method signatures correct")
            
            return True
            
        except Exception as e:
            self.record_test_result("PaymentProvider: Abstract methods", False, f"Exception: {str(e)}")
            return False
            
    # ============ INTEGRATION TESTS ============
    
    async def test_services_integration(self) -> bool:
        """Test services working together: UserRegion → PriceDisplay conversion"""
        self.log("🔗 Testing BCEE services integration...")
        
        try:
            # Set up test user with Nigerian region
            await self.db.banibs_users.update_one(
                {"id": self.test_user_id},
                {
                    "$set": {
                        "id": self.test_user_id,
                        "detected_country": "NG",
                        "region_detection_method": "integration_test"
                    }
                },
                upsert=True
            )
            
            # Test 1: UserRegionService detects region → PriceDisplayService converts price
            price_display = await self.price_display_service.get_display_price(
                base_amount=50.0,
                user_id=self.test_user_id  # Should auto-detect NGN from user profile
            )
            
            # Should convert to NGN based on user's detected country
            expected_ngn = 50.0 * 1450.0  # 72,500 NGN
            
            if not price_display.local or price_display.local.currency != "NGN":
                self.record_test_result("Integration: Region → Currency detection", False,
                                      f"Expected NGN currency, got {price_display.local.currency if price_display.local else None}")
                return False
                
            if price_display.local.amount != expected_ngn:
                self.record_test_result("Integration: Region → Price conversion", False,
                                      f"Expected {expected_ngn} NGN, got {price_display.local.amount}")
                return False
                
            self.record_test_result("Integration: UserRegion → PriceDisplay", True,
                                  f"User NG region → $50.00 converted to ₦{expected_ngn:,.0f}")
            
            # Test 2: Change user region and verify price display updates
            await self.user_region_service.update_user_region(self.test_user_id, "GB", "GBP")
            
            price_display_gbp = await self.price_display_service.get_display_price(
                base_amount=50.0,
                user_id=self.test_user_id
            )
            
            expected_gbp = 50.0 * 0.79  # 39.50 GBP
            
            if not price_display_gbp.local or price_display_gbp.local.currency != "GBP":
                self.record_test_result("Integration: Region update → Currency change", False,
                                      f"Expected GBP currency after update, got {price_display_gbp.local.currency if price_display_gbp.local else None}")
                return False
                
            if abs(price_display_gbp.local.amount - expected_gbp) > 0.01:
                self.record_test_result("Integration: Region update → Price conversion", False,
                                      f"Expected {expected_gbp} GBP, got {price_display_gbp.local.amount}")
                return False
                
            self.record_test_result("Integration: Region update → Price change", True,
                                  f"Updated to GB region → $50.00 converted to £{expected_gbp}")
            
            return True
            
        except Exception as e:
            self.record_test_result("Integration: Services integration", False, f"Exception: {str(e)}")
            return False
            
    async def test_exchange_rate_service_integration(self) -> bool:
        """Test ExchangeRateService integration with dev mode static rates"""
        self.log("💱 Testing ExchangeRateService integration...")
        
        try:
            # Test 1: Verify dev mode is enabled
            if not self.exchange_rate_service.use_dev_mode:
                self.record_test_result("ExchangeRate: Dev mode check", False, "Dev mode should be enabled for testing")
                return False
                
            self.record_test_result("ExchangeRate: Dev mode enabled", True, "Using static dev rates")
            
            # Test 2: Get all rates and verify they match DEV_RATES
            all_rates = await self.exchange_rate_service.get_all_rates()
            
            for currency, expected_rate in self.exchange_rate_service.DEV_RATES.items():
                if currency not in all_rates:
                    self.record_test_result("ExchangeRate: Dev rates completeness", False,
                                          f"Missing currency in rates: {currency}")
                    return False
                    
                if all_rates[currency] != expected_rate:
                    self.record_test_result("ExchangeRate: Dev rates accuracy", False,
                                          f"Rate mismatch for {currency}: expected {expected_rate}, got {all_rates[currency]}")
                    return False
                    
            self.record_test_result("ExchangeRate: Dev rates integration", True,
                                  f"All {len(self.exchange_rate_service.DEV_RATES)} dev rates available")
            
            # Test 3: Test conversion method
            ngn_amount = await self.exchange_rate_service.convert(10.0, "NGN")
            if ngn_amount != 14500.0:  # 10 * 1450
                self.record_test_result("ExchangeRate: Conversion method", False,
                                      f"Expected 14500.0 NGN, got {ngn_amount}")
                return False
                
            self.record_test_result("ExchangeRate: Conversion method", True, "10 USD → 14,500 NGN")
            
            # Test 4: Test unsupported currency
            invalid_amount = await self.exchange_rate_service.convert(10.0, "INVALID")
            if invalid_amount is not None:
                self.record_test_result("ExchangeRate: Invalid currency handling", False,
                                      f"Should return None for invalid currency, got {invalid_amount}")
                return False
                
            self.record_test_result("ExchangeRate: Invalid currency handling", True, "Correctly returns None")
            
            return True
            
        except Exception as e:
            self.record_test_result("ExchangeRate: Service integration", False, f"Exception: {str(e)}")
            return False
            
    async def test_currency_config_service_integration(self) -> bool:
        """Test CurrencyConfigService integration with formatting and symbols"""
        self.log("⚙️ Testing CurrencyConfigService integration...")
        
        try:
            # Test 1: Base currency configuration
            base_currency = CurrencyConfigService.get_base_currency()
            if base_currency != "USD":
                self.record_test_result("CurrencyConfig: Base currency", False,
                                      f"Expected USD base currency, got {base_currency}")
                return False
                
            self.record_test_result("CurrencyConfig: Base currency", True, "Base currency is USD")
            
            # Test 2: Supported currencies list
            supported = CurrencyConfigService.get_supported_currencies()
            expected_currencies = ["USD", "NGN", "GHS", "ZAR", "KES", "GBP", "EUR", "CAD", "XOF", "JMD", "TTD", "BBD"]
            
            for currency in expected_currencies:
                if currency not in supported:
                    self.record_test_result("CurrencyConfig: Supported currencies", False,
                                          f"Missing expected currency: {currency}")
                    return False
                    
            self.record_test_result("CurrencyConfig: Supported currencies", True,
                                  f"All {len(expected_currencies)} expected currencies supported")
            
            # Test 3: Country to currency mapping
            test_mappings = [
                ("NG", "NGN"),
                ("US", "USD"), 
                ("GB", "GBP"),
                ("ZA", "ZAR"),
                ("UNKNOWN", "USD")  # Should default to USD
            ]
            
            for country, expected_currency in test_mappings:
                actual_currency = CurrencyConfigService.get_default_currency_for_country(country)
                if actual_currency != expected_currency:
                    self.record_test_result("CurrencyConfig: Country mapping", False,
                                          f"Country {country}: expected {expected_currency}, got {actual_currency}")
                    return False
                    
            self.record_test_result("CurrencyConfig: Country mapping", True, "Country-to-currency mapping correct")
            
            # Test 4: Money formatting
            test_formats = [
                (10.50, "USD", "$10.50"),
                (1450.0, "NGN", "₦1,450.00"),
                (0.79, "GBP", "£0.79"),
                (605.0, "XOF", "CFA605")  # No decimals for CFA
            ]
            
            for amount, currency, expected in test_formats:
                formatted = CurrencyConfigService.format_money(amount, currency)
                if formatted != expected:
                    self.record_test_result("CurrencyConfig: Money formatting", False,
                                          f"{amount} {currency}: expected '{expected}', got '{formatted}'")
                    return False
                    
            self.record_test_result("CurrencyConfig: Money formatting", True, "All currency formatting correct")
            
            # Test 5: Currency info details
            ngn_info = CurrencyConfigService.get_currency_info("NGN")
            expected_ngn = {"symbol": "₦", "decimals": 2, "name": "Nigerian Naira"}
            
            if ngn_info != expected_ngn:
                self.record_test_result("CurrencyConfig: Currency info", False,
                                      f"NGN info mismatch: expected {expected_ngn}, got {ngn_info}")
                return False
                
            self.record_test_result("CurrencyConfig: Currency info", True, "Currency info details correct")
            
            return True
            
        except Exception as e:
            self.record_test_result("CurrencyConfig: Service integration", False, f"Exception: {str(e)}")
            return False
            
    # ============ EDGE CASES AND ERROR HANDLING ============
    
    async def test_edge_cases_and_error_handling(self) -> bool:
        """Test edge cases: None values, invalid currencies, missing user profiles"""
        self.log("🧪 Testing edge cases and error handling...")
        
        try:
            # Test 1: None user_id handling
            region = await self.user_region_service.get_user_region(None)
            if not isinstance(region, UserRegionProfile) or region.country_code != "US":
                self.record_test_result("EdgeCase: None user_id", False, "Should handle None user_id gracefully")
                return False
                
            self.record_test_result("EdgeCase: None user_id handling", True, "Gracefully defaults to US/USD")
            
            # Test 2: Empty string user_id
            region = await self.user_region_service.get_user_region("")
            if not isinstance(region, UserRegionProfile) or region.country_code != "US":
                self.record_test_result("EdgeCase: Empty user_id", False, "Should handle empty user_id gracefully")
                return False
                
            self.record_test_result("EdgeCase: Empty user_id handling", True, "Gracefully defaults to US/USD")
            
            # Test 3: Zero amount price display
            price_display = await self.price_display_service.get_display_price(0.0, target_currency="NGN")
            if price_display.base.amount != 0.0 or (price_display.local and price_display.local.amount != 0.0):
                self.record_test_result("EdgeCase: Zero amount", False, "Should handle zero amounts correctly")
                return False
                
            self.record_test_result("EdgeCase: Zero amount handling", True, "Correctly handles zero amounts")
            
            # Test 4: Negative amount (should still work mathematically)
            price_display = await self.price_display_service.get_display_price(-5.0, target_currency="NGN")
            expected_negative_ngn = -5.0 * 1450.0
            if not price_display.local or price_display.local.amount != expected_negative_ngn:
                self.record_test_result("EdgeCase: Negative amount", False, 
                                      f"Expected {expected_negative_ngn} NGN, got {price_display.local.amount if price_display.local else None}")
                return False
                
            self.record_test_result("EdgeCase: Negative amount handling", True, "Correctly handles negative amounts")
            
            # Test 5: Very large amounts
            large_amount = 1000000.0  # 1 million USD
            price_display = await self.price_display_service.get_display_price(large_amount, target_currency="NGN")
            expected_large_ngn = large_amount * 1450.0
            if not price_display.local or price_display.local.amount != expected_large_ngn:
                self.record_test_result("EdgeCase: Large amount", False, "Should handle large amounts correctly")
                return False
                
            self.record_test_result("EdgeCase: Large amount handling", True, f"Correctly handles $1M → ₦{expected_large_ngn:,.0f}")
            
            # Test 6: Invalid currency code handling
            simple_format = await self.price_display_service.format_price_simple(10.0, "INVALID")
            if simple_format != "$10.00":  # Should fallback to USD
                self.record_test_result("EdgeCase: Invalid currency fallback", False,
                                      f"Should fallback to USD, got {simple_format}")
                return False
                
            self.record_test_result("EdgeCase: Invalid currency fallback", True, "Correctly falls back to USD")
            
            return True
            
        except Exception as e:
            self.record_test_result("EdgeCase: Error handling", False, f"Exception: {str(e)}")
            return False
            
    # ============ MAIN TEST RUNNER ============
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all BCEE Phase 1 tests and return results"""
        self.log("🚀 Starting BCEE v1.0 Phase 1 Backend Foundation Testing...")
        
        await self.setup()
        
        try:
            # UserRegionService Tests
            await self.test_user_region_service_fallback_chain()
            await self.test_user_region_update_methods()
            
            # PriceDisplayService Tests  
            await self.test_price_display_currency_conversion()
            await self.test_price_display_formatting()
            await self.test_price_display_batch_operations()
            await self.test_price_display_fallback_behavior()
            
            # PaymentProviderService Tests
            await self.test_payment_provider_abstract_interface()
            await self.test_payment_provider_abstract_methods()
            
            # Integration Tests
            await self.test_services_integration()
            await self.test_exchange_rate_service_integration()
            await self.test_currency_config_service_integration()
            
            # Edge Cases
            await self.test_edge_cases_and_error_handling()
            
        finally:
            await self.cleanup()
            
        # Calculate results
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["passed"]])
        failed_tests = total_tests - passed_tests
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log("=" * 60)
        self.log(f"🏁 BCEE v1.0 Phase 1 Testing Complete")
        self.log(f"📊 Results: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)")
        
        if failed_tests > 0:
            self.log(f"❌ Failed Tests ({failed_tests}):")
            for result in self.test_results:
                if not result["passed"]:
                    self.log(f"   • {result['test']}: {result['details']}")
        else:
            self.log("✅ All tests passed! BCEE Phase 1 services are production-ready.")
            
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "all_passed": failed_tests == 0,
            "test_results": self.test_results
        }


async def main():
    """Main test execution"""
    tester = BCEEPhase1Tester()
    results = await tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results["all_passed"] else 1
    sys.exit(exit_code)


if __name__ == "__main__":
    asyncio.run(main())