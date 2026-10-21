from typing import Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.models import Experiment, Comparison, ConflictRecord, RootCauseCandidate, EvidenceQuote, User
from app.analysis.comparability import ComparabilityEngine
from app.analysis.conflict_detector import ConflictDetector
from app.analysis.root_cause import RootCauseRankingEngine
from app.audit.service import AuditService


class ComparisonService:
    @staticmethod
    def create_comparison(
        db: Session,
        project_id: str,
        experiment_a_id: str,
        experiment_b_id: str,
        user: User,
    ) -> Comparison:
        exp_a = db.query(Experiment).filter(Experiment.id == experiment_a_id).first()
        exp_b = db.query(Experiment).filter(Experiment.id == experiment_b_id).first()

        if not exp_a or not exp_b:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or both experiments to compare were not found."
            )

        # 1. Assess Comparability
        comp_assessment = ComparabilityEngine.assess_comparability(exp_a, exp_b)

        # 2. Persist Comparison
        comparison = Comparison(
            project_id=project_id,
            experiment_a_id=exp_a.id,
            experiment_b_id=exp_b.id,
            comparability_status=comp_assessment["status"],
            comparability_rationale=comp_assessment["rationale"],
            attribute_differences=comp_assessment["differing_attributes"],
            analysis_version="1.0.0",
            created_by_id=user.id,
        )
        db.add(comparison)
        db.commit()
        db.refresh(comparison)

        # 3. Detect Conflicts Across Reported Results
        conflicts_data = ConflictDetector.detect_conflicts(exp_a.results, exp_b.results)
        db_conflicts: List[ConflictRecord] = []
        for c in conflicts_data:
            conf_rec = ConflictRecord(
                comparison_id=comparison.id,
                metric_name=c["metric_name"],
                val_a=c["val_a"],
                val_b=c["val_b"],
                abs_diff=c["abs_diff"],
                pct_points_diff=c["pct_points_diff"],
                relative_pct_diff=c["relative_pct_diff"],
                direction_conflict=c["direction_conflict"],
                classification=c["classification"],
                rationale=c["rationale"],
            )
            db.add(conf_rec)
            db_conflicts.append(conf_rec)
        db.commit()

        # 4. Rank Root-Cause Candidates
        quotes_a = db.query(EvidenceQuote).filter(EvidenceQuote.paper_id == exp_a.paper_id).all()
        quotes_b = db.query(EvidenceQuote).filter(EvidenceQuote.paper_id == exp_b.paper_id).all()

        root_causes_data = RootCauseRankingEngine.rank_candidates(
            exp_a=exp_a,
            exp_b=exp_b,
            conflicts=conflicts_data,
            evidence_quotes_a=quotes_a,
            evidence_quotes_b=quotes_b,
        )

        for rc in root_causes_data:
            rc_rec = RootCauseCandidate(
                comparison_id=comparison.id,
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
        db.commit()

        # 5. Audit Event
        AuditService.log_event(
            db=db,
            event_type="analysis_run",
            target_resource=f"comparison:{comparison.id}",
            user_id=user.id,
            project_id=project_id,
            details={"exp_a": exp_a.id, "exp_b": exp_b.id, "conflicts_found": len(db_conflicts)},
        )

        db.refresh(comparison)
        return comparison
