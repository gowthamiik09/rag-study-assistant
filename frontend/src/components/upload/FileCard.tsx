"use client";

import { motion } from "framer-motion";
import { FileText, Layers, Trash2 } from "lucide-react";
import { Document } from "@/types";

interface Props {
  doc: Document;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileCard({
  doc,
  isSelected,
  onSelect,
  onDelete,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      onClick={() => onSelect(doc.id)}
      className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer
        border transition-all duration-150 mb-1
        ${
          isSelected
            ? "border-brand-500/40 bg-brand-500/10"
            : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
        }`}
    >
      {/* Icon */}
      <div
        className={`w-7 h-7 min-w-[28px] rounded-lg flex items-center justify-center ${
          isSelected ? "bg-brand-500/20" : "bg-white/[0.06]"
        }`}
        aria-hidden="true"
      >
        <FileText
          className={`w-3.5 h-3.5 ${
            isSelected ? "text-brand-400" : "text-[#9a9cad]"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] text-[#e8e9f0] truncate leading-tight">
          {doc.filename}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9.5px] text-[#5c5e6e] font-mono">
            {doc.page_count}p
          </span>
          <Layers className="w-2.5 h-2.5 text-[#5c5e6e]" aria-hidden="true" />
          <span className="text-[9.5px] text-[#5c5e6e] font-mono">
            {doc.chunk_count} chunks
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(doc.id);
        }}
        aria-label={`Delete document ${doc.filename}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6
                   rounded flex items-center justify-center
                   hover:bg-red-500/10 text-[#5c5e6e] hover:text-red-400"
      >
        <Trash2 className="w-3 h-3" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
