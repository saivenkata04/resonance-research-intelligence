"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ReportData, Comparison } from "@/types";
import { fetchReports, fetchComparisons, generateReport, getReportDownloadUrl } from "@/lib/api-client";
import { FileText, ChevronRight, Download, Calendar, Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCompForReport, setSelectedCompForReport] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [reps, comps] = await Promise.all([fetchReports(), fetchComparisons()]);
      setReports(reps);
      setComparisons(comps);
      if (comps.length > 0) {
        setSelectedCompForReport(comps[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      setErrorMsg(err.message || "Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateReport = async () => {
    if (!selectedCompForReport) return;
    setIsGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const newRep = await generateReport(selectedCompForReport);
      setReports((prev) => [newRep, ...prev.filter((r) => r.id !== newRep.id)]);
      setSuccessMsg(`Report "${newRep.title}" synthesized successfully! View it in the list below.`);
    } catch (err: any) {
      console.error("Failed to generate report:", err);
      setErrorMsg(err.message || "Failed to generate synthesis report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span>Intelligence Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[#36C9C0]">Reports</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
            Research Reports
          </h1>
          <p className="text-sm text-[#64748B]">
            Exportable discrepancy reports with verified quotations, candidate explanations, and protocol limitations.
          </p>
        </div>

        {comparisons.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedCompForReport}
              onChange={(e) => setSelectedCompForReport(e.target.value)}
              className="bg-white border border-[#DCE4EE] rounded-xl px-3 py-2 text-xs font-semibold text-[#101827] focus:outline-none focus:border-[#36C9C0]"
            >
              {comparisons.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateReport}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Synthesize Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Reports Catalog */}
      <div className="bg-white rounded-2xl border border-[#DCE4EE] shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-[#DCE4EE] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#101827]">Available Intelligence Reports</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Comprehensive synthesis documents ready for research group review
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {reports.length} Published
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0] mb-2" />
            <p className="text-sm font-medium">Loading research reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101827]">
              No reports generated yet
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              Select a completed comparison to synthesize a verifiable research reproducibility report.
            </p>
            {comparisons.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/papers"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-sm font-semibold transition-all shadow-sm"
                >
                  <span>Upload Papers to Begin</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#DCE4EE]">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/reports/${report.id}`}
                      className="text-base font-bold text-[#101827] hover:text-[#249e97] transition-colors"
                    >
                      {report.title}
                    </Link>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Audit Completed
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{report.executiveSummary}</p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64748B] pt-1">
                    <span>
                      Project: <strong className="text-slate-700">{report.project}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(report.generatedDate)}
                    </span>
                    <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {report.identifiedConflicts.length} Conflicts Grounded
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={getReportDownloadUrl(report.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>PDF</span>
                  </a>
                  <Link
                    href={`/reports/${report.id}`}
                    className="px-4 py-2 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Report</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
