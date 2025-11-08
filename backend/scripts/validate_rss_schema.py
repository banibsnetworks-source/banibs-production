"""
Phase 6.5.2 - RSS Schema Validation Script
Verifies that all entries in rss_sources.py follow the standardized schema.
Safe to run standalone or as part of pre-deploy checks.
"""

import sys
import os
from urllib.parse import urlparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

EXPECTED_KEYS = {
    "id",
    "region",
    "category",
    "source_name",
    "rss_url",
    "language",
    "active",
}

def is_valid_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        return False

def validate_rss_sources():
    try:
        from config.rss_sources import RSS_SOURCES
    except ModuleNotFoundError:
        print("❌ Could not import rss_sources.py. Run from backend directory.")
        sys.exit(1)

    feeds = RSS_SOURCES
    if not isinstance(feeds, list):
        print("❌ RSS_SOURCES not found or not a list.")
        sys.exit(1)

    total = len(feeds)
    missing_fields = []
    invalid_urls = []
    inactive = []
    duplicate_ids = []
    ids_seen = set()

    for i, feed in enumerate(feeds, start=1):
        feed_id = feed.get("id", f"unnamed_{i}")
        # Check field presence
        missing = EXPECTED_KEYS - feed.keys()
        if missing:
            missing_fields.append((feed_id, missing))

        # Check duplicate IDs
        if feed_id in ids_seen:
            duplicate_ids.append(feed_id)
        else:
            ids_seen.add(feed_id)

        # Check URL validity
        url = feed.get("rss_url", "")
        if not is_valid_url(url):
            invalid_urls.append(feed_id)

        # Track inactive feeds
        if not feed.get("active", False):
            inactive.append(feed_id)

    print(f"\n🧾 Validating {total} RSS sources...\n")

    if missing_fields:
        print("❌ Missing fields:")
        for fid, missing in missing_fields:
            print(f"   - {fid}: missing {', '.join(missing)}")
    else:
        print("✅ All feeds have required fields.")

    if duplicate_ids:
        print(f"⚠️  Duplicate IDs found: {', '.join(duplicate_ids)}")
    else:
        print("✅ No duplicate IDs detected.")

    if invalid_urls:
        print(f"⚠️  Invalid URLs in: {', '.join(invalid_urls)}")
    else:
        print("✅ All RSS URLs appear valid.")

    print(f"📊 Active feeds: {len(feeds) - len(inactive)} / {total}")
    if inactive:
        print(f"   Inactive feeds ({len(inactive)}): {', '.join(inactive[:5])}{' ...' if len(inactive) > 5 else ''}")

    # Final summary
    if not missing_fields and not duplicate_ids:
        print("\n✅ Schema validation PASSED.\n")
        return True
    else:
        print("\n❌ Schema validation FAILED. Please correct the above issues.\n")
        return False

if __name__ == "__main__":
    success = validate_rss_sources()
    sys.exit(0 if success else 1)
