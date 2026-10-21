"use client";

import React, { useState, useEffect } from "react";
import { Comparison, EvidenceQuote } from "@/types";
import { fetchGraph } from "@/lib/api-client";
import {
  Layers,
  Database,
  Split,
  Sliders,
  Cpu,
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Maximize2,
  RefreshCw,
  Info,
  Network,
  ShieldAlert,
} from "lucide-react";
import { EvidenceViewer } from "../evidence-viewer/EvidenceViewer";

interface ExperimentGraphProps {
  comparison: Comparison;
}

interface GraphNode {
  id: string;
  stage: string;
  label: string;
  icon: any;
  status: "match" | "conflict";
  valA: string;
  valB: string;
  evidenceA?: EvidenceQuote;
  evidenceB?: EvidenceQuote;
  divergenceNotes?: string;
}

export const ExperimentGraph: React.FC<ExperimentGraphProps> = ({ comparison }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<{
    quote: EvidenceQuote;
    label: string;
    value: string;
  } | null>(null);
  const [backendGraph, setBackendGraph] = useState<{
    nodes: any[];
    edges: any[];
    causation_proven: boolean;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchGraph(comparison.id).then((g) => {
      if (isMounted && g && g.nodes && g.nodes.length > 0) {
        setBackendGraph(g);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [comparison.id]);

  // Synthesize pipeline stages dynamically from the active comparison
  const isSquad = comparison.id === "comp-squad-qa";
  const isBert = comparison.id === "comp-bert-roberta";

  const preprocessAttr = comparison.attributes.find((a) => a.key === "preprocessing");
  const lrAttr = comparison.attributes.find((a) => a.key === "learningRate");
  const splitAttr = comparison.attributes.find((a) => a.key === "dataSplit");
  const modelAttr = comparison.attributes.find((a) => a.key === "modelArchitecture");

  const pipelineNodes: GraphNode[] = [
    {
      id: "node-dataset",
      stage: "Stage 1: Benchmark Dataset",
      label: "Dataset & Distribution",
      icon: Database,
      status: comparison.paperA.dataset.toLowerCase() === comparison.paperB.dataset.toLowerCase() ? "match" : "conflict",
      valA: comparison.paperA.dataset,
      valB: comparison.paperB.dataset,
      divergenceNotes: `Both studies evaluate across ${comparison.paperA.dataset} target task distribution.`,
    },
    {
      id: "node-split",
      stage: "Stage 2: Split & Filtering Protocol",
      label: isSquad ? "Length Filtering Protocol" : "Data Splits",
      icon: Split,
      status: splitAttr?.isDifferent ? "conflict" : "match",
      valA: comparison.paperA.dataSplit,
      valB: comparison.paperB.dataSplit,
      evidenceA: splitAttr?.evidenceA,
      evidenceB: splitAttr?.evidenceB,
      divergenceNotes: splitAttr?.isDifferent
        ? `Methodological divergence: "${comparison.paperA.dataSplit}" vs "${comparison.paperB.dataSplit}".`
        : `Equivalent evaluation split protocol preserved in both experimental pipelines (${comparison.paperA.dataSplit}).`,
    },
    {
      id: "node-preprocess",
      stage: "Stage 3: Data Preprocessing",
      label: isBert ? "Tokenization & Seq Length" : isSquad ? "Text Filtering Criteria" : "Augmentation & Transforms",
      icon: Layers,
      status: preprocessAttr?.isDifferent ? "conflict" : "match",
      valA: comparison.paperA.preprocessing,
      valB: comparison.paperB.preprocessing,
      evidenceA: preprocessAttr?.evidenceA,
      evidenceB: preprocessAttr?.evidenceB,
      divergenceNotes: preprocessAttr?.isDifferent
        ? `Candidate explanatory divergence: "${comparison.paperA.preprocessing}" vs "${comparison.paperB.preprocessing}".`
        : "Equivalent data preprocessing transformations applied across both runs.",
    },
    {
      id: "node-model",
      stage: "Stage 4: Model Backbone",
      label: "Architecture & Parameters",
      icon: Cpu,
      status: modelAttr?.isDifferent ? "conflict" : "match",
      valA: comparison.paperA.modelArchitecture,
      valB: comparison.paperB.modelArchitecture,
      divergenceNotes: modelAttr?.isDifferent
        ? `Model architecture difference: ${comparison.paperA.modelArchitecture} vs ${comparison.paperB.modelArchitecture}.`
        : `Identical backbone architecture used in both studies (${comparison.paperA.modelArchitecture}).`,
    },
    {
      id: "node-hparams",
      stage: "Stage 5: Optimization Recipe",
      label: "Hyperparameters & Optimizer",
      icon: Sliders,
      status: lrAttr?.isDifferent ? "conflict" : "match",
      valA: `${comparison.paperA.hyperparameters.optimizer}, lr=${comparison.paperA.hyperparameters.learningRate}`,
      valB: `${comparison.paperB.hyperparameters.optimizer}, lr=${comparison.paperB.hyperparameters.learningRate}`,
      evidenceA: lrAttr?.evidenceA,
      evidenceB: lrAttr?.evidenceB,
      divergenceNotes: lrAttr?.isDifferent
        ? `Hyperparameter difference: lr=${comparison.paperA.hyperparameters.learningRate} vs lr=${comparison.paperB.hyperparameters.learningRate} (${comparison.paperB.hyperparameters.optimizer}).`
        : "Consistent optimization parameters used in fine-tuning.",
    },
    {
      id: "node-results",
      stage: "Stage 6: Reported Outcomes",
      label: "Final Benchmark Result",
      icon: Award,
      status: "conflict",
      valA: `${comparison.paperA.evaluationMetrics.primaryMetric}: ${comparison.paperA.evaluationMetrics.primaryValue}`,
      valB: `${comparison.paperB.evaluationMetrics.primaryMetric}: ${comparison.paperB.evaluationMetrics.primaryValue}`,
      divergenceNotes: `Empirical discrepancy: ${comparison.paperA.evaluationMetrics.primaryValue} vs ${comparison.paperB.evaluationMetrics.primaryValue} on ${comparison.paperA.dataset}.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Legend & Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE4EE] shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <span className="text-slate-500 font-bold uppercase tracking-wider">Node Legend:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aligned Node
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Divergent Node
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Causation Not Proven
          </span>
          {backendGraph && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-[#1a857f] border border-teal-200 font-mono text-[11px]">
              <Network className="w-3.5 h-3.5" />
              DAG: {backendGraph.nodes.length} nodes • {backendGraph.edges.length} edges
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Reset view"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph Flow Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Flow Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE4EE] shadow-subtle space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#101827]">
                Experiment Pipeline Dependency Graph
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Sequential dependency trace from Raw Data → Model Training → Evaluation
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              DAG Flow
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {pipelineNodes.map((node, index) => {
              const Icon = node.icon;
              const isConflict = node.status === "conflict";
              const isSelected = selectedNode?.id === node.id;

              return (
                <div key={node.id} className="relative">
                  {/* Vertical connecting line */}
                  {index < pipelineNodes.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 bottom-0 w-0.5 -mb-4 z-0 ${
                        isConflict ? "bg-rose-300" : "bg-emerald-300"
                      }`}
                    />
                  )}

                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`relative z-10 p-4 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? "ring-2 ring-[#36C9C0] border-[#36C9C0] shadow-md bg-teal-50/20"
                        : isConflict
                        ? "bg-rose-50/40 border-rose-200 hover:bg-rose-50/70"
                        : "bg-emerald-50/20 border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                  >
                    {/* Node Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-xs ${
                        isConflict
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Node Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {node.stage}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isConflict
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isConflict ? "Divergent Factor" : "Aligned"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#101827]">{node.label}</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-white/80 p-2 rounded-lg border border-slate-200/80 truncate">
                          <span className="text-slate-400 block text-[10px] font-semibold">
                            Paper A ({comparison.paperA.authors.split(" ")[0]}):
                          </span>
                          <span className="font-mono text-slate-800 text-[11px] font-medium">
                            {node.valA}
                          </span>
                        </div>
                        <div
                          className={`p-2 rounded-lg border truncate ${
                            isConflict
                              ? "bg-rose-50 border-rose-200 text-rose-900 font-semibold"
                              : "bg-white/80 border-slate-200/80 text-slate-800"
                          }`}
                        >
                          <span className="text-slate-400 block text-[10px] font-semibold">
                            Paper B ({comparison.paperB.authors.split(" ")[0]}):
                          </span>
                          <span className="font-mono text-[11px] font-medium">{node.valB}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Inspection Panel */}
        <div className="bg-white rounded-2xl p-6 border border-[#DCE4EE] shadow-subtle flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101827] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#36C9C0]" /> Node Inspector
              </h3>
              {selectedNode && (
                <span className="text-[11px] font-mono text-slate-400">{selectedNode.id}</span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {selectedNode.stage}
                  </span>
                  <h4 className="text-base font-bold text-[#101827]">{selectedNode.label}</h4>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-700 block">Divergence Diagnosis:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedNode.divergenceNotes}</p>
                </div>

                {/* Evidence Links */}
                {(selectedNode.evidenceA || selectedNode.evidenceB) && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">Source Evidence:</span>
                    {selectedNode.evidenceA && (
                      <button
                        onClick={() =>
                          setActiveEvidence({
                            quote: selectedNode.evidenceA!,
                            label: `${selectedNode.label} (Paper A)`,
                            value: selectedNode.valA,
                          })
                        }
                        className="w-full text-left p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-[#1a857f] hover:bg-teal-100/70 transition-colors flex items-center justify-between group"
                      >
                        <span className="font-semibold">Paper A Evidence (p.{selectedNode.evidenceA.pageNumber})</span>
                        <FileSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    {selectedNode.evidenceB && (
                      <button
                        onClick={() =>
                          setActiveEvidence({
                            quote: selectedNode.evidenceB!,
                            label: `${selectedNode.label} (Paper B)`,
                            value: selectedNode.valB,
                          })
                        }
                        className="w-full text-left p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-[#1a857f] hover:bg-teal-100/70 transition-colors flex items-center justify-between group"
                      >
                        <span className="font-semibold">Paper B Evidence (p.{selectedNode.evidenceB.pageNumber})</span>
                        <FileSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Click any stage in the pipeline flow to view attribute breakdown and textual grounding.</p>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#101827] text-white text-xs space-y-1">
            <span className="font-bold text-[#36C9C0] block">Graph Analysis Summary</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Divergence originates primarily in Stage 3 (Preprocessing) and compounds into Stage 5 (Optimization).
            </p>
          </div>
        </div>
      </div>

      {/* Evidence Viewer Drawer */}
      <EvidenceViewer
        isOpen={Boolean(activeEvidence)}
        onClose={() => setActiveEvidence(null)}
        evidence={activeEvidence?.quote || null}
        attributeLabel={activeEvidence?.label}
        attributeValue={activeEvidence?.value}
      />
    </div>
  );
};
