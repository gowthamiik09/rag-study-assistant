import axios from "axios";
import {
  AuthResponse,
  ChatRequest,
  ChatResponse,
  Document,
  DocumentListResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 600_000, // 10 min for CPU-only local LLMs
});

// ── Request interceptor: attach auth token ───────────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: redirect on 401 ────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    } as LoginRequest);
    return data;
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
    } as RegisterRequest);
    return data;
  },
};

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

export { BASE_URL };
export default api;
