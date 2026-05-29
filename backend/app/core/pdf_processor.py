import os
import re
import logging
from typing import List, Dict, Any, Optional, Tuple

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings

logger = logging.getLogger(__name__)


class PDFProcessor:
    """Extracts text from PDFs and splits into overlapping chunks."""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def extract_text(self, file_path: str) -> Dict[str, Any]:
        reader = PdfReader(file_path)
        pages = []
        full_text = ""

        for page_num, page in enumerate(reader.pages):
            text = (page.extract_text() or "").strip()
            if text:
                pages.append({"page_number": page_num + 1, "content": text})
                full_text += f"\n\n[Page {page_num + 1}]\n{text}"

        return {
            "full_text": full_text,
            "pages": pages,
            "page_count": len(reader.pages),
        }

    def create_chunks(
        self, file_path: str, filename: str, document_id: str
    ) -> Tuple[List[Dict[str, Any]], int]:
        logger.info(f"Processing PDF: {filename}")
        extraction = self.extract_text(file_path)

        if not extraction["full_text"].strip():
            raise ValueError(
                f"No text could be extracted from {filename}. "
                "The PDF may be scanned or image-based."
            )

        raw_chunks = self.text_splitter.split_text(extraction["full_text"])

        chunks = []
        for i, chunk_text in enumerate(raw_chunks):
            chunks.append(
                {
                    "id": f"{document_id}_chunk_{i}",
                    "content": chunk_text,
                    "metadata": {
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": i,
                        "total_chunks": len(raw_chunks),
                        "page": self._extract_page_hint(chunk_text),
                    },
                }
            )

        logger.info(f"Created {len(chunks)} chunks from {filename}")
        return chunks, extraction["page_count"]

    def _extract_page_hint(self, chunk_text: str) -> Optional[int]:
        match = re.search(r"\[Page (\d+)\]", chunk_text)
        return int(match.group(1)) if match else None


pdf_processor = PDFProcessor()
