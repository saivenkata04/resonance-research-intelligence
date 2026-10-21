"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, User, UserPlus, Sparkles } from "lucide-react";
import { loginWithCredentials, registerWithCredentials } from "@/lib/auth";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  
  // Sign In fields
  const [signInEmail, setSignInEmail] = useState("researcher@resonance-intel.org");
  const [signInPassword, setSignInPassword] = useState("demo123");

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await loginWithCredentials(signInEmail, signInPassword);
      setLoading(false);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Authentication error:", err.message);
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await registerWithCredentials(signUpEmail, signUpPassword, fullName);
      setLoading(false);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Registration error:", err.message);
      setErrorMessage(err.message || "Registration failed. Please check your details.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#172235] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B6FD8] to-[#36C9C0] flex items-center justify-center shadow-lg">
            {mode === "signin" ? (
              <Lock className="w-5 h-5 text-white" />
            ) : (
              <UserPlus className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 id="modal-title" className="text-lg font-bold font-sans">
              {mode === "signin" ? "Sign In to RESONANCE" : "Create Researcher Account"}
            </h3>
            <p className="text-xs text-[#CBD5E1]">
              {mode === "signin"
                ? "Access your scientific conflict workspace"
                : "Join the reproducible research intelligence platform"}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#101827] p-1 rounded-xl border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-[#3B6FD8] text-white shadow-md"
                : "text-[#CBD5E1] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-[#36C9C0] text-[#101827] font-bold shadow-md"
                : "text-[#CBD5E1] hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#CBD5E1] tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="researcher@resonance-intel.org"
                  required
                  className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#CBD5E1] tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#CBD5E1]/70">Secure session credentials</span>
              <a
                href="/forgot-password"
                onClick={onClose}
                className="text-[#36C9C0] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] active:bg-[#254ea3] shadow-lg flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#3B6FD8]"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Session...</span>
                </span>
              ) : (
                <>
                  <span>Sign In & Open Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono uppercase text-[#CBD5E1] tracking-wider mb-1.5">
                Full Name & Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Alex Mercer"
                  required
                  className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#CBD5E1] tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="alex.mercer@institution.edu"
                  required
                  className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#CBD5E1] tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#CBD5E1]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-[#101827] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#36C9C0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-[#101827] bg-[#36C9C0] hover:bg-[#2EB8AF] active:bg-[#259b94] shadow-[0_0_20px_rgba(54,201,192,0.4)] flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#36C9C0]"
            >
              {loading ? (
                <span className="flex items-center space-x-2 text-[#101827]">
                  <span className="w-4 h-4 border-2 border-[#101827]/30 border-t-[#101827] rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </span>
              ) : (
                <>
                  <span>Create Account & Start Analyzing</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col items-center space-y-2">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
              }}
              className="text-xs text-[#CBD5E1] hover:text-white transition-colors"
            >
              New researcher? <span className="text-[#36C9C0] font-semibold hover:underline">Sign up for an account →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
              }}
              className="text-xs text-[#CBD5E1] hover:text-white transition-colors"
            >
              Already registered? <span className="text-[#36C9C0] font-semibold hover:underline">Sign in to your account →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
