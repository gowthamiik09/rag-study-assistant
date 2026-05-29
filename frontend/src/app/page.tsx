"use client";

import { Trash2 } from "lucide-react";
import ChatInput from "@/components/chat/ChatInput";
import ChatWindow from "@/components/chat/ChatWindow";
import Sidebar from "@/components/ui/Sidebar";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";

export default function Home() {
  const { documents, selectedIds, addDocument, removeDocument, toggleSelect } =
    useDocuments();

  const { messages, isLoading, sendMessage, clearHistory } =
    useChat(selectedIds);

  const totalChunks = documents.reduce((s, d) => s + d.chunk_count, 0);

  return (
    <div className="flex h-screen bg-[#0a0b0f] overflow-hidden">
      <Sidebar
        documents={documents}
        selectedIds={selectedIds}
        onUpload={addDocument}
        onSelect={toggleSelect}
        onDelete={removeDocument}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] bg-[#111318]">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-[13px] font-semibold text-white">
                {selectedIds.length > 0 && selectedIds.length < documents.length
                  ? `Scoped to ${selectedIds.length} document${selectedIds.length > 1 ? "s" : ""}`
                  : "All Documents"}
              </h1>
              <p className="text-[11px] text-[#5c5e6e] font-mono mt-0.5">
                {documents.length === 0
                  ? "Upload a document to start"
                  : `${documents.length} doc${documents.length > 1 ? "s" : ""} · ${totalChunks} chunks indexed`}
              </p>
            </div>

            {selectedIds.length > 0 && selectedIds.length < documents.length && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1
                               bg-brand-500/15 border border-brand-500/30 text-brand-300 rounded-full">
                🎯 {selectedIds.length} selected
              </span>
            )}
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-[11px] text-[#5c5e6e]
                         hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear chat
            </button>
          )}
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} />

        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={documents.length === 0}
        />
      </div>
    </div>
  );
}
