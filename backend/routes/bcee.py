"""
BCEE v1.0 - BANIBS Currency & Exchange Engine API Routes

Provides endpoints for multi-currency price display and regional preferences.
All monetary values stored in USD, displayed in user's local currency.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel, Field

from models.currency import (
    UserRegionProfile,
    PriceDisplay,
    MoneyValue
)
from services.user_region_service import UserRegionService
from services.price_display_service import PriceDisplayService
from services.currency_config import CurrencyConfigService
from services.exchange_rate_service import ExchangeRateService
from middleware.auth_guard import get_current_user, get_current_user_optional
from db.connection import get_db_client


router = APIRouter(prefix="/api/bcee", tags=["BCEE - Currency & Exchange"])


# ============ REQUEST/RESPONSE MODELS ============

class UpdateRegionRequest(BaseModel):
    """Request body for updating user's region preferences"""
    country_code: str = Field(..., description="ISO 3166-1 alpha-2 country code (e.g. US, NG, GB)")
    preferred_currency: Optional[str] = Field(None, description="Optional currency override")


class CurrencyInfo(BaseModel):
    """Detailed currency information"""
    code: str = Field(..., description="ISO 4217 currency code")
    symbol: str = Field(..., description="Currency symbol")
    name: str = Field(..., description="Currency name")
    decimals: int = Field(..., description="Number of decimal places")


class SupportedCurrenciesResponse(BaseModel):
    """Response for supported currencies endpoint"""
    base_currency: str = Field(..., description="Base currency for BANIBS (always USD)")
    supported_currencies: List[CurrencyInfo] = Field(..., description="List of supported currencies")
    total_count: int = Field(..., description="Total number of supported currencies")


class ExchangeRatesResponse(BaseModel):
    """Response for exchange rates endpoint"""
    base_currency: str = Field(..., description="Base currency (USD)")
    rates: dict = Field(..., description="Currency code to rate mapping")
    last_updated: Optional[str] = Field(None, description="Last update timestamp")
    source: str = Field(..., description="Rate source (dev, api)")


class BatchPriceRequest(BaseModel):
    """Request body for batch price display"""
    amounts: List[float] = Field(..., description="List of amounts in USD to convert")
    target_currency: Optional[str] = Field(None, description="Optional target currency override")


class BatchPriceResponse(BaseModel):
    """Response for batch price display"""
    prices: List[PriceDisplay] = Field(..., description="List of converted price displays")
    target_currency: str = Field(..., description="Currency used for conversion")


# ============ ENDPOINTS ============

@router.get("/user-region", response_model=UserRegionProfile)
async def get_user_region(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user's region and currency preferences
    
    Returns user's detected or manually set region/currency preferences.
    Falls back to US/USD if not set.
    
    **Requires authentication**
    """
    db = get_db_client()
    service = UserRegionService(db)
    
    user_id = current_user.get("id")
    region = await service.get_user_region(user_id)
    
    return region


@router.get("/price-display", response_model=PriceDisplay)
async def get_price_display(
    amount: float = Query(..., description="Amount in USD (base currency)", gt=0),
    target_currency: Optional[str] = Query(None, description="Optional currency override"),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Convert USD price to user's regional currency with formatting
    
    Converts a base USD amount to the user's local currency (or specified target currency)
    and returns formatted display information.
    
    **Authentication optional** - works for both logged-in and anonymous users
    
    Example responses:
    - User in Nigeria: `{"base": {"amount": 10.0, "currency": "USD"}, "local": {"amount": 14500, "currency": "NGN"}, "label": "$10.00 (approx. ₦14,500)"}`
    - User in US: `{"base": {"amount": 10.0, "currency": "USD"}, "label": "$10.00"}`
    """
    db = get_db_client()
    service = PriceDisplayService(db)
    
    user_id = current_user.get("id") if current_user else None
    
    try:
        display = await service.get_display_price(
            base_amount=amount,
            user_id=user_id,
            target_currency=target_currency
        )
        return display
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate price display: {str(e)}")


@router.post("/price-display/batch", response_model=BatchPriceResponse)
async def get_batch_price_display(
    request: BatchPriceRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Convert multiple USD prices to user's regional currency
    
    Efficiently converts multiple USD amounts in a single request.
    Useful for product listings, pricing tables, etc.
    
    **Authentication optional**
    """
    db = get_db_client()
    service = PriceDisplayService(db)
    
    user_id = current_user.get("id") if current_user else None
    
    if not request.amounts:
        raise HTTPException(status_code=400, detail="amounts list cannot be empty")
    
    if len(request.amounts) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 amounts per request")
    
    try:
        prices = await service.get_batch_display_prices(
            amounts=request.amounts,
            user_id=user_id,
            target_currency=request.target_currency
        )
        
        # Determine which currency was used
        target_currency = request.target_currency
        if not target_currency:
            region = await UserRegionService(db).get_user_region(user_id)
            target_currency = region.preferred_currency or "USD"
        
        return BatchPriceResponse(
            prices=prices,
            target_currency=target_currency
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate batch prices: {str(e)}")


@router.post("/update-region", response_model=UserRegionProfile)
async def update_user_region(
    request: UpdateRegionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user's region and currency preferences
    
    Allows users to manually set their region/currency preferences.
    This overrides automatic detection.
    
    **Requires authentication**
    """
    db = get_db_client()
    service = UserRegionService(db)
    
    user_id = current_user.get("id")
    
    # Validate country code format (2 letters)
    if len(request.country_code) != 2:
        raise HTTPException(
            status_code=400,
            detail="country_code must be 2-letter ISO 3166-1 alpha-2 code (e.g. US, NG, GB)"
        )
    
    # Update region
    success = await service.update_user_region(
        user_id=user_id,
        country_code=request.country_code,
        preferred_currency=request.preferred_currency
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to update region. Invalid currency or user not found."
        )
    
    # Return updated region
    updated_region = await service.get_user_region(user_id)
    return updated_region


@router.get("/supported-currencies", response_model=SupportedCurrenciesResponse)
async def get_supported_currencies():
    """
    Get list of all supported currencies
    
    Returns detailed information about all currencies supported by BCEE.
    
    **No authentication required**
    """
    base_currency = CurrencyConfigService.get_base_currency()
    supported = CurrencyConfigService.get_supported_currencies()
    
    currencies_info = []
    for code in supported:
        info = CurrencyConfigService.get_currency_info(code)
        currencies_info.append(CurrencyInfo(
            code=code,
            symbol=info.get("symbol", code),
            name=info.get("name", code),
            decimals=info.get("decimals", 2)
        ))
    
    return SupportedCurrenciesResponse(
        base_currency=base_currency,
        supported_currencies=currencies_info,
        total_count=len(currencies_info)
    )


@router.get("/exchange-rates", response_model=ExchangeRatesResponse)
async def get_exchange_rates():
    """
    Get current exchange rates for all supported currencies
    
    Returns exchange rates relative to USD (base currency).
    Rates are from dev mode (static) or cached from external API.
    
    **No authentication required**
    
    Example response:
    ```json
    {
        "base_currency": "USD",
        "rates": {
            "USD": 1.0,
            "NGN": 1450.0,
            "GBP": 0.79,
            "EUR": 0.92
        },
        "source": "dev"
    }
    ```
    """
    db = get_db_client()
    service = ExchangeRateService(db)
    
    rates = await service.get_all_rates()
    base_currency = CurrencyConfigService.get_base_currency()
    
    return ExchangeRatesResponse(
        base_currency=base_currency,
        rates=rates,
        source="dev" if service.use_dev_mode else "api"
    )


@router.get("/health")
async def bcee_health_check():
    """
    BCEE system health check
    
    **No authentication required**
    """
    return {
        "service": "BCEE",
        "version": "1.0",
        "status": "operational",
        "base_currency": CurrencyConfigService.get_base_currency(),
        "supported_currencies_count": len(CurrencyConfigService.get_supported_currencies())
    }
