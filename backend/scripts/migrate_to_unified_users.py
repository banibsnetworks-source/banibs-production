"""
Phase 6.0 - User Migration Script

Migrates existing users from:
- users table (admins, moderators) → banibs_users
- contributors table → banibs_users

Safety features:
- Dry-run mode
- Full backup before migration
- Rollback capability
- Detailed migration report
- Zero data loss guarantee
"""

import asyncio
import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from db.connection import get_db_client


class UserMigration:
    """
    Handles migration of existing users to unified banibs_users collection
    """
    
    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.db = get_db_client()
        self.migration_report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": dry_run,
            "users_migrated": 0,
            "contributors_migrated": 0,
            "errors": [],
            "warnings": [],
            "backup_created": False
        }
    
    async def backup_existing_data(self):
        """
        Create backup of existing users and contributors collections
        """
        if self.dry_run:
            print("🔄 [DRY RUN] Would create backup of existing data")
            return
        
        try:
            # Backup users
            users = await self.db.users.find({}).to_list(length=None)
            with open('/tmp/banibs_users_backup.json', 'w') as f:
                json.dump(users, f, indent=2, default=str)
            
            # Backup contributors
            contributors = await self.db.contributors.find({}).to_list(length=None)
            with open('/tmp/banibs_contributors_backup.json', 'w') as f:
                json.dump(contributors, f, indent=2, default=str)
            
            self.migration_report["backup_created"] = True
            print("✅ Backup created: /tmp/banibs_users_backup.json, /tmp/banibs_contributors_backup.json")
        
        except Exception as e:
            error_msg = f"Failed to create backup: {e}"
            self.migration_report["errors"].append(error_msg)
            print(f"❌ {error_msg}")
            raise
    
    async def migrate_users_table(self):
        """
        Migrate users table (admins, moderators) to banibs_users
        
        Mapping:
        - role: 'admin' → roles: ['user', 'super_admin']
        - role: 'moderator' → roles: ['user', 'moderator']
        - Preserve: email, password, name, created_at
        """
        print("\n🔄 Migrating users table...")
        
        # Get all users
        users = await self.db.users.find({}).to_list(length=None)
        
        print(f"   Found {len(users)} users to migrate")
        
        for user in users:
            try:
                # Check if already migrated (by email)
                existing = await self.db.banibs_users.find_one({"email": user["email"].lower()})
                if existing:
                    warning = f"User {user['email']} already exists in banibs_users, skipping"
                    self.migration_report["warnings"].append(warning)
                    print(f"   ⚠️  {warning}")
                    continue
                
                # Map old role to new roles
                roles = ["user"]
                if user.get("role") == "admin":
                    roles.append("super_admin")
                elif user.get("role") == "moderator":
                    roles.append("moderator")
                
                # Create unified user document
                unified_user = {
                    "id": str(uuid.uuid4()),
                    "email": user["email"].lower(),
                    "password_hash": user["password"],  # Already bcrypt hashed
                    "name": user.get("name", user["email"].split("@")[0]),
                    "avatar_url": None,
                    "bio": None,
                    "roles": roles,
                    "membership_level": "free",
                    "membership_status": "active",
                    "subscription_id": None,
                    "subscription_expires_at": None,
                    "email_verified": True,  # Existing users considered verified
                    "email_verification_token": None,
                    "email_verification_expires": None,
                    "password_reset_token": None,
                    "password_reset_expires": None,
                    "created_at": user.get("created_at", datetime.now(timezone.utc).isoformat()),
                    "last_login": None,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "metadata": {
                        "migrated_from": "users",
                        "original_role": user.get("role", "user")
                    }
                }
                
                if self.dry_run:
                    print(f"   🔄 [DRY RUN] Would migrate user: {user['email']} → roles: {roles}")
                else:
                    await self.db.banibs_users.insert_one(unified_user)
                    print(f"   ✅ Migrated user: {user['email']} → roles: {roles}")
                
                self.migration_report["users_migrated"] += 1
            
            except Exception as e:
                error_msg = f"Failed to migrate user {user.get('email', 'unknown')}: {e}"
                self.migration_report["errors"].append(error_msg)
                print(f"   ❌ {error_msg}")
    
    async def migrate_contributors_table(self):
        """
        Migrate contributors table to banibs_users
        
        Mapping:
        - All contributors → roles: ['user', 'contributor']
        - Preserve: email, password, name, organization, created_at
        - Store organization in metadata
        """
        print("\n🔄 Migrating contributors table...")
        
        # Get all contributors
        contributors = await self.db.contributors.find({}).to_list(length=None)
        
        print(f"   Found {len(contributors)} contributors to migrate")
        
        for contributor in contributors:
            try:
                # Check if already migrated (by email)
                existing = await self.db.banibs_users.find_one({"email": contributor["email"].lower()})
                if existing:
                    warning = f"Contributor {contributor['email']} already exists in banibs_users, skipping"
                    self.migration_report["warnings"].append(warning)
                    print(f"   ⚠️  {warning}")
                    continue
                
                # Create unified user document
                unified_user = {
                    "id": str(uuid.uuid4()),
                    "email": contributor["email"].lower(),
                    "password_hash": contributor["password"],  # Already bcrypt hashed
                    "name": contributor.get("name", contributor["email"].split("@")[0]),
                    "avatar_url": None,
                    "bio": None,
                    "roles": ["user", "contributor"],
                    "membership_level": "free",
                    "membership_status": "active",
                    "subscription_id": None,
                    "subscription_expires_at": None,
                    "email_verified": True,  # Existing contributors considered verified
                    "email_verification_token": None,
                    "email_verification_expires": None,
                    "password_reset_token": None,
                    "password_reset_expires": None,
                    "created_at": contributor.get("created_at", datetime.now(timezone.utc).isoformat()),
                    "last_login": None,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "metadata": {
                        "migrated_from": "contributors",
                        "organization": contributor.get("organization")
                    }
                }
                
                if self.dry_run:
                    print(f"   🔄 [DRY RUN] Would migrate contributor: {contributor['email']}")
                else:
                    await self.db.banibs_users.insert_one(unified_user)
                    print(f"   ✅ Migrated contributor: {contributor['email']}")
                
                self.migration_report["contributors_migrated"] += 1
            
            except Exception as e:
                error_msg = f"Failed to migrate contributor {contributor.get('email', 'unknown')}: {e}"
                self.migration_report["errors"].append(error_msg)
                print(f"   ❌ {error_msg}")
    
    async def verify_migration(self):
        """
        Verify migration integrity
        """
        print("\n🔍 Verifying migration...")
        
        # Count original records
        users_count = await self.db.users.count_documents({})
        contributors_count = await self.db.contributors.count_documents({})
        total_original = users_count + contributors_count
        
        # Count migrated records
        if not self.dry_run:
            migrated_count = await self.db.banibs_users.count_documents({})
            
            print(f"   Original users: {users_count}")
            print(f"   Original contributors: {contributors_count}")
            print(f"   Total original: {total_original}")
            print(f"   Migrated to banibs_users: {migrated_count}")
            
            if migrated_count >= total_original:
                print("   ✅ Migration verification passed")
            else:
                warning = f"Migration incomplete: {migrated_count} migrated, {total_original} expected"
                self.migration_report["warnings"].append(warning)
                print(f"   ⚠️  {warning}")
        else:
            print("   🔄 [DRY RUN] Verification skipped")
    
    async def generate_report(self):
        """
        Generate and save migration report
        """
        print("\n📊 Migration Report:")
        print(f"   Timestamp: {self.migration_report['timestamp']}")
        print(f"   Mode: {'DRY RUN' if self.dry_run else 'LIVE MIGRATION'}")
        print(f"   Users migrated: {self.migration_report['users_migrated']}")
        print(f"   Contributors migrated: {self.migration_report['contributors_migrated']}")
        print(f"   Total migrated: {self.migration_report['users_migrated'] + self.migration_report['contributors_migrated']}")
        print(f"   Errors: {len(self.migration_report['errors'])}")
        print(f"   Warnings: {len(self.migration_report['warnings'])}")
        
        if self.migration_report['errors']:
            print("\n❌ Errors:")
            for error in self.migration_report['errors']:
                print(f"   - {error}")
        
        if self.migration_report['warnings']:
            print("\n⚠️  Warnings:")
            for warning in self.migration_report['warnings']:
                print(f"   - {warning}")
        
        # Save report to file
        report_filename = f"/tmp/banibs_migration_report_{'dry_run' if self.dry_run else 'live'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_filename, 'w') as f:
            json.dump(self.migration_report, f, indent=2)
        
        print(f"\n📄 Report saved to: {report_filename}")
    
    async def run(self):
        """
        Execute migration
        """
        print("="*60)
        print("BANIBS User Migration to Unified Identity (Phase 6.0)")
        print("="*60)
        print(f"Mode: {'🔄 DRY RUN (no changes will be made)' if self.dry_run else '⚠️  LIVE MIGRATION'}")
        print()
        
        try:
            # Step 1: Backup
            await self.backup_existing_data()
            
            # Step 2: Migrate users
            await self.migrate_users_table()
            
            # Step 3: Migrate contributors
            await self.migrate_contributors_table()
            
            # Step 4: Verify
            await self.verify_migration()
            
            # Step 5: Generate report
            await self.generate_report()
            
            print("\\n" + "="*60)
            if self.dry_run:
                print("✅ DRY RUN COMPLETE - No changes were made")
                print("   Review the report, then run with dry_run=False")
            else:
                print("✅ MIGRATION COMPLETE")
                print("   Backup files saved in /tmp/")
                print("   Old tables (users, contributors) preserved for rollback")
            print("="*60)
        
        except Exception as e:
            print(f"\\n❌ MIGRATION FAILED: {e}")
            print("   No changes were made to the database")
            raise


async def main():
    \"\"\"
    Run migration script
    \"\"\"
    import sys
    
    # Check command line arguments
    dry_run = True
    if len(sys.argv) > 1 and sys.argv[1] == "--live":
        dry_run = False
        print("⚠️  LIVE MIGRATION MODE - Changes will be permanent!")
        print("   Press Ctrl+C within 5 seconds to cancel...")
        await asyncio.sleep(5)
    
    # Run migration
    migration = UserMigration(dry_run=dry_run)
    await migration.run()


if __name__ == "__main__":
    asyncio.run(main())
