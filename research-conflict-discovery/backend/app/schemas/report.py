from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    comparison_id: Optional[str] = None
    title: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    comparison_id: str
    title: str
    summary: str
    structured_content: Dict[str, Any] = Field(default_factory=dict)
    report_version: str
    generated_at: datetime

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: str
    job_type: str
    resource_id: str
    status: str
    progress_pct: int
    current_step: str
    error_details: Optional[str] = None
    retry_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
