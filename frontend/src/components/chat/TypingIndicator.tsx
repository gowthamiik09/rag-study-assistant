"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-1 animate-fade-up"
      role="status"
      aria-label="Assistant is typing"
    >
      {/* AI avatar */}
      <div
        className="w-7 h-7 rounded-[9px] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #7c6dfa, #4f46e5)" }}
        aria-hidden="true"
      >
        AI
      </div>

      {/* Bubble */}
      <div className="bg-[#151720] border border-white/[0.08] rounded-xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-[#5c5e6e] rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <span className="sr-only">Assistant is typing a response...</span>
    </div>
  );
}
