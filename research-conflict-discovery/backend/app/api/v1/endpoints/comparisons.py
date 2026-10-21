from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Comparison, User, Paper, Experiment
from app.core.security import get_current_user
from app.core.permissions import (
    check_project_access,
    get_user_accessible_project_ids,
    resolve_user_project_id,
)
from app.services.comparison_service import ComparisonService
from app.analysis.dependency_graph import DependencyGraphGenerator
from app.schemas.comparison import ComparisonCreate, ComparisonResponse, DependencyGraphResponse

router = APIRouter()


@router.post("", response_model=ComparisonResponse)
def create_comparison(
    payload: ComparisonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run cross-paper comparison between two scientific experiments."""
    target_project_id = resolve_user_project_id(current_user, payload.project_id, db)

    exp_a_id = payload.experiment_a_id
    exp_b_id = payload.experiment_b_id

    if not exp_a_id and payload.paper_a_id:
        exp_a = db.query(Experiment).filter(Experiment.paper_id == payload.paper_a_id).first()
        if exp_a:
            exp_a_id = exp_a.id
    if not exp_b_id and payload.paper_b_id:
        exp_b = db.query(Experiment).filter(Experiment.paper_id == payload.paper_b_id).first()
        if exp_b:
            exp_b_id = exp_b.id

    if not exp_a_id or not exp_b_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid experiments or papers with extracted experiments must be specified for comparison."
        )

    # Verify that the experiments belong to papers the user is authorized to access
    exp_a = db.query(Experiment).filter(Experiment.id == exp_a_id).first()
    exp_b = db.query(Experiment).filter(Experiment.id == exp_b_id).first()
    if not exp_a or not exp_b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both experiments not found.")

    check_project_access(exp_a.paper.project_id, current_user, db)
    check_project_access(exp_b.paper.project_id, current_user, db)

    # Check if comparison already exists
    existing = db.query(Comparison).filter(
        ((Comparison.experiment_a_id == exp_a_id) & (Comparison.experiment_b_id == exp_b_id)) |
        ((Comparison.experiment_a_id == exp_b_id) & (Comparison.experiment_b_id == exp_a_id))
    ).first()
    if existing:
        return existing

    return ComparisonService.create_comparison(
        db=db,
        project_id=target_project_id,
        experiment_a_id=exp_a_id,
        experiment_b_id=exp_b_id,
        user=current_user,
    )


@router.get("", response_model=List[ComparisonResponse])
def list_comparisons(
    project_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List comparisons for an authorized project or all projects accessible to user."""
    if project_id:
        check_project_access(project_id, current_user, db)
        query = db.query(Comparison).filter(Comparison.project_id == project_id)
    else:
        accessible_ids = get_user_accessible_project_ids(current_user, db)
        query = db.query(Comparison).filter(Comparison.project_id.in_(accessible_ids))
    return query.order_by(Comparison.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{comparison_id}", response_model=ComparisonResponse)
def get_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full comparison record with conflicts and root causes."""
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)
    return comp


@router.get("/{comparison_id}/differences")
def get_comparison_differences(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get isolated attribute differences between the two experiments."""
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)
    return {
        "comparison_id": comp.id,
        "comparability_status": comp.comparability_status,
        "rationale": comp.comparability_rationale,
        "differences": comp.attribute_differences,
    }


@router.get("/{comparison_id}/graph", response_model=DependencyGraphResponse)
def get_comparison_graph(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get React Flow compatible dependency graph directly from comparisons route."""
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)

    graph_data = DependencyGraphGenerator.generate_graph(
        comparison=comp,
        exp_a=comp.experiment_a,
        exp_b=comp.experiment_b,
        conflicts=comp.conflicts,
        root_causes=comp.root_causes,
    )
    graph_data["comparison_id"] = comp.id
    graph_data["causation_proven"] = False
    return graph_data
