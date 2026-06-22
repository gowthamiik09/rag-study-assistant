"""In-memory rate-limiting middleware for FastAPI.

Tracks request timestamps per (client IP, endpoint) combination in a dict.
No external dependencies — uses only stdlib ``time`` and ``collections``.

Limits:
- ``/api/v1/chat`` endpoints: 30 requests per minute
- ``/api/v1/documents/upload``: 10 requests per minute
- All other endpoints: 60 requests per minute
"""

import json
import logging
import time
from collections import defaultdict
from typing import Dict, List, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response as StarletteResponse

logger = logging.getLogger(__name__)

# (max_requests, window_seconds)
RATE_LIMITS: Dict[str, Tuple[int, int]] = {
    "/api/v1/chat": (30, 60),
    "/api/v1/chat/stream": (30, 60),
    "/api/v1/documents/upload": (10, 60),
}
DEFAULT_RATE_LIMIT: Tuple[int, int] = (60, 60)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """ASGI middleware that enforces per-IP, per-endpoint rate limits.

    Expired timestamps are pruned on every request to avoid unbounded memory growth.
    """

    def __init__(self, app: any) -> None:
        super().__init__(app)
        # key: (ip, route_key) -> list of request timestamps
        self._requests: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    def _route_key(self, path: str) -> str:
        """Map a request path to a rate-limit bucket key."""
        for prefix in RATE_LIMITS:
            if path.startswith(prefix):
                return prefix
        return "__default__"

    def _get_limit(self, route_key: str) -> Tuple[int, int]:
        """Return (max_requests, window_seconds) for the given route key."""
        return RATE_LIMITS.get(route_key, DEFAULT_RATE_LIMIT)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> StarletteResponse:
        """Check rate limits before forwarding the request."""
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        route_key = self._route_key(path)
        max_requests, window = self._get_limit(route_key)

        bucket_key = (client_ip, route_key)
        now = time.time()
        cutoff = now - window

        # Prune expired entries
        timestamps = self._requests[bucket_key]
        self._requests[bucket_key] = [t for t in timestamps if t > cutoff]

        if len(self._requests[bucket_key]) >= max_requests:
            retry_after = int(self._requests[bucket_key][0] + window - now) + 1
            logger.warning(
                f"Rate limit exceeded for {client_ip} on {route_key} "
                f"({len(self._requests[bucket_key])}/{max_requests})"
            )
            return StarletteResponse(
                content=json.dumps({
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after_seconds": retry_after,
                }),
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(retry_after)},
            )

        self._requests[bucket_key].append(now)
        return await call_next(request)
