"""Tests for the PDF processor module."""

import pytest
from unittest.mock import patch, MagicMock


class TestPDFProcessor:
    """PDF text extraction and chunking tests."""

    def test_chunk_metadata_has_required_fields(self):
        """Each chunk should contain document_id, filename, chunk_index."""
        from app.core.pdf_processor import PDFProcessor

        processor = PDFProcessor()

        # Mock a simple PDF with text
        with patch("app.core.pdf_processor.PdfReader") as MockReader:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "This is a test document with enough text. " * 50
            MockReader.return_value.pages = [mock_page]

            chunks, page_count = processor.process("fake.pdf", "doc-123", "test.pdf")

            assert page_count == 1
            assert len(chunks) > 0

            for chunk in chunks:
                assert "id" in chunk
                assert "content" in chunk
                assert "metadata" in chunk
                assert chunk["metadata"]["document_id"] == "doc-123"
                assert chunk["metadata"]["filename"] == "test.pdf"
                assert "chunk_index" in chunk["metadata"]

    def test_empty_pdf_raises_error(self):
        """Should raise ValueError for PDFs with no extractable text."""
        from app.core.pdf_processor import PDFProcessor

        processor = PDFProcessor()

        with patch("app.core.pdf_processor.PdfReader") as MockReader:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = ""
            MockReader.return_value.pages = [mock_page]

            with pytest.raises(ValueError, match="No extractable text"):
                processor.process("fake.pdf", "doc-empty", "empty.pdf")

    def test_chunks_have_correct_id_format(self):
        """Chunk IDs should follow the {doc_id}_chunk_{index} format."""
        from app.core.pdf_processor import PDFProcessor

        processor = PDFProcessor()

        with patch("app.core.pdf_processor.PdfReader") as MockReader:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Sample text for testing chunking. " * 100
            MockReader.return_value.pages = [mock_page]

            chunks, _ = processor.process("fake.pdf", "abc", "test.pdf")

            for i, chunk in enumerate(chunks):
                assert chunk["id"] == f"abc_chunk_{i}"
