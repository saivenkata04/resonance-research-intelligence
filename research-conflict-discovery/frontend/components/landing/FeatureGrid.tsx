"use client";

import React from "react";
import { FileSpreadsheet, GitPullRequest, SlidersHorizontal, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: FileSpreadsheet,
      title: "Structured Experiment Extraction",
      description:
        "Automatically identifies architectures, dataset splits, tokenizers, loss formulations, optimizer parameters, and runtime environments from unstructured PDF manuscripts without requiring manual annotation.",
      href: "/papers",
      linkText: "Explore extractor",
      color: "#3B6FD8",
    },
    {
      icon: GitPullRequest,
      title: "Cross-Paper Conflict Detection",
      description:
        "Aligns experimental dimensions side-by-side to highlight where protocols diverge. Instantly spots metric definition discrepancies, training schedule asymmetries, and evaluation distribution drifts.",
      href: "/comparisons",
      linkText: "View comparison matrix",
      color: "#36C9C0",
    },
    {
      icon: SlidersHorizontal,
      title: "Root-Cause Candidate Ranking",
      description:
        "Scores and ranks plausible drivers behind divergent findings based on empirical sensitivity heuristics, literature priors, and methodological variance analysis rather than unverifiable generative guesses.",
      href: "/root-causes",
      linkText: "Inspect ranking engine",
      color: "#F59E0B",
    },
    {
      icon: ShieldCheck,
      title: "Evidence-Based Verification",
      description:
        "Every single parameter, claim, and hypothesis links directly to verified source quotations, section headers, and page citations so researchers can audit the evidence behind every conclusion in seconds.",
      href: "/graph",
      linkText: "See audit trail",
      color: "#34D399",
    },
  ];

  return (
    <section id="capabilities" className="py-20 lg:py-28 bg-[#F5F7FA] border-t border-[#DCE4EE] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#101827]/5 border border-[#101827]/10 text-[#101827] text-xs font-semibold uppercase tracking-wider">
            <span>Core System Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101827] tracking-tight font-sans">
            Engineered for Methodological Rigor
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Built specifically to solve research reproducibility by replacing tedious literature comparison with automated, verifiable analysis.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-[#DCE4EE] hover:border-[#3B6FD8]/50 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-200"
                    style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#101827] mb-3 font-sans">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F1F5F9] flex items-center justify-between">
                  <Link
                    href={feature.href}
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-[#101827] group-hover:text-[#3B6FD8] transition-colors"
                  >
                    <span>{feature.linkText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <span className="font-mono text-xs text-[#CBD5E1] font-bold">
                    0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
