import logging
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.pdf_processor import pdf_processor
from app.core.vector_store import vector_store
from app.models.schemas import DocumentListResponse, DocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])
logger = logging.getLogger(__name__)

# In-memory store — swap for SQLite/PostgreSQL in production
documents_db: dict = {}


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 50 MB.")

    document_id = str(uuid.uuid4())
    safe_name = file.filename.replace(" ", "_")

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

    doc = DocumentResponse(
        id=document_id,
        filename=safe_name,
        page_count=page_count,
        chunk_count=chunk_count,
        uploaded_at=datetime.now().isoformat(),
        status="ready",
    )
    documents_db[document_id] = doc
    logger.info(f"Uploaded: {safe_name} | ID: {document_id} | Chunks: {chunk_count}")
    return doc


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    docs = list(documents_db.values())
    return DocumentListResponse(documents=docs, total=len(docs))


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = documents_db[document_id]
    deleted = vector_store.delete_document(document_id)

    file_path = os.path.join(settings.upload_dir, f"{document_id}_{doc.filename}")
    if os.path.exists(file_path):
        os.remove(file_path)

    del documents_db[document_id]
    return {"message": f"'{doc.filename}' deleted.", "deleted_chunks": deleted}
