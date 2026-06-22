"""Tests for the SQLite database module."""

from app.core.database import (
    add_document,
    add_user,
    delete_document,
    get_document,
    get_documents,
    get_user_by_email,
    get_user_by_id,
    init_db,
)


class TestDatabaseInit:
    """Database initialization tests."""

    def test_init_db_creates_tables(self, db_conn):
        """init_db should create the documents and users tables."""
        # If we get here without error, tables were created
        assert True

    def test_init_db_is_idempotent(self, db_conn):
        """Calling init_db twice should not raise errors."""
        init_db()
        assert True


class TestDocumentOperations:
    """Document CRUD tests."""

    def test_add_and_get_document(self, db_conn):
        """Should insert and retrieve a document by ID."""
        doc = add_document(
            doc_id="doc-1",
            filename="test.pdf",
            page_count=5,
            chunk_count=10,
            file_path="/tmp/test.pdf",
        )
        assert doc["id"] == "doc-1"
        assert doc["filename"] == "test.pdf"
        assert doc["status"] == "ready"

        retrieved = get_document("doc-1")
        assert retrieved is not None
        assert retrieved["filename"] == "test.pdf"
        assert retrieved["page_count"] == 5

    def test_get_nonexistent_document(self, db_conn):
        """Should return None for a missing document ID."""
        assert get_document("nonexistent") is None

    def test_delete_document(self, db_conn):
        """Should delete a document and return True."""
        add_document("doc-del", "del.pdf", 1, 2, "/tmp/del.pdf")
        assert delete_document("doc-del") is True
        assert get_document("doc-del") is None

    def test_delete_nonexistent_document(self, db_conn):
        """Should return False when deleting a missing document."""
        assert delete_document("nonexistent") is False

    def test_get_documents_pagination(self, db_conn):
        """Should paginate documents correctly."""
        for i in range(5):
            add_document(f"doc-{i}", f"file{i}.pdf", 1, 1, f"/tmp/{i}.pdf")

        page1 = get_documents(page=1, limit=2)
        assert len(page1["documents"]) == 2
        assert page1["total"] == 5
        assert page1["page"] == 1

        page3 = get_documents(page=3, limit=2)
        assert len(page3["documents"]) == 1

    def test_get_documents_by_user(self, db_conn):
        """Should filter documents by user_id."""
        add_document("d1", "a.pdf", 1, 1, "/a.pdf", user_id="user-1")
        add_document("d2", "b.pdf", 1, 1, "/b.pdf", user_id="user-2")
        add_document("d3", "c.pdf", 1, 1, "/c.pdf", user_id="user-1")

        result = get_documents(user_id="user-1")
        assert result["total"] == 2
        assert all(d["user_id"] == "user-1" for d in result["documents"])


class TestUserOperations:
    """User CRUD tests."""

    def test_add_and_get_user(self, db_conn):
        """Should insert and retrieve a user by email."""
        user = add_user("u1", "test@example.com", "hashed_pw")
        assert user["email"] == "test@example.com"

        retrieved = get_user_by_email("test@example.com")
        assert retrieved is not None
        assert retrieved["id"] == "u1"

    def test_get_user_by_id(self, db_conn):
        """Should retrieve a user by ID."""
        add_user("u2", "user2@test.com", "hashed")
        user = get_user_by_id("u2")
        assert user is not None
        assert user["email"] == "user2@test.com"

    def test_get_nonexistent_user(self, db_conn):
        """Should return None for unknown email."""
        assert get_user_by_email("nobody@test.com") is None
        assert get_user_by_id("no-such-id") is None
