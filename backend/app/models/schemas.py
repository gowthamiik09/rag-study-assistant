from pydantic import BaseModel
from typing import Optional, List


class DocumentResponse(BaseModel):
    id: str
    filename: str
    page_count: int
    chunk_count: int
    uploaded_at: str
    status: str = "ready"


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    chat_history: Optional[List[ChatMessage]] = []


class SourceChunk(BaseModel):
    content: str
    source: str
    page: Optional[int] = None
    relevance_score: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    model_used: str
    processing_time_ms: int


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
