"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RootCause } from "@/types";
import { fetchComparisons, fetchRootCauses } from "@/lib/api-client";
import { RootCauseCard } from "@/components/root-cause/RootCauseCard";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";

export default function RootCauseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [cause, setCause] = useState<RootCause | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const comps = await fetchComparisons();
        for (const comp of comps) {
          const causes = await fetchRootCauses(comp.id);
          const match = causes.find((c) => c.id === id);
          if (match && isMounted) {
            setCause(match);
            setLoading(false);
            return;
          }
        }
        if (isMounted) {
          setError("Candidate explanation not found or inaccessible.");
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load candidate explanation.");
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
        <p className="text-sm font-medium">Loading candidate explanation detail...</p>
      </div>
    );
  }

  if (error || !cause) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center shadow-subtle space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-[#101827]">Explanation Not Found</h2>
          <p className="text-sm text-slate-600 mt-1">
            {error || "The requested root cause explanation could not be found."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/root-causes"
            className="px-4 py-2 bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-xs font-semibold rounded-xl transition-colors inline-block"
          >
            Back to Candidate Explanations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link href="/root-causes" className="hover:text-slate-600 transition-colors">
            Candidate Explanations
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#36C9C0]">#{cause.rank} {cause.title}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
          Candidate Explanation Detail
        </h1>
        <p className="text-sm text-[#64748B]">
          Methodological candidate attribution and supporting textual citations.
        </p>
      </div>

      <RootCauseCard cause={cause} />
    </div>
  );
}
