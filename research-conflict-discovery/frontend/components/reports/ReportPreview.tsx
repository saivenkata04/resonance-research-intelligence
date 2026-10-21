"use client";

import React, { useRef } from "react";
import { ReportData } from "@/types";
import {
  FileText,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  Quote,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getReportDownloadUrl } from "@/lib/api-client";

interface ReportPreviewProps {
  report: ReportData;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ report }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.open(getReportDownloadUrl(report.id), "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DCE4EE] shadow-subtle flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Generated Intelligence Report
          </span>
          <h2 className="text-base font-bold text-[#101827]">{report.title}</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div
        ref={reportRef}
        className="bg-white rounded-2xl p-6 sm:p-10 border border-[#DCE4EE] shadow-card space-y-8 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="uppercase tracking-widest font-bold text-[#36C9C0]">
              RESONANCE Research Intelligence • Discrepancy Audit
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Generated: {formatDate(report.generatedDate)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] leading-tight">
            {report.title}
          </h1>

          <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-y-1 gap-x-4">
            <span>Project: <strong className="text-slate-800">{report.project}</strong></span>
            <span>Comparison ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{report.comparisonId}</code></span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#36C9C0]" /> 1. Executive Summary
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {report.executiveSummary}
          </p>
        </div>

        {/* Paper Metadata Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            2. Benchmarked Publications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Primary Baseline (Paper A)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{report.paperA.title}</h4>
              <p className="text-slate-600">{report.paperA.authors} ({report.paperA.year})</p>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-1">
              <span className="font-bold text-teal-600 uppercase tracking-wider block text-[10px]">
                Contrasting Study (Paper B)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{report.paperB.title}</h4>
              <p className="text-slate-600">{report.paperB.authors} ({report.paperB.year})</p>
            </div>
          </div>
        </div>

        {/* Comparability Verdict */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
          <span className="font-bold text-amber-900 uppercase tracking-wider block text-[11px]">
            Comparability Assessment
          </span>
          <p className="text-amber-950 font-medium leading-relaxed">{report.comparabilityVerdict}</p>
        </div>

        {/* Identified Conflicts Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> 3. Extracted Pipeline Conflicts
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Attribute</th>
                  <th className="p-3">Paper A Baseline</th>
                  <th className="p-3">Paper B Variation</th>
                  <th className="p-3 text-center">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.identifiedConflicts.map((c) => (
                  <tr key={c.key} className="bg-white">
                    <td className="p-3 font-semibold text-slate-900">{c.label}</td>
                    <td className="p-3 font-mono text-slate-700">{c.valueA}</td>
                    <td className="p-3 font-mono text-rose-700 font-semibold">{c.valueB}</td>
                    <td className="p-3 text-center font-bold text-rose-600">{c.impactScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ranked Explanations */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#36C9C0]" /> 4. Ranked Candidate Explanations (Methodological Attribution)
          </h3>
          <div className="space-y-3">
            {report.rankedCauses.map((rc) => (
              <div key={rc.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#101827] text-white flex items-center justify-center font-bold text-xs">
                      #{rc.rank}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{rc.title}</span>
                  </div>
                  <span className="font-bold text-[#1a857f] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {rc.confidenceScore}% Plausibility ({rc.hypothesisType})
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{rc.explanation}</p>
                {rc.supportingQuotes.length > 0 && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                    <Quote className="w-3 h-3 text-[#36C9C0] inline mr-1" />
                    "{rc.supportingQuotes[0].quote}" — <em>{rc.supportingQuotes[0].paperTitle}, p.{rc.supportingQuotes[0].pageNumber}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Limitations & Verification Warnings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            5. Analysis Limitations & Uncertainty
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-slate-200">
            {report.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            6. Recommendations for Reproduction
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside bg-teal-50/40 p-4 rounded-xl border border-teal-200/60">
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400">
          Generated automatically by RESONANCE Research Intelligence. Evidence grounded directly in source documents via local Scientific NLP extraction.
        </div>
      </div>
    </div>
  );
};
