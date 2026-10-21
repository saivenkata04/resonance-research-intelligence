"use client";

import React from "react";
import { EvidenceQuote } from "@/types";
import { X, FileText, CheckCircle2, Bookmark, Quote, ExternalLink, ShieldCheck } from "lucide-react";

interface EvidenceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceQuote | null;
  attributeLabel?: string;
  attributeValue?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  isOpen,
  onClose,
  evidence,
  attributeLabel,
  attributeValue,
}) => {
  if (!isOpen || !evidence) return null;

  // Highlight terms inside the quote
  const renderHighlightedQuote = () => {
    let text = evidence.quote;
    if (!evidence.highlightedTerms || evidence.highlightedTerms.length === 0) {
      return <span>"{text}"</span>;
    }

    // Split text or wrap matches
    const terms = evidence.highlightedTerms;
    const regex = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(regex);

    return (
      <span className="leading-relaxed">
        "
        {parts.map((part, i) => {
          const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            return (
              <mark
                key={i}
                className="bg-[#36C9C0]/25 text-[#0d5954] font-semibold px-1 py-0.5 rounded border-b border-[#36C9C0]"
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
        "
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-drawer border-l border-[#DCE4EE] flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#101827] text-white flex items-center justify-between border-b border-[#1f2d44]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#36C9C0]/20 flex items-center justify-center text-[#36C9C0]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Extracted Scientific Evidence</h3>
              <p className="text-[11px] text-slate-400">Verifiable citation from source paper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Attribute Target */}
          {attributeLabel && (
            <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE4EE]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Attribute
              </span>
              <span className="text-sm font-bold text-[#101827] mt-0.5 block">
                {attributeLabel}
              </span>
              {attributeValue && (
                <div className="mt-2 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800">
                  {attributeValue}
                </div>
              )}
            </div>
          )}

          {/* Paper Reference Meta */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#64748B]">Source Publication</span>
                <h4 className="text-sm font-bold text-[#101827] mt-0.5">{evidence.paperTitle}</h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                {Math.round(evidence.confidence * 100)}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#DCE4EE]">
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  Page {evidence.pageNumber}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#DCE4EE]">
                <span className="text-slate-400 block font-medium">Section</span>
                <span className="font-semibold text-slate-700 mt-0.5 block truncate" title={evidence.section}>
                  {evidence.section}
                </span>
              </div>
            </div>
          </div>

          {/* Quotation Body */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-[#36C9C0]" /> Exact Extracted Excerpt
            </span>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 text-sm text-slate-800 italic relative">
              <div className="absolute top-2 right-2 text-amber-300">
                <Bookmark className="w-4 h-4 fill-amber-200" />
              </div>
              {renderHighlightedQuote()}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Highlighted spans indicate tokens parsed by scientific NLP regex and entity extractors.
            </p>
          </div>

          {/* Verification Protocol Notice */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ground-Truth Traceability
            </div>
            <p className="text-[11px] leading-relaxed">
              This evidence is anchored directly to the raw PDF text layer without hallucinated interpolations, ensuring complete auditability for reproduction studies.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE4EE] bg-slate-50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
