#!/usr/bin/env python3
"""
BDII Identity Threading - Contributor Migration Script
Migrates contributors from separate 'contributors' collection to BGLIS identity (banibs_users)

Usage:
    python migrate_contributors_to_bglis.py [--dry-run] [--verbose]

Options:
    --dry-run: Preview changes without committing to database
    --verbose: Show detailed progress for each contributor
"""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timezone
import argparse
import uuid

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment
load_dotenv()

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']


class ContributorMigration:
    """Manages migration of contributors to BGLIS identity"""
    
    def __init__(self, dry_run=False, verbose=False):
        self.dry_run = dry_run
        self.verbose = verbose
        self.client = None
        self.db = None
        
        # Statistics
        self.stats = {
            "total_contributors": 0,
            "migrated": 0,
            "merged_with_existing": 0,
            "created_new": 0,
            "skipped": 0,
            "errors": 0
        }
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(MONGO_URL)
        self.db = self.client[DB_NAME]
        print(f"✅ Connected to MongoDB: {DB_NAME}")
        
    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("✅ MongoDB connection closed")
    
    async def backup_collection(self, collection_name):
        """Create backup of collection before migration"""
        if self.dry_run:
            print(f"[DRY RUN] Would backup {collection_name}")
            return
            
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_name = f"{collection_name}_backup_{timestamp}"
        
        # Use MongoDB aggregation to copy collection
        pipeline = [{"$match": {}}, {"$out": backup_name}]
        await self.db[collection_name].aggregate(pipeline).to_list(length=None)
        
        count = await self.db[backup_name].count_documents({})
        print(f"✅ Backed up {count} documents to '{backup_name}'")
        
    def create_contributor_profile(self, contributor):
        """Create contributor_profile dict from contributor document"""
        return {
            "organization": contributor.get("organization"),
            "display_name": contributor.get("display_name"),
            "bio": contributor.get("bio"),
            "website_or_social": contributor.get("website_or_social"),
            "verified": contributor.get("verified", False),
            "total_submissions": contributor.get("total_submissions", 0),
            "approved_submissions": contributor.get("approved_submissions", 0),
            "featured_submissions": contributor.get("featured_submissions", 0)
        }
    
    async def migrate_contributor(self, contributor):
        """Migrate single contributor to BGLIS identity"""
        email = contributor.get("email")
        if not email:
            print(f"⚠️  Skipping contributor {contributor.get('_id')}: No email")
            self.stats["skipped"] += 1
            return
        
        try:
            # Check if user already exists in banibs_users by email
            existing_user = await self.db.banibs_users.find_one({"email": email.lower()})
            
            if existing_user:
                # User exists - merge contributor profile
                await self._merge_with_existing(existing_user, contributor)
            else:
                # User doesn't exist - create new BGLIS user
                await self._create_new_bglis_user(contributor)
                
        except Exception as e:
            print(f"❌ Error migrating contributor {email}: {str(e)}")
            self.stats["errors"] += 1
    
    async def _merge_with_existing(self, existing_user, contributor):
        """Merge contributor data into existing BGLIS user"""
        email = contributor.get("email")
        user_id = existing_user.get("id")
        
        # Create contributor profile
        contributor_profile = self.create_contributor_profile(contributor)
        
        # Add 'contributor' role if not present
        roles = existing_user.get("roles", ["user"])
        if "contributor" not in roles:
            roles.append("contributor")
        
        update_doc = {
            "$set": {
                "contributor_profile": contributor_profile,
                "roles": roles,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
        
        if self.dry_run:
            print(f"[DRY RUN] Would merge contributor {email} into existing user {user_id}")
            print(f"          Contributor profile: {contributor_profile}")
        else:
            result = await self.db.banibs_users.update_one(
                {"id": user_id},
                update_doc
            )
            
            if result.modified_count > 0:
                if self.verbose:
                    print(f"✅ Merged contributor {email} into existing BGLIS user {user_id}")
                self.stats["merged_with_existing"] += 1
            else:
                print(f"⚠️  No changes for {email} (already merged?)")
                self.stats["skipped"] += 1
    
    async def _create_new_bglis_user(self, contributor):
        """Create new BGLIS user from contributor data"""
        email = contributor.get("email")
        
        # Create new BGLIS user
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # Create contributor profile
        contributor_profile = self.create_contributor_profile(contributor)
        
        bglis_user = {
            "id": user_id,
            
            # From contributor
            "email": email.lower(),
            "password_hash": contributor.get("password_hash"),  # Preserve existing password
            "name": contributor.get("name"),
            
            # BGLIS fields (not yet set, needs upgrade)
            "phone_number": None,
            "phone_country_code": None,
            "is_phone_verified": False,
            "username": None,
            "has_recovery_phrase": False,
            "recovery_phrase_hash": None,
            "recovery_phrase_salt": None,
            "needs_bglis_upgrade": True,  # Mark for upgrade
            
            # Roles
            "roles": ["user", "contributor"],
            
            # Contributor profile (BDII threading)
            "contributor_profile": contributor_profile,
            
            # Default fields
            "avatar_url": None,
            "bio": contributor_profile.get("bio"),  # Use contributor bio as default
            "membership_level": "free",
            "membership_status": "active",
            "subscription_id": None,
            "subscription_expires_at": None,
            "email_verified": False,
            "email_verification_token": None,
            "email_verification_expires": None,
            "password_reset_token": None,
            "password_reset_expires": None,
            "created_at": contributor.get("created_at", now),
            "last_login": None,
            "updated_at": now,
            "metadata": {},
            
            # Optional fields
            "preferred_portal": "news",
            "preferred_language": "en",
            "region_primary": None,
            "region_secondary": None,
            "detected_country": None,
            "region_override": False,
            "region_detection_method": None,
            "emoji_identity": None,
            "profile_picture_url": None,
            "banner_image_url": None,
            "accent_color": "#3B82F6"
        }
        
        if self.dry_run:
            print(f"[DRY RUN] Would create new BGLIS user for contributor {email}")
            print(f"          User ID: {user_id}")
            print(f"          Roles: {bglis_user['roles']}")
            print(f"          Needs BGLIS upgrade: True")
        else:
            await self.db.banibs_users.insert_one(bglis_user)
            
            if self.verbose:
                print(f"✅ Created new BGLIS user for contributor {email} (ID: {user_id})")
            self.stats["created_new"] += 1
        
        self.stats["migrated"] += 1
    
    async def run_migration(self):
        """Run the full migration"""
        print("\n" + "="*70)
        print("BDII Identity Threading - Contributor Migration")
        print("="*70)
        
        if self.dry_run:
            print("⚠️  DRY RUN MODE - No changes will be committed\n")
        
        await self.connect()
        
        try:
            # Get count of contributors
            contributor_count = await self.db.contributors.count_documents({})
            self.stats["total_contributors"] = contributor_count
            
            if contributor_count == 0:
                print("ℹ️  No contributors found in 'contributors' collection")
                return
            
            print(f"📊 Found {contributor_count} contributors to migrate\n")
            
            # Backup contributors collection
            print("📦 Creating backup...")
            await self.backup_collection("contributors")
            print()
            
            # Migrate each contributor
            print("🔄 Starting migration...")
            contributors = await self.db.contributors.find({}).to_list(length=None)
            
            for idx, contributor in enumerate(contributors, 1):
                if self.verbose:
                    print(f"\n[{idx}/{contributor_count}] Processing {contributor.get('email')}...")
                elif idx % 10 == 0:
                    print(f"  Processed {idx}/{contributor_count} contributors...")
                
                await self.migrate_contributor(contributor)
            
            print()
            
        finally:
            await self.close()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print migration summary"""
        print("\n" + "="*70)
        print("MIGRATION SUMMARY")
        print("="*70)
        print(f"Total contributors:          {self.stats['total_contributors']}")
        print(f"Successfully migrated:       {self.stats['migrated']}")
        print(f"  ├─ Merged with existing:   {self.stats['merged_with_existing']}")
        print(f"  └─ Created new:            {self.stats['created_new']}")
        print(f"Skipped:                     {self.stats['skipped']}")
        print(f"Errors:                      {self.stats['errors']}")
        print("="*70)
        
        if self.dry_run:
            print("\n⚠️  DRY RUN COMPLETE - No changes were committed")
            print("    Run without --dry-run to perform actual migration\n")
        elif self.stats["errors"] == 0:
            print("\n✅ Migration completed successfully!")
            print("\n📋 Next Steps:")
            print("   1. Verify migrated contributors in banibs_users collection")
            print("   2. Test contributor login via BGLIS auth")
            print("   3. Test contributor opportunity submission")
            print("   4. After verification, optionally archive 'contributors' collection")
            print()
        else:
            print(f"\n⚠️  Migration completed with {self.stats['errors']} errors")
            print("    Please review error messages above\n")


async def main():
    parser = argparse.ArgumentParser(
        description="Migrate contributors to BGLIS identity system"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without committing to database"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed progress for each contributor"
    )
    
    args = parser.parse_args()
    
    migration = ContributorMigration(dry_run=args.dry_run, verbose=args.verbose)
    await migration.run_migration()


if __name__ == "__main__":
    asyncio.run(main())
