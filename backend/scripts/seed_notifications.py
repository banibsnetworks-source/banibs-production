"""
Seed Sample Notifications
Phase 6.2.1 - Notifications System

Run this script to populate sample notifications for testing.
Usage: python -m scripts.seed_notifications
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from db.notifications import create_notification
from db.unified_users import get_user_by_email
from datetime import datetime, timezone, timedelta


async def seed_notifications():
    """
    Seed sample notifications for testing
    
    Creates notifications for admin@banibs.com user with various types
    """
    print("=" * 60)
    print("BANIBS Notification Seeding")
    print("=" * 60)
    
    # Get admin user
    admin = await get_user_by_email("admin@banibs.com")
    if not admin:
        print("❌ Admin user not found. Please run user migration first.")
        return
    
    admin_id = admin["id"]
    print(f"✅ Found admin user: {admin['email']} (ID: {admin_id})")
    
    # Sample notifications to create
    notifications = [
        {
            "type": "system",
            "title": "Welcome to BANIBS Hub!",
            "message": "You now have access to the new unified dashboard. Explore news, opportunities, and connect with the community.",
            "link": "/hub"
        },
        {
            "type": "system",
            "title": "Phase 6.2 Features Live",
            "message": "New features are now available: real-time notifications, messaging, resources, and events!",
            "link": "/hub"
        },
        {
            "type": "business",
            "title": "Business Listing Approved",
            "message": "Your business 'BANIBS Consulting' has been approved and is now live in the directory.",
            "link": "/business/directory"
        },
        {
            "type": "opportunity",
            "title": "New Grant Opportunity",
            "message": "A new $50,000 small business grant is now available. Deadline: December 15, 2025.",
            "link": "/opportunities"
        },
        {
            "type": "opportunity",
            "title": "Job Posting Match",
            "message": "We found 3 new job opportunities that match your profile. Check them out!",
            "link": "/opportunities"
        },
        {
            "type": "event",
            "title": "Upcoming Event: Networking Mixer",
            "message": "Black Business Networking Mixer is tomorrow at 6pm. Don't forget to RSVP!",
            "link": "/events"
        },
        {
            "type": "event",
            "title": "Event RSVP Confirmed",
            "message": "Your RSVP for 'Tech Workshop: AI for Small Business' has been confirmed.",
            "link": "/events"
        },
        {
            "type": "system",
            "title": "Weekly News Digest",
            "message": "Your personalized news digest is ready. 15 new stories this week in Business & Technology.",
            "link": "/news"
        }
    ]
    
    print(f"\n📋 Creating {len(notifications)} sample notifications...")
    
    created_count = 0
    for notif in notifications:
        try:
            # Create notification with 30-day expiry
            expires_at = datetime.now(timezone.utc) + timedelta(days=30)
            
            await create_notification(
                user_id=admin_id,
                notification_type=notif["type"],
                title=notif["title"],
                message=notif["message"],
                link=notif.get("link"),
                expires_at=expires_at
            )
            
            created_count += 1
            print(f"   ✅ {notif['type'].upper()}: {notif['title']}")
        
        except Exception as e:
            print(f"   ❌ Failed to create {notif['title']}: {e}")
    
    print(f"\n✅ Seeding complete! Created {created_count}/{len(notifications)} notifications")
    print(f"\n💡 Test by logging in as admin@banibs.com and viewing /hub")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_notifications())
