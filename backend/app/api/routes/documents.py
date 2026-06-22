"""Document management routes for upload, listing, and deletion.

Uses SQLite (via ``app.core.database``) for metadata persistence and
ChromaDB for vector chunk storage.
"""

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.auth import get_optional_user
from app.core.database import (
    add_document as db_add_document,
    delete_document as db_delete_document,
    get_document as db_get_document,
    get_documents as db_get_documents,
)
from app.core.pdf_processor import pdf_processor
from app.core.vector_store import vector_store
from app.models.schemas import DocumentResponse, PaginatedDocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])
logger = logging.getLogger(__name__)


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user: Optional[dict] = Depends(get_optional_user),
) -> DocumentResponse:
    """Upload a PDF document, extract text, chunk it, and store embeddings."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 50 MB.")

    document_id = str(uuid.uuid4())
    safe_name = file.filename.replace(" ", "_")
    user_id = user["id"] if user else None

    os.makedirs(settings.upload_dir, exist_ok=True)
    file_path = os.path.join(settings.upload_dir, f"{document_id}_{safe_name}")

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        chunks, page_count = pdf_processor.create_chunks(
            file_path=file_path,
            filename=safe_name,
            document_id=document_id,
        )
        chunk_count = vector_store.add_chunks(chunks)
    except ValueError as e:
        os.remove(file_path)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        os.remove(file_path)
        logger.error(f"Processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {e}")

    # Persist metadata to SQLite
    db_add_document(
        doc_id=document_id,
        filename=safe_name,
        page_count=page_count,
        chunk_count=chunk_count,
        file_path=file_path,
        user_id=user_id,
    )

    doc = DocumentResponse(
        id=document_id,
        filename=safe_name,
        page_count=page_count,
        chunk_count=chunk_count,
        uploaded_at=datetime.now(timezone.utc).isoformat(),
        status="ready",
    )
    logger.info(f"Uploaded: {safe_name} | ID: {document_id} | Chunks: {chunk_count}")
    return doc


@router.get("", response_model=PaginatedDocumentResponse)
async def list_documents(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    user: Optional[dict] = Depends(get_optional_user),
) -> PaginatedDocumentResponse:
    """Return a paginated list of uploaded documents."""
    user_id = user["id"] if user else None
    result = db_get_documents(user_id=user_id, page=page, limit=limit)
    documents = [
        DocumentResponse(
            id=d["id"],
            filename=d["filename"],
            page_count=d["page_count"],
            chunk_count=d["chunk_count"],
            uploaded_at=d["uploaded_at"],
            status=d["status"],
        )
        for d in result["documents"]
    ]
    return PaginatedDocumentResponse(
        documents=documents,
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
    )


@router.delete("/{document_id}")
async def delete_document(document_id: str) -> dict:
    """Delete a document's file, vector chunks, and database record."""
    doc = db_get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    deleted_chunks = vector_store.delete_document(document_id)

    file_path = doc.get("file_path", "")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    db_delete_document(document_id)
    return {"message": f"'{doc['filename']}' deleted.", "deleted_chunks": deleted_chunks}
