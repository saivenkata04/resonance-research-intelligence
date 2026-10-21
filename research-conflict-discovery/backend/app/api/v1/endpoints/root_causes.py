from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Comparison, RootCauseCandidate, EvidenceQuote, User
from app.core.security import get_current_user
from app.core.permissions import check_project_access
from app.analysis.root_cause import RootCauseRankingEngine
from app.schemas.comparison import RootCauseCandidateResponse

router = APIRouter()


@router.get("/{comparison_id}/root-causes", response_model=List[RootCauseCandidateResponse])
def get_root_causes(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)
    return comp.root_causes


@router.post("/{comparison_id}/analyze", response_model=List[RootCauseCandidateResponse])
def reanalyze_root_causes(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-execute root-cause ranking engine with updated parameters."""
    comp = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found.")
    check_project_access(comp.project_id, current_user, db)

    # Clean existing candidates
    db.query(RootCauseCandidate).filter(RootCauseCandidate.comparison_id == comp.id).delete()
    db.commit()

    quotes_a = db.query(EvidenceQuote).filter(EvidenceQuote.paper_id == comp.experiment_a.paper_id).all()
    quotes_b = db.query(EvidenceQuote).filter(EvidenceQuote.paper_id == comp.experiment_b.paper_id).all()

    conflicts_dict = [
        {"classification": c.classification, "metric_name": c.metric_name}
        for c in comp.conflicts
    ]

    new_candidates = RootCauseRankingEngine.rank_candidates(
        exp_a=comp.experiment_a,
        exp_b=comp.experiment_b,
        conflicts=conflicts_dict,
        evidence_quotes_a=quotes_a,
        evidence_quotes_b=quotes_b,
    )

    persisted = []
    for rc in new_candidates:
        rc_rec = RootCauseCandidate(
            comparison_id=comp.id,
            rank_order=rc["rank_order"],
            factor_category=rc["factor_category"],
            explanation=rc["explanation"],
            plausibility_score=rc["plausibility_score"],
            score_breakdown=rc["score_breakdown"],
            supporting_evidence_ids=rc["supporting_evidence_ids"],
            contradictory_evidence_ids=rc["contradictory_evidence_ids"],
            missing_information=rc["missing_information"],
            review_status=rc["review_status"],
        )
        db.add(rc_rec)
        persisted.append(rc_rec)

    db.commit()
    return persisted
