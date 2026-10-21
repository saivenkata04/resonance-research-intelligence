"use client";

import React from "react";
import Link from "next/link";
import { GitCompare, ArrowRight, Sparkles, FileSearch, HelpCircle } from "lucide-react";

interface AnalysisHeroProps {
  onStartAnalysis?: () => void;
}

export const AnalysisHero: React.FC<AnalysisHeroProps> = ({ onStartAnalysis }) => {
  return (
    <div className="bg-[#101827] text-white rounded-2xl p-6 sm:p-8 border border-[#1f2d44] shadow-card relative overflow-hidden">
      {/* Subtle background circuit/node glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#36C9C0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2c44] border border-[#2d3e5e] text-[#36C9C0] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Root-Cause Discovery Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Start a new analysis
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Compare experiments. Investigate conflicting results. Trace supporting evidence across contradictory scientific literature.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-[#36C9C0]" /> Automated attribute extraction
            </span>
            <span className="flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-[#36C9C0]" /> Cross-pipeline alignment
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          {onStartAnalysis ? (
            <button
              onClick={onStartAnalysis}
              className="w-full md:w-64 py-3.5 px-6 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] font-bold text-sm tracking-wide transition-all duration-150 shadow-md hover:shadow-lg hover:shadow-[#36C9C0]/20 flex items-center justify-center gap-2 group"
            >
              <span>+ Analyze research papers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <Link
              href="/papers?upload=true"
              className="w-full md:w-64 py-3.5 px-6 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] font-bold text-sm tracking-wide transition-all duration-150 shadow-md hover:shadow-lg hover:shadow-[#36C9C0]/20 flex items-center justify-center gap-2 group"
            >
              <span>+ Analyze research papers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <Link
            href="/comparisons/comp-vit-deit"
            className="w-full md:w-64 py-2.5 px-4 rounded-xl bg-[#172235] hover:bg-[#1e2c44] text-slate-300 hover:text-white border border-[#2d3e5e] text-xs font-medium transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span>View demo: ViT vs DeiT Conflict</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
