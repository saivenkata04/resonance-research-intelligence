from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EvidenceQuoteResponse(BaseModel):
    id: str
    paper_id: str
    section_id: Optional[str] = None
    page_number: int
    exact_quote: str
    char_start: Optional[int] = None
    char_end: Optional[int] = None
    extraction_method: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True


class PaperSectionResponse(BaseModel):
    id: str
    section_name: str
    page_number: int
    order_index: int
    raw_text: str

    class Config:
        from_attributes = True


class PaperBase(BaseModel):
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    venue: Optional[str] = None
    abstract: Optional[str] = None


class PaperCreate(PaperBase):
    project_id: str


class PaperResponse(PaperBase):
    id: str
    project_id: str
    uploaded_by_id: Optional[str] = None
    file_size_bytes: int
    page_count: int
    checksum_sha256: str
    status: str
    ocr_required: bool
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaperDetailResponse(PaperResponse):
    sections: List[PaperSectionResponse] = Field(default_factory=list)
    evidence_quotes: List[EvidenceQuoteResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
