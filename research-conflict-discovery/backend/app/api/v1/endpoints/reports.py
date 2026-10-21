from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
import io
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Comparison, Report, User
from app.core.security import get_current_user
from app.core.permissions import check_project_access, get_user_accessible_project_ids
from app.reporting.report_generator import ReportGenerator
from app.schemas.report import ReportResponse, ReportCreate
from app.audit.service import AuditService

router = APIRouter()


@router.get("", response_model=List[ReportResponse])
def list_reports(
    project_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all synthesized reports accessible to user."""
    query = db.query(Report).join(Comparison, Report.comparison_id == Comparison.id)
    if project_id:
        check_project_access(project_id, current_user, db)
        query = query.filter(Comparison.project_id == project_id)
    else:
        accessible_ids = get_user_accessible_project_ids(current_user, db)
        query = query.filter(Comparison.project_id.in_(accessible_ids))
    return query.order_by(Report.generated_at.desc()).offset(skip).limit(limit).all()


@router.get("/by-comparison/{comparison_id}", response_model=ReportResponse)
def get_or_create_report_for_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the latest report for a comparison, or generate one if not yet created."""
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)

    report = db.query(Report).filter(Report.comparison_id == comparison_id).order_by(Report.generated_at.desc()).first()
    if report:
        return report

    # Generate dynamically if first visit
    structured_data = ReportGenerator.build_structured_report(comp)
    title = f"Synthesis Report: {comp.experiment_a.name} vs {comp.experiment_b.name}"
    summary = (
        f"Comparative evaluation revealed {len(comp.conflicts)} performance conflicts. "
        f"Primary divergence driver is attributed to {comp.root_causes[0].factor_category if comp.root_causes else 'unspecified methodology'}."
    )
    report = Report(
        comparison_id=comp.id,
        created_by_id=current_user.id,
        title=title,
        summary=summary,
        structured_content=structured_data,
        report_version="1.0.0",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.post("/comparisons/{comparison_id}/reports", response_model=ReportResponse)
def generate_comparison_report(
    comparison_id: str,
    payload: Optional[ReportCreate] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synthesize evidence-backed investigation report from comparison results."""
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)

    structured_data = ReportGenerator.build_structured_report(comp)
    title = (payload.title if payload and payload.title else None) or f"Synthesis Report: {comp.experiment_a.name} vs {comp.experiment_b.name}"
    summary = (
        f"Comparative evaluation revealed {len(comp.conflicts)} performance conflicts. "
        f"Primary divergence driver is attributed to {comp.root_causes[0].factor_category if comp.root_causes else 'unspecified methodology'}."
    )

    report = Report(
        comparison_id=comp.id,
        created_by_id=current_user.id,
        title=title,
        summary=summary,
        structured_content=structured_data,
        report_version="1.0.0",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    AuditService.log_event(
        db=db,
        event_type="export",
        target_resource=f"report:{report.id}",
        user_id=current_user.id,
        project_id=comp.project_id,
        details={"report_id": report.id, "title": report.title},
    )

    return report


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve structured JSON report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    check_project_access(report.comparison.project_id, current_user, db)
    return report


@router.get("/{report_id}/download")
def download_report_pdf(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export and stream downloadable evidence-backed PDF report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    check_project_access(report.comparison.project_id, current_user, db)

    pdf_bytes = ReportGenerator.export_pdf(report)
    filename = f"resonance-report-{report.id[:8]}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
