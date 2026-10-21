"use client";

import React from "react";
import { BookOpen, AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface StatCardProps {
  type: "papers" | "conflicts";
  count: number;
  label: string;
  sublabel: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  type,
  count,
  label,
  sublabel,
  trend,
}) => {
  const isPapers = type === "papers";

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DCE4EE] shadow-subtle hover:shadow-card transition-shadow duration-150 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-[#64748B]">{label}</span>
        
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            isPapers
              ? "bg-[#36C9C0]/15 text-[#249e97]"
              : "bg-[#F59E0B]/15 text-[#D97706]"
          }`}
        >
          {isPapers ? (
            <BookOpen className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#101827] tracking-tight">
            {count}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPapers
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs text-[#64748B] font-medium">{sublabel}</p>
      </div>
    </div>
  );
};
