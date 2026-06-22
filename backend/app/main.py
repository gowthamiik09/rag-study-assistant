"""RAG Study Assistant — FastAPI application entry-point.

Configures the ASGI app, middleware stack, routers, and lifespan events.
"""

import logging
import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, chat, documents
from app.config import settings
from app.core.database import init_db
from app.middleware.rate_limit import RateLimitMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle for the FastAPI application."""
    logger.info("🚀 RAG Study Assistant API starting up...")
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs(settings.chroma_persist_dir, exist_ok=True)

    # Initialize SQLite database
    init_db()

    model_name = settings.groq_model if settings.llm_provider == "groq" else settings.ollama_model
    logger.info(f"✅ Ready — provider: {settings.llm_provider}, model: {model_name}")
    yield
    logger.info("👋 Shutting down.")


app = FastAPI(
    title="RAG Study Assistant API",
    description="AI-powered document Q&A with RAG pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Use configured origins, but fall back to ["*"] if still on the default
# localhost-only value (so nothing breaks for open dev setups).
cors_origins = settings.cors_origins
if cors_origins == ["http://localhost:3000"]:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate limiting ────────────────────────────────────────────────────────────
app.add_middleware(RateLimitMiddleware)


# ── Request-ID middleware ────────────────────────────────────────────────────
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Attach a unique X-Request-ID header to every response."""
    request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(documents.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")


@app.get("/")
async def root() -> dict:
    """Root health-check endpoint with version info."""
    return {"message": "RAG Study Assistant API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health() -> dict:
    """Lightweight liveness probe."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
