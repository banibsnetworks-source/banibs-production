"""
Phase 6.5.2 - RSS Health Check & Auto-Report

Runs the RSS schema validation and writes a timestamped
report to /app/logs/rss_validation.log.

Safe to run manually or via a scheduler.
"""

import io
import os
import sys
from datetime import datetime
from contextlib import redirect_stdout

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the existing validator
try:
    from scripts import validate_rss_schema
except ImportError:
    print("❌ Could not import validate_rss_schema. Ensure it exists at scripts/validate_rss_schema.py")
    sys.exit(1)

LOG_DIR = "/app/logs"
LOG_FILE = os.path.join(LOG_DIR, "rss_validation.log")


def ensure_log_dir():
    """Create log directory if it doesn't exist"""
    if not os.path.isdir(LOG_DIR):
        os.makedirs(LOG_DIR, exist_ok=True)


def run_health_check():
    """Run RSS schema validation and log results"""
    ensure_log_dir()

    buffer = io.StringIO()

    # Capture the printed output of validate_rss_sources()
    with redirect_stdout(buffer):
        validate_rss_schema.validate_rss_sources()

    report = buffer.getvalue()
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    # Build the log entry
    log_entry = [
        "============================================================",
        f"RSS HEALTH CHECK @ {timestamp}",
        "------------------------------------------------------------",
        report.strip(),
        ""
    ]
    log_text = "\n".join(log_entry) + "\n"

    # Append to log file
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_text)

    # Also echo to console so you see it when run manually
    print(log_text)
    print(f"✅ Health check logged to: {LOG_FILE}")


if __name__ == "__main__":
    run_health_check()
