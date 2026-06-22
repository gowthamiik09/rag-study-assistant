"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const SUGGESTED = [
  "Summarize the main topics",
  "What are the key concepts?",
  "Create 5 study questions",
  "Explain in simple terms",
];

export default function ChatInput({ onSend, isLoading, disabled }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  };

  return (
    <div className="px-3 md:px-4 pb-4 md:pb-5 pt-3 border-t border-white/[0.07] bg-[#111318]">
      {/* Suggestion pills — only shown when no input */}
      {!input && !isLoading && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              disabled={disabled}
              onClick={() => {
                setInput(s);
                textareaRef.current?.focus();
              }}
              aria-label={`Suggest: ${s}`}
              className="text-[11px] px-3 py-1.5 rounded-full border border-white/10
                         text-[#9a9cad] hover:border-brand-500/50 hover:text-brand-300
                         transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <div className="flex items-end gap-2 bg-[#1e2028] rounded-xl border border-white/[0.1] px-3 py-2.5 focus-within:border-brand-500/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onInput={autoResize}
          disabled={disabled || isLoading}
          aria-label="Type your question"
          placeholder={
            disabled
              ? "Upload a document to start chatting…"
              : "Ask about your documents… (Enter to send)"
          }
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-[13.5px]
                     text-[#e8e9f0] placeholder-[#5c5e6e] leading-relaxed
                     disabled:cursor-not-allowed min-h-[36px] max-h-[140px] py-1"
          style={{ fontFamily: "var(--font-sora)" }}
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          aria-label="Send message"
          className="w-8 h-8 min-w-[32px] rounded-lg bg-brand-500 flex items-center
                     justify-content-center justify-center hover:bg-brand-400
                     disabled:opacity-35 disabled:cursor-not-allowed
                     transition-colors self-end"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          )}
        </motion.button>
      </div>

      <p className="text-center text-[9.5px] text-[#5c5e6e] mt-2 font-mono" aria-hidden="true">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
