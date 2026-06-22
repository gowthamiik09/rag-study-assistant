"""SQLite database module for document metadata and user storage.

Provides synchronous database operations using the stdlib sqlite3 module.
Tables: documents (file metadata), users (authentication credentials).
"""

import logging
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)


def _get_connection() -> sqlite3.Connection:
    """Create a new SQLite connection with row factory enabled."""
    conn = sqlite3.connect(settings.database_url)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """Initialize the database schema, creating tables if they don't exist."""
    conn = _get_connection()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id          TEXT PRIMARY KEY,
                filename    TEXT NOT NULL,
                page_count  INTEGER NOT NULL DEFAULT 0,
                chunk_count INTEGER NOT NULL DEFAULT 0,
                uploaded_at TEXT NOT NULL,
                status      TEXT NOT NULL DEFAULT 'ready',
                file_path   TEXT,
                user_id     TEXT
            );

            CREATE TABLE IF NOT EXISTS users (
                id              TEXT PRIMARY KEY,
                email           TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at      TEXT NOT NULL
            );
            """
        )
        conn.commit()
        logger.info("SQLite database initialized successfully")
    finally:
        conn.close()


# ── Document operations ──────────────────────────────────────────────────────


def add_document(
    doc_id: str,
    filename: str,
    page_count: int,
    chunk_count: int,
    file_path: str,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Insert a new document record and return it as a dict."""
    uploaded_at = datetime.now(timezone.utc).isoformat()
    conn = _get_connection()
    try:
        conn.execute(
            """
            INSERT INTO documents (id, filename, page_count, chunk_count, uploaded_at, status, file_path, user_id)
            VALUES (?, ?, ?, ?, ?, 'ready', ?, ?)
            """,
            (doc_id, filename, page_count, chunk_count, uploaded_at, file_path, user_id),
        )
        conn.commit()
        return {
            "id": doc_id,
            "filename": filename,
            "page_count": page_count,
            "chunk_count": chunk_count,
            "uploaded_at": uploaded_at,
            "status": "ready",
            "file_path": file_path,
            "user_id": user_id,
        }
    finally:
        conn.close()


def get_documents(
    user_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> Dict[str, Any]:
    """Return a paginated list of documents, optionally filtered by user_id."""
    conn = _get_connection()
    try:
        offset = (page - 1) * limit

        if user_id:
            total_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM documents WHERE user_id = ?", (user_id,)
            ).fetchone()
            rows = conn.execute(
                "SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT ? OFFSET ?",
                (user_id, limit, offset),
            ).fetchall()
        else:
            total_row = conn.execute("SELECT COUNT(*) as cnt FROM documents").fetchone()
            rows = conn.execute(
                "SELECT * FROM documents ORDER BY uploaded_at DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()

        total = total_row["cnt"]
        documents = [dict(row) for row in rows]
        return {"documents": documents, "total": total, "page": page, "limit": limit}
    finally:
        conn.close()


def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    """Return a single document by ID, or None if not found."""
    conn = _get_connection()
    try:
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def delete_document(doc_id: str) -> bool:
    """Delete a document by ID. Returns True if a row was actually deleted."""
    conn = _get_connection()
    try:
        cursor = conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ── User operations ──────────────────────────────────────────────────────────


def add_user(user_id: str, email: str, hashed_password: str) -> Dict[str, Any]:
    """Insert a new user record and return it as a dict."""
    created_at = datetime.now(timezone.utc).isoformat()
    conn = _get_connection()
    try:
        conn.execute(
            """
            INSERT INTO users (id, email, hashed_password, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, email, hashed_password, created_at),
        )
        conn.commit()
        return {
            "id": user_id,
            "email": email,
            "hashed_password": hashed_password,
            "created_at": created_at,
        }
    finally:
        conn.close()


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Look up a user by email address. Returns None if not found."""
    conn = _get_connection()
    try:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Look up a user by ID. Returns None if not found."""
    conn = _get_connection()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()
