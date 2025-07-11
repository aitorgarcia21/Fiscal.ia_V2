from __future__ import annotations

import time
import asyncio
from typing import Dict, List

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects common security headers into every response."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        # Strict transport security (handled by Railway CDN but safe to add)
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        # Click-jacking protection
        response.headers["X-Frame-Options"] = "DENY"
        # Disable MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Referrer policy
        response.headers["Referrer-Policy"] = "same-origin"
        # Fine-grained browser features permissions
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        # Content Security Policy (adapted to Stripe + self)
        csp = (
            "default-src 'self'; "
            "img-src 'self' data:; "
            "script-src 'self' 'unsafe-inline' https://js.stripe.com; "
            "connect-src 'self' https://api.stripe.com; "
            "style-src 'self' 'unsafe-inline'; "
            "frame-src https://js.stripe.com"
        )
        response.headers["Content-Security-Policy"] = csp
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Very simple in-memory rate limiter per client IP.

    Not production-grade for multi-replica environments but provides
    a first line of defense.
    """

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window_seconds
        self._store: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "anonymous"
        now = time.time()
        async with self._lock:
            history = self._store.get(client_ip, [])
            # Remove timestamps older than window
            history = [ts for ts in history if now - ts < self.window]
            history.append(now)
            self._store[client_ip] = history
            if len(history) > self.max_requests:
                return Response(
                    content="Trop de requêtes, réessayez plus tard.",
                    status_code=429,
                )
        return await call_next(request)
