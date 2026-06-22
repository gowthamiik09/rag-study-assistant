"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type Tab = "login" | "register";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (activeTab === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.push("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosErr?.response?.data?.detail ||
          (activeTab === "login"
            ? "Invalid email or password."
            : "Registration failed. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle, #7c6dfa 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #7c6dfa, #4f46e5)",
            }}
          >
            <Brain className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Study Assistant
          </h1>
          <p className="text-[12px] text-[#5c5e6e] font-mono mt-1">
            RAG · Powered
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111318] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.07] relative">
            {(["login", "register"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                aria-label={tab === "login" ? "Switch to login tab" : "Switch to register tab"}
                className={`flex-1 py-3.5 text-[13px] font-medium transition-colors relative z-10 ${
                  activeTab === tab ? "text-white" : "text-[#5c5e6e] hover:text-[#9a9cad]"
                }`}
              >
                {tab === "login" ? "Login" : "Register"}
              </button>
            ))}
            {/* Active tab indicator */}
            <motion.div
              className="absolute bottom-0 h-0.5 bg-brand-500"
              layoutId="tab-indicator"
              style={{ width: "50%" }}
              animate={{ x: activeTab === "login" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "login" ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="p-6 flex flex-col gap-4"
            >
              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-[12px] text-red-300"
                      role="alert"
                    >
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="text-[11px] text-[#9a9cad] font-mono uppercase tracking-wider mb-1.5 block"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5e6e]"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-[#0a0b0f] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5
                               text-[13px] text-[#e8e9f0] placeholder-[#5c5e6e]
                               focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="text-[11px] text-[#9a9cad] font-mono uppercase tracking-wider mb-1.5 block"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5e6e]"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                    placeholder="••••••••"
                    autoComplete={
                      activeTab === "login" ? "current-password" : "new-password"
                    }
                    className="w-full bg-[#0a0b0f] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5
                               text-[13px] text-[#e8e9f0] placeholder-[#5c5e6e]
                               focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c5e6e] hover:text-[#9a9cad] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password (register only) */}
              <AnimatePresence>
                {activeTab === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="text-[11px] text-[#9a9cad] font-mono uppercase tracking-wider mb-1.5 block"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5e6e]"
                        aria-hidden="true"
                      />
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-label="Confirm password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full bg-[#0a0b0f] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5
                                   text-[13px] text-[#e8e9f0] placeholder-[#5c5e6e]
                                   focus:outline-none focus:border-brand-500/50 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                aria-label={activeTab === "login" ? "Log in" : "Create account"}
                className="w-full py-2.5 rounded-xl text-[13px] font-medium text-white
                           bg-gradient-to-r from-brand-500 to-brand-600
                           hover:from-brand-400 hover:to-brand-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all mt-1 flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                )}
                {activeTab === "login" ? "Log In" : "Create Account"}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] text-[#5c5e6e] font-mono mt-4">
          {activeTab === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() =>
              switchTab(activeTab === "login" ? "register" : "login")
            }
            aria-label={activeTab === "login" ? "Switch to register" : "Switch to login"}
            className="text-brand-400 hover:text-brand-300 transition-colors underline"
          >
            {activeTab === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
