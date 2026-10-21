"use client";

import React from "react";
import { FileSearch, GitCompare, Sparkles, CheckCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      step: "Extract",
      icon: FileSearch,
      title: "Structured Extraction",
      desc: "Parse full-text scientific PDFs and identify structured experimental attributes including architectures, datasets, hyperparameters, and protocols.",
      badge: "High Precision NLP",
      color: "#3B6FD8",
    },
    {
      num: "02",
      step: "Compare",
      icon: GitCompare,
      title: "Multi-Variable Matrix",
      desc: "Normalize and compare datasets, execution pipelines, evaluation metrics, and reported results across papers into a unified alignment grid.",
      badge: "Cross-Paper Diff",
      color: "#36C9C0",
    },
    {
      num: "03",
      step: "Investigate",
      icon: Sparkles,
      title: "Root-Cause Ranking",
      desc: "Formulate and rank plausible candidate explanations for conflicting findings based on methodological discrepancies and sensitivity scoring.",
      badge: "Transparent Reasoning",
      color: "#F59E0B",
    },
    {
      num: "04",
      step: "Verify",
      icon: CheckCheck,
      title: "Evidence Audit Trail",
      desc: "Trace every explanation directly back to exact sentence quotes, table cells, and page numbers in the original published literature.",
      badge: "Verbatim Citations",
      color: "#34D399",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#F5F7FA] border-y border-[#DCE4EE] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3B6FD8]/10 border border-[#3B6FD8]/20 text-[#3B6FD8] text-xs font-semibold uppercase tracking-wider">
            <span>The Discovery Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101827] tracking-tight font-sans">
            How RESONANCE Works
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            A deterministic, four-stage scientific investigation workflow that moves from raw literature to verified root-cause explanations.
          </p>
        </div>

        {/* Workflow Steps - Desktop horizontal pipeline, mobile vertical stack */}
        <div className="relative">
          {/* Subtle Desktop Connector Line */}
          <div 
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3B6FD8] via-[#36C9C0] to-[#34D399] -translate-y-16 z-0 opacity-40" 
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DCE4EE] hover:border-[#3B6FD8]/40 shadow-sm hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top step indicator and icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `${s.color}15`, color: s.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black font-mono text-[#DCE4EE] group-hover:text-[#3B6FD8] transition-colors">
                        {s.num}
                      </span>
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider mb-2"
                      style={{ backgroundColor: `${s.color}12`, color: s.color }}
                    >
                      {s.badge}
                    </div>

                    <h3 className="text-xl font-bold text-[#101827] mb-2.5 font-sans">
                      {s.step}: {s.title}
                    </h3>

                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-mono text-[11px] text-[#3B6FD8] font-semibold">Stage {s.num}</span>
                    <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Link under workflow */}
        <div className="mt-14 text-center">
          <Link
            href="/comparisons"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[#3B6FD8] hover:text-[#2F5CB8] transition-colors"
          >
            <span>See live paper comparison matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
