from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"
    embedding_model: str = "all-MiniLM-L6-v2"
    chroma_persist_dir: str = "./chroma_db"
    upload_dir: str = "./uploads"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    max_retrieval_docs: int = 5
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
