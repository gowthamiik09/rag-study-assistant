"""Tests for JWT authentication utilities."""

from app.core.auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    """Password hashing and verification tests."""

    def test_hash_password_returns_hash(self):
        """Should return a bcrypt hash different from the plain password."""
        hashed = hash_password("my_secret")
        assert hashed != "my_secret"
        assert hashed.startswith("$2b$")

    def test_verify_correct_password(self):
        """Should return True for a matching password."""
        hashed = hash_password("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_verify_wrong_password(self):
        """Should return False for a wrong password."""
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False


class TestJWTTokens:
    """JWT creation and decoding tests."""

    def test_create_and_decode_token(self):
        """Should encode and decode user data in a JWT."""
        token = create_access_token(data={"sub": "user-123", "email": "a@b.com"})
        payload = decode_access_token(token)
        assert payload["sub"] == "user-123"
        assert payload["email"] == "a@b.com"
        assert "exp" in payload

    def test_token_is_a_string(self):
        """Should return a string token."""
        token = create_access_token(data={"sub": "test"})
        assert isinstance(token, str)
        assert len(token) > 20
