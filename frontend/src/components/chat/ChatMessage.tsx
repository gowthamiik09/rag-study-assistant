"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { BookOpen, ChevronDown, ChevronUp, Clock, Zap } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-3 px-4 py-1`}
      role="article"
      aria-label={`${isUser ? "You" : "Assistant"} said: ${message.content.substring(0, 80)}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-[9px] flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
          isUser
            ? "bg-[#2d2b52] border border-[rgba(124,109,250,0.25)] text-[#a292ff]"
            : "text-white"
        }`}
        style={!isUser ? { background: "linear-gradient(135deg,#7c6dfa,#4f46e5)" } : {}}
        aria-hidden="true"
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Name / time */}
        <div className="flex items-center gap-2">
          {!isUser && (
            <span className="text-[10px] text-[#5c5e6e] font-mono">
              Study Assistant
            </span>
          )}
          <span className="flex items-center gap-1 text-[9.5px] text-[#5c5e6e] font-mono">
            <Clock className="w-2.5 h-2.5" aria-hidden="true" />
            <time>{time}</time>
          </span>
          {!isUser && message.processing_time_ms && (
            <span className="flex items-center gap-0.5 text-[9.5px] text-[#5c5e6e] font-mono">
              <Zap className="w-2.5 h-2.5" aria-hidden="true" />
              {message.processing_time_ms}ms
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-xl px-4 py-3 text-[13.5px] leading-relaxed ${
            isUser
              ? "bg-[#2d2b52] border border-[rgba(124,109,250,0.25)] text-[#e8e9f0] rounded-tr-sm"
              : "bg-[#151720] border border-white/[0.08] text-[#e8e9f0] rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowSources(!showSources)}
              aria-label={showSources ? "Hide sources" : `Show ${message.sources.length} sources`}
              aria-expanded={showSources}
              className="flex items-center gap-1.5 text-[10.5px] text-[#5c5e6e] hover:text-[#9a9cad] transition-colors font-mono py-0.5"
            >
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              {message.sources.length} source{message.sources.length > 1 ? "s" : ""} used
              {showSources ? (
                <ChevronUp className="w-3 h-3" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              )}
            </button>

            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1.5 mt-1.5 overflow-hidden"
                  role="list"
                  aria-label="Source citations"
                >
                  {message.sources.map((src, i) => (
                    <div
                      key={i}
                      role="listitem"
                      className="bg-[#1e2028] border border-white/[0.07] rounded-lg p-2.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-brand-300 font-mono truncate max-w-[180px]">
                          📄 {src.source}
                          {src.page ? ` · p.${src.page}` : ""}
                        </span>
                        <span className="bg-brand-500/20 text-brand-300 text-[10px] font-mono px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                          {Math.round(src.relevance_score * 100)}%
                        </span>
                      </div>
                      <p className="text-[#9a9cad] leading-relaxed line-clamp-3">
                        {src.content}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
