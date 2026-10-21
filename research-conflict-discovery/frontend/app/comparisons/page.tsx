"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Comparison } from "@/types";
import { fetchComparisons } from "@/lib/api-client";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { GitCompare, ChevronRight, Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function ComparisonsPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparisons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComparisons();
      setComparisons(data);
    } catch (err: any) {
      console.error("Failed to load comparisons:", err);
      setError(err.message || "Failed to load comparisons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComparisons();
  }, [loadComparisons]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span>Intelligence Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[#36C9C0]">Comparisons</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
            Experiment Comparisons
          </h1>
          <p className="text-sm text-[#64748B]">
            Structured side-by-side matrices contrasting datasets, preprocessing, hyperparameters, and results.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadComparisons}
            disabled={loading}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-[#DCE4EE] rounded-xl hover:bg-slate-50 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#36C9C0]" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/papers"
            className="px-5 py-3 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Comparison</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between text-sm text-red-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Unable to fetch comparisons</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadComparisons}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-12 text-center text-slate-500 shadow-subtle">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0] mb-2" />
          <p className="text-sm font-medium">Loading experiment comparisons...</p>
        </div>
      ) : comparisons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-12 text-center shadow-subtle space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <GitCompare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101827]">
            No comparisons yet. Select your uploaded papers to create your first comparison.
          </h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Choose two uploaded research papers to align their variables, detect conflicts, and generate dependency graphs.
          </p>
          <div className="pt-2">
            <Link
              href="/papers"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-sm font-semibold transition-all shadow-sm"
            >
              <span>Go to Paper Library</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <RecentAnalyses comparisons={comparisons} />
      )}
    </div>
  );
}
