"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ReportData } from "@/types";
import { fetchReport } from "@/lib/api-client";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const rep = await fetchReport(id);
      if (!rep) {
        setError("Report not found or unauthorized.");
      } else {
        setReport(rep);
      }
    } catch (err: any) {
      console.error("Failed to load report:", err);
      setError(err.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCE4EE] p-16 text-center text-slate-500 shadow-subtle space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#36C9C0]" />
        <p className="text-sm font-medium">Loading research synthesis report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center shadow-subtle space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-[#101827]">Report Not Found</h2>
          <p className="text-sm text-slate-600 mt-1">
            {error || "The requested research report could not be accessed."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/reports"
            className="px-4 py-2 bg-[#3B6FD8] hover:bg-[#2F5CB8] text-white text-xs font-semibold rounded-xl transition-colors inline-block"
          >
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="space-y-1 print:hidden">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link href="/reports" className="hover:text-slate-600 transition-colors">
            Reports
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#36C9C0]">{report.id}</span>
        </div>
      </div>

      <ReportPreview report={report} />
    </div>
  );
}
