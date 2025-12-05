"""
BCEE v1.0 - Price Display Service

Converts internal USD prices to user's regional currency with proper formatting.
All internal BANIBS prices remain in USD; this service only affects display.
"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.currency import PriceDisplay, MoneyValue, UserRegionProfile
from services.currency_config import CurrencyConfigService
from services.exchange_rate_service import ExchangeRateService
from services.user_region_service import UserRegionService


class PriceDisplayService:
    """
    Service for converting and formatting prices for display
    
    Converts internal USD prices to user's local currency and formats
    with appropriate symbols, separators, and decimal places.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.exchange_rate_service = ExchangeRateService(db)
        self.user_region_service = UserRegionService(db)
        self.base_currency = CurrencyConfigService.get_base_currency()
    
    async def get_display_price(
        self,
        base_amount: float,
        user_id: Optional[str] = None,
        target_currency: Optional[str] = None
    ) -> PriceDisplay:
        """
        Get complete price display information
        
        Args:
            base_amount: Amount in USD (base currency)
            user_id: Optional user ID for region detection
            target_currency: Optional currency override
        
        Returns:
            PriceDisplay with base USD price and optional local conversion
        """
        # Base price in USD
        base_money = MoneyValue(amount=base_amount, currency=self.base_currency)
        
        # Determine target currency
        if not target_currency:
            region = await self.user_region_service.get_user_region(user_id)
            target_currency = region.preferred_currency or self.base_currency
        
        # If target is same as base, no conversion needed
        if target_currency == self.base_currency:
            label = CurrencyConfigService.format_money(base_amount, self.base_currency)
            return PriceDisplay(
                base=base_money,
                local=None,
                label=label,
                exchange_rate=1.0
            )
        
        # Convert to target currency
        rate = await self.exchange_rate_service.get_rate(target_currency)
        
        if rate is None:
            # Rate not available, show USD only
            label = CurrencyConfigService.format_money(base_amount, self.base_currency)
            return PriceDisplay(
                base=base_money,
                local=None,
                label=label,
                exchange_rate=None
            )
        
        # Calculate local amount
        local_amount = base_amount * rate
        local_money = MoneyValue(amount=local_amount, currency=target_currency)
        
        # Format display label
        base_formatted = CurrencyConfigService.format_money(base_amount, self.base_currency)
        local_formatted = CurrencyConfigService.format_money(local_amount, target_currency)
        
        # Create label: "$10.00 (approx. ₦14,500)"
        if target_currency != self.base_currency:
            label = f"{base_formatted} (approx. {local_formatted})"
        else:
            label = base_formatted
        
        return PriceDisplay(
            base=base_money,
            local=local_money,
            label=label,
            exchange_rate=rate
        )
    
    async def format_price_simple(
        self,
        amount: float,
        currency: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> str:
        """
        Get simple formatted price string
        
        Args:
            amount: Amount in USD (base currency)
            currency: Optional currency override
            user_id: Optional user ID for region detection
        
        Returns:
            str: Formatted price string (e.g. "$10.00", "₦14,500")
        """
        # Determine target currency
        if not currency:
            region = await self.user_region_service.get_user_region(user_id)
            currency = region.preferred_currency or self.base_currency
        
        # Convert if needed
        if currency == self.base_currency:
            display_amount = amount
        else:
            rate = await self.exchange_rate_service.get_rate(currency)
            if rate is None:
                # Fallback to USD
                currency = self.base_currency
                display_amount = amount
            else:
                display_amount = amount * rate
        
        return CurrencyConfigService.format_money(display_amount, currency)
    
    async def convert_to_currency(
        self,
        base_amount: float,
        target_currency: str
    ) -> Optional[float]:
        """
        Convert base USD amount to target currency
        
        Args:
            base_amount: Amount in USD
            target_currency: Target currency code
        
        Returns:
            float: Converted amount, or None if rate unavailable
        """
        if target_currency == self.base_currency:
            return base_amount
        
        return await self.exchange_rate_service.convert(base_amount, target_currency)
    
    async def get_batch_display_prices(
        self,
        amounts: list[float],
        user_id: Optional[str] = None,
        target_currency: Optional[str] = None
    ) -> list[PriceDisplay]:
        """
        Get display prices for multiple amounts efficiently
        
        Args:
            amounts: List of amounts in USD
            user_id: Optional user ID for region detection
            target_currency: Optional currency override
        
        Returns:
            List of PriceDisplay objects
        """
        # Determine target currency once
        if not target_currency:
            region = await self.user_region_service.get_user_region(user_id)
            target_currency = region.preferred_currency or self.base_currency
        
        # Get exchange rate once
        rate = None
        if target_currency != self.base_currency:
            rate = await self.exchange_rate_service.get_rate(target_currency)
        
        # Process all amounts
        results = []
        for amount in amounts:
            base_money = MoneyValue(amount=amount, currency=self.base_currency)
            
            if target_currency == self.base_currency or rate is None:
                # No conversion
                label = CurrencyConfigService.format_money(amount, self.base_currency)
                results.append(PriceDisplay(
                    base=base_money,
                    local=None,
                    label=label,
                    exchange_rate=1.0 if target_currency == self.base_currency else None
                ))
            else:
                # Convert and format
                local_amount = amount * rate
                local_money = MoneyValue(amount=local_amount, currency=target_currency)
                
                base_formatted = CurrencyConfigService.format_money(amount, self.base_currency)
                local_formatted = CurrencyConfigService.format_money(local_amount, target_currency)
                label = f"{base_formatted} (approx. {local_formatted})"
                
                results.append(PriceDisplay(
                    base=base_money,
                    local=local_money,
                    label=label,
                    exchange_rate=rate
                ))
        
        return results
