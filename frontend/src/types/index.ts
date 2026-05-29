export interface Document {
  id: string;
  filename: string;
  page_count: number;
  chunk_count: number;
  uploaded_at: string;
  status: "ready" | "processing" | "error";
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface SourceChunk {
  content: string;
  source: string;
  page: number | null;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  timestamp: string;
  processing_time_ms?: number;
}

export interface ChatRequest {
  question: string;
  document_ids?: string[];
  chat_history: { role: string; content: string; timestamp?: string }[];
}

export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
  model_used: string;
  processing_time_ms: number;
}
