"""
BANIBS Marketplace - Payment Processing Utilities
Phase 16.1 - Real Wallet Integration
"""

from typing import Dict, List, Tuple
from decimal import Decimal


# Platform Fee Rates
PLATFORM_FEE_PHYSICAL = 0.10  # 10% for physical products
PLATFORM_FEE_DIGITAL = 0.12   # 12% for digital products

# Payout Clearing Period
PAYOUT_CLEARING_DAYS = 2  # T+2 days

# Platform Wallet Account ID
PLATFORM_WALLET_ACCOUNT_ID = "BANIBS_PLATFORM"


def calculate_platform_fee(item_subtotal: float, product_type: str) -> float:
    """
    Calculate platform fee based on product type
    
    Args:
        item_subtotal: Item price * quantity (before shipping/tax)
        product_type: "physical" or "digital"
    
    Returns:
        Platform fee amount
    """
    if product_type == "digital":
        return round(item_subtotal * PLATFORM_FEE_DIGITAL, 2)
    else:
        return round(item_subtotal * PLATFORM_FEE_PHYSICAL, 2)


def calculate_order_fees(items: List[Dict]) -> Tuple[float, float, float]:
    """
    Calculate total platform fees and seller net for an order
    
    Args:
        items: List of order items with 'total_price' and 'product_type'
    
    Returns:
        Tuple of (items_subtotal, total_platform_fee, seller_net_amount)
    """
    items_subtotal = 0.0
    total_platform_fee = 0.0
    
    for item in items:
        item_total = float(item.get('total_price', 0))
        product_type = item.get('product_type', 'physical')
        
        items_subtotal += item_total
        total_platform_fee += calculate_platform_fee(item_total, product_type)
    
    seller_net_amount = items_subtotal - total_platform_fee
    
    return (
        round(items_subtotal, 2),
        round(total_platform_fee, 2),
        round(seller_net_amount, 2)
    )


def get_refund_window_days(product_type: str) -> int:
    """
    Get refund window in days based on product type
    
    Args:
        product_type: "physical" or "digital"
    
    Returns:
        Number of days in refund window
    """
    if product_type == "digital":
        return 7  # 7 days for digital products
    else:
        return 30  # 30 days for physical products


def validate_wallet_balance(wallet_balance: float, required_amount: float) -> Tuple[bool, str]:
    """
    Validate if wallet has sufficient balance
    
    Args:
        wallet_balance: Current wallet balance
        required_amount: Amount needed for purchase
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if wallet_balance < required_amount:
        shortage = required_amount - wallet_balance
        return (
            False,
            f"INSUFFICIENT_FUNDS: You need ${shortage:.2f} more to complete this purchase. "
            f"Your balance: ${wallet_balance:.2f}, Required: ${required_amount:.2f}"
        )
    
    return (True, "")


def generate_idempotency_key(buyer_id: str, order_id: str) -> str:
    """
    Generate idempotency key for payment processing
    
    Args:
        buyer_id: User ID
        order_id: Order ID
    
    Returns:
        Idempotency key string
    """
    import hashlib
    data = f"{buyer_id}:{order_id}"
    return hashlib.sha256(data.encode()).hexdigest()[:32]
