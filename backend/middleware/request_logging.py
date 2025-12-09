"""
Request Logging Middleware
Logs all incoming requests and unhandled exceptions with correlation IDs

SECURITY: Does NOT log passwords, tokens, or sensitive data
"""

import logging
import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all incoming HTTP requests
    - Logs method, path, status code, and duration
    - Adds correlation ID for request tracing
    - Filters out sensitive data (passwords, tokens)
    """
    
    # Paths to skip logging (health checks, static files)
    SKIP_PATHS = {
        '/health',
        '/api/health',
        '/static',
        '/favicon.ico'
    }
    
    # Headers that should never be logged
    SENSITIVE_HEADERS = {
        'authorization',
        'cookie',
        'x-api-key',
        'x-auth-token'
    }
    
    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        # Generate correlation ID for request tracing
        correlation_id = str(uuid.uuid4())[:8]
        request.state.correlation_id = correlation_id
        
        # Skip logging for certain paths
        if any(request.url.path.startswith(skip) for skip in self.SKIP_PATHS):
            return await call_next(request)
        
        # Start timer
        start_time = time.time()
        
        # Log incoming request
        logger.info(
            f"📨 [{correlation_id}] {request.method} {request.url.path} "
            f"| Client: {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log response
            status_emoji = "✅" if response.status_code < 400 else "⚠️" if response.status_code < 500 else "❌"
            logger.info(
                f"{status_emoji} [{correlation_id}] {request.method} {request.url.path} "
                f"→ {response.status_code} | {duration_ms:.2f}ms"
            )
            
            # Add correlation ID to response headers for debugging
            response.headers["X-Correlation-ID"] = correlation_id
            
            return response
            
        except Exception as e:
            # Log unhandled exception
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"💥 [{correlation_id}] {request.method} {request.url.path} "
                f"| EXCEPTION after {duration_ms:.2f}ms: {type(e).__name__}: {str(e)}",
                exc_info=True
            )
            raise


def setup_logging():
    """
    Configure logging format and handlers
    Call this during app startup
    """
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Set specific log levels for noisy libraries
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('asyncio').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)  # FastAPI access logs
    
    logger.info("✅ Request logging middleware initialized")
