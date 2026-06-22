"""Shared pytest fixtures for the RAG Study Assistant test suite."""

import os
import sqlite3
import tempfile
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def tmp_database(tmp_path):
    """Use a temporary SQLite database for every test."""
    db_path = str(tmp_path / "test.db")
    with patch("app.config.settings") as mock_settings:
        mock_settings.database_url = db_path
        mock_settings.upload_dir = str(tmp_path / "uploads")
        mock_settings.chroma_persist_dir = str(tmp_path / "chroma")
        mock_settings.llm_provider = "groq"
        mock_settings.groq_api_key = "test-key"
        mock_settings.groq_model = "mixtral-8x7b-32768"
        mock_settings.ollama_base_url = "http://localhost:11434"
        mock_settings.ollama_model = "mistral"
        mock_settings.embedding_model = "all-MiniLM-L6-v2"
        mock_settings.chunk_size = 1000
        mock_settings.chunk_overlap = 200
        mock_settings.max_retrieval_docs = 5
        mock_settings.cors_origins = ["http://localhost:3000"]
        mock_settings.jwt_secret_key = "test-secret-key"
        os.makedirs(mock_settings.upload_dir, exist_ok=True)
        os.makedirs(mock_settings.chroma_persist_dir, exist_ok=True)
        yield mock_settings


@pytest.fixture
def db_conn(tmp_database):
    """Provide an initialized test database connection."""
    from app.core.database import init_db
    init_db()
    yield


@pytest.fixture
def sample_pdf(tmp_path):
    """Create a minimal valid PDF file for testing."""
    pdf_content = (
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << >> >>\nendobj\n"
        b"4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\n"
        b"endstream\nendobj\nxref\n0 5\n0000000000 65535 f \n"
        b"0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
        b"0000000266 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n360\n%%EOF"
    )
    pdf_file = tmp_path / "test.pdf"
    pdf_file.write_bytes(pdf_content)
    return pdf_file
