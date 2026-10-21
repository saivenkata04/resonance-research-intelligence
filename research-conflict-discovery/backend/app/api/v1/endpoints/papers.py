import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Paper, User
from app.core.security import get_current_user
from app.core.permissions import (
    check_project_access,
    get_user_accessible_project_ids,
    resolve_user_project_id,
)
from app.services.paper_service import PaperService
from app.schemas.paper import PaperResponse, PaperDetailResponse
from app.audit.service import AuditService

router = APIRouter()


@router.post("/upload", response_model=PaperResponse)
def upload_paper(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Securely upload and parse a research PDF manuscript for the authenticated user's workspace."""
    target_project_id = resolve_user_project_id(current_user, project_id, db)
    return PaperService.process_paper_upload(
        db=db,
        file=file,
        project_id=target_project_id,
        user=current_user,
    )


@router.get("", response_model=List[PaperResponse])
def list_papers(
    project_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all ingested papers accessible to the authenticated user."""
    if project_id:
        check_project_access(project_id, current_user, db)
        query = db.query(Paper).filter(Paper.project_id == project_id)
    else:
        accessible_ids = get_user_accessible_project_ids(current_user, db)
        query = db.query(Paper).filter(Paper.project_id.in_(accessible_ids))
    return query.order_by(Paper.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{paper_id}", response_model=PaperDetailResponse)
def get_paper(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full details of a paper including parsed sections and evidence quotes."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    check_project_access(paper.project_id, current_user, db)
    return paper


@router.get("/{paper_id}/status")
def get_paper_status(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get extraction status and errors for a paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    check_project_access(paper.project_id, current_user, db)
    return {
        "id": paper.id,
        "status": paper.status,
        "ocr_required": paper.ocr_required,
        "error_message": paper.error_message,
        "page_count": paper.page_count,
        "experiment_count": len(paper.experiments),
    }


@router.post("/{paper_id}/retry", response_model=PaperResponse)
def retry_paper_processing(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retry extraction on an existing paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    check_project_access(paper.project_id, current_user, db)
    return PaperService.reprocess_paper(db=db, paper=paper)


@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete paper and its storage file with audit logging."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    check_project_access(paper.project_id, current_user, db, required_role="owner")

    # Remove file from disk
    if paper.file_path and os.path.exists(paper.file_path):
        try:
            os.remove(paper.file_path)
        except Exception:
            pass

    AuditService.log_event(
        db=db,
        event_type="delete",
        target_resource=f"paper:{paper.id}",
        user_id=current_user.id,
        project_id=paper.project_id,
        details={"title": paper.title},
    )

    db.delete(paper)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
