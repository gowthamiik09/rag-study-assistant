"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Trash2, LogOut } from "lucide-react";
import ChatInput from "@/components/chat/ChatInput";
import ChatWindow from "@/components/chat/ChatWindow";
import Sidebar from "@/components/ui/Sidebar";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check auth: if not authenticated and no token in localStorage, redirect to /login
    const token = localStorage.getItem("auth_token");
    if (!isAuthenticated && !token) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, [isAuthenticated, router]);

  const { documents, selectedIds, addDocument, removeDocument, toggleSelect } =
    useDocuments();

  const { messages, isLoading, sendMessage, sendMessageStream, clearHistory } =
    useChat(selectedIds);

  const totalChunks = documents.reduce((s, d) => s + d.chunk_count, 0);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0b0f]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0b0f] overflow-hidden">
      <Sidebar
        documents={documents}
        selectedIds={selectedIds}
        onUpload={addDocument}
        onSelect={toggleSelect}
        onDelete={removeDocument}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-3 md:px-5 py-3 border-b border-white/[0.07] bg-[#111318]">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar menu"
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center
                         hover:bg-white/[0.06] transition-colors"
            >
              <Menu className="w-5 h-5 text-[#9a9cad]" aria-hidden="true" />
            </button>

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
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1
                               bg-brand-500/15 border border-brand-500/30 text-brand-300 rounded-full">
                🎯 {selectedIds.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                aria-label="Clear chat history"
                className="flex items-center gap-1.5 text-[11px] text-[#5c5e6e]
                           hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Clear chat</span>
              </button>
            )}

            <button
              onClick={logout}
              aria-label="Log out"
              className="flex items-center gap-1.5 text-[11px] text-[#5c5e6e]
                         hover:text-red-400 transition-colors ml-2"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} />

        <ChatInput
          onSend={sendMessageStream}
          isLoading={isLoading}
          disabled={documents.length === 0}
        />
      </div>
    </div>
  );
}
