"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnalysisHero } from "@/components/dashboard/AnalysisHero";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { PaperUploadModal } from "@/components/upload/PaperUploadModal";
import { fetchPapers, fetchComparisons } from "@/lib/api-client";
import { Paper, Comparison } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { ChevronRight, RefreshCw, AlertCircle, FileText, GitCompare } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [papersData, comparisonsData] = await Promise.all([
        fetchPapers(),
        fetchComparisons(),
      ]);
      setPapers(papersData);
      setComparisons(comparisonsData);
      setCurrentUser(getCurrentUser());
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      setError(err.message || "Failed to load dashboard intelligence data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalConflicts = comparisons.reduce(
    (acc, curr) => acc + (curr.conflictCount || 0),
    0
  );

  const handleUploadSuccess = (newPaper: Paper) => {
    setPapers((prev) => [newPaper, ...prev.filter((p) => p.id !== newPaper.id)]);
    setIsUploadOpen(false);
  };

  const displayName = currentUser?.name || currentUser?.email?.split("@")[0] || "Researcher";

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Breadcrumb & Welcome Heading */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <span>Intelligence Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#36C9C0]">Overview</span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Automated scientific extraction, comparability graphs, and conflict intelligence.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-[#DCE4EE] rounded-lg hover:bg-slate-50 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#36C9C0]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between text-sm text-red-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Unable to fetch dashboard metrics</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Action Hero Card */}
      <AnalysisHero onStartAnalysis={() => setIsUploadOpen(true)} />

      {/* Statistics Cards (Real user counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatCard
          type="papers"
          count={papers.length}
          label="Papers Analyzed"
          sublabel={
            papers.length === 0
              ? "No research papers uploaded yet"
              : `${papers.length} persistent document${papers.length === 1 ? "" : "s"} indexed`
          }
          trend={papers.length === 0 ? "Ready for upload" : "Persistent storage"}
        />

        <StatCard
          type="conflicts"
          count={totalConflicts}
          label="Conflicts Detected"
          sublabel={
            comparisons.length === 0
              ? "0 active cross-study comparisons"
              : `${totalConflicts} divergent factor${totalConflicts === 1 ? "" : "s"} across ${comparisons.length} comparison${comparisons.length === 1 ? "" : "s"}`
          }
          trend={comparisons.length === 0 ? "No active analyses" : `${comparisons.length} completed`}
        />
      </div>

      {/* Onboarding Empty State if Brand New User */}
      {!loading && papers.length === 0 && comparisons.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#DCE4EE] p-8 text-center shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#36C9C0]/10 border border-[#36C9C0]/20 flex items-center justify-center mx-auto text-[#36C9C0]">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#101827]">
              No research papers yet
            </h3>
            <p className="text-sm text-[#64748B] mt-1">
              Upload your first papers to start an analysis and uncover experimental conflicts.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] rounded-xl shadow-sm transition-all"
            >
              <span>Upload Your First PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Analyses Card */}
      <RecentAnalyses comparisons={comparisons} />

      {/* Upload Modal */}
      <PaperUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
