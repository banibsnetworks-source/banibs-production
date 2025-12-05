"""
BCEE v1.0 - Database Schema Definition and Initialization

Defines the MongoDB schema for BANIBS Currency & Exchange Engine.
No new collections required - uses existing banibs_users and exchange_rates.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class BCEESchema:
    """
    BCEE Database Schema Manager
    
    Handles initialization and maintenance of BCEE-related database structures.
    """
    
    @staticmethod
    async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
        """
        Ensure all required indexes exist for BCEE collections
        
        Args:
            db: AsyncIOMotorDatabase instance
        """
        logger.info("🔧 BCEE: Ensuring database indexes...")
        
        # ============ EXCHANGE_RATES COLLECTION ============
        
        # Index for looking up exchange rates by currency pair
        await db.exchange_rates.create_index(
            [("base_currency", 1), ("quote_currency", 1)],
            unique=True,
            name="bcee_currency_pair_idx"
        )
        logger.info("✅ Created index: bcee_currency_pair_idx on exchange_rates")
        
        # Index for finding rates that need refresh (by timestamp)
        await db.exchange_rates.create_index(
            [("updated_at", 1)],
            name="bcee_updated_at_idx"
        )
        logger.info("✅ Created index: bcee_updated_at_idx on exchange_rates")
        
        # ============ BANIBS_USERS COLLECTION ============
        
        # Index for looking up users by country (for regional analytics)
        await db.banibs_users.create_index(
            [("detected_country", 1)],
            sparse=True,
            name="bcee_detected_country_idx"
        )
        logger.info("✅ Created index: bcee_detected_country_idx on banibs_users")
        
        # Compound index for region-based queries
        await db.banibs_users.create_index(
            [("region_primary", 1), ("detected_country", 1)],
            sparse=True,
            name="bcee_region_country_idx"
        )
        logger.info("✅ Created index: bcee_region_country_idx on banibs_users")
        
        logger.info("✅ BCEE indexes ensured")
    
    @staticmethod
    async def get_schema_info(db: AsyncIOMotorDatabase) -> dict:
        """
        Get current BCEE schema information
        
        Returns:
            Dict with schema statistics and status
        """
        # Count exchange rates
        rates_count = await db.exchange_rates.count_documents({})
        
        # Count users with BCEE data
        users_with_country = await db.banibs_users.count_documents(
            {"detected_country": {"$ne": None}}
        )
        users_with_region = await db.banibs_users.count_documents(
            {"region_primary": {"$ne": None}}
        )
        
        # Check indexes
        exchange_indexes = await db.exchange_rates.list_indexes().to_list(None)
        user_indexes = await db.banibs_users.list_indexes().to_list(None)
        
        bcee_indexes_count = sum(
            1 for idx in exchange_indexes + user_indexes
            if idx.get("name", "").startswith("bcee_")
        )
        
        return {
            "exchange_rates": {
                "documents": rates_count,
                "indexes": len(exchange_indexes)
            },
            "banibs_users": {
                "users_with_country": users_with_country,
                "users_with_region": users_with_region,
                "indexes": len(user_indexes)
            },
            "bcee_indexes": bcee_indexes_count,
            "status": "operational" if rates_count > 0 else "needs_initialization"
        }


# ============ SCHEMA DOCUMENTATION ============

"""
BCEE v1.0 MongoDB Schema
========================

## Collections Used

### 1. exchange_rates
Stores cached exchange rates for currency conversion.

Structure:
{
    "_id": ObjectId,
    "base_currency": "USD",              // Always USD (BANIBS base currency)
    "quote_currency": "NGN",             // Target currency code (ISO 4217)
    "rate": 1450.0,                      // Exchange rate (1 USD = rate quote_currency)
    "updated_at": ISODate,               // Last update timestamp
    "source": "dev" | "api"              // Rate source
}

Indexes:
- bcee_currency_pair_idx: (base_currency, quote_currency) [UNIQUE]
- bcee_updated_at_idx: (updated_at)

Notes:
- All rates are relative to USD as base
- TTL: 24 hours (checked by application, not MongoDB TTL)
- Dev mode: Static rates from ExchangeRateService.DEV_RATES
- Production: Fetched from external API (e.g., OpenExchangeRates)

### 2. banibs_users (Existing Collection - Extended)
Extended with BCEE-related region and preference fields.

BCEE Fields:
{
    "_id": ObjectId,
    "id": "uuid-string",                 // User ID
    
    // RCS-X Phase 1 fields (reused by BCEE)
    "detected_country": "NG",            // ISO 3166-1 alpha-2 country code
    "region_primary": "Africa",          // U.S., Africa, Caribbean, Global Diaspora
    "region_secondary": null,            // Optional secondary region
    "region_override": false,            // Manual vs. auto-detected
    "region_detection_method": "ip_geolocation" | "device_locale" | "default",
    
    // Optional: Currency preference (can be stored in metadata)
    "metadata": {
        "preferred_currency": "NGN"      // Optional currency override
    },
    
    ... // Other user fields
}

Indexes:
- bcee_detected_country_idx: (detected_country) [SPARSE]
- bcee_region_country_idx: (region_primary, detected_country) [SPARSE]

Notes:
- Fields already exist from RCS-X Phase 1 (Region Content System)
- BCEE reuses these fields for currency detection
- No migration needed for existing users (fields are optional)
- Currency preference can be stored in metadata or as separate field

## Schema Design Principles

1. **No New Collections**: Reuses existing collections to minimize complexity
2. **MongoDB Compatible**: All fields are optional and flexible
3. **AWS/Atlas Ready**: Schema works identically on MongoDB Atlas
4. **Backward Compatible**: Existing users continue working without migration
5. **Abstracted**: No provider-specific fields (Stripe, PayPal, etc.)

## Migration Notes

- **No migration required**: All fields already exist or are optional
- Existing users: Fields will be null/None until they interact with BCEE
- New users: Fields populated during registration via UserRegionService
- Exchange rates: Initialized on first ExchangeRateService.initialize_dev_rates() call

## Future Considerations

### When Payment Providers Are Implemented:

May need to add (as separate optional collection or in metadata):
- payment_methods collection for stored payment info
- payment_sessions collection for checkout sessions
- transaction_history collection for audit logs

These will be added in future phases when concrete payment providers
(Stripe, PayPal, etc.) are implemented.
"""
