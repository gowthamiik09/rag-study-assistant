"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { ChatSkeleton } from "@/components/ui/Skeleton";
import { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  messages: ChatMessageType[];
  isLoading: boolean;
}

const FEATURES = [
  "📄 PDF / TXT / MD upload",
  "🔍 Semantic chunk retrieval",
  "💬 Multi-turn chat history",
  "📚 Source citations",
];

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Show skeleton briefly on first mount
    const timer = setTimeout(() => setInitialLoad(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (initialLoad && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        <ChatSkeleton />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto py-4 flex flex-col gap-1"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border border-brand-500/30"
            style={{ background: "rgba(124,109,250,0.1)" }}
            aria-hidden="true"
          >
            🧠
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Ask anything about your docs
            </h2>
            <p className="text-sm text-[#9a9cad] mt-2 max-w-sm leading-relaxed">
              Upload a PDF, TXT, or Markdown file. I&apos;ll index it and answer
              your questions with direct source citations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
            {FEATURES.map((f) => (
              <div
                key={f}
                className="bg-[#111318] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[11.5px] text-[#9a9cad] text-left"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
