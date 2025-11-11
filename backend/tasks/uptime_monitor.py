"""
Phase 7.5.2 - Uptime Monitoring Task
Automated health checks and logging for system uptime monitoring
"""
import asyncio
import aiohttp
import os
from datetime import datetime, timezone
from pathlib import Path
import logging

# Set up logging
log_dir = Path("/app/backend/logs")
log_dir.mkdir(exist_ok=True)
log_file = log_dir / "uptime-report.log"

# Configure logger for uptime monitoring
uptime_logger = logging.getLogger("uptime_monitor")
uptime_logger.setLevel(logging.INFO)

# File handler for uptime logs
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter(
    '%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
file_handler.setFormatter(file_formatter)
uptime_logger.addHandler(file_handler)

# Also log to console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(file_formatter)
uptime_logger.addHandler(console_handler)


# Endpoints to monitor
MONITORED_ENDPOINTS = [
    "/api/health/simple",
    "/api/news/featured",
    "/api/business/directory",
    "/api/jobs",
]


async def check_endpoint_health(base_url: str, endpoint: str) -> dict:
    """
    Check health of a single endpoint
    
    Returns dict with status, response_time, and error (if any)
    """
    url = f"{base_url}{endpoint}"
    start_time = datetime.now(timezone.utc)
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                response_time = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000  # ms
                
                return {
                    "endpoint": endpoint,
                    "status": "healthy" if response.status == 200 else "unhealthy",
                    "status_code": response.status,
                    "response_time_ms": round(response_time, 2),
                    "error": None
                }
    except asyncio.TimeoutError:
        response_time = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
        return {
            "endpoint": endpoint,
            "status": "timeout",
            "status_code": None,
            "response_time_ms": round(response_time, 2),
            "error": "Request timeout (>10s)"
        }
    except Exception as e:
        response_time = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
        return {
            "endpoint": endpoint,
            "status": "error",
            "status_code": None,
            "response_time_ms": round(response_time, 2),
            "error": str(e)
        }


async def run_uptime_check():
    """
    Run health checks on all monitored endpoints
    Called by APScheduler every 5 minutes
    """
    uptime_logger.info("=" * 80)
    uptime_logger.info("Starting uptime check cycle")
    
    # Determine base URL
    base_url = os.environ.get('BACKEND_URL', 'http://localhost:8001')
    
    # Check all endpoints
    results = []
    for endpoint in MONITORED_ENDPOINTS:
        result = await check_endpoint_health(base_url, endpoint)
        results.append(result)
        
        # Log individual result
        status_emoji = "✅" if result["status"] == "healthy" else "❌"
        if result["error"]:
            uptime_logger.warning(
                f"{status_emoji} {result['endpoint']} | "
                f"Status: {result['status']} | "
                f"Error: {result['error']}"
            )
        else:
            uptime_logger.info(
                f"{status_emoji} {result['endpoint']} | "
                f"Status: {result['status_code']} | "
                f"Response: {result['response_time_ms']}ms"
            )
    
    # Summary
    healthy_count = sum(1 for r in results if r["status"] == "healthy")
    total_count = len(results)
    avg_response_time = sum(r["response_time_ms"] for r in results if r["response_time_ms"]) / total_count
    
    uptime_logger.info(
        f"Check complete: {healthy_count}/{total_count} endpoints healthy | "
        f"Avg response: {avg_response_time:.2f}ms"
    )
    uptime_logger.info("=" * 80)
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "healthy_count": healthy_count,
        "total_count": total_count,
        "average_response_time_ms": round(avg_response_time, 2),
        "results": results
    }


def schedule_uptime_monitoring(scheduler):
    """
    Add uptime monitoring job to APScheduler
    
    Runs every 5 minutes
    """
    from apscheduler.triggers.interval import IntervalTrigger
    
    # Add job to run every 5 minutes
    scheduler.add_job(
        func=lambda: asyncio.create_task(run_uptime_check()),
        trigger=IntervalTrigger(minutes=5),
        id="uptime_monitor",
        name="Uptime Monitor - 5min interval",
        replace_existing=True
    )
    
    uptime_logger.info("✅ Uptime monitoring scheduled (5-minute intervals)")
    uptime_logger.info(f"📝 Logs will be written to: {log_file}")


# For manual testing
if __name__ == "__main__":
    print("Running manual uptime check...")
    result = asyncio.run(run_uptime_check())
    print(f"\nResults: {result}")
