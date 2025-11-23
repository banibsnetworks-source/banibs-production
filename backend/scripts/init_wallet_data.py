"""
BANIBS Wallet - Database Seeding Script
Phase 14.0

Populates sample wallet data for testing.
Note: In production, users create their own wallet data.
This is for demo/testing purposes only.
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from db.wallet import WalletDB

# Sample user ID for demo (replace with actual test user)
DEMO_USER_ID = "demo-user-wallet-001"


ACCOUNTS_DATA = [
    {
        "name": "Main Wallet",
        "type": "personal",
        "starting_balance": 2000.00,
        "is_primary": True
    },
    {
        "name": "Business Account",
        "type": "business",
        "starting_balance": 5000.00,
        "is_primary": False
    }
]


TRANSACTIONS_DATA = [
    {
        "amount": -85.50,
        "type": "expense",
        "category": "groceries",
        "description": "Weekly grocery shopping",
        "merchant_name": "Black Farmers Market",
        "is_black_owned": True,
        "date": datetime.utcnow() - timedelta(days=5)
    },
    {
        "amount": -45.00,
        "type": "expense",
        "category": "gas",
        "description": "Gas station fill-up",
        "merchant_name": "Shell",
        "is_black_owned": False,
        "date": datetime.utcnow() - timedelta(days=7)
    },
    {
        "amount": -125.00,
        "type": "expense",
        "category": "beauty",
        "description": "Hair appointment",
        "merchant_name": "Elegance Hair Salon",
        "is_black_owned": True,
        "date": datetime.utcnow() - timedelta(days=10)
    },
    {
        "amount": -180.00,
        "type": "expense",
        "category": "fashion",
        "description": "New sneakers",
        "merchant_name": "Black Excellence Sneakers",
        "is_black_owned": True,
        "date": datetime.utcnow() - timedelta(days=12)
    },
    {
        "amount": -150.00,
        "type": "expense",
        "category": "bills",
        "description": "Electric bill",
        "merchant_name": "Power Company",
        "is_black_owned": False,
        "date": datetime.utcnow() - timedelta(days=15)
    },
    {
        "amount": -50.00,
        "type": "expense",
        "category": "donation",
        "description": "Community fund donation",
        "merchant_name": "BANIBS Foundation",
        "is_black_owned": True,
        "date": datetime.utcnow() - timedelta(days=18)
    },
    {
        "amount": 1500.00,
        "type": "income",
        "category": "salary",
        "description": "Paycheck",
        "date": datetime.utcnow() - timedelta(days=20)
    },
    {
        "amount": -35.00,
        "type": "expense",
        "category": "food",
        "description": "Restaurant dinner",
        "merchant_name": "Soul Food Kitchen",
        "is_black_owned": True,
        "date": datetime.utcnow() - timedelta(days=3)
    }
]


GOALS_DATA = [
    {
        "name": "Emergency Fund",
        "target_amount": 1000.00,
        "current_amount": 350.00,
        "deadline": datetime.utcnow() + timedelta(days=180),
        "category": "savings"
    },
    {
        "name": "Pay Off Credit Card",
        "target_amount": 750.00,
        "current_amount": 200.00,
        "deadline": datetime.utcnow() + timedelta(days=90),
        "category": "debt"
    },
    {
        "name": "Business Startup Fund",
        "target_amount": 5000.00,
        "current_amount": 1200.00,
        "deadline": datetime.utcnow() + timedelta(days=365),
        "category": "investment"
    }
]


ENVELOPES_DATA = [
    {
        "name": "Groceries",
        "monthly_budget": 500.00,
        "category": "groceries"
    },
    {
        "name": "Transportation",
        "monthly_budget": 300.00,
        "category": "gas"
    },
    {
        "name": "Beauty & Personal Care",
        "monthly_budget": 200.00,
        "category": "beauty"
    },
    {
        "name": "Fun & Entertainment",
        "monthly_budget": 150.00,
        "category": "fun"
    },
    {
        "name": "Giving & Support",
        "monthly_budget": 100.00,
        "category": "donation"
    }
]


async def seed_wallet_data(wallet_db: WalletDB, user_id: str):
    """Seed all wallet data for a demo user"""
    
    print(f"\n💳 Seeding wallet data for user: {user_id}")
    
    # 1. Create accounts
    print("\n📁 Creating accounts...")
    account_ids = []
    for acc_data in ACCOUNTS_DATA:
        account = await wallet_db.create_wallet_account(user_id, acc_data)
        account_ids.append(account["id"])
        print(f"  ✓ Created account: {account['name']} (${account['current_balance']})")
    
    # Use first account for transactions
    primary_account_id = account_ids[0]
    
    # 2. Create transactions
    print("\n💸 Creating transactions...")
    for txn_data in TRANSACTIONS_DATA:
        txn_data["account_id"] = primary_account_id
        transaction = await wallet_db.create_transaction(user_id, txn_data)
        print(f"  ✓ {transaction['type']}: ${abs(transaction['amount'])} - {transaction.get('merchant_name', transaction['category'])}")
    
    # 3. Create goals
    print("\n🎯 Creating goals...")
    for goal_data in GOALS_DATA:
        goal_data["linked_account_id"] = primary_account_id
        goal = await wallet_db.create_goal(user_id, goal_data)
        progress = (goal["current_amount"] / goal["target_amount"]) * 100
        print(f"  ✓ Goal: {goal['name']} ({progress:.0f}% complete)")
    
    # 4. Create envelopes
    print("\n📊 Creating budget envelopes...")
    for env_data in ENVELOPES_DATA:
        envelope = await wallet_db.create_envelope(user_id, env_data)
        print(f"  ✓ Envelope: {envelope['name']} (${envelope['monthly_budget']}/month)")
    
    print(f"\n✅ Wallet seeding complete for user: {user_id}")


async def main():
    """Main seeding function"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")
    
    print(f"Connecting to MongoDB at {mongo_url}...")
    print(f"Using database: {db_name}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    wallet_db = WalletDB(db)
    
    # Check if demo data exists
    existing_accounts = await wallet_db.get_accounts_for_user(DEMO_USER_ID)
    if existing_accounts:
        print(f"\n⚠️  Wallet data already exists for {DEMO_USER_ID}!")
        response = input("Do you want to re-seed? This will duplicate data. (yes/no): ")
        if response.lower() != "yes":
            print("Seeding cancelled.")
            return
    
    print("\n" + "="*60)
    print("BANIBS WALLET - DEMO DATA SEEDING")
    print("="*60)
    
    try:
        await seed_wallet_data(wallet_db, DEMO_USER_ID)
        
        print("\n" + "="*60)
        print("✅ WALLET DEMO DATA SEEDING COMPLETE!")
        print("="*60)
        print(f"\nSeeded for demo user: {DEMO_USER_ID}")
        print(f"  • {len(ACCOUNTS_DATA)} accounts")
        print(f"  • {len(TRANSACTIONS_DATA)} transactions")
        print(f"  • {len(GOALS_DATA)} goals")
        print(f"  • {len(ENVELOPES_DATA)} envelopes")
        print("\n💳 BANIBS Wallet demo ready!")
        print("\nNote: Create your own wallet with real user authentication.")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
