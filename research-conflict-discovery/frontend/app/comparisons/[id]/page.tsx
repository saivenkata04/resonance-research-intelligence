"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Comparison, RootCause } from "@/types";
import { fetchComparisonById, fetchRootCauses } from "@/lib/api-client";
import { ExperimentComparison } from "@/components/comparison-table/ExperimentComparison";
import { ExperimentGraph } from "@/components/dependency-graph/ExperimentGraph";
import { RootCauseCard } from "@/components/root-cause/RootCauseCard";
import {
  ChevronRight,
  GitCompare,
  Network,
  SearchCheck,
  FileText,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ComparisonDetailPage() {
  const params = useParams();
  const comparisonId = params?.id as string;

  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "graph" | "root-causes">("matrix");

  const loadData = useCallback(async () => {
    if (!comparisonId) return;
    setLoading(true);
    setError(null);
    try {
      const [fetchedComp, fetchedCauses] = await Promise.all([
        fetchComparisonById(comparisonId),
        fetchRootCauses(comparisonId).catch(() => []),
      ]);

      if (!fetchedComp) {
        setError("Comparison not found or unauthorized.");
      } else {
        setComparison(fetchedComp);
        setRootCauses(fetchedCauses || []);
      }
    } catch (err: any) {
      console.error("Failed to load comparison details:", err);
      setError(err.message || "Failed to load comparison.");
    } finally {
      setLoading(false);
    }
  }, [comparisonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCE4EE] p-16 text-center text-slate-500 shadow-subtle space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0]" />
        <p className="text-sm font-medium">Loading contrast analysis & variables...</p>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center shadow-subtle space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-[#101827]">Comparison Not Available</h2>
          <p className="text-sm text-slate-600 mt-1">
            {error || "The requested comparison could not be loaded."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Retry
          </button>
          <Link
            href="/comparisons"
            className="px-4 py-2 bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Back to Comparisons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link href="/comparisons" className="hover:text-slate-600 transition-colors">
            Comparisons
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#36C9C0]">{comparison.title}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
              {comparison.title}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64748B] mt-1">
              <span>Project: <strong className="text-slate-700">{comparison.projectName}</strong></span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(comparison.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh comparison"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href={`/reports/${comparison.id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>View Synthesis Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#DCE4EE] pb-2">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "matrix"
              ? "bg-[#101827] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Side-by-Side Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab("graph")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "graph"
              ? "bg-[#101827] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Dependency Graph</span>
        </button>

        <button
          onClick={() => setActiveTab("root-causes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "root-causes"
              ? "bg-[#101827] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <SearchCheck className="w-4 h-4" />
          <span>Candidate Explanations ({rootCauses.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "matrix" && (
        <ExperimentComparison comparison={comparison} />
      )}

      {activeTab === "graph" && (
        <ExperimentGraph comparison={comparison} />
      )}

      {activeTab === "root-causes" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">
              Methodological Attribution Engine
            </span>
            Ranked candidate explanations for the observed discrepancy between {comparison.paperA.paperTitle} and {comparison.paperB.paperTitle}. Inferences are partitioned into verifiable observed differences versus literature-derived plausible hypotheses.
          </div>

          {rootCauses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCE4EE] p-8 text-center text-slate-500 shadow-subtle">
              <SearchCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-[#101827]">No candidate root causes identified</p>
              <p className="text-xs text-slate-500 mt-1">
                The analysis engine has not detected divergent factors requiring attribution between these experiments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rootCauses.map((cause) => (
                <RootCauseCard key={cause.id} cause={cause} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
