"""
BCEE v1.0 - Currency & Exchange Models

Data models for multi-currency display and exchange rate management.
All prices stored in USD internally, displayed in local currencies.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MoneyValue(BaseModel):
    """
    Represents an amount of money in a specific currency
    """
    amount: float = Field(..., description="Monetary amount")
    currency: str = Field(..., description="ISO 4217 currency code (e.g. USD, NGN)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 10.0,
                "currency": "USD"
            }
        }


class ExchangeRate(BaseModel):
    """
    Exchange rate document stored in exchange_rates collection
    
    Rates are always relative to USD as base currency
    Example: 1 USD = 1450.25 NGN
    """
    id: Optional[str] = Field(None, description="MongoDB _id")
    base_currency: str = Field(default="USD", description="Base currency (always USD)")
    quote_currency: str = Field(..., description="Target currency code")
    rate: float = Field(..., description="Exchange rate (1 base = rate quote)")
    updated_at: str = Field(..., description="Last update timestamp (ISO format)")
    source: str = Field(default="manual", description="Rate source (api, manual, etc)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "base_currency": "USD",
                "quote_currency": "NGN",
                "rate": 1450.25,
                "updated_at": "2025-12-05T10:00:00Z",
                "source": "openexchangerates"
            }
        }


class PriceDisplay(BaseModel):
    """
    Complete price information for frontend display
    
    Includes both base USD price and optional local currency conversion
    """
    base: MoneyValue = Field(..., description="Official BANIBS price in USD")
    local: Optional[MoneyValue] = Field(None, description="Converted local price (if available)")
    label: str = Field(..., description="Formatted display label")
    exchange_rate: Optional[float] = Field(None, description="Rate used for conversion")
    
    class Config:
        json_schema_extra = {
            "example": {
                "base": {"amount": 10.0, "currency": "USD"},
                "local": {"amount": 14500, "currency": "NGN"},
                "label": "$10.00 (approx. ₦14,500)",
                "exchange_rate": 1450.0
            }
        }


class UserRegionProfile(BaseModel):
    """
    User's region and currency preferences
    
    Used to determine which currency to display
    """
    country_code: Optional[str] = Field(None, description="ISO 3166-1 alpha-2 country code")
    preferred_currency: Optional[str] = Field(None, description="User's preferred display currency")
    locale: Optional[str] = Field(None, description="Locale code (e.g. en-US, en-NG)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "country_code": "NG",
                "preferred_currency": "NGN",
                "locale": "en-NG"
            }
        }


class PaymentSession(BaseModel):
    """
    Payment session/checkout information
    """
    id: str = Field(..., description="Session ID")
    checkout_url: str = Field(..., description="Provider checkout URL")
    provider: str = Field(..., description="Payment provider (stripe, paypal, etc)")
    amount: float = Field(..., description="Amount in base currency")
    currency: str = Field(..., description="Currency code")
    status: str = Field(default="pending", description="pending | completed | failed | cancelled")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "cs_test_123",
                "checkout_url": "https://checkout.stripe.com/...",
                "provider": "stripe",
                "amount": 10.0,
                "currency": "USD",
                "status": "pending"
            }
        }
