"""
BANIBS Global Marketplace - Database Operations
Phase 16.0
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict
from datetime import datetime
from uuid import uuid4
import secrets
import string


def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_part = ''.join(secrets.choice(string.digits) for _ in range(6))
    return f"ORD-{timestamp}-{random_part}"


class MarketplaceDB:
    """Database operations for BANIBS Global Marketplace"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.sellers = db.marketplace_sellers
        self.stores = db.marketplace_stores
        self.products = db.marketplace_products
        self.categories = db.marketplace_categories
        self.orders = db.marketplace_orders
        self.order_items = db.marketplace_order_items
        self.digital_files = db.marketplace_digital_files
    
    # ==================== SELLERS ====================
    
    async def get_seller_by_user_id(self, user_id: str) -> Optional[Dict]:
        """Get seller profile by user ID"""
        seller = await self.sellers.find_one({"user_id": user_id}, {"_id": 0})
        return seller
    
    async def get_seller_by_id(self, seller_id: str) -> Optional[Dict]:
        """Get seller profile by seller ID"""
        seller = await self.sellers.find_one({"id": seller_id}, {"_id": 0})
        return seller
    
    async def create_seller(self, user_id: str, seller_data: Dict) -> Dict:
        """Create a new seller profile"""
        seller = {
            "id": str(uuid4()),
            "user_id": user_id,
            **seller_data,
            "status": "active",
            "wallet_connected": False,
            "wallet_id": None,
            "total_sales": 0.0,
            "total_orders": 0,
            "rating": 0.0,
            "pending_payout_balance": 0.0,  # Phase 16.1
            "available_payout_balance": 0.0,  # Phase 16.1
            "created_at": datetime.utcnow()
        }
        await self.sellers.insert_one(seller)
        return {k: v for k, v in seller.items() if k != "_id"}
    
    async def update_seller(self, seller_id: str, updates: Dict) -> Optional[Dict]:
        """Update seller profile"""
        result = await self.sellers.find_one_and_update(
            {"id": seller_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def get_sellers_by_region(self, region: str) -> List[Dict]:
        """Get all sellers from a region"""
        sellers = await self.sellers.find(
            {"region": region, "status": "active"},
            {"_id": 0}
        ).sort("total_sales", -1).to_list(100)
        return sellers
    
    # ==================== STORES ====================
    
    async def get_store_by_id(self, store_id: str) -> Optional[Dict]:
        """Get store by ID"""
        store = await self.stores.find_one({"id": store_id}, {"_id": 0})
        return store
    
    async def get_stores_by_seller(self, seller_id: str) -> List[Dict]:
        """Get all stores for a seller"""
        stores = await self.stores.find(
            {"seller_id": seller_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return stores
    
    async def create_store(self, seller_id: str, store_data: Dict, region: str) -> Dict:
        """Create a new store"""
        store = {
            "id": str(uuid4()),
            "seller_id": seller_id,
            **store_data,
            "region": region,
            "followers_count": 0,
            "products_count": 0,
            "created_at": datetime.utcnow()
        }
        await self.stores.insert_one(store)
        return {k: v for k, v in store.items() if k != "_id"}
    
    async def update_store(self, store_id: str, seller_id: str, updates: Dict) -> Optional[Dict]:
        """Update store"""
        result = await self.stores.find_one_and_update(
            {"id": store_id, "seller_id": seller_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def increment_store_products(self, store_id: str) -> None:
        """Increment store products count"""
        await self.stores.update_one(
            {"id": store_id},
            {"$inc": {"products_count": 1}}
        )
    
    # ==================== CATEGORIES ====================
    
    async def get_all_categories(self) -> List[Dict]:
        """Get all categories"""
        categories = await self.categories.find({}, {"_id": 0}).sort("name", 1).to_list(100)
        return categories
    
    async def get_category_by_id(self, category_id: str) -> Optional[Dict]:
        """Get category by ID"""
        category = await self.categories.find_one({"id": category_id}, {"_id": 0})
        return category
    
    # ==================== PRODUCTS ====================
    
    async def get_product_by_id(self, product_id: str) -> Optional[Dict]:
        """Get product by ID"""
        product = await self.products.find_one({"id": product_id}, {"_id": 0})
        return product
    
    async def get_products_by_store(self, store_id: str) -> List[Dict]:
        """Get all products for a store"""
        products = await self.products.find(
            {"store_id": store_id, "is_active": True},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return products
    
    async def get_products_by_region(self, region: str, limit: int = 50) -> List[Dict]:
        """Get products from a region"""
        products = await self.products.find(
            {"region": region, "is_active": True},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        return products
    
    async def get_products_by_category(self, category_id: str, limit: int = 50) -> List[Dict]:
        """Get products in a category"""
        products = await self.products.find(
            {"category_id": category_id, "is_active": True},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        return products
    
    async def get_featured_products(self, limit: int = 12) -> List[Dict]:
        """Get featured products (highest sales)"""
        products = await self.products.find(
            {"is_active": True},
            {"_id": 0}
        ).sort("sales_count", -1).limit(limit).to_list(limit)
        return products
    
    async def create_product(self, seller_id: str, product_data: Dict, region: str) -> Dict:
        """Create a new product"""
        product = {
            "id": str(uuid4()),
            "seller_id": seller_id,
            **product_data,
            "region": region,
            "is_active": True,
            "views_count": 0,
            "sales_count": 0,
            "created_at": datetime.utcnow()
        }
        await self.products.insert_one(product)
        
        # Increment store products count
        await self.increment_store_products(product_data["store_id"])
        
        return {k: v for k, v in product.items() if k != "_id"}
    
    async def update_product(self, product_id: str, seller_id: str, updates: Dict) -> Optional[Dict]:
        """Update product"""
        result = await self.products.find_one_and_update(
            {"id": product_id, "seller_id": seller_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def delete_product(self, product_id: str, seller_id: str) -> bool:
        """Soft delete product"""
        result = await self.products.update_one(
            {"id": product_id, "seller_id": seller_id},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0
    
    async def increment_product_views(self, product_id: str) -> None:
        """Increment product views"""
        await self.products.update_one(
            {"id": product_id},
            {"$inc": {"views_count": 1}}
        )
    
    # ==================== DIGITAL FILES ====================
    
    async def create_digital_file(self, seller_id: str, product_id: str, file_data: Dict) -> Dict:
        """Create digital file record"""
        digital_file = {
            "id": str(uuid4()),
            "seller_id": seller_id,
            "product_id": product_id,
            **file_data,
            "download_count": 0,
            "created_at": datetime.utcnow()
        }
        await self.digital_files.insert_one(digital_file)
        return {k: v for k, v in digital_file.items() if k != "_id"}
    
    async def get_digital_file_by_id(self, file_id: str) -> Optional[Dict]:
        """Get digital file by ID"""
        digital_file = await self.digital_files.find_one({"id": file_id}, {"_id": 0})
        return digital_file
    
    async def increment_download_count(self, file_id: str) -> None:
        """Increment download count"""
        await self.digital_files.update_one(
            {"id": file_id},
            {"$inc": {"download_count": 1}}
        )
    
    # ==================== ORDERS ====================
    
    async def create_order(self, buyer_id: str, order_data: Dict) -> Dict:
        """Create a new order"""
        order = {
            "id": str(uuid4()),
            "order_number": generate_order_number(),
            "buyer_id": buyer_id,
            **order_data,
            "status": "pending",
            "payment_status": "pending",
            "wallet_transaction_id": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await self.orders.insert_one(order)
        return {k: v for k, v in order.items() if k != "_id"}
    
    async def create_order_item(self, order_id: str, item_data: Dict) -> Dict:
        """Create order item"""
        item = {
            "id": str(uuid4()),
            "order_id": order_id,
            **item_data
        }
        await self.order_items.insert_one(item)
        return {k: v for k, v in item.items() if k != "_id"}
    
    async def get_order_by_id(self, order_id: str) -> Optional[Dict]:
        """Get order by ID"""
        order = await self.orders.find_one({"id": order_id}, {"_id": 0})
        return order
    
    async def get_order_items(self, order_id: str) -> List[Dict]:
        """Get all items for an order"""
        items = await self.order_items.find(
            {"order_id": order_id},
            {"_id": 0}
        ).to_list(100)
        return items
    
    async def get_orders_by_buyer(self, buyer_id: str) -> List[Dict]:
        """Get all orders for a buyer"""
        orders = await self.orders.find(
            {"buyer_id": buyer_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return orders
    
    async def get_orders_by_seller(self, seller_id: str) -> List[Dict]:
        """Get all orders for a seller"""
        orders = await self.orders.find(
            {"seller_id": seller_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return orders
    
    async def update_order_status(self, order_id: str, status: str) -> Optional[Dict]:
        """Update order status"""
        result = await self.orders.find_one_and_update(
            {"id": order_id},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            },
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def update_order_payment(self, order_id: str, payment_status: str, transaction_id: str) -> Optional[Dict]:
        """Update order payment information"""
        result = await self.orders.find_one_and_update(
            {"id": order_id},
            {
                "$set": {
                    "payment_status": payment_status,
                    "wallet_transaction_id": transaction_id,
                    "updated_at": datetime.utcnow()
                }
            },
            return_document=True
        )
        if result:
            return {k: v for k, v in result.items() if k != "_id"}
        return None
    
    async def verify_user_purchased_product(self, user_id: str, product_id: str) -> bool:
        """Verify if user has purchased a product (for digital downloads)"""
        # Find order items with this product where order is completed
        pipeline = [
            {
                "$lookup": {
                    "from": "marketplace_orders",
                    "localField": "order_id",
                    "foreignField": "id",
                    "as": "order"
                }
            },
            {
                "$unwind": "$order"
            },
            {
                "$match": {
                    "product_id": product_id,
                    "order.buyer_id": user_id,
                    "order.payment_status": "completed"
                }
            }
        ]
        
        result = await self.order_items.aggregate(pipeline).to_list(1)
        return len(result) > 0
