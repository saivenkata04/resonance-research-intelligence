from typing import Dict, Any, List
from app.db.models import Experiment


class ComparabilityEngine:
    """
    Evaluates whether two experiments are scientifically comparable, partially comparable, or not comparable.
    Flags differing evaluation protocols without making unvalidated causal claims.
    """

    @staticmethod
    def assess_comparability(exp_a: Experiment, exp_b: Experiment) -> Dict[str, Any]:
        matching: List[Dict[str, str]] = []
        differing: List[Dict[str, str]] = []
        missing: List[str] = []
        protocol_flags: List[Dict[str, Any]] = []

        # 1. Task Check
        if exp_a.task and exp_b.task:
            if exp_a.task.lower() == exp_b.task.lower():
                matching.append({"attribute": "task", "value": exp_a.task})
            else:
                differing.append({"attribute": "task", "val_a": exp_a.task, "val_b": exp_b.task})
        else:
            missing.append("task")

        # 2. Dataset Check
        if exp_a.dataset_normalized and exp_b.dataset_normalized:
            if exp_a.dataset_normalized == exp_b.dataset_normalized:
                matching.append({"attribute": "dataset", "value": exp_a.dataset_normalized})
            else:
                differing.append({
                    "attribute": "dataset",
                    "val_a": exp_a.dataset_name or exp_a.dataset_normalized,
                    "val_b": exp_b.dataset_name or exp_b.dataset_normalized,
                })
        else:
            missing.append("dataset")

        # 3. Model Architecture Check
        if exp_a.model_normalized and exp_b.model_normalized:
            if exp_a.model_normalized == exp_b.model_normalized:
                matching.append({"attribute": "model_architecture", "value": exp_a.model_architecture})
            else:
                differing.append({
                    "attribute": "model_architecture",
                    "val_a": exp_a.model_architecture,
                    "val_b": exp_b.model_architecture,
                })

        # 4. Preprocessing & Data Filtering Protocol Check
        prep_a = exp_a.preprocessing or "Standard"
        prep_b = exp_b.preprocessing or "Standard"
        if prep_a != prep_b:
            differing.append({
                "attribute": "preprocessing",
                "val_a": prep_a,
                "val_b": prep_b,
            })
            protocol_flags.append({
                "protocol_type": "data_filtering_protocol",
                "severity": "high",
                "description": f"Different data filtering protocols detected: Study A used '{prep_a}' whereas Study B used '{prep_b}'.",
                "val_a": prep_a,
                "val_b": prep_b,
                "epistemic_status": "candidate_explanation_only",
            })

        # 5. Dataset Distribution Protocol Check
        dist_a = exp_a.dataset_distribution or "Standard"
        dist_b = exp_b.dataset_distribution or "Standard"
        if dist_a != dist_b:
            differing.append({
                "attribute": "dataset_distribution",
                "val_a": dist_a,
                "val_b": dist_b,
            })
            protocol_flags.append({
                "protocol_type": "evaluation_distribution_protocol",
                "severity": "high",
                "description": f"Evaluation distribution drift: Study A evaluated on '{dist_a}' while Study B evaluated on '{dist_b}'.",
                "val_a": dist_a,
                "val_b": dist_b,
                "epistemic_status": "candidate_explanation_only",
            })

        # 6. Evaluation Split Protocol Check
        split_a = exp_a.test_split or "test"
        split_b = exp_b.test_split or "test"
        if split_a == split_b:
            matching.append({"attribute": "evaluation_split", "value": split_a})
        else:
            differing.append({"attribute": "evaluation_split", "val_a": split_a, "val_b": split_b})

        # 7. Hyperparameter Schedule Protocol Check
        hp_a = exp_a.hyperparameters or {}
        hp_b = exp_b.hyperparameters or {}
        if hp_a != hp_b:
            differing.append({
                "attribute": "hyperparameters",
                "val_a": str(hp_a),
                "val_b": str(hp_b),
            })
            protocol_flags.append({
                "protocol_type": "optimization_hyperparameters",
                "severity": "medium",
                "description": f"Optimization schedule variation: Study A hyperparameters={hp_a} vs Study B hyperparameters={hp_b}.",
                "val_a": str(hp_a),
                "val_b": str(hp_b),
                "epistemic_status": "candidate_explanation_only",
            })

        # Determine Comparability Status
        task_differs = any(d["attribute"] == "task" for d in differing)
        dataset_differs = any(d["attribute"] == "dataset" for d in differing)
        has_protocol_flags = len(protocol_flags) > 0

        if task_differs and dataset_differs:
            status = "not_comparable"
            rationale = "Experiments evaluate entirely disparate research tasks on different benchmark datasets."
        elif dataset_differs:
            status = "partially_comparable"
            rationale = "Experiments target related problem domains but evaluate on different datasets or distribution partitions."
        elif has_protocol_flags:
            status = "partially_comparable"
            rationale = (
                "Experiments share foundational neural architecture and base dataset, but differ in evaluation filtering protocols "
                "or hyperparameter schedules. These protocol differences constitute candidate explanations for observed discrepancies, "
                "though formal causation cannot be asserted without targeted re-execution or ablation experiments."
            )
        else:
            status = "comparable"
            rationale = "Experiments evaluate identical tasks, datasets, and architecture under closely aligned protocols."

        return {
            "status": status,
            "rationale": rationale,
            "matching_attributes": matching,
            "differing_attributes": differing,
            "protocol_flags": protocol_flags,
            "missing_information": missing,
            "causation_proven": False,
        }
