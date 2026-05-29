import logging
from typing import List

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generates dense vector embeddings using Sentence Transformers."""

    def __init__(self):
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        self.model = SentenceTransformer(settings.embedding_model)
        self.dimension = self.model.get_embedding_dimension()
        logger.info(f"Embedding model loaded. Dimension: {self.dimension}")

    def embed_text(self, text: str) -> List[float]:
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        logger.info(f"Embedding batch of {len(texts)} texts...")
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            convert_to_numpy=True,
            show_progress_bar=True,
        )
        return embeddings.tolist()


embedding_service = EmbeddingService()
