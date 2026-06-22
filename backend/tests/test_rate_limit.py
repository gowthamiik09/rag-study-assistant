"""Tests for the rate limiting middleware."""

import time
from unittest.mock import MagicMock

from app.middleware.rate_limit import RateLimitMiddleware, RATE_LIMITS, DEFAULT_RATE_LIMIT


class TestRateLimitConfig:
    """Rate limit configuration tests."""

    def test_chat_endpoint_limit(self):
        """Chat endpoints should have 30 req/min limit."""
        assert RATE_LIMITS["/api/v1/chat"] == (30, 60)

    def test_upload_endpoint_limit(self):
        """Upload endpoint should have 10 req/min limit."""
        assert RATE_LIMITS["/api/v1/documents/upload"] == (10, 60)

    def test_default_limit(self):
        """Default limit should be 60 req/min."""
        assert DEFAULT_RATE_LIMIT == (60, 60)

    def test_route_key_matching(self):
        """Should match routes to correct rate limit buckets."""
        middleware = RateLimitMiddleware(MagicMock())

        assert middleware._route_key("/api/v1/chat") == "/api/v1/chat"
        assert middleware._route_key("/api/v1/chat/stream") == "/api/v1/chat"
        assert middleware._route_key("/api/v1/documents/upload") == "/api/v1/documents/upload"
        assert middleware._route_key("/health") == "__default__"
        assert middleware._route_key("/api/v1/documents") == "__default__"
