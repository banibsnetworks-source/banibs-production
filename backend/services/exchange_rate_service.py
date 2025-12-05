"""
BCEE v1.0 - Exchange Rate Service

Manages currency exchange rates with caching and fallback to static rates in dev mode.
All rates are relative to USD as base currency.
"""

import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.currency import ExchangeRate
from services.currency_config import CurrencyConfigService


class ExchangeRateService:
    """
    Service for managing exchange rates
    
    In dev mode: Uses static test rates
    In production: Can integrate with external API (OpenExchangeRates, etc.)
    """
    
    # Static test rates for development (1 USD = X)
    DEV_RATES = {
        "USD": 1.0,
        "NGN": 1450.0,   # Nigerian Naira
        "GHS": 12.5,     # Ghanaian Cedi
        "ZAR": 18.5,     # South African Rand
        "KES": 155.0,    # Kenyan Shilling
        "GBP": 0.79,     # British Pound
        "EUR": 0.92,     # Euro
        "CAD": 1.36,     # Canadian Dollar
        "XOF": 605.0,    # West African CFA Franc
        "JMD": 155.0,    # Jamaican Dollar
        "TTD": 6.8,      # Trinidad and Tobago Dollar
        "BBD": 2.0,      # Barbadian Dollar
    }
    
    # Cache TTL in hours
    CACHE_TTL_HOURS = 24
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.rates_collection = db.exchange_rates
        self.use_dev_mode = os.getenv("BCEE_USE_DEV_RATES", "true").lower() == "true"
    
    async def get_rate(self, target_currency: str) -> Optional[float]:
        """
        Get exchange rate for converting USD to target currency
        
        Args:
            target_currency: Target currency code
        
        Returns:
            float: Exchange rate (1 USD = rate target_currency), or None if unavailable
        """
        base_currency = CurrencyConfigService.get_base_currency()
        
        # If target is base currency, rate is 1.0
        if target_currency == base_currency:
            return 1.0
        
        # Dev mode: use static rates
        if self.use_dev_mode:
            return self.DEV_RATES.get(target_currency)
        
        # Production mode: check cache first
        cached_rate = await self._get_cached_rate(target_currency)
        if cached_rate:
            return cached_rate
        
        # If no cached rate, try to fetch fresh (future: external API)
        # For now, fall back to dev rates
        return self.DEV_RATES.get(target_currency)
    
    async def _get_cached_rate(self, target_currency: str) -> Optional[float]:
        """
        Get rate from cache if not expired
        
        Args:
            target_currency: Target currency code
        
        Returns:
            float or None
        """
        base_currency = CurrencyConfigService.get_base_currency()
        
        rate_doc = await self.rates_collection.find_one({
            "base_currency": base_currency,
            "quote_currency": target_currency
        })
        
        if not rate_doc:
            return None
        
        # Check if rate is still fresh
        updated_at = datetime.fromisoformat(rate_doc["updated_at"])
        now = datetime.now(timezone.utc)
        age_hours = (now - updated_at).total_seconds() / 3600
        
        if age_hours > self.CACHE_TTL_HOURS:
            return None  # Expired
        
        return rate_doc.get("rate")
    
    async def convert(self, amount: float, target_currency: str) -> Optional[float]:
        """
        Convert amount from USD to target currency
        
        Args:
            amount: Amount in USD
            target_currency: Target currency code
        
        Returns:
            float: Converted amount, or None if rate unavailable
        """
        rate = await self.get_rate(target_currency)
        
        if rate is None:
            return None
        
        return amount * rate
    
    async def refresh_rates(self, rates: Optional[Dict[str, float]] = None) -> int:
        """
        Refresh exchange rates in cache
        
        Args:
            rates: Optional dict of currency_code -> rate
                   If None, uses dev rates
        
        Returns:
            int: Number of rates updated
        """
        if rates is None:
            rates = self.DEV_RATES
        
        base_currency = CurrencyConfigService.get_base_currency()
        now = datetime.now(timezone.utc).isoformat()
        count = 0
        
        for currency, rate in rates.items():
            if currency == base_currency:
                continue  # Skip base currency
            
            await self.rates_collection.update_one(
                {
                    "base_currency": base_currency,
                    "quote_currency": currency
                },
                {
                    "$set": {
                        "rate": rate,
                        "updated_at": now,
                        "source": "dev" if self.use_dev_mode else "api"
                    }
                },
                upsert=True
            )
            count += 1
        
        return count
    
    async def get_all_rates(self) -> Dict[str, float]:
        """
        Get all current exchange rates
        
        Returns:
            Dict mapping currency code to rate
        """
        if self.use_dev_mode:
            return self.DEV_RATES.copy()
        
        base_currency = CurrencyConfigService.get_base_currency()
        rates = {base_currency: 1.0}
        
        cursor = self.rates_collection.find({"base_currency": base_currency})
        async for doc in cursor:
            rates[doc["quote_currency"]] = doc["rate"]
        
        return rates
    
    async def initialize_dev_rates(self) -> None:
        """
        Initialize database with dev rates for testing
        """
        if self.use_dev_mode:
            await self.refresh_rates(self.DEV_RATES)
            print(f"✅ Initialized {len(self.DEV_RATES)} dev exchange rates")
