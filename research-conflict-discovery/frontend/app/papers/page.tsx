"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Paper } from "@/types";
import { useRouter } from "next/navigation";
import { fetchPapers, retryPaperExtraction, createComparison, deletePaper } from "@/lib/api-client";
import { PaperUploadModal } from "@/components/upload/PaperUploadModal";
import {
  Library,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  GitCompare,
  RotateCw,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PaperLibraryPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedPapers = await fetchPapers();
      setPapers(loadedPapers);
      if (loadedPapers.length >= 2) {
        setSelectedForCompare([loadedPapers[0].id, loadedPapers[1].id]);
      }
    } catch (err: any) {
      console.error("Failed to load papers:", err);
      setError(err.message || "Failed to load research papers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  const handleLaunchCompare = async () => {
    if (selectedForCompare.length < 2) return;
    setIsComparing(true);
    setActionError(null);
    try {
      const comp = await createComparison(
        undefined,
        undefined,
        selectedForCompare[0],
        selectedForCompare[1]
      );
      router.push(`/comparisons/${comp.id}`);
    } catch (err: any) {
      console.error("Failed to create comparison:", err);
      setActionError(err.message || "Failed to generate comparison for selected papers.");
      setIsComparing(false);
    }
  };

  const handleRetryExtraction = async (id: string) => {
    setRetryStatus(id);
    setActionError(null);
    try {
      const updated = await retryPaperExtraction(id);
      setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p)));
    } catch (err: any) {
      setActionError(err.message || "Failed to re-extract paper.");
    } finally {
      setRetryStatus(null);
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research document?")) return;
    try {
      await deletePaper(id);
      setPapers((prev) => prev.filter((p) => p.id !== id));
      setSelectedForCompare((prev) => prev.filter((item) => item !== id));
    } catch (err: any) {
      setActionError(err.message || "Failed to delete paper.");
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const filteredPapers = papers.filter((p) => {
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.venue && p.venue.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (paper: Paper) => {
    switch (paper.status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Extracted ({paper.experimentCount} exps)
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Extraction Ambiguity
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Ingesting
          </span>
        );
      case "error":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Parsing Failed
          </span>
        );
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
            <span className="text-[#36C9C0]">Paper Library</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
            Paper Library
          </h1>
          <p className="text-sm text-[#64748B]">
            Ingested scientific publications, extraction health, and normalized experimental attributes.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Paper</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between text-sm text-red-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium">{actionError}</p>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between text-sm text-red-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Unable to load research papers</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadPapers}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cross-Paper Comparison Bar (if 2 selected) */}
      {selectedForCompare.length === 2 && (
        <div className="bg-[#101827] text-white p-4 rounded-2xl border border-[#23334d] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-[#36C9C0] text-[#101827] flex items-center justify-center font-bold">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">2 Papers Selected for Contrast Analysis</span>
              <span className="text-slate-400 text-[11px]">
                Ready to align experimental pipelines and isolate confounding root causes.
              </span>
            </div>
          </div>

          <button
            onClick={handleLaunchCompare}
            disabled={isComparing}
            className="px-4 py-2 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-60"
          >
            {isComparing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Aligning Experiments...</span>
              </>
            ) : (
              <>
                <span>Launch Contrast Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE4EE] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by title, author, or venue..."
            className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#36C9C0]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
          {["all", "ready", "warning"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-[#101827] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#DCE4EE] shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0] mb-2" />
            <p className="text-sm font-medium">Loading research papers...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101827]">
              No research papers yet. Upload your first papers to start an analysis.
            </h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto">
              Extract scientific methodology, hyperparameters, datasets, and reported benchmarks from PDFs.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-sm font-semibold transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Paper PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#DCE4EE]">
            {filteredPapers.map((paper) => {
              const isSelected = selectedForCompare.includes(paper.id);

              return (
                <div
                  key={paper.id}
                  className={`p-5 sm:p-6 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isSelected ? "bg-teal-50/20" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(paper.id)}
                      className="mt-1 w-4 h-4 rounded text-[#36C9C0] focus:ring-[#36C9C0] border-slate-300 cursor-pointer"
                      title="Select to compare"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#101827] hover:text-[#249e97] transition-colors">
                          {paper.title}
                        </h3>
                        {getStatusBadge(paper)}
                      </div>

                      <p className="text-xs text-[#64748B]">
                        Authors: <span className="font-medium text-slate-700">{paper.authors.join(", ")}</span> •{" "}
                        <span className="font-semibold text-slate-800">{paper.year}</span> •{" "}
                        <span className="text-slate-500 italic">{paper.venue}</span>
                      </p>

                      {paper.warningDetails && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{paper.warningDetails}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center pl-7 lg:pl-0">
                    {paper.status === "warning" && (
                      <button
                        onClick={() => handleRetryExtraction(paper.id)}
                        disabled={retryStatus === paper.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center gap-1 transition-colors"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${retryStatus === paper.id ? "animate-spin" : ""}`} />
                        <span>{retryStatus === paper.id ? "Re-extracting..." : "Re-parse"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (selectedForCompare.length === 2 && isSelected) {
                          handleLaunchCompare();
                        } else {
                          handleToggleSelect(paper.id);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isSelected && selectedForCompare.length === 2
                          ? "bg-[#36C9C0] text-[#101827] hover:bg-[#2db4ac] font-bold shadow-sm"
                          : "bg-slate-100 hover:bg-[#36C9C0]/15 hover:text-[#1d7e79] text-[#101827]"
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>{isSelected && selectedForCompare.length === 2 ? "Compare Now" : "Select to Compare"}</span>
                    </button>

                    <button
                      onClick={() => handleDeletePaper(paper.id)}
                      title="Delete paper"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Comparison Action Bar */}
      {selectedForCompare.length === 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-[#101827] text-white p-3.5 sm:p-4 rounded-2xl border border-[#36C9C0]/50 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#36C9C0] text-[#101827] flex items-center justify-center font-bold shrink-0 shadow-md">
              <GitCompare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">
                2 Papers Selected for Contrast Analysis
              </p>
              <p className="text-slate-400 text-xs truncate">
                Align experimental protocols & detect confounding differences
              </p>
            </div>
          </div>

          <button
            onClick={handleLaunchCompare}
            disabled={isComparing}
            className="px-5 py-2.5 rounded-xl bg-[#36C9C0] hover:bg-[#2db4ac] text-[#101827] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isComparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <span>Compare Selected Papers</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <PaperUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newP) => setPapers((prev) => [newP, ...prev])}
      />
    </div>
  );
}
