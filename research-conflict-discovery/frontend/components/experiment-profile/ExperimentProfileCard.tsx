"use client";

import React from "react";
import { ExperimentProfile } from "@/types";
import { Database, Split, Layers, Cpu, Sliders, Award } from "lucide-react";

interface ExperimentProfileCardProps {
  profile: ExperimentProfile;
  variant?: "baseline" | "comparison";
}

export const ExperimentProfileCard: React.FC<ExperimentProfileCardProps> = ({
  profile,
  variant = "baseline",
}) => {
  const isBaseline = variant === "baseline";

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE4EE] shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isBaseline
              ? "bg-slate-100 text-slate-700"
              : "bg-teal-50 text-[#1a857f] border border-teal-200"
          }`}
        >
          {isBaseline ? "Baseline Experiment" : "Contrasting Experiment"}
        </span>
        <span className="text-xs font-bold text-slate-400">{profile.year}</span>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#101827] line-clamp-2">{profile.paperTitle}</h3>
        <p className="text-xs text-[#64748B] mt-0.5">{profile.authors}</p>
      </div>

      <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
        <div className="flex items-start gap-2">
          <Database className="w-3.5 h-3.5 text-[#36C9C0] mt-0.5 shrink-0" />
          <span className="text-slate-700">
            <strong className="text-slate-900">Dataset:</strong> {profile.dataset}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#36C9C0] mt-0.5 shrink-0" />
          <span className="text-slate-700">
            <strong className="text-slate-900">Backbone:</strong> {profile.modelArchitecture}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#36C9C0] mt-0.5 shrink-0" />
          <span className="text-slate-700">
            <strong className="text-slate-900">Config:</strong> {profile.hyperparameters.optimizer}, lr={profile.hyperparameters.learningRate}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Award className="w-3.5 h-3.5 text-[#36C9C0] mt-0.5 shrink-0" />
          <span className="text-slate-700">
            <strong className="text-slate-900">Outcome:</strong> {profile.evaluationMetrics.primaryMetric}: {profile.evaluationMetrics.primaryValue}
          </span>
        </div>
      </div>
    </div>
  );
};
