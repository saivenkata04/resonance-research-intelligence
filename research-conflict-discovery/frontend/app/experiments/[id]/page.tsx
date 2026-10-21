"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExperimentProfile } from "@/types";
import { fetchComparisons } from "@/lib/api-client";
import { ChevronRight, Database, Sliders, BarChart3, Award, FileText, Loader2, AlertCircle } from "lucide-react";

export default function ExperimentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [exp, setExp] = useState<ExperimentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const comps = await fetchComparisons();
        for (const c of comps) {
          if (c.paperA.id === id || c.paperA.paperId === id) {
            if (isMounted) {
              setExp(c.paperA);
              setLoading(false);
              return;
            }
          }
          if (c.paperB.id === id || c.paperB.paperId === id) {
            if (isMounted) {
              setExp(c.paperB);
              setLoading(false);
              return;
            }
          }
        }
        if (isMounted) {
          setError("Experiment profile not found in your comparative workspace.");
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load experiment profile.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCE4EE] p-16 text-center text-slate-500 shadow-subtle space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0]" />
        <p className="text-sm font-medium">Loading experiment profile attributes...</p>
      </div>
    );
  }

  if (error || !exp) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center shadow-subtle space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-[#101827]">Experiment Not Found</h2>
          <p className="text-sm text-slate-600 mt-1">
            {error || "The requested experiment profile could not be loaded."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/papers"
            className="px-4 py-2 bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-xs font-semibold rounded-xl transition-colors inline-block"
          >
            Back to Paper Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Breadcrumb */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link href="/papers" className="hover:text-slate-600 transition-colors">
            Paper Library
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#36C9C0]">{exp.paperTitle || exp.id}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
          Experiment Profile: {exp.modelArchitecture}
        </h1>
        <p className="text-sm text-[#64748B]">
          Normalized experimental configuration extracted from {exp.paperTitle}.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset & Splits */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4EE] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#101827]">
            <Database className="w-4 h-4 text-[#36C9C0]" />
            <span>Dataset & Split Protocol</span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Dataset</span>
              <span className="font-semibold text-slate-800 text-sm">{exp.dataset}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Split Protocol</span>
              <span className="font-semibold text-slate-800 text-sm">{exp.dataSplit}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Preprocessing & Filtering</span>
              <p className="font-mono text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                {exp.preprocessing}
              </p>
            </div>
          </div>
        </div>

        {/* Model & Hyperparameters */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCE4EE] shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#101827]">
            <Sliders className="w-4 h-4 text-[#36C9C0]" />
            <span>Optimization & Hyperparameters</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Learning Rate</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                {exp.hyperparameters.learningRate}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Optimizer</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                {exp.hyperparameters.optimizer}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Batch Size</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                {exp.hyperparameters.batchSize}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Epochs / Steps</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                {exp.hyperparameters.epochsOrSteps}
              </span>
            </div>
          </div>
        </div>

        {/* Reported Results */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#DCE4EE] shadow-subtle space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#101827]">
            <Award className="w-4 h-4 text-[#36C9C0]" />
            <span>Reported Benchmark Metric</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium">{exp.evaluationMetrics.primaryMetric}</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono">{exp.evaluationMetrics.primaryValue}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Extracted Benchmark
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
