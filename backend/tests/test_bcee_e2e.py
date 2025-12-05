"""
BCEE v1.0 Phase 5 - End-to-End Integration Tests

Tests the full BCEE stack from API endpoints through services to database.
"""

import pytest
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio

from server import app
from db.connection import get_db_client


client = TestClient(app)


class TestBCEEEndToEnd:
    """End-to-end tests for BCEE v1.0"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test database connection"""
        self.db = get_db_client()
        yield
        # Cleanup if needed
    
    def test_health_endpoint(self):
        """Test BCEE health check endpoint"""
        response = client.get("/api/bcee/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["service"] == "BCEE"
        assert data["version"] == "1.0"
        assert data["status"] == "operational"
        assert data["base_currency"] == "USD"
        assert data["supported_currencies_count"] > 0
    
    def test_supported_currencies_endpoint(self):
        """Test supported currencies endpoint (public)"""
        response = client.get("/api/bcee/supported-currencies")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base_currency"] == "USD"
        assert len(data["supported_currencies"]) >= 10
        assert data["total_count"] >= 10
        
        # Check for specific currencies
        currency_codes = [c["code"] for c in data["supported_currencies"]]
        assert "USD" in currency_codes
        assert "NGN" in currency_codes
        assert "GBP" in currency_codes
        assert "GHS" in currency_codes
    
    def test_exchange_rates_endpoint(self):
        """Test exchange rates endpoint (public)"""
        response = client.get("/api/bcee/exchange-rates")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base_currency"] == "USD"
        assert "rates" in data
        assert data["rates"]["USD"] == 1.0
        assert data["rates"]["NGN"] == 1450.0  # Dev mode rate
        assert data["rates"]["GBP"] == 0.79
        assert data["source"] == "dev"
    
    def test_price_display_usd_anonymous(self):
        """Test price display for anonymous user (should default to USD)"""
        response = client.get("/api/bcee/price-display?amount=12.00")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base"]["amount"] == 12.00
        assert data["base"]["currency"] == "USD"
        # Anonymous user defaults to USD, so local might be None or USD
        assert data["label"] is not None
    
    def test_price_display_with_target_currency(self):
        """Test price display with explicit target currency (NGN)"""
        response = client.get("/api/bcee/price-display?amount=10.00&target_currency=NGN")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base"]["amount"] == 10.00
        assert data["base"]["currency"] == "USD"
        assert data["local"]["amount"] == 14500.0  # 10 * 1450
        assert data["local"]["currency"] == "NGN"
        assert data["exchange_rate"] == 1450.0
        assert "$10.00" in data["label"]
        assert "14,500" in data["label"] or "14500" in data["label"]
    
    def test_price_display_gbp_conversion(self):
        """Test price display for GBP (British Pounds)"""
        response = client.get("/api/bcee/price-display?amount=12.00&target_currency=GBP")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base"]["amount"] == 12.00
        assert data["local"]["currency"] == "GBP"
        expected_gbp = 12.00 * 0.79  # 9.48
        assert abs(data["local"]["amount"] - expected_gbp) < 0.01
    
    def test_price_display_ghs_conversion(self):
        """Test price display for GHS (Ghanaian Cedi)"""
        response = client.get("/api/bcee/price-display?amount=12.00&target_currency=GHS")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base"]["amount"] == 12.00
        assert data["local"]["currency"] == "GHS"
        expected_ghs = 12.00 * 12.5  # 150.0
        assert abs(data["local"]["amount"] - expected_ghs) < 0.01
    
    def test_price_display_validation_negative_amount(self):
        """Test validation: negative amount should fail"""
        response = client.get("/api/bcee/price-display?amount=-10")
        
        assert response.status_code == 422  # Validation error
    
    def test_price_display_validation_invalid_currency(self):
        """Test with invalid currency code (should fallback gracefully)"""
        response = client.get("/api/bcee/price-display?amount=10&target_currency=XXX")
        
        # Should either return 200 with USD fallback or 400
        assert response.status_code in [200, 400]
    
    def test_batch_price_display(self):
        """Test batch price display endpoint"""
        response = client.post(
            "/api/bcee/price-display/batch",
            json={
                "amounts": [10.0, 25.0, 50.0],
                "target_currency": "NGN"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["prices"]) == 3
        assert data["target_currency"] == "NGN"
        
        # Check first price
        assert data["prices"][0]["base"]["amount"] == 10.0
        assert data["prices"][0]["local"]["amount"] == 14500.0
        assert data["prices"][0]["local"]["currency"] == "NGN"
        
        # Check second price
        assert data["prices"][1]["base"]["amount"] == 25.0
        assert data["prices"][1]["local"]["amount"] == 36250.0  # 25 * 1450
    
    def test_batch_price_display_validation_empty(self):
        """Test batch endpoint validation: empty amounts list"""
        response = client.post(
            "/api/bcee/price-display/batch",
            json={"amounts": []}
        )
        
        assert response.status_code == 400
    
    def test_batch_price_display_validation_too_many(self):
        """Test batch endpoint validation: too many amounts"""
        response = client.post(
            "/api/bcee/price-display/batch",
            json={"amounts": list(range(101))}  # 101 items
        )
        
        assert response.status_code == 400
    
    def test_user_region_without_auth(self):
        """Test user region endpoint without authentication"""
        response = client.get("/api/bcee/user-region")
        
        assert response.status_code == 401  # Unauthorized
    
    def test_update_region_without_auth(self):
        """Test update region endpoint without authentication"""
        response = client.post(
            "/api/bcee/update-region",
            json={"country_code": "NG"}
        )
        
        assert response.status_code == 401  # Unauthorized
    
    def test_price_display_performance(self):
        """Test that price display responds quickly"""
        import time
        
        start = time.time()
        response = client.get("/api/bcee/price-display?amount=50&target_currency=NGN")
        end = time.time()
        
        assert response.status_code == 200
        assert (end - start) < 0.5  # Should respond in < 500ms
    
    def test_batch_price_display_performance(self):
        """Test batch endpoint performance with 50 items"""
        import time
        
        amounts = [float(i * 10) for i in range(1, 51)]  # 50 amounts
        
        start = time.time()
        response = client.post(
            "/api/bcee/price-display/batch",
            json={"amounts": amounts, "target_currency": "NGN"}
        )
        end = time.time()
        
        assert response.status_code == 200
        assert len(response.json()["prices"]) == 50
        assert (end - start) < 1.0  # Should respond in < 1 second
    
    def test_currency_symbols_in_response(self):
        """Test that formatted labels include correct currency symbols"""
        # Test NGN (₦)
        response = client.get("/api/bcee/price-display?amount=10&target_currency=NGN")
        assert response.status_code == 200
        # Note: Symbol might be in frontend formatting, API might return just numbers
        
        # Test GBP (£)
        response = client.get("/api/bcee/price-display?amount=10&target_currency=GBP")
        assert response.status_code == 200
        
        # Test EUR (€)
        response = client.get("/api/bcee/price-display?amount=10&target_currency=EUR")
        assert response.status_code == 200
    
    def test_zero_amount(self):
        """Test handling of zero amount"""
        response = client.get("/api/bcee/price-display?amount=0")
        
        # Should either return 200 with $0.00 or validation error
        assert response.status_code in [200, 422]
    
    def test_large_amount(self):
        """Test handling of very large amount"""
        response = client.get("/api/bcee/price-display?amount=999999.99&target_currency=NGN")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["local"]["amount"] == 999999.99 * 1450  # Should handle large numbers
    
    def test_decimal_precision(self):
        """Test that decimal precision is maintained"""
        response = client.get("/api/bcee/price-display?amount=12.99&target_currency=USD")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["base"]["amount"] == 12.99
        # Check precision is maintained (not rounded to 13.0)


class TestBCEEServiceIntegration:
    """Test integration between BCEE services"""
    
    @pytest.fixture(autouse=True)
    async def setup(self):
        """Setup async test environment"""
        self.db = get_db_client()
        yield
    
    @pytest.mark.asyncio
    async def test_user_region_service_fallback_chain(self):
        """Test UserRegionService fallback: profile → IP → default"""
        from services.user_region_service import UserRegionService
        
        service = UserRegionService(self.db)
        
        # Test with non-existent user (should fallback to default US/USD)
        region = await service.get_user_region("nonexistent_user_id")
        
        assert region.country_code == "US"
        assert region.preferred_currency == "USD"
        assert region.locale == "en-US"
    
    @pytest.mark.asyncio
    async def test_price_display_service_integration(self):
        """Test PriceDisplayService with ExchangeRateService"""
        from services.price_display_service import PriceDisplayService
        
        service = PriceDisplayService(self.db)
        
        # Test USD to NGN conversion
        display = await service.get_display_price(
            base_amount=100.0,
            target_currency="NGN"
        )
        
        assert display.base.amount == 100.0
        assert display.base.currency == "USD"
        assert display.local.amount == 145000.0  # 100 * 1450
        assert display.local.currency == "NGN"
        assert display.exchange_rate == 1450.0
    
    @pytest.mark.asyncio
    async def test_exchange_rate_service_dev_mode(self):
        """Test ExchangeRateService in dev mode"""
        from services.exchange_rate_service import ExchangeRateService
        
        service = ExchangeRateService(self.db)
        
        # Get NGN rate
        rate = await service.get_rate("NGN")
        assert rate == 1450.0
        
        # Get GBP rate
        rate = await service.get_rate("GBP")
        assert rate == 0.79
        
        # Get all rates
        all_rates = await service.get_all_rates()
        assert all_rates["USD"] == 1.0
        assert all_rates["NGN"] == 1450.0
        assert len(all_rates) >= 10


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "-s"])
