"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { documentAPI } from "@/lib/api";
import { Document } from "@/types";

interface Props {
  onUploadSuccess: (doc: Document) => void;
}

type State = "idle" | "uploading" | "success" | "error";

export default function DropZone({ onUploadSuccess }: Props) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      setState("uploading");
      setProgress(0);
      setError("");

      try {
        const doc = await documentAPI.upload(file, setProgress);
        setState("success");
        setTimeout(() => {
          setState("idle");
          onUploadSuccess(doc);
        }, 1800);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr?.response?.data?.detail || "Upload failed.");
        setState("error");
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: state === "uploading",
  });

  return (
    <div className="px-3 py-2">
      <motion.div
        {...getRootProps()}
        whileHover={state !== "uploading" ? { scale: 1.01 } : {}}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer
          transition-all duration-200 select-none
          ${
            isDragActive
              ? "border-brand-400 bg-brand-500/10"
              : state === "uploading"
              ? "border-brand-500/40 bg-brand-500/5 cursor-wait"
              : state === "success"
              ? "border-green-500/50 bg-green-500/5"
              : state === "error"
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5"
          }`}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Upload className="w-4.5 h-4.5 text-brand-400" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#9a9cad]">
                  {isDragActive ? "Drop it here" : "Upload a PDF"}
                </p>
                <p className="text-[10px] text-[#5c5e6e] mt-0.5">
                  Drag & drop or click · Max 50 MB
                </p>
              </div>
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-[11px] text-[#9a9cad] font-mono">
                Processing… {progress}%
              </p>
              <div className="w-full bg-white/10 rounded-full h-1">
                <motion.div
                  className="bg-brand-500 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.2 }}
                />
              </div>
              <p className="text-[10px] text-[#5c5e6e]">
                Extracting text & generating embeddings…
              </p>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <CheckCircle className="w-7 h-7 text-green-400" />
              <p className="text-[12px] text-green-400 font-medium">
                Document ready!
              </p>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-[11px] text-red-400 text-center max-w-[180px]">
                {error}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setState("idle");
                }}
                className="text-[10px] text-[#9a9cad] underline"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
