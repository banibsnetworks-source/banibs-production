"""
BANIBS Image Verification Script
--------------------------------
Checks all NewsItem records for missing or fallback images.

Usage:
    cd /app/backend
    python scripts/test_images.py
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Same fallback mapping used in rss_sync.py
FALLBACK_IMAGES = {
    "Business":     "https://cdn.banibs.com/fallback/business.jpg",
    "Technology":   "https://cdn.banibs.com/fallback/tech.jpg",
    "Education":    "https://cdn.banibs.com/fallback/education.jpg",
    "Community":    "https://cdn.banibs.com/fallback/community.jpg",
    "Opportunities":"https://cdn.banibs.com/fallback/opportunities.jpg",
}


def main():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("❌ Error: MONGO_URL or DB_NAME not found in environment")
        return
    
    client = MongoClient(mongo_url)
    db = client[db_name]
    news_collection = db.news_items

    try:
        # Get all news items sorted by publishedAt descending
        rows = list(news_collection.find({}, {"_id": 0}).sort("publishedAt", -1))

        no_image = []
        fallback_used = []
        real_images = []
        seen_sources = {}

        for row in rows:
            image = row.get("imageUrl") or ""
            source = row.get("sourceName") or "Unknown"
            category = row.get("category") or "Unknown"
            
            # Track per-source statistics
            seen_sources.setdefault(source, {"total": 0, "missing": 0, "fallback": 0})
            seen_sources[source]["total"] += 1

            if not image:
                no_image.append(row)
                seen_sources[source]["missing"] += 1
            elif image in FALLBACK_IMAGES.values():
                fallback_used.append(row)
                seen_sources[source]["fallback"] += 1
            else:
                real_images.append(row)

        print("\nBANIBS Image Coverage Report")
        print("-" * 40)
        print(f"Total stories: {len(rows)}")
        print(f"Real images:  {len(real_images)}")
        print(f"Fallbacks:    {len(fallback_used)}")
        print(f"Missing:      {len(no_image)}")
        print("-" * 40)

        print("\nPer-Source Summary:")
        for src, stats in seen_sources.items():
            total = stats["total"]
            miss = stats["missing"]
            fall = stats["fallback"]
            real_count = total - miss - fall
            print(f"{src:<35}  total={total:>3}  real={real_count:>3}  fallback={fall:>3}  missing={miss:>3}")

        if no_image:
            print("\n⚠️  Stories with completely missing imageUrl:")
            for row in no_image[:10]:
                category = row.get("category", "Unknown")
                title = row.get("title", "Untitled")[:80]
                print(f" - [{category}] {title}")
        
        if fallback_used:
            print(f"\n🖼️  Sample stories using fallback images:")
            for row in fallback_used[:5]:
                category = row.get("category", "Unknown")
                title = row.get("title", "Untitled")[:80]
                source = row.get("sourceName", "Unknown")
                print(f" - [{category}] {title} (from {source})")
        
        if real_images:
            print(f"\n✅ Sample stories with real images:")
            for row in real_images[:5]:
                category = row.get("category", "Unknown")
                title = row.get("title", "Untitled")[:80]
                source = row.get("sourceName", "Unknown")
                image_domain = row.get("imageUrl", "").split("/")[2] if row.get("imageUrl", "") else ""
                print(f" - [{category}] {title} (from {source}) - {image_domain}")

        # Success rate calculation
        if len(rows) > 0:
            success_rate = (len(real_images) + len(fallback_used)) / len(rows) * 100
            print(f"\n📊 Image Coverage: {success_rate:.1f}% (including fallbacks)")
            
            if len(no_image) == 0:
                print("🎉 Perfect! All stories have images (real or fallback)")
            elif len(no_image) < 3:
                print("👍 Nearly perfect image coverage!")
            else:
                print("⚠️  Consider checking RSS parser or fallback assignment")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    main()