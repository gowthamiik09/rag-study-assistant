"""Application configuration loaded from environment variables.

Uses pydantic-settings to read values from ``.env`` and environment.
All settings have sensible defaults for local development.
"""

from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the RAG Study Assistant backend."""

    # LLM Provider: "groq" for cloud, "ollama" for local
    llm_provider: str = "groq"

    # Groq (cloud LLM)
    groq_api_key: Optional[str] = None
    groq_model: str = "mixtral-8x7b-32768"

    # Ollama (local LLM — fallback)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"

    # Embeddings & Vector Store
    embedding_model: str = "all-MiniLM-L6-v2"
    chroma_persist_dir: str = "./chroma_db"
    upload_dir: str = "./uploads"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    max_retrieval_docs: int = 5

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # JWT Authentication
    jwt_secret_key: str = "dev-secret-key-change-in-production"

    # Database
    database_url: str = "./study_assistant.db"

    class Config:
        env_file = ".env"


settings = Settings()
