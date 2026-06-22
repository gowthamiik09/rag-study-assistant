"""Authentication routes for user registration and login.

Provides JWT-based auth endpoints. Passwords are hashed with bcrypt;
tokens are signed HS256 JWTs valid for 24 hours.
"""

import logging
import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.auth import create_access_token, hash_password, verify_password
from app.core.database import add_user, get_user_by_email
from app.models.schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest) -> AuthResponse:
    """Register a new user with email and password.

    Returns the created user profile and a JWT access token.
    """
    existing = get_user_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user_id = str(uuid.uuid4())
    hashed = hash_password(request.password)
    user = add_user(user_id=user_id, email=request.email, hashed_password=hashed)

    token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    logger.info(f"New user registered: {request.email}")

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user["id"], email=user["email"], created_at=user["created_at"]),
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest) -> AuthResponse:
    """Authenticate a user and return a JWT access token."""
    user = get_user_by_email(request.email)
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    logger.info(f"User logged in: {request.email}")

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user["id"], email=user["email"], created_at=user["created_at"]),
    )
