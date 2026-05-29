"use client";

import { useCallback, useEffect, useState } from "react";
import { documentAPI } from "@/lib/api";
import { Document } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    documentAPI.list().then(setDocuments).catch(console.error);
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev]);
    setSelectedIds([doc.id]);
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    await documentAPI.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { documents, selectedIds, addDocument, removeDocument, toggleSelect };
}
