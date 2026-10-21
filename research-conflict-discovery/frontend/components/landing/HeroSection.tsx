"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, CheckCircle2 } from "lucide-react";
import { ScientificNetwork } from "./ScientificNetwork";
import { HeroImage } from "./HeroImage";
import { CurvedDivider } from "./CurvedDivider";
import { isAuthenticated } from "@/lib/auth";

interface HeroSectionProps {
  onOpenSignInModal?: (mode?: "signin" | "signup") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenSignInModal }) => {
  const router = useRouter();

  const handleStartAnalysis = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated()) {
      router.push("/papers");
    } else {
      onOpenSignInModal?.("signup");
    }
  };

  const handleScrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-[#101827] pt-28 sm:pt-36 lg:pt-40 pb-0 overflow-hidden min-h-[92vh] flex flex-col justify-between">
      {/* Background Molecular & Dependency Network */}
      <ScientificNetwork />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center py-8 lg:py-12">
          
          {/* Left Column (55% desktop width = 7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 lg:space-y-8 max-w-2xl">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#172235] border border-[#36C9C0]/30 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#36C9C0] animate-pulse" />
              <span className="text-xs font-medium text-[#CBD5E1] tracking-wide">
                Scientific Research Conflict & Root-Cause Discovery
              </span>
            </div>

            {/* Exact Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
              Discover Why <br className="hidden sm:inline" />
              Science Disagrees.
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[#CBD5E1] leading-relaxed font-normal max-w-xl">
              Compare scientific experiments, uncover methodological differences, and investigate evidence-backed explanations for conflicting research findings.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-5 w-full sm:w-auto pt-2">
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] active:bg-[#244ea3] rounded-xl shadow-[0_4px_25px_rgba(59,111,216,0.45)] hover:shadow-[0_6px_30px_rgba(59,111,216,0.65)] hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#3B6FD8] focus:ring-offset-2 focus:ring-offset-[#101827]"
              >
                <span>Start an Analysis</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#how-it-works"
                onClick={handleScrollToWorkflow}
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-xl border border-white/10 hover:border-white/25 transition-all duration-200 group"
              >
                <span>Explore How It Works</span>
                <ChevronDown className="ml-1.5 w-4 h-4 text-[#36C9C0] group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Scientific Trust Metric Highlights */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 w-full">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">Verbatim</div>
                <div className="text-xs text-[#CBD5E1]/70 mt-0.5">Citation-Grounding</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#36C9C0] font-mono">Auditable</div>
                <div className="text-xs text-[#CBD5E1]/70 mt-0.5">Rule-Based Extraction</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#3B6FD8] font-mono">Methodical</div>
                <div className="text-xs text-[#CBD5E1]/70 mt-0.5">Candidate Explanations</div>
              </div>
            </div>

          </div>

          {/* Right Column (45% desktop width = 5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <HeroImage />
          </div>

        </div>
      </div>

      {/* Signature Asymmetrical Organic Curved Divider */}
      <div className="relative mt-auto pt-6 lg:pt-10">
        <CurvedDivider />
      </div>
    </section>
  );
};
