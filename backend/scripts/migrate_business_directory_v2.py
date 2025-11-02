"""
Business Directory v2 - Migration Script

MongoDB-safe migration to add new fields to existing business_listings documents.

New fields:
- job_title (String)
- geo_latitude (Number)
- geo_longitude (Number)
- directions_url (String)
"""

import asyncio
import json
from datetime import datetime, timezone
from db.connection import get_db_client


async def migrate_business_directory_v2():
    """
    Add Business Directory v2 fields to existing documents
    """
    print("="*60)
    print("BANIBS Business Directory v2 Migration")
    print("MongoDB Schema Update")
    print("="*60)
    print()
    
    db = get_db_client()
    
    try:
        # Check if collection exists
        collections = await db.list_collection_names()
        
        if "business_listings" not in collections:
            print("ℹ️  business_listings collection does not exist yet")
            print("   Collection will be created automatically on first insert")
            print("   No migration needed")
        else:
            # Count existing documents
            count = await db.business_listings.count_documents({})
            print(f"📊 Found {count} existing business listings")
            
            if count > 0:
                # Add new fields to existing documents (only if they don't have them)
                result = await db.business_listings.update_many(
                    {"job_title": {"$exists": False}},
                    {
                        "$set": {
                            "job_title": None,
                            "geo_latitude": None,
                            "geo_longitude": None,
                            "directions_url": None
                        }
                    }
                )
                
                print(f"✅ Updated {result.modified_count} documents with new fields")
            else:
                print("ℹ️  No existing documents to migrate")
        
        # Create migration_history collection if it doesn't exist
        if "migration_history" not in collections:
            print("\n📝 Creating migration_history collection...")
        
        # Log migration
        migration_doc = {
            "migration_name": "BANIBS_BusinessDB_v2_Mongo",
            "applied_at": datetime.now(timezone.utc).isoformat(),
            "notes": "Added job_title, geo_latitude, geo_longitude, directions_url to business_listings collection"
        }
        
        await db.migration_history.insert_one(migration_doc)
        print("\n✅ Migration logged to migration_history")
        
        # Generate report
        report = {
            "migration": "BANIBS_BusinessDB_v2_Mongo",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "collection": "business_listings",
            "documents_updated": result.modified_count if count > 0 else 0,
            "new_fields": [
                "job_title (String)",
                "geo_latitude (Number)",
                "geo_longitude (Number)",
                "directions_url (String)"
            ]
        }
        
        # Save report
        report_path = "/tmp/banibs_business_directory_v2_migration_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Migration report saved: {report_path}")
        print("\n" + "="*60)
        print("✅ Business Directory v2 migration complete")
        print("="*60)
    
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(migrate_business_directory_v2())
