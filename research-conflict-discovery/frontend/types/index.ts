export interface EvidenceQuote {
  id: string;
  paperId: string;
  paperTitle: string;
  pageNumber: number;
  section: string;
  quote: string;
  confidence: number;
  highlightedTerms?: string[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  status: "ready" | "processing" | "warning" | "error";
  experimentCount: number;
  extractedAt: string;
  pdfUrl?: string;
  abstract?: string;
  warningDetails?: string;
}

export interface ExperimentProfile {
  id: string;
  paperId: string;
  paperTitle: string;
  authors: string;
  year: number;
  dataset: string;
  dataSplit: string;
  preprocessing: string;
  modelArchitecture: string;
  hyperparameters: {
    learningRate: string;
    batchSize: string;
    optimizer: string;
    epochsOrSteps: string;
    weightDecay?: string;
    warmup?: string;
  };
  evaluationMetrics: {
    primaryMetric: string;
    primaryValue: string;
    secondaryMetric?: string;
    secondaryValue?: string;
  };
  reportedResults: string;
}

export interface ComparisonAttribute {
  key: string;
  label: string;
  category: "data" | "pipeline" | "model" | "optimization" | "evaluation";
  valueA: string;
  valueB: string;
  isDifferent: boolean;
  isMissingA?: boolean;
  isMissingB?: boolean;
  evidenceA?: EvidenceQuote;
  evidenceB?: EvidenceQuote;
  impactScore: "High" | "Medium" | "Low";
}

export interface Comparison {
  id: string;
  title: string;
  projectName: string;
  createdAt: string;
  status: "completed" | "analyzing" | "needs_review";
  comparability: "comparable" | "partially-comparable" | "not-comparable";
  paperA: ExperimentProfile;
  paperB: ExperimentProfile;
  attributes: ComparisonAttribute[];
  conflictCount: number;
}

export interface RootCause {
  id: string;
  rank: number;
  title: string;
  category:
    | "Preprocessing Variation"
    | "Dataset Distribution"
    | "Hyperparameter Mismatch"
    | "Evaluation Protocol"
    | "Model Architecture";
  confidenceScore: number; // 0 - 100
  hypothesisType: "Observed Fact" | "Plausible Hypothesis";
  explanation: string;
  supportingQuotes: EvidenceQuote[];
  contradictoryQuotes: EvidenceQuote[];
  impactFactors: string[];
}

export interface GraphNodeData {
  id: string;
  label: string;
  category: "dataset" | "split" | "preprocessing" | "model" | "hyperparameters" | "metrics" | "results";
  paperSource: "both" | "paperA" | "paperB";
  status: "match" | "conflict" | "divergent";
  valA?: string;
  valB?: string;
  evidenceA?: EvidenceQuote;
  evidenceB?: EvidenceQuote;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  isDivergent?: boolean;
}

export interface ReportData {
  id: string;
  comparisonId: string;
  title: string;
  project: string;
  generatedDate: string;
  paperA: { title: string; authors: string; year: number };
  paperB: { title: string; authors: string; year: number };
  executiveSummary: string;
  comparabilityVerdict: string;
  identifiedConflicts: ComparisonAttribute[];
  rankedCauses: RootCause[];
  limitations: string[];
  recommendations: string[];
}
