"""
BANIBS Marketplace - Payout Test Data Initialization
Phase 16.2

Sets up test scenarios for payout functionality:
1. Orders with different clearing statuses
2. Sample payout requests
3. Seller balances
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
from uuid import uuid4

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient


async def init_payout_test_data():
    print("=" * 60)
    print("BANIBS MARKETPLACE - PAYOUT TEST DATA INITIALIZATION")
    print("=" * 60)
    
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Collections
    sellers_col = db.marketplace_sellers
    orders_col = db.marketplace_orders
    payouts_col = db.marketplace_payout_requests
    
    # Get test seller
    test_seller = await sellers_col.find_one({"business_name": "Test Seller Business"})
    
    if not test_seller:
        print("❌ Test seller not found. Please run marketplace seed script first.")
        client.close()
        return
    
    seller_id = test_seller["id"]
    user_id = test_seller["user_id"]
    
    print(f"\n✅ Found test seller: {test_seller['business_name']}")
    print(f"   Seller ID: {seller_id}")
    print(f"   User ID: {user_id}")
    
    # ==================== UPDATE EXISTING ORDERS ====================
    
    print("\n📦 Updating existing orders...")
    
    # Find existing paid orders for this seller
    existing_orders = await orders_col.find({
        "seller_id": seller_id,
        "payment_status": "paid"
    }).to_list(100)
    
    if existing_orders:
        # Update orders to have clearing_status
        for order in existing_orders:
            # Make one order old enough for clearing
            if existing_orders.index(order) == 0:
                # Set created_at to 3 days ago
                old_date = (datetime.utcnow() - timedelta(days=3)).isoformat()
                await orders_col.update_one(
                    {"id": order["id"]},
                    {
                        "$set": {
                            "clearing_status": "pending",
                            "created_at": old_date
                        }
                    }
                )
                print(f"   ✅ Order {order['order_number']} - Set to 3 days old (ready for clearing)")
            else:
                # Keep recent
                await orders_col.update_one(
                    {"id": order["id"]},
                    {"$set": {"clearing_status": "pending"}}
                )
                print(f"   ✅ Order {order['order_number']} - Kept recent (not yet clearable)")
    
    # ==================== CREATE NEW TEST ORDERS ====================
    
    print("\n📦 Creating additional test orders...")
    
    # Order 1: Recent paid order (clearing_status = pending)
    order1 = {
        "id": f"order-{str(uuid4())[:8]}",
        "order_number": f"ORD-TEST-{str(uuid4())[:6].upper()}",
        "buyer_id": user_id,
        "seller_id": seller_id,
        "total_amount": 85.00,
        "shipping_cost": 0.0,
        "tax": 0.0,
        "platform_fee_amount": 10.20,  # 12% for digital
        "seller_net_amount": 74.80,
        "grand_total": 85.00,
        "status": "processing",
        "payment_method": "banibs_wallet",
        "payment_status": "paid",
        "clearing_status": "pending",
        "wallet_transaction_id": f"wt-{str(uuid4())[:8]}",
        "shipping_address": None,
        "buyer_region": "North America",
        "seller_region": "North America",
        "is_same_region": True,
        "is_refundable": False,
        "refund_window_days": 1,
        "refund_status": "none",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await orders_col.insert_one(order1)
    print(f"   ✅ Created order: {order1['order_number']} (recent, not yet clearable)")
    
    # Order 2: Old paid order (ready for clearing)
    order2 = {
        "id": f"order-{str(uuid4())[:8]}",
        "order_number": f"ORD-TEST-{str(uuid4())[:6].upper()}",
        "buyer_id": user_id,
        "seller_id": seller_id,
        "total_amount": 120.00,
        "shipping_cost": 5.00,
        "tax": 0.0,
        "platform_fee_amount": 12.00,  # 10% for physical
        "seller_net_amount": 113.00,
        "grand_total": 125.00,
        "status": "processing",
        "payment_method": "banibs_wallet",
        "payment_status": "paid",
        "clearing_status": "pending",
        "wallet_transaction_id": f"wt-{str(uuid4())[:8]}",
        "shipping_address": {"street": "123 Test", "city": "Test", "state": "CA", "zip": "12345"},
        "buyer_region": "North America",
        "seller_region": "North America",
        "is_same_region": True,
        "is_refundable": True,
        "refund_window_days": 7,
        "refund_status": "none",
        "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await orders_col.insert_one(order2)
    print(f"   ✅ Created order: {order2['order_number']} (3 days old, ready for clearing)")
    
    # ==================== UPDATE SELLER BALANCES ====================
    
    print("\n💰 Updating seller balances...")
    
    # Calculate pending balance from all pending orders
    pending_orders = await orders_col.find({
        "seller_id": seller_id,
        "payment_status": "paid",
        "clearing_status": "pending"
    }).to_list(100)
    
    total_pending = sum(order.get("seller_net_amount", 0.0) for order in pending_orders)
    
    # Set some available balance for testing payouts
    available_balance = 250.00
    
    await sellers_col.update_one(
        {"id": seller_id},
        {
            "$set": {
                "pending_payout_balance": total_pending,
                "available_payout_balance": available_balance,
                "lifetime_payouts": 0.0
            }
        }
    )
    
    print(f"   ✅ Pending balance: ${total_pending:.2f}")
    print(f"   ✅ Available balance: ${available_balance:.2f}")
    print(f"   ✅ Lifetime payouts: $0.00")
    
    # ==================== CREATE SAMPLE PAYOUT REQUESTS ====================
    
    print("\n💸 Creating sample payout requests...")
    
    # Payout 1: Pending request
    payout1 = {
        "id": f"payout-{str(uuid4())[:8]}",
        "seller_id": seller_id,
        "user_id": user_id,
        "amount_requested": 50.00,
        "amount_approved": None,
        "status": "pending",
        "method": "bank_transfer",
        "method_details": {
            "bank_name": "Example Bank",
            "last4": "1234"
        },
        "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "updated_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "processed_at": None,
        "admin_note": None,
        "reference_code": f"PAY-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid4())[:6].upper()}"
    }
    
    await payouts_col.insert_one(payout1)
    print(f"   ✅ Created payout: {payout1['reference_code']} (pending)")
    
    # Payout 2: Completed request (old)
    payout2 = {
        "id": f"payout-{str(uuid4())[:8]}",
        "seller_id": seller_id,
        "user_id": user_id,
        "amount_requested": 100.00,
        "amount_approved": 100.00,
        "status": "completed",
        "method": "manual",
        "method_details": {"note": "Zelle transfer"},
        "created_at": (datetime.utcnow() - timedelta(days=10)).isoformat(),
        "updated_at": (datetime.utcnow() - timedelta(days=8)).isoformat(),
        "processed_at": (datetime.utcnow() - timedelta(days=8)).isoformat(),
        "admin_note": "Completed via Zelle",
        "reference_code": f"PAY-{(datetime.utcnow() - timedelta(days=10)).strftime('%Y%m%d')}-{str(uuid4())[:6].upper()}"
    }
    
    await payouts_col.insert_one(payout2)
    print(f"   ✅ Created payout: {payout2['reference_code']} (completed)")
    
    # ==================== SUMMARY ====================
    
    print("\n" + "=" * 60)
    print("INITIALIZATION COMPLETE")
    print("=" * 60)
    
    print("\n📊 Test Data Summary:")
    print(f"   Seller: {test_seller['business_name']}")
    print(f"   Pending Orders: {len(pending_orders)} (${total_pending:.2f})")
    print(f"   Available Balance: ${available_balance:.2f}")
    print(f"   Payout Requests: 2 (1 pending, 1 completed)")
    
    print("\n✅ Ready for testing!")
    print("\n🧪 You can now:")
    print("   1. Run T+2 clearing: python3 scripts/run_payout_clearing.py")
    print("   2. Test payout request API (seller creates payout request)")
    print("   3. Test admin payout approval flow")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(init_payout_test_data())
