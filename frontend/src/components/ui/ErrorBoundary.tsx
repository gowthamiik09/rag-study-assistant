"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#111318] border border-white/[0.07] rounded-2xl p-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <AlertTriangle
                className="w-7 h-7 text-red-400"
                aria-hidden="true"
              />
            </div>

            <h2 className="text-lg font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#9a9cad] mb-5 leading-relaxed">
              An unexpected error occurred. Please try again or refresh the
              page.
            </p>

            {this.state.error && (
              <div className="bg-[#0a0b0f] border border-white/[0.07] rounded-lg p-3 mb-5 text-left overflow-auto max-h-32">
                <code className="text-[11px] font-mono text-red-300 break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              aria-label="Try again"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                         bg-brand-500 text-white text-sm font-medium
                         hover:bg-brand-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
