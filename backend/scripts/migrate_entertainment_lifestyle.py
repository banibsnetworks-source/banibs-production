"""
MongoDB Migration Script: Re-categorize Entertainment & Lifestyle Content
Phase 8.4 - Category Realignment

This script identifies news items that are currently miscategorized under "Business"
but should be under "Entertainment" or "Lifestyle" based on their source feed.

Usage:
    python migrate_entertainment_lifestyle.py [--dry-run]

Options:
    --dry-run    Show what would be changed without making actual updates
"""

import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from db.connection import get_db_client
from config.rss_sources import RSS_SOURCES


async def get_source_ids_by_category(category: str) -> list:
    """Get list of source IDs for a given category from RSS_SOURCES"""
    return [
        source['id'] 
        for source in RSS_SOURCES 
        if source.get('category') == category and source.get('active', False)
    ]


async def migrate_category(
    db, 
    source_ids: list, 
    old_category: str, 
    new_category: str, 
    dry_run: bool = False
) -> dict:
    """
    Migrate items from old_category to new_category for given source_ids
    
    Returns:
        dict with 'matched' and 'modified' counts
    """
    if not source_ids:
        print(f"⚠️  No active source IDs found for {new_category}")
        return {'matched': 0, 'modified': 0}
    
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Migrating {new_category.upper()}:")
    print(f"  Source IDs: {', '.join(source_ids)}")
    print(f"  Looking for items with category='{old_category}' from these sources...")
    
    # Find matching documents
    query = {
        'source_id': {'$in': source_ids},
        'category': old_category
    }
    
    matched_count = await db.news_items.count_documents(query)
    print(f"  📊 Found {matched_count} items to migrate")
    
    if matched_count == 0:
        return {'matched': 0, 'modified': 0}
    
    # Show sample items
    sample_items = await db.news_items.find(query).limit(3).to_list(3)
    if sample_items:
        print(f"  📝 Sample items:")
        for item in sample_items:
            print(f"     - {item.get('title', 'No title')[:60]}... (source: {item.get('sourceName')})")
    
    if dry_run:
        print(f"  🚫 DRY RUN - Would update {matched_count} items")
        return {'matched': matched_count, 'modified': 0}
    
    # Perform the migration
    result = await db.news_items.update_many(
        query,
        {
            '$set': {
                'category': new_category,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    modified_count = result.modified_count
    print(f"  ✅ Successfully migrated {modified_count} items to '{new_category}'")
    
    return {'matched': matched_count, 'modified': modified_count}


async def verify_migration(db):
    """Verify the migration results"""
    print("\n" + "="*60)
    print("VERIFICATION - Category Distribution:")
    print("="*60)
    
    # Get counts by category
    pipeline = [
        {
            '$group': {
                '_id': '$category',
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'count': -1}
        }
    ]
    
    results = await db.news_items.aggregate(pipeline).to_list(None)
    
    for result in results:
        category = result['_id'] or 'null'
        count = result['count']
        print(f"  {category.ljust(20)}: {count:,} items")
    
    # Check for miscategorized items
    entertainment_sources = await get_source_ids_by_category('Entertainment')
    lifestyle_sources = await get_source_ids_by_category('Lifestyle')
    
    if entertainment_sources:
        still_miscategorized_ent = await db.news_items.count_documents({
            'source_id': {'$in': entertainment_sources},
            'category': {'$ne': 'entertainment'}
        })
        if still_miscategorized_ent > 0:
            print(f"\n  ⚠️  WARNING: {still_miscategorized_ent} Entertainment items still miscategorized")
    
    if lifestyle_sources:
        still_miscategorized_life = await db.news_items.count_documents({
            'source_id': {'$in': lifestyle_sources},
            'category': {'$ne': 'lifestyle'}
        })
        if still_miscategorized_life > 0:
            print(f"  ⚠️  WARNING: {still_miscategorized_life} Lifestyle items still miscategorized")


async def main():
    """Main migration function"""
    dry_run = '--dry-run' in sys.argv
    
    print("="*60)
    print("BANIBS News Category Migration")
    print("Entertainment & Lifestyle Realignment")
    print("="*60)
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No changes will be made\n")
    else:
        print("\n⚠️  LIVE MODE - Database will be updated\n")
        response = input("Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("Migration cancelled.")
            return
    
    try:
        db = get_db_client()
        
        # Get source IDs for each category
        entertainment_sources = await get_source_ids_by_category('Entertainment')
        lifestyle_sources = await get_source_ids_by_category('Lifestyle')
        
        print(f"\nFound {len(entertainment_sources)} active Entertainment sources")
        print(f"Found {len(lifestyle_sources)} active Lifestyle sources")
        
        # Track total statistics
        total_stats = {
            'entertainment': {'matched': 0, 'modified': 0},
            'lifestyle': {'matched': 0, 'modified': 0}
        }
        
        # Migrate Entertainment items
        if entertainment_sources:
            ent_stats = await migrate_category(
                db, 
                entertainment_sources, 
                'business',  # Old category
                'entertainment',  # New category
                dry_run
            )
            total_stats['entertainment'] = ent_stats
        
        # Migrate Lifestyle items
        if lifestyle_sources:
            life_stats = await migrate_category(
                db, 
                lifestyle_sources, 
                'business',  # Old category
                'lifestyle',  # New category
                dry_run
            )
            total_stats['lifestyle'] = life_stats
        
        # Summary
        print("\n" + "="*60)
        print("MIGRATION SUMMARY")
        print("="*60)
        print(f"Entertainment: {total_stats['entertainment']['matched']} matched, "
              f"{total_stats['entertainment']['modified']} modified")
        print(f"Lifestyle:     {total_stats['lifestyle']['matched']} matched, "
              f"{total_stats['lifestyle']['modified']} modified")
        
        total_matched = (total_stats['entertainment']['matched'] + 
                        total_stats['lifestyle']['matched'])
        total_modified = (total_stats['entertainment']['modified'] + 
                         total_stats['lifestyle']['modified'])
        
        print(f"\nTOTAL:         {total_matched} matched, {total_modified} modified")
        
        if not dry_run and total_modified > 0:
            # Verify migration
            await verify_migration(db)
            print("\n✅ Migration completed successfully!")
        elif dry_run:
            print("\n🔍 Dry run completed. Run without --dry-run to apply changes.")
        else:
            print("\n✅ No items needed migration.")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
