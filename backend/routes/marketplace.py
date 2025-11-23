"""
BANIBS Global Marketplace - API Routes
Phase 16.0
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
import os
import shutil

from models.marketplace import (
    MarketplaceSeller,
    MarketplaceSellerCreate,
    MarketplaceSellerUpdate,
    MarketplaceSellersResponse,
    MarketplaceStore,
    MarketplaceStoreCreate,
    MarketplaceStoreUpdate,
    MarketplaceStoresResponse,
    MarketplaceProduct,
    MarketplaceProductCreate,
    MarketplaceProductUpdate,
    MarketplaceProductsResponse,
    MarketplaceCategory,
    MarketplaceCategoriesResponse,
    MarketplaceOrder,
    MarketplaceOrderCreate,
    MarketplaceOrdersResponse,
    MarketplaceOrderWithItems,
    Region
)
from db.marketplace import MarketplaceDB
from middleware.auth_guard import get_current_user
from db.connection import get_db_client

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])

# Directory for digital products
DIGITAL_PRODUCTS_DIR = "/app/backend/static/digital_products"
os.makedirs(DIGITAL_PRODUCTS_DIR, exist_ok=True)


# ==================== HELPER FUNCTIONS ====================

def calculate_shipping_cost(buyer_region: str, seller_region: str, product_type: str) -> float:
    """Calculate shipping cost based on regions"""
    if product_type == "digital":
        return 0.0
    
    if buyer_region == seller_region:
        return 5.0  # Same region
    else:
        return 15.0  # Cross-region


# ==================== SELLER ENDPOINTS ====================

@router.post("/seller/register", response_model=MarketplaceSeller)
async def register_seller(
    seller_data: MarketplaceSellerCreate,
    current_user: dict = Depends(get_current_user)
):
    """Register as a marketplace seller"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    # Check if user already has a seller profile
    existing_seller = await marketplace_db.get_seller_by_user_id(user_id)
    if existing_seller:
        raise HTTPException(status_code=400, detail="Seller profile already exists")
    
    new_seller = await marketplace_db.create_seller(
        user_id,
        seller_data.dict()
    )
    
    return new_seller


@router.get("/seller/me", response_model=MarketplaceSeller)
async def get_my_seller_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's seller profile"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    return seller


@router.put("/seller/me", response_model=MarketplaceSeller)
async def update_my_seller_profile(
    updates: MarketplaceSellerUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's seller profile"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    updated_seller = await marketplace_db.update_seller(seller["id"], update_data)
    
    return updated_seller


@router.get("/sellers/region/{region}", response_model=MarketplaceSellersResponse)
async def get_sellers_by_region(region: Region):
    """Get sellers from a specific region"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    sellers = await marketplace_db.get_sellers_by_region(region.value)
    
    return {
        "sellers": sellers,
        "total": len(sellers)
    }


# ==================== STORE ENDPOINTS ====================

@router.post("/store/create", response_model=MarketplaceStore)
async def create_store(
    store_data: MarketplaceStoreCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new store"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    # Get seller profile
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Must be a registered seller")
    
    new_store = await marketplace_db.create_store(
        seller["id"],
        store_data.dict(),
        seller["region"]
    )
    
    return new_store


@router.get("/store/{store_id}", response_model=MarketplaceStore)
async def get_store(store_id: str):
    """Get store details"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    store = await marketplace_db.get_store_by_id(store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    return store


@router.put("/store/{store_id}", response_model=MarketplaceStore)
async def update_store(
    store_id: str,
    updates: MarketplaceStoreUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update store"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    # Get seller profile
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    updated_store = await marketplace_db.update_store(store_id, seller["id"], update_data)
    
    if not updated_store:
        raise HTTPException(status_code=404, detail="Store not found or unauthorized")
    
    return updated_store


@router.get("/stores/my", response_model=MarketplaceStoresResponse)
async def get_my_stores(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's stores"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    stores = await marketplace_db.get_stores_by_seller(seller["id"])
    
    return {
        "stores": stores,
        "total": len(stores)
    }


# ==================== CATEGORY ENDPOINTS ====================

@router.get("/categories", response_model=MarketplaceCategoriesResponse)
async def get_categories():
    """Get all product categories"""
    db = get_db_client()
    print(f"DEBUG: db object type: {type(db)}")
    print(f"DEBUG: db name: {db.name if hasattr(db, 'name') else 'NO NAME'}")
    
    marketplace_db = MarketplaceDB(db)
    categories = await marketplace_db.get_all_categories()
    
    print(f"DEBUG: Found {len(categories)} categories")
    if categories:
        print(f"DEBUG: Sample category: {categories[0]}")
    
    return {
        "categories": categories,
        "total": len(categories)
    }


# ==================== PRODUCT ENDPOINTS ====================

@router.post("/products/create", response_model=MarketplaceProduct)
async def create_product(
    product_data: MarketplaceProductCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new product"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    # Get seller profile
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Must be a registered seller")
    
    # Verify store belongs to seller
    store = await marketplace_db.get_store_by_id(product_data.store_id)
    if not store or store["seller_id"] != seller["id"]:
        raise HTTPException(status_code=403, detail="Store not found or unauthorized")
    
    new_product = await marketplace_db.create_product(
        seller["id"],
        product_data.dict(),
        seller["region"]
    )
    
    return new_product


@router.get("/products/{product_id}", response_model=MarketplaceProduct)
async def get_product(product_id: str):
    """Get product details"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    product = await marketplace_db.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment view count
    await marketplace_db.increment_product_views(product_id)
    
    return product


@router.get("/products/store/{store_id}", response_model=MarketplaceProductsResponse)
async def get_store_products(store_id: str):
    """Get all products from a store"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    products = await marketplace_db.get_products_by_store(store_id)
    
    return {
        "products": products,
        "total": len(products)
    }


@router.get("/products/region/{region}", response_model=MarketplaceProductsResponse)
async def get_products_by_region(region: Region, limit: int = 50):
    """Get products from a specific region"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    products = await marketplace_db.get_products_by_region(region.value, limit)
    
    return {
        "products": products,
        "total": len(products)
    }


@router.get("/products/category/{category_id}", response_model=MarketplaceProductsResponse)
async def get_products_by_category(category_id: str, limit: int = 50):
    """Get products in a category"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    products = await marketplace_db.get_products_by_category(category_id, limit)
    
    return {
        "products": products,
        "total": len(products)
    }


@router.get("/products/featured", response_model=MarketplaceProductsResponse)
async def get_featured_products(limit: int = 12):
    """Get featured products"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    
    products = await marketplace_db.get_featured_products(limit)
    
    return {
        "products": products,
        "total": len(products)
    }


@router.put("/products/{product_id}", response_model=MarketplaceProduct)
async def update_product(
    product_id: str,
    updates: MarketplaceProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update product"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    updated_product = await marketplace_db.update_product(product_id, seller["id"], update_data)
    
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")
    
    return updated_product


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete product"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    deleted = await marketplace_db.delete_product(product_id, seller["id"])
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")
    
    return {"message": "Product deleted successfully"}


# ==================== DIGITAL FILE ENDPOINTS ====================

@router.post("/digital/upload")
async def upload_digital_file(
    product_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload digital product file"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    # Verify seller owns the product
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    product = await marketplace_db.get_product_by_id(product_id)
    if not product or product["seller_id"] != seller["id"]:
        raise HTTPException(status_code=403, detail="Product not found or unauthorized")
    
    if product["product_type"] != "digital":
        raise HTTPException(status_code=400, detail="Product is not a digital product")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{product_id}_{datetime.utcnow().timestamp()}.{file_extension}"
    file_path = os.path.join(DIGITAL_PRODUCTS_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create digital file record
    digital_file = await marketplace_db.create_digital_file(
        seller["id"],
        product_id,
        {
            "filename": file.filename,
            "file_path": f"/digital_products/{unique_filename}",
            "file_size": file_size,
            "file_type": file.content_type or "application/octet-stream"
        }
    )
    
    # Update product with digital file ID
    await marketplace_db.update_product(
        product_id,
        seller["id"],
        {"digital_file_id": digital_file["id"]}
    )
    
    return {
        "message": "File uploaded successfully",
        "file_id": digital_file["id"],
        "filename": file.filename
    }


@router.get("/digital/download/{file_id}")
async def download_digital_file(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download digital product file (requires purchase verification)"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    # Get digital file
    digital_file = await marketplace_db.get_digital_file_by_id(file_id)
    if not digital_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Verify user has purchased the product
    has_purchased = await marketplace_db.verify_user_purchased_product(
        user_id,
        digital_file["product_id"]
    )
    
    if not has_purchased:
        raise HTTPException(status_code=403, detail="You must purchase this product before downloading")
    
    # Increment download count
    await marketplace_db.increment_download_count(file_id)
    
    # Construct full file path
    full_path = f"/app/backend/static{digital_file['file_path']}"
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        path=full_path,
        filename=digital_file["filename"],
        media_type=digital_file["file_type"]
    )


# ==================== ORDER ENDPOINTS ====================

@router.post("/orders/create", response_model=MarketplaceOrder)
async def create_order(
    order_data: MarketplaceOrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new order"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    buyer_id = current_user["id"]
    
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    
    # Calculate order totals
    total_amount = 0.0
    seller_id = None
    seller_region = None
    order_items_data = []
    
    for item in order_data.items:
        product = await marketplace_db.get_product_by_id(item["product_id"])
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        
        if not product["is_active"]:
            raise HTTPException(status_code=400, detail=f"Product {product['title']} is not available")
        
        # Set seller from first product (simplified - assumes single-seller orders)
        if seller_id is None:
            seller_id = product["seller_id"]
            seller_region = product["region"]
        
        quantity = item.get("quantity", 1)
        item_total = product["price"] * quantity
        total_amount += item_total
        
        order_items_data.append({
            "product_id": product["id"],
            "product_title": product["title"],
            "product_type": product["product_type"],
            "quantity": quantity,
            "unit_price": product["price"],
            "total_price": item_total,
            "digital_file_id": product.get("digital_file_id")
        })
    
    # Calculate shipping (based on first product type for simplicity)
    first_product_type = order_items_data[0]["product_type"]
    shipping_cost = calculate_shipping_cost(
        order_data.buyer_region.value,
        seller_region,
        first_product_type
    )
    
    grand_total = total_amount + shipping_cost
    
    # Create order
    new_order = await marketplace_db.create_order(
        buyer_id,
        {
            "seller_id": seller_id,
            "total_amount": total_amount,
            "shipping_cost": shipping_cost,
            "tax": 0.0,
            "grand_total": grand_total,
            "payment_method": "banibs_wallet",
            "shipping_address": order_data.shipping_address,
            "buyer_region": order_data.buyer_region.value,
            "seller_region": seller_region,
            "is_same_region": order_data.buyer_region.value == seller_region
        }
    )
    
    # Create order items
    for item_data in order_items_data:
        await marketplace_db.create_order_item(new_order["id"], item_data)
    
    # TODO: In Phase 16.2, integrate with BANIBS Wallet for real payment processing
    # For now, mark as completed (sandbox mode)
    await marketplace_db.update_order_payment(
        new_order["id"],
        "completed",
        f"sandbox_txn_{new_order['order_number']}"
    )
    
    return new_order


@router.get("/orders/my", response_model=MarketplaceOrdersResponse)
async def get_my_orders(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's orders"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    buyer_id = current_user["id"]
    
    orders = await marketplace_db.get_orders_by_buyer(buyer_id)
    
    return {
        "orders": orders,
        "total": len(orders)
    }


@router.get("/orders/{order_id}", response_model=MarketplaceOrderWithItems)
async def get_order_details(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get order details with items"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    order = await marketplace_db.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify user is buyer or seller
    if order["buyer_id"] != user_id and order["seller_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    items = await marketplace_db.get_order_items(order_id)
    
    return {
        "order": order,
        "items": items
    }


@router.get("/orders/seller/my", response_model=MarketplaceOrdersResponse)
async def get_my_seller_orders(
    current_user: dict = Depends(get_current_user)
):
    """Get orders for current seller"""
    db = get_db_client()
    marketplace_db = MarketplaceDB(db)
    user_id = current_user["id"]
    
    seller = await marketplace_db.get_seller_by_user_id(user_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    
    orders = await marketplace_db.get_orders_by_seller(seller["id"])
    
    return {
        "orders": orders,
        "total": len(orders)
    }
