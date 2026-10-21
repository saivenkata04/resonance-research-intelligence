"use client";

import React, { useState } from "react";
import { RootCause, EvidenceQuote } from "@/types";
import {
  Award,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Quote,
  ChevronDown,
  ChevronUp,
  FileSearch,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { EvidenceViewer } from "../evidence-viewer/EvidenceViewer";

interface RootCauseCardProps {
  cause: RootCause;
}

export const RootCauseCard: React.FC<RootCauseCardProps> = ({ cause }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState<{
    quote: EvidenceQuote;
    label: string;
  } | null>(null);

  const isObservedFact = cause.hypothesisType === "Observed Fact";

  return (
    <div className="bg-white rounded-2xl border border-[#DCE4EE] shadow-subtle hover:shadow-card transition-shadow duration-150 overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {/* Rank Badge */}
            <div className="w-8 h-8 rounded-xl bg-[#101827] text-white flex items-center justify-center font-bold text-sm shrink-0">
              #{cause.rank}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {cause.category}
              </span>

              {/* Status Badge: Fact vs Hypothesis */}
              {isObservedFact ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Observed Difference (Fact)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <HelpCircle className="w-3.5 h-3.5" /> Plausible Hypothesis (Unverified)
                </span>
              )}
            </div>
          </div>

          {/* Confidence Score Bar */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Confidence</span>
              <span className="text-sm font-extrabold text-[#101827]">{cause.confidenceScore}%</span>
            </div>
            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  cause.confidenceScore >= 85
                    ? "bg-[#36C9C0]"
                    : cause.confidenceScore >= 70
                    ? "bg-[#F59E0B]"
                    : "bg-slate-400"
                }`}
                style={{ width: `${cause.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#101827] tracking-tight">{cause.title}</h3>

        {/* Explanation */}
        <p className="text-sm text-slate-700 leading-relaxed">{cause.explanation}</p>

        {/* Impact Factors */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Key Ranking Factors & Pipeline Evidence
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {cause.impactFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#36C9C0] mt-1.5 shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Verification Alert if Plausible Hypothesis */}
        {!isObservedFact && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Reproducibility Notice:</span>
              This candidate cause is inferred from secondary literature heuristics and requires targeted ablation experiments before confirming causal impact.
            </div>
          </div>
        )}

        {/* Toggle Evidence Quotations */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-[#1a857f] hover:text-[#115e5a] flex items-center gap-1.5 transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>
              {expanded ? "Hide Paper Evidence" : `View Paper Evidence (${cause.supportingQuotes.length})`}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Evidence Quotations */}
      {expanded && (
        <div className="bg-slate-50 p-6 border-t border-[#DCE4EE] space-y-3 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Ground-Truth Textual Excerpts
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cause.supportingQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{q.paperTitle}</span>
                    <span className="text-[11px] text-slate-400">p.{q.pageNumber}</span>
                  </div>
                  <p className="text-xs text-slate-600 italic line-clamp-3">"{q.quote}"</p>
                </div>

                <button
                  onClick={() => setActiveEvidence({ quote: q, label: cause.title })}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1a857f] hover:underline"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Inspect full quote & context</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawer */}
      <EvidenceViewer
        isOpen={Boolean(activeEvidence)}
        onClose={() => setActiveEvidence(null)}
        evidence={activeEvidence?.quote || null}
        attributeLabel={activeEvidence?.label}
      />
    </div>
  );
};
