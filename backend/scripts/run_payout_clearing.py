"""
BANIBS Marketplace - T+2 Payout Clearing Job
Phase 16.2

This script processes orders that are 2+ days old and moves funds from
pending_payout_balance to available_payout_balance for sellers.

Run manually or via cron:
  python3 scripts/run_payout_clearing.py
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from db.marketplace_payouts import MarketplacePayoutDB
from datetime import datetime


async def run_t2_clearing():
    """
    Main clearing logic:
    1. Find all paid orders older than 2 days with clearing_status = "pending"
    2. For each order:
       - Move seller_net_amount from pending to available
       - Mark order as cleared
       - Log clearing event
    """
    
    print("=" * 60)
    print("BANIBS MARKETPLACE - T+2 PAYOUT CLEARING JOB")
    print("=" * 60)
    print(f"Started at: {datetime.utcnow().isoformat()}\n")
    
    # Connect to database
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    payout_db = MarketplacePayoutDB(db)
    
    # Get orders ready for clearing
    orders = await payout_db.get_orders_pending_clearing()
    
    print(f"Found {len(orders)} orders ready for T+2 clearing\n")
    
    if not orders:
        print("No orders to process. Exiting.")
        client.close()
        return
    
    cleared_count = 0
    total_cleared_amount = 0.0
    errors = []
    
    for order in orders:
        order_id = order["id"]
        order_number = order["order_number"]
        seller_id = order["seller_id"]
        seller_net_amount = order.get("seller_net_amount", 0.0)
        
        try:
            print(f"Processing Order: {order_number}")
            print(f"  Order ID: {order_id}")
            print(f"  Seller Net: ${seller_net_amount:.2f}")
            
            # Get seller
            seller = await payout_db.get_seller_by_id(seller_id)
            if not seller:
                raise Exception(f"Seller {seller_id} not found")
            
            # Update seller balances
            # Move from pending to available
            updated_seller = await payout_db.update_seller_balance(
                seller_id=seller_id,
                pending_delta=-seller_net_amount,  # Decrease pending
                available_delta=seller_net_amount   # Increase available
            )
            
            if not updated_seller:
                raise Exception(f"Failed to update seller {seller_id} balances")
            
            # Mark order as cleared
            await payout_db.mark_order_as_cleared(order_id)
            
            # Log clearing event
            await payout_db.create_payout_event(
                order_id=order_id,
                event_type="payout_clearing_completed",
                actor="system",
                metadata={
                    "seller_net_amount": seller_net_amount,
                    "seller_id": seller_id,
                    "clearing_date": datetime.utcnow().isoformat(),
                    "days_after_order": 2
                }
            )
            
            cleared_count += 1
            total_cleared_amount += seller_net_amount
            
            print("  ✅ Cleared successfully")
            print(f"  Seller pending: ${updated_seller['pending_payout_balance']:.2f}")
            print(f"  Seller available: ${updated_seller['available_payout_balance']:.2f}\n")
            
        except Exception as e:
            error_msg = f"Order {order_number}: {str(e)}"
            errors.append(error_msg)
            print(f"  ❌ Error: {str(e)}\n")
    
    # Summary
    print("=" * 60)
    print("CLEARING JOB COMPLETE")
    print("=" * 60)
    print(f"Orders processed: {cleared_count}/{len(orders)}")
    print(f"Total amount cleared: ${total_cleared_amount:.2f}")
    
    if errors:
        print(f"\n⚠️  Errors encountered: {len(errors)}")
        for error in errors:
            print(f"  - {error}")
    else:
        print("\n✅ All orders cleared successfully!")
    
    print(f"\nFinished at: {datetime.utcnow().isoformat()}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(run_t2_clearing())
