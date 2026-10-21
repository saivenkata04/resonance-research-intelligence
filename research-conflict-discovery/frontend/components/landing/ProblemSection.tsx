"use client";

import React from "react";
import { Database, Filter, Cpu, ClipboardCheck, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";

export const ProblemSection: React.FC = () => {
  const divergenceVectors = [
    {
      icon: Database,
      title: "Dataset Discrepancies",
      description: "Variations in filtering, class imbalance, test-set distribution splits, or unstated data hygiene steps.",
      tag: "Data Drift",
      color: "#36C9C0",
    },
    {
      icon: Filter,
      title: "Preprocessing Variations",
      description: "Subtle differences in tokenization boundaries, stopword elimination, text normalization, and stem algorithms.",
      tag: "Pipeline Shift",
      color: "#3B6FD8",
    },
    {
      icon: Cpu,
      title: "Model Configurations",
      description: "Unmentioned random seeds, weight initializations, architectural revisions, or checkpoint selection biases.",
      tag: "Hyperparameters",
      color: "#8B5CF6",
    },
    {
      icon: ClipboardCheck,
      title: "Experimental Protocols",
      description: "Contrasting cross-validation techniques, batch size variations, early-stopping criteria, or prompt templates.",
      tag: "Protocol Bias",
      color: "#F59E0B",
    },
    {
      icon: BarChart3,
      title: "Evaluation Metric Semantics",
      description: "Micro vs Macro averaging, threshold calibrations, or evaluation scripts implemented with conflicting mathematical logic.",
      tag: "Metric Divergence",
      color: "#F43F5E",
    },
  ];

  return (
    <section id="problem" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#172235]/5 border border-[#172235]/15 text-[#101827] text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
            <span>The Reproducibility Bottleneck</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101827] tracking-tight font-sans">
            Different Results. Different Methods. <br className="hidden sm:inline" />
            <span className="text-[#3B6FD8]">What Changed?</span>
          </h2>
          
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            When peer-reviewed research papers publish conflicting findings on identical tasks, researchers spend months manually parsing text to uncover what actually drove the divergence.
          </p>
        </div>

        {/* Real-World Dilemma Showcase: Paper A vs Paper B Comparison Box */}
        <div className="bg-[#F5F7FA] border border-[#DCE4EE] rounded-2xl p-6 sm:p-8 lg:p-10 mb-16 shadow-subtle">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-[#DCE4EE]">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-[#3B6FD8] tracking-wider">
                Case Study: NLP Benchmark Discrepancy
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#101827] mt-1">
                Same Foundation Model. Contradictory Task Performance.
              </h3>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#FEE2E2] border border-[#F87171]/40 text-[#991B1B] text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span>Contradictory Claim Detected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Paper A */}
            <div className="bg-white rounded-xl p-5 border border-[#DCE4EE] shadow-sm relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded bg-[#EBF2FE] text-[#1E3A8A] text-xs font-semibold">
                  Study A (Chen et al., 2023)
                </span>
                <span className="text-xs font-mono font-bold text-[#10B981]">Reported F1: 84.2%</span>
              </div>
              <h4 className="text-sm font-semibold text-[#101827] mb-2">
                "Zero-shot transfer shows strong out-of-domain robustness."
              </h4>
              <ul className="text-xs text-[#64748B] space-y-1.5 font-mono">
                <li>• Dataset: SQuAD-v2 (Filtered subsets &gt; 15 words)</li>
                <li>• Evaluation Metric: Token-overlap Macro-F1</li>
                <li>• Preprocessing: Lowercased, punctuation stripped</li>
              </ul>
            </div>

            {/* Paper B */}
            <div className="bg-white rounded-xl p-5 border border-[#FCA5A5] shadow-sm relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded bg-[#FEE2E2] text-[#991B1B] text-xs font-semibold">
                  Study B (Miller et al., 2024)
                </span>
                <span className="text-xs font-mono font-bold text-[#EF4444]">Reported F1: 76.8%</span>
              </div>
              <h4 className="text-sm font-semibold text-[#101827] mb-2">
                "Failure of zero-shot transfer under out-of-domain drift."
              </h4>
              <ul className="text-xs text-[#64748B] space-y-1.5 font-mono">
                <li>• Dataset: SQuAD-v2 (Raw unfiltered evaluation split)</li>
                <li>• Evaluation Metric: Exact Match strict Macro-F1</li>
                <li>• Preprocessing: Cased token sequences retained</li>
              </ul>
            </div>
          </div>

          {/* Root-cause resolution badge */}
          <div className="mt-6 pt-5 border-t border-[#DCE4EE] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#64748B] gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#36C9C0]" />
              <span className="font-medium text-[#101827]">RESONANCE Audit Diagnosis:</span>
              <span>7.4 percentage-point discrepancy contextualized by dataset filtering criteria and evaluation metric strictness.</span>
            </div>
            <a href="#visualization" className="inline-flex items-center text-[#3B6FD8] font-semibold hover:underline">
              <span>View interactive graph</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* 5 Core Divergence Vectors Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {divergenceVectors.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-[#DCE4EE] hover:border-[#3B6FD8]/50 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${v.color}15`, color: v.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                    {v.tag}
                  </span>
                  <h4 className="text-base font-bold text-[#101827] mt-1 mb-2 font-sans">
                    {v.title}
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
