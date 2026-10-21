"use client";

import React, { useState } from "react";
import { 
  GitFork, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Sliders
} from "lucide-react";

interface NodeDetail {
  id: string;
  name: string;
  category: "shared" | "divergent" | "result" | "hypothesis";
  paperAValue: string;
  paperBValue: string;
  evidenceQuoteA: string;
  citationA: string;
  evidenceQuoteB: string;
  citationB: string;
  plausibilityScore?: number;
  explanation: string;
}

export const ExperimentVisualization: React.FC = () => {
  const nodes: NodeDetail[] = [
    {
      id: "architecture",
      name: "Model Architecture",
      category: "shared",
      paperAValue: "RoBERTa-Large (355M params)",
      paperBValue: "RoBERTa-Large (355M params)",
      evidenceQuoteA: "We instantiate our base model using the RoBERTa-large checkpoint (Liu et al., 2019) with 24 layers and 1024 hidden dimensions.",
      citationA: "Section 3.1, Page 4",
      evidenceQuoteB: "For direct comparability, our primary experiments employ standard RoBERTa-large with 16 attention heads.",
      citationB: "Section 2.2, Page 3",
      explanation: "Identical underlying neural model. Architectural divergence ruled out as primary explanation.",
    },
    {
      id: "dataset-split",
      name: "Evaluation Split & Filtering",
      category: "divergent",
      paperAValue: "Strict Length Filter (>15 tokens)",
      paperBValue: "Full Unfiltered Test Corpus",
      evidenceQuoteA: "To eliminate degenerate short queries, sentences with fewer than 15 tokens were omitted from the final evaluation pool.",
      citationA: "Section 4.2, Page 6",
      evidenceQuoteB: "We report evaluation across the comprehensive, uncurated corpus without post-hoc length filtering.",
      citationB: "Section 3.4, Page 5",
      plausibilityScore: 0.94,
      explanation: "Primary candidate driver. Filtering short tokens accounts for substantial variation between evaluations.",
    },
    {
      id: "metric-formula",
      name: "Metric Computation Protocol",
      category: "divergent",
      paperAValue: "Macro-averaged F1 (relaxed token overlap)",
      paperBValue: "Micro-averaged F1 (strict exact match)",
      evidenceQuoteA: "F1 scores are calculated as macro-averages over entity classes, granting partial credit for partial boundary matches.",
      citationA: "Section 4.1, Page 5",
      evidenceQuoteB: "Scores represent micro-averaged exact string span intersections; partial overlaps are penalized as negative instances.",
      citationB: "Section 4.1, Page 6",
      plausibilityScore: 0.88,
      explanation: "Secondary candidate factor. Scoring string boundaries strictly versus leniently accounts for a 4.1% F1 penalty in Paper B.",
    },
    {
      id: "results",
      name: "Reported Final Performance",
      category: "result",
      paperAValue: "F1: 84.2% (Filtered Benchmark)",
      paperBValue: "F1: 76.8% (-7.4 pp discrepancy)",
      evidenceQuoteA: "Our evaluated framework reached Macro-F1 of 84.2% ± 0.4% across filtered test targets.",
      citationA: "Section 5, Page 1",
      evidenceQuoteB: "Under strict evaluation conditions, the framework demonstrates brittle generalization reaching Macro-F1 of 76.8% ± 0.5%.",
      citationB: "Section 5, Page 1",
      explanation: "Apparent empirical discrepancy (7.4 percentage-points) contextualized through systematic protocol auditing.",
    },
    {
      id: "hypothesis-1",
      name: "Candidate Explanation (Attribution)",
      category: "hypothesis",
      paperAValue: "Candidate: Protocol & Filter Discrepancy",
      paperBValue: "Plausibility Rank: 0.88",
      evidenceQuoteA: "Comparative analysis indicates length filtering threshold (<15 tokens) and uncurated corpus differences account for major performance variance.",
      citationA: "Methodological Audit",
      evidenceQuoteB: "When controlled for sequence length filtering, empirical gap diminishes substantially.",
      citationB: "Sensitivity Analysis",
      plausibilityScore: 0.88,
      explanation: "Candidate explanation: The studies evaluated non-equivalent sample length distributions.",
    },
  ];

  const [selectedNode, setSelectedNode] = useState<NodeDetail>(nodes[1]); // Default to divergence node

  return (
    <section id="visualization" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#36C9C0]/10 border border-[#36C9C0]/20 text-[#0d9488] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Divergence Graph</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101827] tracking-tight font-sans">
            Trace Disagreements from Papers to Candidate Explanations
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Click on any node in the scientific lineage below to inspect exact methodology quotes, source page citations, and ranked explanatory hypotheses.
          </p>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#36C9C0]" />
              <span className="text-[#101827]">Shared Attribute</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="text-[#101827]">Methodological Divergence</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F43F5E]" />
              <span className="text-[#101827]">Conflicting Outcome</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#3B6FD8]" />
              <span className="text-[#101827]">Candidate Explanation</span>
            </div>
          </div>
        </div>

        {/* Interactive Workspace: Diagram on Left/Top, Evidence Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visual Flow Diagram (7 cols) */}
          <div className="lg:col-span-7 bg-[#101827] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Ambient graph grid background */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#36C9C0 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />

            {/* Input Papers Bar */}
            <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-white/10 relative z-10">
              <div className="bg-[#172235] border border-white/10 rounded-xl p-3.5">
                <div className="text-[10px] font-mono text-[#36C9C0] uppercase font-bold">Paper Alpha</div>
                <div className="text-sm font-semibold text-white truncate">Chen et al. (2023)</div>
                <div className="text-xs text-[#CBD5E1]/70">Nature Machine Intelligence</div>
              </div>
              <div className="bg-[#172235] border border-white/10 rounded-xl p-3.5">
                <div className="text-[10px] font-mono text-[#F43F5E] uppercase font-bold">Paper Beta</div>
                <div className="text-sm font-semibold text-white truncate">Miller et al. (2024)</div>
                <div className="text-xs text-[#CBD5E1]/70">ICLR Proceedings</div>
              </div>
            </div>

            {/* Interactive Node Cards */}
            <div className="space-y-3 relative z-10">
              {nodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                let badgeColor = "#36C9C0";
                let badgeBg = "rgba(54, 201, 192, 0.15)";
                let borderStyle = "border-white/10";

                if (node.category === "divergent") {
                  badgeColor = "#F59E0B";
                  badgeBg = "rgba(245, 158, 11, 0.15)";
                } else if (node.category === "result") {
                  badgeColor = "#F43F5E";
                  badgeBg = "rgba(244, 63, 94, 0.15)";
                } else if (node.category === "hypothesis") {
                  badgeColor = "#3B6FD8";
                  badgeBg = "rgba(59, 111, 216, 0.2)";
                }

                if (isSelected) {
                  borderStyle = `border-[${badgeColor}] ring-2 ring-[${badgeColor}]/40`;
                }

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected ? "bg-[#1f2d45] border-2" : "bg-[#172235]/70 hover:bg-[#172235] border border-white/10"
                    }`}
                    style={{ borderColor: isSelected ? badgeColor : undefined }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: badgeColor }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {node.name}
                        </div>
                        <div className="text-xs text-[#CBD5E1]/70 mt-0.5 line-clamp-1">
                          {node.explanation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pl-6 sm:pl-0">
                      <span 
                        className="text-[11px] font-mono px-2 py-0.5 rounded font-medium"
                        style={{ backgroundColor: badgeBg, color: badgeColor }}
                      >
                        {node.category.toUpperCase()}
                      </span>
                      <ArrowRight className={`w-4 h-4 text-white/40 transition-transform ${isSelected ? "text-white translate-x-1" : ""}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instruction Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#CBD5E1]/60">
              <span>Interactive Graph • Click any node to audit source text</span>
              <span className="font-mono text-[11px] text-[#36C9C0]">State: Calibrated</span>
            </div>
          </div>

          {/* Evidence Inspector Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-[#F5F7FA] border border-[#DCE4EE] rounded-2xl p-6 sm:p-7 shadow-sm sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4EE]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#3B6FD8]" />
                <h3 className="text-base font-bold text-[#101827]">
                  Evidence Audit Inspector
                </h3>
              </div>
              {selectedNode.plausibilityScore && (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#EBF2FE] text-[#1E3A8A]">
                  Plausibility {(selectedNode.plausibilityScore * 100).toFixed(0)}%
                </span>
              )}
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-[#64748B] tracking-wider">
                  Inspected Node
                </span>
                <h4 className="text-xl font-bold text-[#101827] mt-0.5">
                  {selectedNode.name}
                </h4>
                <p className="text-xs text-[#64748B] mt-1">
                  {selectedNode.explanation}
                </p>
              </div>

              {/* Study A Evidence */}
              <div className="bg-white rounded-xl p-4 border border-[#DCE4EE]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#101827]">Study A — Chen et al.</span>
                  <span className="text-[11px] font-mono text-[#3B6FD8]">{selectedNode.citationA}</span>
                </div>
                <div className="text-xs font-mono text-[#101827] bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0] italic">
                  "{selectedNode.evidenceQuoteA}"
                </div>
                <div className="text-[11px] text-[#64748B] mt-2">
                  <span className="font-medium text-[#101827]">Reported Setting:</span> {selectedNode.paperAValue}
                </div>
              </div>

              {/* Study B Evidence */}
              <div className="bg-white rounded-xl p-4 border border-[#DCE4EE]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#101827]">Study B — Miller et al.</span>
                  <span className="text-[11px] font-mono text-[#F43F5E]">{selectedNode.citationB}</span>
                </div>
                <div className="text-xs font-mono text-[#101827] bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0] italic">
                  "{selectedNode.evidenceQuoteB}"
                </div>
                <div className="text-[11px] text-[#64748B] mt-2">
                  <span className="font-medium text-[#101827]">Reported Setting:</span> {selectedNode.paperBValue}
                </div>
              </div>

              {/* Verifiable Action Link */}
              <div className="pt-2">
                <a
                  href="/papers"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-[#101827] hover:bg-[#172235] rounded-xl shadow-sm transition-colors"
                >
                  <span>Upload Your Own Papers to Inspect</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
