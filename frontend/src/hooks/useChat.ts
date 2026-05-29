"use client";

import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { chatAPI } from "@/lib/api";
import { ChatMessage } from "@/types";

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

  const clearHistory = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, clearHistory };
}
