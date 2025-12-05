# BCEE v1.0 - Database Schema Documentation

## Overview

BCEE (BANIBS Currency & Exchange Engine) uses a **minimal schema approach** that reuses existing MongoDB collections. No new collections are required for Phase 1-3 implementation.

---

## Collections

### 1. `exchange_rates`

**Purpose**: Cache exchange rates for multi-currency price display

**Structure**:
```json
{
  "_id": ObjectId("..."),
  "base_currency": "USD",
  "quote_currency": "NGN",
  "rate": 1450.0,
  "updated_at": "2025-12-05T08:06:58Z",
  "source": "dev"
}
```

**Indexes**:
- `bcee_currency_pair_idx`: `(base_currency, quote_currency)` [UNIQUE]
- `bcee_updated_at_idx`: `(updated_at)`

**Notes**:
- All rates are relative to USD (base currency)
- Cache TTL: 24 hours (application-managed, not MongoDB TTL)
- Dev mode: Static rates from `ExchangeRateService.DEV_RATES`
- Production: Will fetch from external API (OpenExchangeRates, etc.)

**Sample Query**:
```javascript
// Get NGN exchange rate
db.exchange_rates.findOne({
  base_currency: "USD",
  quote_currency: "NGN"
})
```

---

### 2. `banibs_users` (Extended)

**Purpose**: Store user region and currency preferences

**BCEE Fields** (added to existing user model):
```json
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  
  // RCS-X Phase 1 fields (reused by BCEE)
  "detected_country": "NG",           // ISO 3166-1 alpha-2
  "region_primary": "Africa",         // U.S., Africa, Caribbean, Global Diaspora
  "region_secondary": null,           // Optional secondary region
  "region_override": false,           // Manual vs auto-detected
  "region_detection_method": "ip_geolocation",
  
  // Optional currency preference
  "metadata": {
    "preferred_currency": "NGN"       // Can override country default
  }
}
```

**Indexes**:
- `bcee_detected_country_idx`: `(detected_country)` [SPARSE]
- `bcee_region_country_idx`: `(region_primary, detected_country)` [SPARSE]

**Notes**:
- Fields already exist from RCS-X Phase 1 (Region Content System)
- BCEE reuses these fields for currency detection
- All fields are optional (no migration needed)
- Sparse indexes (only index non-null values)

**Sample Queries**:
```javascript
// Get user's region for currency detection
db.banibs_users.findOne(
  { id: "user-uuid" },
  { detected_country: 1, region_primary: 1, metadata: 1 }
)

// Count users by country
db.banibs_users.aggregate([
  { $match: { detected_country: { $ne: null } } },
  { $group: { _id: "$detected_country", count: { $sum: 1 } } }
])
```

---

## Schema Design Principles

### 1. Minimal Changes
- **Zero new collections** for Phase 1-3
- Reuses existing `banibs_users` fields from RCS-X Phase 1
- Only adds indexes for performance

### 2. MongoDB/Atlas Compatible
- All fields are optional and flexible
- Works identically on self-hosted MongoDB or Atlas
- No MongoDB version dependencies
- Schema portable to any MongoDB deployment

### 3. Backward Compatible
- Existing users continue working without migration
- Fields will be null until BCEE interaction
- No breaking changes to existing APIs

### 4. Provider Agnostic
- No Stripe/PayPal/provider-specific fields
- Payment provider data will be separate (Phase 4+)
- Abstract payment interface maintained

---

## Migration Status

### ✅ Phase 3 Complete

**What Was Done**:
- ✅ Schema analysis completed
- ✅ 4 BCEE indexes created
- ✅ Exchange rates initialized (11 currencies)
- ✅ Schema documentation created
- ✅ Initialization script created

**What Was NOT Needed**:
- ❌ No new collections
- ❌ No data migration
- ❌ No existing field modifications
- ❌ No breaking changes

**Current State**:
- Exchange rates: 11 documents
- BCEE indexes: 4 created
- User BCEE fields: Available but mostly null (will populate on usage)

---

## Index Performance

All indexes use MongoDB's default B-tree structure for optimal query performance:

| Index | Collection | Purpose | Impact |
|-------|-----------|---------|--------|
| `bcee_currency_pair_idx` | exchange_rates | Rate lookup by currency pair | O(log n) → O(1) |
| `bcee_updated_at_idx` | exchange_rates | Find stale rates for refresh | O(log n) |
| `bcee_detected_country_idx` | banibs_users | Region detection queries | O(log n) |
| `bcee_region_country_idx` | banibs_users | Regional analytics | O(log n) |

**Sparse indexes** are used on user fields to save space (only index non-null values).

---

## Future Considerations

### Payment Provider Implementation (Phase 4+)

When concrete payment providers (Stripe, PayPal) are implemented, may need:

**Option 1**: New collections (recommended)
```javascript
// payment_methods collection
{
  user_id: "uuid",
  provider: "stripe",
  payment_method_id: "pm_123",
  type: "card",
  last4: "4242",
  created_at: ISODate
}

// payment_sessions collection
{
  session_id: "cs_123",
  user_id: "uuid",
  amount: 10.0,
  currency: "USD",
  status: "pending",
  created_at: ISODate
}
```

**Option 2**: User metadata (simpler for now)
```javascript
{
  metadata: {
    stripe_customer_id: "cus_123",
    preferred_payment_method: "card"
  }
}
```

These decisions will be made when payment providers are implemented.

---

## AWS/Atlas Deployment

### Compatibility

This schema is **100% compatible** with:
- MongoDB Atlas (any region)
- Self-hosted MongoDB on AWS EC2
- MongoDB in Docker (current dev setup)

### Migration to AWS

**No schema changes needed** when migrating to AWS:

1. **If using MongoDB Atlas**:
   ```bash
   # Export from current MongoDB
   mongodump --uri="$MONGO_URL" --db=test_database
   
   # Import to Atlas
   mongorestore --uri="$ATLAS_CONNECTION_STRING" --db=production_db
   ```

2. **If using self-hosted on EC2**:
   - Docker Compose with MongoDB container, OR
   - Install MongoDB directly on EC2
   - Same connection string pattern: `mongodb://localhost:27017`

3. **Run initialization**:
   ```bash
   python3 scripts/bcee_init_schema.py
   ```

---

## Maintenance

### Regular Tasks

**Check Schema Health**:
```python
from db.bcee_schema import BCEESchema

schema_info = await BCEESchema.get_schema_info(db)
print(schema_info)
```

**Refresh Exchange Rates** (when external API is added):
```python
from services.exchange_rate_service import ExchangeRateService

service = ExchangeRateService(db)
await service.refresh_rates()  # Fetches latest rates from API
```

**Verify Indexes**:
```bash
python3 scripts/bcee_init_schema.py
```

---

## Summary

✅ **Minimal Schema Impact**: Zero new collections, reuses existing fields  
✅ **Production Ready**: Indexes in place, documented, tested  
✅ **AWS Compatible**: Works on Atlas, EC2, Docker without changes  
✅ **Portable**: No cloud vendor lock-in  
✅ **Backward Compatible**: No migration required for existing users  

**Next**: Phase 4 (Frontend PriceTag component) can proceed immediately.
