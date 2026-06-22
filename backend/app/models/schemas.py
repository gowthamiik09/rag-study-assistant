"""Pydantic schemas for the RAG Study Assistant API.

Defines request/response models for documents, chat, authentication,
and shared error types.
"""

from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ── Document schemas ─────────────────────────────────────────────────────────


class DocumentResponse(BaseModel):
    """Represents a single uploaded document."""

    id: str
    filename: str
    page_count: int
    chunk_count: int
    uploaded_at: str
    status: str = "ready"


class DocumentListResponse(BaseModel):
    """Legacy document list (unpaginated)."""

    documents: List[DocumentResponse]
    total: int


class PaginatedDocumentResponse(BaseModel):
    """Paginated list of documents with offset metadata."""

    documents: List[DocumentResponse]
    total: int
    page: int
    limit: int


# ── Chat schemas ─────────────────────────────────────────────────────────────


class ChatMessage(BaseModel):
    """A single message in a conversation history."""

    role: str
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Incoming chat question with optional document filter and history."""

    question: str
    document_ids: Optional[List[str]] = None
    chat_history: Optional[List[ChatMessage]] = []


class SourceChunk(BaseModel):
    """A retrieved context chunk returned alongside an answer."""

    content: str
    source: str
    page: Optional[int] = None
    relevance_score: float


class ChatResponse(BaseModel):
    """LLM-generated answer with source citations and timing info."""

    answer: str
    sources: List[SourceChunk]
    model_used: str
    processing_time_ms: int


# ── Auth schemas ─────────────────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    """User registration payload."""

    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """User login payload."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public user profile returned in auth responses."""

    id: str
    email: str
    created_at: str


class AuthResponse(BaseModel):
    """Token response returned after successful login or registration."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Error schemas ────────────────────────────────────────────────────────────


class ErrorResponse(BaseModel):
    """Standard error body."""

    detail: str
    error_code: Optional[str] = None
