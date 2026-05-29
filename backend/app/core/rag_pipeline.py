import logging
import time
from typing import List, Optional

import ollama

from app.config import settings
from app.core.vector_store import vector_store
from app.models.schemas import ChatMessage, ChatResponse, SourceChunk

logger = logging.getLogger(__name__)


class RAGPipeline:
    """Orchestrates retrieval + LLM generation."""

    def __init__(self):
        self.model = settings.ollama_model
        self.client = ollama.Client(host=settings.ollama_base_url, timeout=300)

    # ── Prompts ───────────────────────────────────────────────────────────────

    def _system_prompt(self) -> str:
        return (
            "You are an intelligent study assistant powered by RAG.\n\n"
            "RULES:\n"
            "- Answer ONLY based on the provided document context.\n"
            "- If context is insufficient, say so honestly.\n"
            "- Be clear, concise, and educational.\n"
            "- Mention the source document when referencing specific info.\n"
            "- Use bullet points and structure when it aids clarity.\n"
            "- For summaries, be comprehensive based on context."
        )

    def _user_prompt(
        self,
        question: str,
        chunks: List[dict],
        history: List[ChatMessage],
    ) -> str:
        context = "\n\n".join(
            f"--- Source {i+1}: {c['metadata'].get('filename','?')} "
            f"(Page {c['metadata'].get('page','?')}) ---\n{c['content']}"
            for i, c in enumerate(chunks)
        )

        history_text = ""
        if history:
            for msg in history[-8:]:
                label = "Student" if msg.role == "user" else "Assistant"
                history_text += f"\n{label}: {msg.content}"

        parts = [f"CONTEXT FROM DOCUMENTS:\n{context}"]
        if history_text:
            parts.append(f"CONVERSATION HISTORY:{history_text}")
        parts.append(f"STUDENT QUESTION: {question}")
        parts.append(
            "Answer the student's question based on the context above."
        )
        return "\n\n".join(parts)

    # ── Main query ────────────────────────────────────────────────────────────

    def query(
        self,
        question: str,
        document_ids: Optional[List[str]] = None,
        chat_history: Optional[List[ChatMessage]] = None,
    ) -> ChatResponse:
        start = time.time()
        history = chat_history or []

        # 1. Retrieve
        chunks = vector_store.search(
            query=question,
            n_results=3,
            document_ids=document_ids,
        )

        if not chunks:
            return ChatResponse(
                answer=(
                    "I couldn't find relevant information in your documents "
                    "to answer that question. Make sure you've uploaded "
                    "documents related to your topic."
                ),
                sources=[],
                model_used=self.model,
                processing_time_ms=int((time.time() - start) * 1000),
            )

        # 2. Generate
        try:
            response = self.client.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._system_prompt()},
                    {
                        "role": "user",
                        "content": self._user_prompt(question, chunks, history),
                    },
                ],
                options={"temperature": 0.3, "num_predict": 512},
            )
            answer = response["message"]["content"]
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            raise RuntimeError(
                f"Failed to generate response. Is Ollama running? Error: {e}"
            )

        # 3. Format sources
        sources = [
            SourceChunk(
                content=c["content"][:300] + "…",
                source=c["metadata"].get("filename", "Unknown"),
                page=c["metadata"].get("page"),
                relevance_score=c["relevance_score"],
            )
            for c in chunks
        ]

        ms = int((time.time() - start) * 1000)
        logger.info(f"RAG query completed in {ms}ms")
        return ChatResponse(
            answer=answer,
            sources=sources,
            model_used=self.model,
            processing_time_ms=ms,
        )


rag_pipeline = RAGPipeline()
