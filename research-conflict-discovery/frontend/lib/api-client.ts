import {
  Paper,
  Comparison,
  RootCause,
  ReportData,
  ComparisonAttribute,
  EvidenceQuote,
  ExperimentProfile,
} from "@/types";
import { getAuthHeaders } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Normalizes backend factor categories into frontend UI labels
 */
function normalizeCategoryName(
  cat: string
):
  | "Preprocessing Variation"
  | "Dataset Distribution"
  | "Hyperparameter Mismatch"
  | "Evaluation Protocol"
  | "Model Architecture" {
  const lower = (cat || "").toLowerCase();
  if (lower.includes("dataset") || lower.includes("drift")) return "Dataset Distribution";
  if (lower.includes("prep") || lower.includes("filter")) return "Preprocessing Variation";
  if (lower.includes("param") || lower.includes("hyper") || lower.includes("rate"))
    return "Hyperparameter Mismatch";
  if (lower.includes("protocol") || lower.includes("eval") || lower.includes("metric"))
    return "Evaluation Protocol";
  if (lower.includes("model") || lower.includes("arch")) return "Model Architecture";
  return "Evaluation Protocol";
}

/**
 * Maps backend Comparison JSON into strongly typed frontend Comparison model
 */
export function mapBackendComparison(raw: any): Comparison {
  const expA = raw.experiment_a || {};
  const expB = raw.experiment_b || {};
  const paperA = expA.paper || {};
  const paperB = expB.paper || {};

  const paperAProfile: ExperimentProfile = {
    id: expA.id || raw.experiment_a_id || "exp-a",
    paperId: expA.paper_id || paperA.id || "paper-a",
    paperTitle: paperA.title || expA.name || "Experiment A",
    authors: Array.isArray(paperA.authors) && paperA.authors.length > 0
      ? paperA.authors.join(", ")
      : "Authors not specified",
    year: paperA.year || new Date().getFullYear(),
    dataset: expA.dataset_normalized || expA.dataset_name || "Not specified",
    dataSplit: expA.test_split || "Standard split",
    preprocessing: expA.preprocessing || "Not reported",
    modelArchitecture: expA.model_architecture || "Not reported",
    hyperparameters: {
      learningRate: expA.hyperparameters?.lr ? String(expA.hyperparameters.lr) : "Not reported",
      batchSize: expA.hyperparameters?.batch_size ? String(expA.hyperparameters.batch_size) : "Not reported",
      optimizer: expA.hyperparameters?.optimizer || "Not reported",
      epochsOrSteps: expA.hyperparameters?.epochs
        ? `${expA.hyperparameters.epochs} epochs`
        : "Not reported",
      weightDecay: expA.hyperparameters?.weight_decay ? String(expA.hyperparameters.weight_decay) : "Not reported",
      warmup: expA.hyperparameters?.warmup ? String(expA.hyperparameters.warmup) : "Not reported",
    },
    evaluationMetrics: {
      primaryMetric: expA.results?.[0]?.metric_normalized_name || "Metric",
      primaryValue: expA.results?.[0]?.normalized_numeric_value != null
        ? `${expA.results[0].normalized_numeric_value}${expA.results[0].unit || ""}`
        : "Not reported",
      secondaryMetric: expA.results?.[1]?.metric_normalized_name || "Secondary Metric",
      secondaryValue: expA.results?.[1]?.normalized_numeric_value != null
        ? `${expA.results[1].normalized_numeric_value}${expA.results[1].unit || ""}`
        : "Not reported",
    },
    reportedResults: expA.results?.[0]
      ? `${expA.results[0].metric_normalized_name}: ${expA.results[0].normalized_numeric_value}${expA.results[0].unit || ""}`
      : "Not reported",
  };

  const paperBProfile: ExperimentProfile = {
    id: expB.id || raw.experiment_b_id || "exp-b",
    paperId: expB.paper_id || paperB.id || "paper-b",
    paperTitle: paperB.title || expB.name || "Experiment B",
    authors: Array.isArray(paperB.authors) && paperB.authors.length > 0
      ? paperB.authors.join(", ")
      : "Authors not specified",
    year: paperB.year || new Date().getFullYear(),
    dataset: expB.dataset_normalized || expB.dataset_name || "Not specified",
    dataSplit: expB.test_split || "Standard split",
    preprocessing: expB.preprocessing || "Not reported",
    modelArchitecture: expB.model_architecture || "Not reported",
    hyperparameters: {
      learningRate: expB.hyperparameters?.lr ? String(expB.hyperparameters.lr) : "Not reported",
      batchSize: expB.hyperparameters?.batch_size ? String(expB.hyperparameters.batch_size) : "Not reported",
      optimizer: expB.hyperparameters?.optimizer || "Not reported",
      epochsOrSteps: expB.hyperparameters?.epochs
        ? `${expB.hyperparameters.epochs} epochs`
        : "Not reported",
      weightDecay: expB.hyperparameters?.weight_decay ? String(expB.hyperparameters.weight_decay) : "Not reported",
      warmup: expB.hyperparameters?.warmup ? String(expB.hyperparameters.warmup) : "Not reported",
    },
    evaluationMetrics: {
      primaryMetric: expB.results?.[0]?.metric_normalized_name || "Metric",
      primaryValue: expB.results?.[0]?.normalized_numeric_value != null
        ? `${expB.results[0].normalized_numeric_value}${expB.results[0].unit || ""}`
        : "Not reported",
      secondaryMetric: expB.results?.[1]?.metric_normalized_name || "Secondary Metric",
      secondaryValue: expB.results?.[1]?.normalized_numeric_value != null
        ? `${expB.results[1].normalized_numeric_value}${expB.results[1].unit || ""}`
        : "Not reported",
    },
    reportedResults: expB.results?.[0]
      ? `${expB.results[0].metric_normalized_name}: ${expB.results[0].normalized_numeric_value}${expB.results[0].unit || ""}`
      : "Not reported",
  };

  // Build attributes from backend differences if present, otherwise build from profiles
  let attributes: ComparisonAttribute[] = [];
  if (Array.isArray(raw.differences) && raw.differences.length > 0) {
    attributes = raw.differences.map((d: any) => ({
      key: d.attribute_name,
      label: d.attribute_name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      category: d.category || "pipeline",
      valueA: d.value_a ?? "Not reported",
      valueB: d.value_b ?? "Not reported",
      isDifferent: Boolean(d.is_divergent),
      impactScore: d.impact_score > 0.6 ? "High" : (d.impact_score > 0.3 ? "Medium" : "Low"),
    }));
  } else {
    attributes = [
      {
        key: "dataset",
        label: "Benchmark Dataset",
        category: "data",
        valueA: paperAProfile.dataset,
        valueB: paperBProfile.dataset,
        isDifferent: paperAProfile.dataset.toLowerCase() !== paperBProfile.dataset.toLowerCase(),
        impactScore: paperAProfile.dataset.toLowerCase() !== paperBProfile.dataset.toLowerCase() ? "High" : "Low",
      },
      {
        key: "dataSplit",
        label: "Data Split & Protocol",
        category: "data",
        valueA: paperAProfile.dataSplit,
        valueB: paperBProfile.dataSplit,
        isDifferent: paperAProfile.dataSplit.toLowerCase() !== paperBProfile.dataSplit.toLowerCase(),
        impactScore: paperAProfile.dataSplit.toLowerCase() !== paperBProfile.dataSplit.toLowerCase() ? "High" : "Low",
      },
      {
        key: "preprocessing",
        label: "Preprocessing & Filtering",
        category: "pipeline",
        valueA: paperAProfile.preprocessing,
        valueB: paperBProfile.preprocessing,
        isDifferent: paperAProfile.preprocessing.toLowerCase() !== paperBProfile.preprocessing.toLowerCase(),
        impactScore: paperAProfile.preprocessing.toLowerCase() !== paperBProfile.preprocessing.toLowerCase() ? "High" : "Low",
      },
      {
        key: "modelArchitecture",
        label: "Model Architecture",
        category: "model",
        valueA: paperAProfile.modelArchitecture,
        valueB: paperBProfile.modelArchitecture,
        isDifferent: paperAProfile.modelArchitecture.toLowerCase() !== paperBProfile.modelArchitecture.toLowerCase(),
        impactScore: paperAProfile.modelArchitecture.toLowerCase() !== paperBProfile.modelArchitecture.toLowerCase() ? "High" : "Low",
      },
      {
        key: "learningRate",
        label: "Learning Rate (LR)",
        category: "optimization",
        valueA: `lr=${paperAProfile.hyperparameters.learningRate}`,
        valueB: `lr=${paperBProfile.hyperparameters.learningRate}`,
        isDifferent: paperAProfile.hyperparameters.learningRate !== paperBProfile.hyperparameters.learningRate,
        impactScore: paperAProfile.hyperparameters.learningRate !== paperBProfile.hyperparameters.learningRate ? "Medium" : "Low",
      },
      {
        key: "primaryMetric",
        label: `Reported ${paperAProfile.evaluationMetrics.primaryMetric}`,
        category: "evaluation",
        valueA: paperAProfile.evaluationMetrics.primaryValue,
        valueB: paperBProfile.evaluationMetrics.primaryValue,
        isDifferent: paperAProfile.evaluationMetrics.primaryValue !== paperBProfile.evaluationMetrics.primaryValue,
        impactScore: "High",
      },
    ];
  }

  let compStatus: "comparable" | "partially-comparable" | "not-comparable" = "partially-comparable";
  if (raw.comparability_status === "comparable") compStatus = "comparable";
  else if (raw.comparability_status === "not_comparable") compStatus = "not-comparable";

  const title =
    paperA.title && paperB.title
      ? `${paperA.title.slice(0, 36)}... vs ${paperB.title.slice(0, 36)}...`
      : `${expA.name || "Study A"} vs ${expB.name || "Study B"}`;

  return {
    id: raw.id,
    title,
    projectName: raw.project_id || "Research Project",
    createdAt: raw.created_at || new Date().toISOString(),
    status: "completed",
    comparability: compStatus,
    paperA: paperAProfile,
    paperB: paperBProfile,
    attributes,
    conflictCount: Array.isArray(raw.conflicts) ? raw.conflicts.length : 0,
  };
}

/**
 * Maps backend root-cause candidate to frontend RootCause
 */
export function mapBackendRootCause(raw: any): RootCause {
  const category = normalizeCategoryName(raw.factor_category);
  const confidenceScore = Math.round((raw.plausibility_score || 0.5) * 100);

  const isObserved =
    raw.factor_category === "dataset_drift" ||
    raw.factor_category === "preprocessing" ||
    (raw.score_breakdown?.textual_confidence && raw.score_breakdown.textual_confidence > 0.8);

  const supportingQuotes: EvidenceQuote[] = Array.isArray(raw.supporting_evidence)
    ? raw.supporting_evidence.map((ev: any, idx: number) => ({
        id: ev.id || `ev-${idx}`,
        paperId: ev.paper_id || "",
        paperTitle: ev.paper_title || "Extracted Evidence",
        pageNumber: ev.page_number || 1,
        section: ev.section || "Methodology",
        quote: ev.text || "Direct excerpt from paper text.",
        confidence: ev.confidence || 0.9,
        highlightedTerms: ev.highlighted_terms || [],
      }))
    : [];

  return {
    id: raw.id,
    rank: raw.rank_order || 1,
    title: `Candidate: ${category}`,
    category,
    confidenceScore,
    hypothesisType: isObserved ? "Observed Fact" : "Plausible Hypothesis",
    explanation: raw.explanation || "Identified methodological variation between evaluation protocols.",
    supportingQuotes,
    contradictoryQuotes: [],
    impactFactors: [
      `Plausibility Score: ${confidenceScore}%`,
      "Non-causal correlation flag: Causation not proven",
      `Review status: ${raw.review_status || "unreviewed"}`,
    ],
  };
}

/**
 * Maps backend Report to frontend ReportData
 */
export function mapBackendReport(raw: any): ReportData {
  const content = raw.structured_content || {};
  const studies = content.studies || {};

  return {
    id: raw.id,
    comparisonId: raw.comparison_id,
    title: raw.title || "Cross-Paper Reproducibility & Conflict Report",
    project: raw.project_id || "Research Project",
    generatedDate: raw.generated_at || raw.created_at || new Date().toISOString(),
    paperA: {
      title: studies.study_a?.name || "Paper A",
      authors: studies.study_a?.authors || "Authors not specified",
      year: studies.study_a?.year || new Date().getFullYear(),
    },
    paperB: {
      title: studies.study_b?.name || "Paper B",
      authors: studies.study_b?.authors || "Authors not specified",
      year: studies.study_b?.year || new Date().getFullYear(),
    },
    executiveSummary:
      raw.summary ||
      content.executive_summary ||
      "Comparative analysis generated from extracted experiment profiles.",
    comparabilityVerdict:
      content.comparability_verdict ||
      `Comparability Status: ${content.comparability_status || "Evaluated"}`,
    identifiedConflicts: (content.conflicts || []).map((c: any) => ({
      key: c.key || "metric",
      label: c.label || "Divergence",
      category: c.category || "evaluation",
      valueA: c.value_a ?? "Not reported",
      valueB: c.value_b ?? "Not reported",
      isDifferent: true,
      impactScore: c.severity === "high" ? "High" : "Medium",
    })),
    rankedCauses: (content.root_causes || []).map((rc: any) => ({
      id: `rc-${rc.rank || 1}`,
      rank: rc.rank || 1,
      title: `Candidate: ${normalizeCategoryName(rc.category)}`,
      category: normalizeCategoryName(rc.category),
      confidenceScore: Math.round((rc.plausibility_score || 0.5) * 100),
      hypothesisType: rc.rank === 1 ? "Observed Fact" : "Plausible Hypothesis",
      explanation: rc.explanation || "",
      supportingQuotes: [],
      contradictoryQuotes: [],
      impactFactors: [`Heuristic Score: ${Math.round((rc.plausibility_score || 0.5) * 100)}%`],
    })),
    limitations: content.limitations || [
      "Observed correlation does not constitute definitive mathematical proof of causation.",
      "Controlled intervention rerun required to quantify isolated effect.",
    ],
    recommendations: content.recommendations || [
      "Standardize evaluation splits using uncurated test partitions across both research groups.",
    ],
  };
}

// ==========================================
// API CLIENT CALLS
// ==========================================

export async function fetchPapers(): Promise<Paper[]> {
  const res = await fetch(`${API_BASE_URL}/papers`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please sign in.");
    }
    throw new Error(`Failed to fetch papers: ${res.statusText}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map((p: any) => ({
      id: p.id,
      title: p.title,
      authors: Array.isArray(p.authors) && p.authors.length > 0 ? p.authors : ["Extracted Author"],
      year: p.year || new Date().getFullYear(),
      venue: p.venue || "Scientific Manuscript",
      status: p.status === "completed" ? "ready" : (p.status === "failed" ? "error" : "processing"),
      experimentCount: p.experiments?.length || 1,
      extractedAt: p.created_at || new Date().toISOString(),
      abstract: p.abstract || "Extracted scientific methodology, hyperparameters, and evaluation benchmarks.",
      warningDetails: p.error_message || undefined,
    }));
  }
  return [];
}

export async function uploadPaper(file: File, projectId?: string): Promise<Paper> {
  const formData = new FormData();
  formData.append("file", file);
  if (projectId) {
    formData.append("project_id", projectId);
  }

  const res = await fetch(`${API_BASE_URL}/papers/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload and parse scientific paper PDF.");
  }

  const p = await res.json();
  return {
    id: p.id,
    title: p.title,
    authors: Array.isArray(p.authors) && p.authors.length > 0 ? p.authors : ["Extracted Author"],
    year: p.year || new Date().getFullYear(),
    venue: p.venue || "Preprint Benchmark",
    status: p.status === "completed" ? "ready" : (p.status === "failed" ? "error" : "processing"),
    experimentCount: p.page_count ? Math.max(1, Math.floor(p.page_count / 3)) : 1,
    extractedAt: p.created_at || new Date().toISOString(),
    abstract: p.abstract || "Structured extraction completed with page and citation tracking.",
    warningDetails: p.error_message || undefined,
  };
}

export async function retryPaperExtraction(paperId: string): Promise<Paper> {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}/retry`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to retry paper extraction.");
  const p = await res.json();
  return {
    id: p.id,
    title: p.title,
    authors: Array.isArray(p.authors) ? p.authors : ["Extracted Author"],
    year: p.year || new Date().getFullYear(),
    venue: p.venue || "Scientific Manuscript",
    status: p.status === "completed" ? "ready" : "processing",
    experimentCount: 1,
    extractedAt: p.created_at || new Date().toISOString(),
  };
}

export async function deletePaper(paperId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete paper.");
}

export async function fetchComparisons(): Promise<Comparison[]> {
  const res = await fetch(`${API_BASE_URL}/comparisons`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Authentication required. Please sign in.");
    throw new Error(`Failed to fetch comparisons: ${res.statusText}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map(mapBackendComparison);
  }
  return [];
}

export async function fetchComparisonById(id: string): Promise<Comparison | null> {
  const res = await fetch(`${API_BASE_URL}/comparisons/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to load comparison.");
  }
  const data = await res.json();
  return mapBackendComparison(data);
}

export async function createComparison(
  experimentAId?: string,
  experimentBId?: string,
  paperAId?: string,
  paperBId?: string,
  projectId?: string
): Promise<Comparison> {
  const payload: any = {};
  if (projectId) payload.project_id = projectId;
  if (experimentAId) payload.experiment_a_id = experimentAId;
  if (experimentBId) payload.experiment_b_id = experimentBId;
  if (paperAId) payload.paper_a_id = paperAId;
  if (paperBId) payload.paper_b_id = paperBId;

  const res = await fetch(`${API_BASE_URL}/comparisons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create comparison.");
  }

  const data = await res.json();
  return mapBackendComparison(data);
}

export async function fetchGraph(
  comparisonId: string
): Promise<{ nodes: any[]; edges: any[]; causation_proven: boolean }> {
  const res = await fetch(`${API_BASE_URL}/comparisons/${comparisonId}/graph`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch experiment dependency graph.");
  }
  return await res.json();
}

export async function fetchRootCauses(comparisonId: string): Promise<RootCause[]> {
  const res = await fetch(`${API_BASE_URL}/root-causes/${comparisonId}/root-causes`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch root-cause findings.");
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map(mapBackendRootCause);
  }
  return [];
}

export async function reanalyzeRootCauses(comparisonId: string): Promise<RootCause[]> {
  const res = await fetch(`${API_BASE_URL}/root-causes/${comparisonId}/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to re-execute root-cause analysis.");
  const data = await res.json();
  return data.map(mapBackendRootCause);
}

export async function fetchReports(): Promise<ReportData[]> {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Authentication required.");
    throw new Error("Failed to fetch reports.");
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map(mapBackendReport);
  }
  return [];
}

export async function fetchReport(id: string): Promise<ReportData | null> {
  let res = await fetch(`${API_BASE_URL}/reports/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    res = await fetch(`${API_BASE_URL}/reports/by-comparison/${id}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
  }
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Report not found.");
  }
  const data = await res.json();
  return mapBackendReport(data);
}

export async function generateReport(
  comparisonId: string,
  title?: string
): Promise<ReportData> {
  const res = await fetch(`${API_BASE_URL}/reports/comparisons/${comparisonId}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ comparison_id: comparisonId, title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate synthesis report.");
  }
  const data = await res.json();
  return mapBackendReport(data);
}

export function getReportDownloadUrl(reportId: string): string {
  return `${API_BASE_URL}/reports/${reportId}/download`;
}

