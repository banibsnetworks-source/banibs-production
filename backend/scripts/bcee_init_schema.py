#!/usr/bin/env python3
"""
BCEE v1.0 - Schema Initialization Script

Initializes database indexes and verifies BCEE schema.
Run this after deploying BCEE to ensure optimal database performance.

Usage:
    python scripts/bcee_init_schema.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from db.bcee_schema import BCEESchema
from services.exchange_rate_service import ExchangeRateService
from datetime import datetime


async def main():
    print("\n" + "="*70)
    print("BCEE v1.0 - Database Schema Initialization")
    print("="*70 + "\n")
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    if not mongo_url:
        print("❌ ERROR: MONGO_URL environment variable not set")
        return 1
    
    print(f"📡 Connecting to MongoDB...")
    print(f"   Database: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Test connection
        await db.command('ping')
        print(f"✅ Connected to MongoDB\n")
        
        # Get current schema status
        print("📊 Current Schema Status:")
        schema_info = await BCEESchema.get_schema_info(db)
        print(f"   Exchange Rates: {schema_info['exchange_rates']['documents']} documents")
        print(f"   Users with Country: {schema_info['banibs_users']['users_with_country']}")
        print(f"   Users with Region: {schema_info['banibs_users']['users_with_region']}")
        print(f"   BCEE Indexes: {schema_info['bcee_indexes']}")
        print(f"   Status: {schema_info['status']}\n")
        
        # Ensure indexes
        print("🔧 Ensuring BCEE Indexes...")
        await BCEESchema.ensure_indexes(db)
        print()
        
        # Initialize dev exchange rates if needed
        exchange_service = ExchangeRateService(db)
        rates_count = await db.exchange_rates.count_documents({})
        
        if rates_count == 0:
            print("💱 Initializing Dev Exchange Rates...")
            await exchange_service.initialize_dev_rates()
            print()
        else:
            print(f"✅ Exchange rates already initialized ({rates_count} currencies)\n")
        
        # Verify final status
        print("✅ Verification:")
        final_info = await BCEESchema.get_schema_info(db)
        print(f"   Exchange Rates: {final_info['exchange_rates']['documents']} documents")
        print(f"   Exchange Rate Indexes: {final_info['exchange_rates']['indexes']}")
        print(f"   User Indexes: {final_info['banibs_users']['indexes']}")
        print(f"   BCEE Indexes: {final_info['bcee_indexes']}")
        print(f"   Status: {final_info['status']}\n")
        
        print("="*70)
        print("✅ BCEE Schema Initialization Complete")
        print("="*70 + "\n")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}\n")
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        client.close()


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
