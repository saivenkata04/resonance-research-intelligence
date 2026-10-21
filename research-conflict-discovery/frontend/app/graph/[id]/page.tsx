"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Comparison } from "@/types";
import { fetchComparisonById } from "@/lib/api-client";
import { ExperimentGraph } from "@/components/dependency-graph/ExperimentGraph";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ExperimentGraphDetailPage() {
  const params = useParams();
  const graphId = params?.id as string;

  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(async () => {
    if (!graphId) return;
    setLoading(true);
    setError(null);
    try {
      const comp = await fetchComparisonById(graphId);
      if (!comp) {
        setError("Comparison not found or unauthorized.");
      } else {
        setComparison(comp);
      }
    } catch (err: any) {
      console.error("Failed to load graph comparison:", err);
      setError(err.message || "Failed to load dependency graph.");
    } finally {
      setLoading(false);
    }
  }, [graphId]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCE4EE] p-16 text-center text-slate-500 shadow-subtle space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0]" />
        <p className="text-sm font-medium">Loading pipeline dependency graph...</p>
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
          <h2 className="text-lg font-bold text-[#101827]">Graph Not Available</h2>
          <p className="text-sm text-slate-600 mt-1">
            {error || "The requested experiment graph could not be loaded."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={loadComparison}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Retry
          </button>
          <Link
            href="/graph"
            className="px-4 py-2 bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Back to Graphs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link href="/graph" className="hover:text-slate-600 transition-colors">
            Experiment Graph
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#36C9C0]">{comparison.title}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
          Pipeline Dependency Graph
        </h1>
        <p className="text-sm text-[#64748B]">
          Tracing divergent experimental choices for {comparison.title}.
        </p>
      </div>

      <ExperimentGraph comparison={comparison} />
    </div>
  );
}
