import axios from "axios";
import { ChatRequest, ChatResponse, Document, DocumentListResponse } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 600_000, // 10 min for CPU-only local LLMs
});

// ── Documents ────────────────────────────────────────────────────────────────

export const documentAPI = {
  upload: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<Document> => {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post<Document>("/documents/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },

  list: async (): Promise<Document[]> => {
    const { data } = await api.get<DocumentListResponse>("/documents");
    return data.documents;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

// ── Chat ──────────────────────────────────────────────────────────────────────

export const chatAPI = {
  send: async (req: ChatRequest): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>("/chat", req);
    return data;
  },
};
