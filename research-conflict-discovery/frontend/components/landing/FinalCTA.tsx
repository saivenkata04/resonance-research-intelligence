"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

interface FinalCTAProps {
  onOpenSignInModal?: (mode?: "signin" | "signup") => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenSignInModal }) => {
  const router = useRouter();

  const handleStartAnalysis = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated()) {
      router.push("/papers");
    } else {
      onOpenSignInModal?.("signup");
    }
  };

  const handleExploreDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated()) {
      router.push("/dashboard");
    } else {
      onOpenSignInModal?.("signin");
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navy Rounded Panel */}
        <div className="relative bg-[#101827] rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10 shadow-[0_20px_50px_rgba(16,24,39,0.25)] overflow-hidden">
          
          {/* Subtle Background Radial & Molecular Accents */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#36C9C0]/15 blur-3xl pointer-events-none" 
            aria-hidden="true" 
          />
          <div 
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#3B6FD8]/20 blur-3xl pointer-events-none" 
            aria-hidden="true" 
          />

          {/* SVG Constellation pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern id="ctaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#36C9C0" />
                <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="#3B6FD8" strokeWidth="0.5" strokeOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaGrid)" />
          </svg>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#172235] border border-[#36C9C0]/30 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#36C9C0]" />
              <span className="text-xs font-semibold text-[#CBD5E1] tracking-wide uppercase font-mono">
                Accelerate Literature Synthesis
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans leading-tight">
              Make Sense of Conflicting Research.
            </h2>

            <p className="text-base sm:text-xl text-[#CBD5E1] leading-relaxed max-w-2xl mx-auto">
              Start comparing experiments and investigate the differences behind scientific findings.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] active:bg-[#244ea3] rounded-xl shadow-[0_0_25px_rgba(59,111,216,0.5)] hover:shadow-[0_0_35px_rgba(59,111,216,0.7)] hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#3B6FD8]"
              >
                <span>Start Your Analysis</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleExploreDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-sm font-medium text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
              >
                Explore Live Demo Workspace
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#CBD5E1]/80">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>No proprietary LLM lock-in</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>Deterministic extraction pipeline</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>Direct PDF drag & drop upload</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
