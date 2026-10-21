"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { loginWithCredentials, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await loginWithCredentials(email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password. Please verify your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101827] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#3B6FD8]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#36C9C0]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 mb-8 text-center">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B6FD8] to-[#36C9C0] flex items-center justify-center shadow-[0_0_20px_rgba(54,201,192,0.4)]">
            <svg 
              className="w-6 h-6 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h3" />
              <path d="M18 12h3" />
              <path d="M4.93 4.93l2.12 2.12" />
              <path d="M16.95 16.95l2.12 2.12" />
              <path d="M4.93 19.07l2.12-2.12" />
              <path d="M16.95 7.05l2.12-2.12" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">RESONANCE</span>
        </Link>
        <p className="mt-2 text-sm text-[#CBD5E1]">
          Scientific Intelligence & Reproducibility Platform
        </p>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#172235] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#3B6FD8]/20 border border-[#3B6FD8]/40 flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#36C9C0]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sign In</h1>
            <p className="text-xs text-[#CBD5E1]/80">Access your research documents and comparisons</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CBD5E1] mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@resonance-intel.org"
                required
                className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#CBD5E1]">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-[#36C9C0] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] active:bg-[#254ea3] shadow-[0_0_20px_rgba(59,111,216,0.35)] flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#3B6FD8] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-[#CBD5E1]">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/register" className="text-[#36C9C0] font-semibold hover:underline">
            Create an account →
          </Link>
        </div>
      </div>
    </div>
  );
}
