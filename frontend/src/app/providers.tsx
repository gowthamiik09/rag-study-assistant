"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AuthProvider>
  );
}
