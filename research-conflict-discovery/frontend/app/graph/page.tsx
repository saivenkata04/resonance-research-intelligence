"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Comparison } from "@/types";
import { fetchComparisons } from "@/lib/api-client";
import { ExperimentGraph } from "@/components/dependency-graph/ExperimentGraph";
import { ChevronRight, Network, Loader2, GitCompare, AlertCircle, RefreshCw } from "lucide-react";

export default function ExperimentGraphPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparisons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await fetchComparisons();
      setComparisons(loaded);
      if (loaded.length > 0) {
        setSelectedComparisonId(loaded[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch comparisons for graph:", err);
      setError(err.message || "Failed to load comparisons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComparisons();
  }, [loadComparisons]);

  const activeComparison = comparisons.find((c) => c.id === selectedComparisonId) || comparisons[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span>Intelligence Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[#36C9C0]">Experiment Graph</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
            Experiment Dependency Graph
          </h1>
          <p className="text-sm text-[#64748B]">
            Interactive topological DAG highlighting divergent paths and pipeline confounders.
          </p>
        </div>

        {comparisons.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Pipeline:</span>
            <select
              value={selectedComparisonId}
              onChange={(e) => setSelectedComparisonId(e.target.value)}
              className="bg-white border border-[#DCE4EE] rounded-xl px-3 py-2 text-xs font-semibold text-[#101827] focus:outline-none focus:border-[#36C9C0]"
            >
              {comparisons.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.title}
                </option>
              ))}
            </select>
            <button
              onClick={loadComparisons}
              title="Refresh"
              className="p-2 bg-white border border-[#DCE4EE] rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#36C9C0]" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between text-sm text-red-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium">{error}</p>
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
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-16 text-center text-slate-500 shadow-subtle">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0] mb-2" />
          <p className="text-sm font-medium">Loading experiment graphs...</p>
        </div>
      ) : comparisons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-12 text-center shadow-subtle space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Network className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101827]">
            No comparisons yet. Select your uploaded papers to create your first comparison.
          </h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Experiment dependency graphs visualize the topology and variable divergence of comparative analyses.
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
      ) : activeComparison ? (
        <ExperimentGraph comparison={activeComparison} />
      ) : null}
    </div>
  );
}
