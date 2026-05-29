import asyncio
import logging

from fastapi import APIRouter, HTTPException

from app.core.rag_pipeline import rag_pipeline
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
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
