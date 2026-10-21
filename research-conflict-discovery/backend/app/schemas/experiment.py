from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ReportedResultBase(BaseModel):
    metric_raw_name: str
    metric_normalized_name: str
    raw_value_str: str
    normalized_numeric_value: float
    unit: str = "percent"
    direction: str = "higher_is_better"
    evaluation_split: str = "test"
    uncertainty_raw: Optional[str] = None
    uncertainty_numeric: Optional[float] = None
    evidence_quote_id: Optional[str] = None


class ReportedResultResponse(ReportedResultBase):
    id: str
    experiment_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExperimentBase(BaseModel):
    name: str = "Default Experiment"
    task: Optional[str] = None
    dataset_name: Optional[str] = None
    dataset_normalized: Optional[str] = None
    dataset_version: Optional[str] = None
    dataset_distribution: Optional[str] = None
    train_split: Optional[str] = None
    val_split: Optional[str] = None
    test_split: Optional[str] = None
    preprocessing: Optional[str] = None
    augmentation: Optional[str] = None
    model_architecture: Optional[str] = None
    model_normalized: Optional[str] = None
    model_version: Optional[str] = None
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)
    training_protocol: Dict[str, Any] = Field(default_factory=dict)
    evaluation_protocol: Dict[str, Any] = Field(default_factory=dict)
    limitations: Optional[str] = None


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    task: Optional[str] = None
    dataset_name: Optional[str] = None
    dataset_normalized: Optional[str] = None
    dataset_version: Optional[str] = None
    dataset_distribution: Optional[str] = None
    train_split: Optional[str] = None
    val_split: Optional[str] = None
    test_split: Optional[str] = None
    preprocessing: Optional[str] = None
    augmentation: Optional[str] = None
    model_architecture: Optional[str] = None
    model_normalized: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    training_protocol: Optional[Dict[str, Any]] = None
    evaluation_protocol: Optional[Dict[str, Any]] = None
    limitations: Optional[str] = None


from app.schemas.paper import PaperResponse


class ExperimentResponse(ExperimentBase):
    id: str
    paper_id: str
    created_at: datetime
    updated_at: datetime
    results: List[ReportedResultResponse] = Field(default_factory=list)
    paper: Optional[PaperResponse] = None

    class Config:
        from_attributes = True
