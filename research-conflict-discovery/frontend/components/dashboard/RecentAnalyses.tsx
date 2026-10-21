"use client";

import React from "react";
import Link from "next/link";
import { Comparison } from "@/types";
import { GitCompare, Calendar, ChevronRight, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RecentAnalysesProps {
  comparisons: Comparison[];
}

export const RecentAnalyses: React.FC<RecentAnalysesProps> = ({ comparisons }) => {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#DCE4EE] shadow-subtle text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#101827]">No analyses executed yet</h3>
        <p className="text-sm text-[#64748B] mt-1 max-w-sm mx-auto">
          Upload papers to begin automated attribute extraction, dependency graph generation, and conflict discovery.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: Comparison["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
          </span>
        );
      case "analyzing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "needs_review":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Needs Review
          </span>
        );
    }
  };

  const getComparabilityBadge = (comp: Comparison["comparability"]) => {
    switch (comp) {
      case "comparable":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100/70 text-emerald-800">
            Comparable
          </span>
        );
      case "partially-comparable":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            Partially Comparable
          </span>
        );
      case "not-comparable":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
            Incomparable
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DCE4EE] shadow-subtle overflow-hidden">
      <div className="px-6 py-5 border-b border-[#DCE4EE] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#101827]">Recent Analyses</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cross-paper comparisons and identified confounding factors
          </p>
        </div>
        <Link
          href="/comparisons"
          className="text-xs font-semibold text-[#249e97] hover:text-[#1d7e79] flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[#DCE4EE]">
        {comparisons.map((item) => (
          <div
            key={item.id}
            className="p-5 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/comparisons/${item.id}`}
                  className="text-sm font-bold text-[#101827] hover:text-[#249e97] transition-colors truncate"
                >
                  {item.title}
                </Link>
                {getComparabilityBadge(item.comparability)}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64748B]">
                <span className="font-medium text-slate-700">Project: {item.projectName}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(item.createdAt)}
                </span>
                <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {item.conflictCount} conflicts detected
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {getStatusBadge(item.status)}

              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
                <Link
                  href={`/comparisons/${item.id}`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-[#36C9C0]/15 hover:text-[#1d7e79] text-[#101827] transition-colors flex items-center gap-1"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </Link>

                <Link
                  href={`/reports/${item.id === "comp-vit-deit" ? "rep-vit-deit-01" : item.id}`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-[#101827] transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Report</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
