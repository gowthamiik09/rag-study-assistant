# 🧠 RAG Study Assistant

> A production-style AI application that lets you upload documents and have intelligent conversations about them — powered by a full Retrieval-Augmented Generation (RAG) pipeline.

![FastAPI]
![Next.js]
![ChromaDB]
![Ollama]
![Groq]
![Python]
![TypeScript]

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

## ☁️ Cloud Deployment (Vercel + Render)

Deploy a live version using **Groq** (free cloud LLM) instead of Ollama.

### Prerequisites

- [Groq API Key](https://console.groq.com) — free, ~30 req/min
- [Render](https://render.com) account — free tier
- [Vercel](https://vercel.com) account — free tier

### 1. Deploy Backend (Render)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo: `gowthamiik09/rag-study-assistant`
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `LLM_PROVIDER` | `groq` |
   | `GROQ_API_KEY` | `your_groq_api_key` |
   | `GROQ_MODEL` | `mixtral-8x7b-32768` |
   | `PYTHON_VERSION` | `3.11.9` |
7. Deploy! Note your URL: `https://your-app.onrender.com`

### 2. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Connect your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add **Environment Variable**:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://your-app.onrender.com/api/v1` |
5. Deploy!

> **Note:** Render free tier sleeps after 15 min of inactivity. First request after idle takes ~30-60s.

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

> **RAG Study Assistant** | Python · FastAPI · Next.js · ChromaDB · Ollama · Groq
>
> • Built a full-stack RAG application using FastAPI and Next.js that allows users to upload PDFs and ask AI-powered questions with source citations and page numbers.
>
> • Implemented a semantic search pipeline using Sentence Transformers for vector embeddings and ChromaDB for cosine similarity retrieval, with recursive text chunking to preserve context across document boundaries.
>
> • Designed a dark-mode Next.js/TypeScript frontend with drag-and-drop uploads, multi-turn chat history, and Framer Motion animations; deployed via Docker Compose, Render, and Vercel.

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
