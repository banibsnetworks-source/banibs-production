"""
BANIBS RSS Health Report (Extended)
-----------------------------------
This job is run after every RSS sync+mirror cycle.

It summarizes:
- total stories in DB
- image coverage (real, fallback, missing)
- CDN compliance (served from cdn.banibs.com)
- average mirrored image size per source
- alerts for oversize assets

Output is appended to /var/log/banibs_rss_health.log
and also returned to callers of /api/news/rss-sync.
"""

import os
from datetime import datetime
from urllib.parse import urlparse
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CDN_BASE = "https://cdn.banibs.com/news"
LOG_PATH = "/var/log/banibs_rss_health.log"

# Keep in sync with rss_sync.FALLBACK_IMAGES
FALLBACK_IMAGES = {
    "Business":     "https://cdn.banibs.com/fallback/business.jpg",
    "Technology":   "https://cdn.banibs.com/fallback/tech.jpg",
    "Education":    "https://cdn.banibs.com/fallback/education.jpg",
    "Community":    "https://cdn.banibs.com/fallback/community.jpg",
    "Opportunities":"https://cdn.banibs.com/fallback/opportunities.jpg",
}


def _get_file_size_mb_from_local_path(image_url: str) -> float | None:
    """
    Given a CDN URL like https://cdn.banibs.com/news/abc123.jpg,
    derive the local file path (e.g. /var/www/cdn.banibs.com/news/abc123.jpg),
    and return its size in MB.
    """
    # This MUST match LOCAL_MIRROR_DIR in cdn_mirror.py
    LOCAL_MIRROR_DIR = "/var/www/cdn.banibs.com/news"

    if not image_url or not image_url.startswith(CDN_BASE):
        return None

    filename = os.path.basename(urlparse(image_url).path)
    local_path = os.path.join(LOCAL_MIRROR_DIR, filename)

    if not os.path.exists(local_path):
        return None

    size_bytes = os.path.getsize(local_path)
    size_mb = size_bytes / (1024 * 1024)
    return round(size_mb, 3)


async def generate_health_report():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    news_collection = db.news_items

    try:
        # Get all news items sorted by publishedAt descending
        rows = await news_collection.find({}, {"_id": 0}).sort("publishedAt", -1).to_list(length=None)

        totals = {
            "stories_total": 0,
            "stories_with_real_images": 0,
            "stories_with_fallback": 0,
            "stories_missing_image": 0,
            "stories_cdn_hosted": 0,
            "stories_not_cdn_hosted": 0,
        }

        per_source = {}  # { sourceName: {...stats...} }
        oversized_assets = []  # images > 2 MB after optimization

        for row in rows:
            totals["stories_total"] += 1

            img_url = row.get("imageUrl") or ""
            src = row.get("sourceName") or "Unknown"
            cat = row.get("category") or "Unknown"

            if src not in per_source:
                per_source[src] = {
                    "total": 0,
                    "real": 0,
                    "fallback": 0,
                    "missing": 0,
                    "cdn": 0,
                    "not_cdn": 0,
                    "sizes": [],  # MB floats
                    "categories": set(),
                }

            per_source[src]["total"] += 1
            per_source[src]["categories"].add(cat)

            # classify image state
            if not img_url:
                totals["stories_missing_image"] += 1
                per_source[src]["missing"] += 1
            elif img_url in FALLBACK_IMAGES.values():
                totals["stories_with_fallback"] += 1
                per_source[src]["fallback"] += 1
            else:
                totals["stories_with_real_images"] += 1
                per_source[src]["real"] += 1

            # CDN compliance
            size_mb = _get_file_size_mb_from_local_path(img_url)
            if img_url.startswith(CDN_BASE):
                totals["stories_cdn_hosted"] += 1
                per_source[src]["cdn"] += 1

                if size_mb is not None:
                    per_source[src]["sizes"].append(size_mb)
                    if size_mb > 2.0:
                        oversized_assets.append({
                            "title": row.get("title", "")[:80],
                            "source": src,
                            "size_mb": size_mb,
                            "imageUrl": img_url,
                        })
            else:
                per_source[src]["not_cdn"] += 1
                totals["stories_not_cdn_hosted"] += 1

        timestamp = datetime.utcnow().isoformat() + "Z"

        # human-readable header
        header_lines = [
            f"[{timestamp}] BANIBS RSS Health:",
            f"  Total stories:              {totals['stories_total']}",
            f"  Real images:                {totals['stories_with_real_images']}",
            f"  Branded fallback images:    {totals['stories_with_fallback']}",
            f"  Missing images:             {totals['stories_missing_image']}",
            f"  CDN-hosted images:          {totals['stories_cdn_hosted']}",
            f"  Non-CDN images (BAD):       {totals['stories_not_cdn_hosted']}",
        ]

        # build per-source section
        per_source_lines = ["  Per-source coverage:"]
        for src, stats in per_source.items():
            avg_size = None
            if stats["sizes"]:
                avg_size = round(sum(stats["sizes"]) / len(stats["sizes"]), 3)

            cats_str = ", ".join(sorted(stats["categories"]))

            per_source_lines.append(
                f"    - {src}: "
                f"total={stats['total']} "
                f"real={stats['real']} "
                f"fallback={stats['fallback']} "
                f"missing={stats['missing']} "
                f"cdn={stats['cdn']} "
                f"not_cdn={stats['not_cdn']} "
                f"avgSizeMB={avg_size if avg_size is not None else 'n/a'} "
                f"cats=[{cats_str}]"
            )

        # oversized assets section
        if oversized_assets:
            oversized_lines = ["  ⚠ Oversized assets (>2MB after optimization):"]
            for o in oversized_assets[:10]:
                oversized_lines.append(
                    f"    {o['source']}: {o['title']} "
                    f"({o['size_mb']} MB) {o['imageUrl']}"
                )
        else:
            oversized_lines = ["  ✅ No oversized assets (>2MB)."]

        # missing images section
        if totals["stories_missing_image"] > 0:
            missing_lines = ["  ❌ Stories still missing imageUrl entirely (should be 0)."]
        else:
            missing_lines = ["  ✅ All stories have images (real or fallback)."]

        full_report = "\n".join(
            header_lines +
            [""] +
            per_source_lines +
            [""] +
            oversized_lines +
            [""] +
            missing_lines +
            [""]
        )

        return full_report

    finally:
        client.close()


def write_report_to_log(report: str):
    # Append to log; fallback to print if log not writable
    try:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, "a") as f:
            f.write(report + "\n")
    except Exception:
        print(report)


def main():
    report = asyncio.run(generate_health_report())
    write_report_to_log(report)


if __name__ == "__main__":
    main()