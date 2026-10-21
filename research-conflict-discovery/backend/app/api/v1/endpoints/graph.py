from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Comparison, User
from app.core.security import get_current_user
from app.core.permissions import check_project_access
from app.analysis.dependency_graph import DependencyGraphGenerator
from app.schemas.comparison import DependencyGraphResponse

router = APIRouter()


@router.get("/{comparison_id}", response_model=DependencyGraphResponse)
@router.get("/comparisons/{comparison_id}/graph", response_model=DependencyGraphResponse)
def get_experiment_graph(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve React Flow-compatible dependency graph showing lineage and divergence paths."""
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
