"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101827] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#3B6FD8]/15 rounded-full blur-[120px] pointer-events-none" />

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

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-[#172235] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#3B6FD8]/20 border border-[#3B6FD8]/40 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-[#36C9C0]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Password Recovery</h1>
            <p className="text-xs text-[#CBD5E1]/80">Reset access to your researcher account</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[#36C9C0]/10 border border-[#36C9C0]/30 flex items-start space-x-3 text-sm text-[#CBD5E1]">
              <CheckCircle2 className="w-5 h-5 text-[#36C9C0] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white mb-1">Recovery Instructions Sent</p>
                <p className="text-xs text-[#CBD5E1]/90">
                  If an account exists for <strong className="text-white">{email}</strong>, a password reset link and verification instructions have been dispatched.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] flex items-center justify-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@resonance-intel.org"
                  required
                  className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] active:bg-[#254ea3] shadow-[0_0_20px_rgba(59,111,216,0.35)] flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#3B6FD8] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs text-[#CBD5E1] hover:text-[#36C9C0] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
