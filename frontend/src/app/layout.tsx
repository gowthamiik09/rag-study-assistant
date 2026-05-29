import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Study Assistant",
  description: "AI-powered document Q&A with semantic retrieval",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
