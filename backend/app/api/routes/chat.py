"""Chat API routes for question-answering and streaming responses.

Provides both a synchronous POST endpoint and an SSE streaming endpoint
that forwards tokens from the LLM in real-time.
"""

import asyncio
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.rag_pipeline import rag_pipeline
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Answer a question using RAG: retrieve context then generate a response."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if len(request.question) > 2000:
        raise HTTPException(status_code=400, detail="Question too long (max 2000 chars).")

    try:
        return await asyncio.to_thread(
            rag_pipeline.query,
            question=request.question,
            document_ids=request.document_ids,
            chat_history=request.chat_history or [],
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.post("/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Stream an answer via Server-Sent Events.

    Each token is sent as ``data: {"token": "..."}``.
    The final event is ``data: {"done": true, "sources": [...]}``.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if len(request.question) > 2000:
        raise HTTPException(status_code=400, detail="Question too long (max 2000 chars).")

    async def event_generator():
        """Wrap the synchronous streaming generator for async iteration."""
        try:
            for event in rag_pipeline.query_stream(
                question=request.question,
                document_ids=request.document_ids,
                chat_history=request.chat_history or [],
            ):
                yield event
                await asyncio.sleep(0)  # yield control to event loop
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f'data: {{"error": "{str(e)}"}}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
