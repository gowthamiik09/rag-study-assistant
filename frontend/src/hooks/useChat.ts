"use client";

import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { chatAPI } from "@/lib/api";
import { ChatMessage } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function useChat(selectedDocumentIds: string[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (question: string) => {
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: question,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await chatAPI.send({
          question,
          document_ids:
            selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
          chat_history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          timestamp: new Date().toISOString(),
          processing_time_ms: response.processing_time_ms,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        const detail =
          axiosErr?.response?.data?.detail ||
          "Failed to get a response. Is the backend running?";

        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: `⚠️ **Error:** ${detail}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedDocumentIds]
  );

  const sendMessageStream = useCallback(
    async (question: string) => {
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: question,
        timestamp: new Date().toISOString(),
      };

      const assistantId = uuidv4();

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}/chat/stream`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            question,
            document_ids:
              selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
            chat_history: messages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No readable stream");
        }

        // Add placeholder assistant message
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6);
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);

              if (parsed.token) {
                // Progressively append token
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + parsed.token }
                      : m
                  )
                );
              }

              if (parsed.done) {
                // Update sources and processing time
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          sources: parsed.sources || [],
                          processing_time_ms: parsed.processing_time_ms,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } catch {
        // Fall back to regular sendMessage on streaming error
        // Remove the last user message (sendMessage will re-add it)
        setMessages((prev) => {
          // Remove placeholder assistant msg if it was added
          const filtered = prev.filter((m) => m.id !== assistantId);
          // Remove the user message we added
          const withoutUser = filtered.filter((m) => m.id !== userMsg.id);
          return withoutUser;
        });
        setIsLoading(false);
        return sendMessage(question);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedDocumentIds, sendMessage]
  );

  const clearHistory = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, sendMessageStream, clearHistory };
}
