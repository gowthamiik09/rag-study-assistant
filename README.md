# 🧠 RAG Study Assistant

> A production-style AI application that lets you upload documents and have intelligent conversations about them — powered by a full Retrieval-Augmented Generation (RAG) pipeline.

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6B35?style=flat)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 Document Upload | Drag-and-drop PDF upload with progress tracking |
| 🔍 Semantic Search | Vector embeddings + cosine similarity via ChromaDB |
| 💬 Contextual Chat | Multi-turn conversation with full history |
| 📚 Source Citations | Every answer shows exact source chunks + page numbers |
| 🎯 Document Scoping | Focus questions on specific uploaded documents |
| 🌙 Dark UI | Premium dark-mode interface with smooth animations |
| ⚡ Local LLM | Fully offline via Ollama (no OpenAI API key required) |
| 🐳 Docker Ready | One-command deployment with Docker Compose |

---

## 🏗️ Architecture

```
PDF Upload
   │
   ▼
PyPDF Extraction ──► Text Chunking (1000 chars, 200 overlap)
                          │
                          ▼
              Sentence Transformers (all-MiniLM-L6-v2)
                          │
                          ▼
                    ChromaDB (cosine similarity)
                          │
               ┌──────────┘
               │
User Question ─►  Embed Query ──► Top-K Retrieval
                                        │
                          ┌─────────────┘
                          │
                  Context + Question ──► Ollama (Mistral)
                                              │
                                              ▼
                                     Answer + Source Citations
```

---

## 🚀 Quick Start

### Prerequisites

- [Python 3.11+](https://python.org)
- [Node.js 20+](https://nodejs.org)
- [Ollama](https://ollama.ai) — local LLM runner

### 1. Clone & install Ollama

```bash
git clone https://github.com/gowthamiik09/rag-study-assistant.git
cd rag-study-assistant

# Install and start Ollama, then pull the model
ollama serve          # in one terminal
ollama pull mistral   # in another terminal
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🐳 Docker (One Command)

Make sure Ollama is running on your host machine first, then:

```bash
# From project root
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API Docs → http://localhost:8000/docs

---

## 📁 Project Structure

```
rag-study-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Settings (env vars)
│   │   ├── api/routes/
│   │   │   ├── documents.py     # Upload / list / delete
│   │   │   └── chat.py          # Chat / query endpoint
│   │   ├── core/
│   │   │   ├── pdf_processor.py # Extract + chunk PDFs
│   │   │   ├── embeddings.py    # Sentence Transformers
│   │   │   ├── vector_store.py  # ChromaDB interface
│   │   │   └── rag_pipeline.py  # Orchestrator
│   │   └── models/schemas.py    # Pydantic types
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main chat page
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── chat/            # ChatWindow, Message, Input, Typing
│   │   │   ├── upload/          # DropZone, FileCard
│   │   │   └── ui/              # Sidebar
│   │   ├── hooks/
│   │   │   ├── useChat.ts       # Chat state management
│   │   │   └── useDocuments.ts  # Document state management
│   │   ├── lib/api.ts           # Axios API client
│   │   └── types/index.ts       # TypeScript types
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload & process a PDF |
| `GET` | `/api/v1/documents` | List all documents |
| `DELETE` | `/api/v1/documents/{id}` | Delete a document |
| `POST` | `/api/v1/chat` | Ask a question |
| `GET` | `/health` | Health check |

---

## ⚙️ Configuration

All settings live in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_MODEL` | `mistral` | LLM to use (mistral, phi, llama3) |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence Transformers model |
| `CHUNK_SIZE` | `1000` | Characters per document chunk |
| `CHUNK_OVERLAP` | `200` | Overlap between adjacent chunks |
| `MAX_RETRIEVAL_DOCS` | `5` | Top-K chunks retrieved per query |

---

## 🔮 Future Improvements

- [ ] Streaming LLM responses with Server-Sent Events
- [ ] User authentication (JWT + refresh tokens)
- [ ] SQLite/PostgreSQL for persistent document metadata
- [ ] OCR support for scanned PDFs (pytesseract)
- [ ] Multi-modal support (images in PDFs)
- [ ] Export chat as PDF
- [ ] Reranking layer (cross-encoder)
- [ ] Evaluation metrics (faithfulness, relevance)

---

## 💼 Resume Description

> **RAG Study Assistant** | Python · FastAPI · Next.js · ChromaDB · Ollama  
> Built a full-stack Retrieval-Augmented Generation (RAG) application with PDF ingestion (pypdf), recursive text chunking, vector embeddings via Sentence Transformers (`all-MiniLM-L6-v2`), and cosine similarity search using ChromaDB. Designed a FastAPI backend with async endpoints for document upload, management, and LLM-powered Q&A. Implemented a Next.js/TypeScript frontend with Framer Motion animations, drag-and-drop uploads, source citation display, and multi-turn chat history. Containerised with Docker Compose.

---

## 🎤 Interview Q&A

**"Walk me through the RAG pipeline."**  
Upload → PyPDF extracts text → RecursiveCharacterTextSplitter chunks it with overlap → Sentence Transformers embeds each chunk → ChromaDB stores vectors → At query time, the question is embedded and top-K nearest chunks are retrieved by cosine similarity → Chunks injected into the Ollama prompt as context → LLM generates a grounded answer.

**"Why use overlapping chunks?"**  
Overlap prevents losing semantic context at chunk boundaries. A sentence that spans two chunks remains coherent in at least one of them.

**"How would you scale this?"**  
Replace the in-memory document dict with PostgreSQL, swap local ChromaDB for Pinecone or Weaviate, add a Celery/Redis queue for async PDF processing, and stream responses using SSE.

**"What are the limitations?"**  
Scanned PDFs need OCR. The context window limits how many chunks can be injected. Chunking by character count can split mid-sentence (mitigated by using paragraph/sentence separators). BM25 keyword search is available as a fallback for sparse retrieval.

---

## 📄 License

MIT © 2024
