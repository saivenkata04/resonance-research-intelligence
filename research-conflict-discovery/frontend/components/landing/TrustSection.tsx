"use client";

import React from "react";
import { Quote, BookOpen, AlertCircle, HelpCircle, CheckCircle2, Scale } from "lucide-react";

export const TrustSection: React.FC = () => {
  const distinctions = [
    {
      level: "Level 1",
      title: "Observed Difference",
      badge: "Empirical Fact",
      badgeColor: "#36C9C0",
      description:
        "Directly documented discrepancies in datasets, model configurations, or evaluation code extracted from published text.",
      example: "Paper A evaluated on filtered queries (>15 words); Paper B evaluated on unfiltered queries.",
    },
    {
      level: "Level 2",
      title: "Plausible Explanation",
      badge: "Ranked Candidate",
      badgeColor: "#F59E0B",
      description:
        "Mechanistic explanations scored by likelihood that the observed difference explains the divergent outcome.",
      example: "Query length filter is estimated to explain 70-85% of the 12.4% F1 discrepancy based on domain priors.",
    },
    {
      level: "Level 3",
      title: "Causally Demonstrated Result",
      badge: "Controlled Experiment",
      badgeColor: "#8B5CF6",
      description:
        "Only provable through controlled empirical re-execution or ablation benchmarks, never claimed from observational text alone.",
      example: "Requires re-running Model B on Paper A's exact data split to formally establish empirical causation.",
    },
  ];

  return (
    <section id="trust" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#101827]/5 border border-[#101827]/10 text-[#101827] text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-[#3B6FD8]" />
            <span>Scientific Integrity & Transparency</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101827] tracking-tight font-sans">
            Every Explanation Should Have Evidence.
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            RESONANCE is designed for peer-reviewed science. We maintain strict epistemic humility: every finding links to verbatim citations, missing information is explicitly flagged, and correlation is never disguised as causation.
          </p>
        </div>

        {/* 3 Epistemic Levels of Distinction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {distinctions.map((d, i) => (
            <div
              key={i}
              className="bg-[#F5F7FA] rounded-2xl p-7 border border-[#DCE4EE] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
                    {d.level}
                  </span>
                  <span
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${d.badgeColor}15`, color: d.badgeColor }}
                  >
                    {d.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#101827] mb-2 font-sans">
                  {d.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  {d.description}
                </p>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-[#DCE4EE] text-xs text-[#101827]">
                <div className="font-semibold text-[11px] uppercase tracking-wider text-[#64748B] mb-1">
                  Illustrative Example
                </div>
                {d.example}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Pillars of Scientific Trust */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-[#DCE4EE]">
          <div className="flex items-start space-x-3.5">
            <Quote className="w-5 h-5 text-[#3B6FD8] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#101827]">Verbatim Source Quotations</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Raw excerpts preserved intact so peer reviewers can evaluate context without paraphrasing distortions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <BookOpen className="w-5 h-5 text-[#36C9C0] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#101827]">Page & Section Precision</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Every claim anchors to exact page indices, figure labels, and section headings in the source manuscript.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#101827]">Explicit Missing Information</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                When authors omit batch sizes, seeds, or hardware specs, RESONANCE marks them as "Unreported" instead of guessing.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#34D399] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#101827]">Calibrated Uncertainty</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Plausibility scores are confidence-bounded intervals, acknowledging epistemic limits of observational paper analysis.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
