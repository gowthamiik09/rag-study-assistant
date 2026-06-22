"""Embedding service using Sentence Transformers.

Provides single-text and batch embedding generation using a locally loaded
transformer model (default: all-MiniLM-L6-v2).
"""

import logging
from typing import List

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generates dense vector embeddings using Sentence Transformers."""

    def __init__(self) -> None:
        """Load the configured embedding model into memory."""
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        self.model = SentenceTransformer(settings.embedding_model)
        self.dimension = self.model.get_embedding_dimension()
        logger.info(f"Embedding model loaded. Dimension: {self.dimension}")

    def embed_text(self, text: str) -> List[float]:
        """Generate an embedding vector for a single text string."""
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a batch of text strings."""
        logger.info(f"Embedding batch of {len(texts)} texts...")
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            convert_to_numpy=True,
            show_progress_bar=True,
        )
        return embeddings.tolist()


embedding_service = EmbeddingService()
