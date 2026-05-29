"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronLeft, ChevronRight } from "lucide-react";
import DropZone from "@/components/upload/DropZone";
import FileCard from "@/components/upload/FileCard";
import { Document } from "@/types";

interface Props {
  documents: Document[];
  selectedIds: string[];
  onUpload: (doc: Document) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  documents,
  selectedIds,
  onUpload,
  onSelect,
  onDelete,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 52 : 268 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="flex-shrink-0 bg-[#111318] border-r border-white/[0.07] flex flex-col relative overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[22px] z-20 w-6 h-6 rounded-full
                   bg-[#1e2028] border border-white/[0.12] flex items-center
                   justify-center hover:bg-[#2a2d38] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-[#9a9cad]" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-[#9a9cad]" />
        )}
      </button>

      {/* Logo row */}
      <div className="flex items-center gap-2.5 px-3.5 py-4 border-b border-white/[0.07]">
        <div
          className="w-8 h-8 min-w-[32px] rounded-[10px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c6dfa,#4f46e5)" }}
        >
          <Brain className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-[13px] font-semibold text-white leading-tight">
                Study Assistant
              </p>
              <p className="text-[9.5px] text-[#5c5e6e] font-mono mt-0.5">
                RAG · Powered
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <DropZone onUploadSuccess={onUpload} />

            {/* Doc list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {documents.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-1.5 mb-2">
                    <span className="text-[9px] uppercase tracking-widest text-[#5c5e6e] font-mono font-medium">
                      Documents ({documents.length})
                    </span>
                    {selectedIds.length > 0 &&
                      selectedIds.length < documents.length && (
                        <span className="text-[9px] text-brand-400 font-mono">
                          {selectedIds.length} selected
                        </span>
                      )}
                  </div>
                  <AnimatePresence>
                    {documents.map((doc) => (
                      <FileCard
                        key={doc.id}
                        doc={doc}
                        isSelected={selectedIds.includes(doc.id)}
                        onSelect={onSelect}
                        onDelete={onDelete}
                      />
                    ))}
                  </AnimatePresence>
                </>
              )}

              {documents.length === 0 && (
                <p className="text-[11px] text-[#5c5e6e] text-center px-4 mt-4 leading-relaxed">
                  No documents yet.
                  <br />
                  Upload a PDF above.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.07]">
              <div className="flex items-center gap-2 bg-[#1e2028] rounded-lg px-3 py-2 border border-white/[0.07]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
                <span className="text-[10px] text-[#9a9cad] font-mono">
                  ollama · mistral · live
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
