"use client";

import React, { useState } from "react";
import { Comparison, ComparisonAttribute, EvidenceQuote } from "@/types";
import {
  GitCompare,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Filter,
  Info,
  ChevronRight,
  ExternalLink,
  Split,
  Layers,
} from "lucide-react";
import { EvidenceViewer } from "../evidence-viewer/EvidenceViewer";

interface ExperimentComparisonProps {
  comparison: Comparison;
}

export const ExperimentComparison: React.FC<ExperimentComparisonProps> = ({
  comparison,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyDifferences, setOnlyDifferences] = useState<boolean>(false);
  const [activeEvidence, setActiveEvidence] = useState<{
    quote: EvidenceQuote;
    label: string;
    value: string;
  } | null>(null);

  const categories = [
    { id: "all", label: "All Attributes" },
    { id: "data", label: "Dataset & Splits" },
    { id: "pipeline", label: "Preprocessing" },
    { id: "model", label: "Model Backbone" },
    { id: "optimization", label: "Hyperparameters" },
    { id: "evaluation", label: "Evaluation & Results" },
  ];

  const filteredAttributes = comparison.attributes.filter((attr) => {
    if (selectedCategory !== "all" && attr.category !== selectedCategory) {
      return false;
    }
    if (onlyDifferences && !attr.isDifferent) {
      return false;
    }
    return true;
  });

  const getComparabilityHeader = () => {
    switch (comparison.comparability) {
      case "comparable":
        return {
          title: "Fully Comparable",
          desc: "Identical dataset, test split, and metric definitions. Results can be directly evaluated for superiority.",
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "partially-comparable":
        return {
          title: "Partially Comparable (Confounding Factors Present)",
          desc: "Same benchmark dataset and model family, but differing augmentations, optimizer schedules, or test crop protocols confound a direct claim.",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
        };
      case "not-comparable":
        return {
          title: "Incomparable Protocols",
          desc: "Divergent evaluation splits or incompatible metric definitions prevent direct scientific comparison.",
          badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
        };
    }
  };

  const compStatus = getComparabilityHeader();

  return (
    <div className="space-y-6">
      {/* Comparability Banner */}
      <div className={`p-5 rounded-2xl border ${compStatus.badgeBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70 shadow-xs">
              Alignment Status
            </span>
            <h3 className="text-base font-bold">{compStatus.title}</h3>
          </div>
          <p className="text-xs sm:text-sm opacity-90">{compStatus.desc}</p>
        </div>

        <div className="shrink-0 flex items-center space-x-2 text-xs font-semibold bg-white/80 px-3 py-1.5 rounded-xl shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{comparison.conflictCount} Critical Pipeline Differences</span>
        </div>
      </div>

      {/* Side-by-Side Paper Profiles Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paper A Profile */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE4EE] shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              Paper A (Baseline)
            </span>
            <span className="text-xs font-bold text-slate-500">{comparison.paperA.year}</span>
          </div>
          <h4 className="text-base font-bold text-[#101827] line-clamp-2">
            {comparison.paperA.paperTitle}
          </h4>
          <p className="text-xs text-[#64748B]">{comparison.paperA.authors}</p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Claimed Result:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {comparison.paperA.evaluationMetrics.primaryMetric}: {comparison.paperA.evaluationMetrics.primaryValue}
            </span>
          </div>
        </div>

        {/* Paper B Profile */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE4EE] shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#36C9C0]/15 text-[#1a857f]">
              Paper B (Comparison)
            </span>
            <span className="text-xs font-bold text-slate-500">{comparison.paperB.year}</span>
          </div>
          <h4 className="text-base font-bold text-[#101827] line-clamp-2">
            {comparison.paperB.paperTitle}
          </h4>
          <p className="text-xs text-[#64748B]">{comparison.paperB.authors}</p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Claimed Result:</span>
            <span className="font-bold text-[#1a857f] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {comparison.paperB.evaluationMetrics.primaryMetric}: {comparison.paperB.evaluationMetrics.primaryValue}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE4EE] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center overflow-x-auto space-x-1.5 pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#101827] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Differences Toggle */}
        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={onlyDifferences}
            onChange={(e) => setOnlyDifferences(e.target.checked)}
            className="w-4 h-4 rounded text-[#36C9C0] focus:ring-[#36C9C0] border-slate-300"
          />
          <span>Show Differences Only</span>
        </label>
      </div>

      {/* Attribute Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#DCE4EE] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#101827] text-white text-xs uppercase tracking-wider">
                <th className="py-3.5 px-5 font-semibold w-1/4">Experimental Attribute</th>
                <th className="py-3.5 px-5 font-semibold w-[35%]">
                  Paper A Value ({comparison.paperA.authors.split(" ")[0]})
                </th>
                <th className="py-3.5 px-5 font-semibold w-[35%]">
                  Paper B Value ({comparison.paperB.authors.split(" ")[0]})
                </th>
                <th className="py-3.5 px-3 font-semibold text-center w-[5%]">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-xs sm:text-sm">
              {filteredAttributes.map((attr) => (
                <tr
                  key={attr.key}
                  className={`transition-colors ${
                    attr.isDifferent ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  {/* Attribute Label */}
                  <td className="py-4 px-5 align-top">
                    <div className="font-bold text-[#101827]">{attr.label}</div>
                    <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">
                      {attr.category}
                    </span>
                  </td>

                  {/* Paper A Cell */}
                  <td className="py-4 px-5 align-top">
                    <div className="space-y-1.5">
                      <div className="text-slate-800 leading-relaxed font-mono text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {attr.valueA || (
                          <span className="text-slate-400 italic">Not reported in text</span>
                        )}
                      </div>

                      {attr.evidenceA && (
                        <button
                          onClick={() =>
                            setActiveEvidence({
                              quote: attr.evidenceA!,
                              label: `${attr.label} (Paper A)`,
                              value: attr.valueA,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1a857f] hover:text-[#115e5a] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 transition-colors"
                        >
                          <FileSearch className="w-3 h-3" />
                          <span>View Quote (p.{attr.evidenceA.pageNumber})</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Paper B Cell */}
                  <td className="py-4 px-5 align-top">
                    <div className="space-y-1.5">
                      <div
                        className={`text-slate-800 leading-relaxed font-mono text-xs p-2 rounded-lg border ${
                          attr.isDifferent
                            ? "bg-rose-50/80 border-rose-200 text-rose-950 font-semibold"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {attr.valueB || (
                          <span className="text-slate-400 italic">Not reported in text</span>
                        )}
                      </div>

                      {attr.evidenceB && (
                        <button
                          onClick={() =>
                            setActiveEvidence({
                              quote: attr.evidenceB!,
                              label: `${attr.label} (Paper B)`,
                              value: attr.valueB,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1a857f] hover:text-[#115e5a] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 transition-colors"
                        >
                          <FileSearch className="w-3 h-3" />
                          <span>View Quote (p.{attr.evidenceB.pageNumber})</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Difference & Impact Badge */}
                  <td className="py-4 px-3 align-top text-center">
                    {attr.isDifferent ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          attr.impactScore === "High"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {attr.impactScore}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                        Match
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Evidence Drawer */}
      <EvidenceViewer
        isOpen={Boolean(activeEvidence)}
        onClose={() => setActiveEvidence(null)}
        evidence={activeEvidence?.quote || null}
        attributeLabel={activeEvidence?.label}
        attributeValue={activeEvidence?.value}
      />
    </div>
  );
};
