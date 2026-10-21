import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="researcher", nullable=False)  # admin, researcher, auditor
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    projects_owned = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="user")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    owner = relationship("User", back_populates="projects_owned")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="project", cascade="all, delete-orphan")
    comparisons = relationship("Comparison", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="member", nullable=False)  # owner, editor, viewer
    created_at = Column(DateTime, default=func.now(), nullable=False)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")

    __table_args__ = (
        Index("ix_project_user_unique", "project_id", "user_id", unique=True),
    )


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(500), nullable=False, default="Untitled Paper")
    authors = Column(JSON, default=list)  # list of author strings
    year = Column(Integer, nullable=True)
    venue = Column(String(255), nullable=True)
    abstract = Column(Text, nullable=True)
    
    file_path = Column(String(500), nullable=False)
    checksum_sha256 = Column(String(64), nullable=False, index=True)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    page_count = Column(Integer, nullable=False, default=0)
    
    status = Column(String(50), default="queued", nullable=False, index=True)  # queued, processing, completed, failed
    ocr_required = Column(Boolean, default=False, nullable=False)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    project = relationship("Project", back_populates="papers")
    sections = relationship("PaperSection", back_populates="paper", cascade="all, delete-orphan")
    evidence_quotes = relationship("EvidenceQuote", back_populates="paper", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="paper", cascade="all, delete-orphan")


class PaperSection(Base):
    __tablename__ = "paper_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    section_name = Column(String(255), nullable=False)  # Abstract, Introduction, Method, Experiments, etc.
    page_number = Column(Integer, nullable=False, default=1)
    order_index = Column(Integer, nullable=False, default=0)
    raw_text = Column(Text, nullable=False)
    char_start = Column(Integer, nullable=True)
    char_end = Column(Integer, nullable=True)

    paper = relationship("Paper", back_populates="sections")
    evidence_quotes = relationship("EvidenceQuote", back_populates="section")


class EvidenceQuote(Base):
    __tablename__ = "evidence_quotes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(String(36), ForeignKey("paper_sections.id", ondelete="SET NULL"), nullable=True)
    
    page_number = Column(Integer, nullable=False, default=1)
    exact_quote = Column(Text, nullable=False)
    char_start = Column(Integer, nullable=True)
    char_end = Column(Integer, nullable=True)
    extraction_method = Column(String(50), default="rule_regex", nullable=False)  # rule_regex, nlp_spacy, table_extractor
    confidence = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    paper = relationship("Paper", back_populates="evidence_quotes")
    section = relationship("PaperSection", back_populates="evidence_quotes")
    reported_results = relationship("ReportedResult", back_populates="evidence_quote")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False, default="Default Experiment")
    task = Column(String(255), nullable=True)  # e.g., Question Answering, Image Classification
    
    dataset_name = Column(String(255), nullable=True)
    dataset_normalized = Column(String(255), nullable=True, index=True)
    dataset_version = Column(String(100), nullable=True)
    dataset_distribution = Column(String(255), nullable=True)
    
    train_split = Column(String(100), nullable=True)
    val_split = Column(String(100), nullable=True)
    test_split = Column(String(100), nullable=True)
    
    preprocessing = Column(Text, nullable=True)
    augmentation = Column(Text, nullable=True)
    
    model_architecture = Column(String(255), nullable=True)
    model_normalized = Column(String(255), nullable=True, index=True)
    model_version = Column(String(100), nullable=True)
    
    hyperparameters = Column(JSON, default=dict)  # lr, batch_size, optimizer, epochs, seed
    training_protocol = Column(JSON, default=dict)  # hardware, loss_fn, early_stopping
    evaluation_protocol = Column(JSON, default=dict)  # metric_definition, zero_shot/few_shot
    
    limitations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    paper = relationship("Paper", back_populates="experiments")
    results = relationship("ReportedResult", back_populates="experiment", cascade="all, delete-orphan")


class ReportedResult(Base):
    __tablename__ = "reported_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_quote_id = Column(String(36), ForeignKey("evidence_quotes.id", ondelete="SET NULL"), nullable=True)
    
    metric_raw_name = Column(String(100), nullable=False)  # e.g., "Macro F1", "Accuracy", "top-1 err"
    metric_normalized_name = Column(String(100), nullable=False, index=True)  # "macro_f1", "accuracy", "error_rate"
    
    raw_value_str = Column(String(50), nullable=False)  # "84.2%" or "0.842"
    normalized_numeric_value = Column(Float, nullable=False)  # 84.2
    unit = Column(String(20), default="percent", nullable=False)
    direction = Column(String(20), default="higher_is_better", nullable=False)  # higher_is_better, lower_is_better
    
    evaluation_split = Column(String(50), default="test", nullable=False)
    uncertainty_raw = Column(String(50), nullable=True)  # "± 0.4"
    uncertainty_numeric = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    experiment = relationship("Experiment", back_populates="results")
    evidence_quote = relationship("EvidenceQuote", back_populates="reported_results")


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    experiment_a_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    experiment_b_id = Column(String(36), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    
    comparability_status = Column(String(50), nullable=False)  # comparable, partially_comparable, not_comparable
    comparability_rationale = Column(Text, nullable=False)
    attribute_differences = Column(JSON, default=list)  # list of difference dictionaries
    
    analysis_version = Column(String(20), default="1.0.0", nullable=False)
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    project = relationship("Project", back_populates="comparisons")
    experiment_a = relationship("Experiment", foreign_keys=[experiment_a_id])
    experiment_b = relationship("Experiment", foreign_keys=[experiment_b_id])
    conflicts = relationship("ConflictRecord", back_populates="comparison", cascade="all, delete-orphan")
    root_causes = relationship("RootCauseCandidate", back_populates="comparison", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="comparison", cascade="all, delete-orphan")


class ConflictRecord(Base):
    __tablename__ = "conflict_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    comparison_id = Column(String(36), ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False, index=True)
    
    metric_name = Column(String(100), nullable=False)
    val_a = Column(Float, nullable=False)
    val_b = Column(Float, nullable=False)
    abs_diff = Column(Float, nullable=False)
    pct_points_diff = Column(Float, nullable=True)
    relative_pct_diff = Column(Float, nullable=True)
    
    direction_conflict = Column(Boolean, default=False, nullable=False)
    classification = Column(String(50), nullable=False)  # severe_conflict, moderate_conflict, within_variance, inconclusive
    rationale = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    comparison = relationship("Comparison", back_populates="conflicts")


class RootCauseCandidate(Base):
    __tablename__ = "root_cause_candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    comparison_id = Column(String(36), ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False, index=True)
    
    rank_order = Column(Integer, nullable=False)
    factor_category = Column(String(100), nullable=False)  # dataset_drift, preprocessing, hyperparameters, protocol, metric_semantics
    explanation = Column(Text, nullable=False)
    plausibility_score = Column(Float, nullable=False)  # calibrated score between 0.0 and 1.0
    score_breakdown = Column(JSON, default=dict)
    
    supporting_evidence_ids = Column(JSON, default=list)  # list of evidence quote IDs
    contradictory_evidence_ids = Column(JSON, default=list)
    missing_information = Column(JSON, default=list)
    
    is_reviewed = Column(Boolean, default=False, nullable=False)
    review_status = Column(String(50), default="unreviewed", nullable=False)  # unreviewed, accepted, rejected, modified
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    comparison = relationship("Comparison", back_populates="root_causes")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    job_type = Column(String(50), nullable=False)  # paper_ingestion, comparison_analysis, report_generation
    resource_id = Column(String(36), nullable=False, index=True)
    
    status = Column(String(50), default="queued", nullable=False, index=True)  # queued, running, completed, failed
    progress_pct = Column(Integer, default=0, nullable=False)
    current_step = Column(String(255), default="Initialized", nullable=False)
    error_details = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    
    event_type = Column(String(50), nullable=False)  # upload, delete, analysis_run, evidence_correction, export, permission_change
    target_resource = Column(String(255), nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="audit_events")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    comparison_id = Column(String(36), ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    structured_content = Column(JSON, nullable=False, default=dict)
    report_version = Column(String(20), default="1.0.0", nullable=False)
    generated_at = Column(DateTime, default=func.now(), nullable=False)

    comparison = relationship("Comparison", back_populates="reports")
