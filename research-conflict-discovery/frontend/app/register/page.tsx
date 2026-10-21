"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { registerWithCredentials, isAuthenticated } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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
    setErrorMessage(null);

    // Frontend validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address (e.g., user@domain.com).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    setLoading(true);

    try {
      await registerWithCredentials(email.trim(), password, fullName.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please check your information.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101827] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#36C9C0]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#3B6FD8]/15 rounded-full blur-[100px] pointer-events-none" />

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

      {/* Main Register Card */}
      <div className="relative z-10 w-full max-w-md bg-[#172235] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#36C9C0]/20 border border-[#36C9C0]/40 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-[#36C9C0]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create Account</h1>
            <p className="text-xs text-[#CBD5E1]/80">Create your private scientific research workspace</p>
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
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Eleanor Vance"
                required
                className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CBD5E1] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor.vance@lab.org"
                required
                className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CBD5E1] mb-1.5">
              Password (Min 6 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
              />
            </div>
          </div>


          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-[#101827] bg-[#36C9C0] hover:bg-[#2EB8AF] active:bg-[#259b94] shadow-[0_0_20px_rgba(54,201,192,0.4)] flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#36C9C0] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-[#101827]/30 border-t-[#101827] rounded-full animate-spin" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Create Account & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-[#CBD5E1]">
          <span>Already registered? </span>
          <Link href="/login" className="text-[#36C9C0] font-semibold hover:underline">
            Sign in to your account →
          </Link>
        </div>
      </div>
    </div>
  );
}
