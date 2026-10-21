from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ConflictRecordResponse(BaseModel):
    id: str
    comparison_id: str
    metric_name: str
    val_a: float
    val_b: float
    abs_diff: float
    pct_points_diff: Optional[float] = None
    relative_pct_diff: Optional[float] = None
    direction_conflict: bool
    classification: str  # severe_conflict, moderate_conflict, within_variance, inconclusive
    rationale: str
    created_at: datetime

    class Config:
        from_attributes = True


class RootCauseCandidateResponse(BaseModel):
    id: str
    comparison_id: str
    rank_order: int
    factor_category: str
    explanation: str
    plausibility_score: float
    score_breakdown: Dict[str, Any] = Field(default_factory=dict)
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    contradictory_evidence_ids: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    is_reviewed: bool
    review_status: str
    reviewer_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ComparisonCreate(BaseModel):
    project_id: Optional[str] = None
    experiment_a_id: Optional[str] = None
    experiment_b_id: Optional[str] = None
    paper_a_id: Optional[str] = None
    paper_b_id: Optional[str] = None


from app.schemas.experiment import ExperimentResponse


class ComparisonResponse(BaseModel):
    id: str
    project_id: str
    experiment_a_id: str
    experiment_b_id: str
    comparability_status: str  # comparable, partially_comparable, not_comparable
    comparability_rationale: str
    attribute_differences: List[Dict[str, Any]] = Field(default_factory=list)
    analysis_version: str
    created_at: datetime
    experiment_a: Optional[ExperimentResponse] = None
    experiment_b: Optional[ExperimentResponse] = None
    conflicts: List[ConflictRecordResponse] = Field(default_factory=list)
    root_causes: List[RootCauseCandidateResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class GraphNode(BaseModel):
    id: str
    type: str  # paper, dataset, preprocessing, model, metric, result, root_cause
    label: str
    category: str  # shared, divergent, conflict, verified
    data: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    style: Optional[str] = None


class DependencyGraphResponse(BaseModel):
    comparison_id: Optional[str] = None
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    causation_proven: bool = False
