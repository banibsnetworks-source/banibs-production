"""
Initialize BANIBS Global Marketplace data
Phase 16.0 - Seed sample marketplace data
"""

import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from uuid import uuid4

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def init_marketplace_data():
    """Initialize sample marketplace data"""
    
    # Get MongoDB URL from environment
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017/banibs")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_default_database()
    
    print("🛒 Initializing BANIBS Global Marketplace data...")
    
    # ==================== CATEGORIES ====================
    
    categories = [
        {"id": str(uuid4()), "name": "Fashion", "slug": "fashion", "icon": "👗", "products_count": 0},
        {"id": str(uuid4()), "name": "Beauty & Grooming", "slug": "beauty", "icon": "💄", "products_count": 0},
        {"id": str(uuid4()), "name": "Wellness & Health", "slug": "wellness", "icon": "🧘", "products_count": 0},
        {"id": str(uuid4()), "name": "Home & Living", "slug": "home", "icon": "🏠", "products_count": 0},
        {"id": str(uuid4()), "name": "Art & Culture", "slug": "art", "icon": "🎨", "products_count": 0},
        {"id": str(uuid4()), "name": "Food & Beverage", "slug": "food", "icon": "🍽️", "products_count": 0},
        {"id": str(uuid4()), "name": "Books & Learning", "slug": "books", "icon": "📚", "products_count": 0},
        {"id": str(uuid4()), "name": "Digital Products", "slug": "digital", "icon": "💾", "products_count": 0},
        {"id": str(uuid4()), "name": "Business Tools & Services", "slug": "business", "icon": "💼", "products_count": 0},
        {"id": str(uuid4()), "name": "Kids & Family", "slug": "kids", "icon": "👶", "products_count": 0},
        {"id": str(uuid4()), "name": "Events & Experiences", "slug": "events", "icon": "🎉", "products_count": 0},
        {"id": str(uuid4()), "name": "Other / Misc", "slug": "other", "icon": "🔧", "products_count": 0}
    ]
    
    await db.marketplace_categories.delete_many({})
    await db.marketplace_categories.insert_many(categories)
    print(f"✅ Created {len(categories)} categories")
    
    # Get category IDs for reference
    fashion_cat = categories[0]["id"]
    beauty_cat = categories[1]["id"]
    art_cat = categories[4]["id"]
    digital_cat = categories[7]["id"]
    
    # ==================== SELLERS ====================
    
    sellers = [
        {
            "id": str(uuid4()),
            "user_id": "sample-user-001",
            "business_name": "Afro Artisan Co",
            "bio": "Handcrafted goods from Ghana, celebrating African heritage",
            "region": "Africa",
            "logo_url": "https://via.placeholder.com/150/CD7F32/FFFFFF?text=AA",
            "status": "active",
            "wallet_connected": True,
            "total_sales": 5420.00,
            "total_orders": 48,
            "rating": 4.8,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": "sample-user-002",
            "business_name": "Caribbean Spice Hub",
            "bio": "Authentic Caribbean flavors and seasonings",
            "region": "Caribbean",
            "logo_url": "https://via.placeholder.com/150/CD7F32/FFFFFF?text=CS",
            "status": "active",
            "wallet_connected": True,
            "total_sales": 3200.00,
            "total_orders": 35,
            "rating": 4.9,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": "sample-user-003",
            "business_name": "Black Excellence Books",
            "bio": "Curating literature that celebrates Black voices",
            "region": "North America",
            "logo_url": "https://via.placeholder.com/150/CD7F32/FFFFFF?text=BE",
            "status": "active",
            "wallet_connected": True,
            "total_sales": 8900.00,
            "total_orders": 92,
            "rating": 4.7,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": "sample-user-004",
            "business_name": "Euro Afro Fashion",
            "bio": "Contemporary African fashion for the European market",
            "region": "Europe",
            "logo_url": "https://via.placeholder.com/150/CD7F32/FFFFFF?text=EF",
            "status": "active",
            "wallet_connected": True,
            "total_sales": 12000.00,
            "total_orders": 67,
            "rating": 4.6,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": "sample-user-005",
            "business_name": "South American Soul",
            "bio": "Art and crafts from the Black communities of South America",
            "region": "South America",
            "logo_url": "https://via.placeholder.com/150/CD7F32/FFFFFF?text=SA",
            "status": "active",
            "wallet_connected": True,
            "total_sales": 4500.00,
            "total_orders": 41,
            "rating": 4.8,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "user_id": "sample-user-006",
            "business_name": "Asia Afro Connect",
            "bio": "Bridging African and Asian cultures through products",
            "region": "Asia",
            "logo_url": "https://via.placeholder.com/150/CD7F32/FFFFFF?text=AC",
            "status": "active",
            "wallet_connected": True,
            "total_sales": 3100.00,
            "total_orders": 28,
            "rating": 4.5,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.marketplace_sellers.delete_many({})
    await db.marketplace_sellers.insert_many(sellers)
    print(f"✅ Created {len(sellers)} sellers")
    
    # ==================== STORES ====================
    
    stores = [
        {
            "id": str(uuid4()),
            "seller_id": sellers[0]["id"],
            "name": "Afro Artisan Store",
            "description": "Premium handcrafted goods celebrating African heritage",
            "region": "Africa",
            "logo_url": sellers[0]["logo_url"],
            "banner_url": "https://via.placeholder.com/1200x300/CD7F32/FFFFFF?text=Afro+Artisan",
            "followers_count": 250,
            "products_count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[1]["id"],
            "name": "Spice Island Market",
            "description": "Your destination for authentic Caribbean spices",
            "region": "Caribbean",
            "logo_url": sellers[1]["logo_url"],
            "banner_url": "https://via.placeholder.com/1200x300/CD7F32/FFFFFF?text=Caribbean+Spice",
            "followers_count": 180,
            "products_count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[2]["id"],
            "name": "Excellence Library",
            "description": "Books that celebrate and educate about Black excellence",
            "region": "North America",
            "logo_url": sellers[2]["logo_url"],
            "banner_url": "https://via.placeholder.com/1200x300/CD7F32/FFFFFF?text=Black+Excellence",
            "followers_count": 420,
            "products_count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[3]["id"],
            "name": "Euro Afro Boutique",
            "description": "High fashion inspired by African aesthetics",
            "region": "Europe",
            "logo_url": sellers[3]["logo_url"],
            "banner_url": "https://via.placeholder.com/1200x300/CD7F32/FFFFFF?text=Euro+Afro",
            "followers_count": 320,
            "products_count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[4]["id"],
            "name": "Soul Art Gallery",
            "description": "Handmade art from South American Black communities",
            "region": "South America",
            "logo_url": sellers[4]["logo_url"],
            "banner_url": "https://via.placeholder.com/1200x300/CD7F32/FFFFFF?text=Soul+Art",
            "followers_count": 190,
            "products_count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[5]["id"],
            "name": "Asia-Africa Bridge",
            "description": "Cultural fusion products",
            "region": "Asia",
            "logo_url": sellers[5]["logo_url"],
            "banner_url": "https://via.placeholder.com/1200x300/CD7F32/FFFFFF?text=Asia+Africa",
            "followers_count": 145,
            "products_count": 0,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.marketplace_stores.delete_many({})
    await db.marketplace_stores.insert_many(stores)
    print(f"✅ Created {len(stores)} stores")
    
    # ==================== PRODUCTS ====================
    
    products = [
        # Physical Products
        {
            "id": str(uuid4()),
            "seller_id": sellers[0]["id"],
            "store_id": stores[0]["id"],
            "title": "Handwoven Kente Cloth - Authentic Ghanaian",
            "description": "Beautiful handwoven kente cloth from Ghana. Each piece tells a story through its patterns and colors. Perfect for special occasions or as wall art. Size: 6ft x 4ft.",
            "price": 89.99,
            "category_id": fashion_cat,
            "product_type": "physical",
            "region": "Africa",
            "stock_quantity": 25,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Kente+Cloth"],
            "digital_file_id": None,
            "shipping_enabled": True,
            "is_active": True,
            "views_count": 234,
            "sales_count": 12,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[0]["id"],
            "store_id": stores[0]["id"],
            "title": "African Beaded Jewelry Set",
            "description": "Stunning handcrafted beaded jewelry set including necklace, bracelet, and earrings. Made using traditional techniques passed down through generations.",
            "price": 45.00,
            "category_id": fashion_cat,
            "product_type": "physical",
            "region": "Africa",
            "stock_quantity": 50,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Beaded+Jewelry"],
            "digital_file_id": None,
            "shipping_enabled": True,
            "is_active": True,
            "views_count": 189,
            "sales_count": 28,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[1]["id"],
            "store_id": stores[1]["id"],
            "title": "Caribbean Jerk Spice Blend - 8oz",
            "description": "Authentic Caribbean jerk seasoning blend. Perfect for chicken, pork, or vegetables. Made from traditional family recipe with all-natural ingredients.",
            "price": 12.99,
            "category_id": categories[5]["id"],  # Food
            "product_type": "physical",
            "region": "Caribbean",
            "stock_quantity": 150,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Jerk+Spice"],
            "digital_file_id": None,
            "shipping_enabled": True,
            "is_active": True,
            "views_count": 456,
            "sales_count": 67,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[3]["id"],
            "store_id": stores[3]["id"],
            "title": "Ankara Print Designer Dress",
            "description": "Contemporary designer dress featuring stunning African ankara prints. Modern cut with traditional fabric. Available in sizes S-XL.",
            "price": 129.00,
            "category_id": fashion_cat,
            "product_type": "physical",
            "region": "Europe",
            "stock_quantity": 30,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Ankara+Dress"],
            "digital_file_id": None,
            "shipping_enabled": True,
            "is_active": True,
            "views_count": 312,
            "sales_count": 18,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[4]["id"],
            "store_id": stores[4]["id"],
            "title": "Afro-Latin Canvas Art - Large",
            "description": "Original canvas artwork celebrating Afro-Latin culture. Hand-painted by local artists. Size: 36in x 24in. Ready to hang.",
            "price": 199.00,
            "category_id": art_cat,
            "product_type": "physical",
            "region": "South America",
            "stock_quantity": 15,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Canvas+Art"],
            "digital_file_id": None,
            "shipping_enabled": True,
            "is_active": True,
            "views_count": 167,
            "sales_count": 8,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[0]["id"],
            "store_id": stores[0]["id"],
            "title": "Shea Butter - Pure Unrefined (16oz)",
            "description": "100% pure, unrefined shea butter from Ghana. Perfect for skincare, haircare, and natural beauty routines. Rich in vitamins A and E.",
            "price": 24.99,
            "category_id": beauty_cat,
            "product_type": "physical",
            "region": "Africa",
            "stock_quantity": 100,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Shea+Butter"],
            "digital_file_id": None,
            "shipping_enabled": True,
            "is_active": True,
            "views_count": 521,
            "sales_count": 89,
            "created_at": datetime.utcnow()
        },
        # Digital Products
        {
            "id": str(uuid4()),
            "seller_id": sellers[2]["id"],
            "store_id": stores[2]["id"],
            "title": "Black Wealth Building Guide (eBook)",
            "description": "Comprehensive digital guide to building generational wealth in the Black community. 200+ pages covering investing, real estate, business, and legacy planning.",
            "price": 29.99,
            "category_id": digital_cat,
            "product_type": "digital",
            "region": "North America",
            "stock_quantity": None,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=eBook+Cover"],
            "digital_file_id": "digital-001",
            "shipping_enabled": False,
            "is_active": True,
            "views_count": 678,
            "sales_count": 145,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[2]["id"],
            "store_id": stores[2]["id"],
            "title": "African American History Course Bundle",
            "description": "Digital course bundle with video lessons, worksheets, and quizzes. Covers 400+ years of African American history. Instant download.",
            "price": 49.99,
            "category_id": digital_cat,
            "product_type": "digital",
            "region": "North America",
            "stock_quantity": None,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Course+Bundle"],
            "digital_file_id": "digital-002",
            "shipping_enabled": False,
            "is_active": True,
            "views_count": 412,
            "sales_count": 67,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[3]["id"],
            "store_id": stores[3]["id"],
            "title": "Ankara Pattern Design Templates",
            "description": "Professional digital design templates featuring 50+ authentic ankara patterns. Perfect for designers and crafters. AI, PSD, and PNG formats included.",
            "price": 39.99,
            "category_id": digital_cat,
            "product_type": "digital",
            "region": "Europe",
            "stock_quantity": None,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Design+Templates"],
            "digital_file_id": "digital-003",
            "shipping_enabled": False,
            "is_active": True,
            "views_count": 298,
            "sales_count": 43,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[1]["id"],
            "store_id": stores[1]["id"],
            "title": "Caribbean Recipe eBook Collection",
            "description": "Digital cookbook with 100+ authentic Caribbean recipes. Includes photos, detailed instructions, and cultural context for each dish.",
            "price": 19.99,
            "category_id": digital_cat,
            "product_type": "digital",
            "region": "Caribbean",
            "stock_quantity": None,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Recipe+Book"],
            "digital_file_id": "digital-004",
            "shipping_enabled": False,
            "is_active": True,
            "views_count": 534,
            "sales_count": 112,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[4]["id"],
            "store_id": stores[4]["id"],
            "title": "Afro-Latin Music Production Pack",
            "description": "Digital audio pack with 200+ samples, loops, and sounds inspired by Afro-Latin music. Perfect for producers and DJs. WAV format.",
            "price": 59.99,
            "category_id": digital_cat,
            "product_type": "digital",
            "region": "South America",
            "stock_quantity": None,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Music+Pack"],
            "digital_file_id": "digital-005",
            "shipping_enabled": False,
            "is_active": True,
            "views_count": 387,
            "sales_count": 56,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid4()),
            "seller_id": sellers[5]["id"],
            "store_id": stores[5]["id"],
            "title": "Business Plan Template for Black Entrepreneurs",
            "description": "Professional business plan template specifically designed for Black-owned businesses. Includes financial models, market analysis templates, and pitch deck.",
            "price": 34.99,
            "category_id": digital_cat,
            "product_type": "digital",
            "region": "Asia",
            "stock_quantity": None,
            "images": ["https://via.placeholder.com/600x600/CD7F32/FFFFFF?text=Business+Template"],
            "digital_file_id": "digital-006",
            "shipping_enabled": False,
            "is_active": True,
            "views_count": 245,
            "sales_count": 38,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.marketplace_products.delete_many({})
    await db.marketplace_products.insert_many(products)
    print(f"✅ Created {len(products)} products (6 physical, 6 digital)")
    
    print("\n🎉 BANIBS Global Marketplace data initialization complete!")
    print(f"📝 Categories: {len(categories)}")
    print(f"👤 Sellers: {len(sellers)}")
    print(f"🏪 Stores: {len(stores)}")
    print(f"📦 Products: {len(products)}")
    print(f"🌍 Regions covered: 6 (Africa, Caribbean, North America, South America, Europe, Asia)")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(init_marketplace_data())
