from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Paper, Experiment, User
from app.core.security import get_current_user
from app.core.permissions import check_project_access
from app.schemas.experiment import ExperimentResponse, ExperimentUpdate
from app.audit.service import AuditService

router = APIRouter()


@router.get("/papers/{paper_id}/experiments", response_model=List[ExperimentResponse])
def get_paper_experiments(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    check_project_access(paper.project_id, current_user, db)
    return paper.experiments


@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found.")
    check_project_access(exp.paper.project_id, current_user, db)
    return exp


@router.patch("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: str,
    payload: ExperimentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Allow authorized researchers to correct or refine extracted attributes
    while preserving linked evidence audit trails.
    """
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found.")
    check_project_access(exp.paper.project_id, current_user, db)

    update_dict = payload.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(exp, k, v)

    AuditService.log_event(
        db=db,
        event_type="evidence_correction",
        target_resource=f"experiment:{exp.id}",
        user_id=current_user.id,
        project_id=exp.paper.project_id,
        details={"updated_fields": list(update_dict.keys())},
    )

    db.commit()
    db.refresh(exp)
    return exp
