"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronLeft, ChevronRight, X } from "lucide-react";
import DropZone from "@/components/upload/DropZone";
import FileCard from "@/components/upload/FileCard";
import { Document } from "@/types";

interface Props {
  documents: Document[];
  selectedIds: string[];
  onUpload: (doc: Document) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  documents,
  selectedIds,
  onUpload,
  onSelect,
  onDelete,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile: render as an overlay drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 z-40"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#111318] border-r border-white/[0.07] flex flex-col z-50"
              role="dialog"
              aria-label="Sidebar navigation"
            >
              {/* Close button */}
              <button
                onClick={onMobileClose}
                aria-label="Close sidebar"
                className="absolute right-2 top-3 z-20 w-8 h-8 rounded-lg
                           flex items-center justify-center
                           hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4 text-[#9a9cad]" aria-hidden="true" />
              </button>

              {/* Logo row */}
              <div className="flex items-center gap-2.5 px-3.5 py-4 border-b border-white/[0.07]">
                <div
                  className="w-8 h-8 min-w-[32px] rounded-[10px] flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c6dfa,#4f46e5)" }}
                >
                  <Brain className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white leading-tight">
                    Study Assistant
                  </p>
                  <p className="text-[9.5px] text-[#5c5e6e] font-mono mt-0.5">
                    RAG · Powered
                  </p>
                </div>
              </div>

              <DropZone onUploadSuccess={onUpload} />

              {/* Doc list */}
              <div className="flex-1 overflow-y-auto px-2 pb-4" role="list" aria-label="Document list">
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
                      {documents.map((doc, index) => (
                        <div
                          key={doc.id}
                          role="listitem"
                          tabIndex={0}
                          aria-label={`Document: ${doc.filename}${selectedIds.includes(doc.id) ? ", selected" : ""}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelect(doc.id);
                            }
                            if (e.key === "Delete" || e.key === "Backspace") {
                              e.preventDefault();
                              onDelete(doc.id);
                            }
                            // Arrow key navigation
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              const next = e.currentTarget.nextElementSibling as HTMLElement;
                              next?.focus();
                            }
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              const prev = e.currentTarget.previousElementSibling as HTMLElement;
                              prev?.focus();
                            }
                          }}
                        >
                          <FileCard
                            doc={doc}
                            isSelected={selectedIds.includes(doc.id)}
                            onSelect={onSelect}
                            onDelete={onDelete}
                          />
                        </div>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" aria-hidden="true" />
                  <span className="text-[10px] text-[#9a9cad] font-mono">
                    ollama · mistral · live
                  </span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: original collapsible sidebar
  return (
    <motion.aside
      animate={{ width: collapsed ? 52 : 268 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="hidden md:flex flex-shrink-0 bg-[#111318] border-r border-white/[0.07] flex-col relative overflow-hidden"
      aria-label="Sidebar navigation"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-[22px] z-20 w-6 h-6 rounded-full
                   bg-[#1e2028] border border-white/[0.12] flex items-center
                   justify-center hover:bg-[#2a2d38] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-[#9a9cad]" aria-hidden="true" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-[#9a9cad]" aria-hidden="true" />
        )}
      </button>

      {/* Logo row */}
      <div className="flex items-center gap-2.5 px-3.5 py-4 border-b border-white/[0.07]">
        <div
          className="w-8 h-8 min-w-[32px] rounded-[10px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c6dfa,#4f46e5)" }}
        >
          <Brain className="w-4 h-4 text-white" aria-hidden="true" />
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
            <div className="flex-1 overflow-y-auto px-2 pb-4" role="list" aria-label="Document list">
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
                    {documents.map((doc, index) => (
                      <div
                        key={doc.id}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`Document: ${doc.filename}${selectedIds.includes(doc.id) ? ", selected" : ""}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(doc.id);
                          }
                          if (e.key === "Delete" || e.key === "Backspace") {
                            e.preventDefault();
                            onDelete(doc.id);
                          }
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            const next = e.currentTarget.nextElementSibling as HTMLElement;
                            next?.focus();
                          }
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            const prev = e.currentTarget.previousElementSibling as HTMLElement;
                            prev?.focus();
                          }
                        }}
                      >
                        <FileCard
                          doc={doc}
                          isSelected={selectedIds.includes(doc.id)}
                          onSelect={onSelect}
                          onDelete={onDelete}
                        />
                      </div>
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
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" aria-hidden="true" />
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
