"""
Seed initial admin user for BANIBS Admin Dashboard

This script creates an initial admin user if one doesn't exist.
Credentials are read from environment variables.

Usage:
    python scripts/seed_admin.py

Environment Variables:
    INITIAL_ADMIN_EMAIL (default: admin@banibs.com)
    INITIAL_ADMIN_PASSWORD (default: BanibsAdmin#2025)
"""

import asyncio
import os
import sys
import bcrypt
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

async def seed_admin():
    """Seed initial admin user"""
    
    # Get credentials from environment
    admin_email = os.environ.get("INITIAL_ADMIN_EMAIL", "admin@banibs.com")
    admin_password = os.environ.get("INITIAL_ADMIN_PASSWORD", "BanibsAdmin#2025")
    
    print("=" * 60)
    print("BANIBS Admin User Seeding")
    print("=" * 60)
    print(f"\nAdmin Email: {admin_email}")
    print(f"Environment: {os.environ.get('MONGO_URL', 'Not Set')}")
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": admin_email})
        
        if existing_admin:
            print(f"\n✅ Admin user already exists: {admin_email}")
            print(f"   Role: {existing_admin.get('role')}")
            print(f"   Created: {existing_admin.get('created_at')}")
            print("\nSkipping seed. To reset, delete the user from MongoDB first.")
            return
        
        # Hash password
        print("\n🔐 Hashing password...")
        password_bytes = admin_password.encode('utf-8')
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Create admin user document
        admin_doc = {
            "email": admin_email,
            "password_hash": password_hash,
            "role": "admin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        print("📝 Creating admin user...")
        result = await db.users.insert_one(admin_doc)
        
        print(f"\n✅ SUCCESS! Admin user created:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Role: admin")
        print(f"   User ID: {result.inserted_id}")
        
        print("\n" + "=" * 60)
        print("Admin Login Credentials:")
        print("=" * 60)
        print(f"Email:    {admin_email}")
        print(f"Password: {admin_password}")
        print("=" * 60)
        
        print("\n⚠️  IMPORTANT:")
        print("   1. These credentials are for dev/local use only")
        print("   2. Override with secure credentials in production")
        print("   3. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env")
        print("\n✅ Seeding complete!")
        
    except Exception as e:
        print(f"\n❌ ERROR: Failed to seed admin user")
        print(f"   {str(e)}")
        raise
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
