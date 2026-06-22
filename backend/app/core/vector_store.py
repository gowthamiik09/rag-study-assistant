"""ChromaDB vector store for document chunk storage and similarity search.

Wraps the ChromaDB PersistentClient to provide add, search, delete, and
list operations over document embeddings.
"""

import logging
from typing import Any, Dict, List, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings
from app.core.embeddings import embedding_service

logger = logging.getLogger(__name__)


class VectorStore:
    """ChromaDB interface for storing and searching document embeddings."""

    def __init__(self) -> None:
        """Connect to the persistent ChromaDB instance and ensure the collection exists."""
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            f"ChromaDB ready. Documents in store: {self.collection.count()}"
        )

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Embed and store a list of text chunks. Returns the count stored."""
        if not chunks:
            return 0

        ids = [c["id"] for c in chunks]
        texts = [c["content"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        embeddings = embedding_service.embed_batch(texts)

        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        logger.info(f"Stored {len(chunks)} chunks in ChromaDB")
        return len(chunks)

    def search(
        self,
        query: str,
        n_results: int = 5,
        document_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """Return the top-n most similar chunks to the query string."""
        query_embedding = embedding_service.embed_text(query)
        where_filter = (
            {"document_id": {"$in": document_ids}} if document_ids else None
        )

        total = self.collection.count()
        if total == 0:
            return []

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, total),
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        formatted = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                distance = results["distances"][0][i]
                similarity = 1 - (distance / 2)
                formatted.append(
                    {
                        "content": doc,
                        "metadata": results["metadatas"][0][i],
                        "relevance_score": round(similarity, 4),
                    }
                )
        return formatted

    def delete_document(self, document_id: str) -> int:
        """Remove all chunks belonging to a document. Returns count deleted."""
        results = self.collection.get(where={"document_id": document_id})
        ids = results["ids"]
        if ids:
            self.collection.delete(ids=ids)
            logger.info(
                f"Deleted {len(ids)} chunks for document {document_id}"
            )
        return len(ids)

    def list_documents(self) -> List[Dict]:
        """Return a unique list of document IDs and filenames in the store."""
        results = self.collection.get(include=["metadatas"])
        seen: Dict[str, Dict] = {}
        for meta in results["metadatas"]:
            doc_id = meta.get("document_id")
            if doc_id and doc_id not in seen:
                seen[doc_id] = {
                    "document_id": doc_id,
                    "filename": meta.get("filename", "Unknown"),
                }
        return list(seen.values())


vector_store = VectorStore()
