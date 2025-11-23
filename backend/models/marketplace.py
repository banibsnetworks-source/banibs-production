"""
BANIBS Global Marketplace - Data Models
Phase 16.0 - The first Black-owned global e-commerce platform
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ProductType(str, Enum):
    """Product types"""
    PHYSICAL = "physical"
    DIGITAL = "digital"


class OrderStatus(str, Enum):
    """Order statuses"""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class SellerStatus(str, Enum):
    """Seller account statuses"""
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class PayoutStatus(str, Enum):
    """Payout request statuses - Phase 16.2"""
    PENDING = "pending"          # seller requested, awaiting review
    APPROVED = "approved"        # approved by admin
    REJECTED = "rejected"        # rejected (reason stored)
    COMPLETED = "completed"      # money sent out
    CANCELLED = "cancelled"      # cancelled by seller or system


class PayoutMethod(str, Enum):
    """Payout methods - Phase 16.2"""
    MANUAL = "manual"            # manual payout (cash, Zelle, etc.)
    BANK_TRANSFER = "bank_transfer"
    MOBILE_MONEY = "mobile_money"
    PAYPAL = "paypal"
    OTHER = "other"


class ClearingStatus(str, Enum):
    """Order clearing status for T+2 - Phase 16.2"""
    PENDING = "pending"
    CLEARED = "cleared"


class Region(str, Enum):
    """Global diaspora regions"""
    AFRICA = "Africa"
    CARIBBEAN = "Caribbean"
    NORTH_AMERICA = "North America"
    SOUTH_AMERICA = "South America"
    EUROPE = "Europe"
    ASIA = "Asia"


# ==================== MARKETPLACE SELLER ====================

class MarketplaceSeller(BaseModel):
    """Marketplace seller profile"""
    id: str
    user_id: str
    business_name: str
    bio: Optional[str] = None
    region: Region
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    status: SellerStatus
    wallet_connected: bool = False
    wallet_id: Optional[str] = None
    total_sales: float = 0.0
    total_orders: int = 0
    rating: float = 0.0
    pending_payout_balance: float = 0.0  # Phase 16.1 - Funds pending T+2 clearing
    available_payout_balance: float = 0.0  # Phase 16.1 - Funds available for payout
    lifetime_payouts: float = 0.0  # Phase 16.2 - Total paid out historically
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "seller-001",
                "user_id": "user-001",
                "business_name": "Afro Artisan Co",
                "bio": "Handcrafted goods from Ghana",
                "region": "Africa",
                "status": "active",
                "wallet_connected": True,
                "total_sales": 5000.00,
                "total_orders": 45,
                "rating": 4.8
            }
        }


class MarketplaceSellerCreate(BaseModel):
    """Request model for creating seller profile"""
    business_name: str = Field(..., min_length=1, max_length=200)
    bio: Optional[str] = Field(None, max_length=1000)
    region: Region
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None


class MarketplaceSellerUpdate(BaseModel):
    """Request model for updating seller profile"""
    business_name: Optional[str] = Field(None, min_length=1, max_length=200)
    bio: Optional[str] = Field(None, max_length=1000)
    region: Optional[Region] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    wallet_id: Optional[str] = None


# ==================== MARKETPLACE STORE ====================

class MarketplaceStore(BaseModel):
    """Marketplace storefront"""
    id: str
    seller_id: str
    name: str
    description: Optional[str] = None
    region: Region
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    followers_count: int = 0
    products_count: int = 0
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "store-001",
                "seller_id": "seller-001",
                "name": "Afro Artisan Store",
                "description": "Premium handcrafted goods",
                "region": "Africa",
                "followers_count": 250,
                "products_count": 12
            }
        }


class MarketplaceStoreCreate(BaseModel):
    """Request model for creating store"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None


class MarketplaceStoreUpdate(BaseModel):
    """Request model for updating store"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None


# ==================== MARKETPLACE CATEGORY ====================

class MarketplaceCategory(BaseModel):
    """Product category"""
    id: str
    name: str
    slug: str
    icon: Optional[str] = None
    products_count: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "cat-001",
                "name": "Fashion",
                "slug": "fashion",
                "icon": "👗",
                "products_count": 156
            }
        }


# ==================== MARKETPLACE PRODUCT ====================

class MarketplaceProduct(BaseModel):
    """Marketplace product"""
    id: str
    seller_id: str
    store_id: str
    title: str
    description: str
    price: float
    category_id: str
    product_type: ProductType
    region: Region
    stock_quantity: Optional[int] = None  # None for digital products
    images: List[str] = []
    digital_file_id: Optional[str] = None  # For digital products
    shipping_enabled: bool = True
    is_active: bool = True
    views_count: int = 0
    sales_count: int = 0
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "prod-001",
                "seller_id": "seller-001",
                "store_id": "store-001",
                "title": "Handwoven Kente Cloth",
                "description": "Authentic Ghanaian kente cloth",
                "price": 89.99,
                "category_id": "cat-001",
                "product_type": "physical",
                "region": "Africa",
                "stock_quantity": 25,
                "images": ["url1.jpg", "url2.jpg"],
                "sales_count": 12
            }
        }


class MarketplaceProductCreate(BaseModel):
    """Request model for creating product"""
    store_id: str
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1, max_length=5000)
    price: float = Field(..., gt=0)
    category_id: str
    product_type: ProductType
    stock_quantity: Optional[int] = Field(None, ge=0)
    images: List[str] = []
    digital_file_id: Optional[str] = None
    shipping_enabled: bool = True


class MarketplaceProductUpdate(BaseModel):
    """Request model for updating product"""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, min_length=1, max_length=5000)
    price: Optional[float] = Field(None, gt=0)
    category_id: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    images: Optional[List[str]] = None
    shipping_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


# ==================== DIGITAL FILE ====================

class MarketplaceDigitalFile(BaseModel):
    """Digital product file"""
    id: str
    seller_id: str
    product_id: str
    filename: str
    file_path: str
    file_size: int  # bytes
    file_type: str
    download_count: int = 0
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "file-001",
                "seller_id": "seller-001",
                "product_id": "prod-001",
                "filename": "ebook-wealth-building.pdf",
                "file_path": "/digital_products/ebook-001.pdf",
                "file_size": 2048576,
                "file_type": "application/pdf",
                "download_count": 45
            }
        }


# ==================== ORDER ====================

class MarketplaceOrder(BaseModel):
    """Marketplace order"""
    id: str
    order_number: str
    buyer_id: str
    seller_id: str
    total_amount: float
    shipping_cost: float
    tax: float = 0.0
    platform_fee_amount: float = 0.0  # Phase 16.1 - BANIBS platform fee
    seller_net_amount: float = 0.0  # Phase 16.1 - Seller receives (after fee)
    grand_total: float
    status: OrderStatus
    payment_method: str = "banibs_wallet"
    payment_status: str = "pending"  # pending, paid, failed, refunded
    wallet_transaction_id: Optional[str] = None
    shipping_address: Optional[dict] = None
    buyer_region: Region
    seller_region: Region
    is_same_region: bool
    # Phase 16.1 - Refund fields
    is_refundable: bool = True
    refund_window_days: int = 30  # Default for physical, override for digital
    refund_status: str = "none"  # none, requested, approved, rejected, refunded
    refund_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "order-001",
                "order_number": "ORD-2025-001234",
                "buyer_id": "user-001",
                "seller_id": "seller-001",
                "total_amount": 89.99,
                "shipping_cost": 5.00,
                "grand_total": 94.99,
                "status": "pending",
                "payment_status": "completed",
                "buyer_region": "North America",
                "seller_region": "Africa",
                "is_same_region": False
            }
        }


class MarketplaceOrderItem(BaseModel):
    """Order line item"""
    id: str
    order_id: str
    product_id: str
    product_title: str
    product_type: ProductType
    quantity: int
    unit_price: float
    total_price: float
    digital_file_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "item-001",
                "order_id": "order-001",
                "product_id": "prod-001",
                "product_title": "Handwoven Kente Cloth",
                "product_type": "physical",
                "quantity": 1,
                "unit_price": 89.99,
                "total_price": 89.99
            }
        }


class MarketplaceOrderCreate(BaseModel):
    """Request model for creating order"""
    items: List[dict] = Field(..., min_items=1)  # [{product_id, quantity}]
    shipping_address: Optional[dict] = None
    buyer_region: Region


# ==================== ORDER EVENTS (AUDIT TRAIL) ====================

class OrderEvent(BaseModel):
    """Order event for audit trail - Phase 16.1"""
    id: str
    order_id: str
    event_type: str  # payment_initiated, payment_success, payment_failed, payout_pending, payout_cleared, etc.
    timestamp: datetime
    actor: str = "system"  # system, user_id, admin_id
    metadata: Optional[dict] = None  # amount, wallet_ids, error messages, etc.
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "event-001",
                "order_id": "order-001",
                "event_type": "payment_success",
                "timestamp": "2025-01-15T10:30:00Z",
                "actor": "system",
                "metadata": {
                    "amount": 94.99,
                    "wallet_transaction_id": "wt-12345",
                    "platform_fee": 9.00
                }
            }
        }


# ==================== RESPONSE MODELS ====================

class MarketplaceSellersResponse(BaseModel):
    """Response model for listing sellers"""
    sellers: List[MarketplaceSeller]
    total: int


class MarketplaceStoresResponse(BaseModel):
    """Response model for listing stores"""
    stores: List[MarketplaceStore]
    total: int


class MarketplaceProductsResponse(BaseModel):
    """Response model for listing products"""
    products: List[MarketplaceProduct]
    total: int


class MarketplaceCategoriesResponse(BaseModel):
    """Response model for listing categories"""
    categories: List[MarketplaceCategory]
    total: int


class MarketplaceOrdersResponse(BaseModel):
    """Response model for listing orders"""
    orders: List[MarketplaceOrder]
    total: int


class MarketplaceOrderWithItems(BaseModel):
    """Order with items"""
    order: MarketplaceOrder
    items: List[MarketplaceOrderItem]
