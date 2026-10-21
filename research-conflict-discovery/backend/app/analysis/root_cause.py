from typing import List, Dict, Any
from app.db.models import Experiment, ConflictRecord, EvidenceQuote


class RootCauseRankingEngine:
    """Ranks plausible root causes for conflicting empirical findings using transparent heuristics."""

    @staticmethod
    def rank_candidates(
        exp_a: Experiment,
        exp_b: Experiment,
        conflicts: List[Dict[str, Any]],
        evidence_quotes_a: List[EvidenceQuote],
        evidence_quotes_b: List[EvidenceQuote],
    ) -> List[Dict[str, Any]]:
        candidates: List[Dict[str, Any]] = []

        quote_ids_a = [q.id for q in evidence_quotes_a]
        quote_ids_b = [q.id for q in evidence_quotes_b]

        # Candidate 1: Dataset Partitioning & Length Filtering Drift
        if exp_a.preprocessing != exp_b.preprocessing or exp_a.dataset_distribution != exp_b.dataset_distribution:
            candidates.append({
                "factor_category": "dataset_drift",
                "title": "Candidate Explanation: Evaluation Filtering & Dataset Drift",
                "explanation": (
                    f"Candidate Explanation: Dataset evaluation partition discrepancy. Study A evaluated on '{exp_a.dataset_distribution or exp_a.preprocessing}' "
                    f"whereas Study B evaluated on '{exp_b.dataset_distribution or exp_b.preprocessing}'. "
                    f"Filtering degenerate or short examples directly shifts test distribution difficulty. "
                    f"Controlled ablation experiments are required before asserting empirical causation."
                ),
                "plausibility_score": 0.94,
                "score_breakdown": {
                    "empirical_sensitivity_prior": 0.45,
                    "methodological_divergence_weight": 0.35,
                    "citation_evidence_grounding": 0.14,
                },
                "supporting_evidence_ids": quote_ids_a[:2] + quote_ids_b[:2],
                "contradictory_evidence_ids": [],
                "missing_information": ["Exact token cutoff distribution script", "Per-class support count"],
                "review_status": "unreviewed",
                "causation_proven": False,
                "epistemic_level": "candidate_explanation",
            })

        # Candidate 2: Evaluation Metric Formulation Semantics
        metric_conflict = any(c.get("classification") == "inconclusive" or "f1" in c.get("metric_name", "") for c in conflicts)
        if metric_conflict:
            candidates.append({
                "factor_category": "metric_semantics",
                "title": "Candidate Explanation: Metric Formulation Semantics",
                "explanation": (
                    "Candidate Explanation: Evaluation metric definition divergence. Discrepancy between macro-averaged partial string overlap "
                    "versus strict micro-averaged exact string span intersections penalizes boundary variations differently. "
                    "This is a plausible candidate factor rather than a proven causal driver."
                ),
                "plausibility_score": 0.88,
                "score_breakdown": {
                    "empirical_sensitivity_prior": 0.40,
                    "methodological_divergence_weight": 0.30,
                    "citation_evidence_grounding": 0.18,
                },
                "supporting_evidence_ids": quote_ids_a[:1] + quote_ids_b[:1],
                "contradictory_evidence_ids": [],
                "missing_information": ["Boundary overlap threshold epsilon"],
                "review_status": "unreviewed",
                "causation_proven": False,
                "epistemic_level": "candidate_explanation",
            })

        # Candidate 3: Hyperparameter and Training Budget Divergence
        hp_a = exp_a.hyperparameters or {}
        hp_b = exp_b.hyperparameters or {}
        if hp_a != hp_b:
            lr_a = hp_a.get("learning_rate", "unreported")
            lr_b = hp_b.get("learning_rate", "unreported")
            epochs_a = hp_a.get("epochs", "unreported")
            epochs_b = hp_b.get("epochs", "unreported")

            candidates.append({
                "factor_category": "hyperparameters",
                "title": "Candidate Explanation: Hyperparameter & Schedule Divergence",
                "explanation": (
                    f"Candidate Explanation: Training schedule variations detected (LR: {lr_a} vs {lr_b}, "
                    f"Epochs: {epochs_a} vs {epochs_b}). Learning rate decay and batch sizes influence convergence. "
                    f"Targeted learning rate sweeps are needed to verify empirical effect."
                ),
                "plausibility_score": 0.76,
                "score_breakdown": {
                    "empirical_sensitivity_prior": 0.35,
                    "methodological_divergence_weight": 0.25,
                    "citation_evidence_grounding": 0.16,
                },
                "supporting_evidence_ids": quote_ids_a[:1],
                "contradictory_evidence_ids": [],
                "missing_information": ["Warmup step count", "Random seeds"],
                "review_status": "unreviewed",
                "causation_proven": False,
                "epistemic_level": "candidate_explanation",
            })

        # Candidate 4: Stochastic Initialization & Variance
        if any(c.get("classification") == "within_variance" for c in conflicts) or not candidates:
            candidates.append({
                "factor_category": "stochastic_variance",
                "title": "Candidate Explanation: Stochastic Initialization Variance",
                "explanation": (
                    "Candidate Explanation: Stochastic initialization variance. Differences observed may fall within normal random seed and "
                    "hardware float non-determinism bounds for neural model evaluation."
                ),
                "plausibility_score": 0.52,
                "score_breakdown": {
                    "empirical_sensitivity_prior": 0.20,
                    "methodological_divergence_weight": 0.20,
                    "citation_evidence_grounding": 0.12,
                },
                "supporting_evidence_ids": [],
                "contradictory_evidence_ids": [],
                "missing_information": ["Number of random seed repetitions"],
                "review_status": "unreviewed",
                "causation_proven": False,
                "epistemic_level": "candidate_explanation",
            })

        # Sort candidates descending by plausibility score
        candidates.sort(key=lambda x: x["plausibility_score"], reverse=True)

        # Assign rank order (1-indexed)
        for idx, cand in enumerate(candidates):
            cand["rank_order"] = idx + 1
            cand["causation_proven"] = False
            cand["epistemic_caveat"] = (
                "Observational analysis identifies candidate explanatory factors based on methodological divergence; "
                "empirical causation is not proven without controlled benchmark ablations."
            )

        return candidates
