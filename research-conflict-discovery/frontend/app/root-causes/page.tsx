"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Comparison, RootCause } from "@/types";
import { fetchComparisons, fetchRootCauses, reanalyzeRootCauses } from "@/lib/api-client";
import { RootCauseCard } from "@/components/root-cause/RootCauseCard";
import {
  SearchCheck,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  RotateCw,
  Loader2,
  AlertCircle,
  FileQuestion,
} from "lucide-react";

export default function RootCausesPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>("");
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCauses, setLoadingCauses] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedHypothesisType, setSelectedHypothesisType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "all",
    "Preprocessing Variation",
    "Dataset Distribution",
    "Hyperparameter Mismatch",
    "Evaluation Protocol",
    "Model Architecture",
  ];

  const loadComparisons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const comps = await fetchComparisons();
      setComparisons(comps);
      if (comps.length > 0) {
        setSelectedComparisonId(comps[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch comparisons:", err);
      setError(err.message || "Failed to load comparisons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComparisons();
  }, [loadComparisons]);

  useEffect(() => {
    if (!selectedComparisonId) {
      setRootCauses([]);
      return;
    }
    let isMounted = true;
    setLoadingCauses(true);
    fetchRootCauses(selectedComparisonId)
      .then((causes) => {
        if (isMounted) setRootCauses(causes || []);
      })
      .catch((err) => {
        console.error("Failed to fetch root causes:", err);
        if (isMounted) setRootCauses([]);
      })
      .finally(() => {
        if (isMounted) setLoadingCauses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedComparisonId]);

  const handleReanalyze = async () => {
    if (!selectedComparisonId) return;
    setIsReanalyzing(true);
    try {
      const updated = await reanalyzeRootCauses(selectedComparisonId);
      if (updated) {
        setRootCauses(updated);
      }
    } catch (err: any) {
      console.error("Reanalysis error:", err);
      alert(err.message || "Failed to re-run root cause engine.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const activeComparison = comparisons.find((c) => c.id === selectedComparisonId);

  const filteredCauses = rootCauses.filter((rc) => {
    if (selectedCategory !== "all" && rc.category !== selectedCategory) return false;
    if (selectedHypothesisType !== "all" && rc.hypothesisType !== selectedHypothesisType)
      return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span>Intelligence Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[#36C9C0]">Candidate Explanations</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
            Candidate Explanations
          </h1>
          <p className="text-sm text-[#64748B]">
            {activeComparison
              ? `Ranked candidate explanations and methodological factors for ${activeComparison.title}.`
              : "Ranked candidate explanations and methodological factors."}
          </p>
        </div>

        {/* Action Controls */}
        {comparisons.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing || !selectedComparisonId}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60"
              title="Re-execute ranking engine with updated weights"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isReanalyzing ? "animate-spin text-[#36C9C0]" : ""}`} />
              <span>{isReanalyzing ? "Evaluating..." : "Re-run Ranking Engine"}</span>
            </button>

            {/* Comparison Selector Dropdown */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500">Comparison:</span>
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
            </div>
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

      {/* Epistemological Distinction Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <h4 className="font-bold text-emerald-900">Observed Differences (Verified Facts)</h4>
            <p className="text-emerald-800 leading-relaxed">
              Attributes extracted with verbatim ground-truth citations from paper text and confirmed by study ablation protocols.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <h4 className="font-bold text-amber-900">Plausible Hypotheses (Unverified)</h4>
            <p className="text-amber-800 leading-relaxed">
              Potential confounding variables derived from secondary literature heuristics that require independent empirical validation.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {comparisons.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#DCE4EE] shadow-subtle flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#101827] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Type:</span>
            <select
              value={selectedHypothesisType}
              onChange={(e) => setSelectedHypothesisType(e.target.value)}
              className="bg-white border border-[#DCE4EE] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#36C9C0]"
            >
              <option value="all">All Explanations</option>
              <option value="Observed Fact">Observed Facts Only</option>
              <option value="Plausible Hypothesis">Plausible Hypotheses Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-16 text-center text-slate-500 shadow-subtle">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0] mb-2" />
          <p className="text-sm font-medium">Loading candidate explanations...</p>
        </div>
      ) : comparisons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-12 text-center shadow-subtle space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <SearchCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#101827]">
            No comparisons yet. Select your uploaded papers to create your first comparison.
          </h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Once a comparison is created, the deterministic scientific attribution engine will rank candidate root causes.
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
      ) : loadingCauses ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-12 text-center text-slate-500 shadow-subtle">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#36C9C0] mb-2" />
          <p className="text-xs">Evaluating methodological divergence...</p>
        </div>
      ) : filteredCauses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-12 text-center shadow-subtle space-y-2">
          <FileQuestion className="w-10 h-10 mx-auto text-amber-500" />
          <h3 className="text-base font-bold text-[#101827]">
            Insufficient Evidence State
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No candidate root causes with actionable evidence found matching the selected filter. Try re-running the ranking engine or choosing another comparison.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCauses.map((cause) => (
            <RootCauseCard key={cause.id} cause={cause} />
          ))}
        </div>
      )}
    </div>
  );
}
